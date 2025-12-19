# TSiJUKEBOX Troubleshooting Guide

Solutions for common problems and issues.

---

## 📋 Quick Links

| Issue Category | Jump To |
|----------------|---------|
| Installation | [Installation Issues](#installation-issues) |
| Authentication | [Login Problems](#authentication-issues) |
| Music Playback | [Playback Issues](#playback-issues) |
| Spotify | [Spotify Integration](#spotify-issues) |
| Performance | [Performance Problems](#performance-issues) |
| Display | [UI/Display Issues](#display-issues) |

---

## Installation Issues

### "Not running as root"

**Problem**: Installer requires administrator privileges.

**Solution**:
```bash
sudo python3 scripts/installer/main.py
```

### "Unsupported distribution"

**Problem**: Running on a non-Arch-based Linux distribution.

**Solution**: TSiJUKEBOX only supports:
- Arch Linux
- CachyOS
- Manjaro
- EndeavourOS

For other distributions, use Docker:
```bash
docker-compose up -d
```

### "Package installation failed"

**Problem**: Pacman failed to install packages.

**Solutions**:

1. Update system first:
```bash
sudo pacman -Syu
```

2. Clear package cache:
```bash
sudo pacman -Scc
```

3. Refresh mirrors:
```bash
sudo pacman -Syy
```

### "No internet connection"

**Problem**: Installer cannot reach update servers.

**Solutions**:

1. Check network:
```bash
ping google.com
```

2. Restart network service:
```bash
sudo systemctl restart NetworkManager
```

3. Check DNS:
```bash
cat /etc/resolv.conf
```

---

## Authentication Issues

### "Invalid credentials"

**Problem**: Login fails with correct username/password.

**Solutions**:

1. Check if using correct auth provider:
   - Look for toggle at bottom of login page
   - Switch between "Lovable Cloud" and "Local Authentication"

2. For local auth, default credentials:
   - Username: `admin`
   - Password: `admin`

3. Reset local password:
   - Go to Settings → User Management
   - Or clear localStorage in browser DevTools

### "Supabase login not working"

**Problem**: Cannot log in with email/password.

**Solutions**:

1. Check if Supabase is configured:
   - Look for Supabase URL in environment variables
   - Verify connection in Settings → Cloud

2. Try switching to local authentication:
   - Click toggle at bottom of login page
   - Select "Local Authentication"

### "Session expired"

**Problem**: Keep getting logged out.

**Solutions**:

1. Clear browser cookies and cache
2. Disable browser extensions that might interfere
3. Check if auto-confirm email is enabled in Supabase

---

## Playback Issues

### "Music won't play"

**Problem**: Clicking play doesn't start music.

**Solutions**:

1. Check audio output:
```bash
# List audio sinks
pactl list sinks short

# Set default sink
pactl set-default-sink <sink_name>
```

2. Check browser permissions:
   - Click the lock icon in address bar
   - Ensure "Sound" is set to "Allow"

3. Verify file format is supported:
   - MP3, FLAC, WAV, OGG, M4A

### "Audio stuttering"

**Problem**: Music plays but stutters or skips.

**Solutions**:

1. Reduce audio buffer:
   - Go to Settings → Advanced
   - Increase buffer size

2. Check CPU usage:
```bash
htop
```

3. Close background applications

### "No sound output"

**Problem**: Music plays but no audio.

**Solutions**:

1. Check volume:
   - In-app volume slider
   - System volume (pavucontrol)

2. Check audio service:
```bash
pulseaudio --check
pulseaudio -D
```

3. Verify output device:
```bash
pacmd list-sinks
```

---

## Spotify Issues

### "Spotify won't connect"

**Problem**: Unable to authenticate with Spotify.

**Solutions**:

1. Verify Spotify Premium subscription (required for playback control)

2. Check Spotify app registration:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Verify redirect URIs include your app URL

3. Clear Spotify tokens:
   - Go to Settings → Music Integrations → Spotify
   - Click "Disconnect" then "Connect" again

### "Spotify playback error"

**Problem**: Spotify connected but can't play.

**Solutions**:

1. Ensure Spotify is open on a device:
   - Web player, desktop app, or mobile app

2. Check Spotify Connect devices:
   - Open Spotify app
   - Look for available devices

3. Refresh token:
   - Settings → Music Integrations → Spotify → Reconnect

### "Songs not in library"

**Problem**: Can't find songs in Spotify library.

**Solutions**:

1. Use Search function instead of Library
2. Check Spotify region restrictions
3. Verify song is still available on Spotify

---

## Performance Issues

### "App is slow"

**Problem**: UI feels sluggish or unresponsive.

**Solutions**:

1. Check system resources:
```bash
htop
free -h
```

2. Clear browser cache:
   - DevTools → Application → Clear Storage

3. Reduce visualizer quality:
   - Settings → Accessibility → Reduce Motion

4. Use production build:
```bash
npm run build
npm run preview
```

### "High CPU usage"

**Problem**: App uses too much CPU.

**Solutions**:

1. Disable audio visualizer
2. Reduce animation effects
3. Close other browser tabs
4. Check for infinite loops in console

### "Memory leak"

**Problem**: Memory usage grows over time.

**Solutions**:

1. Refresh the page periodically
2. Close unused tabs/panels
3. Check console for errors
4. Report issue with steps to reproduce

---

## Display Issues

### "Blank/white screen"

**Problem**: Page loads but shows nothing.

**Solutions**:

1. Check browser console for errors:
   - Press F12 → Console tab

2. Hard refresh:
   - Ctrl + Shift + R

3. Clear localStorage:
   - DevTools → Application → Local Storage → Clear

4. Check if JavaScript is enabled

### "Layout broken"

**Problem**: Elements misaligned or overlapping.

**Solutions**:

1. Clear cache and refresh
2. Check zoom level (should be 100%)
3. Try different browser
4. Check for browser extensions interference

### "Missing icons/fonts"

**Problem**: Icons show as squares or fonts look wrong.

**Solutions**:

1. Check network tab for failed requests
2. Verify internet connection
3. Install system fonts:
```bash
sudo pacman -S noto-fonts ttf-dejavu
```

---

## Database Issues

### "Database connection failed"

**Problem**: App can't connect to database.

**Solutions**:

1. Check database service:
```bash
# SQLite - check file exists
ls -la /var/lib/jukebox/jukebox.db

# MariaDB
sudo systemctl status mariadb

# PostgreSQL
sudo systemctl status postgresql
```

2. Verify credentials in config

3. Test connection manually:
```bash
# MariaDB
mysql -u user -p database

# PostgreSQL
psql -U user -d database
```

### "Data not saving"

**Problem**: Changes don't persist after refresh.

**Solutions**:

1. Check browser localStorage quota
2. Verify database write permissions
3. Check for database errors in logs:
```bash
tail -f /var/log/jukebox/install.log
```

---

## Network Issues

### "WebSocket disconnected"

**Problem**: Real-time features not working.

**Solutions**:

1. Check WebSocket support in browser
2. Verify firewall isn't blocking WebSockets
3. Check for proxy interference

### "API requests failing"

**Problem**: Features requiring API calls don't work.

**Solutions**:

1. Check network tab in DevTools
2. Verify API endpoints are accessible
3. Check for CORS errors in console
4. Verify API keys are configured

---

## Getting More Help

### Collect Debug Information

```bash
# System info
neofetch

# Logs
cat /var/log/jukebox/install.log

# Browser console
# F12 → Console → Right-click → Save as...
```

### Report an Issue

When reporting issues, include:

1. Operating system and version
2. Browser and version
3. Steps to reproduce
4. Console errors (if any)
5. Screenshots (if applicable)

### Community Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/tsijukebox/issues)
- Discussions: [Ask questions](https://github.com/yourusername/tsijukebox/discussions)

---

<p align="center">
  Still stuck? Open an issue on GitHub with debug information.
</p>
