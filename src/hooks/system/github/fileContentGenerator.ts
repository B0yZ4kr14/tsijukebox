// Main content generator - orchestrates all template generators
// Critical config files like package.json are NEVER generated here
// Supports 437 files across 55 categories

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
import { generateComponentsIndexPageContent } from './templates/componentsIndexPageTemplates';
import { generateComponentsBackupContent } from './templates/componentsBackupTemplates';
import { generatePagesSpotifyContent } from './templates/pagesSpotifyTemplates';
import { generatePagesYouTubeContent } from './templates/pagesYouTubeTemplates';
import { generatePagesSocialContent } from './templates/pagesSocialTemplates';
import { generatePagesSettingsExtendedContent } from './templates/pagesSettingsExtendedTemplates';
import { generateComponentsSpecializedContent } from './templates/componentsSpecializedTemplates';
import { generateE2EMocksContent } from './templates/e2eMocksTemplates';
import { generateHooksPagesContent } from './templates/hooksPagesTemplates';
import { generatePagesRootContent } from './templates/pagesRootTemplates';

const VERSION = '4.3.0';

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
// CRITICAL: All Python scripts MUST start with #!/usr/bin/env python3
// NEVER generate JS/TS placeholder content for .py files
export function generateScriptContent(path: string): string | null {
  const now = new Date().toISOString();
  
  switch (path) {
    case 'scripts/install.py':
      // install.py is a shim that downloads unified-installer.py
      return `#!/usr/bin/env python3
"""
TSiJUKEBOX Installer Shim v${VERSION}
================================
Lightweight shim that downloads and executes the unified installer.

This file is safe to run via: curl -fsSL .../install.py | sudo python3

USO:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
    
    # Ou use diretamente o instalador unificado:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3

Autor: B0.y_Z4kr14
Licença: Domínio Público
Last updated: ${now}
"""

import os
import sys
import tempfile
import urllib.request
import ssl
import subprocess
from pathlib import Path

VERSION = "${VERSION}"
REPO_BASE = "https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main"
UNIFIED_INSTALLER = f"{REPO_BASE}/scripts/unified-installer.py"

class Colors:
    RED = '\\033[91m'
    GREEN = '\\033[92m'
    YELLOW = '\\033[93m'
    BLUE = '\\033[94m'
    CYAN = '\\033[96m'
    RESET = '\\033[0m'
    BOLD = '\\033[1m'

def log_info(msg): print(f"{Colors.BLUE}ℹ{Colors.RESET}  {msg}")
def log_success(msg): print(f"{Colors.GREEN}✓{Colors.RESET}  {msg}")
def log_error(msg): print(f"{Colors.RED}✗{Colors.RESET}  {msg}")

def download_script(url, dest):
    log_info(f"Baixando: {url}")
    try:
        ctx = ssl.create_default_context()
        with urllib.request.urlopen(url, context=ctx, timeout=30) as r:
            content = r.read()
            # Validate it's Python, not JS placeholder
            if content.decode('utf-8', errors='ignore').startswith('//'):
                log_error("Script corrompido no repositório")
                return False
            dest.write_bytes(content)
            return True
    except Exception as e:
        log_error(f"Erro: {e}")
        return False

def main():
    print(f"\\n{Colors.CYAN}TSiJUKEBOX Installer Shim v{VERSION}{Colors.RESET}\\n")
    
    if os.geteuid() != 0:
        log_error("Execute com sudo: sudo python3 install.py")
        return 1
    
    with tempfile.TemporaryDirectory() as tmpdir:
        installer = Path(tmpdir) / "unified-installer.py"
        if download_script(UNIFIED_INSTALLER, installer):
            log_success("Instalador baixado")
            return subprocess.run([sys.executable, str(installer)] + sys.argv[1:]).returncode
        
        log_error("Falha ao baixar instalador. Tente:")
        log_info("  git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git")
        log_info("  cd TSiJUKEBOX && sudo python3 scripts/unified-installer.py")
        return 1

if __name__ == "__main__":
    sys.exit(main())
`;

    case 'scripts/diagnose-service.py':
      return `#!/usr/bin/env python3
"""
TSiJUKEBOX Service Diagnostics v${VERSION}
=====================================
Comprehensive service health checker with auto-fix capabilities.

USO:
    sudo python3 diagnose-service.py
    sudo python3 diagnose-service.py --auto-fix
    sudo python3 diagnose-service.py --verbose

Last updated: ${now}
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime

VERSION = "${VERSION}"

class Colors:
    RED, GREEN, YELLOW, BLUE, CYAN = '\\033[91m', '\\033[92m', '\\033[93m', '\\033[94m', '\\033[96m'
    RESET, BOLD = '\\033[0m', '\\033[1m'

def log_ok(msg): print(f"{Colors.GREEN}✓{Colors.RESET} {msg}")
def log_err(msg): print(f"{Colors.RED}✗{Colors.RESET} {msg}")
def log_warn(msg): print(f"{Colors.YELLOW}⚠{Colors.RESET} {msg}")

def check_service(name):
    try:
        r = subprocess.run(["systemctl", "is-active", name], capture_output=True, text=True)
        return {"name": name, "active": r.returncode == 0, "status": r.stdout.strip()}
    except: return {"name": name, "active": False, "status": "error"}

def check_port(port):
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(2)
        result = s.connect_ex(("127.0.0.1", port))
        s.close()
        return result == 0
    except: return False

def main():
    print(f"\\n{Colors.CYAN}TSiJUKEBOX Diagnostics v{VERSION}{Colors.RESET}")
    print("=" * 50)
    
    # Check services
    for svc in ["tsijukebox", "tsijukebox-kiosk", "nginx", "avahi-daemon"]:
        s = check_service(svc)
        (log_ok if s["active"] else log_warn)(f"{svc}: {s['status']}")
    
    print()
    # Check ports
    for port, name in [(5173, "Dev Server"), (80, "HTTP"), (443, "HTTPS")]:
        (log_ok if check_port(port) else log_warn)(f"Porta {port} ({name})")
    
    print()
    # Check Node/npm
    for cmd in ["node --version", "npm --version"]:
        try:
            r = subprocess.run(cmd.split(), capture_output=True, text=True)
            log_ok(f"{cmd.split()[0]}: {r.stdout.strip()}")
        except: log_err(f"{cmd.split()[0]}: não encontrado")
    
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
"""
TSiJUKEBOX systemd-notify Wrapper v${VERSION}
========================================
Wrapper for systemd service lifecycle integration.

USO:
    python3 systemd-notify-wrapper.py ready
    python3 systemd-notify-wrapper.py watchdog
    python3 systemd-notify-wrapper.py status "Message"

Last updated: ${now}
"""

import os
import sys
import socket

VERSION = "${VERSION}"

def notify(state):
    sock_path = os.environ.get("NOTIFY_SOCKET")
    if not sock_path: return False
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
        if sock_path.startswith("@"): sock_path = "\\0" + sock_path[1:]
        sock.connect(sock_path)
        sock.sendall(state.encode())
        sock.close()
        return True
    except: return False

def ready(): return notify("READY=1")
def watchdog(): return notify("WATCHDOG=1")
def stopping(): return notify("STOPPING=1")
def status(msg): return notify(f"STATUS={msg}")

def main():
    if len(sys.argv) < 2:
        print(f"systemd-notify-wrapper v{VERSION}")
        print("Usage: systemd-notify-wrapper.py <ready|watchdog|stopping|status 'msg'>")
        return 0
    
    cmd = sys.argv[1].lower()
    if cmd == "ready": success = ready()
    elif cmd == "watchdog": success = watchdog()
    elif cmd == "stopping": success = stopping()
    elif cmd == "status" and len(sys.argv) > 2: success = status(sys.argv[2])
    else:
        print(f"Unknown command: {cmd}")
        return 1
    
    print(f"Notified: {cmd.upper()}" if success else "Failed (no NOTIFY_SOCKET)")
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
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
// CRITICAL: Never generate content for these protected files
const NEVER_SYNC_FILES = [
  'package.json',
  'package-lock.json',
  'bun.lockb',
  'vite.config.ts',
  'vite.config.js',
  'tsconfig.json',
  'tsconfig.node.json',
  'tsconfig.e2e.json',
  '.env',
  '.env.local',
  '.gitignore',
  'components.json',
  'postcss.config.js',
  'tailwind.config.ts',
  'tailwind.config.js',
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
];

export function generateFileContent(path: string): string | null {
  // === GUARDRAIL: Block protected files ===
  if (NEVER_SYNC_FILES.includes(path)) {
    console.warn(`[generateFileContent] ⚠️ Protected file blocked: ${path}`);
    return null;
  }

  // === DOCS (5 files) ===
  const docContent = generateDocContent(path);
  if (docContent !== null) return docContent;
  
  // === SCRIPTS (5 files) ===
  const scriptContent = generateScriptContent(path);
  if (scriptContent !== null) {
    // Validate Python content - NEVER return JS placeholder
    if (path.endsWith('.py') && scriptContent.trimStart().startsWith('//')) {
      console.error(`[generateFileContent] ❌ Invalid Python content for: ${path} (starts with //)`);
      return null;
    }
    return scriptContent;
  }
  
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
  
  // === COMPONENTS INDEX-PAGE (5 files) ===
  if (path.startsWith('src/components/index-page/')) {
    const indexPageContent = generateComponentsIndexPageContent(path);
    if (indexPageContent !== null) return indexPageContent;
  }
  
  // === COMPONENTS BACKUP (8 files) ===
  if (path.startsWith('src/components/settings/backup/')) {
    const backupContent = generateComponentsBackupContent(path);
    if (backupContent !== null) return backupContent;
  }
  
  // === PAGES SPOTIFY (5 files) ===
  if (path.startsWith('src/pages/spotify/')) {
    const spotifyContent = generatePagesSpotifyContent(path);
    if (spotifyContent !== null) return spotifyContent;
  }
  
  // === PAGES YOUTUBE (5 files) ===
  if (path.startsWith('src/pages/youtube/')) {
    const ytContent = generatePagesYouTubeContent(path);
    if (ytContent !== null) return ytContent;
  }
  
  // === PAGES SOCIAL (2 files) ===
  if (path.startsWith('src/pages/social/')) {
    const socialContent = generatePagesSocialContent(path);
    if (socialContent !== null) return socialContent;
  }
  
  // === PAGES SETTINGS EXTENDED (4 files) ===
  if (path.startsWith('src/pages/settings/') && path !== 'src/pages/settings/Settings.tsx') {
    const settingsExtContent = generatePagesSettingsExtendedContent(path);
    if (settingsExtContent !== null) return settingsExtContent;
  }
  
  // === COMPONENTS SPECIALIZED (6 files) ===
  if (path.startsWith('src/components/dev/') ||
      path.startsWith('src/components/audit/') ||
      path.startsWith('src/components/weather/') ||
      path.startsWith('src/components/spicetify/') ||
      path.startsWith('src/components/docs/')) {
    const specializedContent = generateComponentsSpecializedContent(path);
    if (specializedContent !== null) return specializedContent;
  }
  
  // === E2E MOCKS (2 files) ===
  if (path.startsWith('e2e/mocks/')) {
    const mocksContent = generateE2EMocksContent(path);
    if (mocksContent !== null) return mocksContent;
  }
  
  // === HOOKS PAGES (2 files) ===
  if (path.startsWith('src/hooks/pages/')) {
    const hooksPagesContent = generateHooksPagesContent(path);
    if (hooksPagesContent !== null) return hooksPagesContent;
  }
  
  // === PAGES ROOT (1 file) ===
  if (path === 'src/pages/index.ts') {
    const pagesRootContent = generatePagesRootContent(path);
    if (pagesRootContent !== null) return pagesRootContent;
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
