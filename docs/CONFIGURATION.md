# TSiJUKEBOX Configuration Guide

Complete reference for all configuration options.

---

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Application Settings](#application-settings)
3. [Database Configuration](#database-configuration)
4. [Cloud Backup Configuration](#cloud-backup-configuration)
5. [Theme Configuration](#theme-configuration)
6. [Kiosk Mode](#kiosk-mode)

---

## Environment Variables

TSiJUKEBOX uses environment variables for sensitive configuration.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `eyJhbGc...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | Application name | `TSiJUKEBOX` |
| `VITE_DEFAULT_LOCALE` | Default language | `en` |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap API key | - |
| `VITE_SPOTIFY_CLIENT_ID` | Spotify app client ID | - |

### Setting Environment Variables

```bash
# Create .env.local file (not committed to git)
cp .env.example .env.local

# Edit with your values
nano .env.local
```

---

## Application Settings

Access via **Settings** in the app.

### General Settings

| Setting | Description | Options |
|---------|-------------|---------|
| **Language** | Interface language | English, Spanish, Portuguese |
| **Theme** | Color scheme | Dark (default) |
| **Sound Effects** | UI sound feedback | On/Off |
| **Notifications** | Toast notifications | On/Off |

### Accessibility Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **High Contrast** | Increase color contrast | Off |
| **Reduce Motion** | Minimize animations | Off |
| **Large Text** | Increase font sizes | Off |
| **Screen Reader** | Optimize for screen readers | Auto |

### Privacy Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Analytics** | Anonymous usage data | Off |
| **Error Reporting** | Send crash reports | Off |
| **Session History** | Save playback history | On |

---

## Database Configuration

### SQLite (Default)

Configuration file: `/etc/jukebox/database.json`

```json
{
  "type": "sqlite",
  "path": "/var/lib/jukebox/jukebox.db",
  "options": {
    "journal_mode": "WAL",
    "synchronous": "NORMAL",
    "cache_size": 10000
  }
}
```

### MariaDB

```json
{
  "type": "mariadb",
  "host": "localhost",
  "port": 3306,
  "database": "jukebox",
  "user": "jukebox",
  "password": "your_password",
  "options": {
    "charset": "utf8mb4",
    "timezone": "local",
    "connectionLimit": 10
  }
}
```

### PostgreSQL

```json
{
  "type": "postgresql",
  "host": "localhost",
  "port": 5432,
  "database": "jukebox",
  "user": "jukebox",
  "password": "your_password",
  "options": {
    "ssl": false,
    "pool": {
      "min": 2,
      "max": 10
    }
  }
}
```

---

## Cloud Backup Configuration

### Storj

Configuration file: `/etc/jukebox/backup/storj.json`

```json
{
  "provider": "storj",
  "enabled": true,
  "access_grant": "your_access_grant",
  "bucket": "jukebox-backup",
  "schedule": {
    "frequency": "daily",
    "time": "03:00",
    "retention_days": 30
  }
}
```

### Google Drive (via rclone)

```json
{
  "provider": "gdrive",
  "enabled": true,
  "remote_name": "gdrive",
  "folder": "TSiJUKEBOX Backups",
  "schedule": {
    "frequency": "weekly",
    "day": "sunday",
    "time": "02:00"
  }
}
```

### AWS S3

```json
{
  "provider": "aws",
  "enabled": true,
  "access_key": "AKIA...",
  "secret_key": "...",
  "region": "us-east-1",
  "bucket": "my-jukebox-backup",
  "path_prefix": "backups/",
  "storage_class": "STANDARD_IA"
}
```

### Backup Schedule Options

| Frequency | Description |
|-----------|-------------|
| `hourly` | Every hour |
| `daily` | Once per day at specified time |
| `weekly` | Once per week on specified day |
| `monthly` | First day of each month |

---

## Theme Configuration

### Custom Theme

Edit `src/index.css` or use the Theme Customizer in Settings.

```css
:root {
  /* Primary Colors */
  --kiosk-bg: 240 10% 10%;
  --kiosk-surface: 240 10% 15%;
  --kiosk-text: 0 0% 96%;
  --kiosk-border: 240 10% 25%;
  --kiosk-primary: 330 100% 65%;
  --kiosk-accent: 195 100% 50%;
  
  /* Neon Accents */
  --gold-neon: 45 100% 65%;
  --blue-neon: 210 100% 70%;
  --cyan-neon: 180 100% 50%;
  
  /* Status Colors */
  --spotify-green: 141 70% 45%;
  --destructive: 0 100% 50%;
  --warning: 38 100% 60%;
  
  /* Animation Speeds */
  --animation-speed: 1;
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;
}
```

### Theme Variants

| Variant | Description |
|---------|-------------|
| `dark` | Default dark theme with neon accents |
| `darker` | Ultra-dark for OLED displays |
| `high-contrast` | Maximum contrast for accessibility |

---

## Kiosk Mode

For public/commercial installations.

### Enabling Kiosk Mode

#### Method 1: URL Parameter

```
http://localhost:5173?kiosk=true
```

#### Method 2: Environment Variable

```bash
VITE_KIOSK_MODE=true npm run dev
```

#### Method 3: Fullscreen Browser

```bash
# Openbox autostart (~/.config/openbox/autostart)
chromium --kiosk --app=http://localhost:5173
```

### Kiosk Configuration

```json
{
  "kiosk": {
    "enabled": true,
    "features": {
      "show_clock": true,
      "show_weather": true,
      "show_system_stats": false,
      "allow_settings": false,
      "allow_logout": false
    },
    "restrictions": {
      "max_queue_per_user": 3,
      "queue_cooldown_minutes": 5,
      "explicit_content": false
    },
    "display": {
      "idle_timeout_seconds": 30,
      "screensaver": "visualizer",
      "hide_cursor": true
    }
  }
}
```

### Kiosk Security

| Setting | Description | Recommendation |
|---------|-------------|----------------|
| `allow_settings` | Access to settings | Disable |
| `allow_logout` | Logout button | Disable |
| `hide_cursor` | Hide mouse cursor | Enable |
| `disable_devtools` | Prevent F12 | Enable |

---

## Music Provider Configuration

### Spotify

```json
{
  "spotify": {
    "enabled": true,
    "client_id": "your_client_id",
    "scopes": [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "playlist-read-private",
      "user-library-read"
    ],
    "market": "US",
    "auto_play": true
  }
}
```

### YouTube Music

```json
{
  "youtube_music": {
    "enabled": true,
    "oauth_client_id": "your_client_id",
    "auto_quality": true,
    "preferred_quality": "high"
  }
}
```

### Local Music

```json
{
  "local_music": {
    "enabled": true,
    "directories": [
      "/home/tsi/Music",
      "/mnt/nas/music"
    ],
    "watch_for_changes": true,
    "scan_interval_hours": 24,
    "supported_formats": ["mp3", "flac", "wav", "ogg", "m4a"],
    "extract_metadata": true
  }
}
```

---

## Logging Configuration

```json
{
  "logging": {
    "level": "info",
    "console": true,
    "file": {
      "enabled": true,
      "path": "/var/log/jukebox/app.log",
      "max_size_mb": 10,
      "max_files": 5
    },
    "json": {
      "enabled": true,
      "path": "/var/log/jukebox/app.json"
    }
  }
}
```

### Log Levels

| Level | Description |
|-------|-------------|
| `debug` | Detailed debugging info |
| `info` | General information |
| `warn` | Warning messages |
| `error` | Error messages |
| `silent` | No logging |

---

## Advanced Configuration

### Performance Tuning

```json
{
  "performance": {
    "cache": {
      "album_art_mb": 100,
      "lyrics_mb": 50,
      "api_responses_mb": 25
    },
    "prefetch": {
      "next_tracks": 3,
      "album_art": true
    },
    "visualizer": {
      "fps_limit": 30,
      "quality": "medium"
    }
  }
}
```

### Network Configuration

```json
{
  "network": {
    "timeout_ms": 10000,
    "retry_attempts": 3,
    "retry_delay_ms": 1000,
    "websocket": {
      "reconnect": true,
      "reconnect_delay_ms": 5000
    }
  }
}
```

---

<p align="center">
  Need help? See <a href="TROUBLESHOOTING.md">Troubleshooting</a>.
</p>
