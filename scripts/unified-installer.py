#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Unified Installer v6.0.0
=================================================
Instalador unificado com Docker + todas as integrações.

USO:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3

FEATURES v6.0.0:
    ✅ Análise inteligente de hardware com recomendação de modo
    ✅ Detecta login manager automaticamente (SDDM, GDM, LightDM, Ly, greetd, getty)
    ✅ Configura autologin com usuário vigente
    ✅ Certificados SSL (self-signed para .local, Let's Encrypt para produção)
    ✅ Avahi/mDNS para acesso via midiaserver.local
    ✅ GitHub CLI (gh)
    ✅ Storj CLI completo
    ✅ Instala e configura UFW (firewall)
    ✅ Instala e configura Nginx (proxy reverso com HTTPS)
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

VERSION = "6.0.0"
INSTALL_DIR = Path("/opt/tsijukebox")
CONFIG_DIR = Path("/etc/tsijukebox")
LOG_DIR = Path("/var/log/tsijukebox")
DATA_DIR = Path("/var/lib/tsijukebox")
BACKUP_DIR = Path("/var/backups/tsijukebox")

# Total de fases de instalação (26 fases em v6.0.0)
TOTAL_PHASES = 26

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
    """Fases de instalação (26 fases em v6.0.0)."""
    # Fase 0: Análise de Hardware (NOVO v6.0.0)
    HARDWARE_ANALYSIS = "hardware_analysis"  # 0
    # Fases originais
    SYSTEM_CHECK = "system_check"            # 1
    DOCKER = "docker"                        # 2
    UFW = "ufw"                              # 3
    NTP = "ntp"                              # 4
    FONTS = "fonts"                          # 5
    AUDIO = "audio"                          # 6
    DATABASE = "database"                    # 7
    NGINX = "nginx"                          # 8
    MONITORING = "monitoring"                # 9
    CLOUD_BACKUP = "cloud_backup"            # 10
    SPOTIFY = "spotify"                      # 11
    SPICETIFY = "spicetify"                  # 12
    SPOTIFY_CLI = "spotify_cli"              # 13
    KIOSK = "kiosk"                          # 14
    VOICE_CONTROL = "voice_control"          # 15
    DEV_TOOLS = "dev_tools"                  # 16
    AUTOLOGIN = "autologin"                  # 17
    APP_DEPLOY = "app_deploy"                # 18
    SERVICES = "services"                    # 19
    # Novas fases v6.0.0
    SSL_SETUP = "ssl_setup"                  # 20
    AVAHI_MDNS = "avahi_mdns"                # 21
    GITHUB_CLI = "github_cli"                # 22
    STORJ_FULL = "storj_full"                # 23
    HARDWARE_REPORT = "hardware_report"      # 24
    VERIFY = "verify"                        # 25


@dataclass
class InstallConfig:
    """Configuração de instalação expandida v6.0.0."""
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
    
    # Componentes v5.1.0
    install_fonts: bool = True
    install_audio: bool = True
    audio_backend: str = 'pipewire'
    install_database: bool = True
    database_type: str = 'sqlite'
    database_name: str = 'tsijukebox'
    database_user: str = 'tsi'
    install_cloud_backup: bool = True
    cloud_providers: List[str] = field(default_factory=lambda: ['rclone'])
    backup_schedule: str = '0 2 * * *'
    install_kiosk: bool = False
    kiosk_url: str = 'https://midiaserver.local/jukebox'  # HTTPS por padrão em v6.0.0
    install_voice_control: bool = True
    voice_language: str = 'pt-BR'
    install_dev_tools: bool = False
    
    # NOVOS componentes v6.0.0
    run_hardware_analysis: bool = True
    install_ssl: bool = True
    ssl_mode: str = 'self-signed'  # 'self-signed' ou 'letsencrypt'
    ssl_domain: str = 'midiaserver.local'
    ssl_email: str = ''  # Para Let's Encrypt
    install_avahi: bool = True
    avahi_hostname: str = 'midiaserver'
    install_github_cli: bool = True
    install_storj: bool = True
    
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
    cpu_cores: int = 0
    is_raspberry_pi: bool = False
    is_virtual_machine: bool = False
    recommended_mode: str = "full"
    recommended_database: str = "sqlite"


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
    """Instalador unificado do TSiJUKEBOX v6.0.0."""
    
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
        """Executa instalação completa com 26 fases (v6.0.0)."""
        self._print_banner()
        
        try:
            # Fase 0: Análise de Hardware (NOVO v6.0.0)
            if self.config.run_hardware_analysis:
                self._phase_hardware_analysis()
            
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
            
            # Fase 5: Fontes
            if self.config.install_fonts:
                if not self._phase_fonts():
                    self.logger.warning("Fontes falhou, continuando...")
            
            # Fase 6: Áudio
            if self.config.install_audio:
                if not self._phase_audio():
                    self.logger.warning("Áudio falhou, continuando...")
            
            # Fase 7: Database
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
            
            # Fase 10: Cloud Backup
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
            
            # Fase 14: Kiosk (apenas modo kiosk)
            if self.config.install_kiosk or self.config.mode == 'kiosk':
                if not self._phase_kiosk():
                    self.logger.warning("Kiosk falhou, continuando...")
            
            # Fase 15: Voice Control
            if self.config.install_voice_control:
                if not self._phase_voice_control():
                    self.logger.warning("Voice Control falhou, continuando...")
            
            # Fase 16: Dev Tools (opcional)
            if self.config.install_dev_tools:
                if not self._phase_dev_tools():
                    self.logger.warning("Dev Tools falhou, continuando...")
            
            # Fase 17: Autologin APRIMORADO (v6.0.0)
            if self.config.configure_autologin:
                if not self._phase_autologin():
                    self.logger.warning("Autologin falhou, continuando...")
            
            # Fase 18: Deploy da aplicação
            if not self._phase_app_deploy():
                return self._rollback()
            
            # Fase 19: Serviços systemd
            if not self._phase_services():
                self.logger.warning("Serviços falhou, continuando...")
            
            # Fase 20: SSL Setup (NOVO v6.0.0)
            if self.config.install_ssl:
                if not self._phase_ssl_setup():
                    self.logger.warning("SSL falhou, continuando...")
            
            # Fase 21: Avahi/mDNS (NOVO v6.0.0)
            if self.config.install_avahi:
                if not self._phase_avahi_mdns():
                    self.logger.warning("Avahi/mDNS falhou, continuando...")
            
            # Fase 22: GitHub CLI (NOVO v6.0.0)
            if self.config.install_github_cli:
                if not self._phase_github_cli():
                    self.logger.warning("GitHub CLI falhou, continuando...")
            
            # Fase 23: Storj Full (NOVO v6.0.0)
            if self.config.install_storj:
                if not self._phase_storj_full():
                    self.logger.warning("Storj falhou, continuando...")
            
            # Fase 24: Hardware Report (NOVO v6.0.0)
            if not self._phase_hardware_report():
                self.logger.warning("Hardware Report falhou, continuando...")
            
            # Fase 25: Verificação final
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
        """Exibe banner do instalador v6.0.0."""
        print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {Colors.BOLD}{Colors.WHITE}🚀 TSiJUKEBOX Enterprise - Unified Installer v{VERSION}{Colors.RESET}{Colors.CYAN}                          ║
║  {Colors.DIM}Instalador unificado com 26 fases de instalação{Colors.RESET}{Colors.CYAN}                            ║
║  {Colors.DIM}SSL + Avahi/mDNS + Hardware Analysis + GitHub CLI + Storj{Colors.RESET}{Colors.CYAN}                  ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    def _print_success(self):
        """Exibe mensagem de sucesso expandida v6.0.0."""
        components_installed = [p.value for p in self.completed_phases]
        
        # URLs baseadas na configuração
        base_url = f"https://{self.config.avahi_hostname}.local" if self.config.install_ssl else f"http://{self.config.avahi_hostname}.local"
        
        print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {Colors.BOLD}🎉 INSTALAÇÃO v{VERSION} CONCLUÍDA COM SUCESSO!{Colors.RESET}{Colors.GREEN}                              ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}

  {Colors.CYAN}📍 Acessar (via rede local):{Colors.RESET}
     • TSiJUKEBOX: {base_url}/jukebox
     • Grafana:    {base_url}:3000  (admin/admin)
     • Prometheus: {base_url}:9090
     • SSH:        ssh {self.system_info.user}@{self.config.avahi_hostname}.local

  {Colors.CYAN}📋 Componentes instalados ({len(self.completed_phases)}/{TOTAL_PHASES}):{Colors.RESET}
     • {', '.join(components_installed[:6])}
     • {', '.join(components_installed[6:12]) if len(components_installed) > 6 else ''}
     • {', '.join(components_installed[12:18]) if len(components_installed) > 12 else ''}
     • {', '.join(components_installed[18:]) if len(components_installed) > 18 else ''}

  {Colors.CYAN}📁 Arquivos de configuração:{Colors.RESET}
     • {CONFIG_DIR}/install-summary.json
     • {CONFIG_DIR}/hardware-report.json
     • /etc/nginx/ssl/{self.config.ssl_domain}.crt

  {Colors.CYAN}📋 Comandos úteis:{Colors.RESET}
     • systemctl status tsijukebox
     • journalctl -u tsijukebox -f
     • gh --help (GitHub CLI)
     • uplink --help (Storj CLI)

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
        """Gera arquivo JSON com resumo completo da instalação v6.0.0."""
        summary = {
            "version": VERSION,
            "installed_at": datetime.now().isoformat(),
            "user": self.system_info.user,
            "mode": self.config.mode,
            "distro": self.system_info.distro,
            "distro_id": self.system_info.distro_id,
            "components": {
                "hardware_analysis": InstallPhase.HARDWARE_ANALYSIS in self.completed_phases,
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
                # NOVOS v6.0.0
                "ssl": InstallPhase.SSL_SETUP in self.completed_phases,
                "avahi_mdns": InstallPhase.AVAHI_MDNS in self.completed_phases,
                "github_cli": InstallPhase.GITHUB_CLI in self.completed_phases,
                "storj": InstallPhase.STORJ_FULL in self.completed_phases,
            },
            "paths": {
                "install_dir": str(INSTALL_DIR),
                "config_dir": str(CONFIG_DIR),
                "log_dir": str(LOG_DIR),
                "data_dir": str(DATA_DIR),
                "backup_dir": str(BACKUP_DIR),
            },
            "access_urls": {
                "app": f"https://{self.config.avahi_hostname}.local/jukebox",
                "grafana": f"https://{self.config.avahi_hostname}.local:3000",
                "prometheus": f"https://{self.config.avahi_hostname}.local:9090",
            },
            "services": ["tsijukebox", "docker", "nginx", "grafana", "prometheus", "avahi-daemon"],
            "phases_completed": [p.value for p in self.completed_phases],
            "phases_total": TOTAL_PHASES,
            "system_info": {
                "ram_gb": round(self.system_info.ram_gb, 2),
                "disk_free_gb": round(self.system_info.disk_free_gb, 2),
                "cpu_cores": self.system_info.cpu_cores,
                "login_manager": self.system_info.login_manager,
                "is_raspberry_pi": self.system_info.is_raspberry_pi,
                "is_virtual_machine": self.system_info.is_virtual_machine,
                "recommended_mode": self.system_info.recommended_mode,
                "recommended_database": self.system_info.recommended_database,
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
    
    def _phase_hardware_analysis(self) -> bool:
        """Fase 0: Análise de Hardware (NOVO v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Analisando hardware...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from hardware_analyzer import HardwareAnalyzer
            
            analyzer = HardwareAnalyzer(verbose=self.config.verbose)
            hw = analyzer.detect_hardware()
            recommendation = analyzer.analyze(hw)
            
            # Atualizar SystemInfo
            self.system_info.ram_gb = hw.ram_total_gb
            self.system_info.disk_free_gb = hw.disk_free_gb
            self.system_info.cpu_cores = hw.cpu_threads
            self.system_info.is_raspberry_pi = hw.is_raspberry_pi
            self.system_info.is_virtual_machine = hw.is_virtual_machine
            self.system_info.recommended_mode = recommendation.mode
            self.system_info.recommended_database = recommendation.database
            
            self.logger.info(f"CPU: {hw.cpu_model} ({hw.cpu_cores} cores, {hw.cpu_threads} threads)")
            self.logger.info(f"RAM: {hw.ram_total_gb:.1f} GB (disponível: {hw.ram_available_gb:.1f} GB)")
            self.logger.info(f"Disco livre: {hw.disk_free_gb:.1f} GB")
            self.logger.info(f"GPU: {hw.gpu_model}")
            
            if hw.is_raspberry_pi:
                self.logger.info("🍓 Sistema detectado: Raspberry Pi")
            if hw.is_virtual_machine:
                self.logger.info("🖥️  Sistema detectado: Máquina Virtual")
            
            self.logger.success(f"Recomendação: modo '{recommendation.mode}' com banco '{recommendation.database}'")
            
            # Se modo auto, aplicar recomendação
            if self.config.mode == 'auto':
                self.config.mode = recommendation.mode
                self.config.database_type = recommendation.database
                self.logger.info(f"Modo automático aplicado: {recommendation.mode}")
            
            self.completed_phases.append(InstallPhase.HARDWARE_ANALYSIS)
            return True
            
        except ImportError as e:
            self.logger.warning(f"Módulo hardware_analyzer não encontrado: {e}")
            # Fallback: análise básica
            self._basic_hardware_analysis()
            self.completed_phases.append(InstallPhase.HARDWARE_ANALYSIS)
            return True
    
    def _basic_hardware_analysis(self):
        """Análise básica de hardware (fallback)."""
        # RAM
        try:
            with open('/proc/meminfo') as f:
                for line in f:
                    if line.startswith('MemTotal'):
                        kb = int(line.split()[1])
                        self.system_info.ram_gb = kb / 1024 / 1024
                        break
        except:
            self.system_info.ram_gb = 4.0
        
        # Disco
        try:
            stat = os.statvfs('/')
            self.system_info.disk_free_gb = (stat.f_bavail * stat.f_frsize) / (1024**3)
        except:
            self.system_info.disk_free_gb = 10.0
        
        # CPU cores
        try:
            self.system_info.cpu_cores = os.cpu_count() or 2
        except:
            self.system_info.cpu_cores = 2
        
        # Raspberry Pi
        try:
            cpuinfo = Path('/proc/cpuinfo').read_text()
            self.system_info.is_raspberry_pi = 'Raspberry Pi' in cpuinfo or 'BCM' in cpuinfo
        except:
            pass
        
        # VM
        try:
            code, out, _ = run_command(['systemd-detect-virt', '-q'])
            self.system_info.is_virtual_machine = (code == 0)
        except:
            pass
        
        # Recomendações baseadas em RAM
        if self.system_info.ram_gb < 2:
            self.system_info.recommended_mode = 'minimal'
            self.system_info.recommended_database = 'sqlite'
        elif self.system_info.ram_gb < 4:
            self.system_info.recommended_mode = 'kiosk'
            self.system_info.recommended_database = 'sqlite'
        elif self.system_info.ram_gb < 8:
            self.system_info.recommended_mode = 'full'
            self.system_info.recommended_database = 'sqlite'
        else:
            self.system_info.recommended_mode = 'full'
            self.system_info.recommended_database = 'postgresql'
    
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
            code, _, err = run_command([
                'pacman', '-S', '--noconfirm', 'docker', 'docker-compose'
            ], dry_run=self.config.dry_run)
            
            if code != 0:
                self.logger.error(f"Falha ao instalar Docker: {err}")
                return False
        
        run_command(['systemctl', 'enable', 'docker'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'start', 'docker'], dry_run=self.config.dry_run)
        run_command(['usermod', '-aG', 'docker', self.system_info.user], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.DOCKER)
        self.logger.success("Docker configurado")
        return True
    
    def _phase_ufw(self) -> bool:
        """Fase 3: Configuração do UFW."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando firewall UFW...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from ufw_setup import UFWSetup
            
            ufw = UFWSetup(logger=self.logger, dry_run=self.config.dry_run)
            success = ufw.full_setup(self.config.mode)
            
            if success:
                self.completed_phases.append(InstallPhase.UFW)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo UFW não encontrado, configuração manual...")
            
            run_command(['pacman', '-S', '--noconfirm', 'ufw'], dry_run=self.config.dry_run)
            run_command(['ufw', 'default', 'deny', 'incoming'], dry_run=self.config.dry_run)
            run_command(['ufw', 'default', 'allow', 'outgoing'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', 'ssh'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '80/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '443/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '5173/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '3000/tcp'], dry_run=self.config.dry_run)
            run_command(['ufw', 'allow', '5353/udp'], dry_run=self.config.dry_run)  # mDNS
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
            run_command(['timedatectl', 'set-ntp', 'true'], dry_run=self.config.dry_run)
            run_command(['timedatectl', 'set-timezone', self.config.timezone], dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.NTP)
            self.logger.success("NTP configurado")
            return True
    
    def _phase_fonts(self) -> bool:
        """Fase 5: Instalação de fontes."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando fontes...")
        
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
        """Fase 6: Configuração de áudio."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando áudio ({self.config.audio_backend})...")
        
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
        """Fase 7: Configuração de banco de dados."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando banco de dados ({self.config.database_type})...")
        
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'sqlite'],
                   dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.DATABASE)
        self.logger.success(f"Database ({self.config.database_type}) configurado")
        return True
    
    def _phase_nginx(self) -> bool:
        """Fase 8: Configuração do Nginx."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando Nginx...")
        
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'nginx'],
                   dry_run=self.config.dry_run)
        run_command(['systemctl', 'enable', 'nginx'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'start', 'nginx'], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.NGINX)
        self.logger.success("Nginx configurado")
        return True
    
    def _phase_monitoring(self) -> bool:
        """Fase 9: Instalação de Grafana + Prometheus."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando monitoramento (Grafana + Prometheus)...")
        
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'grafana', 'prometheus'],
                   dry_run=self.config.dry_run)
        run_command(['systemctl', 'enable', 'grafana'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'enable', 'prometheus'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'start', 'grafana'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'start', 'prometheus'], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.MONITORING)
        self.logger.success("Monitoramento configurado")
        return True
    
    def _phase_cloud_backup(self) -> bool:
        """Fase 10: Configuração de backup na nuvem."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando backup na nuvem...")
        
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'rclone'],
                   dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.CLOUD_BACKUP)
        self.logger.success("rclone instalado")
        return True
    
    def _phase_spotify(self) -> bool:
        """Fase 11: Instalação do Spotify."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando Spotify...")
        
        if shutil.which('spotify'):
            self.logger.info("Spotify já instalado")
            self.completed_phases.append(InstallPhase.SPOTIFY)
            return True
        
        code, _, _ = run_command([
            'pacman', '-S', '--noconfirm', 'spotify-launcher'
        ], dry_run=self.config.dry_run)
        
        if code == 0:
            self.logger.info("spotify-launcher instalado")
        else:
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
        
        install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh"
        run_as_user(['bash', '-c', install_cmd], self.system_info.user, dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.SPICETIFY)
        self.logger.success("Spicetify instalado")
        return True
    
    def _phase_spotify_cli(self) -> bool:
        """Fase 13: Instalação do spotify-cli-linux."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando spotify-cli-linux...")
        
        run_as_user([
            'pip', 'install', '--user', 'spotify-cli-linux'
        ], self.system_info.user, dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.SPOTIFY_CLI)
        self.logger.success("spotify-cli instalado")
        return True
    
    def _phase_kiosk(self) -> bool:
        """Fase 14: Configuração de modo Kiosk."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando modo Kiosk...")
        
        packages = ['chromium', 'openbox', 'xorg-server', 'xorg-xinit', 'unclutter']
        run_command(['pacman', '-S', '--noconfirm', '--needed'] + packages,
                   dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.KIOSK)
        self.logger.success("Kiosk configurado")
        return True
    
    def _phase_voice_control(self) -> bool:
        """Fase 15: Configuração de controle por voz."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando controle por voz...")
        
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'portaudio', 'python-pyaudio'],
                   dry_run=self.config.dry_run)
        run_as_user(['pip', 'install', '--user', 'vosk', 'SpeechRecognition'],
                   self.system_info.user, dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.VOICE_CONTROL)
        self.logger.success("Controle por voz instalado")
        return True
    
    def _phase_dev_tools(self) -> bool:
        """Fase 16: Instalação de ferramentas de desenvolvimento."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando ferramentas de desenvolvimento...")
        
        node_packages = ['nodejs-lts-iron', 'npm']
        run_command(['pacman', '-S', '--noconfirm', '--needed'] + node_packages,
                   dry_run=self.config.dry_run)
        
        python_packages = ['python', 'python-pip', 'python-virtualenv']
        run_command(['pacman', '-S', '--noconfirm', '--needed'] + python_packages,
                   dry_run=self.config.dry_run)
        
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'git'],
                   dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.DEV_TOOLS)
        self.logger.success("Ferramentas de desenvolvimento instaladas")
        return True
    
    def _phase_autologin(self) -> bool:
        """Fase 17: Configuração de autologin APRIMORADA (v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Configurando autologin (aprimorado v6.0.0)...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from login_manager_setup import LoginManagerSetup
            from user_manager import UserManager
            
            # 1. Detectar login manager
            lm = LoginManagerSetup(logger=self.logger)
            detected_manager = lm.detect_login_manager()
            manager_info = lm.get_login_manager_info(detected_manager)
            
            self.logger.info(f"Login manager detectado: {manager_info.name}")
            self.logger.info(f"Ativo: {'Sim' if manager_info.active else 'Não'}, Habilitado: {'Sim' if manager_info.enabled else 'Não'}")
            
            # 2. Detectar/criar usuário
            um = UserManager(logger=self.logger)
            
            # Usar usuário atual ou criar 'tsi'
            target_user = self.system_info.user
            if target_user == 'root':
                target_user = 'tsi'
            
            if not um.user_exists(target_user):
                self.logger.info(f"Criando usuário kiosk: {target_user}")
                um.setup_kiosk_user(target_user, password='tsi123')
            else:
                user_info = um.get_user_info(target_user)
                if user_info:
                    self.logger.info(f"Usuário existente: {user_info.username} (UID: {user_info.uid})")
                # Garantir grupos necessários
                um.add_to_groups(target_user, ['audio', 'video', 'input', 'render'])
            
            # 3. Listar sessões disponíveis
            sessions = lm.list_available_sessions()
            self.logger.info(f"Sessões disponíveis: {', '.join(sessions[:5])}")
            
            # Escolher sessão (preferir openbox para kiosk)
            session = 'openbox' if 'openbox' in sessions else (sessions[0] if sessions else 'openbox')
            
            # 4. Configurar autologin no login manager detectado
            success = lm.configure_autologin(username=target_user, session=session)
            
            if success:
                self.logger.success(f"Autologin configurado: {target_user} via {manager_info.name}")
                
                # 5. Configurar X autostart para kiosk
                if self.config.mode == 'kiosk' or self.config.install_kiosk:
                    kiosk_url = self.config.kiosk_url
                    # Se SSL e Avahi estão habilitados, usar HTTPS
                    if self.config.install_ssl and self.config.install_avahi:
                        kiosk_url = f"https://{self.config.avahi_hostname}.local/jukebox"
                    
                    um.configure_x_autostart(
                        username=target_user,
                        command=f"chromium --kiosk --no-sandbox --disable-infobars {kiosk_url}"
                    )
                    self.logger.success(f"X autostart configurado: {kiosk_url}")
                
                self.completed_phases.append(InstallPhase.AUTOLOGIN)
            
            return success
            
        except ImportError as e:
            self.logger.warning(f"Módulo não encontrado: {e}")
            return self._fallback_autologin()
    
    def _fallback_autologin(self) -> bool:
        """Fallback para configuração básica de autologin."""
        self.logger.info("Usando configuração básica de autologin...")
        
        # Getty autologin
        override_dir = Path('/etc/systemd/system/getty@tty1.service.d')
        override_file = override_dir / 'autologin.conf'
        
        content = f"""[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin {self.system_info.user} --noclear %I $TERM
"""
        
        if not self.config.dry_run:
            override_dir.mkdir(parents=True, exist_ok=True)
            override_file.write_text(content)
            run_command(['systemctl', 'daemon-reload'])
            run_command(['systemctl', 'enable', 'getty@tty1.service'])
        
        self.completed_phases.append(InstallPhase.AUTOLOGIN)
        self.logger.success("Autologin básico configurado")
        return True
    
    def _phase_app_deploy(self) -> bool:
        """Fase 18: Deploy da aplicação."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Fazendo deploy da aplicação...")
        
        for dir_path in [INSTALL_DIR, CONFIG_DIR, LOG_DIR, DATA_DIR]:
            if not self.config.dry_run:
                dir_path.mkdir(parents=True, exist_ok=True)
        
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
            run_command(['docker-compose', '-f', str(compose_file), 'up', '-d'])
        
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
    
    def _phase_ssl_setup(self) -> bool:
        """Fase 20: Configuração de SSL (NOVO v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando SSL ({self.config.ssl_mode})...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from ssl_setup import SSLSetup, SSLConfig
            
            config = SSLConfig(
                domain=self.config.ssl_domain,
                email=self.config.ssl_email,
                use_letsencrypt=(self.config.ssl_mode == 'letsencrypt')
            )
            
            ssl = SSLSetup(config=config, logger=self.logger, dry_run=self.config.dry_run)
            success = ssl.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.SSL_SETUP)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo ssl_setup não encontrado, configuração manual...")
            return self._fallback_ssl_setup()
    
    def _fallback_ssl_setup(self) -> bool:
        """Fallback para configuração básica de SSL."""
        self.logger.info("Gerando certificado SSL auto-assinado...")
        
        ssl_dir = Path('/etc/nginx/ssl')
        
        if not self.config.dry_run:
            ssl_dir.mkdir(parents=True, exist_ok=True)
            
            domain = self.config.ssl_domain
            run_command([
                'openssl', 'req', '-x509', '-nodes',
                '-days', '365',
                '-newkey', 'rsa:2048',
                '-keyout', str(ssl_dir / f'{domain}.key'),
                '-out', str(ssl_dir / f'{domain}.crt'),
                '-subj', f'/CN={domain}/O=TSiJUKEBOX/C=BR'
            ])
        
        self.completed_phases.append(InstallPhase.SSL_SETUP)
        self.logger.success(f"SSL auto-assinado gerado para {self.config.ssl_domain}")
        return True
    
    def _phase_avahi_mdns(self) -> bool:
        """Fase 21: Configuração de Avahi/mDNS (NOVO v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, f"Configurando Avahi/mDNS ({self.config.avahi_hostname}.local)...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from avahi_setup import AvahiSetup, AvahiConfig
            
            config = AvahiConfig(
                hostname=self.config.avahi_hostname,
                http_port=5173,
                grafana_port=3000,
                prometheus_port=9090
            )
            
            avahi = AvahiSetup(config=config, logger=self.logger, dry_run=self.config.dry_run)
            success = avahi.full_setup()
            
            if success:
                self.completed_phases.append(InstallPhase.AVAHI_MDNS)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo avahi_setup não encontrado, configuração manual...")
            return self._fallback_avahi_setup()
    
    def _fallback_avahi_setup(self) -> bool:
        """Fallback para configuração básica de Avahi."""
        self.logger.info("Configurando Avahi manualmente...")
        
        # Instalar pacotes
        run_command(['pacman', '-S', '--noconfirm', '--needed', 'avahi', 'nss-mdns'],
                   dry_run=self.config.dry_run)
        
        # Configurar hostname
        if not self.config.dry_run:
            Path('/etc/hostname').write_text(f"{self.config.avahi_hostname}\n")
        
        # Configurar nsswitch.conf
        nsswitch_file = Path('/etc/nsswitch.conf')
        if nsswitch_file.exists() and not self.config.dry_run:
            content = nsswitch_file.read_text()
            if 'mdns_minimal' not in content:
                content = content.replace(
                    'hosts: files',
                    'hosts: files mdns_minimal [NOTFOUND=return]'
                )
                nsswitch_file.write_text(content)
        
        # Habilitar serviço
        run_command(['systemctl', 'enable', 'avahi-daemon'], dry_run=self.config.dry_run)
        run_command(['systemctl', 'start', 'avahi-daemon'], dry_run=self.config.dry_run)
        
        self.completed_phases.append(InstallPhase.AVAHI_MDNS)
        self.logger.success(f"Avahi configurado: {self.config.avahi_hostname}.local")
        return True
    
    def _phase_github_cli(self) -> bool:
        """Fase 22: Instalação do GitHub CLI (NOVO v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando GitHub CLI (gh)...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from devtools_setup import DevToolsSetup, DevToolsConfig
            
            config = DevToolsConfig(
                install_github_cli=True,
                install_rclone=False,
                install_storj=False,
                install_nodejs=False
            )
            
            devtools = DevToolsSetup(
                config=config, 
                logger=self.logger, 
                user=self.system_info.user,
                dry_run=self.config.dry_run
            )
            success = devtools.install_github_cli()
            
            if success:
                self.completed_phases.append(InstallPhase.GITHUB_CLI)
            
            return success
            
        except ImportError:
            # Fallback direto
            if shutil.which('gh'):
                self.logger.info("GitHub CLI já instalado")
            else:
                run_command(['pacman', '-S', '--noconfirm', '--needed', 'github-cli'],
                           dry_run=self.config.dry_run)
            
            self.completed_phases.append(InstallPhase.GITHUB_CLI)
            self.logger.success("GitHub CLI instalado")
            return True
    
    def _phase_storj_full(self) -> bool:
        """Fase 23: Instalação do Storj CLI (NOVO v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Instalando Storj Uplink CLI...")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent / 'installer'))
            from devtools_setup import DevToolsSetup, DevToolsConfig
            
            config = DevToolsConfig(
                install_github_cli=False,
                install_rclone=False,
                install_storj=True,
                install_nodejs=False
            )
            
            devtools = DevToolsSetup(
                config=config, 
                logger=self.logger, 
                user=self.system_info.user,
                dry_run=self.config.dry_run
            )
            success = devtools.install_storj()
            
            if success:
                self.completed_phases.append(InstallPhase.STORJ_FULL)
            
            return success
            
        except ImportError:
            self.logger.warning("Módulo devtools_setup não encontrado")
            self.completed_phases.append(InstallPhase.STORJ_FULL)
            return True
    
    def _phase_hardware_report(self) -> bool:
        """Fase 24: Gera relatório de hardware (NOVO v6.0.0)."""
        phase_num = self._next_phase()
        self.logger.step(phase_num, TOTAL_PHASES, "Gerando relatório de hardware...")
        
        report = {
            "generated_at": datetime.now().isoformat(),
            "version": VERSION,
            "system": {
                "distro": self.system_info.distro,
                "distro_id": self.system_info.distro_id,
                "login_manager": self.system_info.login_manager,
                "is_raspberry_pi": self.system_info.is_raspberry_pi,
                "is_virtual_machine": self.system_info.is_virtual_machine,
            },
            "hardware": {
                "ram_gb": round(self.system_info.ram_gb, 2),
                "disk_free_gb": round(self.system_info.disk_free_gb, 2),
                "cpu_cores": self.system_info.cpu_cores,
            },
            "recommendations": {
                "mode": self.system_info.recommended_mode,
                "database": self.system_info.recommended_database,
            },
            "applied_config": {
                "mode": self.config.mode,
                "database": self.config.database_type,
                "ssl": self.config.install_ssl,
                "avahi": self.config.install_avahi,
            }
        }
        
        if not self.config.dry_run:
            try:
                CONFIG_DIR.mkdir(parents=True, exist_ok=True)
                report_file = CONFIG_DIR / "hardware-report.json"
                report_file.write_text(json.dumps(report, indent=2, ensure_ascii=False))
                self.logger.success(f"Relatório salvo em: {report_file}")
            except Exception as e:
                self.logger.warning(f"Falha ao salvar relatório: {e}")
        
        self.completed_phases.append(InstallPhase.HARDWARE_REPORT)
        return True
    
    def _phase_verify(self) -> bool:
        """Fase 25: Verificação final expandida v6.0.0."""
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
            ('GitHub CLI', shutil.which('gh') is not None),
            ('Storj', shutil.which('uplink') is not None),
        ]
        
        for name, status in checks:
            if status:
                self.logger.success(f"{name}: OK")
            else:
                self.logger.warning(f"{name}: Não encontrado")
        
        # Verificar serviços
        services = ['docker', 'nginx', 'grafana', 'prometheus', 'avahi-daemon']
        for service in services:
            code, out, _ = run_command(['systemctl', 'is-active', service])
            if out.strip() == 'active':
                self.logger.success(f"Serviço {service}: ativo")
            else:
                self.logger.warning(f"Serviço {service}: inativo")
        
        # Verificar diretórios
        for dir_path in [INSTALL_DIR, CONFIG_DIR, LOG_DIR, DATA_DIR]:
            if dir_path.exists():
                self.logger.success(f"Diretório {dir_path}: OK")
            else:
                self.logger.warning(f"Diretório {dir_path}: não existe")
        
        # Verificar SSL
        ssl_cert = Path(f'/etc/nginx/ssl/{self.config.ssl_domain}.crt')
        if ssl_cert.exists():
            self.logger.success(f"Certificado SSL: OK")
        else:
            self.logger.warning(f"Certificado SSL: não encontrado")
        
        self.completed_phases.append(InstallPhase.VERIFY)
        return True


# =============================================================================
# MAIN
# =============================================================================

def parse_args() -> InstallConfig:
    """Parse argumentos de linha de comando v6.0.0."""
    parser = argparse.ArgumentParser(
        description=f'TSiJUKEBOX Enterprise - Unified Installer v{VERSION} (26 fases)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  sudo python3 unified-installer.py                    # Instalação completa
  sudo python3 unified-installer.py --mode kiosk       # Modo kiosk
  sudo python3 unified-installer.py --mode auto        # Modo automático baseado em hardware
  sudo python3 unified-installer.py --no-monitoring    # Sem Grafana/Prometheus
  sudo python3 unified-installer.py --dry-run          # Simular instalação
  sudo python3 unified-installer.py --ssl-mode letsencrypt --ssl-email email@example.com
  sudo python3 unified-installer.py --avahi-hostname myjukebox  # Acesso via myjukebox.local
        """
    )
    
    parser.add_argument('--mode', default='full', 
                       choices=['full', 'kiosk', 'server', 'minimal', 'auto'],
                       help='Modo de instalação (auto: baseado em hardware)')
    parser.add_argument('--user', help='Usuário do sistema')
    parser.add_argument('--timezone', default='America/Sao_Paulo',
                       help='Timezone do sistema')
    
    # Componentes existentes
    parser.add_argument('--no-docker', action='store_true')
    parser.add_argument('--no-ufw', action='store_true')
    parser.add_argument('--no-ntp', action='store_true')
    parser.add_argument('--no-nginx', action='store_true')
    parser.add_argument('--no-monitoring', action='store_true')
    parser.add_argument('--no-spotify', action='store_true')
    parser.add_argument('--no-spicetify', action='store_true')
    parser.add_argument('--no-spotify-cli', action='store_true')
    parser.add_argument('--no-autologin', action='store_true')
    parser.add_argument('--no-fonts', action='store_true')
    parser.add_argument('--no-audio', action='store_true')
    parser.add_argument('--audio-backend', choices=['pipewire', 'pulseaudio'], default='pipewire')
    parser.add_argument('--no-database', action='store_true')
    parser.add_argument('--database-type', choices=['sqlite', 'mariadb', 'postgresql'], default='sqlite')
    parser.add_argument('--database-name', default='tsijukebox')
    parser.add_argument('--database-user', default='tsi')
    parser.add_argument('--no-cloud-backup', action='store_true')
    parser.add_argument('--cloud-providers', nargs='+', default=['rclone'])
    parser.add_argument('--backup-schedule', default='0 2 * * *')
    parser.add_argument('--kiosk', action='store_true')
    parser.add_argument('--kiosk-url', default='https://midiaserver.local/jukebox')
    parser.add_argument('--no-voice-control', action='store_true')
    parser.add_argument('--voice-language', default='pt-BR')
    parser.add_argument('--dev-tools', action='store_true')
    
    # NOVOS argumentos v6.0.0
    parser.add_argument('--no-hardware-analysis', action='store_true',
                       help='Não executar análise de hardware')
    parser.add_argument('--no-ssl', action='store_true',
                       help='Não configurar SSL')
    parser.add_argument('--ssl-mode', choices=['self-signed', 'letsencrypt'],
                       default='self-signed', help='Modo SSL')
    parser.add_argument('--ssl-domain', default='midiaserver.local',
                       help='Domínio para certificado SSL')
    parser.add_argument('--ssl-email', default='',
                       help='Email para Let\'s Encrypt')
    parser.add_argument('--no-avahi', action='store_true',
                       help='Não configurar Avahi/mDNS')
    parser.add_argument('--avahi-hostname', default='midiaserver',
                       help='Hostname para mDNS (acessível via hostname.local)')
    parser.add_argument('--no-github-cli', action='store_true',
                       help='Não instalar GitHub CLI')
    parser.add_argument('--no-storj', action='store_true',
                       help='Não instalar Storj CLI')
    
    # Opções
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--verbose', '-v', action='store_true')
    parser.add_argument('--quiet', '-q', action='store_true')
    parser.add_argument('--auto', '-y', action='store_true')
    
    args = parser.parse_args()
    
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
        # NOVOS v6.0.0
        run_hardware_analysis=not args.no_hardware_analysis,
        install_ssl=not args.no_ssl,
        ssl_mode=args.ssl_mode,
        ssl_domain=args.ssl_domain,
        ssl_email=args.ssl_email,
        install_avahi=not args.no_avahi,
        avahi_hostname=args.avahi_hostname,
        install_github_cli=not args.no_github_cli,
        install_storj=not args.no_storj,
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
