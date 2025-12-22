#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Docker Autonomous Installer
====================================================
Instalador 100% autônomo usando Docker containers.

Uso:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/docker-install.py | sudo python3
    
    # Com opções:
    sudo python3 docker-install.py --port 8080 --monitoring --ssl
    sudo python3 docker-install.py --uninstall
    sudo python3 docker-install.py --update
    sudo python3 docker-install.py --status

Compatível com: Arch Linux, CachyOS, Manjaro, EndeavourOS
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import socket
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ============================================================================
# CONFIGURAÇÃO GLOBAL
# ============================================================================

@dataclass(frozen=True)
class Config:
    """Configuração imutável do instalador."""
    VERSION: str = "5.0.0"
    IMAGE: str = "ghcr.io/b0yz4kr14/tsijukebox:latest"
    IMAGE_MONITORING: str = "prom/prometheus:latest"
    IMAGE_GRAFANA: str = "grafana/grafana:latest"
    IMAGE_NGINX: str = "nginx:alpine"
    IMAGE_CERTBOT: str = "certbot/certbot:latest"
    IMAGE_REDIS: str = "redis:alpine"
    
    INSTALL_DIR: Path = field(default_factory=lambda: Path("/opt/tsijukebox"))
    COMPOSE_DIR: Path = field(default_factory=lambda: Path("/opt/tsijukebox/docker"))
    DATA_DIR: Path = field(default_factory=lambda: Path("/var/lib/tsijukebox"))
    LOG_DIR: Path = field(default_factory=lambda: Path("/var/log/tsijukebox"))
    BACKUP_DIR: Path = field(default_factory=lambda: Path("/var/backups/tsijukebox"))
    CERTS_DIR: Path = field(default_factory=lambda: Path("/etc/letsencrypt"))
    WEBROOT_DIR: Path = field(default_factory=lambda: Path("/var/www/certbot"))
    
    SERVICE_NAME: str = "tsijukebox"
    CONTAINER_NAME: str = "tsijukebox-app"
    NETWORK_NAME: str = "tsijukebox-net"
    
    MIN_RAM_GB: float = 2.0
    MIN_DISK_GB: float = 10.0
    DEFAULT_PORT: int = 80
    HTTPS_PORT: int = 443
    HEALTH_CHECK_TIMEOUT: int = 120
    HEALTH_CHECK_INTERVAL: int = 5
    
    # Certbot settings
    CERTBOT_RENEWAL_INTERVAL_HOURS: int = 12
    CERTBOT_STAGING_URL: str = "https://acme-staging-v02.api.letsencrypt.org/directory"
    CERTBOT_PRODUCTION_URL: str = "https://acme-v02.api.letsencrypt.org/directory"
    
    SUPPORTED_DISTROS: Tuple[str, ...] = (
        "arch", "cachyos", "manjaro", "endeavouros", "garuda", "artix"
    )


# Instância global de configuração
CONFIG = Config()


# ============================================================================
# LOGGER COLORIDO
# ============================================================================

class Colors:
    """Códigos ANSI para cores no terminal."""
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_BLUE = "\033[44m"


class Logger:
    """Logger colorido para terminal com níveis e formatação."""
    
    _verbose: bool = False
    _log_file: Optional[Path] = None
    
    @classmethod
    def set_verbose(cls, verbose: bool) -> None:
        cls._verbose = verbose
    
    @classmethod
    def set_log_file(cls, path: Path) -> None:
        cls._log_file = path
        path.parent.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def _write_log(cls, level: str, message: str) -> None:
        if cls._log_file:
            timestamp = datetime.now().isoformat()
            with open(cls._log_file, "a") as f:
                f.write(f"[{timestamp}] [{level}] {message}\n")
    
    @classmethod
    def banner(cls) -> None:
        """Exibe banner do instalador."""
        banner = f"""
{Colors.CYAN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ████████╗███████╗██╗     ██╗██╗   ██╗██╗  ██╗███████╗██████╗  ██████╗ ██╗  ║
║   ╚══██╔══╝██╔════╝██║     ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗╚██╗ ║
║      ██║   ███████╗██║     ██║██║   ██║█████╔╝ █████╗  ██████╔╝██║   ██║ ██║ ║
║      ██║   ╚════██║██║██   ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║ ██║ ║
║      ██║   ███████║██║╚█████╔╝╚██████╔╝██║  ██╗███████╗██████╔╝╚██████╔╝██╔╝ ║
║      ╚═╝   ╚══════╝╚═╝ ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ║
║                                                                              ║
║                    Docker Autonomous Installer v{CONFIG.VERSION}                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
{Colors.RESET}"""
        print(banner)
    
    @classmethod
    def info(cls, message: str) -> None:
        print(f"{Colors.BLUE}ℹ{Colors.RESET} {message}")
        cls._write_log("INFO", message)
    
    @classmethod
    def success(cls, message: str) -> None:
        print(f"{Colors.GREEN}✓{Colors.RESET} {message}")
        cls._write_log("SUCCESS", message)
    
    @classmethod
    def warning(cls, message: str) -> None:
        print(f"{Colors.YELLOW}⚠{Colors.RESET} {message}")
        cls._write_log("WARNING", message)
    
    @classmethod
    def error(cls, message: str) -> None:
        print(f"{Colors.RED}✗{Colors.RESET} {message}")
        cls._write_log("ERROR", message)
    
    @classmethod
    def step(cls, step: int, total: int, message: str) -> None:
        print(f"\n{Colors.CYAN}{Colors.BOLD}[{step}/{total}]{Colors.RESET} {message}")
        cls._write_log("STEP", f"[{step}/{total}] {message}")
    
    @classmethod
    def debug(cls, message: str) -> None:
        if cls._verbose:
            print(f"{Colors.DIM}  → {message}{Colors.RESET}")
            cls._write_log("DEBUG", message)
    
    @classmethod
    def command(cls, cmd: List[str]) -> None:
        if cls._verbose:
            print(f"{Colors.DIM}  $ {' '.join(cmd)}{Colors.RESET}")
    
    @classmethod
    def progress(cls, current: int, total: int, message: str = "") -> None:
        width = 40
        filled = int(width * current / total)
        bar = "█" * filled + "░" * (width - filled)
        percent = int(100 * current / total)
        print(f"\r  [{Colors.CYAN}{bar}{Colors.RESET}] {percent}% {message}", end="", flush=True)
        if current >= total:
            print()


# ============================================================================
# EXECUTOR DE COMANDOS
# ============================================================================

class CommandRunner:
    """Executa comandos shell com tratamento de erros robusto."""
    
    @staticmethod
    def run(
        cmd: List[str],
        capture: bool = True,
        check: bool = True,
        cwd: Optional[Path] = None,
        env: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None
    ) -> Tuple[int, str, str]:
        """
        Executa um comando shell.
        
        Returns:
            Tuple[int, str, str]: (código de retorno, stdout, stderr)
        """
        Logger.command(cmd)
        
        merged_env = os.environ.copy()
        if env:
            merged_env.update(env)
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture,
                text=True,
                cwd=cwd,
                env=merged_env,
                timeout=timeout
            )
            
            stdout = result.stdout.strip() if result.stdout else ""
            stderr = result.stderr.strip() if result.stderr else ""
            
            if check and result.returncode != 0:
                Logger.debug(f"Command failed: {stderr}")
            
            return result.returncode, stdout, stderr
            
        except subprocess.TimeoutExpired:
            Logger.error(f"Command timed out: {' '.join(cmd)}")
            return -1, "", "Command timed out"
        except FileNotFoundError:
            Logger.error(f"Command not found: {cmd[0]}")
            return -1, "", f"Command not found: {cmd[0]}"
        except Exception as e:
            Logger.error(f"Command execution failed: {e}")
            return -1, "", str(e)
    
    @staticmethod
    def run_interactive(cmd: List[str], cwd: Optional[Path] = None) -> int:
        """Executa comando de forma interativa (sem captura)."""
        Logger.command(cmd)
        try:
            return subprocess.call(cmd, cwd=cwd)
        except Exception as e:
            Logger.error(f"Interactive command failed: {e}")
            return -1
    
    @staticmethod
    def check_command_exists(command: str) -> bool:
        """Verifica se um comando existe no PATH."""
        return shutil.which(command) is not None


# ============================================================================
# INFORMAÇÕES DO SISTEMA
# ============================================================================

@dataclass
class SystemInfo:
    """Informações detectadas do sistema."""
    hostname: str
    distro_name: str
    distro_id: str
    distro_version: str
    is_supported: bool
    kernel_version: str
    architecture: str
    cpu_model: str
    cpu_cores: int
    ram_total_gb: float
    ram_available_gb: float
    disk_total_gb: float
    disk_available_gb: float
    is_root: bool
    current_user: str
    docker_installed: bool
    docker_running: bool
    docker_version: str
    compose_version: str
    is_virtual_machine: bool


class SystemDetector:
    """Detecta informações do sistema operacional e hardware."""
    
    def detect(self) -> SystemInfo:
        """Coleta todas as informações do sistema."""
        return SystemInfo(
            hostname=self._get_hostname(),
            distro_name=self._get_distro_name(),
            distro_id=self._get_distro_id(),
            distro_version=self._get_distro_version(),
            is_supported=self._is_supported_distro(),
            kernel_version=platform.release(),
            architecture=platform.machine(),
            cpu_model=self._get_cpu_model(),
            cpu_cores=os.cpu_count() or 1,
            ram_total_gb=self._get_ram_total(),
            ram_available_gb=self._get_ram_available(),
            disk_total_gb=self._get_disk_total(),
            disk_available_gb=self._get_disk_available(),
            is_root=os.geteuid() == 0,
            current_user=os.environ.get("SUDO_USER", os.environ.get("USER", "unknown")),
            docker_installed=self._check_docker_installed(),
            docker_running=self._check_docker_running(),
            docker_version=self._get_docker_version(),
            compose_version=self._get_compose_version(),
            is_virtual_machine=self._is_virtual_machine()
        )
    
    def _get_hostname(self) -> str:
        return socket.gethostname()
    
    def _get_distro_name(self) -> str:
        try:
            with open("/etc/os-release") as f:
                for line in f:
                    if line.startswith("PRETTY_NAME="):
                        return line.split("=")[1].strip().strip('"')
        except FileNotFoundError:
            pass
        return "Unknown"
    
    def _get_distro_id(self) -> str:
        try:
            with open("/etc/os-release") as f:
                for line in f:
                    if line.startswith("ID="):
                        return line.split("=")[1].strip().strip('"').lower()
        except FileNotFoundError:
            pass
        return "unknown"
    
    def _get_distro_version(self) -> str:
        try:
            with open("/etc/os-release") as f:
                for line in f:
                    if line.startswith("VERSION_ID="):
                        return line.split("=")[1].strip().strip('"')
        except FileNotFoundError:
            pass
        return "unknown"
    
    def _is_supported_distro(self) -> bool:
        distro_id = self._get_distro_id()
        # Também verifica ID_LIKE para derivados
        id_like = ""
        try:
            with open("/etc/os-release") as f:
                for line in f:
                    if line.startswith("ID_LIKE="):
                        id_like = line.split("=")[1].strip().strip('"').lower()
        except FileNotFoundError:
            pass
        
        return (
            distro_id in CONFIG.SUPPORTED_DISTROS or
            "arch" in id_like or
            any(d in distro_id for d in CONFIG.SUPPORTED_DISTROS)
        )
    
    def _get_cpu_model(self) -> str:
        try:
            with open("/proc/cpuinfo") as f:
                for line in f:
                    if "model name" in line:
                        return line.split(":")[1].strip()
        except FileNotFoundError:
            pass
        return "Unknown CPU"
    
    def _get_ram_total(self) -> float:
        try:
            with open("/proc/meminfo") as f:
                for line in f:
                    if line.startswith("MemTotal:"):
                        kb = int(line.split()[1])
                        return round(kb / 1024 / 1024, 2)
        except (FileNotFoundError, ValueError):
            pass
        return 0.0
    
    def _get_ram_available(self) -> float:
        try:
            with open("/proc/meminfo") as f:
                for line in f:
                    if line.startswith("MemAvailable:"):
                        kb = int(line.split()[1])
                        return round(kb / 1024 / 1024, 2)
        except (FileNotFoundError, ValueError):
            pass
        return 0.0
    
    def _get_disk_total(self) -> float:
        try:
            stat = os.statvfs("/")
            return round(stat.f_blocks * stat.f_frsize / 1024 / 1024 / 1024, 2)
        except OSError:
            return 0.0
    
    def _get_disk_available(self) -> float:
        try:
            stat = os.statvfs("/")
            return round(stat.f_bavail * stat.f_frsize / 1024 / 1024 / 1024, 2)
        except OSError:
            return 0.0
    
    def _check_docker_installed(self) -> bool:
        return CommandRunner.check_command_exists("docker")
    
    def _check_docker_running(self) -> bool:
        if not self._check_docker_installed():
            return False
        code, _, _ = CommandRunner.run(["docker", "info"], check=False)
        return code == 0
    
    def _get_docker_version(self) -> str:
        if not self._check_docker_installed():
            return "Not installed"
        code, stdout, _ = CommandRunner.run(
            ["docker", "--version"], check=False
        )
        if code == 0:
            return stdout.split(",")[0].replace("Docker version ", "")
        return "Unknown"
    
    def _get_compose_version(self) -> str:
        # Tenta docker compose (v2)
        code, stdout, _ = CommandRunner.run(
            ["docker", "compose", "version", "--short"], check=False
        )
        if code == 0:
            return stdout
        
        # Fallback para docker-compose (v1)
        code, stdout, _ = CommandRunner.run(
            ["docker-compose", "--version"], check=False
        )
        if code == 0:
            return stdout.split()[-1] if stdout else "Unknown"
        
        return "Not installed"
    
    def _is_virtual_machine(self) -> bool:
        indicators = [
            "/sys/class/dmi/id/product_name",
            "/sys/class/dmi/id/sys_vendor"
        ]
        vm_strings = ["vmware", "virtualbox", "kvm", "qemu", "xen", "hyper-v"]
        
        for path in indicators:
            try:
                with open(path) as f:
                    content = f.read().lower()
                    if any(vm in content for vm in vm_strings):
                        return True
            except (FileNotFoundError, PermissionError):
                pass
        
        # Também verifica systemd-detect-virt
        code, stdout, _ = CommandRunner.run(
            ["systemd-detect-virt"], check=False
        )
        if code == 0 and stdout and stdout != "none":
            return True
        
        return False


# ============================================================================
# INSTALADOR DE DOCKER
# ============================================================================

class DockerInstaller:
    """Instala e configura Docker no sistema Arch-based."""
    
    def install(self) -> bool:
        """Instala Docker e Docker Compose."""
        Logger.info("Instalando Docker e Docker Compose...")
        
        # Atualiza mirrors e instala pacotes
        code, _, stderr = CommandRunner.run(
            ["pacman", "-Sy", "--noconfirm", "docker", "docker-compose"],
            check=False
        )
        
        if code != 0:
            Logger.error(f"Falha ao instalar Docker: {stderr}")
            return False
        
        Logger.success("Docker instalado com sucesso")
        return True
    
    def start_daemon(self) -> bool:
        """Inicia e habilita o daemon do Docker."""
        Logger.info("Iniciando Docker daemon...")
        
        # Habilita o serviço
        code, _, _ = CommandRunner.run(
            ["systemctl", "enable", "docker.service"],
            check=False
        )
        
        # Inicia o serviço
        code, _, stderr = CommandRunner.run(
            ["systemctl", "start", "docker.service"],
            check=False
        )
        
        if code != 0:
            Logger.error(f"Falha ao iniciar Docker: {stderr}")
            return False
        
        # Aguarda o daemon ficar pronto
        for _ in range(30):
            code, _, _ = CommandRunner.run(["docker", "info"], check=False)
            if code == 0:
                Logger.success("Docker daemon iniciado")
                return True
            time.sleep(1)
        
        Logger.error("Docker daemon não respondeu a tempo")
        return False
    
    def add_user_to_group(self, user: str) -> bool:
        """Adiciona usuário ao grupo docker."""
        if user == "root":
            return True
        
        Logger.info(f"Adicionando usuário '{user}' ao grupo docker...")
        
        code, _, stderr = CommandRunner.run(
            ["usermod", "-aG", "docker", user],
            check=False
        )
        
        if code != 0:
            Logger.warning(f"Não foi possível adicionar ao grupo: {stderr}")
            return False
        
        Logger.success(f"Usuário '{user}' adicionado ao grupo docker")
        return True
    
    def verify(self) -> bool:
        """Verifica se Docker está funcionando corretamente."""
        Logger.info("Verificando instalação do Docker...")
        
        code, stdout, _ = CommandRunner.run(
            ["docker", "run", "--rm", "hello-world"],
            check=False
        )
        
        if code == 0 and "Hello from Docker" in stdout:
            Logger.success("Docker funcionando corretamente")
            return True
        
        Logger.error("Verificação do Docker falhou")
        return False


# ============================================================================
# GERENCIADOR DE CERTIFICADOS SSL (CERTBOT)
# ============================================================================

class CertbotManager:
    """Gerencia certificados SSL com Let's Encrypt/Certbot."""
    
    def __init__(self, domain: str, email: str, staging: bool = False):
        self.domain = domain
        self.email = email
        self.staging = staging
        self.certs_dir = CONFIG.CERTS_DIR
        self.webroot_dir = CONFIG.WEBROOT_DIR
    
    def setup_directories(self) -> bool:
        """Cria diretórios necessários para Certbot."""
        Logger.info("Preparando diretórios para certificados SSL...")
        
        try:
            self.certs_dir.mkdir(parents=True, exist_ok=True)
            self.webroot_dir.mkdir(parents=True, exist_ok=True)
            Logger.success("Diretórios SSL criados")
            return True
        except Exception as e:
            Logger.error(f"Falha ao criar diretórios SSL: {e}")
            return False
    
    def request_certificate(self) -> bool:
        """Solicita certificado via HTTP-01 challenge."""
        Logger.info(f"Solicitando certificado SSL para {self.domain}...")
        
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{self.certs_dir}:/etc/letsencrypt",
            "-v", f"{self.webroot_dir}:/var/www/certbot",
            CONFIG.IMAGE_CERTBOT,
            "certonly", "--webroot",
            "-w", "/var/www/certbot",
            "-d", self.domain,
            "--email", self.email,
            "--agree-tos",
            "--non-interactive",
            "--keep-until-expiring"
        ]
        
        if self.staging:
            cmd.append("--staging")
            Logger.warning("Usando ambiente STAGING do Let's Encrypt (apenas para testes)")
        
        code, stdout, stderr = CommandRunner.run(cmd, check=False, timeout=300)
        
        if code == 0:
            Logger.success(f"Certificado SSL obtido para {self.domain}")
            return True
        else:
            Logger.error(f"Falha ao obter certificado: {stderr}")
            return False
    
    def renew_certificate(self) -> bool:
        """Renova certificados existentes."""
        Logger.info("Renovando certificados SSL...")
        
        cmd = [
            "docker", "run", "--rm",
            "-v", f"{self.certs_dir}:/etc/letsencrypt",
            "-v", f"{self.webroot_dir}:/var/www/certbot",
            CONFIG.IMAGE_CERTBOT,
            "renew", "--quiet"
        ]
        
        code, stdout, stderr = CommandRunner.run(cmd, check=False, timeout=300)
        
        if code == 0:
            Logger.success("Certificados renovados com sucesso")
            return True
        else:
            Logger.warning(f"Renovação retornou: {stderr}")
            return code == 0
    
    def generate_self_signed(self) -> bool:
        """Gera certificado auto-assinado para desenvolvimento."""
        Logger.info(f"Gerando certificado auto-assinado para {self.domain}...")
        
        ssl_dir = CONFIG.COMPOSE_DIR / "nginx" / "ssl"
        ssl_dir.mkdir(parents=True, exist_ok=True)
        
        # Gera chave privada e certificado auto-assinado
        cmd = [
            "openssl", "req", "-x509", "-nodes",
            "-days", "365",
            "-newkey", "rsa:2048",
            "-keyout", str(ssl_dir / "privkey.pem"),
            "-out", str(ssl_dir / "fullchain.pem"),
            "-subj", f"/CN={self.domain}/O=TSiJUKEBOX/C=BR"
        ]
        
        code, _, stderr = CommandRunner.run(cmd, check=False)
        
        if code == 0:
            Logger.success("Certificado auto-assinado gerado")
            return True
        else:
            Logger.error(f"Falha ao gerar certificado: {stderr}")
            return False
    
    def check_certificate_exists(self) -> bool:
        """Verifica se já existe certificado para o domínio."""
        cert_path = self.certs_dir / "live" / self.domain / "fullchain.pem"
        return cert_path.exists()
    
    def get_certificate_expiry(self) -> Optional[str]:
        """Retorna data de expiração do certificado."""
        cert_path = self.certs_dir / "live" / self.domain / "fullchain.pem"
        
        if not cert_path.exists():
            return None
        
        cmd = [
            "openssl", "x509", "-enddate", "-noout",
            "-in", str(cert_path)
        ]
        
        code, stdout, _ = CommandRunner.run(cmd, check=False)
        
        if code == 0 and stdout:
            # Output: notAfter=Dec 31 23:59:59 2024 GMT
            return stdout.replace("notAfter=", "").strip()
        
        return None
    
    def create_dhparam(self) -> bool:
        """Cria arquivo DH parameters para SSL."""
        ssl_dir = CONFIG.COMPOSE_DIR / "nginx" / "ssl"
        dhparam_file = ssl_dir / "ssl-dhparams.pem"
        
        if dhparam_file.exists():
            Logger.debug("DH parameters já existe")
            return True
        
        Logger.info("Gerando DH parameters (pode demorar alguns minutos)...")
        ssl_dir.mkdir(parents=True, exist_ok=True)
        
        cmd = [
            "openssl", "dhparam", "-out", str(dhparam_file), "2048"
        ]
        
        code, _, stderr = CommandRunner.run(cmd, check=False, timeout=600)
        
        if code == 0:
            Logger.success("DH parameters gerado")
            return True
        else:
            Logger.warning(f"Falha ao gerar DH params: {stderr}")
            return False


# ============================================================================
# GERENCIADOR DE DOCKER COMPOSE
# ============================================================================

class ComposeManager:
    """Gerencia arquivos Docker Compose."""
    
    def __init__(self, options: argparse.Namespace):
        self.options = options
        self.compose_dir = CONFIG.COMPOSE_DIR
    
    def generate_compose(self) -> str:
        """Gera o arquivo docker-compose.yml com profiles."""
        port = getattr(self.options, "port", CONFIG.DEFAULT_PORT)
        monitoring = getattr(self.options, "monitoring", False)
        ssl = getattr(self.options, "ssl", False)
        ssl_letsencrypt = getattr(self.options, "ssl_letsencrypt", False)
        cache = getattr(self.options, "cache", False)
        domain = getattr(self.options, "domain", "localhost")
        
        compose = {
            "version": "3.9",
            "services": {
                "app": {
                    "image": CONFIG.IMAGE,
                    "container_name": CONFIG.CONTAINER_NAME,
                    "restart": "unless-stopped",
                    "ports": [f"{port}:80"] if not (ssl or ssl_letsencrypt) else [],
                    "environment": [
                        "TZ=America/Sao_Paulo",
                        "VITE_SUPABASE_URL=${SUPABASE_URL:-}",
                        "VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_KEY:-}"
                    ],
                    "volumes": [
                        "tsijukebox-data:/app/data",
                        "tsijukebox-logs:/var/log/nginx"
                    ],
                    "healthcheck": {
                        "test": ["CMD", "curl", "-f", "http://localhost/health"],
                        "interval": "30s",
                        "timeout": "10s",
                        "retries": 3,
                        "start_period": "40s"
                    },
                    "labels": [
                        "com.tsijukebox.service=app",
                        f"com.tsijukebox.version={CONFIG.VERSION}"
                    ],
                    "networks": [CONFIG.NETWORK_NAME]
                }
            },
            "networks": {
                CONFIG.NETWORK_NAME: {
                    "driver": "bridge"
                }
            },
            "volumes": {
                "tsijukebox-data": {},
                "tsijukebox-logs": {}
            }
        }
        
        # Adiciona Nginx Proxy para SSL (com ou sem Let's Encrypt)
        if ssl or ssl_letsencrypt:
            nginx_volumes = [
                "./nginx/nginx.conf:/etc/nginx/nginx.conf:ro",
                "tsijukebox-logs:/var/log/nginx"
            ]
            
            if ssl_letsencrypt:
                # Let's Encrypt usa certs do host
                nginx_volumes.extend([
                    f"{CONFIG.CERTS_DIR}:/etc/letsencrypt:ro",
                    "certbot-webroot:/var/www/certbot:ro"
                ])
            else:
                # SSL auto-assinado usa certs locais
                nginx_volumes.append("./nginx/ssl:/etc/nginx/ssl:ro")
            
            compose["services"]["nginx"] = {
                "image": CONFIG.IMAGE_NGINX,
                "container_name": "tsijukebox-nginx",
                "restart": "unless-stopped",
                "ports": ["80:80", "443:443"],
                "volumes": nginx_volumes,
                "depends_on": ["app"],
                "networks": [CONFIG.NETWORK_NAME],
                "profiles": ["ssl", "ssl-letsencrypt"]
            }
            
            # Adiciona webroot volume para Let's Encrypt
            if ssl_letsencrypt:
                compose["volumes"]["certbot-webroot"] = {}
        
        # Adiciona container Certbot para renovação automática
        if ssl_letsencrypt:
            compose["services"]["certbot"] = {
                "image": CONFIG.IMAGE_CERTBOT,
                "container_name": "tsijukebox-certbot",
                "volumes": [
                    f"{CONFIG.CERTS_DIR}:/etc/letsencrypt",
                    "certbot-webroot:/var/www/certbot"
                ],
                "entrypoint": "/bin/sh -c 'trap exit TERM; while :; do certbot renew --quiet; sleep 12h & wait $${!}; done;'",
                "depends_on": ["nginx"],
                "networks": [CONFIG.NETWORK_NAME],
                "profiles": ["ssl-letsencrypt"]
            }
        
        # Adiciona Redis cache
        if cache:
            compose["services"]["redis"] = {
                "image": CONFIG.IMAGE_REDIS,
                "container_name": "tsijukebox-redis",
                "restart": "unless-stopped",
                "command": ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"],
                "volumes": ["redis-data:/data"],
                "healthcheck": {
                    "test": ["CMD", "redis-cli", "ping"],
                    "interval": "10s",
                    "timeout": "5s",
                    "retries": 3
                },
                "networks": [CONFIG.NETWORK_NAME],
                "profiles": ["cache"]
            }
            compose["volumes"]["redis-data"] = {}
        
        # Adiciona monitoring stack
        if monitoring:
            compose["services"]["prometheus"] = {
                "image": CONFIG.IMAGE_MONITORING,
                "container_name": "tsijukebox-prometheus",
                "restart": "unless-stopped",
                "ports": ["9090:9090"],
                "volumes": [
                    "./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro",
                    "prometheus-data:/prometheus"
                ],
                "command": [
                    "--config.file=/etc/prometheus/prometheus.yml",
                    "--storage.tsdb.path=/prometheus",
                    "--web.enable-lifecycle"
                ],
                "networks": [CONFIG.NETWORK_NAME],
                "profiles": ["monitoring"]
            }
            
            compose["services"]["grafana"] = {
                "image": CONFIG.IMAGE_GRAFANA,
                "container_name": "tsijukebox-grafana",
                "restart": "unless-stopped",
                "ports": ["3001:3000"],
                "environment": [
                    "GF_SECURITY_ADMIN_USER=admin",
                    "GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-tsijukebox}",
                    "GF_INSTALL_PLUGINS=grafana-clock-panel"
                ],
                "volumes": [
                    "grafana-data:/var/lib/grafana",
                    "./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro"
                ],
                "depends_on": ["prometheus"],
                "networks": [CONFIG.NETWORK_NAME],
                "profiles": ["monitoring"]
            }
            
            compose["volumes"]["prometheus-data"] = {}
            compose["volumes"]["grafana-data"] = {}
        
        # Converte para YAML simples (sem dependência externa)
        return self._dict_to_yaml(compose)
    
    def _dict_to_yaml(self, data: Dict, indent: int = 0) -> str:
        """Converte dict para YAML sem dependências externas."""
        lines = []
        prefix = "  " * indent
        
        for key, value in data.items():
            if isinstance(value, dict):
                lines.append(f"{prefix}{key}:")
                lines.append(self._dict_to_yaml(value, indent + 1))
            elif isinstance(value, list):
                lines.append(f"{prefix}{key}:")
                for item in value:
                    if isinstance(item, dict):
                        first = True
                        for k, v in item.items():
                            if first:
                                lines.append(f"{prefix}  - {k}: {self._format_value(v)}")
                                first = False
                            else:
                                lines.append(f"{prefix}    {k}: {self._format_value(v)}")
                    else:
                        lines.append(f"{prefix}  - {self._format_value(item)}")
            else:
                lines.append(f"{prefix}{key}: {self._format_value(value)}")
        
        return "\n".join(lines)
    
    def _format_value(self, value: Any) -> str:
        """Formata valor para YAML."""
        if value is None:
            return "null"
        if isinstance(value, bool):
            return "true" if value else "false"
        if isinstance(value, str):
            if any(c in value for c in [":", "{", "}", "[", "]", ",", "&", "*", "#", "?", "|", "-", "<", ">", "=", "!", "%", "@", "`"]):
                return f'"{value}"'
            return value
        return str(value)
    
    def generate_env(self) -> str:
        """Gera o arquivo .env."""
        supabase_url = getattr(self.options, "supabase_url", "")
        supabase_key = getattr(self.options, "supabase_key", "")
        port = getattr(self.options, "port", CONFIG.DEFAULT_PORT)
        
        return f"""# TSiJUKEBOX Docker Environment
# Gerado automaticamente em {datetime.now().isoformat()}

# Configuração de Rede
PORT={port}

# Supabase (opcional)
SUPABASE_URL={supabase_url}
SUPABASE_KEY={supabase_key}

# Grafana (se monitoring habilitado)
GRAFANA_PASSWORD=tsijukebox

# Timezone
TZ=America/Sao_Paulo
"""
    
    def generate_prometheus_config(self) -> str:
        """Gera configuração do Prometheus."""
        return """# Prometheus Configuration for TSiJUKEBOX
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'tsijukebox'
    static_configs:
      - targets: ['app:80']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
"""
    
    def generate_nginx_config_http_only(self, domain: str = "localhost") -> str:
        """Gera configuração Nginx apenas HTTP (para ACME challenge inicial)."""
        return f"""# Nginx Configuration for TSiJUKEBOX - HTTP Only (ACME Challenge)
events {{
    worker_connections 1024;
}}

http {{
    upstream app {{
        server app:80;
    }}

    server {{
        listen 80;
        server_name {domain};

        # ACME challenge location for Let's Encrypt
        location /.well-known/acme-challenge/ {{
            root /var/www/certbot;
        }}

        location / {{
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }}

        location /health {{
            proxy_pass http://app/health;
            access_log off;
        }}
    }}
}}
"""
    
    def generate_nginx_config(self, domain: str = "localhost", use_letsencrypt: bool = False) -> str:
        """Gera configuração Nginx para SSL completo."""
        ssl_cert_path = "/etc/letsencrypt/live/" + domain if use_letsencrypt else "/etc/nginx/ssl"
        
        return f"""# Nginx Configuration for TSiJUKEBOX SSL
events {{
    worker_connections 1024;
}}

http {{
    upstream app {{
        server app:80;
    }}

    # SSL settings
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Redirect HTTP to HTTPS
    server {{
        listen 80;
        server_name {domain};

        # ACME challenge location for Let's Encrypt renewal
        location /.well-known/acme-challenge/ {{
            root /var/www/certbot;
        }}

        # Redirect all other traffic to HTTPS
        location / {{
            return 301 https://$server_name$request_uri;
        }}
    }}

    # HTTPS Server
    server {{
        listen 443 ssl http2;
        server_name {domain};

        ssl_certificate {ssl_cert_path}/fullchain.pem;
        ssl_certificate_key {ssl_cert_path}/privkey.pem;

        # HSTS (optional, uncomment if you want strict HTTPS)
        # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        location / {{
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }}

        location /health {{
            proxy_pass http://app/health;
            access_log off;
        }}
    }}
}}
"""
    
    def write_files(self) -> bool:
        """Escreve todos os arquivos de configuração."""
        Logger.info("Gerando arquivos de configuração...")
        
        try:
            # Cria diretórios
            self.compose_dir.mkdir(parents=True, exist_ok=True)
            
            # docker-compose.yml
            compose_file = self.compose_dir / "docker-compose.yml"
            compose_file.write_text(self.generate_compose())
            Logger.debug(f"Criado: {compose_file}")
            
            # .env
            env_file = self.compose_dir / ".env"
            env_file.write_text(self.generate_env())
            Logger.debug(f"Criado: {env_file}")
            
            # Monitoring configs
            if getattr(self.options, "monitoring", False):
                monitoring_dir = self.compose_dir / "monitoring"
                monitoring_dir.mkdir(exist_ok=True)
                
                prometheus_file = monitoring_dir / "prometheus.yml"
                prometheus_file.write_text(self.generate_prometheus_config())
                Logger.debug(f"Criado: {prometheus_file}")
                
                # Grafana provisioning
                grafana_dir = monitoring_dir / "grafana" / "provisioning" / "datasources"
                grafana_dir.mkdir(parents=True, exist_ok=True)
                
                datasource = grafana_dir / "prometheus.yml"
                datasource.write_text("""apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
""")
            
            # SSL configs
            if getattr(self.options, "ssl", False):
                nginx_dir = self.compose_dir / "nginx"
                nginx_dir.mkdir(exist_ok=True)
                ssl_dir = nginx_dir / "ssl"
                ssl_dir.mkdir(exist_ok=True)
                
                nginx_conf = nginx_dir / "nginx.conf"
                domain = getattr(self.options, "domain", "localhost")
                nginx_conf.write_text(self.generate_nginx_config(domain))
                Logger.debug(f"Criado: {nginx_conf}")
            
            Logger.success("Arquivos de configuração gerados")
            return True
            
        except Exception as e:
            Logger.error(f"Falha ao gerar configurações: {e}")
            return False


# ============================================================================
# GERENCIADOR DE CONTAINERS
# ============================================================================

class ContainerManager:
    """Gerencia ciclo de vida dos containers Docker."""
    
    def __init__(self):
        self.compose_dir = CONFIG.COMPOSE_DIR
    
    def _compose_cmd(self, *args: str) -> List[str]:
        """Monta comando docker compose."""
        return ["docker", "compose", "-f", str(self.compose_dir / "docker-compose.yml")] + list(args)
    
    def pull_image(self) -> bool:
        """Faz pull da imagem principal."""
        Logger.info(f"Baixando imagem {CONFIG.IMAGE}...")
        
        code, _, stderr = CommandRunner.run(
            ["docker", "pull", CONFIG.IMAGE],
            check=False,
            timeout=600
        )
        
        if code != 0:
            Logger.error(f"Falha ao baixar imagem: {stderr}")
            return False
        
        Logger.success("Imagem baixada com sucesso")
        return True
    
    def start(self) -> bool:
        """Inicia todos os containers."""
        Logger.info("Iniciando containers...")
        
        code, _, stderr = CommandRunner.run(
            self._compose_cmd("up", "-d", "--wait"),
            check=False,
            timeout=300
        )
        
        if code != 0:
            Logger.error(f"Falha ao iniciar containers: {stderr}")
            return False
        
        Logger.success("Containers iniciados")
        return True
    
    def start_with_profiles(self, profiles: List[str]) -> bool:
        """Inicia containers com profiles específicos."""
        Logger.info(f"Iniciando containers com profiles: {', '.join(profiles)}...")
        
        cmd = ["docker", "compose", "-f", str(self.compose_dir / "docker-compose.yml")]
        for profile in profiles:
            cmd.extend(["--profile", profile])
        cmd.extend(["up", "-d", "--wait"])
        
        code, _, stderr = CommandRunner.run(cmd, check=False, timeout=300)
        
        if code != 0:
            Logger.error(f"Falha ao iniciar containers: {stderr}")
            return False
        
        Logger.success("Containers iniciados com profiles")
        return True
    
    def stop(self) -> bool:
        """Para todos os containers."""
        Logger.info("Parando containers...")
        
        code, _, stderr = CommandRunner.run(
            self._compose_cmd("down"),
            check=False
        )
        
        if code != 0:
            Logger.warning(f"Aviso ao parar containers: {stderr}")
        
        Logger.success("Containers parados")
        return True
    
    def restart(self) -> bool:
        """Reinicia containers."""
        Logger.info("Reiniciando containers...")
        
        code, _, stderr = CommandRunner.run(
            self._compose_cmd("restart"),
            check=False
        )
        
        if code != 0:
            Logger.error(f"Falha ao reiniciar: {stderr}")
            return False
        
        Logger.success("Containers reiniciados")
        return True
    
    def logs(self, tail: int = 100, follow: bool = False) -> str:
        """Obtém logs dos containers."""
        cmd = self._compose_cmd("logs", "--tail", str(tail))
        if follow:
            cmd.append("-f")
            CommandRunner.run_interactive(cmd)
            return ""
        
        code, stdout, _ = CommandRunner.run(cmd, check=False)
        return stdout if code == 0 else ""
    
    def health_check(self, timeout: int = CONFIG.HEALTH_CHECK_TIMEOUT) -> bool:
        """Verifica saúde dos containers."""
        Logger.info("Verificando saúde dos containers...")
        
        port = CONFIG.DEFAULT_PORT
        # Tenta ler a porta do .env
        env_file = self.compose_dir / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("PORT="):
                    try:
                        port = int(line.split("=")[1])
                    except ValueError:
                        pass
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            elapsed = int(time.time() - start_time)
            Logger.progress(elapsed, timeout, "Aguardando...")
            
            try:
                code, stdout, _ = CommandRunner.run(
                    ["curl", "-sf", f"http://localhost:{port}/"],
                    check=False,
                    timeout=5
                )
                if code == 0:
                    print()  # Nova linha após progress bar
                    Logger.success("Health check passou")
                    return True
            except Exception:
                pass
            
            time.sleep(CONFIG.HEALTH_CHECK_INTERVAL)
        
        print()  # Nova linha após progress bar
        Logger.error("Health check falhou - timeout")
        return False
    
    def status(self) -> Dict[str, Any]:
        """Retorna status dos containers."""
        code, stdout, _ = CommandRunner.run(
            self._compose_cmd("ps", "--format", "json"),
            check=False
        )
        
        if code != 0:
            return {"running": False, "containers": []}
        
        try:
            containers = json.loads(stdout) if stdout else []
            return {
                "running": len(containers) > 0,
                "containers": containers
            }
        except json.JSONDecodeError:
            return {"running": False, "containers": []}
    
    def update(self) -> bool:
        """Atualiza para última versão."""
        Logger.info("Atualizando TSiJUKEBOX...")
        
        # Pull nova imagem
        if not self.pull_image():
            return False
        
        # Recria containers
        code, _, stderr = CommandRunner.run(
            self._compose_cmd("up", "-d", "--force-recreate"),
            check=False
        )
        
        if code != 0:
            Logger.error(f"Falha ao recriar containers: {stderr}")
            return False
        
        Logger.success("Atualização concluída")
        return True
    
    def cleanup(self, remove_volumes: bool = False) -> bool:
        """Limpa recursos Docker."""
        Logger.info("Limpando recursos Docker...")
        
        # Para containers
        self.stop()
        
        # Remove containers e redes
        cmd = self._compose_cmd("down", "--remove-orphans")
        if remove_volumes:
            cmd.append("-v")
        
        code, _, _ = CommandRunner.run(cmd, check=False)
        
        # Prune de imagens não utilizadas
        CommandRunner.run(
            ["docker", "image", "prune", "-f"],
            check=False
        )
        
        Logger.success("Limpeza concluída")
        return code == 0


# ============================================================================
# GERENCIADOR DE SYSTEMD
# ============================================================================

class SystemdManager:
    """Gerencia serviço systemd para TSiJUKEBOX."""
    
    SERVICE_PATH = Path("/etc/systemd/system/tsijukebox.service")
    CERTBOT_TIMER_PATH = Path("/etc/systemd/system/tsijukebox-certbot.timer")
    CERTBOT_SERVICE_PATH = Path("/etc/systemd/system/tsijukebox-certbot.service")
    
    def generate_service(self, profiles: List[str] = None) -> str:
        """Gera arquivo de serviço systemd."""
        profile_args = ""
        if profiles:
            profile_args = " ".join([f"--profile {p}" for p in profiles])
            compose_up = f"/usr/bin/docker compose {profile_args} up -d --wait"
            compose_down = f"/usr/bin/docker compose {profile_args} down"
            compose_restart = f"/usr/bin/docker compose {profile_args} restart"
        else:
            compose_up = "/usr/bin/docker compose up -d --wait"
            compose_down = "/usr/bin/docker compose down"
            compose_restart = "/usr/bin/docker compose restart"
        
        return f"""[Unit]
Description=TSiJUKEBOX Enterprise (Docker)
Documentation=https://github.com/B0yZ4kr14/TSiJUKEBOX
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory={CONFIG.COMPOSE_DIR}
ExecStart={compose_up}
ExecStop={compose_down}
ExecReload={compose_restart}
TimeoutStartSec=300
TimeoutStopSec=120

# Restart automático em caso de falha
Restart=on-failure
RestartSec=30

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tsijukebox

[Install]
WantedBy=multi-user.target
"""
    
    def generate_certbot_timer(self) -> str:
        """Gera systemd timer para renovação automática de certificados."""
        return f"""[Unit]
Description=TSiJUKEBOX Let's Encrypt Certificate Renewal Timer
Documentation=https://certbot.eff.org/

[Timer]
# Executa duas vezes por dia (12h de intervalo)
OnCalendar=*-*-* 00,12:00:00
# Adiciona até 1 hora de delay aleatório para evitar sobrecarga no Let's Encrypt
RandomizedDelaySec=3600
# Persiste timer mesmo se sistema estava desligado
Persistent=true

[Install]
WantedBy=timers.target
"""
    
    def generate_certbot_service(self) -> str:
        """Gera systemd service para renovação de certificados."""
        return f"""[Unit]
Description=TSiJUKEBOX Let's Encrypt Certificate Renewal
Documentation=https://certbot.eff.org/
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory={CONFIG.COMPOSE_DIR}
# Renova certificados
ExecStart=/usr/bin/docker compose --profile ssl-letsencrypt run --rm certbot renew --quiet
# Recarrega Nginx após renovação
ExecStartPost=/usr/bin/docker compose --profile ssl-letsencrypt exec -T nginx nginx -s reload

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=tsijukebox-certbot
"""
    
    def create_service(self, profiles: List[str] = None) -> bool:
        """Cria o arquivo de serviço."""
        Logger.info("Criando serviço systemd...")
        
        try:
            self.SERVICE_PATH.write_text(self.generate_service(profiles))
            Logger.debug(f"Criado: {self.SERVICE_PATH}")
            
            # Recarrega daemon
            CommandRunner.run(["systemctl", "daemon-reload"], check=False)
            
            Logger.success("Serviço systemd criado")
            return True
            
        except Exception as e:
            Logger.error(f"Falha ao criar serviço: {e}")
            return False
    
    def create_certbot_renewal(self) -> bool:
        """Cria timer e service para renovação automática do Certbot."""
        Logger.info("Configurando renovação automática de certificados...")
        
        try:
            # Cria timer
            self.CERTBOT_TIMER_PATH.write_text(self.generate_certbot_timer())
            Logger.debug(f"Criado: {self.CERTBOT_TIMER_PATH}")
            
            # Cria service
            self.CERTBOT_SERVICE_PATH.write_text(self.generate_certbot_service())
            Logger.debug(f"Criado: {self.CERTBOT_SERVICE_PATH}")
            
            # Recarrega daemon
            CommandRunner.run(["systemctl", "daemon-reload"], check=False)
            
            # Habilita e inicia timer
            CommandRunner.run(["systemctl", "enable", "tsijukebox-certbot.timer"], check=False)
            CommandRunner.run(["systemctl", "start", "tsijukebox-certbot.timer"], check=False)
            
            Logger.success("Renovação automática de certificados configurada")
            return True
            
        except Exception as e:
            Logger.error(f"Falha ao configurar renovação: {e}")
            return False
    
    def enable(self) -> bool:
        """Habilita o serviço para iniciar no boot."""
        code, _, _ = CommandRunner.run(
            ["systemctl", "enable", CONFIG.SERVICE_NAME],
            check=False
        )
        
        if code == 0:
            Logger.success("Serviço habilitado para iniciar no boot")
        return code == 0
    
    def disable(self) -> bool:
        """Desabilita o serviço."""
        code, _, _ = CommandRunner.run(
            ["systemctl", "disable", CONFIG.SERVICE_NAME],
            check=False
        )
        return code == 0
    
    def start(self) -> bool:
        """Inicia o serviço."""
        code, _, _ = CommandRunner.run(
            ["systemctl", "start", CONFIG.SERVICE_NAME],
            check=False
        )
        return code == 0
    
    def stop(self) -> bool:
        """Para o serviço."""
        code, _, _ = CommandRunner.run(
            ["systemctl", "stop", CONFIG.SERVICE_NAME],
            check=False
        )
        return code == 0
    
    def status(self) -> str:
        """Retorna status do serviço."""
        code, stdout, _ = CommandRunner.run(
            ["systemctl", "is-active", CONFIG.SERVICE_NAME],
            check=False
        )
        return stdout if code == 0 else "inactive"
    
    def certbot_timer_status(self) -> str:
        """Retorna status do timer de renovação."""
        code, stdout, _ = CommandRunner.run(
            ["systemctl", "is-active", "tsijukebox-certbot.timer"],
            check=False
        )
        return stdout if code == 0 else "inactive"
    
    def remove(self) -> bool:
        """Remove o serviço e timer."""
        self.stop()
        self.disable()
        
        # Remove timer do certbot
        CommandRunner.run(["systemctl", "stop", "tsijukebox-certbot.timer"], check=False)
        CommandRunner.run(["systemctl", "disable", "tsijukebox-certbot.timer"], check=False)
        
        for path in [self.SERVICE_PATH, self.CERTBOT_TIMER_PATH, self.CERTBOT_SERVICE_PATH]:
            if path.exists():
                path.unlink()
        
        CommandRunner.run(["systemctl", "daemon-reload"], check=False)
        return True


# ============================================================================
# INSTALADOR PRINCIPAL
# ============================================================================

class TSiJUKEBOXInstaller:
    """Orquestra todo o processo de instalação."""
    
    TOTAL_STEPS = 8
    
    def __init__(self, options: argparse.Namespace):
        self.options = options
        self.detector = SystemDetector()
        self.docker = DockerInstaller()
        self.compose = ComposeManager(options)
        self.containers = ContainerManager()
        self.systemd = SystemdManager()
        self.system_info: Optional[SystemInfo] = None
    
    def pre_flight_check(self) -> bool:
        """Verificações antes da instalação."""
        Logger.step(1, self.TOTAL_STEPS, "Verificações de pré-instalação")
        
        self.system_info = self.detector.detect()
        
        errors = []
        
        # Verifica root
        if not self.system_info.is_root:
            errors.append("Este script deve ser executado como root (use sudo)")
        
        # Verifica distro
        if not self.system_info.is_supported:
            Logger.warning(f"Distro '{self.system_info.distro_name}' não é oficialmente suportada")
            Logger.info("Continuando mesmo assim...")
        
        # Verifica RAM
        if self.system_info.ram_total_gb < CONFIG.MIN_RAM_GB:
            errors.append(f"RAM insuficiente: {self.system_info.ram_total_gb}GB (mínimo: {CONFIG.MIN_RAM_GB}GB)")
        
        # Verifica disco
        if self.system_info.disk_available_gb < CONFIG.MIN_DISK_GB:
            errors.append(f"Espaço em disco insuficiente: {self.system_info.disk_available_gb}GB (mínimo: {CONFIG.MIN_DISK_GB}GB)")
        
        # Verifica porta
        port = getattr(self.options, "port", CONFIG.DEFAULT_PORT)
        if self._is_port_in_use(port):
            errors.append(f"Porta {port} já está em uso")
        
        if errors:
            for error in errors:
                Logger.error(error)
            return False
        
        # Exibe informações do sistema
        Logger.success("Sistema compatível")
        Logger.debug(f"Distro: {self.system_info.distro_name}")
        Logger.debug(f"RAM: {self.system_info.ram_total_gb}GB")
        Logger.debug(f"Disco: {self.system_info.disk_available_gb}GB disponível")
        
        return True
    
    def _is_port_in_use(self, port: int) -> bool:
        """Verifica se uma porta está em uso."""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(("localhost", port)) == 0
    
    def install(self) -> bool:
        """Instalação completa e autônoma."""
        Logger.banner()
        
        if self.options.dry_run:
            Logger.warning("Modo dry-run: nenhuma alteração será feita")
        
        # 1. Pre-flight checks
        if not self.pre_flight_check():
            return False
        
        # 2. Instalar Docker se necessário
        Logger.step(2, self.TOTAL_STEPS, "Verificando Docker")
        if not self.system_info.docker_installed:
            Logger.info("Docker não encontrado, instalando...")
            if not self.options.dry_run:
                if not self.docker.install():
                    return False
                if not self.docker.start_daemon():
                    return False
        elif not self.system_info.docker_running:
            Logger.info("Docker instalado mas não está rodando")
            if not self.options.dry_run:
                if not self.docker.start_daemon():
                    return False
        else:
            Logger.success(f"Docker {self.system_info.docker_version} já instalado e rodando")
        
        # Adiciona usuário ao grupo docker
        if not self.options.dry_run and self.system_info.current_user != "root":
            self.docker.add_user_to_group(self.system_info.current_user)
        
        # 3. Criar diretórios
        Logger.step(3, self.TOTAL_STEPS, "Criando estrutura de diretórios")
        if not self.options.dry_run:
            for directory in [CONFIG.INSTALL_DIR, CONFIG.DATA_DIR, CONFIG.LOG_DIR, CONFIG.BACKUP_DIR]:
                directory.mkdir(parents=True, exist_ok=True)
                Logger.debug(f"Diretório: {directory}")
        Logger.success("Diretórios criados")
        
        # 4. Gerar arquivos de configuração
        Logger.step(4, self.TOTAL_STEPS, "Gerando configurações")
        if not self.options.dry_run:
            if not self.compose.write_files():
                return False
        else:
            Logger.info("(dry-run) Arquivos de configuração seriam gerados")
        
        # 5. Pull da imagem
        Logger.step(5, self.TOTAL_STEPS, "Baixando imagem Docker")
        if not self.options.dry_run:
            if not self.containers.pull_image():
                return False
        else:
            Logger.info(f"(dry-run) Imagem {CONFIG.IMAGE} seria baixada")
        
        # 6. Iniciar containers
        Logger.step(6, self.TOTAL_STEPS, "Iniciando containers")
        if not self.options.dry_run:
            if not self.containers.start():
                return False
        else:
            Logger.info("(dry-run) Containers seriam iniciados")
        
        # 7. Health check
        Logger.step(7, self.TOTAL_STEPS, "Verificando saúde")
        if not self.options.dry_run:
            if not self.containers.health_check():
                Logger.warning("Health check falhou, mas instalação continua")
        else:
            Logger.info("(dry-run) Health check seria executado")
        
        # 8. Criar serviço systemd
        Logger.step(8, self.TOTAL_STEPS, "Configurando serviço systemd")
        if not self.options.dry_run:
            if not self.systemd.create_service():
                Logger.warning("Falha ao criar serviço systemd")
            else:
                self.systemd.enable()
        else:
            Logger.info("(dry-run) Serviço systemd seria criado")
        
        # Exibe resumo
        self._show_summary()
        
        return True
    
    def uninstall(self) -> bool:
        """Desinstalação completa."""
        Logger.banner()
        Logger.warning("Iniciando desinstalação do TSiJUKEBOX...")
        
        if self.options.dry_run:
            Logger.warning("Modo dry-run: nenhuma alteração será feita")
        
        # Para e remove containers
        Logger.info("Parando containers...")
        if not self.options.dry_run:
            self.containers.cleanup(remove_volumes=True)
        
        # Remove serviço systemd
        Logger.info("Removendo serviço systemd...")
        if not self.options.dry_run:
            self.systemd.remove()
        
        # Remove arquivos
        Logger.info("Removendo arquivos de configuração...")
        if not self.options.dry_run:
            for directory in [CONFIG.COMPOSE_DIR, CONFIG.INSTALL_DIR]:
                if directory.exists():
                    shutil.rmtree(directory)
                    Logger.debug(f"Removido: {directory}")
        
        # Pergunta sobre dados
        if not self.options.dry_run and not getattr(self.options, "keep_data", False):
            Logger.warning("Removendo dados persistentes...")
            for directory in [CONFIG.DATA_DIR, CONFIG.LOG_DIR]:
                if directory.exists():
                    shutil.rmtree(directory)
                    Logger.debug(f"Removido: {directory}")
        
        Logger.success("TSiJUKEBOX desinstalado com sucesso")
        return True
    
    def update(self) -> bool:
        """Atualização para versão mais recente."""
        Logger.banner()
        Logger.info("Atualizando TSiJUKEBOX para a versão mais recente...")
        
        if self.options.dry_run:
            Logger.warning("Modo dry-run: nenhuma alteração será feita")
            return True
        
        # Backup antes de atualizar
        Logger.info("Criando backup de segurança...")
        backup_dir = CONFIG.BACKUP_DIR / datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        if CONFIG.COMPOSE_DIR.exists():
            shutil.copytree(CONFIG.COMPOSE_DIR, backup_dir / "docker", dirs_exist_ok=True)
        
        # Atualiza containers
        if not self.containers.update():
            Logger.error("Falha na atualização")
            Logger.info(f"Backup disponível em: {backup_dir}")
            return False
        
        # Health check
        if not self.containers.health_check():
            Logger.warning("Health check falhou após atualização")
        
        Logger.success("Atualização concluída com sucesso")
        return True
    
    def status(self) -> bool:
        """Exibe status da instalação."""
        Logger.banner()
        
        self.system_info = self.detector.detect()
        container_status = self.containers.status()
        service_status = self.systemd.status()
        
        print(f"\n{Colors.BOLD}═══ Status do TSiJUKEBOX ═══{Colors.RESET}\n")
        
        # Informações do sistema
        print(f"{Colors.CYAN}Sistema:{Colors.RESET}")
        print(f"  Hostname:     {self.system_info.hostname}")
        print(f"  Distro:       {self.system_info.distro_name}")
        print(f"  Kernel:       {self.system_info.kernel_version}")
        print(f"  RAM:          {self.system_info.ram_available_gb}/{self.system_info.ram_total_gb} GB")
        print(f"  Disco:        {self.system_info.disk_available_gb}/{self.system_info.disk_total_gb} GB")
        
        # Docker
        print(f"\n{Colors.CYAN}Docker:{Colors.RESET}")
        docker_status = f"{Colors.GREEN}Rodando{Colors.RESET}" if self.system_info.docker_running else f"{Colors.RED}Parado{Colors.RESET}"
        print(f"  Status:       {docker_status}")
        print(f"  Versão:       {self.system_info.docker_version}")
        print(f"  Compose:      {self.system_info.compose_version}")
        
        # Containers
        print(f"\n{Colors.CYAN}Containers:{Colors.RESET}")
        if container_status["running"]:
            print(f"  Status:       {Colors.GREEN}Rodando{Colors.RESET}")
            for container in container_status.get("containers", []):
                name = container.get("Name", "unknown")
                state = container.get("State", "unknown")
                print(f"  - {name}: {state}")
        else:
            print(f"  Status:       {Colors.YELLOW}Não rodando{Colors.RESET}")
        
        # Serviço
        print(f"\n{Colors.CYAN}Serviço Systemd:{Colors.RESET}")
        if service_status == "active":
            print(f"  Status:       {Colors.GREEN}Ativo{Colors.RESET}")
        else:
            print(f"  Status:       {Colors.YELLOW}{service_status}{Colors.RESET}")
        
        # Acesso
        port = CONFIG.DEFAULT_PORT
        env_file = CONFIG.COMPOSE_DIR / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("PORT="):
                    try:
                        port = int(line.split("=")[1])
                    except ValueError:
                        pass
        
        print(f"\n{Colors.CYAN}Acesso:{Colors.RESET}")
        print(f"  URL:          http://localhost:{port}")
        if getattr(self.options, "monitoring", False):
            print(f"  Grafana:      http://localhost:3001")
            print(f"  Prometheus:   http://localhost:9090")
        
        print()
        return True
    
    def _show_summary(self) -> None:
        """Exibe resumo da instalação."""
        port = getattr(self.options, "port", CONFIG.DEFAULT_PORT)
        
        print(f"""
{Colors.GREEN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════════════════════╗
║                    ✓ INSTALAÇÃO CONCLUÍDA COM SUCESSO!                       ║
╚══════════════════════════════════════════════════════════════════════════════╝
{Colors.RESET}
{Colors.CYAN}Acesse:{Colors.RESET}
  → TSiJUKEBOX:   {Colors.BOLD}http://localhost:{port}{Colors.RESET}
""")
        
        if getattr(self.options, "monitoring", False):
            print(f"""  → Grafana:      http://localhost:3001  (admin/tsijukebox)
  → Prometheus:   http://localhost:9090
""")
        
        print(f"""{Colors.CYAN}Comandos úteis:{Colors.RESET}
  sudo systemctl status {CONFIG.SERVICE_NAME}   # Ver status
  sudo systemctl restart {CONFIG.SERVICE_NAME}  # Reiniciar
  sudo python3 docker-install.py --status       # Status detalhado
  sudo python3 docker-install.py --update       # Atualizar
  sudo python3 docker-install.py --uninstall    # Desinstalar

{Colors.CYAN}Logs:{Colors.RESET}
  docker compose -f {CONFIG.COMPOSE_DIR}/docker-compose.yml logs -f
""")


# ============================================================================
# ENTRY POINT
# ============================================================================

def parse_args() -> argparse.Namespace:
    """Parse argumentos da linha de comando."""
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX Docker Autonomous Installer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  sudo python3 docker-install.py                    # Instalação básica
  sudo python3 docker-install.py --port 8080        # Porta personalizada
  sudo python3 docker-install.py --monitoring       # Com Grafana/Prometheus
  sudo python3 docker-install.py --ssl              # Com HTTPS
  sudo python3 docker-install.py --update           # Atualizar
  sudo python3 docker-install.py --uninstall        # Desinstalar
  sudo python3 docker-install.py --status           # Ver status
        """
    )
    
    # Modos de operação
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument(
        "--uninstall",
        action="store_true",
        help="Desinstalar TSiJUKEBOX"
    )
    modes.add_argument(
        "--update",
        action="store_true",
        help="Atualizar para a versão mais recente"
    )
    modes.add_argument(
        "--status",
        action="store_true",
        help="Exibir status da instalação"
    )
    
    # Opções de configuração
    parser.add_argument(
        "--port", "-p",
        type=int,
        default=CONFIG.DEFAULT_PORT,
        help=f"Porta HTTP (padrão: {CONFIG.DEFAULT_PORT})"
    )
    parser.add_argument(
        "--monitoring", "-m",
        action="store_true",
        help="Incluir stack de monitoramento (Grafana + Prometheus)"
    )
    parser.add_argument(
        "--cache",
        action="store_true",
        help="Incluir Redis cache"
    )
    
    # SSL Options
    ssl_group = parser.add_argument_group("SSL/HTTPS Options")
    ssl_group.add_argument(
        "--ssl",
        action="store_true",
        help="Habilitar HTTPS com certificado auto-assinado (desenvolvimento)"
    )
    ssl_group.add_argument(
        "--ssl-letsencrypt",
        action="store_true",
        dest="ssl_letsencrypt",
        help="Habilitar HTTPS com Let's Encrypt (produção - requer domínio público)"
    )
    ssl_group.add_argument(
        "--domain",
        type=str,
        default="localhost",
        help="Domínio para SSL (padrão: localhost)"
    )
    ssl_group.add_argument(
        "--ssl-email",
        type=str,
        dest="ssl_email",
        default="",
        help="Email para notificações do Let's Encrypt (obrigatório com --ssl-letsencrypt)"
    )
    ssl_group.add_argument(
        "--ssl-staging",
        action="store_true",
        dest="ssl_staging",
        help="Usar ambiente de staging do Let's Encrypt (para testes)"
    )
    
    # Supabase
    parser.add_argument(
        "--supabase-url",
        type=str,
        default="",
        help="URL do Supabase"
    )
    parser.add_argument(
        "--supabase-key",
        type=str,
        default="",
        help="Chave pública do Supabase"
    )
    
    # Opções adicionais
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simular instalação sem executar"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Output detalhado"
    )
    parser.add_argument(
        "--keep-data",
        action="store_true",
        help="Manter dados ao desinstalar"
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"TSiJUKEBOX Installer v{CONFIG.VERSION}"
    )
    
    return parser.parse_args()


def main() -> int:
    """Função principal."""
    args = parse_args()
    
    # Configura logger
    Logger.set_verbose(args.verbose)
    Logger.set_log_file(CONFIG.LOG_DIR / "install.log")
    
    # Cria instalador
    installer = TSiJUKEBOXInstaller(args)
    
    try:
        if args.status:
            return 0 if installer.status() else 1
        elif args.uninstall:
            return 0 if installer.uninstall() else 1
        elif args.update:
            return 0 if installer.update() else 1
        else:
            return 0 if installer.install() else 1
    
    except KeyboardInterrupt:
        print()
        Logger.warning("Instalação cancelada pelo usuário")
        return 130
    
    except Exception as e:
        Logger.error(f"Erro fatal: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
