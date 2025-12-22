#!/usr/bin/env python3
"""
TSiJUKEBOX - Kiosk Chromium Setup Module
=========================================
Configura modo kiosk com Chromium e Openbox.

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any
from dataclasses import dataclass


@dataclass
class KioskChromiumConfig:
    """Configuração do modo kiosk com Chromium."""
    user: str = ""
    url: str = "http://localhost:5173"
    
    # Display
    fullscreen: bool = True
    resolution: str = "1920x1080"
    rotation: str = "normal"  # normal, left, right, inverted
    
    # Chromium
    disable_gpu: bool = False
    kiosk_printing: bool = False
    touch_enabled: bool = True
    hide_cursor: bool = True
    hide_scrollbars: bool = True
    
    # Recuperação
    auto_restart: bool = True
    watchdog_enabled: bool = True
    crash_recovery: bool = True
    
    # Segurança
    disable_devtools: bool = True
    disable_context_menu: bool = True
    block_urls: List[str] = None


class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'


class KioskChromiumSetup:
    """Configura modo kiosk com Chromium para TSiJUKEBOX."""
    
    XORG_PACKAGES = [
        'xorg-server',
        'xorg-xinit',
        'xorg-xrandr',
        'xorg-xset',
        'xterm',
    ]
    
    WM_PACKAGES = [
        'openbox',
    ]
    
    BROWSER_PACKAGES = [
        'chromium',
    ]
    
    UTILITY_PACKAGES = [
        'unclutter',  # Esconder cursor
        'xdotool',    # Automação
        'feh',        # Background
    ]
    
    def __init__(
        self,
        config: Optional[KioskChromiumConfig] = None,
        logger: Any = None,
        dry_run: bool = False
    ):
        self.config = config or KioskChromiumConfig()
        if not self.config.user:
            self.config.user = os.environ.get('SUDO_USER', 'root')
        self.logger = logger
        self.dry_run = dry_run
        self.home = Path(f"/home/{self.config.user}")
    
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
            print(f"{color}[KIOSK]{Colors.RESET} {message}")
    
    def _run(self, cmd: List[str], check: bool = False) -> Tuple[int, str, str]:
        if self.dry_run:
            self._log(f"[DRY-RUN] {' '.join(cmd)}", "info")
            return 0, "", ""
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.returncode, result.stdout, result.stderr
        except Exception as e:
            return 1, "", str(e)
    
    def _run_as_user(self, cmd: List[str]) -> Tuple[int, str, str]:
        if os.geteuid() == 0 and self.config.user != 'root':
            cmd = ['sudo', '-u', self.config.user] + cmd
        return self._run(cmd)
    
    def install_xorg(self) -> bool:
        """Instala Xorg e dependências."""
        self._log("Instalando Xorg...", "info")
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', '--needed'] + self.XORG_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar Xorg: {err}", "error")
            return False
        
        self._log("Xorg instalado", "success")
        return True
    
    def install_openbox(self) -> bool:
        """Instala Openbox window manager."""
        self._log("Instalando Openbox...", "info")
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', '--needed'] + self.WM_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar Openbox: {err}", "error")
            return False
        
        self._log("Openbox instalado", "success")
        return True
    
    def install_chromium(self) -> bool:
        """Instala Chromium."""
        self._log("Instalando Chromium...", "info")
        
        if shutil.which('chromium'):
            self._log("Chromium já instalado", "info")
            return True
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm'] + self.BROWSER_PACKAGES)
        
        if code != 0:
            self._log(f"Falha ao instalar Chromium: {err}", "error")
            return False
        
        self._log("Chromium instalado", "success")
        return True
    
    def install_utilities(self) -> bool:
        """Instala utilitários do kiosk."""
        self._log("Instalando utilitários...", "info")
        
        code, _, err = self._run(['pacman', '-S', '--noconfirm', '--needed'] + self.UTILITY_PACKAGES)
        
        if code != 0:
            self._log(f"Aviso ao instalar utilitários: {err}", "warning")
        
        return True
    
    def configure_xinitrc(self) -> bool:
        """Configura .xinitrc para iniciar Openbox."""
        self._log("Configurando .xinitrc...", "info")
        
        xinitrc_content = f"""#!/bin/bash
# TSiJUKEBOX Kiosk Mode - .xinitrc
# Gerado automaticamente

# Configurar display
xrandr --output $(xrandr | grep ' connected' | head -1 | cut -d' ' -f1) --mode {self.config.resolution} --rotate {self.config.rotation} 2>/dev/null

# Desabilitar screensaver e DPMS
xset s off
xset s noblank
xset -dpms

# Esconder cursor após 3 segundos de inatividade
{"unclutter -idle 3 -root &" if self.config.hide_cursor else ""}

# Iniciar Openbox
exec openbox-session
"""
        
        xinitrc_path = self.home / ".xinitrc"
        
        if not self.dry_run:
            xinitrc_path.write_text(xinitrc_content)
            xinitrc_path.chmod(0o755)
            shutil.chown(xinitrc_path, self.config.user, self.config.user)
        
        self._log(f".xinitrc configurado: {xinitrc_path}", "success")
        return True
    
    def configure_openbox_autostart(self) -> bool:
        """Configura autostart do Openbox para iniciar Chromium."""
        self._log("Configurando Openbox autostart...", "info")
        
        # Construir flags do Chromium
        chromium_flags = [
            '--kiosk',
            '--noerrdialogs',
            '--disable-infobars',
            '--no-first-run',
            '--disable-translate',
            '--disable-features=TranslateUI',
            '--disable-session-crashed-bubble',
            '--disable-component-update',
            '--check-for-update-interval=31536000',
        ]
        
        if self.config.fullscreen:
            chromium_flags.append('--start-fullscreen')
        
        if self.config.disable_gpu:
            chromium_flags.append('--disable-gpu')
        
        if self.config.touch_enabled:
            chromium_flags.append('--touch-events=enabled')
        
        if self.config.hide_scrollbars:
            chromium_flags.append('--enable-features=OverlayScrollbar')
        
        if self.config.disable_devtools:
            chromium_flags.append('--disable-dev-tools')
        
        if self.config.disable_context_menu:
            chromium_flags.append('--disable-context-menu')
        
        chromium_cmd = f"chromium {' '.join(chromium_flags)} {self.config.url}"
        
        autostart_content = f"""#!/bin/bash
# TSiJUKEBOX Kiosk Autostart
# Gerado automaticamente

# Aguardar inicialização
sleep 2

# Loop de recuperação
while true; do
    echo "[KIOSK] Iniciando Chromium..."
    
    # Limpar cache se houver crash anterior
    rm -rf ~/.cache/chromium/Default/Cache/*
    rm -rf ~/.cache/chromium/Default/Code\ Cache/*
    
    # Iniciar Chromium
    {chromium_cmd}
    
    # Se Chromium fechar, aguardar e reiniciar
    {"echo '[KIOSK] Chromium fechou, reiniciando em 5s...'" if self.config.auto_restart else "break"}
    {"sleep 5" if self.config.auto_restart else ""}
done
"""
        
        openbox_dir = self.home / ".config/openbox"
        autostart_path = openbox_dir / "autostart"
        
        if not self.dry_run:
            openbox_dir.mkdir(parents=True, exist_ok=True)
            autostart_path.write_text(autostart_content)
            autostart_path.chmod(0o755)
            shutil.chown(openbox_dir, self.config.user, self.config.user)
            shutil.chown(autostart_path, self.config.user, self.config.user)
        
        self._log(f"Openbox autostart configurado: {autostart_path}", "success")
        return True
    
    def configure_openbox_rc(self) -> bool:
        """Configura rc.xml do Openbox para modo kiosk."""
        self._log("Configurando Openbox rc.xml...", "info")
        
        rc_content = """<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <resistance>
    <strength>10</strength>
    <screen_edge_strength>20</screen_edge_strength>
  </resistance>

  <focus>
    <focusNew>yes</focusNew>
    <followMouse>no</followMouse>
  </focus>

  <placement>
    <policy>Smart</policy>
    <center>yes</center>
  </placement>

  <theme>
    <name>Clearlooks</name>
    <titleLayout>NLIMC</titleLayout>
    <keepBorder>no</keepBorder>
  </theme>

  <desktops>
    <number>1</number>
    <firstdesk>1</firstdesk>
  </desktops>

  <applications>
    <!-- Chromium em modo kiosk -->
    <application class="Chromium" name="chromium">
      <decor>no</decor>
      <shade>no</shade>
      <focus>yes</focus>
      <fullscreen>yes</fullscreen>
      <maximized>yes</maximized>
      <layer>normal</layer>
    </application>
  </applications>

  <keyboard>
    <!-- Bloquear atalhos perigosos no modo kiosk -->
    <!-- Alt+F4 desabilitado -->
    <!-- Ctrl+Alt+Del desabilitado -->
  </keyboard>

  <mouse>
    <screenEdgeWarpTime>0</screenEdgeWarpTime>
  </mouse>
</openbox_config>
"""
        
        openbox_dir = self.home / ".config/openbox"
        rc_path = openbox_dir / "rc.xml"
        
        if not self.dry_run:
            openbox_dir.mkdir(parents=True, exist_ok=True)
            rc_path.write_text(rc_content)
            shutil.chown(openbox_dir, self.config.user, self.config.user)
            shutil.chown(rc_path, self.config.user, self.config.user)
        
        self._log(f"Openbox rc.xml configurado: {rc_path}", "success")
        return True
    
    def configure_bash_profile(self) -> bool:
        """Configura .bash_profile para iniciar X automaticamente."""
        self._log("Configurando .bash_profile...", "info")
        
        bash_profile_content = """# TSiJUKEBOX Kiosk Mode
# Iniciar X automaticamente no tty1

if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx -- -nocursor
fi
"""
        
        bash_profile_path = self.home / ".bash_profile"
        
        if not self.dry_run:
            # Backup se existir
            if bash_profile_path.exists():
                backup_path = bash_profile_path.with_suffix('.bak')
                shutil.copy(bash_profile_path, backup_path)
            
            bash_profile_path.write_text(bash_profile_content)
            shutil.chown(bash_profile_path, self.config.user, self.config.user)
        
        self._log(f".bash_profile configurado: {bash_profile_path}", "success")
        return True
    
    def configure_autologin(self) -> bool:
        """Configura autologin via getty."""
        self._log("Configurando autologin...", "info")
        
        override_dir = Path("/etc/systemd/system/getty@tty1.service.d")
        override_file = override_dir / "autologin.conf"
        
        override_content = f"""[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin {self.config.user} --noclear %I $TERM
"""
        
        if not self.dry_run:
            override_dir.mkdir(parents=True, exist_ok=True)
            override_file.write_text(override_content)
            
            self._run(['systemctl', 'daemon-reload'])
            self._run(['systemctl', 'enable', 'getty@tty1.service'])
        
        self._log("Autologin configurado", "success")
        return True
    
    def create_watchdog_service(self) -> bool:
        """Cria serviço watchdog para monitorar o kiosk."""
        self._log("Criando watchdog...", "info")
        
        watchdog_script = f"""#!/bin/bash
# TSiJUKEBOX Kiosk Watchdog
# Monitora e reinicia Chromium se necessário

KIOSK_URL="{self.config.url}"
CHECK_INTERVAL=30

while true; do
    sleep $CHECK_INTERVAL
    
    # Verificar se Chromium está rodando
    if ! pgrep -x "chromium" > /dev/null; then
        echo "[WATCHDOG] Chromium não está rodando, reiniciando X..."
        
        # Reiniciar display manager ou X
        pkill -u {self.config.user} Xorg
        sleep 5
        
        # Login automático deve reiniciar tudo
    fi
    
    # Verificar se URL está acessível
    if ! curl -s --max-time 5 "$KIOSK_URL" > /dev/null; then
        echo "[WATCHDOG] URL não acessível: $KIOSK_URL"
    fi
done
"""
        
        watchdog_path = Path("/opt/tsijukebox/kiosk-watchdog.sh")
        
        service_content = f"""[Unit]
Description=TSiJUKEBOX Kiosk Watchdog
After=graphical.target

[Service]
Type=simple
ExecStart={watchdog_path}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"""
        
        service_path = Path("/etc/systemd/system/tsijukebox-watchdog.service")
        
        if not self.dry_run:
            watchdog_path.parent.mkdir(parents=True, exist_ok=True)
            watchdog_path.write_text(watchdog_script)
            watchdog_path.chmod(0o755)
            
            service_path.write_text(service_content)
            
            self._run(['systemctl', 'daemon-reload'])
            
            if self.config.watchdog_enabled:
                self._run(['systemctl', 'enable', 'tsijukebox-watchdog'])
        
        self._log("Watchdog criado", "success")
        return True
    
    def full_setup(self) -> bool:
        """Executa instalação completa do modo kiosk."""
        self._log("Iniciando configuração de modo kiosk...", "info")
        
        # Instalar componentes
        if not self.install_xorg():
            return False
        
        if not self.install_openbox():
            return False
        
        if not self.install_chromium():
            return False
        
        self.install_utilities()
        
        # Configurar
        self.configure_xinitrc()
        self.configure_openbox_autostart()
        self.configure_openbox_rc()
        self.configure_bash_profile()
        self.configure_autologin()
        
        # Watchdog
        if self.config.watchdog_enabled:
            self.create_watchdog_service()
        
        self._log("Configuração de modo kiosk concluída!", "success")
        self._log(f"Reinicie o sistema para ativar o modo kiosk", "info")
        return True
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna status do modo kiosk."""
        return {
            'xorg_installed': shutil.which('Xorg') is not None,
            'openbox_installed': shutil.which('openbox') is not None,
            'chromium_installed': shutil.which('chromium') is not None,
            'xinitrc_exists': (self.home / ".xinitrc").exists(),
            'autostart_exists': (self.home / ".config/openbox/autostart").exists(),
            'autologin_configured': Path("/etc/systemd/system/getty@tty1.service.d/autologin.conf").exists(),
            'url': self.config.url,
        }


def main():
    """Ponto de entrada para execução standalone."""
    import argparse
    
    parser = argparse.ArgumentParser(description='TSiJUKEBOX Kiosk Setup')
    parser.add_argument('--url', default='http://localhost:5173',
                       help='URL para exibir no kiosk')
    parser.add_argument('--resolution', default='1920x1080',
                       help='Resolução do display')
    parser.add_argument('--rotation', choices=['normal', 'left', 'right', 'inverted'],
                       default='normal', help='Rotação do display')
    parser.add_argument('--no-cursor-hide', action='store_true',
                       help='Não esconder cursor')
    parser.add_argument('--no-watchdog', action='store_true',
                       help='Não instalar watchdog')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sem executar')
    parser.add_argument('--status', action='store_true',
                       help='Mostrar status')
    
    args = parser.parse_args()
    
    config = KioskChromiumConfig(
        url=args.url,
        resolution=args.resolution,
        rotation=args.rotation,
        hide_cursor=not args.no_cursor_hide,
        watchdog_enabled=not args.no_watchdog,
    )
    
    setup = KioskChromiumSetup(config=config, dry_run=args.dry_run)
    
    if args.status:
        import json
        status = setup.get_status()
        print(json.dumps(status, indent=2))
        return
    
    success = setup.full_setup()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
