# Screenshot Service Edge Function

## Overview
The `screenshot-service` edge function automates UI screenshot capture for documentation and visual regression testing.

## Endpoint
`POST /functions/v1/screenshot-service`

## Actions

| Action | Description |
|--------|-------------|
| `list-screenshots` | List all stored screenshots |
| `capture-single` | Capture one route |
| `capture-multiple` | Capture specified routes |
| `capture-all` | Capture all default routes |

## Request Schema

```typescript
interface ScreenshotRequest {
  action: 'capture-single' | 'capture-multiple' | 'capture-all' | 'list-screenshots';
  routes?: string[];
  route?: string;
  baseUrl?: string;
  options?: {
    width?: number;          // Default: 1920
    height?: number;         // Default: 1080
    fullPage?: boolean;      // Default: false
    quality?: number;        // 0-100, Default: 90
    format?: 'png' | 'jpeg' | 'webp';  // Default: 'png'
    waitForSelector?: string;
    delay?: number;          // ms, Default: 2000
  };
}
```

## Default Routes

| Route | Filename | Description |
|-------|----------|-------------|
| `/setup` | `setup-wizard.png` | Setup Wizard |
| `/dashboard` | `dashboard.png` | Dashboard |
| `/spotify` | `spotify-connect.png` | Spotify Integration |
| `/brand` | `brand-guidelines.png` | Brand Guidelines |
| `/changelog` | `changelog.png` | Changelog |
| `/github-dashboard` | `github-dashboard.png` | GitHub Dashboard |
| `/settings` | `settings.png` | Settings |

## Screenshot API Integration

Uses external screenshot service (ScreenshotOne.com):
- `SCREENSHOT_API_KEY` environment variable required
- Falls back to SVG placeholders in development

## Example: List Screenshots

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/screenshot-service \
  -H "Content-Type: application/json" \
  -d '{"action": "list-screenshots"}'
```

## Response: List Screenshots

```json
{
  "success": true,
  "screenshots": [
    {
      "filename": "dashboard.png",
      "size": 245678,
      "createdAt": "2024-01-04T10:00:00Z",
      "url": "https://...storage.../dashboard.png"
    }
  ]
}
```

## Example: Capture Single

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/screenshot-service \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture-single",
    "route": "/dashboard",
    "baseUrl": "https://tsijukebox.app",
    "options": {
      "width": 1920,
      "height": 1080,
      "fullPage": false,
      "format": "png",
      "delay": 3000
    }
  }'
```

## Response: Capture Single

```json
{
  "success": true,
  "screenshot": {
    "route": "/dashboard",
    "filename": "dashboard.png",
    "url": "https://...storage.../dashboard.png",
    "size": 245678,
    "capturedAt": "2024-01-04T10:00:00Z"
  }
}
```

## Example: Capture All

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/screenshot-service \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture-all",
    "baseUrl": "https://tsijukebox.app"
  }'
```

## Response: Capture All

```json
{
  "success": true,
  "screenshots": [
    {
      "route": "/setup",
      "filename": "setup-wizard.png",
      "url": "https://...storage.../setup-wizard.png",
      "size": 234567,
      "capturedAt": "2024-01-04T10:00:00Z"
    },
    {
      "route": "/dashboard",
      "filename": "dashboard.png",
      "url": "https://...storage.../dashboard.png",
      "size": 245678,
      "capturedAt": "2024-01-04T10:00:01Z"
    }
  ],
  "summary": "Captured 7 screenshots in 14.2s"
}
```

## Storage

Screenshots are stored in Supabase Storage:
- **Bucket**: `screenshots`
- **Public Access**: Yes
- **Upsert**: Enabled (overwrites existing)

## Development Mode

When `SCREENSHOT_API_KEY` is not set:
- Generates SVG placeholder images
- Shows route URL and dimensions
- Helpful for development and testing

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SCREENSHOT_API_KEY` | Optional | ScreenshotOne API key |
| `PUBLIC_APP_URL` | Optional | Default base URL fallback |
| `SUPABASE_URL` | Required | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Service role key |

## Features
- ✅ Multiple screenshot capture
- ✅ Custom viewport sizes
- ✅ Full page capture
- ✅ Format selection (PNG/JPEG/WebP)
- ✅ Configurable delay
- ✅ Storage integration
- ✅ Development placeholders
- ✅ Ad/cookie banner blocking
- ✅ CORS enabled

## Use Cases
- Documentation automation
- Visual regression testing
- UI preview generation
- Design system documentation
- Marketing materials
