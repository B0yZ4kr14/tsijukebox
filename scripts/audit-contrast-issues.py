#!/usr/bin/env python3
"""
TSiJUKEBOX - Auditoria de Problemas de Contraste
================================================

Este script identifica e lista todas as ocorrências de padrões que podem
causar problemas de contraste, priorizando os arquivos mais críticos.

Padrões identificados:
- text-muted / text-[var(--text-muted)]
- opacity-50 / opacity-60
- text-gray-400 / text-gray-500
- Cores com baixo contraste potencial

Uso:
    python3 scripts/audit-contrast-issues.py              # Relatório completo
    python3 scripts/audit-contrast-issues.py --summary    # Apenas resumo
    python3 scripts/audit-contrast-issues.py --export     # Exportar para CSV
    python3 scripts/audit-contrast-issues.py --critical   # Apenas arquivos críticos
"""

import re
import argparse
import csv
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from dataclasses import dataclass
from typing import List, Dict, Tuple

# Diretório base
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"

# Padrões de contraste problemáticos
CONTRAST_PATTERNS = {
    # Padrão: (regex, descrição, severidade, sugestão)
    'text-muted': (
        r'text-muted(?:-foreground)?',
        'Classe text-muted pode ter baixo contraste',
        'ALTA',
        'Verificar se --muted-foreground tem ratio >= 4.5:1'
    ),
    'text-muted-var': (
        r'text-\[var\(--text-muted\)\]',
        'Variável CSS --text-muted pode ter baixo contraste',
        'ALTA',
        'Verificar valor de --text-muted no tema'
    ),
    'opacity-50': (
        r'opacity-50',
        'Opacidade 50% reduz contraste pela metade',
        'MÉDIA',
        'Usar cor com contraste adequado em vez de opacidade'
    ),
    'opacity-60': (
        r'opacity-60',
        'Opacidade 60% reduz contraste significativamente',
        'MÉDIA',
        'Usar cor com contraste adequado em vez de opacidade'
    ),
    'opacity-40': (
        r'opacity-40',
        'Opacidade 40% causa baixo contraste severo',
        'ALTA',
        'Usar cor com contraste adequado em vez de opacidade'
    ),
    'opacity-30': (
        r'opacity-30',
        'Opacidade 30% causa contraste muito baixo',
        'CRÍTICA',
        'Remover ou usar cor visível'
    ),
    'text-gray-400': (
        r'text-gray-400',
        'Cinza 400 (#9ca3af) tem contraste ~3.5:1 em fundo escuro',
        'MÉDIA',
        'Usar text-gray-300 ou mais claro'
    ),
    'text-gray-500': (
        r'text-gray-500',
        'Cinza 500 (#6b7280) tem contraste ~4.6:1 em fundo escuro',
        'BAIXA',
        'Aceitável para texto grande, verificar para texto pequeno'
    ),
    'text-gray-600': (
        r'text-gray-600',
        'Cinza 600 (#4b5563) tem baixo contraste em fundo escuro',
        'ALTA',
        'Usar text-gray-400 ou mais claro em temas escuros'
    ),
    'text-zinc-400': (
        r'text-zinc-400',
        'Zinc 400 pode ter baixo contraste',
        'MÉDIA',
        'Verificar contraste no tema atual'
    ),
    'text-zinc-500': (
        r'text-zinc-500',
        'Zinc 500 pode ter baixo contraste',
        'MÉDIA',
        'Verificar contraste no tema atual'
    ),
    'text-slate-400': (
        r'text-slate-400',
        'Slate 400 pode ter baixo contraste',
        'MÉDIA',
        'Verificar contraste no tema atual'
    ),
    'text-slate-500': (
        r'text-slate-500',
        'Slate 500 pode ter baixo contraste',
        'MÉDIA',
        'Verificar contraste no tema atual'
    ),
    'placeholder-opacity': (
        r'placeholder-opacity-\d+',
        'Placeholder com opacidade reduzida',
        'BAIXA',
        'Placeholders têm requisito de contraste 3:1'
    ),
    'text-white-opacity': (
        r'text-white/[1-5]0',
        'Texto branco com opacidade baixa',
        'ALTA',
        'Usar cor sólida com contraste adequado'
    ),
    'text-black-opacity': (
        r'text-black/[1-5]0',
        'Texto preto com opacidade baixa',
        'ALTA',
        'Usar cor sólida com contraste adequado'
    ),
}

# Arquivos críticos (páginas principais, componentes de UI core)
CRITICAL_PATHS = [
    'pages/public/',
    'pages/dashboards/',
    'components/ui/',
    'components/player/',
    'components/navigation/',
    'components/layout/',
    'components/landing/',
]

@dataclass
class ContrastIssue:
    """Representa um problema de contraste encontrado."""
    file: str
    line: int
    column: int
    pattern: str
    match: str
    context: str
    severity: str
    description: str
    suggestion: str
    is_critical: bool


def is_critical_file(filepath: str) -> bool:
    """Verifica se o arquivo está em um caminho crítico."""
    for critical_path in CRITICAL_PATHS:
        if critical_path in filepath:
            return True
    return False


def get_line_context(content: str, pos: int, context_chars: int = 50) -> Tuple[int, int, str]:
    """Retorna número da linha, coluna e contexto ao redor da posição."""
    lines = content[:pos].split('\n')
    line_num = len(lines)
    col_num = len(lines[-1]) + 1 if lines else 1
    
    # Extrair contexto
    start = max(0, pos - context_chars)
    end = min(len(content), pos + context_chars)
    context = content[start:end].replace('\n', ' ').strip()
    
    return line_num, col_num, context


def scan_file(filepath: Path) -> List[ContrastIssue]:
    """Escaneia um arquivo em busca de problemas de contraste."""
    issues = []
    
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Erro ao ler {filepath}: {e}")
        return issues
    
    rel_path = str(filepath.relative_to(BASE_DIR))
    is_critical = is_critical_file(rel_path)
    
    for pattern_name, (regex, description, severity, suggestion) in CONTRAST_PATTERNS.items():
        for match in re.finditer(regex, content):
            line_num, col_num, context = get_line_context(content, match.start())
            
            issues.append(ContrastIssue(
                file=rel_path,
                line=line_num,
                column=col_num,
                pattern=pattern_name,
                match=match.group(),
                context=context,
                severity=severity,
                description=description,
                suggestion=suggestion,
                is_critical=is_critical
            ))
    
    return issues


def generate_report(issues: List[ContrastIssue], summary_only: bool = False) -> str:
    """Gera relatório de problemas de contraste."""
    
    # Agrupar por arquivo
    by_file: Dict[str, List[ContrastIssue]] = defaultdict(list)
    for issue in issues:
        by_file[issue.file].append(issue)
    
    # Agrupar por severidade
    by_severity: Dict[str, int] = defaultdict(int)
    for issue in issues:
        by_severity[issue.severity] += 1
    
    # Agrupar por padrão
    by_pattern: Dict[str, int] = defaultdict(int)
    for issue in issues:
        by_pattern[issue.pattern] += 1
    
    # Separar críticos
    critical_files = {f: i for f, i in by_file.items() if any(x.is_critical for x in i)}
    non_critical_files = {f: i for f, i in by_file.items() if not any(x.is_critical for x in i)}
    
    report = []
    report.append("=" * 70)
    report.append("📊 AUDITORIA DE CONTRASTE - TSiJUKEBOX")
    report.append("=" * 70)
    report.append(f"\nData: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append("")
    
    # Resumo
    report.append("## 📈 RESUMO")
    report.append("-" * 50)
    report.append(f"Total de ocorrências: {len(issues)}")
    report.append(f"Arquivos afetados: {len(by_file)}")
    report.append(f"Arquivos críticos: {len(critical_files)}")
    report.append("")
    
    # Por severidade
    report.append("### Por Severidade:")
    severity_order = ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA']
    for sev in severity_order:
        if sev in by_severity:
            emoji = {'CRÍTICA': '🔴', 'ALTA': '🟠', 'MÉDIA': '🟡', 'BAIXA': '🟢'}[sev]
            report.append(f"   {emoji} {sev}: {by_severity[sev]}")
    report.append("")
    
    # Por padrão
    report.append("### Por Padrão:")
    for pattern, count in sorted(by_pattern.items(), key=lambda x: -x[1]):
        report.append(f"   - {pattern}: {count}")
    report.append("")
    
    if summary_only:
        return '\n'.join(report)
    
    # Arquivos críticos detalhados
    report.append("=" * 70)
    report.append("🔴 ARQUIVOS CRÍTICOS (Prioridade Alta)")
    report.append("=" * 70)
    
    for filepath in sorted(critical_files.keys(), key=lambda x: -len(critical_files[x])):
        file_issues = critical_files[filepath]
        report.append(f"\n### 📁 {filepath} ({len(file_issues)} ocorrências)")
        report.append("")
        report.append("| Linha | Padrão | Severidade | Match |")
        report.append("|-------|--------|------------|-------|")
        
        for issue in sorted(file_issues, key=lambda x: x.line):
            sev_emoji = {'CRÍTICA': '🔴', 'ALTA': '🟠', 'MÉDIA': '🟡', 'BAIXA': '🟢'}[issue.severity]
            report.append(f"| {issue.line} | `{issue.pattern}` | {sev_emoji} {issue.severity} | `{issue.match}` |")
    
    # Arquivos não-críticos (resumido)
    report.append("")
    report.append("=" * 70)
    report.append("🟡 OUTROS ARQUIVOS")
    report.append("=" * 70)
    
    for filepath in sorted(non_critical_files.keys(), key=lambda x: -len(non_critical_files[x]))[:20]:
        file_issues = non_critical_files[filepath]
        severities = defaultdict(int)
        for i in file_issues:
            severities[i.severity] += 1
        
        sev_str = ', '.join(f"{s}: {c}" for s, c in severities.items())
        report.append(f"   - {filepath}: {len(file_issues)} ({sev_str})")
    
    if len(non_critical_files) > 20:
        report.append(f"   ... e mais {len(non_critical_files) - 20} arquivos")
    
    # Recomendações
    report.append("")
    report.append("=" * 70)
    report.append("💡 RECOMENDAÇÕES")
    report.append("=" * 70)
    report.append("")
    report.append("1. **Verificar variável --text-muted no CSS:**")
    report.append("   - Localização: src/index.css ou tailwind.config.js")
    report.append("   - Garantir ratio >= 4.5:1 contra o fundo")
    report.append("")
    report.append("2. **Substituir opacity por cores sólidas:**")
    report.append("   - `opacity-50` → usar cor com 50% mais contraste")
    report.append("   - `text-white/50` → usar `text-gray-400` ou similar")
    report.append("")
    report.append("3. **Usar ferramentas de verificação:**")
    report.append("   - WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/")
    report.append("   - Chrome DevTools > Lighthouse > Accessibility")
    report.append("")
    report.append("4. **Padrão WCAG 2.1 AA:**")
    report.append("   - Texto normal: ratio >= 4.5:1")
    report.append("   - Texto grande (18px+ ou 14px bold): ratio >= 3:1")
    report.append("   - Componentes UI: ratio >= 3:1")
    
    return '\n'.join(report)


def export_to_csv(issues: List[ContrastIssue], output_path: Path):
    """Exporta problemas para CSV."""
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'Arquivo', 'Linha', 'Coluna', 'Padrão', 'Match', 
            'Severidade', 'Crítico', 'Descrição', 'Sugestão'
        ])
        
        for issue in sorted(issues, key=lambda x: (not x.is_critical, x.severity, x.file, x.line)):
            writer.writerow([
                issue.file,
                issue.line,
                issue.column,
                issue.pattern,
                issue.match,
                issue.severity,
                'Sim' if issue.is_critical else 'Não',
                issue.description,
                issue.suggestion
            ])


def main():
    parser = argparse.ArgumentParser(
        description='Auditoria de problemas de contraste no TSiJUKEBOX'
    )
    parser.add_argument('--summary', action='store_true',
                        help='Mostrar apenas resumo')
    parser.add_argument('--export', action='store_true',
                        help='Exportar para CSV')
    parser.add_argument('--critical', action='store_true',
                        help='Mostrar apenas arquivos críticos')
    parser.add_argument('--file', type=str,
                        help='Analisar arquivo específico')
    
    args = parser.parse_args()
    
    # Coletar arquivos
    if args.file:
        files = [Path(args.file)]
    else:
        files = list(SRC_DIR.rglob('*.tsx'))
    
    print(f"🔍 Analisando {len(files)} arquivos...")
    
    # Escanear arquivos
    all_issues = []
    for filepath in files:
        issues = scan_file(filepath)
        all_issues.extend(issues)
    
    # Filtrar se necessário
    if args.critical:
        all_issues = [i for i in all_issues if i.is_critical]
    
    # Gerar relatório
    report = generate_report(all_issues, summary_only=args.summary)
    print(report)
    
    # Exportar se solicitado
    if args.export:
        output_path = BASE_DIR / "docs" / "accessibility" / "contrast_issues.csv"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        export_to_csv(all_issues, output_path)
        print(f"\n📄 CSV exportado para: {output_path}")
    
    # Salvar relatório
    report_path = BASE_DIR / "docs" / "accessibility" / "CONTRAST_AUDIT_REPORT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"\n📝 Relatório salvo em: {report_path}")


if __name__ == '__main__':
    main()
