#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise Installer
================================
Instalador completo com landing page visual e wizard interativo.

Requer: Python 3.10+, execução como root (sudo)
Compatível: Arch Linux, CachyOS, Manjaro

Uso:
    sudo python3 main.py           # Modo wizard (landing page)
    sudo python3 main.py --auto    # Modo automático com defaults
    sudo python3 main.py --help    # Ajuda

Autor: B0.y_Z4kr14
Licença: Domínio Público (ver docs/CREDITS.md)
"""

import os
import sys
import argparse
import asyncio
import json
from pathlib import Path

# Importações locais
from config import Config, Colors
from system_check import SystemChecker
from package_manager import PackageManager
from user_manager import UserManager
from database_manager import DatabaseManager
from cloud_setup import CloudSetup
from spicetify_setup import SpicetifySetup
from auth_setup import AuthSetup
from docker_setup import DockerSetup
from landing_server import LandingServer


def check_root():
    """Verifica se está executando como root"""
    if os.geteuid() != 0:
        print(f"{Colors.RED}[ERRO] Este script deve ser executado como root (sudo){Colors.RESET}")
        print(f"{Colors.YELLOW}Uso: sudo python3 main.py{Colors.RESET}")
        sys.exit(1)


def print_banner():
    """Exibe banner ASCII do TSiJUKEBOX"""
    banner = f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   {Colors.MAGENTA}████████╗{Colors.CYAN}███████╗{Colors.GREEN}██╗{Colors.CYAN}      ██╗██╗   ██╗██╗  ██╗███████╗██████╗   ║
║   {Colors.MAGENTA}╚══██╔══╝{Colors.CYAN}██╔════╝{Colors.GREEN}██║{Colors.CYAN}      ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗  ║
║   {Colors.MAGENTA}   ██║   {Colors.CYAN}███████╗{Colors.GREEN}██║{Colors.CYAN}█████ ██║██║   ██║█████╔╝ █████╗  ██████╔╝  ║
║   {Colors.MAGENTA}   ██║   {Colors.CYAN}╚════██║{Colors.GREEN}██║{Colors.CYAN}╚════ ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗  ║
║   {Colors.MAGENTA}   ██║   {Colors.CYAN}███████║{Colors.GREEN}██║{Colors.CYAN}      ██║╚██████╔╝██║  ██╗███████╗██████╔╝  ║
║   {Colors.MAGENTA}   ╚═╝   {Colors.CYAN}╚══════╝{Colors.GREEN}╚═╝{Colors.CYAN}      ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝   ║
║                                                                      ║
║   {Colors.WHITE}E N T E R P R I S E   M U S I C   S Y S T E M{Colors.CYAN}                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}

{Colors.GREEN}Instalador TSiJUKEBOX v1.0{Colors.RESET}
{Colors.YELLOW}Arch Linux • CachyOS • Manjaro{Colors.RESET}
"""
    print(banner)


def parse_arguments():
    """Parse argumentos da linha de comando"""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise Installer',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  sudo python3 main.py              Inicia o wizard visual
  sudo python3 main.py --auto       Instalação automática
  sudo python3 main.py --docker     Instala via Docker
  sudo python3 main.py --uninstall  Remove instalação existente
        """
    )
    
    parser.add_argument('--auto', action='store_true',
                       help='Instalação automática com configurações padrão')
    parser.add_argument('--docker', action='store_true',
                       help='Instala via Docker ao invés de fullstack')
    parser.add_argument('--uninstall', action='store_true',
                       help='Remove instalação existente')
    parser.add_argument('--port', type=int, default=8888,
                       help='Porta para o servidor web do wizard (padrão: 8888)')
    parser.add_argument('--no-browser', action='store_true',
                       help='Não abre o navegador automaticamente')
    parser.add_argument('--config', type=str,
                       help='Arquivo JSON com configurações personalizadas')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Modo verboso com mais detalhes')
    
    return parser.parse_args()


async def run_auto_install(config: dict):
    """Executa instalação automática sem wizard"""
    print(f"\n{Colors.CYAN}[AUTO] Iniciando instalação automática...{Colors.RESET}\n")
    
    # 1. Verificar sistema
    checker = SystemChecker()
    system_info = checker.get_full_report()
    
    print(f"{Colors.GREEN}✓ Sistema detectado: {system_info['distro']['name']}{Colors.RESET}")
    print(f"{Colors.GREEN}✓ Shell: {system_info['shell']}{Colors.RESET}")
    print(f"{Colors.GREEN}✓ RAM: {system_info['hardware']['ram_gb']:.1f} GB{Colors.RESET}")
    
    # 2. Sugestão de banco de dados
    db_suggestion = checker.suggest_database()
    print(f"{Colors.YELLOW}→ Banco recomendado: {db_suggestion['recommended']}{Colors.RESET}")
    print(f"  Motivo: {db_suggestion['reason']}")
    
    # 3. Instalar pacotes base
    pkg_manager = PackageManager()
    pkg_manager.update_system()
    pkg_manager.install_base_packages()
    
    # 4. Configurar banco de dados
    db_manager = DatabaseManager()
    db_manager.install_database(config.get('database', db_suggestion['recommended']))
    db_manager.create_default_user('admin', 'admin')
    
    # 5. Configurar autenticação
    auth = AuthSetup()
    if config.get('generate_ssh_keys', True):
        auth.generate_ssh_key()
    if config.get('generate_gpg_keys', False):
        auth.generate_gpg_key()
    
    # 6. Configurar backup em nuvem
    cloud = CloudSetup()
    for provider in config.get('cloud_providers', ['rclone']):
        cloud.install_provider(provider)
    
    # 7. Instalar Spicetify
    spicetify = SpicetifySetup()
    spicetify.install()
    spicetify.install_extensions(['shuffle+', 'keyboardShortcut', 'autoSkipVideo'])
    
    # 8. Criar usuário do sistema
    user_manager = UserManager()
    username = config.get('username', 'tsi')
    user_manager.create_user(username, config.get('shell', 'bash'))
    user_manager.create_music_directory(username)
    
    print(f"\n{Colors.GREEN}✓ Instalação concluída com sucesso!{Colors.RESET}")
    print(f"{Colors.CYAN}  Login: admin / admin{Colors.RESET}")
    print(f"{Colors.CYAN}  Diretório: /home/{username}/Music{Colors.RESET}")


async def run_wizard(port: int, no_browser: bool):
    """Inicia servidor web com wizard visual"""
    print(f"\n{Colors.CYAN}[WIZARD] Iniciando servidor de instalação...{Colors.RESET}")
    
    server = LandingServer(port=port)
    
    # Coletar informações do sistema para exibir no wizard
    checker = SystemChecker()
    system_info = checker.get_full_report()
    db_suggestion = checker.suggest_database()
    
    # Salvar para o frontend
    wizard_data = {
        'system': system_info,
        'database_suggestion': db_suggestion,
    }
    
    # Iniciar servidor
    await server.start(wizard_data, open_browser=not no_browser)


def main():
    """Função principal"""
    # Verificar root
    check_root()
    
    # Parse argumentos
    args = parse_arguments()
    
    # Exibir banner
    print_banner()
    
    # Carregar configuração personalizada se fornecida
    config = {}
    if args.config:
        try:
            with open(args.config, 'r') as f:
                config = json.load(f)
            print(f"{Colors.GREEN}✓ Configuração carregada: {args.config}{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}[ERRO] Falha ao carregar config: {e}{Colors.RESET}")
            sys.exit(1)
    
    # Executar modo apropriado
    if args.uninstall:
        from uninstall import Uninstaller
        uninstaller = Uninstaller()
        uninstaller.run()
    elif args.docker:
        docker = DockerSetup()
        asyncio.run(docker.install())
    elif args.auto:
        asyncio.run(run_auto_install(config))
    else:
        asyncio.run(run_wizard(args.port, args.no_browser))


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}[INFO] Instalação cancelada pelo usuário{Colors.RESET}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}[ERRO] Falha na instalação: {e}{Colors.RESET}")
        sys.exit(1)
