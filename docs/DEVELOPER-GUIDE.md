# TSiJUKEBOX Developer Guide

Complete guide for developers contributing to TSiJUKEBOX.

---

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Project Architecture](#project-architecture)
3. [Code Style Guidelines](#code-style-guidelines)
4. [Component Development](#component-development)
5. [State Management](#state-management)
6. [Testing](#testing)
7. [Contributing](#contributing)

---

## Development Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** or **bun**
- **Git**
- **VS Code** (recommended)

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/tsijukebox.git
cd tsijukebox

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## Project Architecture

### Directory Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── player/          # Music player components
│   ├── settings/        # Settings panels
│   ├── spotify/         # Spotify integration
│   ├── ui/              # Base UI primitives (shadcn)
│   └── youtube/         # YouTube Music integration
├── contexts/            # React contexts
├── hooks/               # Custom hooks
│   ├── auth/           # Authentication hooks
│   ├── common/         # Shared utilities
│   ├── player/         # Player logic
│   ├── spotify/        # Spotify API hooks
│   ├── system/         # System monitoring
│   └── youtube/        # YouTube Music hooks
├── lib/                 # Utilities and helpers
│   ├── api/            # API clients
│   ├── auth/           # Auth utilities
│   ├── storage/        # Local storage
│   └── validations/    # Zod schemas
├── pages/              # Route components
├── i18n/               # Internationalization
└── types/              # TypeScript definitions
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **React + Vite** | Fast HMR, modern bundling |
| **TypeScript** | Type safety, better DX |
| **Tailwind CSS** | Utility-first, design system |
| **shadcn/ui** | Accessible, customizable components |
| **React Query** | Server state management |
| **Zustand/Context** | Client state management |
| **Supabase** | Backend-as-a-Service |

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Pages     │────▶│   Hooks      │────▶│   API/DB    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌──────────────┐
│ Components  │     │   Context    │
└─────────────┘     └──────────────┘
```

---

## Code Style Guidelines

### TypeScript

```typescript
// ✅ Good: Explicit types, descriptive names
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  albumArt?: string;
}

function playTrack(track: Track): Promise<void> {
  // Implementation
}

// ❌ Bad: Implicit any, unclear names
function play(t) {
  // Implementation
}
```

### React Components

```tsx
// ✅ Good: Functional component with proper types
interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disabled = false,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Previous track"
      >
        <SkipBack className="w-5 h-5" />
      </Button>
      {/* ... */}
    </div>
  );
}
```

### Hooks

```typescript
// ✅ Good: Custom hook with proper naming and return type
export function usePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  
  const play = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);
  
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  return {
    isPlaying,
    currentTrack,
    play,
    pause,
  };
}
```

### Styling

```tsx
// ✅ Good: Use design system tokens
<div className="bg-kiosk-surface text-kiosk-text border-kiosk-border">
  <h1 className="text-gold-neon">Title</h1>
</div>

// ❌ Bad: Hardcoded colors
<div className="bg-gray-800 text-white border-gray-600">
  <h1 className="text-yellow-400">Title</h1>
</div>
```

---

## Component Development

### Creating New Components

1. **Create component file**:
```bash
src/components/player/VolumeSlider.tsx
```

2. **Define types**:
```typescript
interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  muted?: boolean;
  onMuteToggle?: () => void;
}
```

3. **Implement component**:
```tsx
export function VolumeSlider({
  value,
  onChange,
  muted = false,
  onMuteToggle,
}: VolumeSliderProps) {
  // Implementation
}
```

4. **Add to barrel export** (if applicable):
```typescript
// src/components/player/index.ts
export * from './VolumeSlider';
```

### Component Best Practices

| Practice | Example |
|----------|---------|
| **Single Responsibility** | One component, one purpose |
| **Composition over Props** | Use children and slots |
| **Controlled by Default** | Parent manages state |
| **Accessible** | ARIA labels, keyboard nav |
| **Responsive** | Mobile-first approach |

---

## State Management

### When to Use What

| State Type | Solution | Example |
|------------|----------|---------|
| **Server State** | React Query | API data, user info |
| **Global UI** | React Context | Theme, user session |
| **Local UI** | useState | Form inputs, modals |
| **Complex Local** | useReducer | Multi-step forms |

### Context Pattern

```typescript
// contexts/PlayerContext.tsx
interface PlayerContextValue {
  currentTrack: Track | null;
  isPlaying: boolean;
  play: (track: Track) => void;
  pause: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // Implementation
  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
}
```

---

## Testing

### Unit Tests (Vitest)

```typescript
// hooks/player/__tests__/usePlayer.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePlayer } from '../usePlayer';

describe('usePlayer', () => {
  it('should start paused', () => {
    const { result } = renderHook(() => usePlayer());
    expect(result.current.isPlaying).toBe(false);
  });
  
  it('should play track', () => {
    const { result } = renderHook(() => usePlayer());
    const track = { id: '1', title: 'Test', artist: 'Artist', duration: 180 };
    
    act(() => {
      result.current.play(track);
    });
    
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTrack).toEqual(track);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/specs/player-controls.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Player Controls', () => {
  test('should toggle play/pause', async ({ page }) => {
    await page.goto('/');
    
    const playButton = page.getByRole('button', { name: /play/i });
    await playButton.click();
    
    await expect(playButton).toHaveAttribute('aria-label', /pause/i);
  });
});
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## Contributing

### Workflow

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/my-feature`
3. **Commit** changes: `git commit -m "Add my feature"`
4. **Push** branch: `git push origin feature/my-feature`
5. **Open** Pull Request

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add volume slider component
fix: resolve playback issue on mobile
docs: update API reference
style: format code with prettier
refactor: extract player logic to hook
test: add unit tests for usePlayer
chore: update dependencies
```

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console warnings/errors
- [ ] Accessibility checked

---

## Additional Resources

- [Hooks Architecture](HOOKS-ARCHITECTURE.md)
- [API Reference](API-REFERENCE.md)
- [Design System](DESIGN-SYSTEM.md)
- [Security Guide](SECURITY.md)
- [Plugins](PLUGINS.md) - Sistema de plugins e extensões
- [Monitoring](MONITORING.md) - HealthCheck, Timer e Dashboard

---

## 🆕 Novas Páginas v4.1.0

| Página | Rota | Descrição |
|--------|------|-----------|
| **HealthDashboard** | `/health` | Monitoramento em tempo real via WebSocket |
| **SpicetifyThemeGallery** | `/spicetify-themes` | Galeria de temas com preview e one-click install |

---

## ⚡ Edge Functions

| Função | Descrição |
|--------|-----------|
| `health-monitor-ws` | WebSocket para streaming de métricas |
| `spotify-auth` | Autenticação OAuth Spotify |
| `youtube-music-auth` | Autenticação YouTube Music |
| `lyrics-search` | Busca de letras |
| `alert-notifications` | Alertas via Telegram/Email/Discord |

---

<p align="center">
  Questions? Open a discussion on GitHub.
</p>
