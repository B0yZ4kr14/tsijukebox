#!/usr/bin/env node

/**
 * i18n Coverage Test Script
 * Scans all TSX/TS files for translation keys and verifies they exist in all locales
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES = ['en', 'pt-BR', 'es'];
const SRC_DIR = path.join(__dirname, '..', 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'i18n', 'locales');

// Regex patterns to find translation keys
const TRANSLATION_PATTERNS = [
  /t\(['"`]([^'"`]+)['"`]\)/g,           // t('key') or t("key") or t(`key`)
  /t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,     // t( 'key' ) with spaces
];

// Load all locale files
function loadLocales() {
  const locales = {};
  
  for (const locale of LOCALES) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      locales[locale] = JSON.parse(content);
    } catch (error) {
      console.error(`❌ Error loading ${locale}.json:`, error.message);
      locales[locale] = {};
    }
  }
  
  return locales;
}

// Get nested value from object by dot-separated path
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

// Recursively find all TSX/TS files
function findSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (!['node_modules', 'dist', '.git', 'scripts'].includes(entry.name)) {
        findSourceFiles(fullPath, files);
      }
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Extract translation keys from file content
function extractTranslationKeys(content) {
  const keys = new Set();
  
  for (const pattern of TRANSLATION_PATTERNS) {
    let match;
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  
  return Array.from(keys);
}

// Main function
function main() {
  console.log('🔍 i18n Coverage Check\n');
  console.log('='.repeat(60));
  
  // Load locales
  const locales = loadLocales();
  console.log(`\n📁 Loaded ${LOCALES.length} locales: ${LOCALES.join(', ')}\n`);
  
  // Find all source files
  const sourceFiles = findSourceFiles(SRC_DIR);
  console.log(`📄 Found ${sourceFiles.length} source files\n`);
  
  // Extract all translation keys
  const allKeys = new Set();
  const keysByFile = {};
  
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const keys = extractTranslationKeys(content);
    
    if (keys.length > 0) {
      const relativePath = path.relative(SRC_DIR, file);
      keysByFile[relativePath] = keys;
      keys.forEach(k => allKeys.add(k));
    }
  }
  
  console.log(`🔑 Found ${allKeys.size} unique translation keys\n`);
  console.log('='.repeat(60));
  
  // Check each key in all locales
  const missingKeys = {};
  const foundKeys = {};
  
  for (const locale of LOCALES) {
    missingKeys[locale] = [];
    foundKeys[locale] = 0;
  }
  
  for (const key of allKeys) {
    for (const locale of LOCALES) {
      const value = getNestedValue(locales[locale], key);
      if (value === undefined) {
        missingKeys[locale].push(key);
      } else {
        foundKeys[locale]++;
      }
    }
  }
  
  // Report results
  console.log('\n📊 Coverage Report:\n');
  
  let hasErrors = false;
  
  for (const locale of LOCALES) {
    const total = allKeys.size;
    const found = foundKeys[locale];
    const missing = missingKeys[locale].length;
    const coverage = ((found / total) * 100).toFixed(1);
    
    const statusIcon = missing === 0 ? '✅' : '⚠️';
    console.log(`${statusIcon} ${locale}: ${found}/${total} keys (${coverage}% coverage)`);
    
    if (missing > 0) {
      hasErrors = true;
      console.log(`   Missing ${missing} keys:`);
      missingKeys[locale].slice(0, 10).forEach(key => {
        console.log(`     - ${key}`);
      });
      if (missing > 10) {
        console.log(`     ... and ${missing - 10} more`);
      }
    }
    console.log();
  }
  
  // Summary by file
  console.log('='.repeat(60));
  console.log('\n📁 Keys by File (top 10):\n');
  
  const sortedFiles = Object.entries(keysByFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  for (const [file, keys] of sortedFiles) {
    console.log(`  ${keys.length.toString().padStart(3)} keys: ${file}`);
  }
  
  // Exit with error code if there are missing keys
  if (hasErrors) {
    console.log('\n❌ Some translation keys are missing!');
    process.exit(1);
  } else {
    console.log('\n✅ All translation keys are present in all locales!');
    process.exit(0);
  }
}

main();
