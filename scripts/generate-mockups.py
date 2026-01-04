#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
TSiJUKEBOX - Gerador Automático de Mockups
Gera mockups HTML para todos os temas durante o processo de build
═══════════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════

THEMES = {
    "cosmic-player": {
        "name": "Cosmic Player",
        "background": "#09090B",
        "secondary": "#121214",
        "accent": "#00D4FF",
        "accent2": "#8B5CF6",
        "text": "#FAFAFA"
    },
    "karaoke-stage": {
        "name": "Karaoke Stage",
        "background": "#1a0a2e",
        "secondary": "#2a1040",
        "accent": "#FF00D4",
        "accent2": "#00FFFF",
        "text": "#FAFAFA"
    },
    "stage-neon-metallic": {
        "name": "Stage Neon Metallic",
        "background": "#0a0a1a",
        "secondary": "#1a0a2e",
        "accent": "#00FFFF",
        "accent2": "#FF00D4",
        "text": "#FAFAFA"
    },
    "dashboard-home": {
        "name": "Dashboard Home",
        "background": "#0f0f12",
        "secondary": "#1a1a1f",
        "accent": "#FFD700",
        "accent2": "#00D4FF",
        "text": "#FAFAFA"
    },
    "spotify-integration": {
        "name": "Spotify Integration",
        "background": "#121212",
        "secondary": "#181818",
        "accent": "#1DB954",
        "accent2": "#1ED760",
        "text": "#FAFAFA"
    },
    "settings-dark": {
        "name": "Settings Dark",
        "background": "#0a0a0c",
        "secondary": "#141416",
        "accent": "#8B5CF6",
        "accent2": "#A78BFA",
        "text": "#FAFAFA"
    }
}

MODES = ["player", "dashboard", "karaoke", "settings", "kiosk", "spotify", "youtube"]

# ═══════════════════════════════════════════════════════════════════════════════
# TEMPLATES HTML
# ═══════════════════════════════════════════════════════════════════════════════

def generate_html_header(theme_name: str, theme: dict) -> str:
    """Gera o cabeçalho HTML com estilos do tema"""
    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSiJUKEBOX - {theme_name} Theme Mockups</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-primary: {theme["background"]};
            --bg-secondary: {theme["secondary"]};
            --accent: {theme["accent"]};
            --accent2: {theme["accent2"]};
            --text: {theme["text"]};
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', sans-serif;
            background: var(--bg-primary);
            color: var(--text);
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
            border-radius: 1rem;
            border: 1px solid rgba(255,255,255,0.1);
        }}
        
        .header h1 {{
            font-size: 2.5rem;
            background: linear-gradient(90deg, var(--accent), var(--accent2));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }}
        
        .header p {{
            color: rgba(255,255,255,0.7);
        }}
        
        .theme-badge {{
            display: inline-block;
            padding: 0.5rem 1rem;
            background: var(--accent);
            color: var(--bg-primary);
            border-radius: 2rem;
            font-weight: 600;
            margin-top: 1rem;
        }}
        
        .grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }}
        
        .mockup {{
            background: var(--bg-secondary);
            border-radius: 1rem;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }}
        
        .mockup:hover {{
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px var(--accent)20;
        }}
        
        .mockup-header {{
            padding: 1rem;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }}
        
        .mockup-dot {{
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }}
        
        .mockup-dot.red {{ background: #FF5F56; }}
        .mockup-dot.yellow {{ background: #FFBD2E; }}
        .mockup-dot.green {{ background: #27C93F; }}
        
        .mockup-title {{
            margin-left: auto;
            font-size: 0.875rem;
            color: rgba(255,255,255,0.5);
        }}
        
        .mockup-content {{
            padding: 1.5rem;
            min-height: 300px;
        }}
        
        .mode-label {{
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--accent);
            color: var(--bg-primary);
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }}
        
        .player-ui {{
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }}
        
        .album-art {{
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, var(--accent), var(--accent2));
            border-radius: 0.5rem;
            margin: 0 auto;
        }}
        
        .track-info {{
            text-align: center;
        }}
        
        .track-title {{
            font-size: 1.25rem;
            font-weight: 600;
        }}
        
        .track-artist {{
            color: rgba(255,255,255,0.6);
            font-size: 0.875rem;
        }}
        
        .progress-bar {{
            height: 4px;
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
            overflow: hidden;
        }}
        
        .progress-fill {{
            height: 100%;
            width: 45%;
            background: var(--accent);
            border-radius: 2px;
        }}
        
        .controls {{
            display: flex;
            justify-content: center;
            gap: 1rem;
        }}
        
        .control-btn {{
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--bg-primary);
            font-size: 1.25rem;
        }}
        
        .control-btn.secondary {{
            background: rgba(255,255,255,0.1);
            color: var(--text);
        }}
        
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }}
        
        .stat-card {{
            padding: 1rem;
            background: rgba(0,0,0,0.3);
            border-radius: 0.5rem;
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent);
        }}
        
        .stat-label {{
            font-size: 0.75rem;
            color: rgba(255,255,255,0.6);
        }}
        
        .lyrics-display {{
            text-align: center;
            padding: 1rem;
        }}
        
        .lyrics-line {{
            margin: 0.5rem 0;
            transition: all 0.3s;
        }}
        
        .lyrics-line.active {{
            color: var(--accent);
            font-size: 1.25rem;
            font-weight: 600;
            text-shadow: 0 0 20px var(--accent);
        }}
        
        .lyrics-line.past {{
            color: rgba(255,255,255,0.4);
        }}
        
        .score-display {{
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 0.5rem 1rem;
            background: rgba(0,0,0,0.5);
            border-radius: 0.5rem;
            border: 1px solid var(--accent);
        }}
        
        .score-value {{
            font-size: 2rem;
            font-weight: 700;
            color: var(--accent);
        }}
        
        .settings-list {{
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }}
        
        .setting-item {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: rgba(0,0,0,0.3);
            border-radius: 0.5rem;
        }}
        
        .toggle {{
            width: 48px;
            height: 24px;
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            position: relative;
        }}
        
        .toggle.active {{
            background: var(--accent);
        }}
        
        .toggle::after {{
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            top: 2px;
            left: 2px;
            transition: transform 0.3s;
        }}
        
        .toggle.active::after {{
            transform: translateX(24px);
        }}
        
        .footer {{
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            color: rgba(255,255,255,0.5);
            font-size: 0.875rem;
        }}
    </style>
</head>
<body>
    <div class="container">
'''

def generate_html_footer() -> str:
    """Gera o rodapé HTML"""
    return f'''
        <div class="footer">
            <p>TSiJUKEBOX Enterprise v4.2.1 | Gerado automaticamente em {datetime.now().strftime("%Y-%m-%d %H:%M")}</p>
            <p>© 2024 B0yZ4kr14 & Manus AI</p>
        </div>
    </div>
</body>
</html>
'''

def generate_player_mockup() -> str:
    """Gera mockup do modo Player"""
    return '''
        <div class="mockup">
            <div class="mockup-header">
                <div class="mockup-dot red"></div>
                <div class="mockup-dot yellow"></div>
                <div class="mockup-dot green"></div>
                <span class="mockup-title">player.tsx</span>
            </div>
            <div class="mockup-content">
                <span class="mode-label">🎵 PLAYER</span>
                <div class="player-ui">
                    <div class="album-art"></div>
                    <div class="track-info">
                        <div class="track-title">Don't Stop Believin'</div>
                        <div class="track-artist">Journey</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="controls">
                        <div class="control-btn secondary">⏮</div>
                        <div class="control-btn">▶</div>
                        <div class="control-btn secondary">⏭</div>
                    </div>
                </div>
            </div>
        </div>
'''

def generate_dashboard_mockup() -> str:
    """Gera mockup do modo Dashboard"""
    return '''
        <div class="mockup">
            <div class="mockup-header">
                <div class="mockup-dot red"></div>
                <div class="mockup-dot yellow"></div>
                <div class="mockup-dot green"></div>
                <span class="mockup-title">dashboard.tsx</span>
            </div>
            <div class="mockup-content">
                <span class="mode-label">📊 DASHBOARD</span>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">1,234</div>
                        <div class="stat-label">Músicas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">56</div>
                        <div class="stat-label">Playlists</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">89h</div>
                        <div class="stat-label">Tempo Total</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">4.8★</div>
                        <div class="stat-label">Avaliação</div>
                    </div>
                </div>
            </div>
        </div>
'''

def generate_karaoke_mockup() -> str:
    """Gera mockup do modo Karaoke"""
    return '''
        <div class="mockup">
            <div class="mockup-header">
                <div class="mockup-dot red"></div>
                <div class="mockup-dot yellow"></div>
                <div class="mockup-dot green"></div>
                <span class="mockup-title">karaoke.tsx</span>
            </div>
            <div class="mockup-content" style="position: relative;">
                <span class="mode-label">🎤 KARAOKE</span>
                <div class="score-display">
                    <div class="score-value">87%</div>
                </div>
                <div class="lyrics-display">
                    <div class="lyrics-line past">Just a small town girl</div>
                    <div class="lyrics-line active">Livin' in a lonely world</div>
                    <div class="lyrics-line">She took the midnight train</div>
                    <div class="lyrics-line">Goin' anywhere</div>
                </div>
            </div>
        </div>
'''

def generate_settings_mockup() -> str:
    """Gera mockup do modo Settings"""
    return '''
        <div class="mockup">
            <div class="mockup-header">
                <div class="mockup-dot red"></div>
                <div class="mockup-dot yellow"></div>
                <div class="mockup-dot green"></div>
                <span class="mockup-title">settings.tsx</span>
            </div>
            <div class="mockup-content">
                <span class="mode-label">⚙️ SETTINGS</span>
                <div class="settings-list">
                    <div class="setting-item">
                        <span>Modo Escuro</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-item">
                        <span>Notificações</span>
                        <div class="toggle active"></div>
                    </div>
                    <div class="setting-item">
                        <span>Autoplay</span>
                        <div class="toggle"></div>
                    </div>
                    <div class="setting-item">
                        <span>Modo Kiosk</span>
                        <div class="toggle"></div>
                    </div>
                </div>
            </div>
        </div>
'''

def generate_theme_mockups_html(theme_id: str, theme: dict) -> str:
    """Gera HTML completo com mockups para um tema"""
    html = generate_html_header(theme["name"], theme)
    
    html += f'''
        <div class="header">
            <h1>🎨 {theme["name"]}</h1>
            <p>Mockups de Interface do TSiJUKEBOX</p>
            <span class="theme-badge">{theme_id}</span>
        </div>
        
        <div class="grid">
    '''
    
    html += generate_player_mockup()
    html += generate_dashboard_mockup()
    html += generate_karaoke_mockup()
    html += generate_settings_mockup()
    
    html += '''
        </div>
    '''
    
    html += generate_html_footer()
    
    return html

# ═══════════════════════════════════════════════════════════════════════════════
# FUNÇÕES PRINCIPAIS
# ═══════════════════════════════════════════════════════════════════════════════

def generate_all_mockups(output_dir: str, verbose: bool = False) -> dict:
    """Gera mockups para todos os temas"""
    results = {
        "generated": [],
        "errors": [],
        "total": len(THEMES)
    }
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    for theme_id, theme in THEMES.items():
        try:
            filename = f"{theme_id}-mockups.html"
            filepath = output_path / filename
            
            html = generate_theme_mockups_html(theme_id, theme)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            
            results["generated"].append({
                "theme": theme_id,
                "file": str(filepath),
                "size": len(html)
            })
            
            if verbose:
                print(f"  ✅ Gerado: {filename}")
                
        except Exception as e:
            results["errors"].append({
                "theme": theme_id,
                "error": str(e)
            })
            if verbose:
                print(f"  ❌ Erro: {theme_id} - {e}")
    
    return results

def generate_index_html(output_dir: str) -> str:
    """Gera página índice com links para todos os mockups"""
    html = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TSiJUKEBOX - Theme Mockups Index</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', system-ui, sans-serif;
            background: #09090B;
            color: #FAFAFA;
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 {
            text-align: center;
            font-size: 2.5rem;
            background: linear-gradient(90deg, #00D4FF, #FF00D4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 2rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        .card {
            background: #18181B;
            border-radius: 1rem;
            padding: 1.5rem;
            text-decoration: none;
            color: inherit;
            border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s;
        }
        .card:hover {
            transform: translateY(-5px);
            border-color: var(--accent, #00D4FF);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .card h3 { margin-bottom: 0.5rem; }
        .card p { color: rgba(255,255,255,0.6); font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 TSiJUKEBOX Themes</h1>
        <div class="grid">
'''
    
    for theme_id, theme in THEMES.items():
        html += f'''
            <a href="{theme_id}-mockups.html" class="card" style="--accent: {theme['accent']}">
                <h3>{theme['name']}</h3>
                <p>Ver mockups →</p>
            </a>
'''
    
    html += '''
        </div>
    </div>
</body>
</html>
'''
    
    filepath = Path(output_dir) / "index.html"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return str(filepath)

def main():
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX - Gerador Automático de Mockups"
    )
    parser.add_argument(
        "--output", "-o",
        default="docs/mockups",
        help="Diretório de saída para os mockups"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verboso"
    )
    parser.add_argument(
        "--theme",
        choices=list(THEMES.keys()),
        help="Gerar apenas para um tema específico"
    )
    
    args = parser.parse_args()
    
    print("═" * 60)
    print("🎨 TSiJUKEBOX - Gerador de Mockups")
    print("═" * 60)
    
    if args.theme:
        # Gerar apenas um tema
        theme = THEMES[args.theme]
        output_path = Path(args.output)
        output_path.mkdir(parents=True, exist_ok=True)
        
        html = generate_theme_mockups_html(args.theme, theme)
        filepath = output_path / f"{args.theme}-mockups.html"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"\n✅ Mockup gerado: {filepath}")
    else:
        # Gerar todos os temas
        print(f"\n📁 Diretório de saída: {args.output}")
        print(f"🎨 Temas: {len(THEMES)}")
        print()
        
        results = generate_all_mockups(args.output, args.verbose)
        index_path = generate_index_html(args.output)
        
        print()
        print("═" * 60)
        print(f"✅ Mockups gerados: {len(results['generated'])}/{results['total']}")
        if results['errors']:
            print(f"❌ Erros: {len(results['errors'])}")
        print(f"📄 Índice: {index_path}")
        print("═" * 60)

if __name__ == "__main__":
    main()
