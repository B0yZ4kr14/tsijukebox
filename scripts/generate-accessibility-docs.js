#!/usr/bin/env node
/**
 * Script de geração automática de documentação ACCESSIBILITY.md
 * Extrai exceções WCAG do código e atualiza a documentação
 * 
 * Uso:
 *   node scripts/generate-accessibility-docs.js          # Gerar/atualizar docs
 *   node scripts/generate-accessibility-docs.js --json   # Output JSON das exceções
 *   node scripts/generate-accessibility-docs.js --check  # Verificar se docs estão atualizados
 */

const fs = require('fs');
const path = require('path');

// Configuração
const DIRS_TO_SCAN = ['src/components', 'src/pages', 'src/hooks'];
const EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];
const ACCESSIBILITY_MD_PATH = 'docs/ACCESSIBILITY.md';

// Marcadores para seção auto-gerada
const START_MARKER = '<!-- WCAG-EXCEPTIONS-START -->';
const END_MARKER = '<!-- WCAG-EXCEPTIONS-END -->';

// Padrões de comentários WCAG
const WCAG_PATTERNS = [
  // JSX inline: {/* WCAG Exception: /XX Element - Reason */}
  {
    regex: /\{\/\*\s*WCAG\s*Exception:\s*(\/?[0-9]+)\s+([^-–\n]+)\s*[-–]\s*([^*]+)\*\/\}/gi,
    extract: (match) => ({
      opacity: match[1],
      element: match[2].trim(),
      justification: match[3].trim(),
      category: detectCategory(match[3])
    })
  },
  // JSX inline com "porque"/"because"
  {
    regex: /\{\/\*\s*WCAG\s*Exception:\s*(\/?[0-9]+)\s+([^\n]+?)\s+(?:porque|because)\s+([^*]+)\*\/\}/gi,
    extract: (match) => ({
      opacity: match[1],
      element: match[2].trim(),
      justification: match[3].trim(),
      category: detectCategory(match[3])
    })
  },
  // JSX multiline com Category
  {
    regex: /\{\/\*\s*\n?\s*WCAG\s*Exception:\s*(\/?[0-9]+)\s+([^\n]+)\s*\n\s*Category:\s*(\w+)\s*\n\s*Justification:\s*([^*]+)\*\/\}/gi,
    extract: (match) => ({
      opacity: match[1],
      element: match[2].trim(),
      category: match[3].trim(),
      justification: match[4].trim()
    })
  },
  // JS/TS single-line comment
  {
    regex: /\/\/\s*WCAG\s*Exception:\s*(\/?[0-9]+)\s+([^-–\n]+)\s*[-–]\s*(.+)$/gim,
    extract: (match) => ({
      opacity: match[1],
      element: match[2].trim(),
      justification: match[3].trim(),
      category: detectCategory(match[3])
    })
  }
];

// Categorias e palavras-chave para detecção automática
const CATEGORY_KEYWORDS = {
  decorative: ['decorativo', 'decorative', 'visual', 'estético', 'aesthetic', 'ícone', 'icon'],
  'state-change': ['hover', 'focus', 'active', 'group-hover', 'estado', 'state', 'interação', 'interaction'],
  disabled: ['disabled', 'desabilitado', 'inativo', 'inactive', 'dimmed'],
  secondary: ['secundário', 'secondary', 'auxiliar', 'auxiliary', 'menor', 'minor', 'complementar']
};

/**
 * Detecta categoria automaticamente baseado em palavras-chave
 */
function detectCategory(text) {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}

/**
 * Escaneia um arquivo em busca de exceções WCAG
 */
function scanFile(filePath) {
  const exceptions = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    for (const pattern of WCAG_PATTERNS) {
      let match;
      // Reset regex lastIndex
      pattern.regex.lastIndex = 0;
      
      while ((match = pattern.regex.exec(content)) !== null) {
        const exception = pattern.extract(match);
        exceptions.push({
          file: relativePath,
          ...exception,
          line: getLineNumber(content, match.index)
        });
      }
    }
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error.message);
  }
  
  return exceptions;
}

/**
 * Obtém número da linha a partir do índice no conteúdo
 */
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

/**
 * Escaneia diretório recursivamente
 */
function scanDirectory(dir) {
  let exceptions = [];
  
  if (!fs.existsSync(dir)) {
    return exceptions;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      exceptions = exceptions.concat(scanDirectory(fullPath));
    } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
      exceptions = exceptions.concat(scanFile(fullPath));
    }
  }
  
  return exceptions;
}

/**
 * Gera tabela Markdown a partir das exceções
 */
function generateMarkdownTable(exceptions) {
  if (exceptions.length === 0) {
    return '_Nenhuma exceção WCAG encontrada no código._';
  }
  
  // Ordenar por arquivo e linha
  exceptions.sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });
  
  let markdown = `#### Lista Completa de Exceções (${exceptions.length} total)\n\n`;
  markdown += '| # | Arquivo | Linha | Opacidade | Elemento | Categoria | Justificativa |\n';
  markdown += '|---|---------|-------|-----------|----------|-----------|---------------|\n';
  
  exceptions.forEach((exc, index) => {
    const file = `\`${exc.file.replace(/^src\//, '')}\``;
    const justification = exc.justification.replace(/\|/g, '\\|').replace(/\n/g, ' ').substring(0, 80);
    markdown += `| ${index + 1} | ${file} | ${exc.line} | \`${exc.opacity}\` | ${exc.element} | ${exc.category} | ${justification} |\n`;
  });
  
  // Adicionar resumo por categoria
  markdown += '\n#### Resumo por Categoria\n\n';
  const categoryCounts = {};
  exceptions.forEach(exc => {
    categoryCounts[exc.category] = (categoryCounts[exc.category] || 0) + 1;
  });
  
  for (const [category, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    markdown += `- **${category}**: ${count} exceções\n`;
  }
  
  return markdown;
}

/**
 * Atualiza o arquivo ACCESSIBILITY.md
 */
function updateAccessibilityMd(exceptions) {
  let content;
  
  try {
    content = fs.readFileSync(ACCESSIBILITY_MD_PATH, 'utf8');
  } catch (error) {
    console.error(`Arquivo ${ACCESSIBILITY_MD_PATH} não encontrado.`);
    return false;
  }
  
  const newContent = generateMarkdownTable(exceptions);
  const timestamp = new Date().toISOString().split('T')[0];
  
  const autoGeneratedSection = `${START_MARKER}\n<!-- Auto-generated on ${timestamp} by generate-accessibility-docs.js -->\n<!-- DO NOT EDIT MANUALLY - Run: node scripts/generate-accessibility-docs.js -->\n\n${newContent}\n${END_MARKER}`;
  
  // Verificar se marcadores existem
  if (content.includes(START_MARKER) && content.includes(END_MARKER)) {
    // Substituir seção existente
    const startIndex = content.indexOf(START_MARKER);
    const endIndex = content.indexOf(END_MARKER) + END_MARKER.length;
    content = content.substring(0, startIndex) + autoGeneratedSection + content.substring(endIndex);
  } else {
    // Adicionar seção antes de "## Auditing"
    const auditingIndex = content.indexOf('## Auditing');
    if (auditingIndex !== -1) {
      content = content.substring(0, auditingIndex) + autoGeneratedSection + '\n\n' + content.substring(auditingIndex);
    } else {
      // Adicionar no final
      content += '\n\n' + autoGeneratedSection;
    }
  }
  
  fs.writeFileSync(ACCESSIBILITY_MD_PATH, content);
  return true;
}

/**
 * Verifica se a documentação está sincronizada com o código
 */
function checkSync(exceptions) {
  let content;
  
  try {
    content = fs.readFileSync(ACCESSIBILITY_MD_PATH, 'utf8');
  } catch (error) {
    console.error(`❌ Arquivo ${ACCESSIBILITY_MD_PATH} não encontrado.`);
    return false;
  }
  
  // Extrair contagem atual da documentação
  const countMatch = content.match(/Lista Completa de Exceções \((\d+) total\)/);
  const documentedCount = countMatch ? parseInt(countMatch[1], 10) : 0;
  const actualCount = exceptions.length;
  
  if (documentedCount !== actualCount) {
    console.error(`❌ Documentação desatualizada!`);
    console.error(`   Documentado: ${documentedCount} exceções`);
    console.error(`   No código: ${actualCount} exceções`);
    console.error(`   Execute: node scripts/generate-accessibility-docs.js`);
    return false;
  }
  
  console.log(`✅ Documentação sincronizada (${actualCount} exceções)`);
  return true;
}

/**
 * Formata saída JSON
 */
function formatJSON(exceptions) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    total: exceptions.length,
    exceptions: exceptions,
    categorySummary: exceptions.reduce((acc, exc) => {
      acc[exc.category] = (acc[exc.category] || 0) + 1;
      return acc;
    }, {})
  }, null, 2);
}

// Main
const args = process.argv.slice(2);
const isCheck = args.includes('--check');
const isJSON = args.includes('--json');

console.log('🔍 Escaneando código em busca de exceções WCAG...\n');

let allExceptions = [];
for (const dir of DIRS_TO_SCAN) {
  allExceptions = allExceptions.concat(scanDirectory(dir));
}

console.log(`📊 Encontradas ${allExceptions.length} exceções WCAG em ${new Set(allExceptions.map(e => e.file)).size} arquivos.\n`);

if (isJSON) {
  console.log(formatJSON(allExceptions));
  process.exit(0);
}

if (isCheck) {
  const isSync = checkSync(allExceptions);
  process.exit(isSync ? 0 : 1);
}

// Modo padrão: atualizar documentação
const success = updateAccessibilityMd(allExceptions);
if (success) {
  console.log(`✅ Arquivo ${ACCESSIBILITY_MD_PATH} atualizado com sucesso!`);
  console.log(`   Total de exceções documentadas: ${allExceptions.length}`);
} else {
  console.error('❌ Falha ao atualizar documentação.');
  process.exit(1);
}
