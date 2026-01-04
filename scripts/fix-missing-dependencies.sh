#!/bin/bash

# Script to detect and install all missing @radix-ui dependencies for shadcn/ui
# Usage: bash scripts/fix-missing-dependencies.sh

echo "🔍 Scanning for missing @radix-ui dependencies..."
echo ""

# List of all @radix-ui packages that might be needed by shadcn/ui
RADIX_PACKAGES=(
  "@radix-ui/react-alert-dialog"
  "@radix-ui/react-arrow"
  "@radix-ui/react-aspect-ratio"
  "@radix-ui/react-checkbox"
  "@radix-ui/react-collapsible"
  "@radix-ui/react-context-menu"
  "@radix-ui/react-dialog"
  "@radix-ui/react-dropdown-menu"
  "@radix-ui/react-hover-card"
  "@radix-ui/react-label"
  "@radix-ui/react-menubar"
  "@radix-ui/react-navigation-menu"
  "@radix-ui/react-popover"
  "@radix-ui/react-progress"
  "@radix-ui/react-radio-group"
  "@radix-ui/react-scroll-area"
  "@radix-ui/react-select"
  "@radix-ui/react-separator"
  "@radix-ui/react-slider"
  "@radix-ui/react-switch"
  "@radix-ui/react-tabs"
  "@radix-ui/react-toast"
  "@radix-ui/react-toggle"
  "@radix-ui/react-toggle-group"
  "@radix-ui/react-tooltip"
  "@radix-ui/react-accordion"
  "@radix-ui/react-avatar"
  # Dependencies
  "@radix-ui/primitive"
  "@radix-ui/react-primitive"
  "@radix-ui/react-slot"
  "@radix-ui/react-use-callback-ref"
  "@radix-ui/react-use-controllable-state"
  "@radix-ui/react-use-escape-keydown"
  "@radix-ui/react-use-layout-effect"
  "@radix-ui/react-use-prev"
  "@radix-ui/react-use-size"
  "@radix-ui/react-direction"
  "@radix-ui/react-context"
)

MISSING_PACKAGES=()

for package in "${RADIX_PACKAGES[@]}"; do
  if ! npm ls "$package" > /dev/null 2>&1; then
    MISSING_PACKAGES+=("$package")
    echo "❌ Missing: $package"
  else
    echo "✅ Found: $package"
  fi
done

echo ""
if [ ${#MISSING_PACKAGES[@]} -eq 0 ]; then
  echo "✅ All @radix-ui dependencies are installed!"
  exit 0
fi

echo "📦 Installing ${#MISSING_PACKAGES[@]} missing packages..."
echo ""

npm install "${MISSING_PACKAGES[@]}"

echo ""
echo "✅ Dependencies installed! Running build..."
echo ""

npm run build
