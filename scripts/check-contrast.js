#!/usr/bin/env node
/**
 * Script de verificação de contraste WCAG
 * Analisa arquivos CSS e TSX para detectar potenciais problemas de contraste
 * 
 * Uso: node scripts/check-contrast.js [--json] [--strict]
 */

const fs = require('fs');
const path = require('path');

// Argumentos CLI
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const strictMode = args.includes('--strict');

// Padrões problemáticos conhecidos
const PROBLEMATIC_PATTERNS = [
  // Background patterns
  { pattern: /bg-background(?![/\-])/g, issue: 'bg-background pode resultar em fundo branco - usar bg-kiosk-surface ou bg-kiosk-bg', severity: 'error' },
  { pattern: /bg-white(?![/\-])/g, issue: 'bg-white é branco puro - usar bg-kiosk-surface', severity: 'error' },
  { pattern: /bg-muted(?![/\-])/g, issue: 'bg-muted pode ter contraste baixo em dark mode - usar bg-kiosk-surface', severity: 'error' },
  { pattern: /bg-card(?![/\-])/g, issue: 'bg-card pode ter contraste baixo - verificar tema', severity: 'warning' },
  { pattern: /bg-background\/50/g, issue: 'bg-background/50 pode ser claro - usar bg-kiosk-surface/50', severity: 'error' },
  
  // Text foreground patterns
  { pattern: /text-foreground(?![/\-])/g, issue: 'text-foreground pode ser escuro em dark mode - usar text-kiosk-text', severity: 'warning' },
  { pattern: /text-muted-foreground(?![/\-])/g, issue: 'text-muted-foreground pode ter baixo contraste - usar text-secondary-visible', severity: 'warning' },
  
  // Button variant patterns
  { pattern: /variant=["']outline["'](?!.*kiosk)/g, issue: 'Button outline pode ter fundo claro - usar variant="kiosk-outline"', severity: 'error' },
  
  // NEW: Opacity-based patterns for WCAG AA compliance
  { pattern: /text-kiosk-text\/[1-3][0-9](?!\d)/g, issue: 'Opacidade muito baixa (10-39%) - usar text-secondary-visible', severity: 'error' },
  { pattern: /text-kiosk-text\/4[0-9](?!\d)/g, issue: 'Opacidade baixa (40-49%) - usar text-secondary-visible', severity: 'error' },
  { pattern: /text-kiosk-text\/5[0-9](?!\d)/g, issue: 'Opacidade baixa (50-59%) - usar text-description-visible', severity: 'error' },
  { pattern: /text-kiosk-text\/6[0-9](?!\d)/g, issue: 'Opacidade moderada (60-69%) - usar text-description-visible', severity: 'warning' },
  { pattern: /text-kiosk-text\/7[0-4](?!\d)/g, issue: 'Opacidade abaixo do ideal (70-74%) - considerar text-description-visible', severity: 'warning' },
];

// Padrões aceitáveis (exceções)
const ACCEPTABLE_PATTERNS = [
  /Badge.*variant=["']outline["']/,   // Badges podem usar outline
  /ring-offset-background/,            // Ring offset é aceitável
  /\*.*bg-white/,                      // Comentários
  /\/\/.*bg-white/,                    // Comentários inline
  /glow.*bg-white/i,                   // Efeitos de glow
  /shadow.*bg-white/i,                 // Efeitos de shadow
  /demo.*bg-white/i,                   // Demonstrações
  /ContrastDebug/,                     // Arquivos de debug
  /ThemePreview/,                      // Preview de temas
  /WCAG Exception/i,                   // Exceções WCAG documentadas
  /wcag-exception/i,                   // Exceções WCAG documentadas
  /group-hover:/,                      // Estados de hover em grupo
  /hover:text-/,                       // Estados de hover
  /data-\[state=active\]/,             // Estados ativos
  /opacity-100/,                       // Opacidade total
];

// Arquivos a ignorar
const IGNORED_FILES = [
  'useContrastDebug.ts',
  'ContrastDebugPanel.tsx',
  'ThemePreview.tsx',
  'check-contrast.js',
  'WcagExceptions.tsx',
  'WcagExceptionComment.tsx',
];

// Diretórios a verificar
const DIRS_TO_CHECK = ['src/components', 'src/pages'];
const EXTENSIONS = ['.tsx', '.ts', '.css'];

// Cores para output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function isIgnoredFile(filePath) {
  return IGNORED_FILES.some(ignored => filePath.includes(ignored));
}

function isAcceptable(line) {
  return ACCEPTABLE_PATTERNS.some(pattern => pattern.test(line));
}

function checkFile(filePath) {
  if (isIgnoredFile(filePath)) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const lines = content.split('\n');
  
  PROBLEMATIC_PATTERNS.forEach(({ pattern, issue, severity }) => {
    lines.forEach((line, index) => {
      // Reset regex lastIndex
      pattern.lastIndex = 0;
      
      if (pattern.test(line) && !isAcceptable(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          issue,
          severity,
          match: line.trim().substring(0, 100),
        });
      }
    });
  });
  
  return issues;
}

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (EXTENSIONS.some(ext => f.endsWith(ext))) {
      callback(dirPath);
    }
  });
}

function main() {
  const allIssues = [];
  let filesChecked = 0;
  
  DIRS_TO_CHECK.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      walkDir(fullPath, (filePath) => {
        filesChecked++;
        const issues = checkFile(filePath);
        allIssues.push(...issues);
      });
    }
  });
  
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');
  
  // Output JSON se solicitado
  if (outputJson) {
    console.log(JSON.stringify({
      filesChecked,
      totalIssues: allIssues.length,
      errors: errors.length,
      warnings: warnings.length,
      issues: allIssues,
      passed: errors.length === 0,
    }, null, 2));
    process.exit(errors.length > 0 ? 1 : 0);
    return;
  }
  
  // Output normal
  console.log(`${colors.cyan}${colors.bold}🔍 Verificando problemas de contraste WCAG...${colors.reset}\n`);
  console.log(`${colors.cyan}Arquivos verificados: ${filesChecked}${colors.reset}\n`);
  
  if (allIssues.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ Nenhum problema de contraste encontrado!${colors.reset}`);
    process.exit(0);
  }
  
  // Agrupar por arquivo
  const byFile = {};
  allIssues.forEach(issue => {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  });
  
  // Exibir resultados
  Object.entries(byFile).forEach(([file, issues]) => {
    const relativePath = file.replace(process.cwd(), '.');
    console.log(`\n${colors.bold}📄 ${relativePath}${colors.reset}`);
    
    issues.forEach(({ line, issue, severity, match }) => {
      const icon = severity === 'error' ? `${colors.red}❌` : `${colors.yellow}⚠️`;
      const color = severity === 'error' ? colors.red : colors.yellow;
      
      console.log(`   ${icon} ${color}Linha ${line}:${colors.reset} ${issue}`);
      console.log(`      ${colors.cyan}${match}${match.length >= 100 ? '...' : ''}${colors.reset}`);
    });
  });
  
  console.log(`\n${colors.bold}📊 Resumo:${colors.reset}`);
  console.log(`   ${colors.red}${errors.length} erros${colors.reset}`);
  console.log(`   ${colors.yellow}${warnings.length} avisos${colors.reset}`);
  
  if (errors.length > 0 || (strictMode && warnings.length > 0)) {
    console.log(`\n${colors.cyan}💡 Dicas de correção:${colors.reset}`);
    console.log(`   • Use ${colors.green}variant="kiosk-outline"${colors.reset} em vez de ${colors.red}variant="outline"${colors.reset} para botões`);
    console.log(`   • Use ${colors.green}bg-kiosk-surface${colors.reset} ou ${colors.green}bg-kiosk-bg${colors.reset} em vez de ${colors.red}bg-background${colors.reset}`);
    console.log(`   • Use ${colors.green}text-kiosk-text${colors.reset} em vez de ${colors.red}text-foreground${colors.reset}`);
    console.log(`   • Use ${colors.green}text-secondary-visible${colors.reset} em vez de ${colors.red}text-kiosk-text/[40-59]${colors.reset}`);
    console.log(`   • Use ${colors.green}text-description-visible${colors.reset} em vez de ${colors.red}text-kiosk-text/[60-74]${colors.reset}\n`);
  }
  
  // Em modo strict, warnings também causam falha
  const exitCode = errors.length > 0 || (strictMode && warnings.length > 0) ? 1 : 0;
  process.exit(exitCode);
}

main();
