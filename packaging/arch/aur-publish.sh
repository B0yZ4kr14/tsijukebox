#!/bin/bash
# =============================================================================
# TSiJUKEBOX Enterprise - AUR Publisher
# Publishes package to Arch User Repository
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKGNAME="tsijukebox"
AUR_URL="ssh://aur@aur.archlinux.org/${PKGNAME}.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

show_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║            TSiJUKEBOX Enterprise - AUR Publisher              ║"
    echo "║                    Arch User Repository                        ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --init          Initialize new AUR package (first time only)"
    echo "  --update        Update existing AUR package"
    echo "  --test          Test build without publishing"
    echo "  --clean         Clean build artifacts"
    echo "  --help          Show this help message"
    echo ""
    echo "Requirements:"
    echo "  - SSH key configured for AUR (aur.archlinux.org)"
    echo "  - AUR account with package ownership"
    echo "  - Valid PKGBUILD and .SRCINFO"
    echo ""
    echo "Example:"
    echo "  $0 --init       # First time setup"
    echo "  $0 --update     # Push updates"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check SSH key
    if [[ ! -f ~/.ssh/id_rsa && ! -f ~/.ssh/id_ed25519 ]]; then
        log_error "No SSH key found. Generate one with: ssh-keygen -t ed25519"
        log_info "Then add it to your AUR account at https://aur.archlinux.org"
        exit 1
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git not found. Install with: sudo pacman -S git"
        exit 1
    fi
    
    # Check PKGBUILD
    if [[ ! -f "${SCRIPT_DIR}/PKGBUILD" ]]; then
        log_error "PKGBUILD not found!"
        exit 1
    fi
    
    # Check .SRCINFO
    if [[ ! -f "${SCRIPT_DIR}/.SRCINFO" ]]; then
        log_warn ".SRCINFO not found. Generating..."
        "${SCRIPT_DIR}/generate-srcinfo.sh"
    fi
    
    log_success "All requirements met"
}

test_build() {
    log_info "Testing package build..."
    
    cd "$SCRIPT_DIR"
    
    # Create temporary build directory
    TEMP_DIR=$(mktemp -d)
    cp PKGBUILD .SRCINFO "$TEMP_DIR/"
    
    cd "$TEMP_DIR"
    
    # Test namcap (if available)
    if command -v namcap &> /dev/null; then
        log_info "Running namcap analysis..."
        namcap PKGBUILD || true
    fi
    
    # Test build (source only)
    log_info "Testing PKGBUILD parsing..."
    if makepkg --printsrcinfo > /dev/null 2>&1; then
        log_success "PKGBUILD is valid"
    else
        log_error "PKGBUILD has errors"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    rm -rf "$TEMP_DIR"
    log_success "Build test passed!"
}

init_aur() {
    log_info "Initializing new AUR package..."
    
    cd "$SCRIPT_DIR"
    
    # Clone empty AUR repo
    AUR_DIR="${SCRIPT_DIR}/aur-repo"
    
    if [[ -d "$AUR_DIR" ]]; then
        log_warn "AUR directory exists. Removing..."
        rm -rf "$AUR_DIR"
    fi
    
    log_info "Cloning AUR repository..."
    if git clone "$AUR_URL" "$AUR_DIR" 2>/dev/null; then
        log_success "Cloned existing AUR package"
    else
        log_info "Creating new AUR package..."
        mkdir -p "$AUR_DIR"
        cd "$AUR_DIR"
        git init
        git remote add origin "$AUR_URL"
    fi
    
    # Copy files
    cd "$AUR_DIR"
    cp "${SCRIPT_DIR}/PKGBUILD" .
    cp "${SCRIPT_DIR}/.SRCINFO" .
    
    # Commit
    git add PKGBUILD .SRCINFO
    git commit -m "Initial commit: ${PKGNAME} v$(grep pkgver PKGBUILD | head -1 | cut -d= -f2)"
    
    # Push
    log_info "Pushing to AUR..."
    if git push -u origin master; then
        log_success "Package published to AUR!"
        log_info "View at: https://aur.archlinux.org/packages/${PKGNAME}"
    else
        log_error "Failed to push. Check your SSH key and AUR permissions."
        exit 1
    fi
}

update_aur() {
    log_info "Updating AUR package..."
    
    cd "$SCRIPT_DIR"
    
    AUR_DIR="${SCRIPT_DIR}/aur-repo"
    
    # Clone if not exists
    if [[ ! -d "$AUR_DIR" ]]; then
        log_info "Cloning AUR repository..."
        git clone "$AUR_URL" "$AUR_DIR"
    fi
    
    cd "$AUR_DIR"
    
    # Pull latest
    git pull origin master 2>/dev/null || true
    
    # Regenerate .SRCINFO
    "${SCRIPT_DIR}/generate-srcinfo.sh"
    
    # Copy updated files
    cp "${SCRIPT_DIR}/PKGBUILD" .
    cp "${SCRIPT_DIR}/.SRCINFO" .
    
    # Get version for commit message
    VERSION=$(grep "pkgver=" PKGBUILD | head -1 | cut -d= -f2)
    PKGREL=$(grep "pkgrel=" PKGBUILD | head -1 | cut -d= -f2)
    
    # Commit
    git add PKGBUILD .SRCINFO
    
    if git diff --cached --quiet; then
        log_info "No changes to commit"
    else
        git commit -m "Update to v${VERSION}-${PKGREL}"
        
        # Push
        log_info "Pushing to AUR..."
        if git push origin master; then
            log_success "AUR package updated to v${VERSION}-${PKGREL}!"
            log_info "View at: https://aur.archlinux.org/packages/${PKGNAME}"
        else
            log_error "Failed to push. Check your SSH key and AUR permissions."
            exit 1
        fi
    fi
}

clean_build() {
    log_info "Cleaning build artifacts..."
    
    cd "$SCRIPT_DIR"
    
    # Remove build artifacts
    rm -rf pkg/ src/ *.pkg.tar.* *.log
    rm -rf aur-repo/
    
    log_success "Cleaned!"
}

# Main
show_banner

case "${1:-}" in
    --init)
        check_requirements
        test_build
        init_aur
        ;;
    --update)
        check_requirements
        test_build
        update_aur
        ;;
    --test)
        check_requirements
        test_build
        ;;
    --clean)
        clean_build
        ;;
    --help|-h)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac
