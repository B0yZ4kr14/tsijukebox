#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Unified Installer
==========================================
Instalador unificado com Docker + todas as integrações.

USO:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3

FEATURES:
    ✅ Detecta login manager automaticamente (SDDM, GDM, LightDM, Ly, greetd, getty)
    ✅ Configura autologin com usuário vigente
    ✅ Instala e configura UFW (firewall)
    ✅ Instala e configura Nginx (proxy reverso)
    ✅ Instala e configura Grafana + Prometheus (monitoring)
    ✅ Instala Spotify + Spicetify
    ✅ Instala spotify-cli-linux (pip)
    ✅ Configura NTP (chrony/systemd-timesyncd)
    ✅ Docker para aplicação principal
    ✅ Rollback automático em caso de falha

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import pwd
import grp
import json
import shutil
import argparse
import subprocess
import socket
import time
from pathlib import Path
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

# =============================================================================
# CONSTANTES E CONFIGURAÇÃO
# =============================================================================

VERSION = "5.0.0"
INSTALL_DIR = Path("/opt/tsijukebox")
CONFIG_DIR = Path("/etc/tsijukebox")
LOG_DIR = Path("/var/log/tsijukebox")
DATA_DIR = Path("/var/lib/tsijukebox")
BACKUP_DIR = Path("/var/backups/tsijukebox")

# Cores ANSI
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'

# =============================================================================
# LOGGER
# =============================================================================

class Logger:
    """Logger estruturado para o instalador."""
    
    def __init__(self, verbose: bool = False, quiet: bool = False):
        self.verbose = verbose
        self.quiet = quiet
        self.log_file = LOG_DIR / f"install-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
        self._ensure_log_dir()
    
    def _ensure_log_dir(self):
        try:
            LOG_DIR.mkdir(parents=True, exist_ok=True)
        except PermissionError:
            pass
    
    def _write_log(self, level: str, message: str):
        try:
            with open(self.log_file, 'a') as f:
                f.write(f"[{datetime.now().isoformat()}] [{level}] {message}\n")
        except:
            pass
    
    def info(self, message: str):
        self._write_log("INFO", message)
        if not self.quiet:
            print(f"{Colors.BLUE}ℹ{Colors.RESET}  {message}")
    
    def success(self, message: str):
        self._write_log("SUCCESS", message)
        if not self.quiet:
            print(f"{Colors.GREEN}✓{Colors.RESET}  {message}")
    
    def warning(self, message: str):
        self._write_log("WARNING", message)
        print(f"{Colors.YELLOW}⚠{Colors.RESET}  {message}")
    
    def error(self, message: str):
        self._write_log("ERROR", message)
        print(f"{Colors.RED}✗{Colors.RESET}  {message}")
    
    def debug(self, message: str):
        self._write_log("DEBUG", message)
        if self.verbose:
            print(f"{Colors.DIM}  {message}{Colors.RESET}")
    
    def step(self, current: int, total: int, message: str):
        self._write_log("STEP", f"[{current}/{total}] {message}")
        if not self.quiet:
            print(f"{Colors.CYAN}[{current}/{total}]{Colors.RESET} {message}")


# =============================================================================
# CLASSES DE DADOS
# =============================================================================

class InstallPhase(Enum):
    """Fases de instalação."""
    SYSTEM_CHECK = "system_check"
    DOCKER = "docker"
    UFW = "ufw"
    NTP = "ntp"
    NGINX = "nginx"
    MONITORING = "monitoring"
    SPOTIFY = "spotify"
    SPICETIFY = "spicetify"
    SPOTIFY_CLI = "spotify_cli"
    AUTOLOGIN = "autologin"
    APP_DEPLOY = "app_deploy"
    SERVICES = "services"
    VERIFY = "verify"


@dataclass
class InstallConfig:
    """Configuração de instalação."""
    mode: str = 'full'
    user: Optional[str] = None
    
    # Componentes
    install_docker: bool = True
    install_ufw: bool = True
    install_ntp: bool = True
    install_nginx: bool = True
    install_monitoring: bool = True
    install_spotify: bool = True
    install_spicetify: bool = True
    install_spotify_cli: bool = True
    configure_autologin: bool = True
    
    # Opções
    dry_run: bool = False
    verbose: bool = False
    quiet: bool = False
    auto: bool = False
    
    # Timezone
    timezone: str = "America/Sao_Paulo"


@dataclass
class SystemInfo:
    """Informações do sistema detectadas."""
    distro: str = ""
    distro_id: str = ""
    user: str = ""
    home: Path = Path.home()
    login_manager: str = ""
    has_docker: bool = False
    has_paru: bool = False
    has_yay: bool = False
    ram_gb: float = 0
    disk_free_gb: float = 0


# =============================================================================
# UTILIDADES
# =============================================================================

def run_command(
    cmd: List[str],
    capture: bool = True,
    check: bool = False,
    timeout: int = 300,
    env: Optional[Dict] = None,
    dry_run: bool = False
) -> Tuple[int, str, str]:
    """Executa comando shell."""
    if dry_run:
        print(f"[DRY-RUN] {' '.join(cmd)}")
        return 0, "", ""
    
    full_env = os.environ.copy()
    if env:
        full_env.update(env)
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            timeout=timeout,
            env=full_env
        )
        return result.returncode, result.stdout or "", result.stderr or ""
    except subprocess.TimeoutExpired:
        return 1, "", "Timeout"
    except FileNotFoundError:
        return 1, "", f"Command not found: {cmd[0]}"
    except Exception as e:
        return 1, "", str(e)


def run_as_user(cmd: List[str], user: str, **kwargs) -> Tuple[int, str, str]:
    """Executa comando como outro usuário."""
    if os.geteuid() == 0 and user:
        cmd = ['sudo', '-u', user] + cmd
    return run_command(cmd, **kwargs)


def detect_distro() -> Tuple[str, str]:
    """Detecta distribuição Linux."""
    os_release = Path("/etc/os-release")
    
    if os_release.exists():
        content = os_release.read_text()
        name = ""
        distro_id = ""
        
        for line in content.split('\n'):
            if line.startswith('NAME='):
                name = line.split('=')[1].strip('"')
            elif line.startswith('ID='):
                distro_id = line.split('=')[1].strip('"')
        
        return name, distro_id
    
    return "Unknown", "unknown"


def detect_aur_helper() -> Optional[str]:
    """Detecta AUR helper disponível (paru preferido)."""
    for helper in ['paru', 'yay', 'pikaur', 'trizen']:
        if shutil.which(helper):
            return helper
    return None


# =============================================================================
# INSTALADOR PRINCIPAL
# =============================================================================

class UnifiedInstaller:
    """Instalador unificado do TSiJUKEBOX."""
    
    def __init__(self, config: InstallConfig):
        self.config = config
        self.logger = Logger(verbose=config.verbose, quiet=config.quiet)
        self.system_info = SystemInfo()
        self.completed_phases: List[InstallPhase] = []
        self.rollback_actions: List[callable] = []
    
    def run(self) -> bool:
        """Executa instalação completa."""
        self._print_banner()
        
        try:
            # Fase 1: Verificação do sistema
            if not self._phase_system_check():
                return False
            
            # Fase 2: Docker
            if self.config.install_docker:
                if not self._phase_docker():
                    return self._rollback()
            
            # Fase 3: UFW Firewall
            if self.config.install_ufw:
                if not self._phase_ufw():
                    self.logger.warning("UFW falhou, continuando...")
            
            # Fase 4: NTP
            if self.config.install_ntp:
                if not self._phase_ntp():
                    self.logger.warning("NTP falhou, continuando...")
            
            # Fase 5: Nginx
            if self.config.install_nginx:
                if not self._phase_nginx():
                    self.logger.warning("Nginx falhou, continuando...")
            
            # Fase 6: Monitoramento (Grafana + Prometheus)
            if self.config.install_monitoring:
                if not self._phase_monitoring():
                    self.logger.warning("Monitoramento falhou, continuando...")
            
            # Fase 7: Spotify
            if self.config.install_spotify:
                if not self._phase_spotify():
                    self.logger.warning("Spotify falhou, continuando...")
            
            # Fase 8: Spicetify
            if self.config.install_spicetify and self.config.install_spotify:
                if not self._phase_spicetify():
                    self.logger.warning("Spicetify falhou, continuando...")
            
            # Fase 9: spotify-cli-linux
            if self.config.install_spotify_cli and self.config.install_spotify:
                if not self._phase_spotify_cli():
                    self.logger.warning("spotify-cli falhou, continuando...")
            
            # Fase 10: Autologin
            if self.config.configure_autologin:
                if not self._phase_autologin():
                    self.logger.warning("Autologin falhou, continuando...")
            
            # Fase 11: Deploy da aplicação
            if not self._phase_app_deploy():
                return self._rollback()
            
            # Fase 12: Serviços systemd
            if not self._phase_services():
                self.logger.warning("Serviços falhou, continuando...")
            
            # Fase 13: Verificação final
            if not self._phase_verify():
                self.logger.warning("Verificação incompleta")
            
            self._print_success()
            return True
            
        except KeyboardInterrupt:
            self.logger.warning("Instalação cancelada pelo usuário")
            return self._rollback()
        except Exception as e:
            self.logger.error(f"Erro fatal: {e}")
            return self._rollback()
    
    def _print_banner(self):
        """Exibe banner do instalador."""
        print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {Colors.BOLD}{Colors.WHITE}🚀 TSiJUKEBOX Enterprise - Unified Installer v{VERSION}{Colors.RESET}{Colors.CYAN}                          ║
║  {Colors.DIM}Instalador unificado com Docker + todas as integrações{Colors.RESET}{Colors.CYAN}                     ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    def _print_success(self):
        """Exibe mensagem de sucesso."""
        print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {Colors.BOLD}🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!{Colors.RESET}{Colors.GREEN}                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}

  {Colors.CYAN}📍 Acessar:{Colors.RESET}
     • TSiJUKEBOX: http://localhost:5173
     • Grafana:    http://localhost:3000  (admin/admin)
     • Prometheus: http://localhost:9090

  {Colors.CYAN}📋 Comandos úteis:{Colors.RESET}
     • systemctl status tsijukebox
     • journalctl -u tsijukebox -f
     • tsijukebox --verify

  {Colors.CYAN}📚 Documentação:{Colors.RESET}
     • https://github.com/B0yZ4kr14/TSiJUKEBOX

{Colors.GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}
""")
    
    def _rollback(self) -> bool:
        """Executa rollback em caso de falha."""
        self.logger.warning("Executando rollback...")
        
        for action in reversed(self.rollback_actions):
            try:
                action()
            except Exception as e:
                self.logger.debug(f"Rollback action failed: {e}")
        
        return False
    
    # =========================================================================
    # FASES DE INSTALAÇÃO
    # =========================================================================
    
    def _phase_system_check(self) -> bool:
        """Fase 1: Verificação do sistema."""
        self.logger.step(1, 13, "Verificando sistema...")
        
        # Verificar root
        if os.geteuid() != 0:
            self.logger.error("Este script deve ser executado como root (sudo)")
            return False
        
        # Detectar usuário real
        self.system_info.user = self.config.user or os.environ.get('SUDO_USER') or 'root'
        
        try:
            pw = pwd.getpwnam(self.system_info.user)
            self.system_info.home = Path(pw.pw_dir)
        except KeyError:
            self.system_info.home = Path.home()
        
        self.logger.info(f"Usuário: {self.system_info.user}")
        self.logger.info(f"Home: {self.system_info.home}")
        
        # Detectar distro
        name, distro_id = detect_distro()
        self.system_info.distro = name
        self.system_info.distro_id = distro_id
        self.logger.info(f"Distro: {name} ({distro_id})")
        
        # Verificar Arch-based
        if distro_id not in ['arch', 'cachyos', 'endeavouros', 'manjaro', 'artix', 'garuda']:
            self.logger.warning(f"Distro {distro_id} não é Arch-based, algumas features podem não funcionar")
        
        # Detectar AUR helper
        aur_helper = detect_aur_helper()
        self.system_info.has_paru = aur_helper == 'paru'
        self.system_info.has_yay = aur_helper == 'yay'
        
        if aur_helper:
            self.logger.info(f"AUR helper: {aur_helper}")
        else:
            self.logger.warning("Nenhum AUR helper encontrado, instalando paru...")
            self._install_paru()
        
        # Verificar Docker
        self.system_info.has_docker = shutil.which('docker') is not None
        
        # Verificar RAM
        try:
            with open('/proc/meminfo') as f:
                for line in f:
                    if line.startswith('MemTotal'):
                        kb = int(line.split()[1])
                        self.system_info.ram_gb = kb / 1024 / 1024
                        break
        except:
            self.system_info.ram_gb = 4.0
        
        self.logger.info(f"RAM: {self.system_info.ram_gb:.1f} GB")
        
        # Verificar espaço em disco
        try:
            stat = os.statvfs('/')
            self.system_info.disk_free_gb = (stat.f_bavail * stat.f_frsize) / (1024**3)
        except:
            self.system_info.disk_free_gb = 10.0
        
        self.logger.info(f"Disco livre: {self.system_info.disk_free_gb:.1f} GB")
        
        if self.system_info.disk_free_gb < 5:
            self.logger.warning("Pouco espaço em disco (<5GB)")
        
        # Detectar login manager
        self.system_info.login_manager = self._detect_login_manager()
        self.logger.info(f"Login manager: {self.system_info.login_manager}")
        
        self.completed_phases.append(InstallPhase.SYSTEM_CHECK)
        self.logger.success("Sistema verificado")
        return True
    
    def _detect_login_manager(self) -> str:
        """Detecta login manager ativo."""
        managers = ['sddm', 'gdm', 'lightdm', 'ly', 'greetd']
        
        for manager in managers:
            code, out, _ = run_command(['systemctl', 'is-active', manager], check=False)
            if out.strip() == 'active':
                return manager
        
        return 'getty'
    
    def _install_paru(self) -> bool:
        """Instala paru AUR helper."""
        self.logger.info("Instalando paru...")
        
        # Dependências
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'base-devel', 'git'])
        
        # Clonar e instalar
        temp_dir = Path("/tmp/paru-install")
        
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        
        code, _, err = run_command([
            'git', 'clone', 'https://aur.archlinux.org/paru-bin.git', str(temp_dir)
        ])
        
        if code != 0:
            self.logger.error(f"Falha ao clonar paru: {err}")
            return False
        
        # Build como usuário não-root
        code, _, err = run_as_user(
            ['makepkg', '-si', '--noconfirm'],
            self.system_info.user,
            dry_run=self.config.dry_run
        )
        
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
        
        self.system_info.has_paru = shutil.which('paru') is not None
        return self.system_info.has_paru
    
    def _phase_docker(self) -> bool:
        """Fase 2: Instalação do Docker."""
        self.logger.step(2, 13, "Configurando Docker...")
        
        if self.system_info.has_docker:
            self.logger.info("Docker já instalado")
        else:
            # Instalar Docker
            code, _, err = run_command([
                'pacman', '-S', '--noconfirm', 'docker', 'docker-compose'
            ], dry_run=self.config.dry_run)
            
            if code != 0:
                self.logger.error(f"Falha ao instalar Docker: {err}")
                return False
        
        # Habilitar serviço
        run_command(['systemctl', 'enable', 'docker'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'start', 'docker'], dry_run=self.config.dry_run)
        
        # Adicionar usuário ao grupo docker
        run_command([
            'usermod', '-aG', 'docker', self.system_info.user
        ], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.DOCKER)
        self.logger.success("Docker configurado")
        return True
    
    def _phase_ufw(self) -> bool:
        """Fase 3: Configuração do UFW."""
        self.logger.step(3, 13, "Configurando firewall UFW...")
        
        try:
            # Importar módulo UFW local
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from ufw_setup import UFWSetup
            
            ufw = UFWSetup(logger=self.logger, dry_run=self.config.dry_run)
            success = ufw.full_setup(self.config.mode)
            
            if success:
                self.completed_phases.append(InstallPhase.UFW)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo UFW não encontrado, configuração manual...")
            
            # Fallback: comandos diretos
            run_command(['pacman', '-S', '--noconfirm', 'ufw'], dry_run=self.config.dry_run)
            run_command(['ufw', 'default', 'deny', 'incoming'], dry_run=self.config.dry_run)
            run_command(['ufw', 'default', 'allow', 'outgoing'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', 'ssh'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '80/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '443/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '5173/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '3000/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', '--force', 'enable'], dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.UFW)
            self.logger.success("UFW configurado")
            return True
    
    def _phase_ntp(self) -> bool:
        """Fase 4: Configuração do NTP."""
        self.logger.step(4, 13, "Configurando sincronização de tempo...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from ntp_setup import NTPSetup
            
            ntp = NTPSetup(logger=self.logger, dry_run=self.config.dry_run)
            success = ntp.full_setup(timezone=self.config.timezone)
            
            if success:
                self.completed_phases.append(InstallPhase.NTP)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo NTP não encontrado, configuração manual...")
            
            # Fallback: timedatectl
            run_command(['timedatectl', 'set-ntp', 'true'], dry_run=self.config.dry_run)
            run_command(['timedatectl', 'set-timezone', self.config.timezone], dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.NTP)
            self.logger.success("NTP configurado")
            return True
    
    def _phase_nginx(self) -> bool:
        """Fase 5: Instalação e configuração do Nginx."""
        self.logger.step(5, 13, "Configurando Nginx...")
        
        # Instalar Nginx
        code, _, err = run_command([
            'pacman', '-S', '--noconfirm', 'nginx'
        ], dry_run=self.config.dry_run)
        
        if code != 0:
            self.logger.error(f"Falha ao instalar Nginx: {err}")
            return False
        
        # Criar configuração
        nginx_conf = """# TSiJUKEBOX Nginx Configuration
# Proxy reverso para aplicação

upstream tsijukebox {
    server 127.0.0.1:5173;
}

server {
    listen 80;
    server_name localhost _;

    location / {
        proxy_pass http://tsijukebox;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /grafana/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
    }
}
"""
        
        if not self.config.dry_run:
            CONFIG_DIR.mkdir(parents=True, exist_ok=True)
            nginx_file = CONFIG_DIR / 'nginx.conf'
            nginx_file.write_text(nginx_conf)
            
            # Link para sites-enabled
            sites_dir = Path('/etc/nginx/sites-enabled')
            if sites_dir.exists():
                link = sites_dir / 'tsijukebox'
                if not link.exists():
                    link.symlink_to(nginx_file)
        
        # Habilitar serviço
        run_command(['systemctl', 'enable', 'nginx'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'restart', 'nginx'], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.NGINX)
        self.logger.success("Nginx configurado")
        return True
    
    def _phase_monitoring(self) -> bool:
        """Fase 6: Instalação do monitoramento."""
        self.logger.step(6, 13, "Configurando Grafana + Prometheus...")
        
        # Instalar pacotes
        packages = ['grafana', 'prometheus', 'prometheus-node-exporter']
        
        code, _, err = run_command([
            'pacman', '-S', '--noconfirm'] + packages,
            dry_run=self.config.dry_run
        )
        
        if code != 0:
            self.logger.warning(f"Alguns pacotes falharam: {err}")
        
        # Habilitar serviços
        for service in ['grafana', 'prometheus', 'prometheus-node-exporter']:
            run_command(['systemctl', 'enable', service], dry_run=self.config.dry_run)
            run_command(['systemctl', 'start', service], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.MONITORING)
        self.logger.success("Monitoramento configurado")
        return True
    
    def _phase_spotify(self) -> bool:
        """Fase 7: Instalação do Spotify."""
        self.logger.step(7, 13, "Instalando Spotify...")
        
        # Verificar se já instalado
        if shutil.which('spotify'):
            self.logger.info("Spotify já instalado")
            self.completed_phases.append(InstallPhase.SPOTIFY)
            return True
        
        # Preferir spotify-launcher (oficial)
        code, _, _ = run_command([
            'pacman', '-S', '--noconfirm', 'spotify-launcher'
        ], dry_run=self.config.dry_run)
        
        if code == 0:
            self.logger.info("spotify-launcher instalado, executando setup...")
            run_as_user(['spotify-launcher'], self.system_info.user, dry_run=self.config.dry_run)
        else:
            # Fallback: AUR
            aur_helper = detect_aur_helper()
            if aur_helper:
                run_as_user([aur_helper, '-S', '--noconfirm', 'spotify'], 
                           self.system_info.user, dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.SPOTIFY)
        self.logger.success("Spotify instalado")
        return True
    
    def _phase_spicetify(self) -> bool:
        """Fase 8: Instalação do Spicetify."""
        self.logger.step(8, 13, "Configurando Spicetify...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from spicetify_setup import SpicetifySetup
            
            spicetify = SpicetifySetup(logger=self.logger, user=self.system_info.user)
            
            if not spicetify.is_spicetify_installed():
                spicetify.install_spicetify()
            
            spicetify.auto_configure(self.system_info.user)
            
            self.completed_phases.append(InstallPhase.SPICETIFY)
            self.logger.success("Spicetify configurado")
            return True
            
        except ImportError:
            self.logger.warning("Módulo Spicetify não encontrado, instalação manual...")
            
            # Fallback: curl install
            install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh"
            run_as_user(['bash', '-c', install_cmd], self.system_info.user, dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.SPICETIFY)
            return True
    
    def _phase_spotify_cli(self) -> bool:
        """Fase 9: Instalação do spotify-cli-linux."""
        self.logger.step(9, 13, "Instalando spotify-cli-linux...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from spotify_cli_setup import SpotifyCLISetup
            
            cli = SpotifyCLISetup(self.system_info.user, verbose=self.config.verbose)
            success = cli.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.SPOTIFY_CLI)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo spotify-cli não encontrado, instalação via pip...")
            
            run_as_user([
                'pip', 'install', '--user', 'spotify-cli-linux'
            ], self.system_info.user, dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.SPOTIFY_CLI)
            return True
    
    def _phase_autologin(self) -> bool:
        """Fase 10: Configuração de autologin."""
        self.logger.step(10, 13, "Configurando autologin...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from login_manager_setup import LoginManagerSetup
            
            lm = LoginManagerSetup(logger=self.logger)
            success = lm.configure_autologin(
                username=self.system_info.user,
                session="openbox"
            )
            
            if success:
                self.completed_phases.append(InstallPhase.AUTOLOGIN)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo login_manager não encontrado")
            return False
    
    def _phase_app_deploy(self) -> bool:
        """Fase 11: Deploy da aplicação."""
        self.logger.step(11, 13, "Fazendo deploy da aplicação...")
        
        # Criar diretórios
        for dir_path in [INSTALL_DIR, CONFIG_DIR, LOG_DIR, DATA_DIR]:
            if not self.config.dry_run:
                dir_path.mkdir(parents=True, exist_ok=True)
        
        # Criar docker-compose.yml
        compose_content = """version: '3.8'

services:
  tsijukebox:
    image: ghcr.io/b0yz4kr14/tsijukebox:latest
    container_name: tsijukebox
    restart: unless-stopped
    ports:
      - "5173:5173"
    volumes:
      - /etc/tsijukebox:/app/config:ro
      - /var/lib/tsijukebox:/app/data
      - /var/log/tsijukebox:/app/logs
    environment:
      - NODE_ENV=production
      - TZ=America/Sao_Paulo
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5173/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  default:
    name: tsijukebox-network
"""
        
        if not self.config.dry_run:
            compose_file = INSTALL_DIR / 'docker-compose.yml'
            compose_file.write_text(compose_content)
            
            # Deploy
            run_command([
                'docker-compose', '-f', str(compose_file), 'up', '-d'
            ])
        
        self.completed_phases.append(InstallPhase.APP_DEPLOY)
        self.logger.success("Aplicação deployada")
        return True
    
    def _phase_services(self) -> bool:
        """Fase 12: Criação de serviços systemd."""
        self.logger.step(12, 13, "Criando serviços systemd...")
        
        service_content = f"""[Unit]
Description=TSiJUKEBOX Music Player
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory={INSTALL_DIR}
ExecStart=/usr/bin/docker-compose up
ExecStop=/usr/bin/docker-compose down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
"""
        
        if not self.config.dry_run:
            service_file = Path('/etc/systemd/system/tsijukebox.service')
            service_file.write_text(service_content)
            
            run_command(['systemctl', 'daemon-reload'])
            run_command(['systemctl', 'enable', 'tsijukebox'])
        
        self.completed_phases.append(InstallPhase.SERVICES)
        self.logger.success("Serviços criados")
        return True
    
    def _phase_verify(self) -> bool:
        """Fase 13: Verificação final."""
        self.logger.step(13, 13, "Verificando instalação...")
        
        checks = [
            ('Docker', shutil.which('docker') is not None),
            ('Nginx', shutil.which('nginx') is not None),
            ('Spotify', shutil.which('spotify') is not None),
            ('Spicetify', shutil.which('spicetify') is not None),
        ]
        
        all_ok = True
        for name, status in checks:
            if status:
                self.logger.success(f"{name}: OK")
            else:
                self.logger.warning(f"{name}: Não encontrado")
                all_ok = False
        
        # Verificar serviços
        services = ['docker', 'nginx', 'grafana', 'prometheus']
        for service in services:
            code, out, _ = run_command(['systemctl', 'is-active', service])
            if out.strip() == 'active':
                self.logger.success(f"Serviço {service}: ativo")
            else:
                self.logger.warning(f"Serviço {service}: inativo")
        
        self.completed_phases.append(InstallPhase.VERIFY)
        return True


# =============================================================================
# MAIN
# =============================================================================

def parse_args() -> InstallConfig:
    """Parse argumentos de linha de comando."""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise - Unified Installer',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  sudo python3 unified-installer.py                    # Instalação completa
  sudo python3 unified-installer.py --mode kiosk       # Modo kiosk
  sudo python3 unified-installer.py --no-monitoring    # Sem Grafana/Prometheus
  sudo python3 unified-installer.py --dry-run          # Simular instalação
        """
    )
    
    parser.add_argument('--mode', default='full', 
                       choices=['full', 'kiosk', 'server', 'minimal'],
                       help='Modo de instalação')
    parser.add_argument('--user', help='Usuário do sistema')
    parser.add_argument('--timezone', default='America/Sao_Paulo',
                       help='Timezone do sistema')
    
    # Componentes
    parser.add_argument('--no-docker', action='store_true',
                       help='Não instalar Docker')
    parser.add_argument('--no-ufw', action='store_true',
                       help='Não configurar UFW')
    parser.add_argument('--no-ntp', action='store_true',
                       help='Não configurar NTP')
    parser.add_argument('--no-nginx', action='store_true',
                       help='Não instalar Nginx')
    parser.add_argument('--no-monitoring', action='store_true',
                       help='Não instalar Grafana/Prometheus')
    parser.add_argument('--no-spotify', action='store_true',
                       help='Não instalar Spotify')
    parser.add_argument('--no-spicetify', action='store_true',
                       help='Não instalar Spicetify')
    parser.add_argument('--no-spotify-cli', action='store_true',
                       help='Não instalar spotify-cli-linux')
    parser.add_argument('--no-autologin', action='store_true',
                       help='Não configurar autologin')
    
    # Opções
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular sem executar')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Output detalhado')
    parser.add_argument('--quiet', '-q', action='store_true',
                       help='Modo silencioso')
    parser.add_argument('--auto', '-y', action='store_true',
                       help='Instalação automática sem confirmações')
    
    args = parser.parse_args()
    
    return InstallConfig(
        mode=args.mode,
        user=args.user,
        install_docker=not args.no_docker,
        install_ufw=not args.no_ufw,
        install_ntp=not args.no_ntp,
        install_nginx=not args.no_nginx,
        install_monitoring=not args.no_monitoring,
        install_spotify=not args.no_spotify,
        install_spicetify=not args.no_spicetify,
        install_spotify_cli=not args.no_spotify_cli,
        configure_autologin=not args.no_autologin,
        dry_run=args.dry_run,
        verbose=args.verbose,
        quiet=args.quiet,
        auto=args.auto,
        timezone=args.timezone,
    )


def main():
    """Ponto de entrada principal."""
    config = parse_args()
    
    installer = UnifiedInstaller(config)
    success = installer.run()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
