#!/usr/bin/env python3
"""
TSiJUKEBOX Installer Shim v7.0.0
================================

Lightweight shim that downloads and executes the unified installer with a modern UI.

This file is safe to run via: curl -fsSL .../install.py | sudo python3

If run directly, it downloads and executes unified-installer.py from GitHub.

USO:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import tempfile
import urllib.request
import ssl
import subprocess
from pathlib import Path

VERSION = "7.0.0"
REPO_BASE = "https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main"
UNIFIED_INSTALLER_URL = f"{REPO_BASE}/scripts/unified-installer.py"

# --- Design System: Dark Neon Gold Black ---
class Colors:
    GOLD = '\033[38;2;251;191;36m'  # #fbbf24
    CYAN = '\033[38;2;0;212;255m'    # #00d4ff
    MAGENTA = '\033[38;2;255;0;255m'
    WHITE = '\033[97m'
    GRAY = '\033[38;5;242m'
    GREEN = '\033[38;2;34;197;94m'   # #22c55e
    RED = '\033[38;2;239;68;68m'     # #ef4444
    RESET = '\033[0m'
    BOLD = '\033[1m'

class Icons:
    ROCKET = "🚀"
    DOWNLOAD = "📥"
    EXECUTE = "⚙️"
    SUCCESS = "✅"
    ERROR = "❌"
    WARN = "⚠️"
    INFO = "ℹ️"
    PYTHON = "🐍"
    ROOT = "🔑"

# --- Logging Functions ---
def log_info(msg: str):
    print(f"{Colors.CYAN}{Icons.INFO}{Colors.RESET}  {Colors.GRAY}{msg}{Colors.RESET}")

def log_success(msg: str):
    print(f"{Colors.GREEN}{Icons.SUCCESS}{Colors.RESET}  {Colors.BOLD}{msg}{Colors.RESET}")

def log_warning(msg: str):
    print(f"{Colors.GOLD}{Icons.WARN}{Colors.RESET}  {msg}{Colors.RESET}")

def log_error(msg: str):
    print(f"{Colors.RED}{Icons.ERROR}{Colors.RESET}  {Colors.BOLD}{msg}{Colors.RESET}")

def print_banner():
    """Displays the installer banner with the new design."""
    banner = f"""
{Colors.GRAY}┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   {Colors.GOLD}████████╗███████╗██╗     ██╗██╗   ██╗██╗  ██╗███████╗██████╗  ██████╗ ██╗  ██╗{Colors.GRAY}   │
│   {Colors.GOLD}╚══██╔══╝██╔════╝██║     ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗╚██╗██╔╝{Colors.GRAY}   │
│   {Colors.GOLD}   ██║   ███████╗██║     ██║██║   ██║█████╔╝ █████╗  ██████╔╝██║   ██║ ╚███╔╝ {Colors.GRAY}    │
│   {Colors.GOLD}   ██║   ╚════██║██║██   ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║ ██╔██╗ {Colors.GRAY}    │
│   {Colors.GOLD}   ██║   ███████║██║╚█████╔╝╚██████╔╝██║  ██╗███████╗██████╔╝╚██████╔╝██╔╝ ██╗{Colors.GRAY}   │
│   {Colors.GOLD}   ╚═╝   ╚══════╝╚═╝ ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝{Colors.GRAY}   │
│                                                                          │
│   {Colors.WHITE}{Colors.BOLD}Enterprise Jukebox System - Installer Shim v{VERSION}{Colors.GRAY}                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘{Colors.RESET}
"""
    print(banner)

# --- Core Functions ---
def download_script(url: str, dest: Path) -> bool:
    """Download installer script from GitHub with improved error handling."""
    log_info(f"{Icons.DOWNLOAD} Baixando instalador de: {Colors.CYAN}{url}{Colors.RESET}")
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(url, context=ctx, timeout=30) as response, open(dest, 'wb') as out_file:
            out_file.write(response.read())
        log_success(f"Download concluído: {dest}")
        return True
    except Exception as e:
        log_error(f"Falha no download: {e}")
        return False

def execute_script(script_path: Path, args: list) -> int:
    """Execute downloaded Python script with better feedback."""
    log_info(f"{Icons.EXECUTE} Executando: {Colors.CYAN}python3 {script_path}{' '.join(args)}{Colors.RESET}")
    try:
        process = subprocess.run(
            [sys.executable, str(script_path)] + args,
            check=True,  # Exit on error
            text=True,
            capture_output=True
        )
        if process.stdout:
            print(f"{Colors.GRAY}{process.stdout}{Colors.RESET}")
        log_success("Execução do script concluída com sucesso.")
        return 0
    except subprocess.CalledProcessError as e:
        log_error(f"O script de instalação falhou (código de saída: {e.returncode}).")
        if e.stderr:
            print(f"{Colors.RED}{e.stderr}{Colors.RESET}")
        return e.returncode
    except Exception as e:
        log_error(f"Erro inesperado ao executar o script: {e}")
        return 1

def check_prerequisites():
    """Check for root and Python version."""
    if os.geteuid() != 0:
        log_warning(f"{Icons.ROOT} Este script requer privilégios de root (sudo).")
        return False
    if sys.version_info < (3, 8):
        log_error(f"{Icons.PYTHON} Python 3.8+ é necessário (você tem {sys.version_info.major}.{sys.version_info.minor}).")
        return False
    return True

def main() -> int:
    """Main entry point."""
    print_banner()

    if not check_prerequisites():
        return 1

    with tempfile.TemporaryDirectory() as tmpdir:
        installer_path = Path(tmpdir) / "unified-installer.py"
        if download_script(UNIFIED_INSTALLER_URL, installer_path):
            return execute_script(installer_path, sys.argv[1:])
        else:
            log_error("Não foi possível baixar o instalador principal.")
            log_info("Tente a instalação manual:")
            log_info(f"  {Colors.CYAN}git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git{Colors.RESET}")
            log_info(f"  {Colors.CYAN}cd TSiJUKEBOX{Colors.RESET}")
            log_info(f"  {Colors.CYAN}sudo python3 scripts/unified-installer.py{Colors.RESET}")
            return 1

if __name__ == "__main__":
    sys.exit(main())
