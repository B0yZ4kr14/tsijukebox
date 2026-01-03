#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Kiosk Environment Setup
Configura ambiente kiosk com Xorg mínimo, autologin e desabilita screen blanking.
"""

import os
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List

from .config import Colors, config


@dataclass
class KioskConfig:
    """Configuração do ambiente kiosk"""
    user: str = 'tsi'
    autologin: bool = True
    hide_cursor: bool = True
    cursor_timeout: int = 3  # segundos
    disable_dpms: bool = True
    disable_screensaver: bool = True
    resolution: Optional[str] = None  # Auto-detect if None
    rotation: str = 'normal'  # normal, left, right, inverted


class KioskSetup:
    """Gerencia a configuração do ambiente kiosk"""
    
    def __init__(self, kiosk_config: Optional[KioskConfig] = None, analytics=None):
        self.config = kiosk_config or KioskConfig()
        self.analytics = analytics
        self.user_home = Path(f'/home/{self.config.user}')
    
    def _log(self, message: str, color: str = Colors.WHITE):
        """Log colorido"""
        print(f"{color}{message}{Colors.RESET}")
    
    def _run_command(self, cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
        """Executa comando shell"""
        try:
            result = subprocess.run(cmd, check=check, capture_output=True, text=True)
            return result
        except subprocess.CalledProcessError as e:
            self._log(f"Erro ao executar {' '.join(cmd)}: {e.stderr}", Colors.RED)
            raise
    
    def install_packages(self) -> bool:
        """Instala pacotes necessários para o kiosk"""
        self._log("📦 Instalando pacotes do ambiente kiosk...", Colors.CYAN)
        
        packages = [
            'xorg-server',
            'xorg-xinit',
            'xorg-xset',
            'xorg-xrandr',
            'openbox',
            'unclutter',  # Esconde cursor
            'wmctrl',     # Controle de janelas
            'xdotool',    # Automação X11
        ]
        
        try:
            self._run_command(['pacman', '-S', '--noconfirm', '--needed'] + packages)
            self._log("✅ Pacotes instalados com sucesso", Colors.GREEN)
            
            if self.analytics:
                self.analytics.track_event('kiosk_packages_installed', {'packages': packages})
            
            return True
        except Exception as e:
            self._log(f"❌ Erro ao instalar pacotes: {e}", Colors.RED)
            return False
    
    def configure_autologin(self) -> bool:
        """Configura autologin via getty"""
        if not self.config.autologin:
            self._log("⏭️ Autologin desabilitado, pulando...", Colors.YELLOW)
            return True
        
        self._log(f"🔐 Configurando autologin para usuário '{self.config.user}'...", Colors.CYAN)
        
        # Criar diretório do override do getty
        getty_dir = Path('/etc/systemd/system/getty@tty1.service.d')
        getty_dir.mkdir(parents=True, exist_ok=True)
        
        # Configuração de autologin
        autologin_conf = f"""[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin {self.config.user} --noclear %I $TERM
Type=idle
"""
        
        override_file = getty_dir / 'autologin.conf'
        override_file.write_text(autologin_conf)
        
        self._log(f"✅ Autologin configurado em {override_file}", Colors.GREEN)
        
        # Recarregar systemd
        self._run_command(['systemctl', 'daemon-reload'])
        
        if self.analytics:
            self.analytics.track_event('autologin_configured', {'user': self.config.user})
        
        return True
    
    def configure_xinitrc(self) -> bool:
        """Configura .xinitrc para iniciar Openbox"""
        self._log("📝 Configurando .xinitrc...", Colors.CYAN)
        
        xinitrc_content = f"""#!/bin/bash
# TSiJUKEBOX Kiosk - .xinitrc
# Gerado automaticamente pelo instalador

# Desabilitar DPMS (Display Power Management)
xset -dpms &

# Desabilitar screensaver
xset s off &
xset s noblank &

# Desabilitar bell
xset b off &

"""
        
        # Configurar rotação se necessário
        if self.config.rotation != 'normal':
            xinitrc_content += f"""
# Rotação de tela
xrandr --output $(xrandr | grep ' connected' | head -1 | cut -d' ' -f1) --rotate {self.config.rotation} &

"""
        
        # Configurar resolução específica se definida
        if self.config.resolution:
            xinitrc_content += f"""
# Resolução personalizada
xrandr --output $(xrandr | grep ' connected' | head -1 | cut -d' ' -f1) --mode {self.config.resolution} &

"""
        
        # Esconder cursor
        if self.config.hide_cursor:
            xinitrc_content += f"""
# Esconder cursor após {self.config.cursor_timeout} segundos de inatividade
unclutter --timeout {self.config.cursor_timeout} --jitter 50 --ignore-scrolling &

"""
        
        xinitrc_content += """
# Iniciar Openbox
exec openbox-session
"""
        
        xinitrc_path = self.user_home / '.xinitrc'
        xinitrc_path.write_text(xinitrc_content)
        os.chmod(xinitrc_path, 0o755)
        
        # Ajustar ownership
        self._run_command(['chown', f'{self.config.user}:{self.config.user}', str(xinitrc_path)])
        
        self._log(f"✅ .xinitrc configurado em {xinitrc_path}", Colors.GREEN)
        return True
    
    def configure_bash_profile(self) -> bool:
        """Configura .bash_profile para iniciar X automaticamente"""
        self._log("📝 Configurando .bash_profile...", Colors.CYAN)
        
        bash_profile_content = """#!/bin/bash
# TSiJUKEBOX Kiosk - .bash_profile
# Gerado automaticamente pelo instalador

# Carregar .bashrc se existir
[[ -f ~/.bashrc ]] && . ~/.bashrc

# Iniciar X automaticamente no tty1
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx -- -nocursor 2>/dev/null
fi
"""
        
        bash_profile_path = self.user_home / '.bash_profile'
        bash_profile_path.write_text(bash_profile_content)
        os.chmod(bash_profile_path, 0o644)
        
        # Ajustar ownership
        self._run_command(['chown', f'{self.config.user}:{self.config.user}', str(bash_profile_path)])
        
        self._log(f"✅ .bash_profile configurado em {bash_profile_path}", Colors.GREEN)
        return True
    
    def configure_environment(self) -> bool:
        """Configura variáveis de ambiente do Openbox"""
        self._log("🌍 Configurando variáveis de ambiente...", Colors.CYAN)
        
        openbox_dir = self.user_home / '.config' / 'openbox'
        openbox_dir.mkdir(parents=True, exist_ok=True)
        
        environment_content = """# TSiJUKEBOX Kiosk - Environment
# Variáveis de ambiente do Openbox

# Locale
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8

# Display
export DISPLAY=:0

# TSiJUKEBOX
export TSIJUKEBOX_KIOSK=1
export TSIJUKEBOX_HOME=/opt/jukebox

# Desabilitar screensaver em nível de aplicação
export QT_QPA_PLATFORMTHEME=qt5ct
export GTK_THEME=Adwaita:dark
"""
        
        environment_path = openbox_dir / 'environment'
        environment_path.write_text(environment_content)
        
        # Ajustar ownership recursivo
        self._run_command(['chown', '-R', f'{self.config.user}:{self.config.user}', str(openbox_dir)])
        
        self._log(f"✅ Environment configurado em {environment_path}", Colors.GREEN)
        return True
    
    def setup_full(self) -> bool:
        """Executa configuração completa do kiosk"""
        self._log("🖥️ Iniciando configuração do ambiente Kiosk...", Colors.BOLD + Colors.CYAN)
        
        steps = [
            ('Instalando pacotes', self.install_packages),
            ('Configurando autologin', self.configure_autologin),
            ('Configurando .xinitrc', self.configure_xinitrc),
            ('Configurando .bash_profile', self.configure_bash_profile),
            ('Configurando environment', self.configure_environment),
        ]
        
        for step_name, step_func in steps:
            self._log(f"\n{'='*50}", Colors.BLUE)
            self._log(f"🔧 {step_name}...", Colors.YELLOW)
            self._log(f"{'='*50}", Colors.BLUE)
            
            if not step_func():
                self._log(f"❌ Falha em: {step_name}", Colors.RED)
                return False
        
        self._log("\n✅ Ambiente Kiosk configurado com sucesso!", Colors.BOLD + Colors.GREEN)
        self._log(f"   Usuário: {self.config.user}", Colors.GREEN)
        self._log(f"   Autologin: {'Sim' if self.config.autologin else 'Não'}", Colors.GREEN)
        self._log(f"   Cursor oculto: {'Sim' if self.config.hide_cursor else 'Não'}", Colors.GREEN)
        
        if self.analytics:
            self.analytics.track_event('kiosk_setup_complete', {
                'user': self.config.user,
                'autologin': self.config.autologin,
                'hide_cursor': self.config.hide_cursor,
            })
        
        return True


def main():
    """Função principal para teste"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("=" * 60)
    print("  TSiJUKEBOX - Kiosk Setup Module")
    print("=" * 60)
    print(f"{Colors.RESET}")
    
    kiosk = KioskSetup()
    
    # Verificar se é root
    if os.geteuid() != 0:
        print(f"{Colors.RED}Este script precisa ser executado como root!{Colors.RESET}")
        return False
    
    return kiosk.setup_full()


if __name__ == '__main__':
    main()
