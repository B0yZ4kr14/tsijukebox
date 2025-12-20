#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Verification Script
=============================================
Script para verificar se a instalação está funcionando corretamente.

USO:
    python3 verify.py
    python3 verify.py --fix      # Tentar corrigir problemas
    python3 verify.py --verbose  # Mais detalhes

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import pwd
import shutil
import socket
import argparse
import subprocess
from pathlib import Path
from typing import List, Tuple, Dict, Optional
from dataclasses import dataclass, field

VERSION = "4.1.0"

# Cores ANSI
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


@dataclass
class CheckResult:
    """Resultado de uma verificação."""
    name: str
    passed: bool
    message: str
    fix_command: Optional[str] = None
    critical: bool = False


@dataclass
class VerificationReport:
    """Relatório de verificação."""
    checks: List[CheckResult] = field(default_factory=list)
    
    @property
    def passed(self) -> int:
        return sum(1 for c in self.checks if c.passed)
    
    @property
    def failed(self) -> int:
        return sum(1 for c in self.checks if not c.passed)
    
    @property
    def critical_failed(self) -> int:
        return sum(1 for c in self.checks if not c.passed and c.critical)


def log(message: str, color: str = Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")


def run_command(cmd: List[str], capture: bool = True) -> Tuple[int, str, str]:
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


def check_port(port: int) -> bool:
    """Verifica se uma porta está em uso."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


class SystemVerifier:
    """Verificador de sistema TSiJUKEBOX."""
    
    INSTALL_DIR = Path("/opt/tsijukebox")
    CONFIG_DIR = Path("/etc/tsijukebox")
    DATA_DIR = Path("/var/lib/tsijukebox")
    LOG_DIR = Path("/var/log/tsijukebox")
    
    REQUIRED_PACKAGES = [
        'nodejs', 'npm', 'chromium', 'openbox', 
        'xorg-server', 'xorg-xinit', 'unclutter'
    ]
    
    OPTIONAL_PACKAGES = [
        'spotify-launcher', 'nginx', 'grafana', 'prometheus'
    ]
    
    REQUIRED_SERVICES = ['tsijukebox']
    OPTIONAL_SERVICES = ['nginx', 'grafana', 'prometheus']
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.report = VerificationReport()
    
    def _add_check(
        self,
        name: str,
        passed: bool,
        message: str,
        fix_command: Optional[str] = None,
        critical: bool = False
    ):
        """Adiciona um resultado de verificação."""
        self.report.checks.append(CheckResult(
            name=name,
            passed=passed,
            message=message,
            fix_command=fix_command,
            critical=critical
        ))
        
        status = f"{Colors.GREEN}✓{Colors.RESET}" if passed else f"{Colors.RED}✗{Colors.RESET}"
        color = Colors.GREEN if passed else Colors.RED
        
        print(f"  {status} {name}: {color}{message}{Colors.RESET}")
    
    def check_directories(self) -> None:
        """Verifica diretórios de instalação."""
        log("\n📁 Verificando diretórios...", Colors.CYAN)
        
        directories = [
            (self.INSTALL_DIR, "Diretório de instalação", True),
            (self.CONFIG_DIR, "Diretório de configuração", False),
            (self.DATA_DIR, "Diretório de dados", False),
            (self.LOG_DIR, "Diretório de logs", False),
        ]
        
        for path, name, critical in directories:
            if path.exists():
                self._add_check(name, True, f"OK ({path})")
            else:
                self._add_check(
                    name, False, f"Não encontrado ({path})",
                    fix_command=f"sudo mkdir -p {path}",
                    critical=critical
                )
    
    def check_packages(self) -> None:
        """Verifica pacotes instalados."""
        log("\n📦 Verificando pacotes...", Colors.CYAN)
        
        # Obter lista de pacotes instalados
        code, out, _ = run_command(['pacman', '-Qq'])
        installed = out.strip().split('\n') if code == 0 else []
        
        # Verificar pacotes obrigatórios
        for pkg in self.REQUIRED_PACKAGES:
            if pkg in installed:
                self._add_check(f"Pacote {pkg}", True, "Instalado")
            else:
                self._add_check(
                    f"Pacote {pkg}", False, "Não instalado",
                    fix_command=f"sudo pacman -S --noconfirm {pkg}",
                    critical=True
                )
        
        # Verificar pacotes opcionais
        for pkg in self.OPTIONAL_PACKAGES:
            if pkg in installed:
                self._add_check(f"Pacote {pkg} (opcional)", True, "Instalado")
            else:
                self._add_check(
                    f"Pacote {pkg} (opcional)", True, "Não instalado (opcional)"
                )
    
    def check_services(self) -> None:
        """Verifica serviços systemd."""
        log("\n⚙️  Verificando serviços...", Colors.CYAN)
        
        for service in self.REQUIRED_SERVICES:
            code, out, _ = run_command(['systemctl', 'is-active', f'{service}.service'])
            active = out.strip() == 'active'
            
            code, out, _ = run_command(['systemctl', 'is-enabled', f'{service}.service'])
            enabled = out.strip() == 'enabled'
            
            if active and enabled:
                self._add_check(f"Serviço {service}", True, "Ativo e habilitado")
            elif enabled:
                self._add_check(
                    f"Serviço {service}", False, "Habilitado mas não ativo",
                    fix_command=f"sudo systemctl start {service}.service"
                )
            else:
                self._add_check(
                    f"Serviço {service}", False, "Não habilitado",
                    fix_command=f"sudo systemctl enable --now {service}.service",
                    critical=True
                )
    
    def check_network(self) -> None:
        """Verifica portas de rede."""
        log("\n🌐 Verificando rede...", Colors.CYAN)
        
        ports = [
            (5173, "TSiJUKEBOX (Vite)", True),
            (80, "HTTP (Nginx)", False),
            (443, "HTTPS (Nginx)", False),
            (3000, "Grafana", False),
            (9090, "Prometheus", False),
        ]
        
        for port, name, required in ports:
            if check_port(port):
                self._add_check(f"Porta {port} ({name})", True, "Em uso")
            else:
                if required:
                    self._add_check(
                        f"Porta {port} ({name})", False, "Não disponível",
                        critical=True
                    )
                else:
                    self._add_check(
                        f"Porta {port} ({name})", True, "Não em uso (opcional)"
                    )
    
    def check_user_config(self) -> None:
        """Verifica configuração do usuário."""
        log("\n👤 Verificando configuração de usuário...", Colors.CYAN)
        
        # Detectar usuário kiosk
        sudo_user = os.environ.get('SUDO_USER', '')
        if not sudo_user:
            for pw in pwd.getpwall():
                if 1000 <= pw.pw_uid < 60000:
                    sudo_user = pw.pw_name
                    break
        
        if not sudo_user:
            sudo_user = 'tsi'
        
        home = Path(pwd.getpwnam(sudo_user).pw_dir) if sudo_user else None
        
        if home:
            # Verificar .xinitrc
            xinitrc = home / '.xinitrc'
            if xinitrc.exists():
                content = xinitrc.read_text()
                if 'TSiJUKEBOX' in content or 'spotify' in content.lower():
                    self._add_check(".xinitrc", True, "Configurado para TSiJUKEBOX")
                else:
                    self._add_check(".xinitrc", False, "Não configurado para TSiJUKEBOX")
            else:
                self._add_check(".xinitrc", False, "Não encontrado")
            
            # Verificar diretório de músicas
            music_dir = home / 'Musics'
            if music_dir.exists():
                self._add_check("Diretório ~/Musics", True, "Existe")
            else:
                self._add_check(
                    "Diretório ~/Musics", False, "Não encontrado",
                    fix_command=f"mkdir -p {music_dir}"
                )
            
            # Verificar Chromium config
            chromium_prefs = home / '.config' / 'chromium' / 'Default' / 'Preferences'
            if chromium_prefs.exists():
                self._add_check("Chromium Preferences", True, "Configurado")
            else:
                self._add_check("Chromium Preferences", True, "Não configurado (opcional)")
    
    def check_autologin(self) -> None:
        """Verifica configuração de autologin."""
        log("\n🔐 Verificando autologin...", Colors.CYAN)
        
        # Verificar getty autologin
        getty_override = Path('/etc/systemd/system/getty@tty1.service.d/autologin.conf')
        if getty_override.exists():
            self._add_check("Autologin getty", True, "Configurado")
        else:
            # Verificar SDDM
            sddm_config = Path('/etc/sddm.conf.d/autologin.conf')
            if sddm_config.exists():
                self._add_check("Autologin SDDM", True, "Configurado")
            else:
                # Verificar LightDM
                lightdm_config = Path('/etc/lightdm/lightdm.conf.d/50-autologin.conf')
                if lightdm_config.exists():
                    self._add_check("Autologin LightDM", True, "Configurado")
                else:
                    self._add_check("Autologin", False, "Não configurado")
    
    def check_spotify(self) -> None:
        """Verifica instalação do Spotify/Spicetify."""
        log("\n🎵 Verificando Spotify/Spicetify...", Colors.CYAN)
        
        # Verificar Spotify
        if shutil.which('spotify'):
            self._add_check("Spotify", True, "Instalado")
        else:
            self._add_check(
                "Spotify", False, "Não instalado",
                fix_command="paru -S --noconfirm spotify-launcher"
            )
        
        # Verificar Spicetify
        if shutil.which('spicetify'):
            code, out, _ = run_command(['spicetify', '--version'])
            version = out.strip() if code == 0 else "desconhecida"
            self._add_check("Spicetify", True, f"Instalado (v{version})")
        else:
            self._add_check("Spicetify (opcional)", True, "Não instalado")
    
    def check_database(self) -> None:
        """Verifica banco de dados."""
        log("\n💾 Verificando banco de dados...", Colors.CYAN)
        
        db_file = self.DATA_DIR / "tsijukebox.db"
        if db_file.exists():
            size_mb = db_file.stat().st_size / (1024 * 1024)
            self._add_check("Banco SQLite", True, f"OK ({size_mb:.2f} MB)")
        else:
            config_file = self.CONFIG_DIR / "database.json"
            if config_file.exists():
                self._add_check("Config do banco", True, "Configurado")
            else:
                self._add_check("Banco de dados", True, "Não inicializado (será criado no primeiro uso)")
    
    def run_all_checks(self) -> VerificationReport:
        """Executa todas as verificações."""
        self.check_directories()
        self.check_packages()
        self.check_services()
        self.check_network()
        self.check_user_config()
        self.check_autologin()
        self.check_spotify()
        self.check_database()
        
        return self.report
    
    def fix_issues(self) -> int:
        """Tenta corrigir problemas encontrados."""
        fixed = 0
        
        for check in self.report.checks:
            if not check.passed and check.fix_command:
                log(f"\n🔧 Corrigindo: {check.name}", Colors.YELLOW)
                log(f"   Comando: {check.fix_command}", Colors.BLUE)
                
                code, _, err = run_command(check.fix_command.split())
                
                if code == 0:
                    log(f"   ✓ Corrigido", Colors.GREEN)
                    fixed += 1
                else:
                    log(f"   ✗ Falhou: {err}", Colors.RED)
        
        return fixed


def main():
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise - Verification Script'
    )
    parser.add_argument('--fix', action='store_true',
                       help='Tentar corrigir problemas automaticamente')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Modo verboso')
    parser.add_argument('--version', action='version',
                       version=f'TSiJUKEBOX Verifier v{VERSION}')
    
    args = parser.parse_args()
    
    # Banner
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗
║           TSiJUKEBOX Enterprise - System Verification             ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    verifier = SystemVerifier(verbose=args.verbose)
    report = verifier.run_all_checks()
    
    # Resumo
    print(f"""
{Colors.CYAN}═══════════════════════════════════════════════════════════════════{Colors.RESET}
{Colors.BOLD}RESUMO:{Colors.RESET}
  ✓ Verificações OK: {Colors.GREEN}{report.passed}{Colors.RESET}
  ✗ Problemas encontrados: {Colors.RED if report.failed else Colors.GREEN}{report.failed}{Colors.RESET}
  ⚠️  Problemas críticos: {Colors.RED if report.critical_failed else Colors.GREEN}{report.critical_failed}{Colors.RESET}
""")
    
    # Tentar corrigir se solicitado
    if args.fix and report.failed > 0:
        fixed = verifier.fix_issues()
        log(f"\n✅ {fixed} problema(s) corrigido(s)", Colors.GREEN)
    
    # Listar comandos de correção
    elif report.failed > 0:
        log("\n💡 Comandos para corrigir problemas:", Colors.YELLOW)
        for check in report.checks:
            if not check.passed and check.fix_command:
                print(f"   {check.fix_command}")
        
        log("\nOu execute com --fix para tentar corrigir automaticamente", Colors.CYAN)
    
    # Código de saída
    if report.critical_failed > 0:
        sys.exit(2)
    elif report.failed > 0:
        sys.exit(1)
    else:
        log("✅ Sistema TSiJUKEBOX está funcionando corretamente!", Colors.GREEN)
        sys.exit(0)


if __name__ == "__main__":
    main()
