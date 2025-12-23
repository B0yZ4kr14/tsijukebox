# TSiJUKEBOX Installation Guide v6.0.0

Complete installation instructions for all deployment scenarios.

![Version](https://img.shields.io/badge/version-6.0.0-blue?style=flat-square)

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Methods](#installation-methods)
   - [One-Command Installation](#one-command-installation-recommended)
   - [Wizard Installation](#wizard-installation)
   - [Automatic Installation](#automatic-installation)
   - [Docker Installation](#docker-installation)
   - [Manual Installation](#manual-installation)
3. [26 Installation Phases](#26-installation-phases)
4. [Database Configuration](#database-configuration)
5. [SSL Configuration](#ssl-configuration)
6. [Avahi/mDNS Configuration](#avahimdns-configuration)
7. [Cloud Backup Setup](#cloud-backup-setup)
8. [Post-Installation](#post-installation)
9. [Uninstallation](#uninstallation)

---

## System Requirements

### Supported Operating Systems

| Distribution | Version | Status |
|--------------|---------|--------|
| Arch Linux | Rolling | ✅ Fully Supported |
| CachyOS | Rolling | ✅ Recommended |
| Manjaro | Stable/Testing | ✅ Fully Supported |
| EndeavourOS | Rolling | ⚠️ Community Tested |
| Artix Linux | Rolling | ⚠️ Community Tested |

### Hardware Requirements

| Component | Minimum | Recommended | Optimal |
|-----------|---------|-------------|---------|
| **CPU** | 2 cores x86_64 | 4 cores | 8+ cores |
| **RAM** | 2 GB | 8 GB | 16+ GB |
| **Storage** | 10 GB | 50 GB | 500+ GB |
| **Network** | WiFi | Ethernet | Gigabit |
| **Display** | 1024x768 | 1920x1080 | 4K Touch |

### Software Dependencies

The installer will automatically install these packages:

```
base-devel git nodejs npm python python-pip
chromium openbox xorg-server xorg-xinit
```

---

## Installation Methods

### Wizard Installation (Recommended)

The visual wizard provides a user-friendly installation experience.

```bash
# Clone repository
git clone https://github.com/yourusername/tsijukebox.git
cd tsijukebox

# Run installer
sudo python3 scripts/installer/main.py
```

The wizard will:
1. Detect your system configuration
2. Suggest optimal database choice
3. Guide you through each option
4. Install all dependencies
5. Configure the system

### Automatic Installation

For scripted or headless installations:

```bash
# Basic automatic installation
sudo python3 scripts/installer/main.py --auto

# With custom configuration
sudo python3 scripts/installer/main.py --auto --config my-config.json

# Verbose output
sudo python3 scripts/installer/main.py --auto --verbose
```

#### Configuration File Format

```json
{
  "database": "sqlite",
  "username": "tsi",
  "shell": "zsh",
  "cloud_providers": ["storj", "gdrive"],
  "generate_ssh_keys": true,
  "generate_gpg_keys": false,
  "spicetify_extensions": ["shuffle+", "keyboardShortcut"]
}
```

### Docker Installation

For containerized deployment:

```bash
# Using installer
sudo python3 scripts/installer/main.py --docker

# Or manually with docker-compose
docker-compose up -d
```

Docker configuration (`docker-compose.yml`):

```yaml
version: '3.8'
services:
  tsijukebox:
    image: tsijukebox/app:latest
    ports:
      - "5173:5173"
    volumes:
      - ./music:/music
      - ./data:/data
    environment:
      - DATABASE_URL=sqlite:///data/jukebox.db
    restart: unless-stopped
```

### Manual Installation

For advanced users who want full control:

#### 1. Install System Packages

```bash
# Update system
sudo pacman -Syu

# Install base packages
sudo pacman -S --noconfirm base-devel git nodejs npm python python-pip

# Install optional packages
sudo pacman -S --noconfirm chromium pulseaudio pavucontrol
```

#### 2. Install Node Dependencies

```bash
cd tsijukebox
npm install
```

#### 3. Configure Database

```bash
# SQLite (default)
mkdir -p /var/lib/jukebox
touch /var/lib/jukebox/jukebox.db

# Or install MariaDB
sudo pacman -S mariadb
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable --now mariadb
```

#### 4. Create System User

```bash
sudo useradd -m -G wheel,audio,video -s /bin/bash tsi
sudo mkdir -p /home/tsi/Music
sudo chown tsi:tsi /home/tsi/Music
```

#### 5. Start Development Server

```bash
npm run dev
```

---

## Database Configuration

TSiJUKEBOX supports multiple database backends:

### SQLite (Default)

Best for: Single-user, home installations

```bash
# Automatic setup
# Database created at /var/lib/jukebox/jukebox.db
```

Configuration:
```json
{
  "database": {
    "type": "sqlite",
    "path": "/var/lib/jukebox/jukebox.db"
  }
}
```

### MariaDB

Best for: Multi-user, commercial installations

```bash
# Install
sudo pacman -S mariadb

# Initialize
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Start service
sudo systemctl enable --now mariadb

# Secure installation
sudo mysql_secure_installation

# Create database
sudo mysql -e "CREATE DATABASE jukebox; CREATE USER 'jukebox'@'localhost' IDENTIFIED BY 'password'; GRANT ALL ON jukebox.* TO 'jukebox'@'localhost';"
```

Configuration:
```json
{
  "database": {
    "type": "mariadb",
    "host": "localhost",
    "port": 3306,
    "name": "jukebox",
    "user": "jukebox",
    "password": "password"
  }
}
```

### PostgreSQL

Best for: Large-scale, enterprise installations

```bash
# Install
sudo pacman -S postgresql

# Initialize
sudo -u postgres initdb -D /var/lib/postgres/data

# Start service
sudo systemctl enable --now postgresql

# Create database
sudo -u postgres createuser jukebox
sudo -u postgres createdb -O jukebox jukebox
```

Configuration:
```json
{
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "name": "jukebox",
    "user": "jukebox",
    "password": "password"
  }
}
```

### Database Selection Guide

| RAM | Users | Recommendation |
|-----|-------|----------------|
| < 4 GB | 1-5 | SQLite |
| 4-8 GB | 5-50 | MariaDB |
| 8+ GB | 50+ | PostgreSQL |

---

## Cloud Backup Setup

### Storj (Recommended)

```bash
# Install Storj CLI
curl -L https://storj.io/install.sh | bash

# Configure
uplink access create

# Test
uplink ls sj://bucket-name
```

### Google Drive

```bash
# Install rclone
sudo pacman -S rclone

# Configure
rclone config
# Follow prompts for Google Drive

# Test
rclone ls gdrive:
```

### AWS S3

```bash
# Install AWS CLI
sudo pacman -S aws-cli-v2

# Configure
aws configure

# Test
aws s3 ls
```

---

## Post-Installation

### 1. Change Default Password

```
Settings → User Management → Change Password
```

### 2. Configure Music Providers

- **Spotify**: Settings → Music Integrations → Spotify
- **YouTube Music**: Settings → Music Integrations → YouTube Music
- **Local Files**: Settings → Local Music

### 3. Set Up Backup Schedule

```
Settings → Backup → Schedule
```

### 4. Enable Kiosk Mode (Optional)

For public installations:

```bash
# Add to ~/.xinitrc
exec openbox-session

# Add to openbox autostart
chromium --kiosk http://localhost:5173
```

---

## Uninstallation

### Complete Removal

```bash
sudo python3 scripts/installer/main.py --uninstall
```

### Manual Cleanup

```bash
# Remove application
rm -rf /var/www/jukebox

# Remove data
rm -rf /var/lib/jukebox

# Remove logs
rm -rf /var/log/jukebox

# Remove user (optional)
sudo userdel -r tsi

# Remove packages (optional)
sudo pacman -Rs nodejs npm
```

---

## Troubleshooting Installation

### Common Issues

| Problem | Solution |
|---------|----------|
| "Not running as root" | Use `sudo python3 main.py` |
| "Unsupported distribution" | Install on Arch-based system |
| "No internet connection" | Check network connectivity |
| "Package installation failed" | Run `sudo pacman -Syu` first |

For more help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

<p align="center">
  Need help? Open an issue on GitHub.
</p>
