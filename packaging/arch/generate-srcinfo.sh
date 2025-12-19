#!/bin/bash
# =============================================================================
# TSiJUKEBOX Enterprise - .SRCINFO Generator
# Automatically generates .SRCINFO from PKGBUILD for AUR submission
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKGBUILD="${SCRIPT_DIR}/PKGBUILD"
SRCINFO="${SCRIPT_DIR}/.SRCINFO"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if PKGBUILD exists
if [[ ! -f "$PKGBUILD" ]]; then
    log_error "PKGBUILD not found at: $PKGBUILD"
    exit 1
fi

# Check if makepkg is available
if ! command -v makepkg &> /dev/null; then
    log_error "makepkg not found. Install base-devel package."
    exit 1
fi

log_info "Generating .SRCINFO from PKGBUILD..."

# Navigate to the directory containing PKGBUILD
cd "$SCRIPT_DIR"

# Generate .SRCINFO using makepkg
if makepkg --printsrcinfo > "$SRCINFO" 2>/dev/null; then
    log_success ".SRCINFO generated successfully!"
    log_info "Output: $SRCINFO"
    
    # Display summary
    echo ""
    log_info "=== Package Summary ==="
    grep -E "^(pkgbase|pkgname|pkgver|pkgrel|pkgdesc)" "$SRCINFO" | head -10
    echo ""
else
    log_error "Failed to generate .SRCINFO"
    log_warn "Trying alternative method..."
    
    # Alternative: Parse PKGBUILD manually
    source "$PKGBUILD" 2>/dev/null || true
    
    cat > "$SRCINFO" << EOF
pkgbase = ${pkgname:-tsijukebox}
	pkgdesc = ${pkgdesc:-Enterprise Music System for Kiosk}
	pkgver = ${pkgver:-4.0.0}
	pkgrel = ${pkgrel:-1}
	url = ${url:-https://github.com/B0yZ4kr14/TSiJUKEBOX}
	arch = x86_64
	arch = aarch64
	license = ${license:-custom:public-domain}
EOF
    
    # Add depends
    for dep in "${depends[@]:-}"; do
        [[ -n "$dep" ]] && echo "	depends = $dep" >> "$SRCINFO"
    done
    
    # Add makedepends
    for dep in "${makedepends[@]:-}"; do
        [[ -n "$dep" ]] && echo "	makedepends = $dep" >> "$SRCINFO"
    done
    
    # Add source
    for src in "${source[@]:-}"; do
        [[ -n "$src" ]] && echo "	source = $src" >> "$SRCINFO"
    done
    
    echo "" >> "$SRCINFO"
    echo "pkgname = ${pkgname:-tsijukebox}" >> "$SRCINFO"
    
    log_success ".SRCINFO generated (alternative method)"
fi

# Validate .SRCINFO
if [[ -s "$SRCINFO" ]]; then
    log_success "Validation passed: .SRCINFO is not empty"
    
    # Check required fields
    required_fields=("pkgbase" "pkgver" "pkgrel" "arch")
    missing_fields=()
    
    for field in "${required_fields[@]}"; do
        if ! grep -q "^${field}\|^\t${field}" "$SRCINFO"; then
            missing_fields+=("$field")
        fi
    done
    
    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        log_warn "Missing fields: ${missing_fields[*]}"
    else
        log_success "All required fields present"
    fi
else
    log_error ".SRCINFO is empty!"
    exit 1
fi

echo ""
log_info "Done! Ready for AUR submission."
log_info "Run './aur-publish.sh' to publish to AUR"
