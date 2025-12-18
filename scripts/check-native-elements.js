#!/usr/bin/env node
/**
 * Script de verificação de elementos HTML nativos
 * Detecta elementos que devem usar componentes Radix/Shadcn UI
 * 
 * Uso:
 *   node scripts/check-native-elements.js          # Saída formatada
 *   node scripts/check-native-elements.js --json   # Saída JSON
 */

const fs = require('fs');
const path = require('path');

// Elementos nativos a detectar e seus substitutos Radix/Shadcn
const NATIVE_ELEMENTS = [
  // Form elements
  { 
    pattern: /<form[\s>]/gi, 
    element: '<form>', 
    replacement: 'Form do react-hook-form (@/components/ui/form)',
    severity: 'warning'
  },
  { 
    pattern: /<fieldset[\s>]/gi, 
    element: '<fieldset>', 
    replacement: 'FormItem ou Card do Shadcn (@/components/ui/form)',
    severity: 'warning'
  },
  { 
    pattern: /<legend[\s>]/gi, 
    element: '<legend>', 
    replacement: 'FormLabel do Shadcn (@/components/ui/form)',
    severity: 'warning'
  },
  { 
    pattern: /<label[\s>]/gi, 
    element: '<label>', 
    replacement: 'Label ou FormLabel do Shadcn (@/components/ui/label)',
    severity: 'warning'
  },
  // Select/Dropdown elements
  { 
    pattern: /<select[\s>]/gi, 
    element: '<select>', 
    replacement: 'Select do Radix (@/components/ui/select)',
    severity: 'error'
  },
  { 
    pattern: /<dialog[\s>]/gi, 
    element: '<dialog>', 
    replacement: 'Dialog do Radix (@/components/ui/dialog)',
    severity: 'error'
  },
  { 
    pattern: /<progress[\s>]/gi, 
    element: '<progress>', 
    replacement: 'Progress do Radix (@/components/ui/progress)',
    severity: 'error'
  },
  { 
    pattern: /<input\s+[^>]*type=['"]?checkbox['"]?/gi, 
    element: '<input type="checkbox">', 
    replacement: 'Checkbox do Radix (@/components/ui/checkbox)',
    severity: 'error'
  },
  { 
    pattern: /<input\s+[^>]*type=['"]?radio['"]?/gi, 
    element: '<input type="radio">', 
    replacement: 'RadioGroup do Radix (@/components/ui/radio-group)',
    severity: 'error'
  },
  { 
    pattern: /<input\s+[^>]*type=['"]?range['"]?/gi, 
    element: '<input type="range">', 
    replacement: 'Slider do Radix (@/components/ui/slider)',
    severity: 'error'
  },
  { 
    pattern: /<details[\s>]/gi, 
    element: '<details>', 
    replacement: 'Accordion ou Collapsible do Radix (@/components/ui/accordion)',
    severity: 'error'
  },
  { 
    pattern: /<summary[\s>]/gi, 
    element: '<summary>', 
    replacement: 'AccordionTrigger do Radix (@/components/ui/accordion)',
    severity: 'error'
  },
  { 
    pattern: /<meter[\s>]/gi, 
    element: '<meter>', 
    replacement: 'Progress do Radix (@/components/ui/progress)',
    severity: 'error'
  },
  { 
    pattern: /<datalist[\s>]/gi, 
    element: '<datalist>', 
    replacement: 'Combobox do Radix (Command + Popover)',
    severity: 'error'
  },
  { 
    pattern: /<option[\s>]/gi, 
    element: '<option>', 
    replacement: 'SelectItem do Radix (@/components/ui/select)',
    severity: 'error'
  },
  { 
    pattern: /<optgroup[\s>]/gi, 
    element: '<optgroup>', 
    replacement: 'SelectGroup do Radix (@/components/ui/select)',
    severity: 'error'
  },
  // Elementos de tabela
  { 
    pattern: /<table[\s>]/gi, 
    element: '<table>', 
    replacement: 'Table do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
  { 
    pattern: /<thead[\s>]/gi, 
    element: '<thead>', 
    replacement: 'TableHeader do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
  { 
    pattern: /<tbody[\s>]/gi, 
    element: '<tbody>', 
    replacement: 'TableBody do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
  { 
    pattern: /<tfoot[\s>]/gi, 
    element: '<tfoot>', 
    replacement: 'TableFooter do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
  { 
    pattern: /<tr[\s>]/gi, 
    element: '<tr>', 
    replacement: 'TableRow do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
  { 
    pattern: /<th[\s>]/gi, 
    element: '<th>', 
    replacement: 'TableHead do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
  { 
    pattern: /<td[\s>]/gi, 
    element: '<td>', 
    replacement: 'TableCell do Shadcn (@/components/ui/table)',
    severity: 'error'
  },
];

// Diretórios para verificar
const DIRS_TO_CHECK = ['src/components', 'src/pages'];

// Extensões de arquivo para verificar
const EXTENSIONS = ['.tsx', '.jsx'];

// Arquivos/padrões a ignorar
const IGNORE_PATTERNS = [
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.stories\.[jt]sx?$/,
  /__tests__/,
  /node_modules/,
  // Componentes UI base que DEFINEM os elementos (não os usam incorretamente)
  /src\/components\/ui\/select\.tsx$/,
  /src\/components\/ui\/dialog\.tsx$/,
  /src\/components\/ui\/progress\.tsx$/,
  /src\/components\/ui\/input\.tsx$/,
  /src\/components\/ui\/textarea\.tsx$/,
  /src\/components\/ui\/button\.tsx$/,
  /src\/components\/ui\/input-otp\.tsx$/,
  /src\/components\/ui\/checkbox\.tsx$/,
  /src\/components\/ui\/radio-group\.tsx$/,
  /src\/components\/ui\/slider\.tsx$/,
  /src\/components\/ui\/accordion\.tsx$/,
  /src\/components\/ui\/collapsible\.tsx$/,
  /src\/components\/ui\/table\.tsx$/,
  /src\/components\/ui\/command\.tsx$/,
  /src\/components\/ui\/form\.tsx$/,
  /src\/components\/ui\/label\.tsx$/,
];

// Padrões de exceção em conteúdo (comentários, strings)
const CONTENT_EXCEPTIONS = [
  /\/\/.*<(select|dialog|progress|input|details|summary|meter|datalist|option|optgroup|table|thead|tbody|tfoot|tr|th|td|form|fieldset|legend|label)/gi,      // Comentários inline
  /\/\*[\s\S]*?<(select|dialog|progress|input|details|summary|meter|datalist|option|optgroup|table|thead|tbody|tfoot|tr|th|td|form|fieldset|legend|label)[\s\S]*?\*\//gi,  // Comentários de bloco
  /['"`].*<(select|dialog|progress|input|details|summary|meter|datalist|option|optgroup|table|thead|tbody|tfoot|tr|th|td|form|fieldset|legend|label).*['"`]/gi,  // Strings
  /WCAG Exception:/i,  // Exceções documentadas
];

let violations = [];
let filesChecked = 0;

/**
 * Verifica se um arquivo deve ser ignorado
 */
function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Remove exceções do conteúdo antes da verificação
 */
function removeExceptions(content) {
  let cleaned = content;
  CONTENT_EXCEPTIONS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  return cleaned;
}

/**
 * Verifica um arquivo em busca de elementos nativos
 */
function checkFile(filePath) {
  if (shouldIgnoreFile(filePath)) {
    return;
  }

  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) {
    return;
  }

  filesChecked++;
  const content = fs.readFileSync(filePath, 'utf8');
  const cleanedContent = removeExceptions(content);
  const lines = content.split('\n');

  NATIVE_ELEMENTS.forEach(({ pattern, element, replacement, severity }) => {
    // Reset pattern lastIndex
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(cleanedContent)) !== null) {
      // Encontrar número da linha
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
      const lineContent = lines[lineNumber - 1]?.trim() || '';

      violations.push({
        file: filePath,
        line: lineNumber,
        element,
        replacement,
        severity,
        content: lineContent.substring(0, 100)
      });
    }
  });
}

/**
 * Percorre diretório recursivamente
 */
function walkDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else {
      checkFile(filePath);
    }
  });
}

/**
 * Formata saída para terminal
 */
function formatOutput() {
  if (violations.length === 0) {
    console.log('');
    console.log('✅ Nenhum elemento HTML nativo detectado!');
    console.log(`   ${filesChecked} arquivos verificados`);
    console.log('');
    return;
  }

  console.log('');
  console.log('❌ ELEMENTOS HTML NATIVOS DETECTADOS');
  console.log('═'.repeat(60));
  console.log('');

  // Agrupar por arquivo
  const byFile = {};
  violations.forEach(v => {
    if (!byFile[v.file]) byFile[v.file] = [];
    byFile[v.file].push(v);
  });

  Object.entries(byFile).forEach(([file, fileViolations]) => {
    console.log(`📄 ${file}`);
    fileViolations.forEach(v => {
      const icon = v.severity === 'error' ? '🔴' : '🟡';
      console.log(`   ${icon} Linha ${v.line}: ${v.element}`);
      console.log(`      └─ Substituir por: ${v.replacement}`);
      if (v.content) {
        console.log(`      └─ Código: ${v.content}...`);
      }
    });
    console.log('');
  });

  console.log('═'.repeat(60));
  console.log(`📊 Total: ${violations.length} violação(ões) em ${Object.keys(byFile).length} arquivo(s)`);
  console.log(`   ${filesChecked} arquivos verificados`);
  console.log('');
  console.log('💡 Dica: Use componentes Radix/Shadcn UI em vez de elementos HTML nativos');
  console.log('   para garantir acessibilidade e consistência visual.');
  console.log('');
}

/**
 * Formata saída JSON
 */
function formatJSON() {
  console.log(JSON.stringify({
    success: violations.length === 0,
    filesChecked,
    violationCount: violations.length,
    violations
  }, null, 2));
}

// Executar verificação
console.log('🔍 Verificando elementos HTML nativos...');

DIRS_TO_CHECK.forEach(dir => {
  walkDir(dir);
});

// Output
const isJSON = process.argv.includes('--json');
if (isJSON) {
  formatJSON();
} else {
  formatOutput();
}

// Exit code
process.exit(violations.length > 0 ? 1 : 0);
