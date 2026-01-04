#!/usr/bin/env python3
"""
false_positive_filter.py - TSiJUKEBOX Accessibility False Positive Filter

Este script automatiza a filtragem de falsos positivos de contraste:
1. Adiciona aria-hidden aos previews de tema (decorativos)
2. Cria whitelist para cores de marca (intencionais)
3. Marca elementos decorativos com role="presentation"

Uso:
    python3 scripts/false_positive_filter.py --dry-run    # Simular alterações
    python3 scripts/false_positive_filter.py --apply      # Aplicar alterações
    python3 scripts/false_positive_filter.py --whitelist  # Gerar whitelist
    python3 scripts/false_positive_filter.py --report     # Gerar relatório

Autor: TSiJUKEBOX Team
Data: 2025-01-01
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Set
from dataclasses import dataclass, field

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

# Diretórios
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"
BACKUP_DIR = PROJECT_ROOT / "backups" / "false-positive-filter"
DOCS_DIR = PROJECT_ROOT / "docs" / "accessibility"
WHITELIST_FILE = DOCS_DIR / "contrast-whitelist.json"

# Padrões de componentes de preview de tema (decorativos)
THEME_PREVIEW_PATTERNS = [
    # Componentes de preview de tema
    r'ThemePreviewCard',
    r'ColorSwatch',
    r'ThemeCard',
    r'ColorPreview',
    r'PalettePreview',
    # Mocks de interface (decorativos)
    r'Mock\s*Spotify',
    r'mock-player',
    r'mock-sidebar',
    # Elementos de demonstração visual
    r'demo-color',
    r'color-demo',
    r'swatch',
]

# Arquivos que contêm previews de tema
THEME_PREVIEW_FILES = [
    "src/pages/settings/SpicetifyThemeGallery.tsx",
    "src/components/spicetify/ThemePreviewCard.tsx",
    "src/pages/brand/BrandGuidelines.tsx",
    "src/pages/public/DesignSystem.tsx",
]

# Padrões de cores de marca (intencionais - não devem ser alterados)
BRAND_COLOR_PATTERNS = [
    # Cores neon da marca
    r'text-gold-neon',
    r'text-title-white-neon',
    r'text-artist-neon-blue',
    r'text-label-yellow',
    r'text-label-neon',
    r'text-neon-action-label',
    # Cores kiosk
    r'text-kiosk-',
    r'bg-kiosk-',
    r'border-kiosk-',
    # Cores de status (intencionais)
    r'text-spotify-green',
    r'text-youtube-red',
    # Gradientes de marca
    r'from-purple-500\s+to-pink-600',
    r'from-gold-neon',
]

# Arquivos com cores de marca
BRAND_COLOR_FILES = [
    "src/pages/brand/BrandGuidelines.tsx",
    "src/pages/brand/LogoGitHubPreview.tsx",
    "src/components/brand/",
    "src/styles/brand/",
]

# Padrões de elementos decorativos (não precisam de contraste)
DECORATIVE_PATTERNS = [
    # Swatches de cor (apenas visuais)
    r'<div[^>]*className="[^"]*w-\d+\s+h-\d+\s+rounded[^"]*"[^>]*style=\{[^}]*backgroundColor',
    # Indicadores visuais pequenos
    r'<div[^>]*className="[^"]*w-[1-3]\s+h-[1-3][^"]*"',
    # Barras de progresso decorativas
    r'<div[^>]*className="[^"]*h-1\s+rounded[^"]*"',
    # Círculos de cor
    r'<div[^>]*className="[^"]*rounded-full[^"]*"[^>]*style=\{[^}]*backgroundColor',
]


# ============================================================================
# CLASSES DE DADOS
# ============================================================================

@dataclass
class FilterResult:
    """Resultado de uma operação de filtragem."""
    file: str
    line: int
    original: str
    modified: str
    filter_type: str  # 'aria-hidden', 'whitelist', 'presentation'
    reason: str


@dataclass
class WhitelistEntry:
    """Entrada na whitelist de cores."""
    pattern: str
    reason: str
    files: List[str] = field(default_factory=list)
    intentional: bool = True


@dataclass
class FilterStats:
    """Estatísticas de filtragem."""
    files_scanned: int = 0
    aria_hidden_added: int = 0
    whitelist_entries: int = 0
    presentation_roles: int = 0
    total_changes: int = 0
    errors: List[str] = field(default_factory=list)


# ============================================================================
# FUNÇÕES DE ANÁLISE
# ============================================================================

def find_theme_preview_elements(content: str, filename: str) -> List[Tuple[int, str, str]]:
    """
    Encontra elementos de preview de tema que precisam de aria-hidden.
    
    Retorna lista de (linha, código_original, razão).
    """
    results = []
    lines = content.split('\n')
    
    # Padrões de elementos decorativos em previews de tema
    patterns = [
        # Divs com style backgroundColor (swatches de cor)
        (r'(<div[^>]*)(className="[^"]*"[^>]*style=\{\s*\{\s*backgroundColor)', 
         'Color swatch decorativo'),
        
        # Mocks de player/sidebar
        (r'(<div[^>]*)(className="[^"]*mock|Mock)', 
         'Mock de interface decorativo'),
        
        # Elementos pequenos decorativos (w-1 a w-6, h-1 a h-6)
        (r'(<div[^>]*)(className="[^"]*w-[1-6]\s+h-[1-6][^"]*rounded)', 
         'Elemento decorativo pequeno'),
        
        # Círculos de cor (rounded-full com backgroundColor)
        (r'(<div[^>]*)(className="[^"]*rounded-full[^"]*"[^>]*style=\{[^}]*backgroundColor)', 
         'Círculo de cor decorativo'),
        
        # Barras de progresso decorativas
        (r'(<div[^>]*)(className="[^"]*h-1[^"]*rounded[^"]*")', 
         'Barra de progresso decorativa'),
    ]
    
    # Verificar se é arquivo de preview de tema
    is_theme_file = any(f in filename for f in THEME_PREVIEW_FILES)
    
    for line_num, line in enumerate(lines, 1):
        for pattern, reason in patterns:
            matches = re.finditer(pattern, line)
            for match in matches:
                # Verificar se já tem aria-hidden
                if 'aria-hidden' not in line:
                    results.append((line_num, line.strip(), reason))
                    break  # Evitar duplicatas na mesma linha
    
    return results


def find_decorative_containers(content: str, filename: str) -> List[Tuple[int, str, str]]:
    """
    Encontra containers decorativos que precisam de role="presentation".
    
    Retorna lista de (linha, código_original, razão).
    """
    results = []
    lines = content.split('\n')
    
    # Padrões de containers decorativos
    patterns = [
        # Container de preview de tema
        (r'(<div[^>]*className="[^"]*aspect-video[^"]*")', 
         'Container de preview decorativo'),
        
        # Container de mock
        (r'(<div[^>]*className="[^"]*absolute\s+inset-0[^"]*flex[^"]*")', 
         'Container de mock decorativo'),
        
        # Grid de swatches
        (r'(<div[^>]*className="[^"]*grid[^"]*gap[^"]*"[^>]*>\s*\{[^}]*map)', 
         'Grid de swatches decorativo'),
    ]
    
    for line_num, line in enumerate(lines, 1):
        for pattern, reason in patterns:
            if re.search(pattern, line):
                # Verificar se já tem role
                if 'role=' not in line:
                    results.append((line_num, line.strip(), reason))
                    break
    
    return results


def analyze_brand_colors(content: str, filename: str) -> List[WhitelistEntry]:
    """
    Analisa cores de marca que devem ser adicionadas à whitelist.
    
    Retorna lista de WhitelistEntry.
    """
    entries = []
    
    for pattern in BRAND_COLOR_PATTERNS:
        matches = re.findall(pattern, content)
        if matches:
            entries.append(WhitelistEntry(
                pattern=pattern,
                reason=f"Cor de marca intencional encontrada em {filename}",
                files=[filename],
                intentional=True
            ))
    
    return entries


# ============================================================================
# FUNÇÕES DE MODIFICAÇÃO
# ============================================================================

def add_aria_hidden_to_element(line: str) -> str:
    """
    Adiciona aria-hidden="true" a um elemento.
    
    Exemplo:
        <div className="..." → <div aria-hidden="true" className="..."
        <div className="..." /> → <div className="..." aria-hidden="true" />
    """
    # Verificar se já tem aria-hidden
    if 'aria-hidden' in line:
        return line
    
    # Padrão para self-closing tags (terminam com />)
    self_closing_pattern = r'(<(?:div|span|svg|i)[^>]*?)\s*/>'
    
    def self_closing_replacer(match):
        tag_content = match.group(1)
        return f'{tag_content} aria-hidden="true" />'
    
    # Primeiro tentar self-closing
    modified = re.sub(self_closing_pattern, self_closing_replacer, line, count=1)
    if modified != line:
        return modified
    
    # Padrão para tags normais (terminam com >)
    normal_pattern = r'(<(?:div|span|svg|i)[^>]*)(>)'
    
    def normal_replacer(match):
        tag_start = match.group(1)
        tag_end = match.group(2)
        return f'{tag_start} aria-hidden="true"{tag_end}'
    
    return re.sub(normal_pattern, normal_replacer, line, count=1)


def add_role_presentation(line: str) -> str:
    """
    Adiciona role="presentation" a um container decorativo.
    
    Exemplo:
        <div className="..." → <div role="presentation" className="..."
    """
    pattern = r'(<div[^>]*)(>)'
    
    def replacer(match):
        tag_start = match.group(1)
        tag_end = match.group(2)
        
        # Verificar se já tem role
        if 'role=' in tag_start:
            return match.group(0)
        
        return f'{tag_start} role="presentation"{tag_end}'
    
    return re.sub(pattern, replacer, line, count=1)


def process_file(filepath: Path, dry_run: bool = True) -> List[FilterResult]:
    """
    Processa um arquivo e aplica filtros de falsos positivos.
    
    Args:
        filepath: Caminho do arquivo
        dry_run: Se True, apenas simula as alterações
        
    Returns:
        Lista de FilterResult com as alterações feitas/simuladas
    """
    results = []
    
    try:
        content = filepath.read_text(encoding='utf-8')
        lines = content.split('\n')
        modified_lines = lines.copy()
        filename = str(filepath.relative_to(PROJECT_ROOT))
        
        # Encontrar elementos que precisam de aria-hidden
        theme_elements = find_theme_preview_elements(content, filename)
        
        for line_num, original, reason in theme_elements:
            idx = line_num - 1
            modified = add_aria_hidden_to_element(modified_lines[idx])
            
            if modified != modified_lines[idx]:
                results.append(FilterResult(
                    file=filename,
                    line=line_num,
                    original=original,
                    modified=modified.strip(),
                    filter_type='aria-hidden',
                    reason=reason
                ))
                modified_lines[idx] = modified
        
        # Encontrar containers decorativos
        decorative_containers = find_decorative_containers(content, filename)
        
        for line_num, original, reason in decorative_containers:
            idx = line_num - 1
            modified = add_role_presentation(modified_lines[idx])
            
            if modified != modified_lines[idx]:
                results.append(FilterResult(
                    file=filename,
                    line=line_num,
                    original=original,
                    modified=modified.strip(),
                    filter_type='presentation',
                    reason=reason
                ))
                modified_lines[idx] = modified
        
        # Salvar alterações se não for dry-run
        if not dry_run and results:
            # Criar backup
            backup_path = BACKUP_DIR / filepath.relative_to(PROJECT_ROOT)
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            backup_path.write_text(content, encoding='utf-8')
            
            # Salvar arquivo modificado
            new_content = '\n'.join(modified_lines)
            filepath.write_text(new_content, encoding='utf-8')
    
    except Exception as e:
        print(f"Erro ao processar {filepath}: {e}")
    
    return results


# ============================================================================
# FUNÇÕES DE WHITELIST
# ============================================================================

def generate_whitelist() -> Dict:
    """
    Gera whitelist de cores de marca que não devem ser alteradas.
    
    Returns:
        Dicionário com a whitelist completa
    """
    whitelist = {
        "version": "1.0",
        "generated": datetime.now().isoformat(),
        "description": "Whitelist de cores intencionais que não devem ser alteradas pelo analisador de contraste",
        "categories": {
            "brand_colors": {
                "description": "Cores de marca do TSiJUKEBOX",
                "patterns": [
                    {"pattern": "text-gold-neon", "reason": "Cor primária de títulos"},
                    {"pattern": "text-title-white-neon", "reason": "Cor de destaque máximo"},
                    {"pattern": "text-artist-neon-blue", "reason": "Cor de artistas"},
                    {"pattern": "text-label-yellow", "reason": "Labels obrigatórios"},
                    {"pattern": "text-label-neon", "reason": "Labels de status"},
                    {"pattern": "text-neon-action-label", "reason": "Labels de ações"},
                ]
            },
            "kiosk_colors": {
                "description": "Cores do sistema Kiosk",
                "patterns": [
                    {"pattern": "text-kiosk-*", "reason": "Sistema de cores Kiosk"},
                    {"pattern": "bg-kiosk-*", "reason": "Backgrounds Kiosk"},
                    {"pattern": "border-kiosk-*", "reason": "Bordas Kiosk"},
                ]
            },
            "service_colors": {
                "description": "Cores de serviços integrados",
                "patterns": [
                    {"pattern": "text-spotify-green", "reason": "Cor oficial Spotify"},
                    {"pattern": "text-youtube-red", "reason": "Cor oficial YouTube"},
                ]
            },
            "theme_previews": {
                "description": "Previews de tema (decorativos)",
                "files": [
                    "src/pages/settings/SpicetifyThemeGallery.tsx",
                    "src/components/spicetify/ThemePreviewCard.tsx",
                ],
                "reason": "Elementos decorativos que mostram cores de temas"
            },
            "color_swatches": {
                "description": "Swatches de cor (decorativos)",
                "files": [
                    "src/pages/brand/BrandGuidelines.tsx",
                    "src/pages/public/DesignSystem.tsx",
                ],
                "reason": "Amostras de cor para documentação visual"
            }
        },
        "excluded_ratios": {
            "description": "Ratios de contraste que são falsos positivos",
            "patterns": [
                {"ratio": "1.00:1", "reason": "Mesma cor texto/fundo (falso positivo)"},
                {"ratio_range": [0.99, 1.01], "reason": "Cores praticamente idênticas"},
            ]
        }
    }
    
    return whitelist


def save_whitelist(whitelist: Dict) -> Path:
    """
    Salva a whitelist em arquivo JSON.
    
    Returns:
        Caminho do arquivo salvo
    """
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(WHITELIST_FILE, 'w', encoding='utf-8') as f:
        json.dump(whitelist, f, indent=2, ensure_ascii=False)
    
    return WHITELIST_FILE


# ============================================================================
# FUNÇÕES DE RELATÓRIO
# ============================================================================

def generate_report(results: List[FilterResult], stats: FilterStats) -> str:
    """
    Gera relatório em Markdown das alterações feitas.
    """
    report = []
    report.append("# Relatório de Filtragem de Falsos Positivos")
    report.append(f"\n**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append(f"\n**Arquivos analisados:** {stats.files_scanned}")
    report.append(f"\n**Total de alterações:** {stats.total_changes}")
    
    report.append("\n\n## Resumo")
    report.append("\n| Tipo | Quantidade |")
    report.append("|------|------------|")
    report.append(f"| aria-hidden adicionados | {stats.aria_hidden_added} |")
    report.append(f"| role=presentation adicionados | {stats.presentation_roles} |")
    report.append(f"| Entradas na whitelist | {stats.whitelist_entries} |")
    
    if results:
        report.append("\n\n## Alterações Detalhadas")
        
        # Agrupar por arquivo
        by_file: Dict[str, List[FilterResult]] = {}
        for r in results:
            if r.file not in by_file:
                by_file[r.file] = []
            by_file[r.file].append(r)
        
        for file, file_results in sorted(by_file.items()):
            report.append(f"\n### `{file}`")
            report.append("\n| Linha | Tipo | Razão |")
            report.append("|-------|------|-------|")
            for r in file_results:
                report.append(f"| {r.line} | {r.filter_type} | {r.reason} |")
    
    if stats.errors:
        report.append("\n\n## Erros")
        for error in stats.errors:
            report.append(f"- {error}")
    
    return '\n'.join(report)


# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Filtrar falsos positivos de contraste no TSiJUKEBOX'
    )
    parser.add_argument('--dry-run', action='store_true',
                        help='Simular alterações sem aplicar')
    parser.add_argument('--apply', action='store_true',
                        help='Aplicar alterações')
    parser.add_argument('--whitelist', action='store_true',
                        help='Gerar whitelist de cores de marca')
    parser.add_argument('--report', action='store_true',
                        help='Gerar relatório detalhado')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Saída detalhada')
    
    args = parser.parse_args()
    
    # Se nenhuma ação especificada, mostrar ajuda
    if not any([args.dry_run, args.apply, args.whitelist, args.report]):
        parser.print_help()
        return
    
    print("=" * 70)
    print("🔍 FALSE POSITIVE FILTER - TSiJUKEBOX")
    print("=" * 70)
    print(f"⏱️ Início: {datetime.now().strftime('%H:%M:%S')}")
    print()
    
    stats = FilterStats()
    all_results: List[FilterResult] = []
    
    # Gerar whitelist
    if args.whitelist:
        print("📋 Gerando whitelist de cores de marca...")
        whitelist = generate_whitelist()
        whitelist_path = save_whitelist(whitelist)
        stats.whitelist_entries = sum(
            len(cat.get('patterns', [])) + len(cat.get('files', []))
            for cat in whitelist['categories'].values()
        )
        print(f"   ✅ Whitelist salva em: {whitelist_path}")
        print(f"   📊 {stats.whitelist_entries} entradas na whitelist")
        print()
    
    # Processar arquivos
    if args.dry_run or args.apply:
        dry_run = args.dry_run
        mode = "DRY-RUN" if dry_run else "APLICANDO"
        print(f"🔧 Modo: {mode}")
        print()
        
        # Criar diretório de backup
        if not dry_run:
            BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
        # Processar arquivos de preview de tema
        print("📁 Processando arquivos de preview de tema...")
        for file_pattern in THEME_PREVIEW_FILES:
            filepath = PROJECT_ROOT / file_pattern
            if filepath.exists():
                results = process_file(filepath, dry_run)
                all_results.extend(results)
                stats.files_scanned += 1
                
                # Contar tipos
                for r in results:
                    if r.filter_type == 'aria-hidden':
                        stats.aria_hidden_added += 1
                    elif r.filter_type == 'presentation':
                        stats.presentation_roles += 1
                
                if args.verbose and results:
                    print(f"   📄 {file_pattern}: {len(results)} alterações")
        
        # Processar outros arquivos TSX
        print("\n📁 Processando outros arquivos TSX...")
        for tsx_file in SRC_DIR.rglob("*.tsx"):
            # Pular arquivos já processados
            rel_path = str(tsx_file.relative_to(PROJECT_ROOT))
            if rel_path in THEME_PREVIEW_FILES:
                continue
            
            results = process_file(tsx_file, dry_run)
            all_results.extend(results)
            stats.files_scanned += 1
            
            for r in results:
                if r.filter_type == 'aria-hidden':
                    stats.aria_hidden_added += 1
                elif r.filter_type == 'presentation':
                    stats.presentation_roles += 1
            
            if args.verbose and results:
                print(f"   📄 {rel_path}: {len(results)} alterações")
        
        stats.total_changes = len(all_results)
    
    # Gerar relatório
    if args.report or all_results:
        print("\n📊 Gerando relatório...")
        report = generate_report(all_results, stats)
        
        report_path = DOCS_DIR / "false-positive-filter-report.md"
        DOCS_DIR.mkdir(parents=True, exist_ok=True)
        report_path.write_text(report, encoding='utf-8')
        print(f"   ✅ Relatório salvo em: {report_path}")
    
    # Resumo final
    print()
    print("=" * 70)
    print("📊 RESUMO FINAL")
    print("-" * 70)
    print(f"   Arquivos analisados: {stats.files_scanned}")
    print(f"   aria-hidden adicionados: {stats.aria_hidden_added}")
    print(f"   role=presentation adicionados: {stats.presentation_roles}")
    print(f"   Entradas na whitelist: {stats.whitelist_entries}")
    print(f"   Total de alterações: {stats.total_changes}")
    print("=" * 70)
    print(f"⏱️ Fim: {datetime.now().strftime('%H:%M:%S')}")
    
    if args.dry_run and stats.total_changes > 0:
        print()
        print("💡 Execute com --apply para aplicar as alterações")


if __name__ == '__main__':
    main()
