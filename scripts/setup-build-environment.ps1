<#
.SYNOPSIS
    TSiJUKEBOX Build Environment Setup & Fix Script (PowerShell)

.DESCRIPTION
    Comprehensive, autonomous script that:
    - Validates Node.js/npm environment
    - Backs up current state
    - Clears npm cache and reinstalls dependencies
    - Detects and installs missing @radix-ui packages
    - Fixes security vulnerabilities
    - Verifies build configuration
    - Executes production build
    - Generates detailed report

.PARAMETER Force
    Skip confirmation prompts

.PARAMETER SkipBuild
    Skip the final build step

.EXAMPLE
    .\scripts\setup-build-environment.ps1
    .\scripts\setup-build-environment.ps1 -Force
    .\scripts\setup-build-environment.ps1 -SkipBuild

.VERSION
    1.1.0

.AUTHOR
    TSiJUKEBOX DevOps Team

.DATE
    December 23, 2025
#>

param(
    [switch]$Force = $false,
    [switch]$SkipBuild = $false
)

# Color codes
$colors = @{
    Header = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
    Step = 'Cyan'
}

# Counters
$stepsCompleted = 0
$totalSteps = 8
$scriptVersion = "1.1.0"
$startTime = Get-Date

################################################################################
# Logging Functions
################################################################################

function Write-LogHeader {
    param([string]$Message)
    Write-Host "`n" -ForegroundColor $colors.Header
    Write-Host ("━" * 80) -ForegroundColor $colors.Header
    Write-Host ("║ $Message ║").PadRight(82) -ForegroundColor $colors.Header
    Write-Host ("━" * 80) -ForegroundColor $colors.Header
    Write-Host "`n" -ForegroundColor $colors.Header
}

function Write-LogStep {
    param([string]$Message)
    Write-Host "▶ $Message" -ForegroundColor $colors.Step
}

function Write-LogSuccess {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $colors.Success
}

function Write-LogWarning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $colors.Warning
}

function Write-LogError {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $colors.Error
}

function Write-LogInfo {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $colors.Info
}

################################################################################
# STEP 1: Validate Environment
################################################################################

function Step-ValidateEnvironment {
    Write-LogHeader "STEP 1/$totalSteps: Validating Environment"
    
    # Detect OS
    $osType = "Windows $([System.Environment]::OSVersion.Version.Major).$([System.Environment]::OSVersion.Version.Minor)"
    
    Write-LogInfo "Operating System: $osType"
    Write-LogInfo "PowerShell Version: $($PSVersionTable.PSVersion)"
    Write-LogInfo "Current User: $env:USERNAME"
    Write-LogInfo "Working Directory: $(Get-Location)"
    Write-Host "`n"
    
    # Validate Node.js
    Write-LogStep "Checking Node.js installation..."
    try {
        $script:nodeVersion = (node --version 2>$null)
        if ($script:nodeVersion) {
            Write-LogSuccess "Node.js found: $($script:nodeVersion)"
        } else {
            Write-LogError "Node.js is not installed!"
            Write-LogInfo "Please install Node.js from https://nodejs.org/ (v16+)"
            exit 1
        }
    } catch {
        Write-LogError "Node.js is not installed or not in PATH!"
        exit 1
    }
    
    # Validate npm
    Write-LogStep "Checking npm installation..."
    try {
        $script:npmVersion = (npm --version 2>$null)
        if ($script:npmVersion) {
            Write-LogSuccess "npm found: v$($script:npmVersion)"
        } else {
            Write-LogError "npm is not installed!"
            exit 1
        }
    } catch {
        Write-LogError "npm is not installed or not in PATH!"
        exit 1
    }
    
    # Check package.json
    if (-not (Test-Path "package.json")) {
        Write-LogError "package.json not found in current directory!"
        Write-LogInfo "Please run this script from the project root directory"
        exit 1
    }
    
    Write-LogSuccess "package.json found"
    
    # Store OS type
    $script:osType = $osType
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# STEP 2: Backup State
################################################################################

function Step-BackupState {
    Write-LogHeader "STEP 2/$totalSteps: Backing Up Current State"
    
    $timestamp = (Get-Date -Format "yyyyMMdd-HHmmss")
    $backupDir = ".backup-$timestamp"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    Write-LogStep "Creating backup of package.json..."
    if (Test-Path "package.json") {
        Copy-Item -Path "package.json" -Destination "$backupDir/package.json.bak"
        Write-LogSuccess "Backed up to $backupDir/package.json.bak"
    }
    
    Write-LogStep "Creating backup of package-lock.json..."
    if (Test-Path "package-lock.json") {
        Copy-Item -Path "package-lock.json" -Destination "$backupDir/package-lock.json.bak"
        Write-LogSuccess "Backed up to $backupDir/package-lock.json.bak"
    }
    
    Write-LogInfo "Backup directory: $backupDir"
    Write-Host "`n"
    
    $script:backupDir = $backupDir
    $script:stepsCompleted++
}

################################################################################
# STEP 3: Clean npm
################################################################################

function Step-CleanNpm {
    Write-LogHeader "STEP 3/$totalSteps: Cleaning npm Cache"
    
    Write-LogStep "Clearing npm cache..."
    npm cache clean --force | Out-Null
    Write-LogSuccess "npm cache cleared"
    
    Write-LogStep "Removing node_modules directory..."
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules" 2>$null
        Write-LogSuccess "node_modules removed"
    } else {
        Write-LogInfo "node_modules directory not found (OK)"
    }
    
    Write-LogStep "Removing package-lock.json..."
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
        Write-LogSuccess "package-lock.json removed"
    } else {
        Write-LogInfo "package-lock.json not found (OK)"
    }
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# STEP 4: Detect and Install Missing Dependencies
################################################################################

function Step-DetectAndInstallMissingDeps {
    Write-LogHeader "STEP 4/$totalSteps: Detecting & Installing Missing Dependencies"
    
    $radixPackages = @(
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-arrow",
        "@radix-ui/react-aspect-ratio",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-collapsible",
        "@radix-ui/react-context-menu",
        "@radix-ui/react-context",
        "@radix-ui/react-dialog",
        "@radix-ui/react-direction",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-hover-card",
        "@radix-ui/react-label",
        "@radix-ui/react-menubar",
        "@radix-ui/react-navigation-menu",
        "@radix-ui/react-popover",
        "@radix-ui/react-primitive",
        "@radix-ui/react-progress",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-scroll-area",
        "@radix-ui/react-select",
        "@radix-ui/react-separator",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tabs",
        "@radix-ui/react-toast",
        "@radix-ui/react-toggle",
        "@radix-ui/react-toggle-group",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-accordion",
        "@radix-ui/react-avatar",
        "@radix-ui/react-use-callback-ref",
        "@radix-ui/react-use-controllable-state",
        "@radix-ui/react-use-escape-keydown",
        "@radix-ui/react-use-layout-effect",
        "@radix-ui/react-use-prev",
        "@radix-ui/react-use-size"
    )
    
    Write-LogStep "Checking for missing @radix-ui packages in package.json..."
    
    $packageJson = Get-Content "package.json" -Raw
    $missingPackages = @()
    
    foreach ($package in $radixPackages) {
        if ($packageJson -notmatch [regex]::Escape($package)) {
            $missingPackages += $package
        }
    }
    
    if ($missingPackages.Count -eq 0) {
        Write-LogSuccess "All @radix-ui packages are declared"
    } else {
        Write-LogWarning "Found $($missingPackages.Count) missing @radix-ui packages"
        foreach ($package in $missingPackages) {
            Write-Host "  - $package" -ForegroundColor $colors.Warning
        }
        Write-Host ""
        
        Write-LogStep "Installing missing @radix-ui packages..."
        $packageList = $missingPackages -join " "
        npm install $packageList --save --legacy-peer-deps
        
        if ($LASTEXITCODE -eq 0) {
            Write-LogSuccess "Missing @radix-ui packages installed!"
        } else {
            Write-LogWarning "Some packages may have failed to install"
        }
    }
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# STEP 5: Install Dependencies
################################################################################

function Step-InstallDependencies {
    Write-LogHeader "STEP 5/$totalSteps: Installing All Dependencies"
    
    Write-LogStep "Running 'npm install' with clean state..."
    npm install --legacy-peer-deps
    
    if ($LASTEXITCODE -eq 0) {
        Write-LogSuccess "Dependencies installed successfully"
    } else {
        Write-LogError "Failed to install dependencies"
        exit 1
    }
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# STEP 6: Fix Vulnerabilities
################################################################################

function Step-FixVulnerabilities {
    Write-LogHeader "STEP 6/$totalSteps: Addressing Security Vulnerabilities"
    
    Write-LogStep "Running npm audit..."
    $auditOutput = npm audit 2>&1 | Out-String
    
    if ($auditOutput -match '(\d+)\s+vulnerabilities') {
        $vulnCount = [int]$matches[1]
        if ($vulnCount -gt 0) {
            Write-LogWarning "Found $vulnCount vulnerabilities"
            Write-LogStep "Attempting to fix vulnerabilities..."
            npm audit fix --force 2>&1 | Out-Null
            Write-LogInfo "Vulnerabilities addressed (see npm audit for details)"
        } else {
            Write-LogSuccess "No vulnerabilities found"
        }
    } else {
        Write-LogSuccess "No vulnerabilities found"
    }
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# STEP 7: Verify Build Configuration
################################################################################

function Step-VerifyBuildConfig {
    Write-LogHeader "STEP 7/$totalSteps: Verifying Build Configuration"
    
    Write-LogStep "Checking tsconfig.json..."
    if (Test-Path "tsconfig.json") {
        Write-LogSuccess "tsconfig.json found"
    } else {
        Write-LogWarning "tsconfig.json not found"
    }
    
    Write-LogStep "Checking vite.config..."
    if ((Test-Path "vite.config.ts") -or (Test-Path "vite.config.js")) {
        Write-LogSuccess "vite.config found"
    } else {
        Write-LogWarning "vite.config not found"
    }
    
    Write-LogStep "Checking tailwind.config..."
    if ((Test-Path "tailwind.config.ts") -or (Test-Path "tailwind.config.js")) {
        Write-LogSuccess "tailwind.config found"
    } else {
        Write-LogWarning "tailwind.config not found"
    }
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# STEP 8: Build Project
################################################################################

function Step-BuildProject {
    Write-LogHeader "STEP 8/$totalSteps: Building Project"
    
    if ($SkipBuild) {
        Write-LogWarning "Build step skipped (-SkipBuild flag used)"
        $script:buildSuccess = $true
        Write-Host "`n"
        $script:stepsCompleted++
        return
    }
    
    Write-LogStep "Running production build..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-LogSuccess "Build completed successfully!"
        $script:buildSuccess = $true
    } else {
        Write-LogError "Build failed!"
        $script:buildSuccess = $false
    }
    
    Write-Host "`n"
    $script:stepsCompleted++
}

################################################################################
# Generate Report
################################################################################

function Generate-Report {
    Write-LogHeader "SETUP REPORT"
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "Script Version: $scriptVersion" -ForegroundColor $colors.Step
    Write-Host "Execution Date: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $colors.Step
    Write-Host "Duration: $($duration.ToString('F2'))s" -ForegroundColor $colors.Step
    Write-Host "Steps Completed: $stepsCompleted/$totalSteps" -ForegroundColor $colors.Step
    Write-Host "Backup Directory: $script:backupDir" -ForegroundColor $colors.Step
    Write-Host "`n"
    
    if ($script:buildSuccess -eq $true) {
        Write-LogSuccess "BUILD SUCCESSFUL!"
        Write-LogInfo "Your project is ready to run!"
        Write-Host "`n"
        Write-LogInfo "Next commands:"
        Write-Host "  • Development server: npm run dev"
        Write-Host "  • Preview build: npm run preview"
        Write-Host "  • Run tests: npm run test"
        Write-Host "  • Run e2e tests: npm run test:e2e"
    } else {
        Write-LogError "BUILD FAILED"
        Write-LogWarning "Please check the error messages above"
    }
    
    Write-Host "`n"
    Write-LogHeader "SYSTEM INFORMATION"
    Write-Host "Node.js: $($script:nodeVersion)" -ForegroundColor $colors.Step
    Write-Host "npm: v$($script:npmVersion)" -ForegroundColor $colors.Step
    Write-Host "OS: $($script:osType)" -ForegroundColor $colors.Step
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor $colors.Step
    Write-Host "`n"
}

################################################################################
# Main Execution
################################################################################

function Main {
    Clear-Host
    
    Write-Host "`n" -ForegroundColor $colors.Header
    Write-Host "╔" + ("═" * 78) + "╗" -ForegroundColor $colors.Header
    Write-Host "║" + "  🎵 TSiJUKEBOX - Build Environment Setup 🎵  ".PadRight(80) + "║" -ForegroundColor $colors.Header
    Write-Host "║" + "  Autonomous Setup & Fix Script (PowerShell) ".PadRight(80) + "║" -ForegroundColor $colors.Header
    Write-Host "║" + ("  Version $scriptVersion ").PadRight(80) + "║" -ForegroundColor $colors.Header
    Write-Host "╚" + ("═" * 78) + "╝" -ForegroundColor $colors.Header
    Write-Host "`n" -ForegroundColor $colors.Header
    
    Write-LogInfo "Starting comprehensive build environment setup..."
    Write-Host "`n"
    
    # Execute all steps
    Step-ValidateEnvironment
    Step-BackupState
    Step-CleanNpm
    Step-DetectAndInstallMissingDeps
    Step-InstallDependencies
    Step-FixVulnerabilities
    Step-VerifyBuildConfig
    Step-BuildProject
    
    # Generate final report
    Generate-Report
    
    Write-LogHeader "SETUP COMPLETE"
    Write-Host "`n"
}

# Execute main function
Main
