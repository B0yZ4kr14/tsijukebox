#!/usr/bin/env python3
"""
Gerador de Relatório HTML Interativo de Contraste
==================================================

Este script gera um relatório HTML interativo com visualização
dos problemas de contraste de cores detectados no projeto.

Funcionalidades:
- Visualização de cores com preview
- Filtros por severidade, arquivo e ratio
- Ordenação por múltiplas colunas
- Sugestões de cores acessíveis
- Exportação para CSV

Uso:
    python3 generate-contrast-report-html.py --analyze src/
    python3 generate-contrast-report-html.py --analyze src/ -o report.html

Autor: TSiJUKEBOX Team
Versão: 1.0.0
Data: 2025-12-25
"""

import os
import sys
import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict

# Importar analisador de contraste
from contrast_analyzer import (
    analyze_color_contrast,
    find_files,
    ContrastMetrics,
    ContrastIssue,
    BASE_DIR
)

from color_utils import (
    suggest_accessible_color,
    parse_color,
    calculate_contrast_ratio
)


# =============================================================================
# TEMPLATE HTML
# =============================================================================

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Contraste de Cores - {project_name}</title>
    <style>
        :root {{
            --bg-primary: #0a0a0b;
            --bg-secondary: #18181b;
            --bg-tertiary: #27272a;
            --text-primary: #fafafa;
            --text-secondary: #a1a1aa;
            --text-muted: #71717a;
            --border: #3f3f46;
            --accent: #3b82f6;
            --critical: #ef4444;
            --high: #f97316;
            --medium: #eab308;
            --low: #22c55e;
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }}
        
        header {{
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border);
        }}
        
        h1 {{
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--accent), #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .subtitle {{
            color: var(--text-secondary);
            font-size: 1.1rem;
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }}
        
        .stat-card {{
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid var(--border);
        }}
        
        .stat-card.critical {{ border-left: 4px solid var(--critical); }}
        .stat-card.high {{ border-left: 4px solid var(--high); }}
        .stat-card.medium {{ border-left: 4px solid var(--medium); }}
        .stat-card.low {{ border-left: 4px solid var(--low); }}
        
        .stat-value {{
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }}
        
        .stat-label {{
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        .filters {{
            background: var(--bg-secondary);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid var(--border);
        }}
        
        .filters-row {{
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;
        }}
        
        .filter-group {{
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }}
        
        .filter-group label {{
            font-size: 0.85rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        
        select, input[type="text"] {{
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 0.75rem 1rem;
            color: var(--text-primary);
            font-size: 0.95rem;
            min-width: 180px;
        }}
        
        select:focus, input:focus {{
            outline: none;
            border-color: var(--accent);
        }}
        
        .issues-table {{
            width: 100%;
            border-collapse: collapse;
            background: var(--bg-secondary);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--border);
        }}
        
        .issues-table th {{
            background: var(--bg-tertiary);
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
            cursor: pointer;
            user-select: none;
        }}
        
        .issues-table th:hover {{
            background: var(--border);
        }}
        
        .issues-table th .sort-icon {{
            margin-left: 0.5rem;
            opacity: 0.5;
        }}
        
        .issues-table th.sorted .sort-icon {{
            opacity: 1;
        }}
        
        .issues-table td {{
            padding: 1rem;
            border-top: 1px solid var(--border);
            vertical-align: middle;
        }}
        
        .issues-table tr:hover {{
            background: var(--bg-tertiary);
        }}
        
        .severity-badge {{
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }}
        
        .severity-badge.critical {{
            background: rgba(239, 68, 68, 0.2);
            color: var(--critical);
        }}
        
        .severity-badge.high {{
            background: rgba(249, 115, 22, 0.2);
            color: var(--high);
        }}
        
        .severity-badge.medium {{
            background: rgba(234, 179, 8, 0.2);
            color: var(--medium);
        }}
        
        .severity-badge.low {{
            background: rgba(34, 197, 94, 0.2);
            color: var(--low);
        }}
        
        .color-preview {{
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }}
        
        .color-swatch {{
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: 2px solid var(--border);
            flex-shrink: 0;
        }}
        
        .color-info {{
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
        }}
        
        .color-hex {{
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 0.9rem;
        }}
        
        .color-luminance {{
            font-size: 0.75rem;
            color: var(--text-muted);
        }}
        
        .contrast-preview {{
            display: flex;
            align-items: center;
            gap: 1rem;
        }}
        
        .contrast-sample {{
            width: 80px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.85rem;
            border: 1px solid var(--border);
        }}
        
        .ratio-value {{
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 1.1rem;
            font-weight: 700;
        }}
        
        .ratio-value.fail {{
            color: var(--critical);
        }}
        
        .ratio-value.pass {{
            color: var(--low);
        }}
        
        .file-link {{
            color: var(--accent);
            text-decoration: none;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 0.85rem;
        }}
        
        .file-link:hover {{
            text-decoration: underline;
        }}
        
        .line-number {{
            color: var(--text-muted);
            font-size: 0.85rem;
        }}
        
        .context-code {{
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 0.8rem;
            color: var(--text-secondary);
            background: var(--bg-primary);
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }}
        
        .suggestion {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        
        .suggestion-arrow {{
            color: var(--text-muted);
        }}
        
        .suggestion-color {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        
        .suggestion-swatch {{
            width: 24px;
            height: 24px;
            border-radius: 4px;
            border: 1px solid var(--border);
        }}
        
        .suggestion-hex {{
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 0.85rem;
            color: var(--low);
        }}
        
        .no-results {{
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }}
        
        .export-btn {{
            background: var(--accent);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 0.95rem;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
        }}
        
        .export-btn:hover {{
            opacity: 0.9;
        }}
        
        footer {{
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
            color: var(--text-muted);
            font-size: 0.9rem;
        }}
        
        @media (max-width: 768px) {{
            .container {{
                padding: 1rem;
            }}
            
            .stats-grid {{
                grid-template-columns: repeat(2, 1fr);
            }}
            
            .filters-row {{
                flex-direction: column;
                align-items: stretch;
            }}
            
            select, input[type="text"] {{
                width: 100%;
            }}
            
            .issues-table {{
                display: block;
                overflow-x: auto;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎨 Relatório de Contraste de Cores</h1>
            <p class="subtitle">{project_name} • Gerado em {generated_at}</p>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">{total_issues}</div>
                <div class="stat-label">Issues Encontrados</div>
            </div>
            <div class="stat-card critical">
                <div class="stat-value" style="color: var(--critical)">{critical_count}</div>
                <div class="stat-label">Críticos</div>
            </div>
            <div class="stat-card high">
                <div class="stat-value" style="color: var(--high)">{high_count}</div>
                <div class="stat-label">Alta Prioridade</div>
            </div>
            <div class="stat-card medium">
                <div class="stat-value" style="color: var(--medium)">{medium_count}</div>
                <div class="stat-label">Média Prioridade</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{worst_ratio}</div>
                <div class="stat-label">Pior Ratio</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">{pass_rate}%</div>
                <div class="stat-label">Taxa Aprovação AA</div>
            </div>
        </div>
        
        <div class="filters">
            <div class="filters-row">
                <div class="filter-group">
                    <label>Severidade</label>
                    <select id="filter-severity">
                        <option value="">Todas</option>
                        <option value="CRITICAL">🔴 Crítico</option>
                        <option value="HIGH">🟠 Alta</option>
                        <option value="MEDIUM">🟡 Média</option>
                        <option value="LOW">🟢 Baixa</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Arquivo</label>
                    <select id="filter-file">
                        <option value="">Todos</option>
                        {file_options}
                    </select>
                </div>
                <div class="filter-group">
                    <label>Ratio Máximo</label>
                    <input type="text" id="filter-ratio" placeholder="ex: 3.0">
                </div>
                <div class="filter-group">
                    <label>Buscar</label>
                    <input type="text" id="filter-search" placeholder="Buscar...">
                </div>
                <div class="filter-group" style="margin-left: auto;">
                    <label>&nbsp;</label>
                    <button class="export-btn" onclick="exportCSV()">📥 Exportar CSV</button>
                </div>
            </div>
        </div>
        
        <table class="issues-table" id="issues-table">
            <thead>
                <tr>
                    <th data-sort="severity">Severidade <span class="sort-icon">↕</span></th>
                    <th data-sort="ratio">Ratio <span class="sort-icon">↕</span></th>
                    <th data-sort="file">Arquivo <span class="sort-icon">↕</span></th>
                    <th>Texto</th>
                    <th>Fundo</th>
                    <th>Preview</th>
                    <th>Sugestão</th>
                </tr>
            </thead>
            <tbody id="issues-body">
                {issues_rows}
            </tbody>
        </table>
        
        <div class="no-results" id="no-results" style="display: none;">
            Nenhum issue encontrado com os filtros selecionados.
        </div>
        
        <footer>
            <p>Gerado por TSiJUKEBOX Contrast Analyzer • WCAG 2.1 AA</p>
            <p>Ratio mínimo requerido: 4.5:1 (texto normal) | 3.0:1 (texto grande)</p>
        </footer>
    </div>
    
    <script>
        const issuesData = {issues_json};
        
        // Filtros
        const filterSeverity = document.getElementById('filter-severity');
        const filterFile = document.getElementById('filter-file');
        const filterRatio = document.getElementById('filter-ratio');
        const filterSearch = document.getElementById('filter-search');
        const issuesBody = document.getElementById('issues-body');
        const noResults = document.getElementById('no-results');
        
        function applyFilters() {{
            const severity = filterSeverity.value;
            const file = filterFile.value;
            const maxRatio = parseFloat(filterRatio.value) || 999;
            const search = filterSearch.value.toLowerCase();
            
            let visibleCount = 0;
            const rows = issuesBody.querySelectorAll('tr');
            
            rows.forEach((row, index) => {{
                const issue = issuesData[index];
                let visible = true;
                
                if (severity && issue.severity !== severity) visible = false;
                if (file && !issue.file.includes(file)) visible = false;
                if (issue.ratio > maxRatio) visible = false;
                if (search && !JSON.stringify(issue).toLowerCase().includes(search)) visible = false;
                
                row.style.display = visible ? '' : 'none';
                if (visible) visibleCount++;
            }});
            
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }}
        
        filterSeverity.addEventListener('change', applyFilters);
        filterFile.addEventListener('change', applyFilters);
        filterRatio.addEventListener('input', applyFilters);
        filterSearch.addEventListener('input', applyFilters);
        
        // Ordenação
        let currentSort = {{ column: 'ratio', direction: 'asc' }};
        
        document.querySelectorAll('.issues-table th[data-sort]').forEach(th => {{
            th.addEventListener('click', () => {{
                const column = th.dataset.sort;
                
                if (currentSort.column === column) {{
                    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                }} else {{
                    currentSort.column = column;
                    currentSort.direction = 'asc';
                }}
                
                sortTable();
            }});
        }});
        
        function sortTable() {{
            const rows = Array.from(issuesBody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {{
                const indexA = parseInt(a.dataset.index);
                const indexB = parseInt(b.dataset.index);
                const issueA = issuesData[indexA];
                const issueB = issuesData[indexB];
                
                let valA, valB;
                
                switch (currentSort.column) {{
                    case 'severity':
                        const order = {{ 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }};
                        valA = order[issueA.severity];
                        valB = order[issueB.severity];
                        break;
                    case 'ratio':
                        valA = issueA.ratio;
                        valB = issueB.ratio;
                        break;
                    case 'file':
                        valA = issueA.file;
                        valB = issueB.file;
                        break;
                    default:
                        return 0;
                }}
                
                if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            }});
            
            rows.forEach(row => issuesBody.appendChild(row));
            
            // Atualizar indicadores de ordenação
            document.querySelectorAll('.issues-table th').forEach(th => {{
                th.classList.remove('sorted');
                const icon = th.querySelector('.sort-icon');
                if (icon) icon.textContent = '↕';
            }});
            
            const sortedTh = document.querySelector(`th[data-sort="${{currentSort.column}}"]`);
            if (sortedTh) {{
                sortedTh.classList.add('sorted');
                const icon = sortedTh.querySelector('.sort-icon');
                if (icon) icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
            }}
        }}
        
        // Exportar CSV
        function exportCSV() {{
            const headers = ['Severidade', 'Ratio', 'Requerido', 'Arquivo', 'Linha', 'Texto', 'Fundo', 'Sugestão'];
            const rows = issuesData.map(issue => [
                issue.severity,
                issue.ratio,
                issue.required_ratio,
                issue.file,
                issue.line,
                issue.foreground,
                issue.background,
                issue.suggestion || ''
            ]);
            
            const csv = [headers, ...rows].map(row => row.join(',')).join('\\n');
            const blob = new Blob([csv], {{ type: 'text/csv' }});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contrast-issues.csv';
            a.click();
            
            URL.revokeObjectURL(url);
        }}
        
        // Ordenar por ratio inicialmente
        sortTable();
    </script>
</body>
</html>
"""


# =============================================================================
# GERAÇÃO DO RELATÓRIO
# =============================================================================

def generate_issue_row(issue: ContrastIssue, index: int) -> str:
    """Gera uma linha HTML para um issue."""
    
    severity_class = issue.severity.lower()
    severity_icons = {
        'CRITICAL': '🔴',
        'HIGH': '🟠',
        'MEDIUM': '🟡',
        'LOW': '🟢'
    }
    
    # Calcular sugestão de cor acessível
    suggestion_html = ''
    fg = parse_color(issue.foreground.hex)
    bg = parse_color(issue.background.hex)
    
    if fg and bg:
        suggested = suggest_accessible_color(fg, bg, issue.required_ratio)
        if suggested:
            new_ratio = calculate_contrast_ratio(suggested, bg)
            suggestion_html = f'''
                <div class="suggestion">
                    <span class="suggestion-arrow">→</span>
                    <div class="suggestion-color">
                        <div class="suggestion-swatch" style="background: {suggested.hex}"></div>
                        <span class="suggestion-hex">{suggested.hex}</span>
                        <span class="color-luminance">({new_ratio:.1f}:1)</span>
                    </div>
                </div>
            '''
    
    # Determinar se passa ou falha
    ratio_class = 'pass' if issue.ratio >= issue.required_ratio else 'fail'
    
    # Extrair nome do arquivo
    filename = Path(issue.file).name
    
    return f'''
        <tr data-index="{index}">
            <td>
                <span class="severity-badge {severity_class}">
                    {severity_icons.get(issue.severity, '')} {issue.severity}
                </span>
            </td>
            <td>
                <span class="ratio-value {ratio_class}">{issue.ratio:.2f}:1</span>
                <div class="color-luminance">Req: {issue.required_ratio}:1</div>
            </td>
            <td>
                <a href="#" class="file-link" title="{issue.file}">{filename}</a>
                <div class="line-number">Linha {issue.line}</div>
            </td>
            <td>
                <div class="color-preview">
                    <div class="color-swatch" style="background: {issue.foreground.hex}"></div>
                    <div class="color-info">
                        <span class="color-hex">{issue.foreground.hex}</span>
                        <span class="color-luminance">L: {issue.foreground.luminance:.3f}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="color-preview">
                    <div class="color-swatch" style="background: {issue.background.hex}"></div>
                    <div class="color-info">
                        <span class="color-hex">{issue.background.hex}</span>
                        <span class="color-luminance">L: {issue.background.luminance:.3f}</span>
                    </div>
                </div>
            </td>
            <td>
                <div class="contrast-preview">
                    <div class="contrast-sample" style="background: {issue.background.hex}; color: {issue.foreground.hex}">
                        Texto
                    </div>
                </div>
            </td>
            <td>
                {suggestion_html if suggestion_html else '<span class="color-luminance">—</span>'}
            </td>
        </tr>
    '''


def generate_html_report(metrics: ContrastMetrics, project_name: str = 'TSiJUKEBOX') -> str:
    """Gera o relatório HTML completo."""
    
    # Gerar linhas da tabela
    issues_rows = '\n'.join(
        generate_issue_row(issue, i) 
        for i, issue in enumerate(sorted(metrics.issues, key=lambda x: x.ratio))
    )
    
    # Gerar opções de arquivo
    files = sorted(set(Path(i.file).name for i in metrics.issues))
    file_options = '\n'.join(f'<option value="{f}">{f}</option>' for f in files)
    
    # Gerar JSON dos issues para JavaScript
    issues_json = json.dumps([{
        'severity': i.severity,
        'ratio': i.ratio,
        'required_ratio': i.required_ratio,
        'file': i.file,
        'line': i.line,
        'foreground': i.foreground.hex,
        'background': i.background.hex,
        'suggestion': None,  # Será calculado no frontend se necessário
    } for i in metrics.issues])
    
    # Preencher template
    html = HTML_TEMPLATE.format(
        project_name=project_name,
        generated_at=datetime.now().strftime('%d/%m/%Y às %H:%M'),
        total_issues=metrics.issues_found,
        critical_count=metrics.issues_by_severity.get('CRITICAL', 0),
        high_count=metrics.issues_by_severity.get('HIGH', 0),
        medium_count=metrics.issues_by_severity.get('MEDIUM', 0),
        worst_ratio=f"{metrics.worst_ratio:.2f}:1",
        pass_rate=f"{metrics.pass_rate_aa:.1f}",
        file_options=file_options,
        issues_rows=issues_rows,
        issues_json=issues_json,
    )
    
    return html


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Gera relatório HTML interativo de contraste de cores',
    )
    
    parser.add_argument(
        '--analyze', '-a',
        type=str,
        nargs='+',
        required=True,
        help='Arquivos ou diretórios para analisar'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='docs/accessibility/contrast-report.html',
        help='Arquivo de saída (default: docs/accessibility/contrast-report.html)'
    )
    parser.add_argument(
        '--level', '-l',
        choices=['aa', 'aaa'],
        default='aa',
        help='Nível WCAG (default: aa)'
    )
    parser.add_argument(
        '--min-severity', '-s',
        choices=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default='MEDIUM',
        help='Severidade mínima (default: MEDIUM)'
    )
    parser.add_argument(
        '--project-name', '-p',
        type=str,
        default='TSiJUKEBOX',
        help='Nome do projeto para o relatório'
    )
    
    args = parser.parse_args()
    
    # Coletar arquivos
    files = []
    for path_str in args.analyze:
        path = Path(path_str)
        if not path.is_absolute():
            path = BASE_DIR / path
        
        if path.is_file():
            files.append(path)
        elif path.is_dir():
            files.extend(find_files(path))
    
    if not files:
        print("❌ Nenhum arquivo encontrado")
        return 1
    
    print("=" * 70)
    print("🎨 Gerador de Relatório HTML de Contraste")
    print("=" * 70)
    print(f"📁 Arquivos: {len(files)}")
    print(f"📊 Nível WCAG: {args.level.upper()}")
    print()
    
    # Executar análise
    print("🔍 Analisando arquivos...")
    config = {
        'level': args.level,
        'min_severity': args.min_severity,
        'skip_false_positives': True,
        'skip_same_color': True,
    }
    
    metrics = analyze_color_contrast([str(f) for f in files], config)
    
    print(f"📊 Issues encontrados: {metrics.issues_found}")
    
    # Gerar HTML
    print("📝 Gerando relatório HTML...")
    html = generate_html_report(metrics, args.project_name)
    
    # Salvar
    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = BASE_DIR / output_path
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(html, encoding='utf-8')
    
    print()
    print("=" * 70)
    print(f"✅ Relatório gerado: {output_path}")
    print("=" * 70)
    
    return 0


if __name__ == '__main__':
    exit(main())
