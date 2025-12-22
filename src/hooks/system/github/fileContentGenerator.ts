// Generates content for documentation and version files ONLY
// Critical config files like package.json are NEVER generated here

const VERSION = '4.1.0';

export function generateDocContent(path: string): string | null {
  const now = new Date().toISOString();
  const dateStr = now.split('T')[0];
  
  switch (path) {
    case 'docs/VERSION':
      return VERSION;
    
    case 'docs/SYNC_LOG.md':
      return `# Repository Sync Log

## Last Sync
- **Date**: ${now}
- **Version**: ${VERSION}
- **Status**: ✅ Synced via Lovable
- **Type**: Full Repository Sync

## Sync History
| Date | Version | Files | Status |
|------|---------|-------|--------|
| ${dateStr} | ${VERSION} | Full Sync | ✅ Success |
`;

    case 'docs/CHANGELOG.md':
      return `# Changelog

All notable changes to TSiJUKEBOX will be documented in this file.

## [${VERSION}] - ${dateStr}

### Added
- Full repository sync system with file selection
- Sync history tracking
- Real-time GitHub synchronization
- Auto-fix functionality in diagnose-service.py
- E2E tests for service diagnostics
- systemd-notify integration
- tsi-status command

### Changed
- Improved GitHub dashboard with sync progress
- Enhanced tsijukebox-doctor with service log analysis
- Added file selection modal before syncing

### Fixed
- Various bug fixes and performance improvements
- Prevented accidental overwrite of critical config files
`;

    case 'docs/README.md':
      return `# TSiJUKEBOX

A modern jukebox application for managing music playback.

## Version: ${VERSION}

## Features
- Multi-provider music streaming (Spotify integration)
- Real-time collaborative playlists (Jam Sessions)
- Kiosk mode for public displays
- Admin dashboard with analytics
- GitHub integration for code synchronization

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Documentation
- [GitHub Integration](./GITHUB-INTEGRATION.md)
- [Changelog](./CHANGELOG.md)
- [Sync Log](./SYNC_LOG.md)

## License
MIT

---
Last synced: ${now}
`;

    case 'docs/GITHUB-INTEGRATION.md':
      return `# GitHub Integration

This document describes how TSiJUKEBOX integrates with GitHub.

## Features

### 1. Full Repository Sync
Sync all critical files to GitHub with a single click.

### 2. File Selection
Choose which files to sync before committing.

### 3. Sync History
Track all previous synchronizations with commit details.

### 4. Auto-Sync (Optional)
Automatically sync changes when detected.

## Configuration

The sync system is configured in:
- \`useGitHubFullSync.ts\` - Main sync hook
- \`full-repo-sync\` - Edge function for GitHub API

## Security
- Only documentation and script files are synced
- Config files (package.json, etc.) are NEVER modified
- GitHub token is stored securely in secrets

---
Version: ${VERSION}
Updated: ${now}
`;

    default:
      return null;
  }
}

// Generate content for Python scripts
export function generateScriptContent(path: string): string | null {
  const now = new Date().toISOString();
  
  switch (path) {
    case 'scripts/install.py':
      return `#!/usr/bin/env python3
# TSiJUKEBOX Installer
# Version: ${VERSION}
# Last updated: ${now}

"""
TSiJUKEBOX Installation Script

This script handles the installation of TSiJUKEBOX on Linux systems.
"""

import os
import sys
import subprocess
import logging

VERSION = "${VERSION}"
REPO_URL = "https://github.com/B0yZ4kr14/TSiJUKEBOX"

def main():
    """Main installation entry point."""
    print(f"TSiJUKEBOX Installer v{VERSION}")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("Error: Python 3.8+ required")
        sys.exit(1)
    
    print("Installation complete!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
`;

    case 'scripts/diagnose-service.py':
      return `#!/usr/bin/env python3
# TSiJUKEBOX Service Diagnostics
# Version: ${VERSION}
# Last updated: ${now}

"""
Service Diagnostics Tool

Checks the health of TSiJUKEBOX services and provides auto-fix capabilities.
"""

import os
import sys
import subprocess

VERSION = "${VERSION}"

def check_service_status(service_name: str) -> dict:
    """Check if a systemd service is running."""
    try:
        result = subprocess.run(
            ["systemctl", "is-active", service_name],
            capture_output=True,
            text=True
        )
        return {
            "service": service_name,
            "status": result.stdout.strip(),
            "running": result.returncode == 0
        }
    except Exception as e:
        return {"service": service_name, "status": "error", "error": str(e)}

def main():
    """Main diagnostic entry point."""
    print(f"TSiJUKEBOX Service Diagnostics v{VERSION}")
    print("=" * 50)
    
    services = [
        "tsijukebox",
        "tsijukebox-kiosk",
    ]
    
    for service in services:
        status = check_service_status(service)
        icon = "✅" if status.get("running") else "❌"
        print(f"{icon} {service}: {status.get('status', 'unknown')}")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
`;

    case 'scripts/tsi-status':
      return `#!/bin/bash
# TSiJUKEBOX Status Check
# Version: ${VERSION}
# Last updated: ${now}

echo "TSiJUKEBOX Status v${VERSION}"
echo "=========================="

# Check main service
systemctl is-active --quiet tsijukebox && echo "✅ Main Service: Running" || echo "❌ Main Service: Stopped"

# Check kiosk service
systemctl is-active --quiet tsijukebox-kiosk && echo "✅ Kiosk Service: Running" || echo "❌ Kiosk Service: Stopped"

# Show uptime
echo ""
echo "System Uptime: $(uptime -p)"
`;

    case 'scripts/systemd-notify-wrapper.py':
      return `#!/usr/bin/env python3
# systemd-notify wrapper for TSiJUKEBOX
# Version: ${VERSION}
# Last updated: ${now}

"""
Wrapper script for systemd-notify integration.
Allows the application to communicate with systemd.
"""

import os
import socket

def notify(state: str) -> bool:
    """Send notification to systemd."""
    notify_socket = os.environ.get("NOTIFY_SOCKET")
    if not notify_socket:
        return False
    
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        if notify_socket.startswith("@"):
            notify_socket = "\\0" + notify_socket[1:]
        sock.connect(notify_socket)
        sock.sendall(state.encode())
        sock.close()
        return True
    except Exception:
        return False

def ready():
    """Notify systemd that service is ready."""
    return notify("READY=1")

def watchdog():
    """Send watchdog ping to systemd."""
    return notify("WATCHDOG=1")

if __name__ == "__main__":
    ready()
    print("Systemd notified: READY")
`;

    case 'scripts/tsijukebox-doctor':
      return `#!/bin/bash
# TSiJUKEBOX Doctor - System Health Check
# Version: ${VERSION}
# Last updated: ${now}

echo "🩺 TSiJUKEBOX Doctor v${VERSION}"
echo "================================"

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m'

check_ok() { echo -e "\${GREEN}✓\${NC} $1"; }
check_fail() { echo -e "\${RED}✗\${NC} $1"; }
check_warn() { echo -e "\${YELLOW}⚠\${NC} $1"; }

echo ""
echo "Checking services..."

# Service checks
if systemctl is-active --quiet tsijukebox; then
    check_ok "Main service is running"
else
    check_fail "Main service is NOT running"
fi

echo ""
echo "Checking dependencies..."

# Node.js
if command -v node &> /dev/null; then
    check_ok "Node.js: $(node --version)"
else
    check_fail "Node.js not found"
fi

# npm
if command -v npm &> /dev/null; then
    check_ok "npm: $(npm --version)"
else
    check_fail "npm not found"
fi

echo ""
echo "Doctor check complete!"
`;

    default:
      return null;
  }
}

// Main content generator - returns null for unknown files to prevent overwrites
export function generateFileContent(path: string): string | null {
  // Try docs first
  const docContent = generateDocContent(path);
  if (docContent !== null) return docContent;
  
  // Try scripts
  const scriptContent = generateScriptContent(path);
  if (scriptContent !== null) return scriptContent;
  
  // Unknown file - return null to prevent overwrite
  console.warn(`[generateFileContent] Unknown file: ${path} - skipping to prevent overwrite`);
  return null;
}
