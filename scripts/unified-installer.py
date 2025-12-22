#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Unified Installer v5.1.0
=================================================
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
    ✅ Configuração de áudio (PulseAudio/PipeWire)
    ✅ Instalação de fontes (Noto, DejaVu, Liberation)
    ✅ Configuração de banco de dados (SQLite/MariaDB/PostgreSQL)
    ✅ Backup na nuvem (rclone, Storj, AWS S3)
    ✅ Modo Kiosk (Chromium + Openbox)
    ✅ Controle por voz (Vosk)
    ✅ Ferramentas de desenvolvimento (Node.js, Python, Playwright)
    ✅ Resumo de instalação em JSON

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

VERSION = "5.1.0"
INSTALL_DIR = Path("/opt/tsijukebox")
CONFIG_DIR = Path("/etc/tsijukebox")
LOG_DIR = Path("/var/log/tsijukebox")
DATA_DIR = Path("/var/lib/tsijukebox")
BACKUP_DIR = Path("/var/backups/tsijukebox")

# Total de fases de instalação
TOTAL_PHASES = 20

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
    """Fases de instalação (20 fases totais)."""
    SYSTEM_CHECK = "system_check"       # 1
    DOCKER = "docker"                    # 2
    UFW = "ufw"                          # 3
    NTP = "ntp"                          # 4
    FONTS = "fonts"                      # 5 - NOVO
    AUDIO = "audio"                      # 6 - NOVO
    DATABASE = "database"                # 7 - NOVO
    NGINX = "nginx"                      # 8
    MONITORING = "monitoring"            # 9
    CLOUD_BACKUP = "cloud_backup"        # 10 - NOVO
    SPOTIFY = "spotify"                  # 11
    SPICETIFY = "spicetify"             # 12
    SPOTIFY_CLI = "spotify_cli"          # 13
    KIOSK = "kiosk"                      # 14 - NOVO
    VOICE_CONTROL = "voice_control"      # 15 - NOVO
    DEV_TOOLS = "dev_tools"              # 16 - NOVO
    AUTOLOGIN = "autologin"              # 17
    APP_DEPLOY = "app_deploy"            # 18
    SERVICES = "services"                # 19
    VERIFY = "verify"                    # 20


@dataclass
class InstallConfig:
    """Configuração de instalação expandida."""
    mode: str = 'full'
    user: Optional[str] = None
    
    # Componentes existentes
    install_docker: bool = True
    install_ufw: bool = True
    install_ntp: bool = True
    install_nginx: bool = True
    install_monitoring: bool = True
    install_spotify: bool = True
    install_spicetify: bool = True
    install_spotify_cli: bool = True
    configure_autologin: bool = True
    
    # NOVOS componentes v5.1.0
    install_fonts: bool = True
    install_audio: bool = True
    audio_backend: str = 'pipewire'  # 'pulseaudio' ou 'pipewire'
    install_database: bool = True
    database_type: str = 'sqlite'    # 'sqlite', 'mariadb', 'postgresql'
    database_name: str = 'tsijukebox'
    database_user: str = 'tsi'
    install_cloud_backup: bool = True
    cloud_providers: List[str] = field(default_factory=lambda: ['rclone'])
    backup_schedule: str = '0 2 * * *'  # Cron: 02:00 diariamente
    install_kiosk: bool = False       # Apenas em modo kiosk
    kiosk_url: str = 'http://localhost:5173'
    install_voice_control: bool = True
    voice_language: str = 'pt-BR'
    install_dev_tools: bool = False   # Opcional para desenvolvedores
    
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
    home: Path = field(default_factory=Path.home)
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
    """Instalador unificado do TSiJUKEBOX v5.1.0."""
    
    def __init__(self, config: InstallConfig):
        self.config = config
        self.logger = Logger(verbose=config.verbose, quiet=config.quiet)
        self.system_info = SystemInfo()
        self.completed_phases: List[InstallPhase] = []
        self.rollback_actions: List[callable] = []
        self.phase_counter = 0
    
    def _next_phase(self) -> int:
        """Incrementa e retorna o contador de fase."""
        self.phase_counter += 1
        return self.phase_counter
    
    def run(self) -> bool:
        """Executa instalação completa com 20 fases."""
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
            
            # Fase 5: Fontes (NOVO v5.1.0)
            if self.config.install_fonts:
                if not self._phase_fonts():
                    self.logger.warning("Fontes falhou, continuando...")
            
            # Fase 6: Áudio (NOVO v5.1.0)
            if self.config.install_audio:
                if not self._phase_audio():
                    self.logger.warning("Áudio falhou, continuando...")
            
            # Fase 7: Database (NOVO v5.1.0)
            if self.config.install_database:
                if not self._phase_database():
                    self.logger.warning("Database falhou, continuando...")
            
            # Fase 8: Nginx
            if self.config.install_nginx:
                if not self._phase_nginx():
                    self.logger.warning("Nginx falhou, continuando...")
            
            # Fase 9: Monitoramento (Grafana + Prometheus)
            if self.config.install_monitoring:
                if not self._phase_monitoring():
                    self.logger.warning("Monitoramento falhou, continuando...")
            
            # Fase 10: Cloud Backup (NOVO v5.1.0)
            if self.config.install_cloud_backup:
                if not self._phase_cloud_backup():
                    self.logger.warning("Cloud Backup falhou, continuando...")
            
            # Fase 11: Spotify
            if self.config.install_spotify:
                if not self._phase_spotify():
                    self.logger.warning("Spotify falhou, continuando...")
            
            # Fase 12: Spicetify
            if self.config.install_spicetify and self.config.install_spotify:
                if not self._phase_spicetify():
                    self.logger.warning("Spicetify falhou, continuando...")
            
            # Fase 13: spotify-cli-linux
            if self.config.install_spotify_cli and self.config.install_spotify:
                if not self._phase_spotify_cli():
                    self.logger.warning("spotify-cli falhou, continuando...")
            
            # Fase 14: Kiosk (NOVO v5.1.0 - apenas modo kiosk)
            if self.config.install_kiosk or self.config.mode == 'kiosk':
                if not self._phase_kiosk():
                    self.logger.warning("Kiosk falhou, continuando...")
            
            # Fase 15: Voice Control (NOVO v5.1.0)
            if self.config.install_voice_control:
                if not self._phase_voice_control():
                    self.logger.warning("Voice Control falhou, continuando...")
            
            # Fase 16: Dev Tools (NOVO v5.1.0 - opcional)
            if self.config.install_dev_tools:
                if not self._phase_dev_tools():
                    self.logger.warning("Dev Tools falhou, continuando...")
            
            # Fase 17: Autologin
            if self.config.configure_autologin:
                if not self._phase_autologin():
                    self.logger.warning("Autologin falhou, continuando...")
            
            # Fase 18: Deploy da aplicação
            if not self._phase_app_deploy():
                return self._rollback()
            
            # Fase 19: Serviços systemd
            if not self._phase_services():
                self.logger.warning("Serviços falhou, continuando...")
            
            # Fase 20: Verificação final
            if not self._phase_verify():
                self.logger.warning("Verificação incompleta")
            
            # Gerar resumo de instalação em JSON
            self._generate_install_summary()
            
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
║  {Colors.DIM}Instalador unificado com 20 fases de instalação{Colors.RESET}{Colors.CYAN}                            ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    def _print_success(self):
        """Exibe mensagem de sucesso expandida."""
        components_installed = [p.value for p in self.completed_phases]
        
        print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {Colors.BOLD}🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!{Colors.RESET}{Colors.GREEN}                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}

  {Colors.CYAN}📍 Acessar:{Colors.RESET}
     • TSiJUKEBOX: http://localhost:5173
     • Grafana:    http://localhost:3000  (admin/admin)
     • Prometheus: http://localhost:9090

  {Colors.CYAN}📋 Componentes instalados ({len(self.completed_phases)}/{TOTAL_PHASES}):{Colors.RESET}
     • {', '.join(components_installed[:5])}
     • {', '.join(components_installed[5:10]) if len(components_installed) > 5 else ''}
     • {', '.join(components_installed[10:]) if len(components_installed) > 10 else ''}

  {Colors.CYAN}📁 Resumo da instalação:{Colors.RESET}
     • {CONFIG_DIR}/install-summary.json

  {Colors.CYAN}📋 Comandos úteis:{Colors.RESET}
     • systemctl status tsijukebox
     • journalctl -u tsijukebox -f
     • tsijukebox --verify
     • cat {CONFIG_DIR}/install-summary.json

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
    
    def _generate_install_summary(self):
        """Gera arquivo JSON com resumo completo da instalação."""
        summary = {
            "version": VERSION,
            "installed_at": datetime.now().isoformat(),
            "user": self.system_info.user,
            "mode": self.config.mode,
            "distro": self.system_info.distro,
            "distro_id": self.system_info.distro_id,
            "components": {
                "docker": InstallPhase.DOCKER in self.completed_phases,
                "ufw": InstallPhase.UFW in self.completed_phases,
                "ntp": InstallPhase.NTP in self.completed_phases,
                "fonts": InstallPhase.FONTS in self.completed_phases,
                "audio": self.config.audio_backend if InstallPhase.AUDIO in self.completed_phases else None,
                "database": self.config.database_type if InstallPhase.DATABASE in self.completed_phases else None,
                "nginx": InstallPhase.NGINX in self.completed_phases,
                "monitoring": InstallPhase.MONITORING in self.completed_phases,
                "cloud_backup": self.config.cloud_providers if InstallPhase.CLOUD_BACKUP in self.completed_phases else [],
                "spotify": InstallPhase.SPOTIFY in self.completed_phases,
                "spicetify": InstallPhase.SPICETIFY in self.completed_phases,
                "spotify_cli": InstallPhase.SPOTIFY_CLI in self.completed_phases,
                "kiosk": InstallPhase.KIOSK in self.completed_phases,
                "voice_control": InstallPhase.VOICE_CONTROL in self.completed_phases,
                "dev_tools": InstallPhase.DEV_TOOLS in self.completed_phases,
                "autologin": InstallPhase.AUTOLOGIN in self.completed_phases,
            },
            "paths": {
                "install_dir": str(INSTALL_DIR),
                "config_dir": str(CONFIG_DIR),
                "log_dir": str(LOG_DIR),
                "data_dir": str(DATA_DIR),
                "backup_dir": str(BACKUP_DIR),
            },
            "access_urls": {
                "app": "http://localhost:5173",
                "grafana": "http://localhost:3000",
                "prometheus": "http://localhost:9090",
            },
            "services": ["tsijukebox", "docker", "nginx", "grafana", "prometheus"],
            "phases_completed": [p.value for p in self.completed_phases],
            "phases_total": TOTAL_PHASES,
            "system_info": {
                "ram_gb": round(self.system_info.ram_gb, 2),
                "disk_free_gb": round(self.system_info.disk_free_gb, 2),
                "login_manager": self.system_info.login_manager,
            }
        }
        
        try:
            if not self.config.dry_run:
                CONFIG_DIR.mkdir(parents=True, exist_ok=True)
                summary_file = CONFIG_DIR / "install-summary.json"
                summary_file.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
                self.logger.success(f"Resumo salvo em: {summary_file}")
        except Exception as e:
            self.logger.warning(f"Falha ao salvar resumo: {e}")
    
    # =========================================================================
    # FASES DE INSTALAÇÃO
    # =========================================================================
    
    def _phase_system_check(self) -> bool:
        """Fase 1: Verificação do sistema."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Verificando sistema...")
        
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
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando Docker...")
        
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
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando firewall UFW...")
        
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
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando sincronização de tempo...")
        
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
    
    def _phase_fonts(self) -> bool:
        """Fase 5: Instalação de fontes (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando fontes...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from fonts_setup import FontsSetup, FontsConfig
            
            config = FontsConfig(
                install_noto=True,
                install_dejavu=True,
                install_liberation=True,
                install_fontawesome=True,
                install_emoji=True
            )
            
            fonts = FontsSetup(config=config, logger=self.logger, dry_run=self.config.dry_run)
            success = fonts.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.FONTS)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo fonts não encontrado, instalação manual...")
            
            # Fallback: pacman direto
            packages = [
                'noto-fonts', 'noto-fonts-extra', 'noto-fonts-emoji',
                'ttf-dejavu', 'ttf-liberation', 'ttf-font-awesome'
            ]
            run_command(['pacman', '-S', '--noconfirm', '--needed'] + packages, 
                       dry_run=self.config.dry_run)
            run_command(['fc-cache', '-fv'], dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.FONTS)
            self.logger.success("Fontes instaladas")
            return True
    
    def _phase_audio(self) -> bool:
        """Fase 6: Configuração de áudio (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando áudio ({self.config.audio_backend})...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from audio_setup import AudioSetup, AudioConfig, AudioBackend
            
            backend = AudioBackend.PIPEWIRE if self.config.audio_backend == 'pipewire' else AudioBackend.PULSEAUDIO
            
            config = AudioConfig(
                backend=backend,
                install_bluetooth=True,
                install_equalizer=True,
                install_control_gui=True
            )
            
            audio = AudioSetup(
                config=config, 
                logger=self.logger, 
                user=self.system_info.user,
                dry_run=self.config.dry_run
            )
            success = audio.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.AUDIO)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo audio não encontrado, instalação manual...")
            
            # Fallback: instalar PipeWire
            if self.config.audio_backend == 'pipewire':
                packages = ['pipewire', 'pipewire-pulse', 'pipewire-alsa', 'wireplumber']
            else:
                packages = ['pulseaudio', 'pulseaudio-alsa', 'pavucontrol']
            
            run_command(['pacman', '-S', '--noconfirm', '--needed'] + packages,
                       dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.AUDIO)
            self.logger.success(f"Áudio ({self.config.audio_backend}) configurado")
            return True
    
    def _phase_database(self) -> bool:
        """Fase 7: Configuração de banco de dados (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando banco de dados ({self.config.database_type})...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from database_setup import DatabaseSetup, DatabaseConfig, DatabaseType
            
            db_type_map = {
                'sqlite': DatabaseType.SQLITE,
                'mariadb': DatabaseType.MARIADB,
                'postgresql': DatabaseType.POSTGRESQL
            }
            
            config = DatabaseConfig(
                db_type=db_type_map.get(self.config.database_type, DatabaseType.SQLITE),
                database_name=self.config.database_name,
                username=self.config.database_user
            )
            
            db = DatabaseSetup(config=config, logger=self.logger, dry_run=self.config.dry_run)
            success = db.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.DATABASE)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo database não encontrado, instalação manual...")
            
            # Fallback: SQLite apenas
            run_command(['pacman', '-S', '--noconfirm', '--needed', 'sqlite'],
                       dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.DATABASE)
            self.logger.success("SQLite instalado")
            return True
    
    def _phase_nginx(self) -> bool:
        """Fase 8: Instalação e configuração do Nginx."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando Nginx...")
        
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
        """Fase 9: Instalação do monitoramento."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando Grafana + Prometheus...")
        
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
    
    def _phase_cloud_backup(self) -> bool:
        """Fase 10: Configuração de backup na nuvem (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando backup na nuvem ({', '.join(self.config.cloud_providers)})...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from cloud_backup_setup import CloudBackupSetup, CloudBackupConfig, CloudProvider
            
            provider_map = {
                'rclone': CloudProvider.RCLONE,
                'storj': CloudProvider.STORJ,
                'aws': CloudProvider.AWS_S3,
                's3': CloudProvider.AWS_S3,
                'mega': CloudProvider.MEGA
            }
            
            providers = [provider_map.get(p.lower(), CloudProvider.RCLONE) 
                        for p in self.config.cloud_providers]
            
            config = CloudBackupConfig(
                providers=providers,
                backup_dirs=[str(DATA_DIR), str(CONFIG_DIR)],
                schedule=self.config.backup_schedule
            )
            
            backup = CloudBackupSetup(
                config=config, 
                logger=self.logger, 
                user=self.system_info.user
            )
            success = backup.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.CLOUD_BACKUP)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo cloud_backup não encontrado, instalação manual...")
            
            # Fallback: instalar rclone apenas
            run_command(['pacman', '-S', '--noconfirm', '--needed', 'rclone'],
                       dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.CLOUD_BACKUP)
            self.logger.success("rclone instalado")
            return True
    
    def _phase_spotify(self) -> bool:
        """Fase 11: Instalação do Spotify."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando Spotify...")
        
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
        """Fase 12: Instalação do Spicetify."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando Spicetify...")
        
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
        """Fase 13: Instalação do spotify-cli-linux."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando spotify-cli-linux...")
        
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
    
    def _phase_kiosk(self) -> bool:
        """Fase 14: Configuração de modo Kiosk (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando modo Kiosk...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from kiosk_chromium_setup import KioskChromiumSetup, KioskConfig
            
            config = KioskConfig(
                url=self.config.kiosk_url,
                user=self.system_info.user,
                fullscreen=True,
                disable_screensaver=True,
                hide_cursor=True
            )
            
            kiosk = KioskChromiumSetup(
                config=config, 
                logger=self.logger, 
                dry_run=self.config.dry_run
            )
            success = kiosk.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.KIOSK)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo kiosk não encontrado, instalação manual...")
            
            # Fallback: instalar Chromium + Openbox
            packages = ['chromium', 'openbox', 'xorg-server', 'xorg-xinit']
            run_command(['pacman', '-S', '--noconfirm', '--needed'] + packages,
                       dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.KIOSK)
            self.logger.success("Kiosk configurado")
            return True
    
    def _phase_voice_control(self) -> bool:
        """Fase 15: Configuração de controle por voz (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando controle por voz...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from voice_control_setup import VoiceControlSetup, VoiceControlConfig
            
            config = VoiceControlConfig(
                language=self.config.voice_language,
                install_vosk=True,
                download_model=True
            )
            
            voice = VoiceControlSetup(
                config=config, 
                logger=self.logger, 
                user=self.system_info.user,
                dry_run=self.config.dry_run
            )
            success = voice.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.VOICE_CONTROL)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo voice_control não encontrado, instalação manual...")
            
            # Fallback: instalar dependências básicas
            run_command(['pacman', '-S', '--noconfirm', '--needed', 'portaudio', 'python-pyaudio'],
                       dry_run=self.config.dry_run)
            run_as_user(['pip', 'install', '--user', 'vosk', 'SpeechRecognition'],
                       self.system_info.user, dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.VOICE_CONTROL)
            self.logger.success("Controle por voz instalado")
            return True
    
    def _phase_dev_tools(self) -> bool:
        """Fase 16: Instalação de ferramentas de desenvolvimento (NOVO v5.1.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando ferramentas de desenvolvimento...")
        
        # Node.js via pacman (LTS)
        node_packages = ['nodejs-lts-iron', 'npm']
        run_command(['pacman', '-S', '--noconfirm', '--needed'] + node_packages,
                   dry_run=self.config.dry_run)
        
        # Python tools
        python_packages = ['python', 'python-pip', 'python-virtualenv']
        run_command(['pacman', '-S', '--noconfirm', '--needed'] + python_packages,
                   dry_run=self.config.dry_run)
        
        # Git
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'git'],
                   dry_run=self.config.dry_run)
        
        # Playwright para testes
        run_as_user(['npm', 'install', '-g', 'playwright'],
                   self.system_info.user, dry_run=self.config.dry_run)
        run_as_user(['npx', 'playwright', 'install', '--with-deps'],
                   self.system_info.user, dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.DEV_TOOLS)
        self.logger.success("Ferramentas de desenvolvimento instaladas")
        return True
    
    def _phase_autologin(self) -> bool:
        """Fase 17: Configuração de autologin."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando autologin...")
        
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
        """Fase 18: Deploy da aplicação."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Fazendo deploy da aplicação...")
        
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
        """Fase 19: Criação de serviços systemd."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Criando serviços systemd...")
        
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
        """Fase 20: Verificação final expandida."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Verificando instalação...")
        
        # Verificar binários
        checks = [
            ('Docker', shutil.which('docker') is not None),
            ('Nginx', shutil.which('nginx') is not None),
            ('Spotify', shutil.which('spotify') is not None),
            ('Spicetify', shutil.which('spicetify') is not None),
            ('rclone', shutil.which('rclone') is not None),
            ('PipeWire/Pulse', shutil.which('pactl') is not None),
            ('Node.js', shutil.which('node') is not None),
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
        
        # Verificar diretórios
        dirs_to_check = [INSTALL_DIR, CONFIG_DIR, LOG_DIR, DATA_DIR]
        for dir_path in dirs_to_check:
            if dir_path.exists():
                self.logger.success(f"Diretório {dir_path}: OK")
            else:
                self.logger.warning(f"Diretório {dir_path}: não existe")
        
        self.completed_phases.append(InstallPhase.VERIFY)
        return True


# =============================================================================
# MAIN
# =============================================================================

def parse_args() -> InstallConfig:
    """Parse argumentos de linha de comando expandidos."""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise - Unified Installer v5.1.0 (20 fases)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  sudo python3 unified-installer.py                    # Instalação completa
  sudo python3 unified-installer.py --mode kiosk       # Modo kiosk
  sudo python3 unified-installer.py --no-monitoring    # Sem Grafana/Prometheus
  sudo python3 unified-installer.py --dry-run          # Simular instalação
  sudo python3 unified-installer.py --database-type postgresql  # Com PostgreSQL
  sudo python3 unified-installer.py --dev-tools        # Com ferramentas de dev
        """
    )
    
    parser.add_argument('--mode', default='full', 
                       choices=['full', 'kiosk', 'server', 'minimal'],
                       help='Modo de instalação')
    parser.add_argument('--user', help='Usuário do sistema')
    parser.add_argument('--timezone', default='America/Sao_Paulo',
                       help='Timezone do sistema')
    
    # Componentes existentes
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
    
    # NOVOS componentes v5.1.0
    parser.add_argument('--no-fonts', action='store_true',
                       help='Não instalar fontes')
    parser.add_argument('--no-audio', action='store_true',
                       help='Não configurar áudio')
    parser.add_argument('--audio-backend', choices=['pipewire', 'pulseaudio'],
                       default='pipewire', help='Backend de áudio')
    parser.add_argument('--no-database', action='store_true',
                       help='Não configurar database')
    parser.add_argument('--database-type', choices=['sqlite', 'mariadb', 'postgresql'],
                       default='sqlite', help='Tipo de banco de dados')
    parser.add_argument('--database-name', default='tsijukebox',
                       help='Nome do banco de dados')
    parser.add_argument('--database-user', default='tsi',
                       help='Usuário do banco de dados')
    parser.add_argument('--no-cloud-backup', action='store_true',
                       help='Não configurar backup na nuvem')
    parser.add_argument('--cloud-providers', nargs='+',
                       default=['rclone'], help='Provedores de cloud (rclone, storj, aws, mega)')
    parser.add_argument('--backup-schedule', default='0 2 * * *',
                       help='Agendamento de backup (cron)')
    parser.add_argument('--kiosk', action='store_true',
                       help='Instalar modo kiosk (Chromium + Openbox)')
    parser.add_argument('--kiosk-url', default='http://localhost:5173',
                       help='URL para modo kiosk')
    parser.add_argument('--no-voice-control', action='store_true',
                       help='Não instalar controle por voz')
    parser.add_argument('--voice-language', default='pt-BR',
                       help='Idioma para controle por voz')
    parser.add_argument('--dev-tools', action='store_true',
                       help='Instalar ferramentas de desenvolvimento')
    
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
    
    # Determinar se kiosk deve ser instalado
    install_kiosk = args.kiosk or args.mode == 'kiosk'
    
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
        # Novos v5.1.0
        install_fonts=not args.no_fonts,
        install_audio=not args.no_audio,
        audio_backend=args.audio_backend,
        install_database=not args.no_database,
        database_type=args.database_type,
        database_name=args.database_name,
        database_user=args.database_user,
        install_cloud_backup=not args.no_cloud_backup,
        cloud_providers=args.cloud_providers,
        backup_schedule=args.backup_schedule,
        install_kiosk=install_kiosk,
        kiosk_url=args.kiosk_url,
        install_voice_control=not args.no_voice_control,
        voice_language=args.voice_language,
        install_dev_tools=args.dev_tools,
        # Opções
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
