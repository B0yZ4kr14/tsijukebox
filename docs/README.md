# TSiJUKEBOX Enterprise Documentation

<p align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="300" />
</p>

<p align="center">
  <strong>Enterprise Music System for Kiosk and Bar Environments</strong>
</p>

<p align="center">
  <a href="GETTING-STARTED.md">Quick Start</a> •
  <a href="INSTALLATION.md">Installation</a> •
  <a href="DEVELOPER-GUIDE.md">Developer Guide</a> •
  <a href="API-REFERENCE.md">API Reference</a>
</p>

---

## 📚 Documentation Index

### 🚀 Getting Started

| Document | Audience | Description |
|----------|----------|-------------|
| [**Quick Start Guide**](GETTING-STARTED.md) | Beginners | Get up and running in 5 minutes |
| [**Installation Guide**](INSTALLATION.md) | All Users | Complete installation instructions |
| [**Glossary**](GLOSSARY.md) | Beginners | Technical terms explained simply |

### 👤 For Users

| Document | Audience | Description |
|----------|----------|-------------|
| [**Configuration Guide**](CONFIGURATION.md) | Power Users | All configuration options explained |
| [**Troubleshooting**](TROUBLESHOOTING.md) | All Users | Common problems and solutions |

### 🔧 For Enthusiasts

| Document | Audience | Description |
|----------|----------|-------------|
| [**Design System**](DESIGN-SYSTEM.md) | Designers | Colors, typography, components |
| [**Accessibility**](ACCESSIBILITY.md) | All | WCAG 2.1 AA compliance details |

### 👨‍💻 For Developers

| Document | Audience | Description |
|----------|----------|-------------|
| [**Developer Guide**](DEVELOPER-GUIDE.md) | Developers | Architecture and contribution guide |
| [**Hooks Architecture**](HOOKS-ARCHITECTURE.md) | Developers | React hooks organization |
| [**API Reference**](API-REFERENCE.md) | Developers | Complete API documentation |
| [**Backend Endpoints**](BACKEND-ENDPOINTS.md) | Developers | Edge functions documentation |
| [**Security Guide**](SECURITY.md) | Developers | Security practices and policies |

### 📜 Reference

| Document | Audience | Description |
|----------|----------|-------------|
| [**Changelog**](CHANGELOG.md) | All | Version history and updates |
| [**Credits**](CREDITS.md) | All | Authorship and licensing |

---

## 🎯 What is TSiJUKEBOX?

TSiJUKEBOX is an **enterprise-grade digital jukebox system** designed for:

- 🎵 **Bars & Restaurants** - Let customers queue songs
- 🎤 **Karaoke Venues** - Synchronized lyrics display
- 🏪 **Retail Stores** - Background music management
- 🏠 **Home Entertainment** - Personal music server

### Key Features

| Feature | Description |
|---------|-------------|
| 🎧 **Multi-Provider Support** | Spotify, YouTube Music, Local Files |
| 📱 **Kiosk Mode** | Touch-optimized interface for public use |
| 🎤 **Karaoke Mode** | Real-time synchronized lyrics |
| ☁️ **Cloud Backup** | Storj, Google Drive, Dropbox, etc. |
| 🔐 **Role-Based Access** | Admin, User, Newbie roles |
| 📊 **System Monitoring** | CPU, RAM, temperature display |
| 🌐 **Multi-Language** | English, Spanish, Portuguese |

---

## 🖥️ System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **OS** | Arch Linux, CachyOS, or Manjaro |
| **CPU** | x86_64, 2+ cores |
| **RAM** | 2 GB |
| **Disk** | 10 GB free |
| **Display** | 1024x768 minimum |

### Recommended Specifications

| Component | Recommendation |
|-----------|----------------|
| **OS** | CachyOS (optimized Arch) |
| **CPU** | 4+ cores |
| **RAM** | 8 GB |
| **Disk** | 50+ GB (for music library) |
| **Display** | 1920x1080 touchscreen |
| **Network** | Ethernet for reliability |

---

## 🚀 Quick Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tsijukebox.git
cd tsijukebox

# Run the installer (requires root)
sudo python3 scripts/installer/main.py

# Or for automatic installation with defaults
sudo python3 scripts/installer/main.py --auto
```

For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md).

---

## 📁 Project Structure

```
tsijukebox/
├── docs/                    # Documentation
├── e2e/                     # End-to-end tests (Playwright)
├── public/                  # Static assets
│   └── logo/               # Brand assets
├── scripts/
│   └── installer/          # Python installer
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication
│   │   ├── player/        # Music player
│   │   ├── settings/      # Settings panels
│   │   ├── spotify/       # Spotify integration
│   │   ├── ui/            # UI primitives
│   │   └── youtube/       # YouTube Music
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   │   ├── auth/          # Auth hooks
│   │   ├── player/        # Player hooks
│   │   ├── spotify/       # Spotify hooks
│   │   └── youtube/       # YouTube hooks
│   ├── lib/               # Utilities
│   ├── pages/             # Route pages
│   └── i18n/              # Translations
└── supabase/
    └── functions/         # Edge functions
```

---

## 🤝 Contributing

We welcome contributions! Please read our [Developer Guide](DEVELOPER-GUIDE.md) for:

- Code style guidelines
- Pull request process
- Testing requirements
- Architecture decisions

---

## 📄 License

TSiJUKEBOX is released under **Public Domain** dedication.

See [CREDITS.md](CREDITS.md) for full authorship and licensing details.

---

## 🙏 Acknowledgments

- **shadcn/ui** - UI component library
- **Lucide Icons** - Icon set
- **Tailwind CSS** - Styling framework
- **Supabase** - Backend infrastructure
- **Framer Motion** - Animations

---

<p align="center">
  <strong>TSiJUKEBOX</strong> - Enterprise Music System
  <br>
  Made with 🎵 by B0.y_Z4kr14
</p>
