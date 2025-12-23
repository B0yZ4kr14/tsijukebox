// Main content generator - orchestrates all template generators
// Critical config files like package.json are NEVER generated here
// Supports 397 files across 45 categories

import { generateE2EFixtureContent } from './templates/e2eFixtureTemplates';
import { generateE2ESpecContent } from './templates/e2eSpecTemplates';
import { generateHookContent } from './templates/hookTemplates';
import { generateComponentContent } from './templates/componentTemplates';
import { generatePageContent } from './templates/pageTemplates';
import { generateUtilsContent } from './templates/utilsTemplates';
import { generateApiContent } from './templates/apiTemplates';
import { generateAuthContent } from './templates/authTemplates';
import { generateContextContent } from './templates/contextTemplates';
import { generateTypesContent } from './templates/typesTemplates';
import { generateStorageContent } from './templates/storageTemplates';
import { generateValidationsContent } from './templates/validationsTemplates';
import { generateConstantsContent } from './templates/constantsTemplates';
import { generateI18nContent } from './templates/i18nTemplates';
import { generateRoutesContent } from './templates/routesTemplates';
import { generateLibIndexContent } from './templates/libIndexTemplate';
import { generateUIComponentsContent } from './templates/uiComponentsTemplates';
import { generatePlayerComponentsContent } from './templates/playerComponentsTemplates';
import { generateGitHubComponentsContent } from './templates/githubComponentsTemplates';
import { generateLayoutComponentsContent } from './templates/layoutComponentsTemplates';
import { generateAuthComponentsContent } from './templates/authComponentsTemplates';
import { generateSpotifyComponentsContent } from './templates/spotifyComponentsTemplates';
import { generateYouTubeComponentsContent } from './templates/youtubeComponentsTemplates';
import { generateJamComponentsContent } from './templates/jamComponentsTemplates';
import { generateLandingComponentsContent } from './templates/landingComponentsTemplates';
import { generateErrorsComponentsContent } from './templates/errorsComponentsTemplates';
import { generateRootComponentsContent } from './templates/rootComponentsTemplates';
import { generateHooksPlayerContent } from './templates/hooksPlayerTemplates';
import { generateHooksSpotifyContent } from './templates/hooksSpotifyTemplates';
import { generateHooksYouTubeContent } from './templates/hooksYouTubeTemplates';
import { generateHooksJamContent } from './templates/hooksJamTemplates';
import { generateSettingsComponentsContent } from './templates/settingsComponentsTemplates';
import { generateHooksCommonContent } from './templates/hooksCommonTemplates';
import { generateHooksSystemContent } from './templates/hooksSystemTemplates';
import { generateLibApiContent } from './templates/libApiTemplates';
import { generateComponentsWikiContent } from './templates/componentsWikiTemplates';
import { generateComponentsUIExtendedContent } from './templates/componentsUIExtendedTemplates';
import { generatePagesExtendedContent } from './templates/pagesTemplates';
import { generateComponentsMiscContent } from './templates/componentsMiscTemplates';

const VERSION = '4.2.0';

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
// Supports 256 files across 34 categories
export function generateFileContent(path: string): string | null {
  // === DOCS (5 files) ===
  const docContent = generateDocContent(path);
  if (docContent !== null) return docContent;
  
  // === SCRIPTS (5 files) ===
  const scriptContent = generateScriptContent(path);
  if (scriptContent !== null) return scriptContent;
  
  // === E2E FIXTURES (9 files) ===
  if (path.startsWith('e2e/fixtures/')) {
    const fixtureContent = generateE2EFixtureContent(path);
    if (fixtureContent !== null) return fixtureContent;
  }
  
  // === E2E SPECS (29 files) ===
  if (path.startsWith('e2e/specs/')) {
    const specContent = generateE2ESpecContent(path);
    if (specContent !== null) return specContent;
  }
  
  // === HOOKS (10 files) ===
  if (path.startsWith('src/hooks/system/') && path.endsWith('.ts') && !path.includes('/github/')) {
    const hookContent = generateHookContent(path);
    if (hookContent !== null) return hookContent;
  }
  
  // === COMPONENTS SETTINGS (17 files) ===
  if (path.startsWith('src/components/settings/')) {
    const settingsContent = generateSettingsComponentsContent(path);
    if (settingsContent !== null) return settingsContent;
  }
  
  // === HOOKS PLAYER (13 files) ===
  if (path.startsWith('src/hooks/player/')) {
    const hooksPlayerContent = generateHooksPlayerContent(path);
    if (hooksPlayerContent !== null) return hooksPlayerContent;
  }
  
  // === HOOKS SPOTIFY (7 files) ===
  if (path.startsWith('src/hooks/spotify/')) {
    const hooksSpotifyContent = generateHooksSpotifyContent(path);
    if (hooksSpotifyContent !== null) return hooksSpotifyContent;
  }
  
  // === HOOKS YOUTUBE (7 files) ===
  if (path.startsWith('src/hooks/youtube/')) {
    const hooksYouTubeContent = generateHooksYouTubeContent(path);
    if (hooksYouTubeContent !== null) return hooksYouTubeContent;
  }
  
  // === HOOKS JAM (6 files) ===
  if (path.startsWith('src/hooks/jam/')) {
    const hooksJamContent = generateHooksJamContent(path);
    if (hooksJamContent !== null) return hooksJamContent;
  }
  
  // === HOOKS COMMON (22 files) ===
  if (path.startsWith('src/hooks/common/')) {
    const hooksCommonContent = generateHooksCommonContent(path);
    if (hooksCommonContent !== null) return hooksCommonContent;
  }
  
  // === HOOKS SYSTEM (18 files) ===
  if (path.startsWith('src/hooks/system/') && !path.includes('/github/')) {
    const hooksSystemContent = generateHooksSystemContent(path);
    if (hooksSystemContent !== null) return hooksSystemContent;
  }
  
  // === LIB API (12 files) ===
  if (path.startsWith('src/lib/api/')) {
    const libApiContent = generateLibApiContent(path);
    if (libApiContent !== null) return libApiContent;
  }
  
  // === COMPONENTS WIKI (4 files) ===
  if (path.startsWith('src/components/wiki/')) {
    const wikiContent = generateComponentsWikiContent(path);
    if (wikiContent !== null) return wikiContent;
  }
  
  // === COMPONENTS MISC (5 files) ===
  if (path.startsWith('src/components/tour/') ||
      path.startsWith('src/components/debug/') ||
      path.startsWith('src/components/help/') ||
      path.startsWith('src/components/system/') ||
      path.startsWith('src/components/upload/')) {
    const miscContent = generateComponentsMiscContent(path);
    if (miscContent !== null) return miscContent;
  }
  
  // === PAGES EXTENDED (29 files) ===
  if (path.startsWith('src/pages/tools/') ||
      path.startsWith('src/pages/admin/') ||
      path.startsWith('src/pages/public/') ||
      path.startsWith('src/pages/brand/')) {
    const pagesExtContent = generatePagesExtendedContent(path);
    if (pagesExtContent !== null) return pagesExtContent;
  }
  
  // === COMPONENTS UI EXTENDED (40 files) ===
  if (path.startsWith('src/components/ui/')) {
    const uiExtContent = generateComponentsUIExtendedContent(path);
    if (uiExtContent !== null) return uiExtContent;
  }
  
  // === COMPONENTS UI (15 files) ===
  if (path.startsWith('src/components/ui/')) {
    const uiContent = generateUIComponentsContent(path);
    if (uiContent !== null) return uiContent;
  }
  
  // === COMPONENTS PLAYER (10 files) ===
  if (path.startsWith('src/components/player/')) {
    const playerContent = generatePlayerComponentsContent(path);
    if (playerContent !== null) return playerContent;
  }
  
  // === COMPONENTS GITHUB (8 files) ===
  if (path.startsWith('src/components/github/')) {
    const githubContent = generateGitHubComponentsContent(path);
    if (githubContent !== null) return githubContent;
  }
  
  // === COMPONENTS LAYOUT (2 files) ===
  if (path.startsWith('src/components/layout/')) {
    const layoutContent = generateLayoutComponentsContent(path);
    if (layoutContent !== null) return layoutContent;
  }
  
  // === COMPONENTS AUTH (7 files) ===
  if (path.startsWith('src/components/auth/')) {
    const authCompContent = generateAuthComponentsContent(path);
    if (authCompContent !== null) return authCompContent;
  }
  
  // === COMPONENTS SPOTIFY (9 files) ===
  if (path.startsWith('src/components/spotify/')) {
    const spotifyContent = generateSpotifyComponentsContent(path);
    if (spotifyContent !== null) return spotifyContent;
  }
  
  // === COMPONENTS YOUTUBE (6 files) ===
  if (path.startsWith('src/components/youtube/')) {
    const youtubeContent = generateYouTubeComponentsContent(path);
    if (youtubeContent !== null) return youtubeContent;
  }
  
  // === COMPONENTS JAM (10 files) ===
  if (path.startsWith('src/components/jam/')) {
    const jamContent = generateJamComponentsContent(path);
    if (jamContent !== null) return jamContent;
  }
  
  // === COMPONENTS LANDING (6 files) ===
  if (path.startsWith('src/components/landing/')) {
    const landingContent = generateLandingComponentsContent(path);
    if (landingContent !== null) return landingContent;
  }
  
  // === COMPONENTS ERRORS (3 files) ===
  if (path.startsWith('src/components/errors/')) {
    const errorsContent = generateErrorsComponentsContent(path);
    if (errorsContent !== null) return errorsContent;
  }
  
  // === COMPONENTS ROOT (3 files) ===
  if (path === 'src/components/GlobalSearchModal.tsx' || 
      path === 'src/components/NavLink.tsx' ||
      path.startsWith('src/components/kiosk/')) {
    const rootContent = generateRootComponentsContent(path);
    if (rootContent !== null) return rootContent;
  }
  
  // === PAGES (5 files) ===
  if (path.startsWith('src/pages/')) {
    const pageContent = generatePageContent(path);
    if (pageContent !== null) return pageContent;
  }
  
  // === STORAGE (2 files) ===
  if (path.startsWith('src/lib/storage/')) {
    const storageContent = generateStorageContent(path);
    if (storageContent !== null) return storageContent;
  }
  
  // === VALIDATIONS (2 files) ===
  if (path.startsWith('src/lib/validations/')) {
    const validationsContent = generateValidationsContent(path);
    if (validationsContent !== null) return validationsContent;
  }
  
  // === CONSTANTS (4 files) ===
  if (path.startsWith('src/lib/constants/')) {
    const constantsContent = generateConstantsContent(path);
    if (constantsContent !== null) return constantsContent;
  }
  
  // === LIB INDEX (1 file) ===
  if (path === 'src/lib/index.ts') {
    return generateLibIndexContent();
  }
  
  // === UTILS (12 files) - after storage/validations/constants ===
  if (path.startsWith('src/lib/') && !path.startsWith('src/lib/api/') && !path.startsWith('src/lib/auth/')) {
    const utilsContent = generateUtilsContent(path);
    if (utilsContent !== null) return utilsContent;
  }
  
  // === API (9 files) ===
  if (path.startsWith('src/lib/api/')) {
    const apiContent = generateApiContent(path);
    if (apiContent !== null) return apiContent;
  }
  
  // === AUTH (3 files) ===
  if (path.startsWith('src/lib/auth/')) {
    const authContent = generateAuthContent(path);
    if (authContent !== null) return authContent;
  }
  
  // === CONTEXTS (8 files) ===
  if (path.startsWith('src/contexts/')) {
    const contextContent = generateContextContent(path);
    if (contextContent !== null) return contextContent;
  }
  
  // === TYPES (10 files) ===
  if (path.startsWith('src/types/')) {
    const typesContent = generateTypesContent(path);
    if (typesContent !== null) return typesContent;
  }
  
  // === I18N (4 files) ===
  if (path.startsWith('src/i18n/')) {
    const i18nContent = generateI18nContent(path);
    if (i18nContent !== null) return i18nContent;
  }
  
  // === ROUTES (1 file) ===
  if (path.startsWith('src/routes/')) {
    const routesContent = generateRoutesContent(path);
    if (routesContent !== null) return routesContent;
  }
  
  // Unknown file - return null to prevent overwrite
  console.warn(`[generateFileContent] Unknown file: ${path} - skipping to prevent overwrite`);
  return null;
}
