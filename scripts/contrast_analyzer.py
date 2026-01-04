#!/usr/bin/env python3
"""
Analisador de Contraste de Cores
================================

Este módulo analisa arquivos de código para detectar problemas de contraste
de cores conforme WCAG 2.1.

Funcionalidades:
- Detecta combinações de cores texto/fundo
- Calcula ratios de contraste WCAG
- Identifica padrões de baixo contraste
- Gera relatórios detalhados

Uso:
    python3 contrast_analyzer.py --analyze src/
    python3 contrast_analyzer.py --analyze src/ --theme dark
    python3 contrast_analyzer.py --analyze src/ --level aaa

Autor: TSiJUKEBOX Team
Versão: 1.0.0
Data: 2025-12-25
"""

import os
import re
import argparse
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Set
from datetime import datetime

# Importar utilitários de cores
from color_utils import (
    ColorValue,
    parse_color,
    calculate_contrast_ratio,
    evaluate_contrast,
    blend_with_background,
    get_relative_luminance,
    TAILWIND_COLORS,
    TAILWIND_OPACITY
)


# =============================================================================
# CONFIGURAÇÕES
# =============================================================================

BASE_DIR = Path(__file__).parent.parent

# Cores de marca que não devem gerar alertas
BRAND_COLORS_WHITELIST = {
    '#1db954', '#1DB954',  # Spotify Green
    '#ff0000', '#FF0000',  # YouTube Red
    '#1877f2', '#1877F2',  # Facebook Blue
    '#1da1f2', '#1DA1F2',  # Twitter Blue
    '#e4405f', '#E4405F',  # Instagram Pink
}

# Padrões de contexto que indicam texto decorativo (não requer contraste)
DECORATIVE_PATTERNS = [
    r'aria-hidden\s*=\s*["\']true["\']',
    r'role\s*=\s*["\']presentation["\']',
    r'className\s*=\s*["\'][^"\']sr-only[^"\']["\']',
]

# Padrões que indicam elementos não-texto (ícones, badges, indicadores)
# Estes elementos frequentemente têm mesma cor texto/fundo intencionalmente
NON_TEXT_ELEMENT_PATTERNS = [
    r'<[A-Z]\w*Icon',           # Componentes de ícone (LucideIcon, etc.)
    r'Icon\s*/>',               # Tags de ícone auto-fechadas
    r'className\s*=\s*["\'][^"\']*(rounded-full|rounded-lg)[^"\']*(w-\d|h-\d)',  # Indicadores circulares
    r'className\s*=\s*["\'][^"\']*animate-',  # Elementos animados (spinners)
    r'<span[^>]*className\s*=\s*["\'][^"\']*sr-only',  # Screen reader only
    r'<Loader',                  # Componentes de loading
    r'<Spinner',                 # Spinners
    r'<Badge[^>]*variant\s*=',  # Badges com variantes
]

# Padrões de classes que indicam elementos visuais não-texto
VISUAL_ONLY_CLASS_PATTERNS = [
    r'w-[\d.]+(\s|$|px)',       # Largura fixa pequena (indicadores)
    r'h-[\d.]+(\s|$|px)',       # Altura fixa pequena
    r'rounded-full',             # Círculos (geralmente indicadores)
    r'animate-pulse',            # Animação de pulso
    r'animate-spin',             # Animação de rotação
    r'sr-only',                  # Screen reader only
    r'invisible',                # Elementos invisíveis
    r'hidden',                   # Elementos ocultos
]

# Fundos padrão por tema
DEFAULT_BACKGROUNDS = {
    'light': parse_color('#ffffff'),
    'dark': parse_color('#09090b'),  # zinc-950
}


# =============================================================================
# ESTRUTURAS DE DADOS
# =============================================================================

@dataclass
class ContrastIssue:
    """Representa um problema de contraste detectado."""
    file: str
    line: int
    foreground: ColorValue
    background: ColorValue
    ratio: float
    required_ratio: float
    wcag_level: str
    text_size: str
    severity: str
    context: str
    suggestion: Optional[str] = None
    
    def to_dict(self) -> Dict:
        return {
            'file': self.file,
            'line': self.line,
            'foreground': self.foreground.hex,
            'background': self.background.hex,
            'ratio': self.ratio,
            'required_ratio': self.required_ratio,
            'wcag_level': self.wcag_level,
            'severity': self.severity,
            'context': self.context[:80],
        }


@dataclass
class ContrastMetrics:
    """Métricas agregadas de contraste."""
    total_color_usages: int = 0
    total_combinations: int = 0
    issues_found: int = 0
    issues_by_severity: Dict[str, int] = field(default_factory=lambda: {
        'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0
    })
    issues_by_file: Dict[str, int] = field(default_factory=dict)
    average_ratio: float = 0.0
    worst_ratio: float = 21.0
    best_ratio: float = 1.0
    pass_rate_aa: float = 0.0
    pass_rate_aaa: float = 0.0
    issues: List[ContrastIssue] = field(default_factory=list)
    
    def calculate_aggregates(self):
        """Calcula métricas agregadas."""
        if not self.issues:
            self.pass_rate_aa = 100.0
            self.pass_rate_aaa = 100.0
            return
        
        ratios = [i.ratio for i in self.issues]
        self.worst_ratio = min(ratios) if ratios else 21.0
        self.best_ratio = max(ratios) if ratios else 1.0
        self.average_ratio = sum(ratios) / len(ratios) if ratios else 0
        
        # Contar por severidade
        for issue in self.issues:
            self.issues_by_severity[issue.severity] = \
                self.issues_by_severity.get(issue.severity, 0) + 1
            self.issues_by_file[issue.file] = \
                self.issues_by_file.get(issue.file, 0) + 1
        
        # Calcular taxas de aprovação
        if self.total_combinations > 0:
            failures_aa = sum(1 for i in self.issues if i.ratio < i.required_ratio)
            self.pass_rate_aa = ((self.total_combinations - failures_aa) / 
                                  self.total_combinations * 100)


# =============================================================================
# DETECÇÃO DE PADRÕES
# =============================================================================

def extract_tailwind_colors_from_class(class_string: str) -> Dict[str, Tuple[Optional[ColorValue], float]]:
    """
    Extrai cores de uma string de classes Tailwind.
    
    Args:
        class_string: String de classes CSS/Tailwind
    
    Returns:
        Dicionário com tipo de cor e (ColorValue, opacity)
    """
    result = {
        'text': (None, 1.0),
        'bg': (None, 1.0),
        'border': (None, 1.0),
    }
    
    # Detectar opacidade global
    global_opacity = 1.0
    opacity_match = re.search(r'opacity-(\d+)', class_string)
    if opacity_match:
        global_opacity = int(opacity_match.group(1)) / 100
    
    # Padrões para extrair cores
    patterns = {
        'text': r'(?:^|\s)text-([\w-]+?)(?:/(\d+))?(?:\s|$)',
        'bg': r'(?:^|\s)bg-([\w-]+?)(?:/(\d+))?(?:\s|$)',
        'border': r'(?:^|\s)border-([\w-]+?)(?:/(\d+))?(?:\s|$)',
    }
    
    for color_type, pattern in patterns.items():
        matches = re.findall(pattern, class_string)
        for match in matches:
            color_name = match[0] if isinstance(match, tuple) else match
            opacity_suffix = match[1] if isinstance(match, tuple) and len(match) > 1 else None
            
            # Ignorar modificadores que não são cores
            if color_name in ['left', 'right', 'center', 'clip', 'transparent', 
                              'current', 'inherit', 'none', 'auto']:
                continue
            
            color = parse_color(color_name)
            if color:
                opacity = int(opacity_suffix) / 100 if opacity_suffix else global_opacity
                result[color_type] = (color, opacity)
    
    return result


def detect_hardcoded_colors(content: str) -> List[Dict]:
    """
    Detecta cores hardcoded no código.
    
    Args:
        content: Conteúdo do arquivo
    
    Returns:
        Lista de dicionários com informações das cores encontradas
    """
    colors_found = []
    lines = content.split('\n')
    
    patterns = [
        # Hex em strings
        (r'["\']#([0-9a-fA-F]{3,8})["\']', 'hex'),
        # Hex em style
        (r'color:\s*#([0-9a-fA-F]{3,8})', 'hex-style'),
        (r'background(?:-color)?:\s*#([0-9a-fA-F]{3,8})', 'hex-bg'),
        # RGB/RGBA
        (r'(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\))', 'rgb'),
        # HSL/HSLA
        (r'(hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(?:\s*,\s*[\d.]+)?\s*\))', 'hsl'),
    ]
    
    for line_num, line in enumerate(lines, 1):
        for pattern, color_type in patterns:
            for match in re.finditer(pattern, line, re.IGNORECASE):
                color_str = match.group(1) if match.lastindex else match.group(0)
                
                # Adicionar # para hex se necessário
                if color_type.startswith('hex') and not color_str.startswith('#'):
                    color_str = f'#{color_str}'
                
                color = parse_color(color_str)
                if color:
                    colors_found.append({
                        'line': line_num,
                        'color': color,
                        'type': color_type,
                        'context': line.strip()[:100],
                        'is_brand': color.hex.lower() in BRAND_COLORS_WHITELIST,
                    })
    
    return colors_found


def is_likely_non_text_element(line: str, class_string: str) -> bool:
    """
    Verifica se o elemento provavelmente não contém texto legível.
    
    Detecta:
    - Ícones e componentes de ícone
    - Indicadores visuais (dots, badges pequenos)
    - Elementos animados (spinners, loaders)
    - Elementos ocultos ou sr-only
    
    Args:
        line: Linha completa do código
        class_string: String de classes do elemento
    
    Returns:
        True se provavelmente não é texto legível
    """
    # Verificar padrões na linha completa
    for pattern in NON_TEXT_ELEMENT_PATTERNS:
        if re.search(pattern, line, re.IGNORECASE):
            return True
    
    # Verificar padrões nas classes
    for pattern in VISUAL_ONLY_CLASS_PATTERNS:
        if re.search(pattern, class_string):
            # Verificar se é um elemento pequeno (indicador)
            size_match = re.search(r'[wh]-([\d.]+)', class_string)
            if size_match:
                try:
                    size = float(size_match.group(1))
                    if size <= 4:  # Elementos <= 4 (16px) são provavelmente indicadores
                        return True
                except ValueError:
                    pass
            
            # rounded-full com tamanho pequeno = indicador
            if 'rounded-full' in class_string:
                if re.search(r'[wh]-[1-4](\s|$)', class_string):
                    return True
    
    return False


def is_same_color_intentional(fg: ColorValue, bg: ColorValue, context: str) -> bool:
    """
    Verifica se texto e fundo com mesma cor é intencional.
    
    Casos comuns:
    - Botões com ícones (ícone herda cor do texto)
    - Badges onde o texto é da mesma cor que o fundo (erro de CSS)
    - Elementos de loading/skeleton
    
    Args:
        fg: Cor do texto
        bg: Cor do fundo
        context: Contexto da linha
    
    Returns:
        True se a combinação parece intencional/não-problemática
    """
    # Se as cores são idênticas
    if fg.hex.lower() == bg.hex.lower():
        # Verificar se é um padrão conhecido de UI
        ui_patterns = [
            r'Button',           # Botões
            r'Badge',            # Badges
            r'Chip',             # Chips
            r'Tag',              # Tags
            r'Pill',             # Pills
            r'Icon',             # Ícones
            r'Loader',           # Loaders
            r'Spinner',          # Spinners
            r'Skeleton',         # Skeletons
            r'Indicator',        # Indicadores
            r'Dot',              # Dots
            r'Avatar',           # Avatares
        ]
        
        for pattern in ui_patterns:
            if re.search(pattern, context, re.IGNORECASE):
                return True
        
        # Verificar se tem ícone na mesma linha
        if re.search(r'Icon|<svg|<path', context):
            return True
    
    return False


def find_color_combinations(content: str, filepath: str) -> List[Tuple[ColorValue, ColorValue, int, str, bool]]:
    """
    Encontra combinações de cores texto/fundo no código.
    
    Args:
        content: Conteúdo do arquivo
        filepath: Caminho do arquivo
    
    Returns:
        Lista de (foreground, background, line_number, context)
    """
    """
    Encontra combinações de cores texto/fundo no código.
    
    Args:
        content: Conteúdo do arquivo
        filepath: Caminho do arquivo
    
    Returns:
        Lista de (foreground, background, line_number, context, is_likely_false_positive)
    """
    combinations = []
    lines = content.split('\n')
    
    # Regex para encontrar elementos com className
    element_pattern = r'<(\w+)[^>]*className\s*=\s*["\{]([^"\}]+)["\}][^>]*>'
    
    # Determinar tema padrão do arquivo
    is_dark_theme = 'dark' in filepath.lower() or 'dark:' in content
    default_bg = DEFAULT_BACKGROUNDS['dark' if is_dark_theme else 'light']
    
    for line_num, line in enumerate(lines, 1):
        # Verificar se é elemento decorativo
        is_decorative = any(re.search(p, line) for p in DECORATIVE_PATTERNS)
        if is_decorative:
            continue
        
        # Encontrar elementos com classes
        for match in re.finditer(element_pattern, line):
            element_tag = match.group(1)
            class_string = match.group(2)
            
            # Verificar se é elemento não-texto
            is_non_text = is_likely_non_text_element(line, class_string)
            
            # Extrair cores
            colors = extract_tailwind_colors_from_class(class_string)
            
            fg_color, fg_opacity = colors['text']
            bg_color, bg_opacity = colors['bg']
            
            # Se não tem cor de texto, pular
            if not fg_color:
                continue
            
            # Usar fundo padrão se não especificado
            if not bg_color:
                bg_color = default_bg
                bg_opacity = 1.0
            
            # Aplicar opacidade se necessário
            if fg_opacity < 1.0:
                fg_color = blend_with_background(fg_color, bg_color, fg_opacity)
            
            # Verificar se mesma cor é intencional
            is_intentional = is_same_color_intentional(fg_color, bg_color, line)
            
            # Marcar como provável falso positivo
            is_false_positive = is_non_text or is_intentional
            
            combinations.append((
                fg_color,
                bg_color,
                line_num,
                line.strip()[:100],
                is_false_positive
            ))
    
    return combinations


def infer_background_from_context(
    lines: List[str],
    current_line: int,
    theme: str = 'dark'
) -> Optional[ColorValue]:
    """
    Tenta inferir a cor de fundo do contexto.
    
    Args:
        lines: Lista de linhas do arquivo
        current_line: Linha atual (1-indexed)
        theme: Tema padrão ('light' ou 'dark')
    
    Returns:
        ColorValue do fundo inferido ou None
    """
    # Procurar nas linhas anteriores por bg-*
    search_range = min(20, current_line - 1)
    
    for i in range(current_line - 2, max(0, current_line - search_range - 1), -1):
        line = lines[i]
        bg_match = re.search(r'bg-([\w-]+)', line)
        if bg_match:
            color = parse_color(bg_match.group(1))
            if color:
                return color
    
    # Retornar fundo padrão do tema
    return DEFAULT_BACKGROUNDS.get(theme)


# =============================================================================
# ANÁLISE PRINCIPAL
# =============================================================================

def analyze_file(
    filepath: Path,
    config: Dict = None
) -> Tuple[List[ContrastIssue], int, int]:
    """
    Analisa um arquivo para problemas de contraste.
    
    Args:
        filepath: Caminho do arquivo
        config: Configurações de análise
    
    Returns:
        Tupla (issues, total_colors, total_combinations)
    """
    config = config or {}
    issues = []
    total_colors = 0
    total_combinations = 0
    
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        return issues, 0, 0
    
    # Detectar cores hardcoded
    hardcoded = detect_hardcoded_colors(content)
    total_colors += len(hardcoded)
    
    # Encontrar combinações
    combinations = find_color_combinations(content, str(filepath))
    total_combinations += len(combinations)
    
    # Avaliar cada combinação
    for fg, bg, line_num, context, is_false_positive in combinations:
        # Pular falsos positivos identificados
        if is_false_positive and config.get('skip_false_positives', True):
            continue
        # Ignorar cores de marca
        if config.get('ignore_brand', True):
            if fg.hex.lower() in BRAND_COLORS_WHITELIST:
                continue
            if bg.hex.lower() in BRAND_COLORS_WHITELIST:
                continue
        
        # Calcular contraste
        ratio = calculate_contrast_ratio(fg, bg)
        
        # Determinar tamanho do texto
        text_size = 'large' if 'text-lg' in context or 'text-xl' in context or 'text-2xl' in context else 'normal'
        
        # Avaliar
        evaluation = evaluate_contrast(ratio, text_size)
        
        # Verificar nível requerido
        required_level = config.get('level', 'aa').upper()
        required_ratio = evaluation['required_aa'] if required_level == 'AA' else evaluation['required_aaa']
        
        passes = evaluation['passes_aa'] if required_level == 'AA' else evaluation['passes_aaa']
        
        if not passes:
            # Verificação adicional: ratio 1.0 geralmente é falso positivo
            if ratio <= 1.0 and config.get('skip_same_color', True):
                continue
            
            issues.append(ContrastIssue(
                file=str(filepath.relative_to(BASE_DIR)),
                line=line_num,
                foreground=fg,
                background=bg,
                ratio=ratio,
                required_ratio=required_ratio,
                wcag_level=evaluation['wcag_level'],
                text_size=text_size,
                severity=evaluation['severity'],
                context=context,
            ))
    
    # Analisar cores hardcoded problemáticas
    for hc in hardcoded:
        if hc['is_brand']:
            continue
        
        # Assumir fundo padrão
        theme = 'dark' if 'dark' in str(filepath).lower() else config.get('theme', 'dark')
        bg = DEFAULT_BACKGROUNDS.get(theme)
        
        ratio = calculate_contrast_ratio(hc['color'], bg)
        evaluation = evaluate_contrast(ratio)
        
        if evaluation['severity'] in ['CRITICAL', 'HIGH']:
            issues.append(ContrastIssue(
                file=str(filepath.relative_to(BASE_DIR)),
                line=hc['line'],
                foreground=hc['color'],
                background=bg,
                ratio=ratio,
                required_ratio=4.5,
                wcag_level=evaluation['wcag_level'],
                text_size='normal',
                severity=evaluation['severity'],
                context=hc['context'],
            ))
    
    return issues, total_colors, total_combinations


def analyze_color_contrast(
    files: List[str],
    config: Dict = None
) -> ContrastMetrics:
    """
    Função principal de análise de contraste.
    
    Args:
        files: Lista de arquivos para analisar
        config: Configurações opcionais
            - ignore_brand: bool (default: True)
            - level: str ('aa' ou 'aaa', default: 'aa')
            - theme: str ('light', 'dark', 'both', default: 'dark')
            - min_severity: str (default: 'LOW')
    
    Returns:
        ContrastMetrics com todos os issues encontrados
    """
    config = config or {}
    metrics = ContrastMetrics()
    
    for filepath in files:
        path = Path(filepath) if not isinstance(filepath, Path) else filepath
        
        # Converter para caminho absoluto se necessário
        if not path.is_absolute():
            path = BASE_DIR / path
        
        # Verificar se deve analisar
        if not path.exists():
            continue
        
        if path.suffix not in ['.tsx', '.jsx', '.ts', '.js']:
            continue
        
        # Analisar arquivo
        issues, colors, combinations = analyze_file(path, config)
        
        metrics.total_color_usages += colors
        metrics.total_combinations += combinations
        metrics.issues.extend(issues)
    
    # Filtrar por severidade mínima
    min_severity = config.get('min_severity', 'LOW')
    severity_order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    min_index = severity_order.index(min_severity) if min_severity in severity_order else 0
    
    metrics.issues = [
        i for i in metrics.issues 
        if severity_order.index(i.severity) >= min_index
    ]
    
    metrics.issues_found = len(metrics.issues)
    metrics.calculate_aggregates()
    
    return metrics


# =============================================================================
# GERAÇÃO DE RELATÓRIO
# =============================================================================

def generate_contrast_report(metrics: ContrastMetrics) -> str:
    """
    Gera seção de relatório para contraste de cores.
    
    Args:
        metrics: Métricas de contraste
    
    Returns:
        String com relatório em Markdown
    """
    lines = []
    lines.append("## 🎨 Análise de Contraste de Cores\n")
    
    # Resumo
    lines.append("### 📊 Resumo\n")
    lines.append("| Métrica | Valor |")
    lines.append("|---------|-------|")
    lines.append(f"| Total de usos de cor | {metrics.total_color_usages} |")
    lines.append(f"| Combinações analisadas | {metrics.total_combinations} |")
    lines.append(f"| Issues encontrados | {metrics.issues_found} |")
    lines.append(f"| Taxa de aprovação AA | {metrics.pass_rate_aa:.1f}% |")
    lines.append(f"| Pior ratio | {metrics.worst_ratio:.2f}:1 |")
    lines.append(f"| Melhor ratio | {metrics.best_ratio:.2f}:1 |")
    
    if metrics.issues_found == 0:
        lines.append("\n✅ **Nenhum problema de contraste detectado!**\n")
        return "\n".join(lines)
    
    # Issues por severidade
    lines.append("\n### ⚠️ Issues por Severidade\n")
    lines.append("| Severidade | Quantidade | Descrição |")
    lines.append("|------------|------------|-----------|")
    
    severity_desc = {
        'CRITICAL': '🔴 Ratio < 2:1 - Praticamente ilegível',
        'HIGH': '🟠 Ratio < 3:1 - Muito difícil de ler',
        'MEDIUM': '🟡 Ratio < 4.5:1 - Falha WCAG AA',
        'LOW': '🟢 Ratio < 7:1 - Falha WCAG AAA',
    }
    
    for sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        count = metrics.issues_by_severity.get(sev, 0)
        if count > 0:
            lines.append(f"| {sev} | {count} | {severity_desc[sev]} |")
    
    # Top 10 arquivos
    if metrics.issues_by_file:
        lines.append("\n### 📁 Arquivos com Mais Issues\n")
        lines.append("| Arquivo | Issues |")
        lines.append("|---------|--------|")
        
        sorted_files = sorted(
            metrics.issues_by_file.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        for filepath, count in sorted_files:
            lines.append(f"| `{filepath}` | {count} |")
    
    # Top 10 issues
    lines.append("\n### 🔍 Top 10 Issues (Pior Contraste)\n")
    lines.append("| Arquivo | Linha | Ratio | Requerido | Texto | Fundo |")
    lines.append("|---------|-------|-------|-----------|-------|-------|")
    
    sorted_issues = sorted(metrics.issues, key=lambda x: x.ratio)[:10]
    
    for issue in sorted_issues:
        lines.append(
            f"| `{issue.file}` | {issue.line} | {issue.ratio:.2f}:1 | "
            f"{issue.required_ratio}:1 | `{issue.foreground.hex}` | `{issue.background.hex}` |"
        )
    
    # Recomendações
    lines.append("\n### 💡 Recomendações\n")
    
    if metrics.issues_by_severity.get('CRITICAL', 0) > 0:
        lines.append("1. **URGENTE:** Corrigir issues CRÍTICOS - texto praticamente ilegível")
    
    if metrics.issues_by_severity.get('HIGH', 0) > 0:
        lines.append("2. **ALTA PRIORIDADE:** Corrigir issues HIGH - muito difícil de ler")
    
    lines.append("3. Verificar se cores com baixo contraste são realmente para texto legível")
    lines.append("4. Considerar usar `text-zinc-300` em vez de `text-zinc-400` em fundos escuros")
    lines.append("5. Evitar `opacity-50` em texto - usar cor sólida com contraste adequado")
    
    return "\n".join(lines)


# =============================================================================
# CLI
# =============================================================================

def find_files(directory: Path, extensions: List[str] = None) -> List[Path]:
    """Encontra arquivos para análise."""
    extensions = extensions or ['.tsx', '.jsx']
    files = []
    
    for ext in extensions:
        files.extend(directory.rglob(f'*{ext}'))
    
    # Excluir node_modules, dist, etc.
    excluded = ['node_modules', 'dist', 'build', '.next', 'coverage']
    files = [f for f in files if not any(ex in str(f) for ex in excluded)]
    
    return sorted(files)


def main():
    parser = argparse.ArgumentParser(
        description='Analisa contraste de cores em arquivos React/TypeScript',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    
    parser.add_argument(
        '--analyze', '-a',
        type=str,
        nargs='+',
        help='Arquivos ou diretórios para analisar'
    )
    parser.add_argument(
        '--level', '-l',
        choices=['aa', 'aaa'],
        default='aa',
        help='Nível WCAG para verificar (default: aa)'
    )
    parser.add_argument(
        '--theme', '-t',
        choices=['light', 'dark', 'both'],
        default='dark',
        help='Tema para análise (default: dark)'
    )
    parser.add_argument(
        '--min-severity', '-s',
        choices=['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default='MEDIUM',
        help='Severidade mínima para reportar (default: MEDIUM)'
    )
    parser.add_argument(
        '--include-brand',
        action='store_true',
        help='Incluir cores de marca na análise'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Arquivo de saída para o relatório'
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Saída em formato JSON'
    )
    
    args = parser.parse_args()
    
    if not args.analyze:
        parser.print_help()
        return 1
    
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
        print("❌ Nenhum arquivo encontrado para análise")
        return 1
    
    print("=" * 70)
    print("🎨 Analisador de Contraste de Cores")
    print("=" * 70)
    print(f"⏱️ Início: {datetime.now().strftime('%H:%M:%S')}")
    print(f"📁 Arquivos: {len(files)}")
    print(f"📊 Nível WCAG: {args.level.upper()}")
    print(f"🎨 Tema: {args.theme}")
    print()
    
    # Configuração
    config = {
        'level': args.level,
        'theme': args.theme,
        'min_severity': args.min_severity,
        'ignore_brand': not args.include_brand,
    }
    
    # Executar análise
    print("🔍 Analisando arquivos...")
    metrics = analyze_color_contrast([str(f) for f in files], config)
    
    # Gerar relatório
    if args.json:
        import json
        output = json.dumps({
            'total_colors': metrics.total_color_usages,
            'total_combinations': metrics.total_combinations,
            'issues_found': metrics.issues_found,
            'issues_by_severity': metrics.issues_by_severity,
            'pass_rate_aa': metrics.pass_rate_aa,
            'issues': [i.to_dict() for i in metrics.issues],
        }, indent=2)
    else:
        output = generate_contrast_report(metrics)
    
    # Salvar ou exibir
    if args.output:
        Path(args.output).write_text(output, encoding='utf-8')
        print(f"📝 Relatório salvo em: {args.output}")
    else:
        print()
        print(output)
    
    # Resumo
    print()
    print("=" * 70)
    print("📊 RESUMO")
    print("-" * 70)
    print(f"   Arquivos analisados: {len(files)}")
    print(f"   Combinações de cores: {metrics.total_combinations}")
    print(f"   Issues encontrados: {metrics.issues_found}")
    print(f"   Taxa de aprovação AA: {metrics.pass_rate_aa:.1f}%")
    
    if metrics.issues_found > 0:
        print(f"   Pior ratio: {metrics.worst_ratio:.2f}:1")
        print(f"   Severidades: ", end="")
        for sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            count = metrics.issues_by_severity.get(sev, 0)
            if count > 0:
                print(f"{sev}={count} ", end="")
        print()
    
    print("=" * 70)
    print(f"⏱️ Fim: {datetime.now().strftime('%H:%M:%S')}")
    
    # Código de saída baseado em issues críticos
    if metrics.issues_by_severity.get('CRITICAL', 0) > 0:
        return 2
    elif metrics.issues_by_severity.get('HIGH', 0) > 0:
        return 1
    return 0


if __name__ == '__main__':
    exit(main())
