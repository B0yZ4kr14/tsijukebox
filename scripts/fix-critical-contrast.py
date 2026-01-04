#!/usr/bin/env python3
"""
Correção Automática de Contraste Crítico
=========================================

Este script corrige automaticamente os 3 padrões de cor mais problemáticos
que representam 53% dos issues críticos de contraste (119 ocorrências).

Padrões corrigidos:
1. text-cyan-400 → text-cyan-700 (60 issues, ratio 1.81:1 → 4.6:1)
2. text-zinc-50 → text-zinc-600 (32 issues, ratio 1.04:1 → 4.7:1)
3. text-green-400 → text-green-700 (27 issues, ratio 1.74:1 → 4.8:1)

Uso:
    python3 fix-critical-contrast.py --dry-run     # Simular alterações
    python3 fix-critical-contrast.py --apply       # Aplicar correções
    python3 fix-critical-contrast.py --report      # Gerar relatório

Autor: TSiJUKEBOX Team
Versão: 1.0.0
Data: 2025-12-25
"""

import os
import re
import sys
import argparse
import shutil
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Set
from collections import defaultdict

# Diretório base do projeto
BASE_DIR = Path(__file__).parent.parent
BACKUP_DIR = BASE_DIR / 'backups' / 'contrast-fixes'

# =============================================================================
# MAPEAMENTOS DE CORREÇÃO
# =============================================================================

@dataclass
class ColorMapping:
    """Mapeamento de correção de cor."""
    original: str           # Classe original (ex: "text-cyan-400")
    replacement: str        # Classe corrigida (ex: "text-cyan-700")
    original_hex: str       # Cor hex original
    replacement_hex: str    # Cor hex corrigida
    original_ratio: float   # Ratio original
    new_ratio: float        # Novo ratio
    context: str            # Contexto de uso (ex: "fundo claro")
    priority: int           # Prioridade (1=alta, 3=baixa)


# Mapeamentos principais - cores claras em fundo branco/claro
# Estes mapeamentos corrigem texto de baixo contraste em fundos claros
LIGHT_BG_MAPPINGS = [
    # ==========================================================================
    # PRIORIDADE 1: Padrões mais comuns (119 issues)
    # ==========================================================================
    
    # cyan-400 em branco: 60 issues - ratio 1.81:1 → 4.62:1
    ColorMapping(
        original="text-cyan-400",
        replacement="text-cyan-700",
        original_hex="#22d3ee",
        replacement_hex="#0e7490",
        original_ratio=1.81,
        new_ratio=4.62,
        context="fundo claro",
        priority=1
    ),
    
    # zinc-50 em branco: 32 issues - ratio 1.04:1 → 4.74:1
    ColorMapping(
        original="text-zinc-50",
        replacement="text-zinc-600",
        original_hex="#fafafa",
        replacement_hex="#52525b",
        original_ratio=1.04,
        new_ratio=4.74,
        context="fundo branco",
        priority=1
    ),
    
    # green-400 em branco: 27 issues - ratio 1.74:1 → 4.84:1
    ColorMapping(
        original="text-green-400",
        replacement="text-green-700",
        original_hex="#4ade80",
        replacement_hex="#15803d",
        original_ratio=1.74,
        new_ratio=4.84,
        context="fundo claro",
        priority=1
    ),
    
    # ==========================================================================
    # PRIORIDADE 2: Padrões secundários
    # ==========================================================================
    
    # yellow-400 em branco: 8 issues - ratio 1.53:1 → 3.52:1
    ColorMapping(
        original="text-yellow-400",
        replacement="text-yellow-700",
        original_hex="#facc15",
        replacement_hex="#a16207",
        original_ratio=1.53,
        new_ratio=3.52,
        context="fundo claro",
        priority=2
    ),
    
    # emerald-400 em branco: 5 issues - ratio 1.65:1 → 5.12:1
    ColorMapping(
        original="text-emerald-400",
        replacement="text-emerald-700",
        original_hex="#34d399",
        replacement_hex="#047857",
        original_ratio=1.65,
        new_ratio=5.12,
        context="fundo claro",
        priority=2
    ),
    
    # sky-400 em branco: ratio 1.75:1 → 4.52:1
    ColorMapping(
        original="text-sky-400",
        replacement="text-sky-700",
        original_hex="#38bdf8",
        replacement_hex="#0369a1",
        original_ratio=1.75,
        new_ratio=4.52,
        context="fundo claro",
        priority=2
    ),
    
    # teal-400 em branco: ratio 1.72:1 → 4.89:1
    ColorMapping(
        original="text-teal-400",
        replacement="text-teal-700",
        original_hex="#2dd4bf",
        replacement_hex="#0f766e",
        original_ratio=1.72,
        new_ratio=4.89,
        context="fundo claro",
        priority=2
    ),
    
    # lime-400 em branco: ratio 1.89:1 → 3.84:1
    ColorMapping(
        original="text-lime-400",
        replacement="text-lime-700",
        original_hex="#a3e635",
        replacement_hex="#4d7c0f",
        original_ratio=1.89,
        new_ratio=3.84,
        context="fundo claro",
        priority=2
    ),
    
    # ==========================================================================
    # PRIORIDADE 3: Cores de status/feedback (153 ocorrências no projeto)
    # ==========================================================================
    
    # red-400 em branco: 78 ocorrências - ratio 2.12:1 → 4.63:1
    ColorMapping(
        original="text-red-400",
        replacement="text-red-600",
        original_hex="#f87171",
        replacement_hex="#dc2626",
        original_ratio=2.12,
        new_ratio=4.53,
        context="fundo claro",
        priority=3
    ),
    
    # red-300 em branco: ratio 1.65:1 → 4.53:1
    ColorMapping(
        original="text-red-300",
        replacement="text-red-600",
        original_hex="#fca5a5",
        replacement_hex="#dc2626",
        original_ratio=1.65,
        new_ratio=4.53,
        context="fundo claro",
        priority=3
    ),
    
    # orange-400 em branco: 3 ocorrências - ratio 1.92:1 → 4.12:1
    ColorMapping(
        original="text-orange-400",
        replacement="text-orange-600",
        original_hex="#fb923c",
        replacement_hex="#ea580c",
        original_ratio=1.92,
        new_ratio=4.12,
        context="fundo claro",
        priority=3
    ),
    
    # amber-400 em branco: 31 ocorrências - ratio 1.67:1 → 3.42:1
    ColorMapping(
        original="text-amber-400",
        replacement="text-amber-600",
        original_hex="#fbbf24",
        replacement_hex="#d97706",
        original_ratio=1.67,
        new_ratio=3.42,
        context="fundo claro",
        priority=3
    ),
    
    # amber-300 em branco: ratio 1.42:1 → 3.42:1
    ColorMapping(
        original="text-amber-300",
        replacement="text-amber-600",
        original_hex="#fcd34d",
        replacement_hex="#d97706",
        original_ratio=1.42,
        new_ratio=3.42,
        context="fundo claro",
        priority=3
    ),
    
    # purple-400 em branco: 24 ocorrências - ratio 2.27:1 → 5.42:1
    ColorMapping(
        original="text-purple-400",
        replacement="text-purple-600",
        original_hex="#c084fc",
        replacement_hex="#9333ea",
        original_ratio=2.27,
        new_ratio=5.42,
        context="fundo claro",
        priority=3
    ),
    
    # blue-400 em branco: 13 ocorrências - ratio 2.01:1 → 4.68:1
    ColorMapping(
        original="text-blue-400",
        replacement="text-blue-600",
        original_hex="#60a5fa",
        replacement_hex="#2563eb",
        original_ratio=2.01,
        new_ratio=4.68,
        context="fundo claro",
        priority=3
    ),
    
    # pink-400 em branco: 2 ocorrências - ratio 2.15:1 → 4.24:1
    ColorMapping(
        original="text-pink-400",
        replacement="text-pink-600",
        original_hex="#f472b6",
        replacement_hex="#db2777",
        original_ratio=2.15,
        new_ratio=4.24,
        context="fundo claro",
        priority=3
    ),
    
    # violet-400 em branco: 1 ocorrência - ratio 2.18:1 → 5.12:1
    ColorMapping(
        original="text-violet-400",
        replacement="text-violet-600",
        original_hex="#a78bfa",
        replacement_hex="#7c3aed",
        original_ratio=2.18,
        new_ratio=5.12,
        context="fundo claro",
        priority=3
    ),
    
    # indigo-400 em branco: 1 ocorrência - ratio 2.42:1 → 5.24:1
    ColorMapping(
        original="text-indigo-400",
        replacement="text-indigo-600",
        original_hex="#818cf8",
        replacement_hex="#4f46e5",
        original_ratio=2.42,
        new_ratio=5.24,
        context="fundo claro",
        priority=3
    ),
    
    # ==========================================================================
    # PRIORIDADE 4: Cores neutras claras
    # ==========================================================================
    
    # gray-50 em branco: ratio 1.04:1 → 4.74:1
    ColorMapping(
        original="text-gray-50",
        replacement="text-gray-600",
        original_hex="#f9fafb",
        replacement_hex="#4b5563",
        original_ratio=1.04,
        new_ratio=4.74,
        context="fundo branco",
        priority=4
    ),
    
    # slate-50 em branco: ratio 1.05:1 → 4.62:1
    ColorMapping(
        original="text-slate-50",
        replacement="text-slate-600",
        original_hex="#f8fafc",
        replacement_hex="#475569",
        original_ratio=1.05,
        new_ratio=4.62,
        context="fundo branco",
        priority=4
    ),
    
    # neutral-50 em branco: ratio 1.04:1 → 4.69:1
    ColorMapping(
        original="text-neutral-50",
        replacement="text-neutral-600",
        original_hex="#fafafa",
        replacement_hex="#525252",
        original_ratio=1.04,
        new_ratio=4.69,
        context="fundo branco",
        priority=4
    ),
    
    # stone-50 em branco: ratio 1.05:1 → 4.54:1
    ColorMapping(
        original="text-stone-50",
        replacement="text-stone-600",
        original_hex="#fafaf9",
        replacement_hex="#57534e",
        original_ratio=1.05,
        new_ratio=4.54,
        context="fundo branco",
        priority=4
    ),
    
    # ==========================================================================
    # PRIORIDADE 5: Cores 100-300 em fundo claro
    # ==========================================================================
    
    # zinc-100 em branco: ratio 1.08:1 → 4.74:1
    ColorMapping(
        original="text-zinc-100",
        replacement="text-zinc-600",
        original_hex="#f4f4f5",
        replacement_hex="#52525b",
        original_ratio=1.08,
        new_ratio=4.74,
        context="fundo branco",
        priority=5
    ),
    
    # zinc-200 em branco: ratio 1.19:1 → 4.74:1
    ColorMapping(
        original="text-zinc-200",
        replacement="text-zinc-600",
        original_hex="#e4e4e7",
        replacement_hex="#52525b",
        original_ratio=1.19,
        new_ratio=4.74,
        context="fundo branco",
        priority=5
    ),
    
    # zinc-300 em branco: ratio 1.43:1 → 4.74:1
    ColorMapping(
        original="text-zinc-300",
        replacement="text-zinc-600",
        original_hex="#d4d4d8",
        replacement_hex="#52525b",
        original_ratio=1.43,
        new_ratio=4.74,
        context="fundo branco",
        priority=5
    ),
    
    # gray-300 em branco: ratio 1.46:1 → 4.74:1
    ColorMapping(
        original="text-gray-300",
        replacement="text-gray-600",
        original_hex="#d1d5db",
        replacement_hex="#4b5563",
        original_ratio=1.46,
        new_ratio=4.74,
        context="fundo branco",
        priority=5
    ),
    
    # gray-400 em branco: ratio 2.14:1 → 4.74:1
    ColorMapping(
        original="text-gray-400",
        replacement="text-gray-600",
        original_hex="#9ca3af",
        replacement_hex="#4b5563",
        original_ratio=2.14,
        new_ratio=4.74,
        context="fundo branco",
        priority=5
    ),
]

# Mapeamentos para fundo escuro - cores escuras em fundo escuro
DARK_BG_MAPPINGS = [
    ColorMapping(
        original="text-zinc-800",
        replacement="text-zinc-300",
        original_hex="#27272a",
        replacement_hex="#d4d4d8",
        original_ratio=1.12,
        new_ratio=10.5,
        context="fundo escuro",
        priority=1
    ),
    ColorMapping(
        original="text-zinc-900",
        replacement="text-zinc-300",
        original_hex="#18181b",
        replacement_hex="#d4d4d8",
        original_ratio=1.06,
        new_ratio=10.5,
        context="fundo escuro",
        priority=1
    ),
]

# Contextos que indicam fundo claro
LIGHT_BG_INDICATORS = [
    'bg-white',
    'bg-zinc-50',
    'bg-gray-50',
    'bg-slate-50',
    'bg-neutral-50',
    'bg-stone-50',
    'bg-zinc-100',
    'bg-gray-100',
    'light:',
]

# Contextos que indicam fundo escuro
DARK_BG_INDICATORS = [
    'bg-zinc-900',
    'bg-zinc-950',
    'bg-gray-900',
    'bg-slate-900',
    'bg-neutral-900',
    'bg-black',
    'dark:',
    'bg-[#09090b]',
    'bg-[#0a0a0a]',
]

# Arquivos/padrões a ignorar (previews de tema, etc.)
IGNORE_PATTERNS = [
    r'ThemePreview',
    r'theme-preview',
    r'preview-card',
    r'color-swatch',
    r'palette-',
    r'brand-color',
]

# Arquivos específicos a ignorar
IGNORE_FILES = [
    'ThemeCustomizer.tsx',      # Preview de temas
    'SpicetifyThemeGallery.tsx', # Galeria de temas (parcial)
    'BrandGuidelines.tsx',      # Guia de marca (cores intencionais)
]


# =============================================================================
# ESTRUTURAS DE DADOS
# =============================================================================

@dataclass
class ContrastFix:
    """Representa uma correção de contraste."""
    file: str
    line: int
    original_class: str
    new_class: str
    original_ratio: float
    new_ratio: float
    context: str
    line_content: str


@dataclass
class FixResult:
    """Resultado da execução do script."""
    files_analyzed: int = 0
    files_modified: int = 0
    fixes_applied: int = 0
    fixes_skipped: int = 0
    fixes_by_pattern: Dict[str, int] = field(default_factory=dict)
    fixes_by_file: Dict[str, int] = field(default_factory=dict)
    all_fixes: List[ContrastFix] = field(default_factory=list)
    skipped_reasons: Dict[str, int] = field(default_factory=dict)


# =============================================================================
# FUNÇÕES DE ANÁLISE
# =============================================================================

def find_files(directory: Path) -> List[Path]:
    """Encontra todos os arquivos TSX/JSX no diretório."""
    files = []
    for ext in ['*.tsx', '*.jsx']:
        files.extend(directory.rglob(ext))
    return sorted(files)


def should_ignore_file(filepath: Path) -> bool:
    """Verifica se o arquivo deve ser ignorado."""
    filename = filepath.name
    return filename in IGNORE_FILES


def should_ignore_line(line: str) -> bool:
    """Verifica se a linha deve ser ignorada."""
    for pattern in IGNORE_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    return False


def detect_background_context(content: str, line_num: int, lines: List[str]) -> str:
    """
    Detecta o contexto de fundo (claro ou escuro) para uma linha.
    
    Analisa:
    1. A própria linha (prefixos dark: e light:)
    2. Classes de background na mesma linha
    3. Linhas anteriores (até 20) para contexto do componente
    4. Nome do arquivo (light/dark no nome)
    5. Padrão do projeto (tema escuro)
    """
    line = lines[line_num - 1] if line_num <= len(lines) else ""
    
    # 1. Verificar prefixos dark: e light: na própria linha
    # Se a classe tem prefixo, respeitar o contexto
    if 'light:' in line:
        return "light"
    if 'dark:' in line:
        return "dark"
    
    # 2. Verificar classes de background na mesma linha
    for indicator in LIGHT_BG_INDICATORS:
        if indicator in line and not indicator.startswith('light:'):
            return "light"
    
    for indicator in DARK_BG_INDICATORS:
        if indicator in line and not indicator.startswith('dark:'):
            return "dark"
    
    # 3. Verificar linhas anteriores (contexto do componente)
    start = max(0, line_num - 20)
    context_lines = lines[start:line_num]
    context_text = '\n'.join(context_lines)
    
    # Contar indicadores de fundo
    light_count = 0
    dark_count = 0
    
    for indicator in LIGHT_BG_INDICATORS:
        if indicator in context_text:
            light_count += context_text.count(indicator)
    
    for indicator in DARK_BG_INDICATORS:
        if indicator in context_text:
            dark_count += context_text.count(indicator)
    
    # Se há indicadores claros de fundo claro
    if light_count > dark_count + 2:
        return "light"
    
    # Se há indicadores claros de fundo escuro
    if dark_count > light_count:
        return "dark"
    
    # 4. Verificar se está em um componente de tema claro
    # (ex: LightModePreview, WhiteBackground, etc.)
    full_context = '\n'.join(lines[max(0, line_num - 50):line_num + 10])
    light_component_patterns = [
        'LightMode', 'WhiteBackground', 'LightTheme',
        'bg-white', 'bg-zinc-50', 'bg-gray-50'
    ]
    for pattern in light_component_patterns:
        if pattern in full_context:
            return "light"
    
    # 5. Padrão: assumir tema escuro (mais comum no projeto TSiJUKEBOX)
    return "dark"


def find_contrast_issues(content: str, filepath: str) -> List[ContrastFix]:
    """
    Encontra issues de contraste que podem ser corrigidos automaticamente.
    """
    fixes = []
    lines = content.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        # Ignorar linhas com padrões específicos
        if should_ignore_line(line):
            continue
        
        # Detectar contexto de fundo
        bg_context = detect_background_context(content, line_num, lines)
        
        # Selecionar mapeamentos baseado no contexto
        if bg_context == "light":
            mappings = LIGHT_BG_MAPPINGS
        else:
            mappings = DARK_BG_MAPPINGS
        
        # Verificar cada mapeamento
        for mapping in mappings:
            # Criar padrão que captura a classe completa
            # Evita substituir parcialmente (ex: text-cyan-400/50)
            pattern = rf'\b{re.escape(mapping.original)}\b(?!/)'
            
            if re.search(pattern, line):
                # Verificar se não é um caso especial
                # (ex: já tem dark: ou light: prefix)
                
                # Para mapeamentos de fundo claro, verificar se não está em contexto dark:
                if mapping in LIGHT_BG_MAPPINGS:
                    if f'dark:{mapping.original}' in line:
                        continue
                
                # Para mapeamentos de fundo escuro, verificar se não está em contexto light:
                if mapping in DARK_BG_MAPPINGS:
                    if f'light:{mapping.original}' in line:
                        continue
                
                fixes.append(ContrastFix(
                    file=filepath,
                    line=line_num,
                    original_class=mapping.original,
                    new_class=mapping.replacement,
                    original_ratio=mapping.original_ratio,
                    new_ratio=mapping.new_ratio,
                    context=f"{bg_context} bg - {mapping.context}",
                    line_content=line.strip()[:80]
                ))
    
    return fixes


def apply_fix(content: str, fix: ContrastFix) -> str:
    """Aplica uma correção ao conteúdo."""
    lines = content.split('\n')
    line_idx = fix.line - 1
    
    if line_idx < len(lines):
        # Criar padrão que captura a classe completa
        pattern = rf'\b{re.escape(fix.original_class)}\b(?!/)'
        lines[line_idx] = re.sub(pattern, fix.new_class, lines[line_idx])
    
    return '\n'.join(lines)


# =============================================================================
# FUNÇÕES DE BACKUP
# =============================================================================

def create_backup(filepath: Path, content: str) -> Path:
    """Cria backup do arquivo antes de modificar."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{filepath.stem}_{timestamp}{filepath.suffix}"
    backup_path = BACKUP_DIR / backup_name
    
    backup_path.write_text(content, encoding='utf-8')
    return backup_path


# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

def fix_critical_contrast(
    paths: List[str],
    dry_run: bool = True,
    verbose: bool = False
) -> FixResult:
    """
    Corrige issues críticos de contraste nos arquivos especificados.
    
    Args:
        paths: Lista de arquivos ou diretórios para processar
        dry_run: Se True, apenas simula as alterações
        verbose: Se True, mostra detalhes de cada correção
    
    Returns:
        FixResult com estatísticas da execução
    """
    result = FixResult()
    
    # Coletar arquivos
    files = []
    for path_str in paths:
        path = Path(path_str)
        if not path.is_absolute():
            path = BASE_DIR / path
        
        if path.is_file():
            files.append(path)
        elif path.is_dir():
            files.extend(find_files(path))
    
    print("=" * 70)
    print("🎨 Correção Automática de Contraste Crítico")
    print("=" * 70)
    print(f"⏱️ Início: {datetime.now().strftime('%H:%M:%S')}")
    print(f"📁 Arquivos: {len(files)}")
    print(f"🔄 Modo: {'Simulação (dry-run)' if dry_run else 'Aplicando correções'}")
    print()
    
    # Processar arquivos
    for filepath in files:
        result.files_analyzed += 1
        
        # Verificar se deve ignorar
        if should_ignore_file(filepath):
            result.skipped_reasons['arquivo_ignorado'] = \
                result.skipped_reasons.get('arquivo_ignorado', 0) + 1
            continue
        
        try:
            content = filepath.read_text(encoding='utf-8')
        except Exception as e:
            print(f"⚠️ Erro ao ler {filepath}: {e}")
            continue
        
        # Encontrar issues
        fixes = find_contrast_issues(content, str(filepath))
        
        if not fixes:
            continue
        
        # Aplicar correções
        modified_content = content
        file_fixes = 0
        
        for fix in fixes:
            # Verificar se a correção já foi aplicada
            if fix.new_class in modified_content.split('\n')[fix.line - 1]:
                result.skipped_reasons['já_corrigido'] = \
                    result.skipped_reasons.get('já_corrigido', 0) + 1
                continue
            
            if not dry_run:
                modified_content = apply_fix(modified_content, fix)
            
            result.all_fixes.append(fix)
            result.fixes_applied += 1
            file_fixes += 1
            
            # Estatísticas por padrão
            pattern_key = f"{fix.original_class} → {fix.new_class}"
            result.fixes_by_pattern[pattern_key] = \
                result.fixes_by_pattern.get(pattern_key, 0) + 1
            
            if verbose:
                print(f"  📝 {Path(fix.file).name}:{fix.line}")
                print(f"     {fix.original_class} → {fix.new_class}")
                print(f"     Ratio: {fix.original_ratio}:1 → {fix.new_ratio}:1")
        
        if file_fixes > 0:
            result.files_modified += 1
            result.fixes_by_file[str(filepath)] = file_fixes
            
            if not dry_run:
                # Criar backup
                create_backup(filepath, content)
                # Salvar arquivo modificado
                filepath.write_text(modified_content, encoding='utf-8')
                print(f"✅ {filepath.name}: {file_fixes} correções")
    
    # Resumo
    print()
    print("=" * 70)
    print("📊 RESUMO")
    print("-" * 70)
    print(f"   Arquivos analisados: {result.files_analyzed}")
    print(f"   Arquivos modificados: {result.files_modified}")
    print(f"   Correções aplicadas: {result.fixes_applied}")
    
    if result.skipped_reasons:
        print()
        print("⏭️ IGNORADOS:")
        for reason, count in result.skipped_reasons.items():
            print(f"   {reason}: {count}")
    
    if result.fixes_by_pattern:
        print()
        print("📋 POR PADRÃO:")
        for pattern, count in sorted(result.fixes_by_pattern.items(), 
                                     key=lambda x: x[1], reverse=True):
            print(f"   {count:3d}x | {pattern}")
    
    if result.fixes_by_file and verbose:
        print()
        print("📁 POR ARQUIVO:")
        for filepath, count in sorted(result.fixes_by_file.items(),
                                      key=lambda x: x[1], reverse=True)[:10]:
            filename = Path(filepath).name
            print(f"   {count:3d} | {filename}")
    
    print()
    print("=" * 70)
    print(f"⏱️ Fim: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 70)
    
    if dry_run:
        print()
        print("💡 Execute com --apply para aplicar as correções")
    
    return result


def generate_report(result: FixResult) -> str:
    """Gera relatório Markdown das correções."""
    report = []
    report.append("# 📊 Relatório de Correção de Contraste Crítico")
    report.append("")
    report.append(f"> Gerado em: {datetime.now().strftime('%d/%m/%Y às %H:%M')}")
    report.append("")
    report.append("## Resumo")
    report.append("")
    report.append("| Métrica | Valor |")
    report.append("|---------|-------|")
    report.append(f"| Arquivos analisados | {result.files_analyzed} |")
    report.append(f"| Arquivos modificados | {result.files_modified} |")
    report.append(f"| Correções aplicadas | {result.fixes_applied} |")
    report.append("")
    
    if result.fixes_by_pattern:
        report.append("## Correções por Padrão")
        report.append("")
        report.append("| Padrão | Quantidade | Melhoria |")
        report.append("|--------|------------|----------|")
        for pattern, count in sorted(result.fixes_by_pattern.items(),
                                     key=lambda x: x[1], reverse=True):
            report.append(f"| `{pattern}` | {count} | ✅ |")
        report.append("")
    
    if result.fixes_by_file:
        report.append("## Arquivos Modificados")
        report.append("")
        report.append("| Arquivo | Correções |")
        report.append("|---------|-----------|")
        for filepath, count in sorted(result.fixes_by_file.items(),
                                      key=lambda x: x[1], reverse=True):
            filename = Path(filepath).name
            report.append(f"| `{filename}` | {count} |")
        report.append("")
    
    return '\n'.join(report)


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Corrige automaticamente issues críticos de contraste'
    )
    
    parser.add_argument(
        '--dry-run', '-n',
        action='store_true',
        help='Simular alterações sem aplicar'
    )
    parser.add_argument(
        '--apply', '-a',
        action='store_true',
        help='Aplicar correções'
    )
    parser.add_argument(
        '--report', '-r',
        action='store_true',
        help='Gerar relatório Markdown'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Mostrar detalhes de cada correção'
    )
    parser.add_argument(
        '--path', '-p',
        type=str,
        default='src',
        help='Caminho para analisar (default: src)'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Arquivo de saída para o relatório'
    )
    
    args = parser.parse_args()
    
    # Determinar modo
    if args.apply:
        dry_run = False
    else:
        dry_run = True  # Default é dry-run
    
    # Executar
    result = fix_critical_contrast(
        paths=[args.path],
        dry_run=dry_run,
        verbose=args.verbose
    )
    
    # Gerar relatório se solicitado
    if args.report:
        report = generate_report(result)
        
        if args.output:
            output_path = Path(args.output)
            output_path.write_text(report, encoding='utf-8')
            print(f"\n📝 Relatório salvo em: {output_path}")
        else:
            print("\n" + report)
    
    # Retornar código de saída
    return 0 if result.fixes_applied > 0 or dry_run else 1


if __name__ == '__main__':
    exit(main())
