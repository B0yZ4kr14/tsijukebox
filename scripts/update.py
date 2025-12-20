#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - Update Script
======================================
Script para atualizar TSiJUKEBOX para a última versão.

USO:
    sudo python3 update.py
    sudo python3 update.py --check     # Apenas verificar atualizações
    sudo python3 update.py --force     # Forçar atualização

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import argparse
import subprocess
import shutil
from pathlib import Path
from typing import Tuple, List, Optional

VERSION = "4.1.0"
INSTALL_DIR = Path("/opt/tsijukebox")
REPO_URL = "https://github.com/B0yZ4kr14/TSiJUKEBOX.git"

# Cores ANSI
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def log(message: str, color: str = Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")


def run_command(cmd: List[str], capture: bool = True) -> Tuple[int, str, str]:
    """Executa comando shell."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            timeout=300
        )
        return result.returncode, result.stdout or "", result.stderr or ""
    except Exception as e:
        return 1, "", str(e)


def check_root():
    """Verifica se está executando como root."""
    if os.geteuid() != 0:
        log("Este script deve ser executado como root (sudo)", Colors.RED)
        sys.exit(1)


def update_system_packages() -> bool:
    """Atualiza pacotes do sistema com paru."""
    log("\n🔄 Atualizando pacotes do sistema...", Colors.CYAN)
    
    if shutil.which('paru'):
        code, out, err = run_command(['paru', '-Syu', '--noconfirm'])
    else:
        code, out, err = run_command(['pacman', '-Syu', '--noconfirm'])
    
    if code == 0:
        log("✅ Pacotes do sistema atualizados", Colors.GREEN)
        return True
    else:
        log(f"⚠️  Alguns pacotes podem ter falhado: {err}", Colors.YELLOW)
        return True  # Continuar mesmo com avisos


def check_for_updates() -> Tuple[bool, str]:
    """Verifica se há atualizações disponíveis."""
    log("\n🔍 Verificando atualizações...", Colors.CYAN)
    
    if not INSTALL_DIR.exists():
        return False, "TSiJUKEBOX não está instalado"
    
    # Verificar se é um repositório git
    if not (INSTALL_DIR / '.git').exists():
        return False, "Diretório de instalação não é um repositório git"
    
    # Fetch das últimas mudanças
    code, _, err = run_command(
        ['git', '-C', str(INSTALL_DIR), 'fetch', 'origin'],
        capture=True
    )
    
    if code != 0:
        return False, f"Erro ao verificar atualizações: {err}"
    
    # Verificar diferenças
    code, out, _ = run_command(
        ['git', '-C', str(INSTALL_DIR), 'log', 'HEAD..origin/main', '--oneline'],
        capture=True
    )
    
    if out.strip():
        commits = out.strip().split('\n')
        return True, f"{len(commits)} commit(s) disponíveis"
    else:
        return False, "Já está na versão mais recente"


def update_application() -> bool:
    """Atualiza a aplicação TSiJUKEBOX."""
    log("\n📥 Atualizando TSiJUKEBOX...", Colors.CYAN)
    
    if not INSTALL_DIR.exists():
        log("❌ TSiJUKEBOX não está instalado", Colors.RED)
        return False
    
    # Parar serviço
    log("⏹️  Parando serviço...", Colors.YELLOW)
    run_command(['systemctl', 'stop', 'tsijukebox.service'], capture=True)
    
    # Pull das últimas mudanças
    code, out, err = run_command(
        ['git', '-C', str(INSTALL_DIR), 'pull', 'origin', 'main'],
        capture=True
    )
    
    if code != 0:
        log(f"❌ Erro ao atualizar: {err}", Colors.RED)
        # Tentar reiniciar serviço
        run_command(['systemctl', 'start', 'tsijukebox.service'])
        return False
    
    # Reinstalar dependências npm
    log("📦 Instalando dependências...", Colors.CYAN)
    result = subprocess.run(
        ['npm', 'install'],
        cwd=str(INSTALL_DIR),
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        log(f"⚠️  Aviso ao instalar dependências: {result.stderr}", Colors.YELLOW)
    
    # Rebuild da aplicação
    log("🔨 Reconstruindo aplicação...", Colors.CYAN)
    result = subprocess.run(
        ['npm', 'run', 'build'],
        cwd=str(INSTALL_DIR),
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        log(f"⚠️  Aviso ao reconstruir: {result.stderr}", Colors.YELLOW)
    
    # Reiniciar serviço
    log("▶️  Reiniciando serviço...", Colors.CYAN)
    run_command(['systemctl', 'start', 'tsijukebox.service'])
    run_command(['systemctl', 'daemon-reload'])
    
    log("✅ TSiJUKEBOX atualizado com sucesso!", Colors.GREEN)
    return True


def update_spicetify() -> bool:
    """Atualiza Spicetify CLI."""
    log("\n🎵 Atualizando Spicetify...", Colors.CYAN)
    
    if not shutil.which('spicetify'):
        log("⏭️  Spicetify não está instalado, pulando...", Colors.YELLOW)
        return True
    
    code, out, err = run_command(['spicetify', 'upgrade'], capture=True)
    
    if code == 0:
        log("✅ Spicetify atualizado", Colors.GREEN)
        
        # Reaplicar customizações
        run_command(['spicetify', 'apply'], capture=True)
        return True
    else:
        log(f"⚠️  Erro ao atualizar Spicetify: {err}", Colors.YELLOW)
        return False


def main():
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise - Update Script'
    )
    parser.add_argument('--check', action='store_true',
                       help='Apenas verificar atualizações')
    parser.add_argument('--force', action='store_true',
                       help='Forçar atualização')
    parser.add_argument('--system', action='store_true',
                       help='Atualizar também pacotes do sistema')
    parser.add_argument('--version', action='version', 
                       version=f'TSiJUKEBOX Updater v{VERSION}')
    
    args = parser.parse_args()
    
    # Banner
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗
║              TSiJUKEBOX Enterprise - Update                       ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    check_root()
    
    # Verificar atualizações
    has_updates, message = check_for_updates()
    
    if args.check:
        if has_updates:
            log(f"📦 Atualizações disponíveis: {message}", Colors.GREEN)
        else:
            log(f"✅ {message}", Colors.GREEN)
        sys.exit(0)
    
    if not has_updates and not args.force:
        log(f"✅ {message}", Colors.GREEN)
        
        if args.system:
            update_system_packages()
        
        sys.exit(0)
    
    if has_updates:
        log(f"📦 {message}", Colors.CYAN)
    
    # Executar atualizações
    success = True
    
    if args.system:
        success = update_system_packages() and success
    
    success = update_application() and success
    success = update_spicetify() and success
    
    if success:
        print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════════╗
║                    ✅ ATUALIZAÇÃO COMPLETA!                       ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}

Reinicie o sistema para aplicar todas as mudanças:
  sudo reboot
""")
    else:
        log("\n⚠️  Algumas atualizações falharam", Colors.YELLOW)
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
