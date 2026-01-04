#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Login Manager Setup
============================================
Módulo para detectar e configurar login managers para autologin.

Suporta: SDDM, GDM, LightDM, Ly, greetd, getty

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import subprocess
import shutil
import grp
from pathlib import Path
from typing import Optional, List, Dict
from dataclasses import dataclass
from enum import Enum

try:
    from .utils.logger import Logger
except ImportError:
    class Logger:
        def info(self, msg): print(f"[INFO] {msg}")
        def success(self, msg): print(f"[OK] {msg}")
        def warning(self, msg): print(f"[WARN] {msg}")
        def error(self, msg): print(f"[ERROR] {msg}")
        def debug(self, msg): pass


class LoginManager(Enum):
    """Login managers suportados."""
    SDDM = "sddm"
    GDM = "gdm"
    LIGHTDM = "lightdm"
    LY = "ly"
    GREETD = "greetd"
    GETTY = "getty"
    UNKNOWN = "unknown"


@dataclass
class LoginManagerInfo:
    """Informações do login manager."""
    name: str
    manager: LoginManager
    installed: bool
    active: bool
    enabled: bool
    config_path: Path
    supports_autologin: bool


class LoginManagerSetup:
    """
    Detecta e configura login managers para autologin.
    Suporta SDDM, GDM, LightDM, Ly, greetd e getty.
    """
    
    # Mapeamento de login managers para configurações
    MANAGER_CONFIGS = {
        LoginManager.SDDM: {
            'service': 'sddm',
            'config_dir': Path('/etc/sddm.conf.d'),
            'config_file': 'autologin.conf',
        },
        LoginManager.GDM: {
            'service': 'gdm',
            'config_dir': Path('/etc/gdm'),
            'config_file': 'custom.conf',
        },
        LoginManager.LIGHTDM: {
            'service': 'lightdm',
            'config_dir': Path('/etc/lightdm/lightdm.conf.d'),
            'config_file': '50-autologin.conf',
        },
        LoginManager.LY: {
            'service': 'ly',
            'config_dir': Path('/etc/ly'),
            'config_file': 'config.ini',
        },
        LoginManager.GREETD: {
            'service': 'greetd',
            'config_dir': Path('/etc/greetd'),
            'config_file': 'config.toml',
        },
        LoginManager.GETTY: {
            'service': 'getty@tty1',
            'config_dir': Path('/etc/systemd/system/getty@tty1.service.d'),
            'config_file': 'autologin.conf',
        },
    }
    
    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or Logger()
    
    def _run_command(
        self,
        cmd: List[str],
        capture: bool = True
    ) -> tuple:
        """Executa comando shell."""
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                timeout=30
            )
            return result.returncode, result.stdout or "", result.stderr or ""
        except Exception as e:
            return 1, "", str(e)
    
    def _is_service_active(self, service: str) -> bool:
        """Verifica se um serviço está ativo."""
        code, out, _ = self._run_command(['systemctl', 'is-active', service])
        return out.strip() == 'active'
    
    def _is_service_enabled(self, service: str) -> bool:
        """Verifica se um serviço está habilitado."""
        code, out, _ = self._run_command(['systemctl', 'is-enabled', service])
        return out.strip() == 'enabled'
    
    def _is_installed(self, binary: str) -> bool:
        """Verifica se um binário está instalado."""
        return shutil.which(binary) is not None
    
    def detect_login_manager(self) -> LoginManager:
        """
        Detecta o login manager ativo/configurado.
        
        Ordem de verificação:
        1. Serviço ativo
        2. Serviço habilitado
        3. Binário instalado
        """
        self.logger.info("Detectando login manager...")
        
        # Verificar serviços ativos primeiro
        for manager in [LoginManager.SDDM, LoginManager.GDM, 
                       LoginManager.LIGHTDM, LoginManager.LY, LoginManager.GREETD]:
            config = self.MANAGER_CONFIGS[manager]
            if self._is_service_active(config['service']):
                self.logger.success(f"Login manager ativo: {manager.value}")
                return manager
        
        # Verificar serviços habilitados
        for manager in [LoginManager.SDDM, LoginManager.GDM, 
                       LoginManager.LIGHTDM, LoginManager.LY, LoginManager.GREETD]:
            config = self.MANAGER_CONFIGS[manager]
            if self._is_service_enabled(config['service']):
                self.logger.info(f"Login manager habilitado: {manager.value}")
                return manager
        
        # Verificar binários instalados
        for manager in [LoginManager.SDDM, LoginManager.GDM, 
                       LoginManager.LIGHTDM, LoginManager.LY, LoginManager.GREETD]:
            if self._is_installed(manager.value):
                self.logger.info(f"Login manager instalado: {manager.value}")
                return manager
        
        # Fallback para getty
        self.logger.warning("Nenhum login manager gráfico encontrado, usando getty")
        return LoginManager.GETTY
    
    def get_login_manager_info(self, manager: Optional[LoginManager] = None) -> LoginManagerInfo:
        """Obtém informações detalhadas do login manager."""
        if manager is None:
            manager = self.detect_login_manager()
        
        config = self.MANAGER_CONFIGS.get(manager, self.MANAGER_CONFIGS[LoginManager.GETTY])
        
        return LoginManagerInfo(
            name=manager.value,
            manager=manager,
            installed=self._is_installed(manager.value) if manager != LoginManager.GETTY else True,
            active=self._is_service_active(config['service']),
            enabled=self._is_service_enabled(config['service']),
            config_path=config['config_dir'] / config['config_file'],
            supports_autologin=True
        )
    
    def configure_autologin(
        self,
        username: str,
        session: str = "openbox",
        manager: Optional[LoginManager] = None
    ) -> bool:
        """
        Configura autologin para o login manager detectado ou especificado.
        
        Args:
            username: Nome do usuário para autologin
            session: Sessão a iniciar (padrão: openbox)
            manager: Login manager específico (detecta automaticamente se None)
        """
        if manager is None:
            manager = self.detect_login_manager()
        
        self.logger.info(f"Configurando autologin via {manager.value} para {username}")
        
        handlers = {
            LoginManager.SDDM: self._configure_sddm,
            LoginManager.GDM: self._configure_gdm,
            LoginManager.LIGHTDM: self._configure_lightdm,
            LoginManager.LY: self._configure_ly,
            LoginManager.GREETD: self._configure_greetd,
            LoginManager.GETTY: self._configure_getty,
        }
        
        handler = handlers.get(manager, self._configure_getty)
        return handler(username, session)
    
    def _configure_sddm(self, username: str, session: str) -> bool:
        """Configura autologin no SDDM."""
        config_dir = Path('/etc/sddm.conf.d')
        config_dir.mkdir(parents=True, exist_ok=True)
        
        config = f"""[Autologin]
User={username}
Session={session}
Relogin=false

[Theme]
Current=breeze

[General]
HaltCommand=/usr/bin/systemctl poweroff
RebootCommand=/usr/bin/systemctl reboot
Numlock=on
"""
        
        config_file = config_dir / 'autologin.conf'
        config_file.write_text(config)
        
        self.logger.success(f"SDDM autologin configurado: {config_file}")
        return True
    
    def _configure_gdm(self, username: str, session: str) -> bool:
        """Configura autologin no GDM."""
        config_file = Path('/etc/gdm/custom.conf')
        config_file.parent.mkdir(parents=True, exist_ok=True)
        
        config = f"""[daemon]
AutomaticLoginEnable=True
AutomaticLogin={username}
DefaultSession={session}.desktop

[security]
DisallowTCP=true

[xdmcp]
Enable=false

[chooser]

[debug]
"""
        
        config_file.write_text(config)
        
        self.logger.success(f"GDM autologin configurado: {config_file}")
        return True
    
    def _configure_lightdm(self, username: str, session: str) -> bool:
        """Configura autologin no LightDM."""
        config_dir = Path('/etc/lightdm/lightdm.conf.d')
        config_dir.mkdir(parents=True, exist_ok=True)
        
        config = f"""[Seat:*]
autologin-user={username}
autologin-user-timeout=0
autologin-session={session}
greeter-session=lightdm-gtk-greeter
"""
        
        config_file = config_dir / '50-autologin.conf'
        config_file.write_text(config)
        
        # Criar grupo autologin se não existir
        try:
            grp.getgrnam('autologin')
        except KeyError:
            self._run_command(['groupadd', 'autologin'])
        
        # Adicionar usuário ao grupo
        self._run_command(['usermod', '-aG', 'autologin', username])
        
        self.logger.success(f"LightDM autologin configurado: {config_file}")
        return True
    
    def _configure_ly(self, username: str, session: str) -> bool:
        """Configura autologin no Ly."""
        config_file = Path('/etc/ly/config.ini')
        config_file.parent.mkdir(parents=True, exist_ok=True)
        
        config = f"""# Ly display manager configuration
# Configurado por TSiJUKEBOX Installer

animation = matrix
default_user = {username}
autologin = true
default_session = {session}
hide_borders = true
"""
        
        config_file.write_text(config)
        
        self.logger.success(f"Ly autologin configurado: {config_file}")
        return True
    
    def _configure_greetd(self, username: str, session: str) -> bool:
        """Configura autologin no greetd."""
        config_file = Path('/etc/greetd/config.toml')
        config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Comando de sessão
        session_cmd = f"{session}-session" if session != "openbox" else "openbox-session"
        
        config = f'''# greetd configuration
# Configurado por TSiJUKEBOX Installer

[terminal]
vt = 1

[default_session]
command = "{session_cmd}"
user = "{username}"

[initial_session]
command = "{session_cmd}"
user = "{username}"
'''
        
        config_file.write_text(config)
        
        self.logger.success(f"greetd autologin configurado: {config_file}")
        return True
    
    def _configure_getty(self, username: str, session: str) -> bool:
        """Configura autologin via getty (TTY)."""
        override_dir = Path('/etc/systemd/system/getty@tty1.service.d')
        override_dir.mkdir(parents=True, exist_ok=True)
        
        config = f"""[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin {username} --noclear %I $TERM
Type=idle
"""
        
        config_file = override_dir / 'autologin.conf'
        config_file.write_text(config)
        
        # Recarregar systemd
        self._run_command(['systemctl', 'daemon-reload'])
        self._run_command(['systemctl', 'enable', 'getty@tty1.service'])
        
        self.logger.success(f"getty autologin configurado: {config_file}")
        return True
    
    def disable_autologin(self, manager: Optional[LoginManager] = None) -> bool:
        """Remove configuração de autologin."""
        if manager is None:
            manager = self.detect_login_manager()
        
        config = self.MANAGER_CONFIGS.get(manager)
        if not config:
            return False
        
        config_path = config['config_dir'] / config['config_file']
        
        if config_path.exists():
            config_path.unlink()
            self.logger.success(f"Autologin removido: {config_path}")
            
            if manager == LoginManager.GETTY:
                self._run_command(['systemctl', 'daemon-reload'])
            
            return True
        
        return False
    
    def list_available_sessions(self) -> List[str]:
        """Lista sessões disponíveis no sistema."""
        sessions = []
        
        # Diretórios de sessões
        session_dirs = [
            Path('/usr/share/xsessions'),
            Path('/usr/share/wayland-sessions'),
        ]
        
        for session_dir in session_dirs:
            if session_dir.exists():
                for f in session_dir.glob('*.desktop'):
                    sessions.append(f.stem)
        
        # Adicionar sessões comuns se os binários existirem
        common_sessions = ['openbox', 'i3', 'bspwm', 'awesome', 'dwm']
        for session in common_sessions:
            if self._is_installed(session) and session not in sessions:
                sessions.append(session)
        
        return sorted(sessions)


def main():
    """Teste do módulo de login manager."""
    lm = LoginManagerSetup()
    
    print("=== Login Manager Setup Test ===\n")
    
    # Detectar login manager
    detected = lm.detect_login_manager()
    print(f"Login manager detectado: {detected.value}")
    
    # Obter informações detalhadas
    info = lm.get_login_manager_info()
    print(f"\nInformações:")
    print(f"  Nome: {info.name}")
    print(f"  Instalado: {'Sim' if info.installed else 'Não'}")
    print(f"  Ativo: {'Sim' if info.active else 'Não'}")
    print(f"  Habilitado: {'Sim' if info.enabled else 'Não'}")
    print(f"  Config: {info.config_path}")
    
    # Listar sessões disponíveis
    sessions = lm.list_available_sessions()
    print(f"\nSessões disponíveis: {', '.join(sessions) if sessions else 'nenhuma'}")


if __name__ == "__main__":
    main()
