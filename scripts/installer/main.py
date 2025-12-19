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
    sudo python3 main.py --analytics [endpoint]  # Com coleta de métricas
    sudo python3 main.py --help    # Ajuda

Autor: B0.y_Z4kr14
Licença: Domínio Público (ver docs/CREDITS.md)
"""

import os
import sys
import argparse
import asyncio
import json
import subprocess
import time
from pathlib import Path
from typing import Optional

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
  sudo python3 main.py --analytics  Coleta métricas localmente
  sudo python3 main.py --analytics https://api.example.com/metrics
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
    parser.add_argument('--analytics', type=str, nargs='?', const='local',
                       help='Habilita coleta de métricas (local ou URL do endpoint)')
    
    return parser.parse_args()


def run_command(cmd: list, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess:
    """Executa comando shell com tratamento de erros"""
    try:
        result = subprocess.run(
            cmd,
            check=check,
            capture_output=capture,
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"{Colors.RED}[ERRO] Comando falhou: {' '.join(cmd)}{Colors.RESET}")
        if e.stderr:
            print(f"{Colors.RED}{e.stderr}{Colors.RESET}")
        raise


def install_monitoring_stack(analytics=None):
    """Instala Grafana, Prometheus e Node Exporter"""
    print(f"\n{Colors.CYAN}[MONITORING] Instalando stack de monitoramento...{Colors.RESET}")
    start_time = time.time()
    
    try:
        # Instalar pacotes
        run_command(['pacman', '-S', '--noconfirm', 'grafana', 'prometheus', 'prometheus-node-exporter'])
        
        # Configurar Prometheus
        prometheus_config = """
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'jukebox'
    static_configs:
      - targets: ['localhost:3000']
"""
        Path('/etc/prometheus').mkdir(parents=True, exist_ok=True)
        Path('/etc/prometheus/prometheus.yml').write_text(prometheus_config)
        
        # Habilitar serviços
        run_command(['systemctl', 'enable', '--now', 'prometheus'])
        run_command(['systemctl', 'enable', '--now', 'prometheus-node-exporter'])
        run_command(['systemctl', 'enable', '--now', 'grafana'])
        
        duration = int((time.time() - start_time) * 1000)
        print(f"{Colors.GREEN}✓ Stack de monitoramento instalado{Colors.RESET}")
        print(f"  Grafana: http://localhost:3000 (admin/admin)")
        print(f"  Prometheus: http://localhost:9090")
        
        if analytics:
            analytics.track_step('install_monitoring', 'success', duration)
            
    except Exception as e:
        if analytics:
            analytics.track_error('monitoring_install_failed', 'install_monitoring')
        raise


def configure_firewall(analytics=None):
    """Configura UFW (Uncomplicated Firewall)"""
    print(f"\n{Colors.CYAN}[SECURITY] Configurando firewall...{Colors.RESET}")
    start_time = time.time()
    
    try:
        # Instalar UFW
        run_command(['pacman', '-S', '--noconfirm', 'ufw'])
        
        # Configurar regras
        run_command(['ufw', 'default', 'deny', 'incoming'])
        run_command(['ufw', 'default', 'allow', 'outgoing'])
        run_command(['ufw', 'allow', 'ssh'])
        run_command(['ufw', 'allow', 'http'])
        run_command(['ufw', 'allow', 'https'])
        run_command(['ufw', 'allow', '3000'])  # Grafana
        run_command(['ufw', 'allow', '8080'])  # TSiJUKEBOX
        
        # Habilitar UFW
        run_command(['ufw', '--force', 'enable'])
        
        duration = int((time.time() - start_time) * 1000)
        print(f"{Colors.GREEN}✓ Firewall configurado{Colors.RESET}")
        
        if analytics:
            analytics.track_step('configure_firewall', 'success', duration)
            
    except Exception as e:
        if analytics:
            analytics.track_error('firewall_config_failed', 'configure_firewall')
        raise


def install_nginx(analytics=None):
    """Instala e configura Nginx como reverse proxy"""
    print(f"\n{Colors.CYAN}[WEB] Instalando Nginx...{Colors.RESET}")
    start_time = time.time()
    
    try:
        # Instalar Nginx
        run_command(['pacman', '-S', '--noconfirm', 'nginx', 'certbot', 'certbot-nginx'])
        
        # Criar configuração do TSiJUKEBOX
        nginx_config = """
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /grafana/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
    }
}
"""
        Path('/etc/nginx/sites-available').mkdir(parents=True, exist_ok=True)
        Path('/etc/nginx/sites-enabled').mkdir(parents=True, exist_ok=True)
        Path('/etc/nginx/sites-available/jukebox').write_text(nginx_config)
        
        # Criar symlink
        sites_enabled = Path('/etc/nginx/sites-enabled/jukebox')
        if not sites_enabled.exists():
            sites_enabled.symlink_to('/etc/nginx/sites-available/jukebox')
        
        # Habilitar Nginx
        run_command(['systemctl', 'enable', '--now', 'nginx'])
        
        duration = int((time.time() - start_time) * 1000)
        print(f"{Colors.GREEN}✓ Nginx instalado e configurado{Colors.RESET}")
        
        if analytics:
            analytics.track_step('install_nginx', 'success', duration)
            
    except Exception as e:
        if analytics:
            analytics.track_error('nginx_install_failed', 'install_nginx')
        raise


def install_spotify_spicetify(analytics=None):
    """Instala Spotify e Spicetify"""
    print(f"\n{Colors.CYAN}[MUSIC] Instalando Spotify + Spicetify...{Colors.RESET}")
    start_time = time.time()
    
    try:
        # Instalar Spotify via AUR helper ou spotify-launcher
        # Primeiro tenta spotify-launcher (oficial)
        try:
            run_command(['pacman', '-S', '--noconfirm', 'spotify-launcher'])
            print(f"{Colors.GREEN}✓ Spotify Launcher instalado{Colors.RESET}")
        except Exception:
            # Fallback: usar yay para instalar do AUR
            print(f"{Colors.YELLOW}→ Tentando via AUR...{Colors.RESET}")
            run_command(['sudo', '-u', 'nobody', 'yay', '-S', '--noconfirm', 'spotify'])
        
        # Instalar Spicetify
        spicetify_install = """
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
"""
        subprocess.run(spicetify_install, shell=True, check=True)
        
        # Instalar Marketplace
        marketplace_install = """
curl -fsSL https://raw.githubusercontent.com/spicetify/spicetify-marketplace/main/resources/install.sh | sh
"""
        subprocess.run(marketplace_install, shell=True, check=True)
        
        duration = int((time.time() - start_time) * 1000)
        print(f"{Colors.GREEN}✓ Spotify e Spicetify instalados{Colors.RESET}")
        
        if analytics:
            analytics.track_step('install_spotify', 'success', duration)
            analytics.track_config_choice('music_player', 'spotify+spicetify')
            
    except Exception as e:
        if analytics:
            analytics.track_error('spotify_install_failed', 'install_spotify')
        raise


def configure_autologin(username: str, analytics=None):
    """Configura login automático sem senha"""
    print(f"\n{Colors.CYAN}[AUTOLOGIN] Configurando login automático para {username}...{Colors.RESET}")
    start_time = time.time()
    
    try:
        # Criar diretório de override do getty
        override_dir = Path('/etc/systemd/system/getty@tty1.service.d')
        override_dir.mkdir(parents=True, exist_ok=True)
        
        # Criar arquivo de configuração de autologin
        autologin_config = f"""[Service]
ExecStart=
ExecStart=-/sbin/agetty -o '-p -f -- \\\\u' --noclear --autologin {username} %I $TERM
Type=idle
"""
        (override_dir / 'autologin.conf').write_text(autologin_config)
        
        # Recarregar systemd
        run_command(['systemctl', 'daemon-reload'])
        
        duration = int((time.time() - start_time) * 1000)
        print(f"{Colors.GREEN}✓ Autologin configurado para {username}{Colors.RESET}")
        
        if analytics:
            analytics.track_step('configure_autologin', 'success', duration)
            analytics.track_config_choice('autologin', 'enabled')
            
    except Exception as e:
        if analytics:
            analytics.track_error('autologin_config_failed', 'configure_autologin')
        raise


def configure_autostart_player(username: str, player_command: str = 'chromium --kiosk http://localhost:8080', analytics=None):
    """Configura inicialização automática do player"""
    print(f"\n{Colors.CYAN}[AUTOSTART] Configurando inicialização do player...{Colors.RESET}")
    start_time = time.time()
    
    try:
        user_home = Path(f'/home/{username}')
        
        # Criar .xinitrc para iniciar X e o player
        xinitrc_content = f"""#!/bin/bash
# TSiJUKEBOX Autostart

# Desabilitar screensaver
xset s off
xset -dpms
xset s noblank

# Ocultar cursor após inatividade
unclutter -idle 3 &

# Iniciar Openbox
openbox-session &

# Aguardar um pouco para X iniciar
sleep 2

# Iniciar o player
{player_command}
"""
        xinitrc_path = user_home / '.xinitrc'
        xinitrc_path.write_text(xinitrc_content)
        run_command(['chown', f'{username}:{username}', str(xinitrc_path)])
        run_command(['chmod', '+x', str(xinitrc_path)])
        
        # Criar .bash_profile para auto-startx
        bash_profile_content = f"""
# TSiJUKEBOX Auto-start X
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx
fi
"""
        bash_profile_path = user_home / '.bash_profile'
        
        # Append se já existir, senão criar
        if bash_profile_path.exists():
            current_content = bash_profile_path.read_text()
            if 'TSiJUKEBOX Auto-start' not in current_content:
                bash_profile_path.write_text(current_content + bash_profile_content)
        else:
            bash_profile_path.write_text(bash_profile_content)
        
        run_command(['chown', f'{username}:{username}', str(bash_profile_path)])
        
        # Instalar unclutter para ocultar cursor
        run_command(['pacman', '-S', '--noconfirm', 'unclutter'])
        
        duration = int((time.time() - start_time) * 1000)
        print(f"{Colors.GREEN}✓ Autostart configurado{Colors.RESET}")
        print(f"  Player: {player_command}")
        
        if analytics:
            analytics.track_step('configure_autostart', 'success', duration)
            analytics.track_config_choice('player_command', player_command.split()[0])
            
    except Exception as e:
        if analytics:
            analytics.track_error('autostart_config_failed', 'configure_autostart')
        raise


async def run_auto_install(config: dict, analytics=None):
    """Executa instalação automática sem wizard"""
    print(f"\n{Colors.CYAN}[AUTO] Iniciando instalação automática...{Colors.RESET}\n")
    
    total_start = time.time()
    
    if analytics:
        analytics.track_step('auto_install_start', 'started', 0)
    
    # 1. Verificar sistema
    checker = SystemChecker()
    system_info = checker.get_full_report()
    
    print(f"{Colors.GREEN}✓ Sistema detectado: {system_info['distro']['name']}{Colors.RESET}")
    print(f"{Colors.GREEN}✓ Shell: {system_info['shell']}{Colors.RESET}")
    print(f"{Colors.GREEN}✓ RAM: {system_info['hardware']['ram_gb']:.1f} GB{Colors.RESET}")
    
    if analytics:
        analytics.track_config_choice('distro', system_info['distro']['name'])
        analytics.track_config_choice('shell', system_info['shell'])
    
    # 2. Sugestão de banco de dados
    db_suggestion = checker.suggest_database()
    db_choice = config.get('database', db_suggestion['recommended'])
    print(f"{Colors.YELLOW}→ Banco escolhido: {db_choice}{Colors.RESET}")
    
    if analytics:
        analytics.track_config_choice('database', db_choice)
    
    # 3. Instalar pacotes base
    pkg_manager = PackageManager()
    pkg_manager.update_system()
    pkg_manager.install_base_packages()
    
    # 4. Instalar stack de monitoramento (Grafana + Prometheus)
    install_monitoring_stack(analytics)
    
    # 5. Configurar firewall (UFW)
    configure_firewall(analytics)
    
    # 6. Instalar Nginx
    install_nginx(analytics)
    
    # 7. Instalar Spotify + Spicetify
    install_spotify_spicetify(analytics)
    
    # 8. Configurar banco de dados
    db_manager = DatabaseManager()
    db_manager.install_database(db_choice)
    db_manager.create_default_user('admin', 'admin')
    
    # 9. Configurar autenticação
    auth = AuthSetup()
    if config.get('generate_ssh_keys', True):
        auth.generate_ssh_key()
    if config.get('generate_gpg_keys', False):
        auth.generate_gpg_key()
    
    # 10. Configurar backup em nuvem
    cloud = CloudSetup()
    for provider in config.get('cloud_providers', ['rclone']):
        cloud.install_provider(provider)
    
    # 11. Instalar Spicetify extensions
    spicetify = SpicetifySetup()
    spicetify.install()
    spicetify.install_extensions(['shuffle+', 'keyboardShortcut', 'autoSkipVideo'])
    
    # 12. Criar usuário do sistema
    user_manager = UserManager()
    username = config.get('username', 'tsi')
    user_manager.create_user(username, config.get('shell', 'bash'))
    user_manager.create_music_directory(username)
    
    # 13. Configurar autologin
    if config.get('autologin', True):
        configure_autologin(username, analytics)
    
    # 14. Configurar autostart do player
    player_cmd = config.get('player_command', 'chromium --kiosk http://localhost:8080')
    configure_autostart_player(username, player_cmd, analytics)
    
    total_duration = int((time.time() - total_start) * 1000)
    
    print(f"\n{Colors.GREEN}✓ Instalação concluída com sucesso!{Colors.RESET}")
    print(f"{Colors.CYAN}  Tempo total: {total_duration / 1000:.1f}s{Colors.RESET}")
    print(f"{Colors.CYAN}  Login: admin / admin{Colors.RESET}")
    print(f"{Colors.CYAN}  Usuário do sistema: {username}{Colors.RESET}")
    print(f"{Colors.CYAN}  Diretório de música: /home/{username}/Music{Colors.RESET}")
    print(f"\n{Colors.YELLOW}  Serviços instalados:{Colors.RESET}")
    print(f"    • TSiJUKEBOX: http://localhost:8080")
    print(f"    • Grafana: http://localhost:3000")
    print(f"    • Prometheus: http://localhost:9090")
    
    if analytics:
        analytics.track_step('auto_install_complete', 'success', total_duration)
        await analytics.finalize_and_send()


async def run_wizard(port: int, no_browser: bool, analytics=None):
    """Inicia servidor web com wizard visual"""
    print(f"\n{Colors.CYAN}[WIZARD] Iniciando servidor de instalação...{Colors.RESET}")
    
    if analytics:
        analytics.track_step('wizard_start', 'started', 0)
    
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
    
    # Inicializar analytics se habilitado
    analytics = None
    if args.analytics:
        try:
            from analytics import InstallationAnalytics
            endpoint = args.analytics if args.analytics != 'local' else None
            analytics = InstallationAnalytics(endpoint_url=endpoint, enabled=True)
            print(f"{Colors.GREEN}✓ Analytics habilitado{Colors.RESET}")
            if endpoint:
                print(f"  Endpoint: {endpoint}")
            else:
                print(f"  Modo: local (~/jukebox-analytics.json)")
        except ImportError:
            print(f"{Colors.YELLOW}[AVISO] Módulo analytics não encontrado, continuando sem métricas{Colors.RESET}")
    
    # Carregar configuração personalizada se fornecida
    config = {}
    if args.config:
        try:
            with open(args.config, 'r') as f:
                config = json.load(f)
            print(f"{Colors.GREEN}✓ Configuração carregada: {args.config}{Colors.RESET}")
            if analytics:
                analytics.track_config_choice('config_file', 'custom')
        except Exception as e:
            print(f"{Colors.RED}[ERRO] Falha ao carregar config: {e}{Colors.RESET}")
            if analytics:
                analytics.track_error('config_load_failed', 'main')
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
        asyncio.run(run_auto_install(config, analytics))
    else:
        asyncio.run(run_wizard(args.port, args.no_browser, analytics))


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}[INFO] Instalação cancelada pelo usuário{Colors.RESET}")
        sys.exit(0)
    except Exception as e:
        print(f"\n{Colors.RED}[ERRO] Falha na instalação: {e}{Colors.RESET}")
        sys.exit(1)
