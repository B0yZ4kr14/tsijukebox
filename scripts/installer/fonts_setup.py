#!/usr/bin/env python3
"""
TSiJUKEBOX - Fonts Setup Module
================================
Instala fontes para suporte a múltiplos idiomas e ícones.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass, field


@dataclass
class FontsConfig:
    """Configuração de fontes."""
    install_noto: bool = True        # Noto fonts (Unicode completo)
    install_dejavu: bool = True      # DejaVu (fallback)
    install_liberation: bool = True  # Liberation (compatibilidade MS)
    install_fontawesome: bool = True # Font Awesome (ícones)
    install_emoji: bool = True       # Emoji fonts
    install_cjk: bool = False        # Fontes CJK (Chinês, Japonês, Coreano)
    
    # Fontes customizadas
    custom_fonts: List[str] = field(default_factory=list)


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class FontsSetup:
    """Instala e configura fontes para TSiJUKEBOX."""
    
    NOTO_PACKAGES = [
        'noto-fonts',
        'noto-fonts-extra',
    ]
    
    NOTO_CJK_PACKAGES = [
        'noto-fonts-cjk',
    ]
    
    NOTO_EMOJI_PACKAGES = [
        'noto-fonts-emoji',
    ]
    
    DEJAVU_PACKAGES = [
        'ttf-dejavu',
    ]
    
    LIBERATION_PACKAGES = [
        'ttf-liberation',
    ]
    
    FONTAWESOME_PACKAGES = [
        'ttf-font-awesome',
        'otf-font-awesome',
    ]
    
    ADDITIONAL_PACKAGES = [
        'ttf-roboto',
        'ttf-opensans',
        'ttf-ubuntu-font-family',
        'ttf-fira-code',
        'ttf-jetbrains-mono',
    ]
    
    def __init__(
        self,
        config: Optional[FontsConfig] = None,
        logger: Any = None,
        dry_run: bool = False
    ):
        self.config = config or FontsConfig()
        self.logger = logger
        self.dry_run = dry_run
    
    def _log(self, message: str, level: str = "info"):
        if self.logger:
            getattr(self.logger, level, self.logger.info)(message)
        else:
            color = {
                'info': Colors.BLUE,
                'success': Colors.GREEN,
                'warning': Colors.YELLOW,
                'error': Colors.RED,
            }.get(level, Colors.BLUE)
            print(f"{color}[FONTS]{Colors.RESET} {message}")
    
    def _run(self, cmd: List[str], check: bool = False) -> Tuple[int, str, str]:
        if self.dry_run:
            self._log(f"[DRY-RUN] {' '.join(cmd)}", "info")
            return 0, "", ""
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def install_packages(self, packages: List[str], description: str) -> bool:
        """Instala pacotes de fontes."""
        self._log(f"Instalando {description}...", "info")
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', '--needed'] + packages)
        
        if code != 0:
            self._log(f"Aviso ao instalar {description}: {err}", "warning")
            return False
        
        self._log(f"{description} instalado", "success")
        return True
    
    def install_noto_fonts(self) -> bool:
        """Instala Noto Fonts (suporte Unicode completo)."""
        return self.install_packages(self.NOTO_PACKAGES, "Noto Fonts")
    
    def install_noto_cjk(self) -> bool:
        """Instala Noto CJK (Chinês, Japonês, Coreano)."""
        return self.install_packages(self.NOTO_CJK_PACKAGES, "Noto CJK")
    
    def install_noto_emoji(self) -> bool:
        """Instala Noto Emoji."""
        return self.install_packages(self.NOTO_EMOJI_PACKAGES, "Noto Emoji")
    
    def install_dejavu_fonts(self) -> bool:
        """Instala DejaVu Fonts."""
        return self.install_packages(self.DEJAVU_PACKAGES, "DejaVu Fonts")
    
    def install_liberation_fonts(self) -> bool:
        """Instala Liberation Fonts (compatibilidade MS Office)."""
        return self.install_packages(self.LIBERATION_PACKAGES, "Liberation Fonts")
    
    def install_fontawesome(self) -> bool:
        """Instala Font Awesome (ícones)."""
        return self.install_packages(self.FONTAWESOME_PACKAGES, "Font Awesome")
    
    def install_additional_fonts(self) -> bool:
        """Instala fontes adicionais populares."""
        return self.install_packages(self.ADDITIONAL_PACKAGES, "fontes adicionais")
    
    def configure_fontconfig(self) -> bool:
        """Configura fontconfig para melhor renderização."""
        self._log("Configurando fontconfig...", "info")
        
        fontconfig_content = """<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
    <!-- Hinting e antialiasing -->
    <match target="font">
        <edit name="antialias" mode="assign">
            <bool>true</bool>
        </edit>
        <edit name="hinting" mode="assign">
            <bool>true</bool>
        </edit>
        <edit name="hintstyle" mode="assign">
            <const>hintslight</const>
        </edit>
        <edit name="lcdfilter" mode="assign">
            <const>lcddefault</const>
        </edit>
        <edit name="rgba" mode="assign">
            <const>rgb</const>
        </edit>
    </match>

    <!-- Fallback para emoji -->
    <alias>
        <family>sans-serif</family>
        <prefer>
            <family>Noto Sans</family>
            <family>DejaVu Sans</family>
            <family>Noto Color Emoji</family>
        </prefer>
    </alias>
    
    <alias>
        <family>serif</family>
        <prefer>
            <family>Noto Serif</family>
            <family>DejaVu Serif</family>
        </prefer>
    </alias>
    
    <alias>
        <family>monospace</family>
        <prefer>
            <family>JetBrains Mono</family>
            <family>Fira Code</family>
            <family>Noto Sans Mono</family>
            <family>DejaVu Sans Mono</family>
        </prefer>
    </alias>

    <!-- Preferir Noto Color Emoji para emoji -->
    <match target="pattern">
        <test qual="any" name="family">
            <string>emoji</string>
        </test>
        <edit name="family" mode="assign" binding="same">
            <string>Noto Color Emoji</string>
        </edit>
    </match>
</fontconfig>
"""
        
        fontconfig_dir = Path("/etc/fonts/conf.d")
        fontconfig_file = fontconfig_dir / "99-tsijukebox.conf"
        
        if not self.dry_run:
            fontconfig_dir.mkdir(parents=True, exist_ok=True)
            fontconfig_file.write_text(fontconfig_content)
        
        self._log("Fontconfig configurado", "success")
        return True
    
    def update_font_cache(self) -> bool:
        """Atualiza cache de fontes."""
        self._log("Atualizando cache de fontes...", "info")
        
        code, _, err = self._run(['fc-cache', '-fv'])
        
        if code != 0:
            self._log(f"Aviso ao atualizar cache: {err}", "warning")
            return False
        
        self._log("Cache de fontes atualizado", "success")
        return True
    
    def list_installed_fonts(self) -> List[str]:
        """Lista fontes instaladas."""
        code, out, _ = self._run(['fc-list', '--format=%{family}\n'])
        
        if code != 0:
            return []
        
        fonts = set()
        for line in out.strip().split('\n'):
            if line:
                # Pegar apenas o primeiro nome da família
                font_name = line.split(',')[0].strip()
                if font_name:
                    fonts.add(font_name)
        
        return sorted(fonts)
    
    def full_setup(self) -> bool:
        """Executa instalação completa de fontes."""
        self._log("Iniciando instalação de fontes...", "info")
        
        success = True
        
        if self.config.install_noto:
            if not self.install_noto_fonts():
                success = False
        
        if self.config.install_dejavu:
            if not self.install_dejavu_fonts():
                success = False
        
        if self.config.install_liberation:
            if not self.install_liberation_fonts():
                success = False
        
        if self.config.install_fontawesome:
            if not self.install_fontawesome():
                success = False
        
        if self.config.install_emoji:
            if not self.install_noto_emoji():
                success = False
        
        if self.config.install_cjk:
            if not self.install_noto_cjk():
                success = False
        
        # Instalar fontes customizadas
        if self.config.custom_fonts:
            self.install_packages(self.config.custom_fonts, "fontes customizadas")
        
        # Configurar fontconfig
        self.configure_fontconfig()
        
        # Atualizar cache
        self.update_font_cache()
        
        # Resumo
        fonts = self.list_installed_fonts()
        self._log(f"Total de famílias de fontes instaladas: {len(fonts)}", "info")
        
        self._log("Instalação de fontes concluída!", "success")
        return success
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status das fontes instaladas."""
        fonts = self.list_installed_fonts()
        
        status = {
            'total_families': len(fonts),
            'noto_installed': any('Noto' in f for f in fonts),
            'dejavu_installed': any('DejaVu' in f for f in fonts),
            'liberation_installed': any('Liberation' in f for f in fonts),
            'fontawesome_installed': any('Awesome' in f for f in fonts),
            'emoji_installed': any('Emoji' in f for f in fonts),
            'sample_fonts': fonts[:20],
        }
        
        return status


def main():
    """Ponto de entrada para execução standalone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='TSiJUKEBOX Fonts Setup')
    parser.add_argument('--no-noto', action='store_true',
                       help='Não instalar Noto Fonts')
    parser.add_argument('--no-dejavu', action='store_true',
                       help='Não instalar DejaVu')
    parser.add_argument('--no-liberation', action='store_true',
                       help='Não instalar Liberation')
    parser.add_argument('--no-fontawesome', action='store_true',
                       help='Não instalar Font Awesome')
    parser.add_argument('--no-emoji', action='store_true',
                       help='Não instalar Emoji')
    parser.add_argument('--cjk', action='store_true',
                       help='Instalar fontes CJK')
    parser.add_argument('--all', action='store_true',
                       help='Instalar todas as fontes')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sem executar')
    parser.add_argument('--list', action='store_true',
                       help='Listar fontes instaladas')
    parser.add_argument('--status', action='store_true',
                       help='Mostrar status')
    
    args = parser.parse_args()
    
    config = FontsConfig(
        install_noto=not args.no_noto,
        install_dejavu=not args.no_dejavu,
        install_liberation=not args.no_liberation,
        install_fontawesome=not args.no_fontawesome,
        install_emoji=not args.no_emoji,
        install_cjk=args.cjk or args.all,
    )
    
    setup = FontsSetup(config=config, dry_run=args.dry_run)
    
    if args.list:
        fonts = setup.list_installed_fonts()
        for font in fonts:
            print(font)
        return
    
    if args.status:
        import json
        status = setup.get_status()
        print(json.dumps(status, indent=2))
        return
    
    success = setup.full_setup()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
