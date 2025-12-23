#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RADIX_PACKAGES = [
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-arrow',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-slider',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-accordion',
  '@radix-ui/react-avatar',
  // Dependencies
  '@radix-ui/primitive',
  '@radix-ui/react-primitive',
  '@radix-ui/react-slot',
  '@radix-ui/react-use-callback-ref',
  '@radix-ui/react-use-controllable-state',
  '@radix-ui/react-use-escape-keydown',
  '@radix-ui/react-use-layout-effect',
  '@radix-ui/react-use-prev',
  '@radix-ui/react-use-size',
  '@radix-ui/react-direction',
  '@radix-ui/react-context',
];

function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

function checkWithNpm(packageName) {
  try {
    execSync(`npm ls "${packageName}"`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

console.log('🔍 Scanning for missing @radix-ui dependencies...\n');

const missingPackages = [];
const foundPackages = [];

for (const pkg of RADIX_PACKAGES) {
  if (checkWithNpm(pkg)) {
    console.log(`✅ Found: ${pkg}`);
    foundPackages.push(pkg);
  } else {
    console.log(`❌ Missing: ${pkg}`);
    missingPackages.push(pkg);
  }
}

console.log(`\n📊 Summary: ${foundPackages.length} found, ${missingPackages.length} missing\n`);

if (missingPackages.length === 0) {
  console.log('✅ All @radix-ui dependencies are installed!');
  process.exit(0);
}

console.log(`📦 Installing ${missingPackages.length} missing packages...\n`);

try {
  execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
  console.log('\n✅ Dependencies installed successfully!');
  console.log('\n🔨 Running build...\n');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build successful!');
} catch (error) {
  console.error('\n❌ Error during installation or build:', error.message);
  process.exit(1);
}
