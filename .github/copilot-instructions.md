# TSiJUKEBOX - Copilot Instructions

This document provides guidance for GitHub Copilot when working with the TSiJUKEBOX codebase.

## 🎵 Project Overview

TSiJUKEBOX is an enterprise-grade digital jukebox system built with React, TypeScript, and Vite. It features:
- Multi-source music playback (Spotify, YouTube Music, local files)
- Professional karaoke functionality with lyrics synchronization
- 6 visual themes with WCAG 2.1 AA accessibility compliance
- Full kiosk mode for touch-screen displays
- Advanced audio visualization and 10-band equalizer

**Live Demo:** https://tsijukebox.vercel.app

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18.3 + TypeScript 5.5.3 + Vite 5.4.1
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** Zustand for global state
- **UI Components:** Radix UI primitives with custom theming
- **Testing:** Vitest (unit) + Playwright (e2e)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Docker + Nginx with SSL/mDNS support

### Key Technologies
- **React Router DOM** for routing
- **Framer Motion** for animations
- **React Hook Form** + Zod for form validation
- **TanStack Query** for server state management
- **Recharts** for data visualization
- **@dnd-kit** for drag-and-drop functionality

## 📁 Project Structure

```
src/
├── components/          # 72+ React components organized by feature
│   ├── ui/             # shadcn/ui base components
│   ├── player/         # Music player components
│   ├── karaoke/        # Karaoke system components
│   ├── spotify/        # Spotify integration components
│   ├── youtube/        # YouTube Music components
│   ├── settings/       # Settings UI components
│   ├── kiosk/          # Kiosk mode components
│   └── ...             # Other feature-specific components
├── pages/              # 45+ route pages
├── hooks/              # Custom React hooks (organized by feature)
│   ├── auth/
│   ├── player/
│   ├── spotify/
│   ├── common/
│   └── ...
├── stores/             # Zustand stores
│   ├── playerStore.ts  # Audio player state
│   ├── queueStore.ts   # Queue management
│   └── spotifyStore.ts # Spotify integration state
├── lib/                # Utilities and helpers
├── types/              # TypeScript type definitions
├── themes/             # Visual theme configurations (6 themes)
├── routes/             # Route definitions
└── integrations/       # External service integrations
```

## 🎨 Code Style & Conventions

### TypeScript Guidelines

**Use interfaces for object types:**
```typescript
interface Track {
  id: string;
  name: string;
  artist: string;
  duration: number;
  source: 'spotify' | 'local' | 'youtube';
}
```

**Use types for unions, primitives, and function signatures:**
```typescript
type PlaybackState = 'playing' | 'paused' | 'stopped' | 'loading' | 'buffering';
type OnTrackChange = (track: Track) => void;
```

**Avoid `any` - use `unknown` with type guards instead:**
```typescript
// ❌ Bad
const process = (data: any) => { ... };

// ✅ Good
const process = (data: unknown) => {
  if (isTrack(data)) {
    return data.name;
  }
};
```

**Prefer const objects over enums:**
```typescript
const PlaybackStates = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
} as const;

type PlaybackState = typeof PlaybackStates[keyof typeof PlaybackStates];
```

### React Component Patterns

**Use functional components with TypeScript:**
```typescript
interface TrackCardProps {
  track: Track;
  onPlay: () => void;
  isPlaying?: boolean;
}

export function TrackCard({ track, onPlay, isPlaying = false }: TrackCardProps) {
  return (
    <div className="track-card">
      {/* Component content */}
    </div>
  );
}
```

**Custom hooks for reusable logic:**
- Prefix with `use` (e.g., `usePlayer`, `useSpotify`)
- Organize in `src/hooks/` by feature area
- Return objects with named properties, not arrays

**State management:**
- Use Zustand stores for global state (`src/stores/`)
- Use React Context for feature-specific state
- Use local `useState` for component-only state
- Use TanStack Query for server state

### Naming Conventions

- **Components:** PascalCase (e.g., `TrackCard.tsx`, `PlayerControls.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `usePlayer.ts`)
- **Stores:** camelCase with `Store` suffix (e.g., `playerStore.ts`)
- **Types/Interfaces:** PascalCase (e.g., `Track`, `PlayerState`)
- **Constants:** SCREAMING_SNAKE_CASE or const objects
- **Files:** Match the primary export name

### Styling

**Use Tailwind CSS classes:**
```typescript
<div className="flex items-center gap-4 p-6 bg-background border rounded-lg">
```

**Use CSS variables for theme values:**
```typescript
// Defined in src/index.css and src/themes/
// Access via Tailwind: bg-primary, text-accent, etc.
```

**shadcn/ui component customization:**
- Base components in `src/components/ui/`
- Use `cn()` utility for conditional classes
- Follow existing patterns for variants

### Accessibility (WCAG 2.1 AA)

**Always include:**
- ARIA labels: `aria-label`, `aria-labelledby`
- ARIA roles: `role="button"`, `role="region"`, etc.
- Keyboard navigation support (Tab, Enter, Escape)
- Proper semantic HTML
- Minimum 4.5:1 color contrast ratio
- Focus indicators

**Example:**
```typescript
<button
  onClick={onPlay}
  aria-label={`Play ${track.name} by ${track.artist}`}
  className="focus:ring-2 focus:ring-primary"
>
  <PlayIcon aria-hidden="true" />
</button>
```

## 🛠️ Development Commands

### Essential Commands

```bash
# Development server (port 8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Fix dependencies
npm run fix-deps
```

### Build & Test

- **Build target:** ES2020
- **Development port:** 8080
- **Path alias:** `@/` maps to `src/`
- **Test coverage threshold:** 70% (statements, branches, functions, lines)

## 🧪 Testing

### Unit Tests (Vitest)
- Located in `src/**/*.test.{ts,tsx}`
- Run with `npm run test`
- Use `jsdom` environment
- Setup file: `src/test/setup.ts`

### E2E Tests (Playwright)
- Located in `e2e/specs/*.spec.ts`
- Run with `npm run test:e2e`
- Config: `playwright.config.ts`

**Test patterns:**
- Test accessibility with axe-core
- Test keyboard navigation
- Test responsive behavior
- Mock external services (Spotify, YouTube)

## 🔐 Security & Best Practices

- **Never commit secrets:** Use `.env` files (see `.env.example`)
- **Validate user inputs:** Use Zod schemas with React Hook Form
- **Sanitize data:** Especially for lyrics and user-generated content
- **Use TypeScript strict mode:** Enabled in `tsconfig.json`
- **Handle errors gracefully:** Use try-catch and error boundaries
- **Optimize performance:** Code splitting, lazy loading, memoization

## 🗄️ Database & Backend Requirements

**⚠️ MANDATORY GUIDELINE - NON-NEGOTIABLE:**

- **SQLite ONLY in Default Installation:** The default installation MUST include ONLY SQLite - no other database engines
- **On-Demand Database Installation:** Other databases (PostgreSQL, MariaDB/MySQL, Firebird) are installed ONLY when user requests migration via configuration menu
- **Automatic Migration + Installation:** When user selects a different database in the configuration menu:
  1. Install the selected database engine automatically
  2. Migrate all tables from SQLite to the new database
  3. Update application configuration to use the new database
  4. Keep SQLite backup for rollback capability
- **Autonomous Installation:** Python/Docker installers MUST provision everything automatically without user intervention
- **Zero Configuration:** The installer should work out-of-the-box with sensible defaults (SQLite only)
- **Backend Refactoring:** When working on backend code, prioritize SQLite compatibility over cloud-only solutions
- **Local-First Architecture:** Design features to work offline with local SQLite before adding cloud sync

### Supported Database Systems

The TSiJUKEBOX supports multiple database backends with on-demand installation:

| Database | Use Case | Installation | Documentation |
|----------|----------|--------------|---------------|
| **SQLite** (Default) | Standalone installations, embedded mode | Pre-installed | `docs/database/SQLITE.md` |
| **PostgreSQL** | Enterprise deployments, high concurrency | On-demand via config menu | `docs/database/POSTGRESQL.md` |
| **MariaDB/MySQL** | Multi-user environments, existing infrastructure | On-demand via config menu | `docs/database/MARIADB_MYSQL.md` |
| **Firebird** | Low-footprint server, embedded mode | On-demand via config menu | `docs/database/FIREBIRD.md` |

**Database Comparison:** See `docs/database/COMPARISON.md` for detailed technical analysis.

### Migration System

**Migration Tools Location:** `docs/database/MIGRATIONS.md`

- **Schema Versioning:** SQL-based migrations with timestamps
- **Cross-Database Support:** Migrations work across all supported databases
- **On-Demand Installation:** Database engines installed automatically during migration
- **Automated Migration:** Migration triggered from Settings > Database > Change Database
- **Zero Downtime:** Logical replication support for live migrations
- **Automatic Rollback:** SQLite backup maintained for rollback if migration fails

**Migration Workflow:**

1. **Via Configuration Menu (Recommended):**
   - Navigate to: Settings > Database Configuration > Change Database
   - Select target database (PostgreSQL, MariaDB, MySQL, or Firebird)
   - System automatically:
     - Installs the selected database engine
     - Creates database schema
     - Migrates all tables and data from SQLite
     - Updates application configuration
     - Creates SQLite backup for rollback

2. **Via Command Line (Advanced):**
```bash
# Migrate from SQLite to PostgreSQL (installs PostgreSQL if needed)
python3 scripts/unified-installer.py --migrate-db --to postgresql

# Migrate from PostgreSQL back to SQLite
python3 scripts/unified-installer.py --migrate-db --to sqlite
```

### Backup & Maintenance

**Backup Configuration:** `docs/wiki/Config-Cloud-Backup.md`

#### Local Backups
- **SQLite:** Hot backup via SQLite backup API
- **PostgreSQL:** `pg_dump` / `pg_restore` utilities
- **MariaDB/MySQL:** `mysqldump` / `mysqlpump` utilities
- **Firebird:** `gbak` utility

#### Cloud Backups
- **Primary Provider:** Storj (S3-compatible, decentralized)
- **Supported Providers:**
  - **Storj:** Decentralized, S3-compatible, end-to-end encryption
  - **Google Drive:** OAuth 2.0 authentication, 15GB free tier
  - **OneDrive:** Microsoft account integration, 5GB free tier
  - **MEGA.nz:** Zero-knowledge encryption, 20GB free tier
  - **Dropbox:** OAuth 2.0 authentication, 2GB free tier
  - **S3-Compatible:** AWS S3, MinIO, Wasabi, DigitalOcean Spaces
- **Encryption:** End-to-end encryption for all providers
- **Retention Policy:** Configurable (7 daily, 4 weekly, 3 monthly)
- **Automated Scheduling:** Daily backups at 03:00

#### Maintenance Tools
```bash
# Database optimization
python3 scripts/unified-installer.py --optimize-db

# Integrity check
python3 scripts/unified-installer.py --check-db

# Repair corrupted database
python3 scripts/unified-installer.py --repair-db
```

**Implementation Requirements:**
```python
# scripts/unified-installer.py must:
# 1. Install ONLY SQLite by default (no other database engines)
# 2. Set up SQLite database with schema on first run
# 3. Detect database migration requests from config menu
# 4. On migration request:
#    a. Install target database engine (PostgreSQL/MariaDB/MySQL/Firebird)
#    b. Create database and schema on target
#    c. Migrate all tables and data from source to target
#    d. Create backup of source database before migration
#    e. Update app config to use new database
#    f. Verify data integrity after migration
# 5. Configure automatic backups (local + cloud)
# 6. Include maintenance tools (VACUUM, integrity check, reindex)
# 7. Support zero-configuration installation (SQLite only)
# 8. No interactive prompts unless explicitly requested
# 9. Rollback capability if migration fails
```

**Settings Menu Structure:**
```
Settings > Database Configuration
  ├── Current Database: SQLite (default)
  ├── Change Database
  │   ├── PostgreSQL (installs on selection + migrates)
  │   ├── MariaDB/MySQL (installs on selection + migrates)
  │   ├── Firebird (installs on selection + migrates)
  │   └── Back to SQLite (migrates back)
  ├── Backup Configuration
  │   ├── Local Backups
  │   └── Cloud Backups (Google Drive, OneDrive, MEGA, Dropbox, Storj)
  └── Maintenance
      ├── Optimize Database
      ├── Check Integrity
      └── Repair Database
```

## 🎨 Theming

The project includes 6 visual themes:
1. **Cosmic Player** (default) - Cyan/Magenta
2. **Karaoke Stage** - Purple/Magenta
3. **Stage Neon Metallic** - Cyan/Magenta metallic
4. **Dashboard Home** - Gold
5. **Spotify Integration** - Spotify Green
6. **Settings Dark** - Purple

**Theme files:** `src/themes/`
**CSS variables:** Defined in `src/index.css`

## 🔌 Key Integrations

### Spotify Web API
- Store: `src/stores/spotifyStore.ts`
- Components: `src/components/spotify/`
- Hooks: `src/hooks/spotify/`
- OAuth 2.0 authentication

### YouTube Music
- Components: `src/components/youtube/`
- Hooks: `src/hooks/youtube/`
- OAuth 2.0 authentication

### Database Backend
- **Primary (Default):** SQLite for local installations
- **Secondary (Optional):** Supabase/PostgreSQL for cloud deployments
- Database: SQLite (local) or PostgreSQL (cloud)
- Auth: Email/password + OAuth (when using Supabase)
- Storage: Audio files, album art (local filesystem or cloud)
- Config: `src/integrations/supabase/` (legacy cloud support)

## 📚 Additional Resources

- **Contributing Guide:** See `CONTRIBUTING.md` and `docs/CONTRIBUTING.md`
- **Coding Standards:** See `docs/CODING-STANDARDS.md`
- **Architecture:** See `docs/ARCHITECTURE.md`
- **API Reference:** See `docs/API-REFERENCE.md`
- **Accessibility:** See `docs/ACCESSIBILITY_REPORT_FINAL.md`
- **Setup Guide:** See `SETUP_AND_BUILD.md`

## 💡 Common Patterns

### Creating a New Component
1. Create file in appropriate `src/components/` subdirectory
2. Use TypeScript with proper props interface
3. Include accessibility attributes
4. Use Tailwind for styling
5. Export from index file if part of a module
6. Add tests if modifying core functionality

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/name`
2. Follow conventional commits: `feat: add feature description`
3. Update relevant documentation
4. Add tests for new functionality
5. Ensure accessibility compliance
6. Run linter and tests before committing

### Working with State
- **Global state (player, queue, etc.):** Use Zustand stores in `src/stores/`
- **Server state (API data):** Use TanStack Query
- **Form state:** Use React Hook Form with Zod validation
- **UI state (modals, toggles):** Use local `useState` or context

## 🌍 Internationalization
- i18n files: `src/i18n/`
- Default language: Portuguese (pt-BR)
- Secondary: English (en)

## 📝 Comments & Documentation

- **Use JSDoc for public APIs:** Functions, hooks, stores
- **Comment complex logic:** Algorithms, workarounds, edge cases
- **Don't over-comment:** Code should be self-documenting when possible
- **Keep comments up-to-date:** Remove outdated comments

## 🚀 Performance Optimization

- **Code splitting:** Use React.lazy() for route-level splitting
- **Memoization:** Use React.memo(), useMemo(), useCallback() appropriately
- **Virtual scrolling:** For long lists (using react-window)
- **Debounce/throttle:** For expensive operations (search, resize)
- **Optimize images:** Use appropriate formats and sizes
- **Lazy load components:** Non-critical components and routes

---

**License:** Public Domain (Unlicense)
**Maintainer:** B0.y_Z4kr14
**Repository:** https://github.com/B0yZ4kr14/tsijukebox
