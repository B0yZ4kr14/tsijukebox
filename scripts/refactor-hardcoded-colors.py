#!/usr/bin/env python3
"""
TSiJUKEBOX - Refatorador de Cores Hardcoded
============================================

Este script analisa o código fonte e identifica cores hardcoded,
sugerindo design tokens e variáveis CSS/Tailwind correspondentes.

Funcionalidades:
- Escaneia arquivos .tsx em src/components
- Identifica cores hexadecimais hardcoded
- Sugere design tokens correspondentes
- Gera relatório de refatoração
- Opcionalmente aplica as correções

Uso:
    python3 refactor-hardcoded-colors.py [--dry-run] [--apply] [--report]

Opções:
    --dry-run   Mostra o que seria alterado sem modificar arquivos
    --apply     Aplica as correções automaticamente
    --report    Gera relatório detalhado em Markdown
"""

import os
import re
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict

# Configuração
SRC_DIR = Path(__file__).parent.parent / "src"
COMPONENTS_DIR = SRC_DIR / "components"
REPORT_FILE = Path(__file__).parent.parent / "docs" / "COLOR_REFACTOR_REPORT.md"

# Cores para output
class Colors:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    MAGENTA = "\033[95m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

def print_header():
    """Imprime o cabeçalho do script."""
    print(f"""
{Colors.CYAN}{Colors.BOLD}╔══════════════════════════════════════════════════════════════╗
║     TSiJUKEBOX - Refatorador de Cores Hardcoded              ║
║                        v1.0.0                                 ║
╚══════════════════════════════════════════════════════════════╝{Colors.RESET}
""")

# Mapeamento de cores para design tokens
# Baseado no sistema de design do TSiJUKEBOX
COLOR_MAPPINGS: Dict[str, Dict] = {
    # Cores primárias
    "#1DB954": {"token": "spotify-green", "tailwind": "text-spotify-green", "css": "var(--spotify-green)", "category": "brand"},
    "#1ed760": {"token": "spotify-green-light", "tailwind": "text-spotify-green-light", "css": "var(--spotify-green-light)", "category": "brand"},
    "#FF0000": {"token": "youtube-red", "tailwind": "text-youtube-red", "css": "var(--youtube-red)", "category": "brand"},
    "#FF4444": {"token": "youtube-red-light", "tailwind": "text-youtube-red-light", "css": "var(--youtube-red-light)", "category": "brand"},
    
    # Cores de fundo
    "#000000": {"token": "background-black", "tailwind": "bg-black", "css": "var(--background)", "category": "background"},
    "#0a0a0a": {"token": "background-darker", "tailwind": "bg-background", "css": "var(--background)", "category": "background"},
    "#121212": {"token": "background-dark", "tailwind": "bg-card", "css": "var(--card)", "category": "background"},
    "#1a1a1a": {"token": "background-elevated", "tailwind": "bg-muted", "css": "var(--muted)", "category": "background"},
    "#181818": {"token": "background-surface", "tailwind": "bg-secondary", "css": "var(--secondary)", "category": "background"},
    "#282828": {"token": "background-hover", "tailwind": "bg-accent", "css": "var(--accent)", "category": "background"},
    "#333333": {"token": "background-active", "tailwind": "bg-accent", "css": "var(--accent)", "category": "background"},
    "#ffffff": {"token": "background-white", "tailwind": "bg-white", "css": "var(--background)", "category": "background"},
    
    # Cores de texto
    "#FFFFFF": {"token": "text-primary", "tailwind": "text-foreground", "css": "var(--foreground)", "category": "text"},
    "#ffffff": {"token": "text-primary", "tailwind": "text-foreground", "css": "var(--foreground)", "category": "text"},
    "#B3B3B3": {"token": "text-secondary", "tailwind": "text-muted-foreground", "css": "var(--muted-foreground)", "category": "text"},
    "#b3b3b3": {"token": "text-secondary", "tailwind": "text-muted-foreground", "css": "var(--muted-foreground)", "category": "text"},
    "#A0A0A0": {"token": "text-tertiary", "tailwind": "text-muted-foreground", "css": "var(--muted-foreground)", "category": "text"},
    "#808080": {"token": "text-disabled", "tailwind": "text-muted-foreground/50", "css": "var(--muted-foreground)", "category": "text"},
    "#666666": {"token": "text-placeholder", "tailwind": "text-muted-foreground/60", "css": "var(--muted-foreground)", "category": "text"},
    
    # Cores de borda
    "#404040": {"token": "border-default", "tailwind": "border-border", "css": "var(--border)", "category": "border"},
    "#535353": {"token": "border-hover", "tailwind": "border-border", "css": "var(--border)", "category": "border"},
    "#2a2a2a": {"token": "border-subtle", "tailwind": "border-border/50", "css": "var(--border)", "category": "border"},
    
    # Cores de estado
    "#22c55e": {"token": "success", "tailwind": "text-green-500", "css": "var(--success)", "category": "state"},
    "#ef4444": {"token": "error", "tailwind": "text-red-500", "css": "var(--destructive)", "category": "state"},
    "#f59e0b": {"token": "warning", "tailwind": "text-yellow-500", "css": "var(--warning)", "category": "state"},
    "#3b82f6": {"token": "info", "tailwind": "text-blue-500", "css": "var(--info)", "category": "state"},
    
    # Cores de gradiente
    "#6366f1": {"token": "gradient-purple", "tailwind": "text-indigo-500", "css": "var(--gradient-start)", "category": "gradient"},
    "#8b5cf6": {"token": "gradient-violet", "tailwind": "text-violet-500", "css": "var(--gradient-end)", "category": "gradient"},
    "#ec4899": {"token": "gradient-pink", "tailwind": "text-pink-500", "css": "var(--gradient-accent)", "category": "gradient"},
    
    # Cores de overlay
    "rgba(0, 0, 0, 0.5)": {"token": "overlay-dark", "tailwind": "bg-black/50", "css": "var(--overlay)", "category": "overlay"},
    "rgba(0, 0, 0, 0.7)": {"token": "overlay-darker", "tailwind": "bg-black/70", "css": "var(--overlay-dark)", "category": "overlay"},
    "rgba(255, 255, 255, 0.1)": {"token": "overlay-light", "tailwind": "bg-white/10", "css": "var(--overlay-light)", "category": "overlay"},
    "rgba(0, 0, 0, 0.6)": {"token": "overlay-dark-60", "tailwind": "bg-black/60", "css": "var(--overlay-dark-60)", "category": "overlay"},
    "rgba(0,0,0,0.6)": {"token": "overlay-dark-60", "tailwind": "bg-black/60", "css": "var(--overlay-dark-60)", "category": "overlay"},
    
    # Background Extensions
    "#444444": {"token": "background-elevated-hover", "tailwind": "bg-zinc-700", "css": "var(--background-elevated-hover)", "category": "background"},
    "#222222": {"token": "background-darker", "tailwind": "bg-zinc-900", "css": "var(--background-darker)", "category": "background"},
    "#050508": {"token": "background-black-elevated", "tailwind": "bg-zinc-950", "css": "var(--background-black-elevated)", "category": "background"},
    "#0A0A12": {"token": "background-deep", "tailwind": "bg-slate-950", "css": "var(--background-deep)", "category": "background"},
    "#0a0a12": {"token": "background-deep", "tailwind": "bg-slate-950", "css": "var(--background-deep)", "category": "background"},
    "#CCCCCC": {"token": "text-light", "tailwind": "text-gray-300", "css": "var(--text-light)", "category": "text"},
    "#cccccc": {"token": "text-light", "tailwind": "text-gray-300", "css": "var(--text-light)", "category": "text"},
    
    # Accent Colors
    "rgba(0, 212, 255, 0.6)": {"token": "accent-cyan-60", "tailwind": "bg-cyan-400/60", "css": "var(--accent-cyan-60)", "category": "accent"},
    "rgba(0,212,255,0.6)": {"token": "accent-cyan-60", "tailwind": "bg-cyan-400/60", "css": "var(--accent-cyan-60)", "category": "accent"},
    "rgba(0, 212, 255, 0.3)": {"token": "accent-cyan-30", "tailwind": "bg-cyan-400/30", "css": "var(--accent-cyan-30)", "category": "accent"},
    "rgba(0,212,255,0.3)": {"token": "accent-cyan-30", "tailwind": "bg-cyan-400/30", "css": "var(--accent-cyan-30)", "category": "accent"},
    "#00D4FF": {"token": "accent-cyan", "tailwind": "text-cyan-400", "css": "var(--accent-cyan)", "category": "accent"},
    "#00d4ff": {"token": "accent-cyan", "tailwind": "text-cyan-400", "css": "var(--accent-cyan)", "category": "accent"},
    "#00B8E6": {"token": "accent-cyan-dark", "tailwind": "text-cyan-500", "css": "var(--accent-cyan-dark)", "category": "accent"},
    "#00b8e6": {"token": "accent-cyan-dark", "tailwind": "text-cyan-500", "css": "var(--accent-cyan-dark)", "category": "accent"},
    "#00BFFF": {"token": "accent-sky", "tailwind": "text-sky-400", "css": "var(--accent-sky)", "category": "accent"},
    "#00bfff": {"token": "accent-sky", "tailwind": "text-sky-400", "css": "var(--accent-sky)", "category": "accent"},
    
    # State Extensions
    "#3ECF8E": {"token": "success-light", "tailwind": "text-emerald-400", "css": "var(--success-light)", "category": "state"},
    "#3ecf8e": {"token": "success-light", "tailwind": "text-emerald-400", "css": "var(--success-light)", "category": "state"},
    "#00FF88": {"token": "success-bright", "tailwind": "text-emerald-300", "css": "var(--success-bright)", "category": "state"},
    "#00ff88": {"token": "success-bright", "tailwind": "text-emerald-300", "css": "var(--success-bright)", "category": "state"},
    "#00E63D": {"token": "success-neon", "tailwind": "text-green-400", "css": "var(--success-neon)", "category": "state"},
    "#00e63d": {"token": "success-neon", "tailwind": "text-green-400", "css": "var(--success-neon)", "category": "state"},
    "#00FF44": {"token": "success-vivid", "tailwind": "text-green-300", "css": "var(--success-vivid)", "category": "state"},
    "#00ff44": {"token": "success-vivid", "tailwind": "text-green-300", "css": "var(--success-vivid)", "category": "state"},
    "#FF3333": {"token": "error-light", "tailwind": "text-red-500", "css": "var(--error-light)", "category": "state"},
    "#ff3333": {"token": "error-light", "tailwind": "text-red-500", "css": "var(--error-light)", "category": "state"},
    "rgba(239, 68, 68, 0.3)": {"token": "error-overlay-30", "tailwind": "bg-red-500/30", "css": "var(--error-overlay-30)", "category": "state"},
    "rgba(239,68,68,0.3)": {"token": "error-overlay-30", "tailwind": "bg-red-500/30", "css": "var(--error-overlay-30)", "category": "state"},
    "rgba(239, 68, 68, 0.5)": {"token": "error-overlay-50", "tailwind": "bg-red-500/50", "css": "var(--error-overlay-50)", "category": "state"},
    "rgba(239,68,68,0.5)": {"token": "error-overlay-50", "tailwind": "bg-red-500/50", "css": "var(--error-overlay-50)", "category": "state"},
    "#E6BD00": {"token": "warning-dark", "tailwind": "text-yellow-600", "css": "var(--warning-dark)", "category": "state"},
    "#e6bd00": {"token": "warning-dark", "tailwind": "text-yellow-600", "css": "var(--warning-dark)", "category": "state"},
    
    # Brand Extensions
    "rgba(29, 185, 84, 0.6)": {"token": "spotify-green-60", "tailwind": "bg-spotify-green/60", "css": "var(--spotify-green-60)", "category": "brand"},
    "rgba(29,185,84,0.6)": {"token": "spotify-green-60", "tailwind": "bg-spotify-green/60", "css": "var(--spotify-green-60)", "category": "brand"},
    "rgba(255, 0, 0, 0.5)": {"token": "youtube-red-50", "tailwind": "bg-youtube-red/50", "css": "var(--youtube-red-50)", "category": "brand"},
    "rgba(255,0,0,0.5)": {"token": "youtube-red-50", "tailwind": "bg-youtube-red/50", "css": "var(--youtube-red-50)", "category": "brand"},
    
    # Weather Colors
    "#FFD93D": {"token": "weather-sun", "tailwind": "text-yellow-300", "css": "var(--weather-sun)", "category": "weather"},
    "#ffd93d": {"token": "weather-sun", "tailwind": "text-yellow-300", "css": "var(--weather-sun)", "category": "weather"},
    "#B0BEC5": {"token": "weather-cloud", "tailwind": "text-gray-400", "css": "var(--weather-cloud)", "category": "weather"},
    "#b0bec5": {"token": "weather-cloud", "tailwind": "text-gray-400", "css": "var(--weather-cloud)", "category": "weather"},
    "#78909C": {"token": "weather-cloud-dark", "tailwind": "text-gray-500", "css": "var(--weather-cloud-dark)", "category": "weather"},
    "#78909c": {"token": "weather-cloud-dark", "tailwind": "text-gray-500", "css": "var(--weather-cloud-dark)", "category": "weather"},
    "#90A4AE": {"token": "weather-cloud-medium", "tailwind": "text-gray-400", "css": "var(--weather-cloud-medium)", "category": "weather"},
    "#90a4ae": {"token": "weather-cloud-medium", "tailwind": "text-gray-400", "css": "var(--weather-cloud-medium)", "category": "weather"},
    "#4FC3F7": {"token": "weather-rain", "tailwind": "text-cyan-300", "css": "var(--weather-rain)", "category": "weather"},
    "#4fc3f7": {"token": "weather-rain", "tailwind": "text-cyan-300", "css": "var(--weather-rain)", "category": "weather"},
    "#E3F2FD": {"token": "weather-snow", "tailwind": "text-blue-50", "css": "var(--weather-snow)", "category": "weather"},
    "#e3f2fd": {"token": "weather-snow", "tailwind": "text-blue-50", "css": "var(--weather-snow)", "category": "weather"},
    
    # Programming Languages
    "#3178C6": {"token": "lang-typescript", "tailwind": "text-[#3178C6]", "css": "var(--lang-typescript)", "category": "language"},
    "#3178c6": {"token": "lang-typescript", "tailwind": "text-[#3178C6]", "css": "var(--lang-typescript)", "category": "language"},
    "#F7DF1E": {"token": "lang-javascript", "tailwind": "text-[#F7DF1E]", "css": "var(--lang-javascript)", "category": "language"},
    "#f7df1e": {"token": "lang-javascript", "tailwind": "text-[#F7DF1E]", "css": "var(--lang-javascript)", "category": "language"},
    "#3776AB": {"token": "lang-python", "tailwind": "text-[#3776AB]", "css": "var(--lang-python)", "category": "language"},
    "#3776ab": {"token": "lang-python", "tailwind": "text-[#3776AB]", "css": "var(--lang-python)", "category": "language"},
    "#E34C26": {"token": "lang-html", "tailwind": "text-[#E34C26]", "css": "var(--lang-html)", "category": "language"},
    "#e34c26": {"token": "lang-html", "tailwind": "text-[#E34C26]", "css": "var(--lang-html)", "category": "language"},
    "#1572B6": {"token": "lang-css", "tailwind": "text-[#1572B6]", "css": "var(--lang-css)", "category": "language"},
    "#1572b6": {"token": "lang-css", "tailwind": "text-[#1572B6]", "css": "var(--lang-css)", "category": "language"},
    "#264DE4": {"token": "lang-css3", "tailwind": "text-[#264DE4]", "css": "var(--lang-css3)", "category": "language"},
    "#264de4": {"token": "lang-css3", "tailwind": "text-[#264DE4]", "css": "var(--lang-css3)", "category": "language"},
    "#89E051": {"token": "lang-nodejs", "tailwind": "text-[#89E051]", "css": "var(--lang-nodejs)", "category": "language"},
    "#89e051": {"token": "lang-nodejs", "tailwind": "text-[#89E051]", "css": "var(--lang-nodejs)", "category": "language"},
    "#2496ED": {"token": "lang-docker", "tailwind": "text-[#2496ED]", "css": "var(--lang-docker)", "category": "language"},
    "#2496ed": {"token": "lang-docker", "tailwind": "text-[#2496ED]", "css": "var(--lang-docker)", "category": "language"},
    "#CB171E": {"token": "lang-ruby", "tailwind": "text-[#CB171E]", "css": "var(--lang-ruby)", "category": "language"},
    "#cb171e": {"token": "lang-ruby", "tailwind": "text-[#CB171E]", "css": "var(--lang-ruby)", "category": "language"},
    "#083FA1": {"token": "lang-markdown", "tailwind": "text-[#083FA1]", "css": "var(--lang-markdown)", "category": "language"},
    "#083fa1": {"token": "lang-markdown", "tailwind": "text-[#083FA1]", "css": "var(--lang-markdown)", "category": "language"},
    
    # Theme Customizer Colors
    "#00FF7F": {"token": "theme-spring", "tailwind": "text-[#00FF7F]", "css": "var(--theme-spring)", "category": "theme"},
    "#00ff7f": {"token": "theme-spring", "tailwind": "text-[#00FF7F]", "css": "var(--theme-spring)", "category": "theme"},
    "#9B59B6": {"token": "theme-amethyst", "tailwind": "text-[#9B59B6]", "css": "var(--theme-amethyst)", "category": "theme"},
    "#9b59b6": {"token": "theme-amethyst", "tailwind": "text-[#9B59B6]", "css": "var(--theme-amethyst)", "category": "theme"},
    "#FF6B35": {"token": "theme-orange", "tailwind": "text-[#FF6B35]", "css": "var(--theme-orange)", "category": "theme"},
    "#ff6b35": {"token": "theme-orange", "tailwind": "text-[#FF6B35]", "css": "var(--theme-orange)", "category": "theme"},
    "#FF1493": {"token": "theme-pink", "tailwind": "text-[#FF1493]", "css": "var(--theme-pink)", "category": "theme"},
    "#ff1493": {"token": "theme-pink", "tailwind": "text-[#FF1493]", "css": "var(--theme-pink)", "category": "theme"},
    "#FFD700": {"token": "theme-gold", "tailwind": "text-[#FFD700]", "css": "var(--theme-gold)", "category": "theme"},
    "#ffd700": {"token": "theme-gold", "tailwind": "text-[#FFD700]", "css": "var(--theme-gold)", "category": "theme"},
    "#10B981": {"token": "theme-emerald", "tailwind": "text-emerald-500", "css": "var(--theme-emerald)", "category": "theme"},
    "#10b981": {"token": "theme-emerald", "tailwind": "text-emerald-500", "css": "var(--theme-emerald)", "category": "theme"},
    "#FF00D4": {"token": "theme-magenta", "tailwind": "text-[#FF00D4]", "css": "var(--theme-magenta)", "category": "theme"},
    "#ff00d4": {"token": "theme-magenta", "tailwind": "text-[#FF00D4]", "css": "var(--theme-magenta)", "category": "theme"},
    "#FFD400": {"token": "theme-yellow", "tailwind": "text-[#FFD400]", "css": "var(--theme-yellow)", "category": "theme"},
    "#ffd400": {"token": "theme-yellow", "tailwind": "text-[#FFD400]", "css": "var(--theme-yellow)", "category": "theme"},
    "#D400FF": {"token": "theme-violet", "tailwind": "text-[#D400FF]", "css": "var(--theme-violet)", "category": "theme"},
    "#d400ff": {"token": "theme-violet", "tailwind": "text-[#D400FF]", "css": "var(--theme-violet)", "category": "theme"},
    "#FF4400": {"token": "theme-orange-bright", "tailwind": "text-[#FF4400]", "css": "var(--theme-orange-bright)", "category": "theme"},
    "#ff4400": {"token": "theme-orange-bright", "tailwind": "text-[#FF4400]", "css": "var(--theme-orange-bright)", "category": "theme"},
    "#4400FF": {"token": "theme-blue-violet", "tailwind": "text-[#4400FF]", "css": "var(--theme-blue-violet)", "category": "theme"},
    "#4400ff": {"token": "theme-blue-violet", "tailwind": "text-[#4400FF]", "css": "var(--theme-blue-violet)", "category": "theme"},
    "#FFFF00": {"token": "theme-pure-yellow", "tailwind": "text-yellow-400", "css": "var(--theme-pure-yellow)", "category": "theme"},
    "#ffff00": {"token": "theme-pure-yellow", "tailwind": "text-yellow-400", "css": "var(--theme-pure-yellow)", "category": "theme"},
    "#00FF00": {"token": "theme-pure-green", "tailwind": "text-green-400", "css": "var(--theme-pure-green)", "category": "theme"},
    "#00ff00": {"token": "theme-pure-green", "tailwind": "text-green-400", "css": "var(--theme-pure-green)", "category": "theme"},
    "#00FFFF": {"token": "theme-cyan", "tailwind": "text-cyan-400", "css": "var(--theme-cyan)", "category": "theme"},
    "#00ffff": {"token": "theme-cyan", "tailwind": "text-cyan-400", "css": "var(--theme-cyan)", "category": "theme"},
    "#0000FF": {"token": "theme-pure-blue", "tailwind": "text-blue-500", "css": "var(--theme-pure-blue)", "category": "theme"},
    "#0000ff": {"token": "theme-pure-blue", "tailwind": "text-blue-500", "css": "var(--theme-pure-blue)", "category": "theme"},
    "#FF00FF": {"token": "theme-pure-magenta", "tailwind": "text-fuchsia-500", "css": "var(--theme-pure-magenta)", "category": "theme"},
    "#ff00ff": {"token": "theme-pure-magenta", "tailwind": "text-fuchsia-500", "css": "var(--theme-pure-magenta)", "category": "theme"},
}

# Padrões de cores a serem ignorados (cores de marca de terceiros)
IGNORE_PATTERNS = [
    r"Spotify",
    r"YouTube",
    r"GitHub",
    r"Discord",
    r"Google",
    r"Facebook",
    r"Twitter",
    r"branding",
]

@dataclass
class ColorOccurrence:
    """Representa uma ocorrência de cor hardcoded."""
    file: Path
    line_number: int
    line_content: str
    color: str
    context: str
    suggested_token: Optional[Dict] = None

def find_hex_colors(content: str) -> List[Tuple[int, str, str]]:
    """Encontra todas as cores hexadecimais no conteúdo."""
    pattern = r'["\']?(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})["\']?'
    results = []
    
    for i, line in enumerate(content.split('\n'), 1):
        # Ignorar linhas com padrões de marca
        if any(re.search(p, line, re.IGNORECASE) for p in IGNORE_PATTERNS):
            continue
        
        matches = re.finditer(pattern, line)
        for match in matches:
            color = match.group(1).upper()
            # Expandir cores de 3 dígitos para 6
            if len(color) == 4:
                color = f"#{color[1]*2}{color[2]*2}{color[3]*2}"
            results.append((i, color, line.strip()))
    
    return results

def find_rgba_colors(content: str) -> List[Tuple[int, str, str]]:
    """Encontra todas as cores rgba no conteúdo."""
    pattern = r'rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)'
    results = []
    
    for i, line in enumerate(content.split('\n'), 1):
        if any(re.search(p, line, re.IGNORECASE) for p in IGNORE_PATTERNS):
            continue
        
        matches = re.finditer(pattern, line)
        for match in matches:
            color = match.group(0)
            results.append((i, color, line.strip()))
    
    return results

def get_color_suggestion(color: str) -> Optional[Dict]:
    """Retorna a sugestão de design token para uma cor."""
    # Normalizar cor para comparação
    color_normalized = color.lower()
    
    # Busca exata
    if color_normalized in COLOR_MAPPINGS:
        return COLOR_MAPPINGS[color_normalized]
    if color.upper() in COLOR_MAPPINGS:
        return COLOR_MAPPINGS[color.upper()]
    
    # Busca por similaridade (cores próximas)
    # TODO: Implementar busca por similaridade de cor
    
    return None

def scan_file(filepath: Path) -> List[ColorOccurrence]:
    """Escaneia um arquivo em busca de cores hardcoded."""
    occurrences = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"{Colors.RED}❌ Erro ao ler {filepath}: {e}{Colors.RESET}")
        return []
    
    # Encontrar cores hex
    hex_colors = find_hex_colors(content)
    for line_num, color, line_content in hex_colors:
        suggestion = get_color_suggestion(color)
        occurrences.append(ColorOccurrence(
            file=filepath,
            line_number=line_num,
            line_content=line_content,
            color=color,
            context="hex",
            suggested_token=suggestion
        ))
    
    # Encontrar cores rgba
    rgba_colors = find_rgba_colors(content)
    for line_num, color, line_content in rgba_colors:
        suggestion = get_color_suggestion(color)
        occurrences.append(ColorOccurrence(
            file=filepath,
            line_number=line_num,
            line_content=line_content,
            color=color,
            context="rgba",
            suggested_token=suggestion
        ))
    
    return occurrences

def scan_directory(directory: Path) -> List[ColorOccurrence]:
    """Escaneia um diretório recursivamente."""
    all_occurrences = []
    
    for filepath in directory.rglob("*.tsx"):
        occurrences = scan_file(filepath)
        all_occurrences.extend(occurrences)
    
    return all_occurrences

def generate_report(occurrences: List[ColorOccurrence]) -> str:
    """Gera um relatório em Markdown."""
    # Agrupar por arquivo
    by_file = defaultdict(list)
    for occ in occurrences:
        by_file[occ.file].append(occ)
    
    # Agrupar por cor
    by_color = defaultdict(list)
    for occ in occurrences:
        by_color[occ.color].append(occ)
    
    # Estatísticas
    total = len(occurrences)
    with_suggestion = sum(1 for occ in occurrences if occ.suggested_token)
    without_suggestion = total - with_suggestion
    
    report = f"""# Relatório de Refatoração de Cores Hardcoded

> **Gerado em:** {__import__('datetime').datetime.now().strftime('%d/%m/%Y %H:%M')}  
> **Total de Ocorrências:** {total}  
> **Com Sugestão:** {with_suggestion}  
> **Sem Sugestão:** {without_suggestion}

---

## 📊 Resumo por Categoria

| Categoria | Quantidade |
|-----------|------------|
"""
    
    # Contar por categoria
    categories = defaultdict(int)
    for occ in occurrences:
        if occ.suggested_token:
            categories[occ.suggested_token["category"]] += 1
        else:
            categories["unknown"] += 1
    
    for category, count in sorted(categories.items()):
        report += f"| {category.capitalize()} | {count} |\n"
    
    report += f"""
---

## 🎨 Cores Mais Frequentes

| Cor | Ocorrências | Token Sugerido | Tailwind |
|-----|-------------|----------------|----------|
"""
    
    # Top 20 cores mais frequentes
    sorted_colors = sorted(by_color.items(), key=lambda x: len(x[1]), reverse=True)[:20]
    for color, occs in sorted_colors:
        count = len(occs)
        suggestion = occs[0].suggested_token
        if suggestion:
            token = suggestion["token"]
            tailwind = suggestion["tailwind"]
        else:
            token = "❌ Não mapeado"
            tailwind = "-"
        report += f"| `{color}` | {count} | `{token}` | `{tailwind}` |\n"
    
    report += f"""
---

## 📁 Ocorrências por Arquivo

"""
    
    # Listar por arquivo (top 20)
    sorted_files = sorted(by_file.items(), key=lambda x: len(x[1]), reverse=True)[:20]
    for filepath, occs in sorted_files:
        relative_path = filepath.relative_to(SRC_DIR.parent)
        report += f"### `{relative_path}` ({len(occs)} ocorrências)\n\n"
        report += "| Linha | Cor | Sugestão |\n"
        report += "|-------|-----|----------|\n"
        for occ in occs[:10]:  # Limitar a 10 por arquivo
            suggestion = occ.suggested_token["tailwind"] if occ.suggested_token else "❌"
            report += f"| {occ.line_number} | `{occ.color}` | `{suggestion}` |\n"
        if len(occs) > 10:
            report += f"\n*... e mais {len(occs) - 10} ocorrências*\n"
        report += "\n"
    
    report += f"""
---

## 🔧 Design Tokens Recomendados

### CSS Variables

```css
:root {{
  /* Background */
  --background: #0a0a0a;
  --background-dark: #121212;
  --background-elevated: #1a1a1a;
  --background-surface: #181818;
  --background-hover: #282828;
  
  /* Text */
  --foreground: #ffffff;
  --muted-foreground: #b3b3b3;
  
  /* Border */
  --border: #404040;
  
  /* Brand */
  --spotify-green: #1DB954;
  --youtube-red: #FF0000;
  
  /* State */
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
}}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {{
  theme: {{
    extend: {{
      colors: {{
        'spotify-green': '#1DB954',
        'youtube-red': '#FF0000',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {{
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        }},
        accent: {{
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        }},
      }},
    }},
  }},
}};
```

---

## ✅ Próximos Passos

1. **Prioridade Alta:** Refatorar cores de background (mais frequentes)
2. **Prioridade Média:** Refatorar cores de texto
3. **Prioridade Baixa:** Refatorar cores de borda e estado

### Exemplo de Refatoração

**Antes:**
```tsx
<div style={{{{ backgroundColor: '#121212' }}}}>
```

**Depois:**
```tsx
<div className="bg-card">
```

---

## 📚 Referências

- [Design System](../DESIGN-SYSTEM.md)
- [Tailwind CSS](https://tailwindcss.com/docs/customizing-colors)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
"""
    
    return report

def apply_refactoring(occurrences: List[ColorOccurrence], dry_run: bool = True) -> int:
    """Aplica as refatorações sugeridas."""
    changes = 0
    files_modified = set()
    
    # Agrupar por arquivo
    by_file = defaultdict(list)
    for occ in occurrences:
        if occ.suggested_token:
            by_file[occ.file].append(occ)
    
    for filepath, occs in by_file.items():
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            for occ in occs:
                # Substituir cor hardcoded por classe Tailwind
                # Isso é uma simplificação - na prática, seria mais complexo
                old_pattern = f'"{occ.color}"'
                new_value = f'"{occ.suggested_token["css"]}"'
                
                if old_pattern in content:
                    if dry_run:
                        print(f"{Colors.BLUE}[DRY-RUN] {filepath}:{occ.line_number}{Colors.RESET}")
                        print(f"  {Colors.RED}- {old_pattern}{Colors.RESET}")
                        print(f"  {Colors.GREEN}+ {new_value}{Colors.RESET}")
                    else:
                        content = content.replace(old_pattern, new_value, 1)
                    changes += 1
            
            if not dry_run and content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_modified.add(filepath)
        
        except Exception as e:
            print(f"{Colors.RED}❌ Erro ao processar {filepath}: {e}{Colors.RESET}")
    
    return changes

def main():
    """Função principal."""
    print_header()
    
    # Parsear argumentos
    dry_run = "--dry-run" in sys.argv
    apply = "--apply" in sys.argv
    generate_report_flag = "--report" in sys.argv
    
    if "--help" in sys.argv:
        print(__doc__)
        sys.exit(0)
    
    print(f"{Colors.CYAN}🔍 Escaneando diretório: {COMPONENTS_DIR}{Colors.RESET}\n")
    
    # Escanear arquivos
    occurrences = scan_directory(COMPONENTS_DIR)
    
    # Estatísticas
    total = len(occurrences)
    with_suggestion = sum(1 for occ in occurrences if occ.suggested_token)
    without_suggestion = total - with_suggestion
    
    print(f"""
{Colors.CYAN}{Colors.BOLD}═══════════════════════════════════════════════════════════════
                         RESULTADOS
═══════════════════════════════════════════════════════════════{Colors.RESET}

{Colors.MAGENTA}📊 Estatísticas:{Colors.RESET}
   Total de ocorrências:    {total}
   Com sugestão de token:   {Colors.GREEN}{with_suggestion}{Colors.RESET}
   Sem sugestão:            {Colors.YELLOW}{without_suggestion}{Colors.RESET}
""")
    
    # Mostrar top 10 cores
    by_color = defaultdict(list)
    for occ in occurrences:
        by_color[occ.color].append(occ)
    
    print(f"{Colors.MAGENTA}🎨 Top 10 Cores Mais Frequentes:{Colors.RESET}\n")
    sorted_colors = sorted(by_color.items(), key=lambda x: len(x[1]), reverse=True)[:10]
    for color, occs in sorted_colors:
        count = len(occs)
        suggestion = occs[0].suggested_token
        if suggestion:
            token = suggestion["tailwind"]
            print(f"   {color}: {count}x → {Colors.GREEN}{token}{Colors.RESET}")
        else:
            print(f"   {color}: {count}x → {Colors.YELLOW}Não mapeado{Colors.RESET}")
    
    # Gerar relatório
    if generate_report_flag or not apply:
        print(f"\n{Colors.CYAN}📝 Gerando relatório...{Colors.RESET}")
        report = generate_report(occurrences)
        
        REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(REPORT_FILE, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"{Colors.GREEN}✅ Relatório salvo em: {REPORT_FILE}{Colors.RESET}")
    
    # Aplicar refatorações
    if apply:
        print(f"\n{Colors.CYAN}🔧 Aplicando refatorações...{Colors.RESET}")
        changes = apply_refactoring(occurrences, dry_run=False)
        print(f"{Colors.GREEN}✅ {changes} alterações aplicadas{Colors.RESET}")
    elif dry_run:
        print(f"\n{Colors.CYAN}🔍 Modo DRY-RUN - Mostrando alterações sugeridas...{Colors.RESET}")
        changes = apply_refactoring(occurrences, dry_run=True)
        print(f"\n{Colors.YELLOW}⚠️  {changes} alterações seriam feitas{Colors.RESET}")
    
    print(f"""
{Colors.CYAN}{Colors.BOLD}═══════════════════════════════════════════════════════════════{Colors.RESET}

{Colors.GREEN}🎉 Análise concluída!{Colors.RESET}

Para aplicar as correções automaticamente, execute:
   {Colors.CYAN}python3 {__file__} --apply{Colors.RESET}

Para ver as alterações sem aplicar:
   {Colors.CYAN}python3 {__file__} --dry-run{Colors.RESET}
""")

if __name__ == "__main__":
    main()
