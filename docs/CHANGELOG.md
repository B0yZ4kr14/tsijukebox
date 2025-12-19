# Changelog

All notable changes to TSiJUKEBOX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Brand Guidelines page with color palette, typography, and logo usage
- Export color palette as JSON and CSS
- Python installer with logging and validators utilities
- Comprehensive documentation suite

### Changed
- Improved authentication provider toggle on login page
- Enhanced system checker with more hardware detection

### Fixed
- Auth provider toggle visibility on login page

---

## [4.0.0] - 2024-12-19

### Added
- **Kiosk Mode**: Touch-optimized interface for public installations
- **Karaoke Mode**: Synchronized lyrics display with fullscreen view
- **Multi-Provider Support**: Spotify, YouTube Music, and local files
- **Cloud Backup**: Storj, Google Drive, Dropbox, AWS S3, OneDrive, MEGA
- **System Monitoring**: Real-time CPU, RAM, temperature display
- **Weather Widget**: Current conditions and forecast
- **Audio Visualizer**: Real-time audio visualization
- **Role-Based Access**: Admin, User, Newbie roles with permissions
- **Internationalization**: English, Spanish, Portuguese support
- **PWA Support**: Installable as desktop/mobile app
- **Accessibility**: WCAG 2.1 AA compliance

### Changed
- Complete UI redesign with neon dark theme
- Improved performance with React Query caching
- Enhanced mobile responsiveness
- Refactored hook architecture for better organization

### Security
- Implemented Row Level Security (RLS) on all tables
- Added input validation with Zod schemas
- Secured API keys in edge functions

---

## [3.0.0] - 2024-06-15

### Added
- YouTube Music integration
- Playlist management
- Queue system with drag-and-drop
- Settings dashboard

### Changed
- Migrated to Vite from Create React App
- Updated to React 18
- Improved TypeScript coverage

### Deprecated
- Legacy REST API endpoints

---

## [2.0.0] - 2024-01-10

### Added
- Spotify integration with OAuth
- User authentication with Supabase
- Basic playback controls
- Library scanning

### Changed
- Redesigned player interface
- Improved audio quality handling

### Removed
- PHP backend (replaced with Supabase)

---

## [1.0.0] - 2023-08-01

### Added
- Initial release
- Local music playback
- Basic UI with dark theme
- Volume control
- Track information display

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 4.0.0 | 2024-12-19 | Kiosk mode, karaoke, cloud backup |
| 3.0.0 | 2024-06-15 | YouTube Music, playlists |
| 2.0.0 | 2024-01-10 | Spotify, Supabase auth |
| 1.0.0 | 2023-08-01 | Initial release |

---

## Upgrade Notes

### Upgrading to 4.0.0

1. **Database Migration Required**
   ```bash
   npm run migrate
   ```

2. **New Environment Variables**
   ```env
   VITE_WEATHER_API_KEY=your_key
   ```

3. **Breaking Changes**
   - `usePlayback` hook renamed to `usePlayer`
   - Settings context API changed
   - Some CSS class names updated

### Upgrading to 3.0.0

1. **Vite Migration**
   - Update `package.json` scripts
   - Rename `process.env` to `import.meta.env`

2. **React 18**
   - Update `ReactDOM.render` to `createRoot`

---

<p align="center">
  See <a href="INSTALLATION.md">Installation Guide</a> for upgrade instructions.
</p>
