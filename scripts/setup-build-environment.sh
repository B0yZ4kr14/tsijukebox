#!/bin/bash

################################################################################
# TSiJUKEBOX - Build Environment Setup & Fix Script
# 
# Purpose: Automatically fix all dependency issues and prepare build environment
# Version: 1.1.0
# Author: TSiJUKEBOX DevOps Team
# Date: December 23, 2025
# 
# Usage:
#   chmod +x scripts/setup-build-environment.sh
#   ./scripts/setup-build-environment.sh
#   OR
#   bash scripts/setup-build-environment.sh
#
# Features:
#   - Detect system and validate Node.js/npm versions
#   - Clear npm cache and reinstall dependencies
#   - Detect and install missing @radix-ui packages
#   - Fix vulnerable packages
#   - Run comprehensive build test
#   - Generate detailed report
#
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}║ ${MAGENTA}$1${BLUE} ${BLUE}║${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Script metadata
SCRIPT_VERSION="1.1.0"
START_TIME=$(date +%s)
REPORT_FILE="setup-build-report-$(date +%Y%m%d-%H%M%S).log"

# Counter variables
STEPS_COMPLETED=0
TOTAL_STEPS=8

################################################################################
# STEP 1: Initialize and Validate Environment
################################################################################
step_validate_environment() {
    local step_num=1
    log_header "STEP $step_num/$TOTAL_STEPS: Validating Environment"
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS_TYPE="Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS_TYPE="macOS"
    elif [[ "$OSTYPE" == "msys" ]]; then
        OS_TYPE="Windows (Git Bash)"
    else
        OS_TYPE="Unknown: $OSTYPE"
    fi
    
    log_info "Operating System: $OS_TYPE"
    log_info "Current Shell: $SHELL"
    log_info "User: $USER"
    log_info "Working Directory: $(pwd)"
    echo ""
    
    # Validate Node.js
    log_step "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed!"
        log_info "Please install Node.js from https://nodejs.org/ (v16+)"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    log_success "Node.js found: $NODE_VERSION"
    
    # Validate npm
    log_step "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed!"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    log_success "npm found: $NPM_VERSION"
    
    # Check package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found in current directory!"
        log_info "Please run this script from the project root directory"
        exit 1
    fi
    
    log_success "package.json found"
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 2: Backup Current State
################################################################################
step_backup_state() {
    local step_num=2
    log_header "STEP $step_num/$TOTAL_STEPS: Backing Up Current State"
    
    BACKUP_DIR=".backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    log_step "Creating backup of package.json..."
    if [ -f "package.json" ]; then
        cp package.json "$BACKUP_DIR/package.json.bak"
        log_success "Backed up to $BACKUP_DIR/package.json.bak"
    fi
    
    log_step "Creating backup of package-lock.json..."
    if [ -f "package-lock.json" ]; then
        cp package-lock.json "$BACKUP_DIR/package-lock.json.bak"
        log_success "Backed up to $BACKUP_DIR/package-lock.json.bak"
    fi
    
    log_info "Backup directory: $BACKUP_DIR"
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 3: Clear npm Cache
################################################################################
step_clean_npm() {
    local step_num=3
    log_header "STEP $step_num/$TOTAL_STEPS: Cleaning npm Cache"
    
    log_step "Clearing npm cache..."
    npm cache clean --force > /dev/null 2>&1
    log_success "npm cache cleared"
    
    log_step "Removing node_modules directory..."
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        log_success "node_modules removed"
    else
        log_info "node_modules directory not found (OK)"
    fi
    
    log_step "Removing package-lock.json..."
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        log_success "package-lock.json removed"
    else
        log_info "package-lock.json not found (OK)"
    fi
    
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 4: Detect and Install Missing @radix-ui Dependencies
################################################################################
step_detect_and_install_missing_deps() {
    local step_num=4
    log_header "STEP $step_num/$TOTAL_STEPS: Detecting & Installing Missing Dependencies"
    
    # Array of common @radix-ui packages needed by shadcn/ui
    declare -a RADIX_PACKAGES=(
        "@radix-ui/react-alert-dialog"
        "@radix-ui/react-arrow"
        "@radix-ui/react-aspect-ratio"
        "@radix-ui/react-checkbox"
        "@radix-ui/react-collapsible"
        "@radix-ui/react-context-menu"
        "@radix-ui/react-context"
        "@radix-ui/react-dialog"
        "@radix-ui/react-direction"
        "@radix-ui/react-dropdown-menu"
        "@radix-ui/react-hover-card"
        "@radix-ui/react-label"
        "@radix-ui/react-menubar"
        "@radix-ui/react-navigation-menu"
        "@radix-ui/react-popover"
        "@radix-ui/react-primitive"
        "@radix-ui/react-progress"
        "@radix-ui/react-radio-group"
        "@radix-ui/react-scroll-area"
        "@radix-ui/react-select"
        "@radix-ui/react-separator"
        "@radix-ui/react-slider"
        "@radix-ui/react-slot"
        "@radix-ui/react-switch"
        "@radix-ui/react-tabs"
        "@radix-ui/react-toast"
        "@radix-ui/react-toggle"
        "@radix-ui/react-toggle-group"
        "@radix-ui/react-tooltip"
        "@radix-ui/react-accordion"
        "@radix-ui/react-avatar"
        "@radix-ui/react-use-callback-ref"
        "@radix-ui/react-use-controllable-state"
        "@radix-ui/react-use-escape-keydown"
        "@radix-ui/react-use-layout-effect"
        "@radix-ui/react-use-prev"
        "@radix-ui/react-use-size"
    )
    
    log_step "Checking for missing @radix-ui packages in package.json..."
    
    MISSING_PACKAGES=()
    for package in "${RADIX_PACKAGES[@]}"; do
        if ! grep -q "$package" package.json 2>/dev/null; then
            MISSING_PACKAGES+=("$package")
        fi
    done
    
    if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
        log_success "All @radix-ui packages are declared"
    else
        log_warning "Found ${#MISSING_PACKAGES[@]} missing @radix-ui packages"
        for package in "${MISSING_PACKAGES[@]}"; do
            echo "  - $package"
        done
        echo ""
        
        log_step "Installing missing @radix-ui packages..."
        npm install "${MISSING_PACKAGES[@]}" --save --legacy-peer-deps
        log_success "Missing @radix-ui packages installed!"
    fi
    
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 5: Install Dependencies
################################################################################
step_install_dependencies() {
    local step_num=5
    log_header "STEP $step_num/$TOTAL_STEPS: Installing All Dependencies"
    
    log_step "Running 'npm install' with clean state..."
    npm install --legacy-peer-deps
    
    log_success "Dependencies installed successfully"
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 6: Fix Security Vulnerabilities
################################################################################
step_fix_vulnerabilities() {
    local step_num=6
    log_header "STEP $step_num/$TOTAL_STEPS: Addressing Security Vulnerabilities"
    
    log_step "Running npm audit..."
    AUDIT_OUTPUT=$(npm audit 2>&1 || true)
    VULN_COUNT=$(echo "$AUDIT_OUTPUT" | grep -oP '\d+(?= vulnerabilities)' || echo "0")
    
    if [ "$VULN_COUNT" != "0" ] && [ -n "$VULN_COUNT" ]; then
        log_warning "Found $VULN_COUNT vulnerabilities"
        log_step "Attempting to fix vulnerabilities..."
        npm audit fix --force 2>&1 || true
        log_info "Vulnerabilities addressed (see npm audit for details)"
    else
        log_success "No vulnerabilities found"
    fi
    
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 7: Verify Build Configuration
################################################################################
step_verify_build_config() {
    local step_num=7
    log_header "STEP $step_num/$TOTAL_STEPS: Verifying Build Configuration"
    
    log_step "Checking tsconfig.json..."
    if [ -f "tsconfig.json" ]; then
        log_success "tsconfig.json found"
    else
        log_warning "tsconfig.json not found"
    fi
    
    log_step "Checking vite.config.ts..."
    if [ -f "vite.config.ts" ]; then
        log_success "vite.config.ts found"
    elif [ -f "vite.config.js" ]; then
        log_success "vite.config.js found"
    else
        log_warning "vite.config not found"
    fi
    
    log_step "Checking tailwind.config.ts..."
    if [ -f "tailwind.config.ts" ]; then
        log_success "tailwind.config.ts found"
    elif [ -f "tailwind.config.js" ]; then
        log_success "tailwind.config.js found"
    else
        log_warning "tailwind.config not found"
    fi
    
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# STEP 8: Build Project
################################################################################
step_build_project() {
    local step_num=8
    log_header "STEP $step_num/$TOTAL_STEPS: Building Project"
    
    log_step "Running production build..."
    if npm run build; then
        log_success "Build completed successfully!"
        BUILD_SUCCESS=true
    else
        log_error "Build failed!"
        BUILD_SUCCESS=false
    fi
    
    echo ""
    STEPS_COMPLETED=$((STEPS_COMPLETED + 1))
}

################################################################################
# Generate Report
################################################################################
generate_report() {
    log_header "📋 SETUP REPORT"
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo -e "${CYAN}Script Version: $SCRIPT_VERSION${NC}"
    echo -e "${CYAN}Execution Date: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}Duration: ${DURATION}s${NC}"
    echo -e "${CYAN}Steps Completed: $STEPS_COMPLETED/$TOTAL_STEPS${NC}"
    echo -e "${CYAN}Backup Directory: $BACKUP_DIR${NC}"
    echo ""
    
    if [ "$BUILD_SUCCESS" = true ]; then
        log_success "✨ BUILD SUCCESSFUL!"
        log_info "Your project is ready to run!"
        echo ""
        log_info "Next commands:"
        echo "  • Development server: npm run dev"
        echo "  • Preview build: npm run preview"
        echo "  • Run tests: npm run test"
        echo "  • Run e2e tests: npm run test:e2e"
    else
        log_error "❌ BUILD FAILED"
        log_warning "Please check the error messages above"
    fi
    
    echo ""
    log_header "📝 SYSTEM INFORMATION"
    echo "Node.js: $NODE_VERSION"
    echo "npm: $NPM_VERSION"
    echo "OS: $OS_TYPE"
    echo "Shell: $SHELL"
    echo ""
}

################################################################################
# Cleanup on Error
################################################################################
cleanup_on_error() {
    log_error "\n😞 Setup script encountered an error!"
    log_info "Your previous state has been backed up to: $BACKUP_DIR"
    log_warning "To restore, run: cp $BACKUP_DIR/*.bak ."
    exit 1
}

trap cleanup_on_error ERR

################################################################################
# Main Execution
################################################################################
main() {
    clear
    
    echo ""
    echo -e "${MAGENTA}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║       🎵 TSiJUKEBOX - Build Environment Setup 🎵       ║"
    echo "║                                                        ║"
    echo "║              Autonomous Setup & Fix Script             ║"
    echo "║                    Version $SCRIPT_VERSION                     ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    log_info "Starting comprehensive build environment setup..."
    echo ""
    
    # Execute all steps
    step_validate_environment
    step_backup_state
    step_clean_npm
    step_detect_and_install_missing_deps
    step_install_dependencies
    step_fix_vulnerabilities
    step_verify_build_config
    step_build_project
    
    # Generate final report
    generate_report
    
    echo ""
    log_header "✅ SETUP COMPLETE"
    echo ""
}

# Run main function
main "$@"
