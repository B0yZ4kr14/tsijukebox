#!/usr/bin/env python3
"""
Utilitários de Conversão e Análise de Cores
============================================

Este módulo fornece funções para conversão entre formatos de cores
e cálculo de luminância relativa conforme WCAG 2.1.

Formatos suportados:
- HEX: #RGB, #RRGGBB, #RRGGBBAA
- RGB: rgb(r, g, b), rgba(r, g, b, a)
- HSL: hsl(h, s%, l%), hsla(h, s%, l%, a)
- Tailwind CSS: text-gray-500, bg-zinc-800
- CSS Variables: var(--color-name)

Referências:
- WCAG 2.1 Luminância Relativa: https://www.w3.org/WAI/GL/wiki/Relative_luminance
- WCAG 2.1 Ratio de Contraste: https://www.w3.org/WAI/GL/wiki/Contrast_ratio

Autor: TSiJUKEBOX Team
Versão: 1.0.0
Data: 2025-12-25
"""

import re
import colorsys
from dataclasses import dataclass
from typing import Tuple, Optional, Dict, Union


# =============================================================================
# ESTRUTURAS DE DADOS
# =============================================================================

@dataclass
class ColorValue:
    """
    Representa uma cor em múltiplos formatos.
    
    Attributes:
        original: Valor original como aparece no código
        hex: Formato hexadecimal normalizado (#RRGGBB)
        rgb: Tupla (R, G, B) com valores 0-255
        rgba: Tupla (R, G, B, A) com alpha 0.0-1.0
        luminance: Luminância relativa WCAG (0.0-1.0)
        source: Tipo de fonte ('hex', 'rgb', 'hsl', 'tailwind', 'css-var')
        opacity: Opacidade aplicada (0.0-1.0)
    """
    original: str
    hex: str
    rgb: Tuple[int, int, int]
    rgba: Tuple[int, int, int, float]
    luminance: float
    source: str
    opacity: float = 1.0
    
    def __str__(self) -> str:
        return f"{self.hex} (L={self.luminance:.3f})"
    
    def with_opacity(self, opacity: float) -> 'ColorValue':
        """Retorna nova instância com opacidade aplicada."""
        return ColorValue(
            original=self.original,
            hex=self.hex,
            rgb=self.rgb,
            rgba=(self.rgb[0], self.rgb[1], self.rgb[2], opacity),
            luminance=self.luminance,
            source=self.source,
            opacity=opacity
        )


# =============================================================================
# MAPEAMENTO DE CORES TAILWIND
# =============================================================================

TAILWIND_COLORS: Dict[str, str] = {
    # Branco e Preto
    'white': '#ffffff',
    'black': '#000000',
    'transparent': '#00000000',
    
    # Slate
    'slate-50': '#f8fafc',
    'slate-100': '#f1f5f9',
    'slate-200': '#e2e8f0',
    'slate-300': '#cbd5e1',
    'slate-400': '#94a3b8',
    'slate-500': '#64748b',
    'slate-600': '#475569',
    'slate-700': '#334155',
    'slate-800': '#1e293b',
    'slate-900': '#0f172a',
    'slate-950': '#020617',
    
    # Gray
    'gray-50': '#f9fafb',
    'gray-100': '#f3f4f6',
    'gray-200': '#e5e7eb',
    'gray-300': '#d1d5db',
    'gray-400': '#9ca3af',
    'gray-500': '#6b7280',
    'gray-600': '#4b5563',
    'gray-700': '#374151',
    'gray-800': '#1f2937',
    'gray-900': '#111827',
    'gray-950': '#030712',
    
    # Zinc
    'zinc-50': '#fafafa',
    'zinc-100': '#f4f4f5',
    'zinc-200': '#e4e4e7',
    'zinc-300': '#d4d4d8',
    'zinc-400': '#a1a1aa',
    'zinc-500': '#71717a',
    'zinc-600': '#52525b',
    'zinc-700': '#3f3f46',
    'zinc-800': '#27272a',
    'zinc-900': '#18181b',
    'zinc-950': '#09090b',
    
    # Neutral
    'neutral-50': '#fafafa',
    'neutral-100': '#f5f5f5',
    'neutral-200': '#e5e5e5',
    'neutral-300': '#d4d4d4',
    'neutral-400': '#a3a3a3',
    'neutral-500': '#737373',
    'neutral-600': '#525252',
    'neutral-700': '#404040',
    'neutral-800': '#262626',
    'neutral-900': '#171717',
    'neutral-950': '#0a0a0a',
    
    # Stone
    'stone-50': '#fafaf9',
    'stone-100': '#f5f5f4',
    'stone-200': '#e7e5e4',
    'stone-300': '#d6d3d1',
    'stone-400': '#a8a29e',
    'stone-500': '#78716c',
    'stone-600': '#57534e',
    'stone-700': '#44403c',
    'stone-800': '#292524',
    'stone-900': '#1c1917',
    'stone-950': '#0c0a09',
    
    # Red
    'red-50': '#fef2f2',
    'red-100': '#fee2e2',
    'red-200': '#fecaca',
    'red-300': '#fca5a5',
    'red-400': '#f87171',
    'red-500': '#ef4444',
    'red-600': '#dc2626',
    'red-700': '#b91c1c',
    'red-800': '#991b1b',
    'red-900': '#7f1d1d',
    'red-950': '#450a0a',
    
    # Orange
    'orange-50': '#fff7ed',
    'orange-100': '#ffedd5',
    'orange-200': '#fed7aa',
    'orange-300': '#fdba74',
    'orange-400': '#fb923c',
    'orange-500': '#f97316',
    'orange-600': '#ea580c',
    'orange-700': '#c2410c',
    'orange-800': '#9a3412',
    'orange-900': '#7c2d12',
    'orange-950': '#431407',
    
    # Yellow
    'yellow-50': '#fefce8',
    'yellow-100': '#fef9c3',
    'yellow-200': '#fef08a',
    'yellow-300': '#fde047',
    'yellow-400': '#facc15',
    'yellow-500': '#eab308',
    'yellow-600': '#ca8a04',
    'yellow-700': '#a16207',
    'yellow-800': '#854d0e',
    'yellow-900': '#713f12',
    'yellow-950': '#422006',
    
    # Green
    'green-50': '#f0fdf4',
    'green-100': '#dcfce7',
    'green-200': '#bbf7d0',
    'green-300': '#86efac',
    'green-400': '#4ade80',
    'green-500': '#22c55e',
    'green-600': '#16a34a',
    'green-700': '#15803d',
    'green-800': '#166534',
    'green-900': '#14532d',
    'green-950': '#052e16',
    
    # Emerald
    'emerald-50': '#ecfdf5',
    'emerald-100': '#d1fae5',
    'emerald-200': '#a7f3d0',
    'emerald-300': '#6ee7b7',
    'emerald-400': '#34d399',
    'emerald-500': '#10b981',
    'emerald-600': '#059669',
    'emerald-700': '#047857',
    'emerald-800': '#065f46',
    'emerald-900': '#064e3b',
    'emerald-950': '#022c22',
    
    # Blue
    'blue-50': '#eff6ff',
    'blue-100': '#dbeafe',
    'blue-200': '#bfdbfe',
    'blue-300': '#93c5fd',
    'blue-400': '#60a5fa',
    'blue-500': '#3b82f6',
    'blue-600': '#2563eb',
    'blue-700': '#1d4ed8',
    'blue-800': '#1e40af',
    'blue-900': '#1e3a8a',
    'blue-950': '#172554',
    
    # Cyan
    'cyan-50': '#ecfeff',
    'cyan-100': '#cffafe',
    'cyan-200': '#a5f3fc',
    'cyan-300': '#67e8f9',
    'cyan-400': '#22d3ee',
    'cyan-500': '#06b6d4',
    'cyan-600': '#0891b2',
    'cyan-700': '#0e7490',
    'cyan-800': '#155e75',
    'cyan-900': '#164e63',
    'cyan-950': '#083344',
    
    # Purple
    'purple-50': '#faf5ff',
    'purple-100': '#f3e8ff',
    'purple-200': '#e9d5ff',
    'purple-300': '#d8b4fe',
    'purple-400': '#c084fc',
    'purple-500': '#a855f7',
    'purple-600': '#9333ea',
    'purple-700': '#7e22ce',
    'purple-800': '#6b21a8',
    'purple-900': '#581c87',
    'purple-950': '#3b0764',
    
    # Pink
    'pink-50': '#fdf2f8',
    'pink-100': '#fce7f3',
    'pink-200': '#fbcfe8',
    'pink-300': '#f9a8d4',
    'pink-400': '#f472b6',
    'pink-500': '#ec4899',
    'pink-600': '#db2777',
    'pink-700': '#be185d',
    'pink-800': '#9d174d',
    'pink-900': '#831843',
    'pink-950': '#500724',
    
    # Cores de marca (whitelist)
    'spotify-green': '#1DB954',
    'youtube-red': '#FF0000',
    
    # Aliases comuns
    'muted': '#71717a',  # zinc-500
    'muted-foreground': '#a1a1aa',  # zinc-400
    'foreground': '#fafafa',  # zinc-50
    'background': '#09090b',  # zinc-950
    'primary': '#3b82f6',  # blue-500
    'secondary': '#71717a',  # zinc-500
    'accent': '#22d3ee',  # cyan-400
    'destructive': '#ef4444',  # red-500
}

# Mapeamento de opacidades Tailwind
TAILWIND_OPACITY: Dict[str, float] = {
    'opacity-0': 0.0,
    'opacity-5': 0.05,
    'opacity-10': 0.10,
    'opacity-15': 0.15,
    'opacity-20': 0.20,
    'opacity-25': 0.25,
    'opacity-30': 0.30,
    'opacity-35': 0.35,
    'opacity-40': 0.40,
    'opacity-45': 0.45,
    'opacity-50': 0.50,
    'opacity-55': 0.55,
    'opacity-60': 0.60,
    'opacity-65': 0.65,
    'opacity-70': 0.70,
    'opacity-75': 0.75,
    'opacity-80': 0.80,
    'opacity-85': 0.85,
    'opacity-90': 0.90,
    'opacity-95': 0.95,
    'opacity-100': 1.0,
}


# =============================================================================
# FUNÇÕES DE CONVERSÃO
# =============================================================================

def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """
    Converte cor hexadecimal para RGB.
    
    Args:
        hex_color: Cor em formato hex (#RGB, #RRGGBB, ou #RRGGBBAA)
    
    Returns:
        Tupla (R, G, B) com valores 0-255
    
    Examples:
        >>> hex_to_rgb('#fff')
        (255, 255, 255)
        >>> hex_to_rgb('#1DB954')
        (29, 185, 84)
        >>> hex_to_rgb('#00000080')
        (0, 0, 0)
    """
    # Remover # se presente
    hex_color = hex_color.lstrip('#')
    
    # Expandir formato curto (#RGB -> #RRGGBB)
    if len(hex_color) == 3:
        hex_color = ''.join(c * 2 for c in hex_color)
    elif len(hex_color) == 4:
        hex_color = ''.join(c * 2 for c in hex_color[:3])
    elif len(hex_color) == 8:
        hex_color = hex_color[:6]  # Ignorar alpha
    
    # Validar comprimento
    if len(hex_color) != 6:
        raise ValueError(f"Formato hex inválido: #{hex_color}")
    
    # Converter para RGB
    try:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        return (r, g, b)
    except ValueError:
        raise ValueError(f"Caracteres hex inválidos: #{hex_color}")


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """
    Converte RGB para hexadecimal.
    
    Args:
        r: Componente vermelho (0-255)
        g: Componente verde (0-255)
        b: Componente azul (0-255)
    
    Returns:
        Cor em formato #RRGGBB
    
    Examples:
        >>> rgb_to_hex(255, 255, 255)
        '#ffffff'
        >>> rgb_to_hex(29, 185, 84)
        '#1db954'
    """
    # Validar intervalo
    for val, name in [(r, 'R'), (g, 'G'), (b, 'B')]:
        if not 0 <= val <= 255:
            raise ValueError(f"Valor {name} fora do intervalo 0-255: {val}")
    
    return f'#{r:02x}{g:02x}{b:02x}'


def hsl_to_rgb(h: float, s: float, l: float) -> Tuple[int, int, int]:
    """
    Converte HSL para RGB.
    
    Args:
        h: Matiz (0-360)
        s: Saturação (0-100 ou 0-1)
        l: Luminosidade (0-100 ou 0-1)
    
    Returns:
        Tupla (R, G, B) com valores 0-255
    
    Examples:
        >>> hsl_to_rgb(142, 71, 42)  # Spotify green
        (31, 183, 84)
        >>> hsl_to_rgb(0, 100, 50)  # Vermelho puro
        (255, 0, 0)
    """
    # Normalizar valores
    h = h / 360 if h > 1 else h
    s = s / 100 if s > 1 else s
    l = l / 100 if l > 1 else l
    
    # Usar colorsys para conversão
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    
    return (int(r * 255), int(g * 255), int(b * 255))


def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """
    Converte RGB para HSL.
    
    Args:
        r: Componente vermelho (0-255)
        g: Componente verde (0-255)
        b: Componente azul (0-255)
    
    Returns:
        Tupla (H, S, L) com H em 0-360 e S, L em 0-100
    
    Examples:
        >>> rgb_to_hsl(29, 185, 84)
        (142.1, 72.9, 42.0)
    """
    # Normalizar para 0-1
    r_norm = r / 255
    g_norm = g / 255
    b_norm = b / 255
    
    # Usar colorsys para conversão
    h, l, s = colorsys.rgb_to_hls(r_norm, g_norm, b_norm)
    
    return (round(h * 360, 1), round(s * 100, 1), round(l * 100, 1))


def parse_rgb_string(rgb_str: str) -> Tuple[int, int, int, float]:
    """
    Parse string RGB/RGBA para tupla.
    
    Args:
        rgb_str: String no formato rgb(r, g, b) ou rgba(r, g, b, a)
    
    Returns:
        Tupla (R, G, B, A) com R,G,B em 0-255 e A em 0-1
    
    Examples:
        >>> parse_rgb_string('rgb(255, 128, 0)')
        (255, 128, 0, 1.0)
        >>> parse_rgb_string('rgba(0, 0, 0, 0.5)')
        (0, 0, 0, 0.5)
    """
    # Regex para capturar valores
    pattern = r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)'
    match = re.match(pattern, rgb_str.strip(), re.IGNORECASE)
    
    if not match:
        raise ValueError(f"Formato RGB inválido: {rgb_str}")
    
    r = int(match.group(1))
    g = int(match.group(2))
    b = int(match.group(3))
    a = float(match.group(4)) if match.group(4) else 1.0
    
    return (r, g, b, a)


def parse_hsl_string(hsl_str: str) -> Tuple[float, float, float, float]:
    """
    Parse string HSL/HSLA para tupla.
    
    Args:
        hsl_str: String no formato hsl(h, s%, l%) ou hsla(h, s%, l%, a)
    
    Returns:
        Tupla (H, S, L, A) com H em 0-360, S,L em 0-100, A em 0-1
    
    Examples:
        >>> parse_hsl_string('hsl(142, 71%, 42%)')
        (142.0, 71.0, 42.0, 1.0)
        >>> parse_hsl_string('hsla(0, 100%, 50%, 0.8)')
        (0.0, 100.0, 50.0, 0.8)
    """
    # Regex para capturar valores
    pattern = r'hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)'
    match = re.match(pattern, hsl_str.strip(), re.IGNORECASE)
    
    if not match:
        raise ValueError(f"Formato HSL inválido: {hsl_str}")
    
    h = float(match.group(1))
    s = float(match.group(2))
    l = float(match.group(3))
    a = float(match.group(4)) if match.group(4) else 1.0
    
    return (h, s, l, a)


# =============================================================================
# CÁLCULO DE LUMINÂNCIA E CONTRASTE
# =============================================================================

def get_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """
    Calcula a luminância relativa conforme WCAG 2.1.
    
    A luminância relativa é uma medida da intensidade luminosa de uma cor,
    ponderada pela sensibilidade do olho humano a diferentes comprimentos de onda.
    
    Fórmula WCAG:
    L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    
    Onde R, G, B são valores linearizados (gamma-corrected):
    - Se valor <= 0.03928: valor / 12.92
    - Se valor > 0.03928: ((valor + 0.055) / 1.055) ^ 2.4
    
    Args:
        rgb: Tupla (R, G, B) com valores 0-255
    
    Returns:
        Luminância relativa entre 0.0 (preto) e 1.0 (branco)
    
    References:
        https://www.w3.org/WAI/GL/wiki/Relative_luminance
    
    Examples:
        >>> get_relative_luminance((0, 0, 0))  # Preto
        0.0
        >>> get_relative_luminance((255, 255, 255))  # Branco
        1.0
        >>> round(get_relative_luminance((29, 185, 84)), 4)  # Spotify green
        0.3529
    """
    def linearize(value: int) -> float:
        """Aplica correção gamma (sRGB para linear)."""
        v = value / 255
        if v <= 0.03928:
            return v / 12.92
        else:
            return ((v + 0.055) / 1.055) ** 2.4
    
    r, g, b = rgb
    
    r_lin = linearize(r)
    g_lin = linearize(g)
    b_lin = linearize(b)
    
    # Coeficientes de luminância (baseados na sensibilidade do olho humano)
    luminance = 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin
    
    return luminance


def calculate_contrast_ratio(
    fg: Union[Tuple[int, int, int], ColorValue],
    bg: Union[Tuple[int, int, int], ColorValue]
) -> float:
    """
    Calcula o ratio de contraste entre duas cores conforme WCAG 2.1.
    
    O ratio de contraste é calculado como:
    (L1 + 0.05) / (L2 + 0.05)
    
    Onde L1 é a luminância da cor mais clara e L2 da mais escura.
    
    Args:
        fg: Cor do primeiro plano (texto)
        bg: Cor do fundo
    
    Returns:
        Ratio de contraste entre 1.0 (sem contraste) e 21.0 (máximo)
    
    References:
        https://www.w3.org/WAI/GL/wiki/Contrast_ratio
    
    Examples:
        >>> calculate_contrast_ratio((0, 0, 0), (255, 255, 255))  # Preto/Branco
        21.0
        >>> calculate_contrast_ratio((255, 255, 255), (255, 255, 255))  # Mesmo
        1.0
        >>> round(calculate_contrast_ratio((119, 119, 119), (255, 255, 255)), 2)
        4.48
    """
    # Extrair RGB se for ColorValue
    if isinstance(fg, ColorValue):
        fg_rgb = fg.rgb
    else:
        fg_rgb = fg
    
    if isinstance(bg, ColorValue):
        bg_rgb = bg.rgb
    else:
        bg_rgb = bg
    
    # Calcular luminâncias
    l1 = get_relative_luminance(fg_rgb)
    l2 = get_relative_luminance(bg_rgb)
    
    # Garantir que L1 seja a mais clara
    lighter = max(l1, l2)
    darker = min(l1, l2)
    
    # Calcular ratio
    ratio = (lighter + 0.05) / (darker + 0.05)
    
    return round(ratio, 2)


def evaluate_contrast(
    ratio: float,
    text_size: str = 'normal'
) -> Dict[str, Union[float, bool, str]]:
    """
    Avalia se o contraste atende aos critérios WCAG.
    
    Critérios WCAG 2.1:
    
    Nível AA:
    - Texto normal (< 18px ou < 14px bold): >= 4.5:1
    - Texto grande (>= 18px ou >= 14px bold): >= 3.0:1
    
    Nível AAA:
    - Texto normal: >= 7.0:1
    - Texto grande: >= 4.5:1
    
    Args:
        ratio: Ratio de contraste calculado
        text_size: 'normal' ou 'large'
    
    Returns:
        Dicionário com avaliação detalhada
    
    Examples:
        >>> evaluate_contrast(4.5)
        {'ratio': 4.5, 'passes_aa': True, 'passes_aaa': False, ...}
        >>> evaluate_contrast(3.5, 'large')
        {'ratio': 3.5, 'passes_aa': True, 'passes_aaa': False, ...}
    """
    thresholds = {
        'normal': {'AA': 4.5, 'AAA': 7.0},
        'large': {'AA': 3.0, 'AAA': 4.5},
    }
    
    t = thresholds.get(text_size, thresholds['normal'])
    
    passes_aa = ratio >= t['AA']
    passes_aaa = ratio >= t['AAA']
    
    # Determinar severidade
    if ratio < 2.0:
        severity = 'CRITICAL'
    elif ratio < 3.0:
        severity = 'HIGH'
    elif ratio < t['AA']:
        severity = 'MEDIUM'
    elif ratio < t['AAA']:
        severity = 'LOW'
    else:
        severity = 'PASS'
    
    return {
        'ratio': ratio,
        'text_size': text_size,
        'passes_aa': passes_aa,
        'passes_aaa': passes_aaa,
        'required_aa': t['AA'],
        'required_aaa': t['AAA'],
        'gap_aa': round(max(0, t['AA'] - ratio), 2),
        'gap_aaa': round(max(0, t['AAA'] - ratio), 2),
        'severity': severity,
        'wcag_level': 'AAA' if passes_aaa else ('AA' if passes_aa else 'FAIL'),
    }


# =============================================================================
# PARSER UNIVERSAL DE CORES
# =============================================================================

def parse_color(color_str: str) -> Optional[ColorValue]:
    """
    Parse qualquer formato de cor para ColorValue.
    
    Formatos suportados:
    - Hex: #RGB, #RRGGBB, #RRGGBBAA
    - RGB: rgb(r, g, b), rgba(r, g, b, a)
    - HSL: hsl(h, s%, l%), hsla(h, s%, l%, a)
    - Tailwind: gray-500, zinc-800, white, black
    - CSS var: var(--color-name) (retorna None se não mapeado)
    
    Args:
        color_str: String representando uma cor
    
    Returns:
        ColorValue ou None se não puder ser parseado
    
    Examples:
        >>> parse_color('#1DB954')
        ColorValue(hex='#1db954', rgb=(29, 185, 84), ...)
        >>> parse_color('rgb(255, 0, 0)')
        ColorValue(hex='#ff0000', rgb=(255, 0, 0), ...)
        >>> parse_color('gray-500')
        ColorValue(hex='#6b7280', rgb=(107, 114, 128), ...)
    """
    if not color_str:
        return None
    
    color_str = color_str.strip()
    original = color_str
    opacity = 1.0
    source = 'unknown'
    
    try:
        # 1. Hex format
        if color_str.startswith('#'):
            rgb = hex_to_rgb(color_str)
            source = 'hex'
        
        # 2. RGB/RGBA format
        elif color_str.lower().startswith('rgb'):
            r, g, b, opacity = parse_rgb_string(color_str)
            rgb = (r, g, b)
            source = 'rgb'
        
        # 3. HSL/HSLA format
        elif color_str.lower().startswith('hsl'):
            h, s, l, opacity = parse_hsl_string(color_str)
            rgb = hsl_to_rgb(h, s, l)
            source = 'hsl'
        
        # 4. CSS variable
        elif color_str.startswith('var('):
            var_name = re.search(r'var\(--([a-zA-Z0-9-]+)\)', color_str)
            if var_name:
                var_key = var_name.group(1)
                if var_key in TAILWIND_COLORS:
                    rgb = hex_to_rgb(TAILWIND_COLORS[var_key])
                    source = 'css-var'
                else:
                    return None  # Variável não mapeada
            else:
                return None
        
        # 5. Tailwind color name
        else:
            # Remover prefixos comuns
            clean_name = color_str
            for prefix in ['text-', 'bg-', 'border-', 'ring-', 'fill-', 'stroke-']:
                if clean_name.startswith(prefix):
                    clean_name = clean_name[len(prefix):]
                    break
            
            # Remover sufixo de opacidade (/50, /[0.5])
            opacity_match = re.search(r'/(\d+)$', clean_name)
            if opacity_match:
                opacity = int(opacity_match.group(1)) / 100
                clean_name = clean_name[:opacity_match.start()]
            
            if clean_name in TAILWIND_COLORS:
                rgb = hex_to_rgb(TAILWIND_COLORS[clean_name])
                source = 'tailwind'
            else:
                return None  # Cor não reconhecida
        
        # Calcular luminância
        luminance = get_relative_luminance(rgb)
        
        return ColorValue(
            original=original,
            hex=rgb_to_hex(*rgb),
            rgb=rgb,
            rgba=(rgb[0], rgb[1], rgb[2], opacity),
            luminance=luminance,
            source=source,
            opacity=opacity
        )
    
    except (ValueError, TypeError) as e:
        return None


def blend_with_background(
    fg: ColorValue,
    bg: ColorValue,
    opacity: float = None
) -> ColorValue:
    """
    Calcula a cor resultante ao aplicar uma cor com opacidade sobre um fundo.
    
    Fórmula: result = fg * alpha + bg * (1 - alpha)
    
    Args:
        fg: Cor do primeiro plano
        bg: Cor do fundo
        opacity: Opacidade a aplicar (usa fg.opacity se None)
    
    Returns:
        Nova ColorValue representando a cor resultante
    
    Examples:
        >>> white = parse_color('#ffffff')
        >>> black = parse_color('#000000')
        >>> blend_with_background(white, black, 0.5)
        ColorValue(hex='#808080', ...)  # Cinza médio
    """
    alpha = opacity if opacity is not None else fg.opacity
    
    r = int(fg.rgb[0] * alpha + bg.rgb[0] * (1 - alpha))
    g = int(fg.rgb[1] * alpha + bg.rgb[1] * (1 - alpha))
    b = int(fg.rgb[2] * alpha + bg.rgb[2] * (1 - alpha))
    
    rgb = (r, g, b)
    luminance = get_relative_luminance(rgb)
    
    return ColorValue(
        original=f"blend({fg.original}, {bg.original}, {alpha})",
        hex=rgb_to_hex(*rgb),
        rgb=rgb,
        rgba=(r, g, b, 1.0),
        luminance=luminance,
        source='blend',
        opacity=1.0
    )


# =============================================================================
# FUNÇÕES UTILITÁRIAS
# =============================================================================

def get_tailwind_color(name: str) -> Optional[ColorValue]:
    """
    Obtém uma cor Tailwind pelo nome.
    
    Args:
        name: Nome da cor (ex: 'gray-500', 'zinc-800')
    
    Returns:
        ColorValue ou None se não encontrada
    """
    return parse_color(name)


def suggest_accessible_color(
    current: ColorValue,
    background: ColorValue,
    target_ratio: float = 4.5
) -> Optional[ColorValue]:
    """
    Sugere uma cor acessível baseada na cor atual.
    
    Ajusta a luminosidade da cor atual até atingir o ratio desejado.
    
    Args:
        current: Cor atual
        background: Cor do fundo
        target_ratio: Ratio de contraste desejado
    
    Returns:
        ColorValue com cor sugerida ou None se não possível
    """
    h, s, l = rgb_to_hsl(*current.rgb)
    bg_luminance = background.luminance
    
    # Determinar direção do ajuste
    if bg_luminance > 0.5:
        # Fundo claro: escurecer o texto
        direction = -1
        l_range = range(int(l), 0, -5)
    else:
        # Fundo escuro: clarear o texto
        direction = 1
        l_range = range(int(l), 100, 5)
    
    for new_l in l_range:
        new_rgb = hsl_to_rgb(h, s, new_l)
        new_color = ColorValue(
            original=f"suggested({current.original})",
            hex=rgb_to_hex(*new_rgb),
            rgb=new_rgb,
            rgba=(*new_rgb, 1.0),
            luminance=get_relative_luminance(new_rgb),
            source='suggested',
            opacity=1.0
        )
        
        ratio = calculate_contrast_ratio(new_color, background)
        if ratio >= target_ratio:
            return new_color
    
    return None


# =============================================================================
# TESTES
# =============================================================================

def run_tests():
    """Executa testes básicos das funções."""
    print("🧪 Executando testes de color_utils.py...")
    print("-" * 50)
    
    tests_passed = 0
    tests_failed = 0
    
    def test(name: str, condition: bool):
        nonlocal tests_passed, tests_failed
        if condition:
            print(f"  ✅ {name}")
            tests_passed += 1
        else:
            print(f"  ❌ {name}")
            tests_failed += 1
    
    # Testes de conversão hex
    print("\n📝 Testes de conversão HEX:")
    test("hex_to_rgb('#fff')", hex_to_rgb('#fff') == (255, 255, 255))
    test("hex_to_rgb('#000000')", hex_to_rgb('#000000') == (0, 0, 0))
    test("hex_to_rgb('#1DB954')", hex_to_rgb('#1DB954') == (29, 185, 84))
    test("rgb_to_hex(255, 255, 255)", rgb_to_hex(255, 255, 255) == '#ffffff')
    test("rgb_to_hex(29, 185, 84)", rgb_to_hex(29, 185, 84) == '#1db954')
    
    # Testes de luminância
    print("\n📝 Testes de luminância:")
    test("luminância preto = 0", get_relative_luminance((0, 0, 0)) == 0.0)
    test("luminância branco = 1", get_relative_luminance((255, 255, 255)) == 1.0)
    test("luminância cinza médio ~0.2", 0.18 < get_relative_luminance((128, 128, 128)) < 0.22)
    
    # Testes de contraste
    print("\n📝 Testes de contraste:")
    test("contraste preto/branco = 21", calculate_contrast_ratio((0, 0, 0), (255, 255, 255)) == 21.0)
    test("contraste mesmo cor = 1", calculate_contrast_ratio((128, 128, 128), (128, 128, 128)) == 1.0)
    test("contraste #777/#fff ~4.48", 4.4 <= calculate_contrast_ratio((119, 119, 119), (255, 255, 255)) <= 4.5)
    
    # Testes de avaliação WCAG
    print("\n📝 Testes de avaliação WCAG:")
    eval_45 = evaluate_contrast(4.5)
    test("4.5:1 passa AA normal", eval_45['passes_aa'] == True)
    test("4.5:1 falha AAA normal", eval_45['passes_aaa'] == False)
    
    eval_30_large = evaluate_contrast(3.0, 'large')
    test("3.0:1 passa AA large", eval_30_large['passes_aa'] == True)
    
    # Testes de parse
    print("\n📝 Testes de parse:")
    test("parse_color('#1DB954')", parse_color('#1DB954') is not None)
    test("parse_color('rgb(255, 0, 0)')", parse_color('rgb(255, 0, 0)') is not None)
    test("parse_color('gray-500')", parse_color('gray-500') is not None)
    test("parse_color('invalid')", parse_color('invalid') is None)
    
    # Teste de Tailwind
    print("\n📝 Testes de Tailwind:")
    gray500 = parse_color('gray-500')
    test("gray-500 existe", gray500 is not None)
    test("gray-500 hex correto", gray500.hex == '#6b7280' if gray500 else False)
    
    # Resumo
    print("\n" + "=" * 50)
    print(f"📊 Resultado: {tests_passed} passou, {tests_failed} falhou")
    print("=" * 50)
    
    return tests_failed == 0


if __name__ == '__main__':
    run_tests()
