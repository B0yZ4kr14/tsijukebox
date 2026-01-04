# Getting Started with TSiJUKEBOX

Welcome to TSiJUKEBOX! This guide will help you get up and running in just a few minutes.

## 📋 Before You Start

Make sure you have:

- ✅ A computer running **Arch Linux**, **CachyOS**, or **Manjaro**
- ✅ **Internet connection** for downloading packages
- ✅ **Administrator access** (sudo password)
- ✅ At least **2 GB of RAM** and **10 GB of free disk space**

Don't worry if you're not familiar with Linux commands - we'll guide you through each step!

---

## 🚀 Installation (5 Minutes)

### Step 1: Open Terminal

1. Press `Ctrl + Alt + T` to open a terminal, or
2. Search for "Terminal" in your applications menu

### Step 2: Download TSiJUKEBOX

Copy and paste this command into your terminal:

```bash
git clone https://github.com/yourusername/tsijukebox.git
```

> 💡 **Tip**: To paste in terminal, use `Ctrl + Shift + V`

### Step 3: Navigate to the Folder

```bash
cd tsijukebox
```

### Step 4: Run the Installer (One Command)

**Option A: Quick Install (Recommended)**

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3
```

**Option B: Download and Review First**

```bash
# Download
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py -o installer.py

# Review (optional)
less installer.py

# Execute
sudo python3 installer.py
```

**Option C: Using shim (auto-downloads unified installer)**

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

You'll be asked for your password - type it and press Enter. (The password won't show as you type - that's normal!)

### Step 5: Follow the Wizard

![Setup Wizard](assets/mockups/setup-wizard-screen.png)

*Assistente de configuração inicial - Etapa 2: Escolha seus provedores de música*

The installer will open a visual wizard in your web browser. Simply:

1. Review the system information
2. Choose your preferred options (Spotify, YouTube Music, Local Files)
3. Click **Install**

That's it! ☕ Grab a coffee while the installation completes.

---

## 🎯 First Launch

![Dashboard](assets/mockups/dashboard-screen.png)

*Tela inicial do TSiJUKEBOX com suas músicas, playlists e recomendações*

After installation, you can access TSiJUKEBOX in two ways:

### Option A: Open in Browser

Open your web browser and go to:
```
http://localhost:5173
```

### Option B: Launch from Terminal

```bash
cd tsijukebox
npm run dev
```

---

## 🔑 Default Login

Use these credentials to log in:

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `admin` |

> ⚠️ **Important**: Change your password after first login! Go to **Settings → User Management**.

---

## 🎵 Adding Your Music

### Local Music Files

1. Go to **Settings → Local Music**
2. Click **Add Folder**
3. Navigate to your music folder
4. Click **Select**

Supported formats: MP3, FLAC, WAV, OGG, M4A

### Spotify Integration

1. Go to **Settings → Music Integrations → Spotify**
2. Click **Connect Spotify**
3. Log in with your Spotify account
4. Grant the requested permissions

### YouTube Music

1. Go to **Settings → Music Integrations → YouTube Music**
2. Click **Connect YouTube Music**
3. Follow the authentication flow

---

## 🎤 Karaoke Mode

To enable karaoke with synchronized lyrics:

1. Play any song
2. Click the **Lyrics** button (🎤 icon)
3. Lyrics will display synchronized with the music

> 💡 **Note**: Lyrics are automatically fetched from online databases. Not all songs have lyrics available.

---

## 📱 Kiosk Mode

For public installations (bars, restaurants):

1. Open the app in fullscreen (`F11` key)
2. The interface is optimized for touch screens
3. Users can:
   - Browse available music
   - Add songs to the queue
   - View the current playlist

---

## ❓ Common Questions

### "The page is blank!"

1. Make sure the development server is running
2. Check if the URL is correct: `http://localhost:5173`
3. Try refreshing the page (`Ctrl + R`)

### "I can't log in!"

1. Make sure you're using the correct credentials (`admin` / `admin`)
2. Try the "Local Authentication" option if Supabase isn't configured
3. Check if Caps Lock is off

### "My music isn't showing!"

1. Make sure the music folder path is correct
2. Wait a few seconds for the library to scan
3. Check that your files are in a supported format

### "Spotify won't connect!"

1. Make sure you have an active Spotify account
2. Check your internet connection
3. Try disconnecting and reconnecting

---

## 📚 Next Steps

Now that you're up and running:

| Want to... | Read this |
|------------|-----------|
| Customize appearance | [Configuration Guide](CONFIGURATION.md) |
| Fix issues | [Troubleshooting](TROUBLESHOOTING.md) |
| Learn technical terms | [Glossary](GLOSSARY.md) |
| Contribute code | [Developer Guide](DEVELOPER-GUIDE.md) |

---

## 🆘 Need Help?

- 📖 Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- 💬 Visit our community forum
- 🐛 Report bugs on GitHub Issues

---

<p align="center">
  <strong>Enjoy your music! 🎵</strong>
</p>
