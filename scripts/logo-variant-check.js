/**
 * LogoBrand Variant Check Script
 * 
 * Verifies that all LogoBrand components in pages use variant="metal"
 * Run: node scripts/logo-variant-check.js
 */

const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'src', 'pages');
const LOGO_PATTERN = /<LogoBrand[^>]*>/g;

function checkLogoVariants() {
  console.log('🔍 Checking LogoBrand variants in src/pages...\n');
  
  const issues = [];
  const files = [];

  // Get all .tsx files in pages directory
  try {
    const entries = fs.readdirSync(PAGES_DIR);
    entries.forEach(entry => {
      if (entry.endsWith('.tsx')) {
        files.push(path.join(PAGES_DIR, entry));
      }
    });
  } catch (err) {
    console.error('❌ Error reading pages directory:', err.message);
    process.exit(1);
  }

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.matchAll(LOGO_PATTERN);
    
    for (const match of matches) {
      const logoTag = match[0];
      
      // Check if variant="metal" is present
      if (!logoTag.includes('variant="metal"') && !logoTag.includes("variant='metal'")) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        
        issues.push({
          file: path.basename(filePath),
          line: lineNumber,
          code: logoTag.trim()
        });
      }
    }
  });

  // Report results
  if (issues.length > 0) {
    console.error('❌ LogoBrand components without variant="metal" found:\n');
    issues.forEach(issue => {
      console.error(`  📁 ${issue.file}:${issue.line}`);
      console.error(`     ${issue.code}`);
      console.error('');
    });
    console.error(`\n❌ Total: ${issues.length} issue(s) found`);
    console.error('\n💡 Fix: Add variant="metal" to each LogoBrand component');
    process.exit(1);
  }
  
  console.log(`✅ All ${files.length} page files checked`);
  console.log('✅ All LogoBrand components use variant="metal"');
  process.exit(0);
}

checkLogoVariants();
