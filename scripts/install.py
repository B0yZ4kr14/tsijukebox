#!/usr/bin/env python3
"""
TSiJUKEBOX Installer Shim v6.0.0
================================
Lightweight shim that downloads and executes the unified installer.

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

VERSION = "6.0.0"
REPO_BASE = "https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main"
UNIFIED_INSTALLER = f"{REPO_BASE}/scripts/unified-installer.py"
STANDALONE_INSTALLER = f"{REPO_BASE}/scripts/install_standalone.py"

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


def print_banner():
    """Exibe banner do instalador."""
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  {Colors.MAGENTA}████████╗███████╗██╗     ██╗██╗   ██╗██╗  ██╗███████╗██████╗  ██████╗ ██╗  ██╗{Colors.CYAN}  ║
║  {Colors.MAGENTA}╚══██╔══╝██╔════╝██║     ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗╚██╗██╔╝{Colors.CYAN}  ║
║  {Colors.MAGENTA}   ██║   ███████╗██║     ██║██║   ██║█████╔╝ █████╗  ██████╔╝██║   ██║ ╚███╔╝{Colors.CYAN}   ║
║  {Colors.MAGENTA}   ██║   ╚════██║██║██   ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║ ██╔██╗{Colors.CYAN}   ║
║  {Colors.MAGENTA}   ██║   ███████║██║╚█████╔╝╚██████╔╝██║  ██╗███████╗██████╔╝╚██████╔╝██╔╝ ██╗{Colors.CYAN}  ║
║  {Colors.MAGENTA}   ╚═╝   ╚══════╝╚═╝ ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝{Colors.CYAN}  ║
║                                                                              ║
║  {Colors.WHITE}Enterprise Media Server - Installer Shim v{VERSION}{Colors.CYAN}                          ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")


def log_info(msg: str):
    print(f"{Colors.BLUE}ℹ{Colors.RESET}  {msg}")


def log_success(msg: str):
    print(f"{Colors.GREEN}✓{Colors.RESET}  {msg}")


def log_warning(msg: str):
    print(f"{Colors.YELLOW}⚠{Colors.RESET}  {msg}")


def log_error(msg: str):
    print(f"{Colors.RED}✗{Colors.RESET}  {msg}")


def download_script(url: str, dest: Path) -> bool:
    """Download installer script from GitHub."""
    log_info(f"Baixando: {url}")
    
    try:
        # Criar contexto SSL que aceita certificados
        ctx = ssl.create_default_context()
        
        with urllib.request.urlopen(url, context=ctx, timeout=30) as response:
            content = response.read()
            
            # Validar que é Python válido (não placeholder JS)
            first_line = content.decode('utf-8', errors='ignore').split('\n')[0]
            if first_line.startswith('//'):
                log_error("Arquivo corrompido detectado (placeholder JS)")
                log_error("O script no repositório está com conteúdo inválido.")
                return False
            
            dest.write_bytes(content)
            log_success(f"Download concluído: {dest}")
            return True
            
    except urllib.error.URLError as e:
        log_error(f"Erro de rede: {e}")
        return False
    except Exception as e:
        log_error(f"Erro ao baixar: {e}")
        return False


def execute_script(script_path: Path, args: list) -> int:
    """Execute downloaded Python script."""
    log_info(f"Executando: python3 {script_path}")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)] + args,
            check=False
        )
        return result.returncode
    except Exception as e:
        log_error(f"Erro ao executar script: {e}")
        return 1


def is_running_from_pipe() -> bool:
    """Detecta se script está sendo executado via pipe (curl | python3)."""
    return not sys.stdin.isatty()


def main() -> int:
    """Entry point principal."""
    print_banner()
    
    # Verificar se está rodando como root
    if os.geteuid() != 0:
        log_warning("Este script deve ser executado como root (sudo)")
        log_info("Tentando continuar mesmo assim...")
    
    # Verificar versão do Python
    if sys.version_info < (3, 8):
        log_error(f"Python 3.8+ necessário (atual: {sys.version_info.major}.{sys.version_info.minor})")
        return 1
    
    # Se estamos rodando via pipe, baixar e executar o instalador unificado
    if is_running_from_pipe():
        log_info("Detectado: execução via pipe (curl | python3)")
        log_info("Baixando instalador unificado...")
        
        with tempfile.TemporaryDirectory() as tmpdir:
            installer_path = Path(tmpdir) / "unified-installer.py"
            
            # Tentar baixar unified-installer.py
            if download_script(UNIFIED_INSTALLER, installer_path):
                log_success("Instalador unificado baixado")
                return execute_script(installer_path, sys.argv[1:])
            
            # Fallback para standalone
            log_warning("Tentando instalador standalone...")
            standalone_path = Path(tmpdir) / "install_standalone.py"
            
            if download_script(STANDALONE_INSTALLER, standalone_path):
                log_success("Instalador standalone baixado")
                return execute_script(standalone_path, sys.argv[1:])
            
            log_error("Não foi possível baixar nenhum instalador")
            log_info("Tente manualmente:")
            log_info("  git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git")
            log_info("  cd TSiJUKEBOX")
            log_info("  sudo python3 scripts/unified-installer.py")
            return 1
    
    # Se estamos rodando localmente, verificar se unified-installer.py existe
    script_dir = Path(__file__).parent
    unified_path = script_dir / "unified-installer.py"
    standalone_path = script_dir / "install_standalone.py"
    
    if unified_path.exists():
        log_info("Executando instalador unificado local...")
        return execute_script(unified_path, sys.argv[1:])
    
    if standalone_path.exists():
        log_info("Executando instalador standalone local...")
        return execute_script(standalone_path, sys.argv[1:])
    
    log_error("Nenhum instalador encontrado localmente")
    log_info("Baixando do repositório...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        installer_path = Path(tmpdir) / "unified-installer.py"
        
        if download_script(UNIFIED_INSTALLER, installer_path):
            return execute_script(installer_path, sys.argv[1:])
        
        log_error("Falha ao baixar instalador")
        return 1


if __name__ == "__main__":
    sys.exit(main())
