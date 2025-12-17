import { wikiCategories, WikiArticle, WikiCategory } from '@/components/wiki/wikiData';

export interface HelpSection {
  id: string;
  title: string;
  items: HelpItem[];
}

export interface HelpItem {
  id?: string;
  question: string;
  answer: string;
  steps?: string[];
  tips?: string[];
}

// Generate slug for anchor links
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// Export Help section to Markdown
function exportHelpToMarkdown(helpSections: HelpSection[]): string {
  let md = '';
  
  helpSections.forEach(section => {
    md += `## ${section.title}\n\n`;
    
    section.items.forEach(item => {
      md += `### ${item.question}\n\n`;
      md += `${item.answer}\n\n`;
      
      if (item.steps && item.steps.length > 0) {
        md += `**Passo a passo:**\n\n`;
        item.steps.forEach((step, i) => {
          md += `${i + 1}. ${step}\n`;
        });
        md += '\n';
      }
      
      if (item.tips && item.tips.length > 0) {
        md += `**Dicas:**\n\n`;
        item.tips.forEach(tip => {
          md += `- ${tip}\n`;
        });
        md += '\n';
      }
      
      md += '---\n\n';
    });
  });
  
  return md;
}

// Export Wiki to Markdown
function exportWikiToMarkdown(): string {
  let md = '';
  
  wikiCategories.forEach(category => {
    md += `## ${category.title}\n\n`;
    md += `${category.description}\n\n`;
    
    category.subSections.forEach(subSection => {
      md += `### ${subSection.title}\n\n`;
      
      subSection.articles.forEach(article => {
        md += `#### ${article.title}\n\n`;
        
        if (article.description) {
          md += `*${article.description}*\n\n`;
        }
        
        if (article.content) {
          md += `${article.content}\n\n`;
        }
        
        if (article.steps && article.steps.length > 0) {
          md += `**Passo a passo:**\n\n`;
          article.steps.forEach((step, i) => {
            md += `${i + 1}. ${step}\n`;
          });
          md += '\n';
        }
        
        if (article.tips && article.tips.length > 0) {
          md += `**Dicas:**\n\n`;
          article.tips.forEach(tip => {
            md += `- ${tip}\n`;
          });
          md += '\n';
        }
        
        if (article.relatedArticles && article.relatedArticles.length > 0) {
          md += `**Artigos relacionados:** ${article.relatedArticles.join(', ')}\n\n`;
        }
        
        md += '---\n\n';
      });
    });
  });
  
  return md;
}

// Generate Table of Contents for Help
function generateHelpTOC(helpSections: HelpSection[]): string {
  let toc = '### Manual de Ajuda\n\n';
  
  helpSections.forEach(section => {
    toc += `- [${section.title}](#${slugify(section.title)})\n`;
    section.items.forEach(item => {
      toc += `  - [${item.question}](#${slugify(item.question)})\n`;
    });
  });
  
  return toc + '\n';
}

// Generate Table of Contents for Wiki
function generateWikiTOC(): string {
  let toc = '### Wiki\n\n';
  
  wikiCategories.forEach(category => {
    toc += `- [${category.title}](#${slugify(category.title)})\n`;
    category.subSections.forEach(subSection => {
      toc += `  - [${subSection.title}](#${slugify(subSection.title)})\n`;
      subSection.articles.forEach(article => {
        toc += `    - [${article.title}](#${slugify(article.title)})\n`;
      });
    });
  });
  
  return toc + '\n';
}

// Main export function - generates complete Markdown
export function generateFullMarkdown(helpSections: HelpSection[]): string {
  const date = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let md = `# TSiJUKEBOX - Documentação Completa

**Versão:** 1.0  
**Gerado em:** ${date}

---

## 📑 Índice

${generateHelpTOC(helpSections)}
${generateWikiTOC()}

---

# Manual de Ajuda

${exportHelpToMarkdown(helpSections)}

---

# Wiki Completa

${exportWikiToMarkdown()}

---

*Documento gerado automaticamente pelo TSiJUKEBOX*
`;

  return md;
}

// Generate HTML with styling
export function generateFullHTML(helpSections: HelpSection[]): string {
  const markdown = generateFullMarkdown(helpSections);
  
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^\*\*(.*?)\*\*$/gm, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TSiJUKEBOX - Documentação</title>
  <style>
    :root {
      --bg: #1a1a2e;
      --text: #e4e4e7;
      --primary: #1DB954;
      --border: #333355;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }
    h2 { color: #60a5fa; margin-top: 2rem; }
    h3 { color: #a78bfa; }
    h4 { color: #f472b6; }
    a { color: var(--primary); }
    code { background: #2d2d44; padding: 0.2rem 0.4rem; border-radius: 4px; }
    hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
    li { margin: 0.25rem 0; }
    ul, ol { padding-left: 1.5rem; }
    strong { color: #fbbf24; }
    em { color: #94a3b8; }
    @media print {
      body { background: white; color: black; }
      h1, h2, h3, h4 { color: #1a1a2e; }
      a { color: #1DB954; }
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

// Download functions
export function downloadMarkdown(helpSections: HelpSection[], filename = 'tsi-jukebox-documentacao.md') {
  const content = generateFullMarkdown(helpSections);
  downloadFile(content, filename, 'text/markdown');
}

export function downloadHTML(helpSections: HelpSection[], filename = 'tsi-jukebox-documentacao.html') {
  const content = generateFullHTML(helpSections);
  downloadFile(content, filename, 'text/html');
}

export function printDocument(helpSections: HelpSection[]) {
  const html = generateFullHTML(helpSections);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

// Helper function to download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
