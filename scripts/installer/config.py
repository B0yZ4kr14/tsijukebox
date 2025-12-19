#!/usr/bin/env python3
"""
TSiJUKEBOX Installer - Configurações e Constantes
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from pathlib import Path


class Colors:
    """ANSI color codes para output colorido no terminal"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


@dataclass
class DatabaseConfig:
    """Configuração de banco de dados"""
    type: str = 'sqlite'  # sqlite, mariadb, postgresql, firebird
    host: str = 'localhost'
    port: int = 0  # 0 = usar padrão do banco
    name: str = 'jukebox'
    user: str = 'admin'
    password: str = 'admin'
    path: str = '/var/lib/jukebox/jukebox.db'  # Para SQLite
    
    @property
    def default_port(self) -> int:
        """Retorna porta padrão baseado no tipo"""
        ports = {
            'sqlite': 0,
            'mariadb': 3306,
            'postgresql': 5432,
            'firebird': 3050,
        }
        return ports.get(self.type, 0)


@dataclass
class CloudProvider:
    """Configuração de provider de backup"""
    name: str
    enabled: bool = False
    cli_tool: str = ''
    install_command: str = ''
    config_required: List[str] = field(default_factory=list)


@dataclass 
class Config:
    """Configuração principal do instalador"""
    
    # Versão
    VERSION = '1.0.0'
    
    # Diretórios de instalação
    INSTALL_DIR = Path('/var/www/jukebox')
    DATA_DIR = Path('/var/lib/jukebox')
    CONFIG_DIR = Path('/etc/jukebox')
    LOG_DIR = Path('/var/log/jukebox')
    
    # Usuário do sistema
    DEFAULT_USER = 'tsi'
    DEFAULT_GROUP = 'wheel'
    
    # Shells suportados
    SUPPORTED_SHELLS = ['bash', 'zsh', 'fish']
    
    # Distribuições suportadas
    SUPPORTED_DISTROS = ['arch', 'cachyos', 'manjaro']
    
    # Pacotes base necessários
    BASE_PACKAGES = [
        'base-devel',
        'git',
        'nodejs',
        'npm',
        'python',
        'python-pip',
        'chromium',
        'openbox',
        'xorg-server',
        'xorg-xinit',
    ]
    
    # Pacotes de monitoramento
    MONITORING_PACKAGES = [
        'grafana',
        'prometheus',
        'prometheus-node-exporter',
    ]
    
    # Pacotes de segurança
    SECURITY_PACKAGES = [
        'ufw',
    ]
    
    # Pacotes web/proxy
    WEB_PACKAGES = [
        'nginx',
        'certbot',
        'certbot-nginx',
    ]
    
    # Pacotes de música
    MUSIC_PACKAGES = [
        'spotify-launcher',  # Oficial do Arch
    ]
    
    # Pacotes opcionais por categoria
    OPTIONAL_PACKAGES = {
        'audio': ['pulseaudio', 'pavucontrol', 'alsa-utils'],
        'network': ['networkmanager', 'openssh', 'curl', 'wget'],
        'fonts': ['ttf-dejavu', 'ttf-liberation', 'noto-fonts'],
        'utils': ['htop', 'neofetch', 'tmux', 'vim', 'unclutter'],
    }
    
    # Configurações de banco de dados
    DATABASE_PACKAGES = {
        'sqlite': ['sqlite'],
        'mariadb': ['mariadb'],
        'postgresql': ['postgresql'],
        'firebird': ['firebird'],
    }
    
    DATABASE_PYTHON_DRIVERS = {
        'sqlite': 'aiosqlite',
        'mariadb': 'aiomysql',
        'postgresql': 'asyncpg',
        'firebird': 'firebird-driver',
    }
    
    # Provedores de backup em nuvem
    CLOUD_PROVIDERS: Dict[str, CloudProvider] = {
        'storj': CloudProvider(
            name='Storj',
            cli_tool='uplink',
            install_command='curl -L https://storj.io/install.sh | bash',
            config_required=['access_grant'],
        ),
        'gdrive': CloudProvider(
            name='Google Drive',
            cli_tool='rclone',
            install_command='pacman -S --noconfirm rclone',
            config_required=['client_id', 'client_secret'],
        ),
        'dropbox': CloudProvider(
            name='Dropbox',
            cli_tool='rclone',
            install_command='pacman -S --noconfirm rclone',
            config_required=['token'],
        ),
        'mega': CloudProvider(
            name='MEGA',
            cli_tool='megatools',
            install_command='pacman -S --noconfirm megatools',
            config_required=['email', 'password'],
        ),
        'aws': CloudProvider(
            name='AWS S3',
            cli_tool='aws',
            install_command='pacman -S --noconfirm aws-cli-v2',
            config_required=['access_key', 'secret_key', 'region', 'bucket'],
        ),
        'onedrive': CloudProvider(
            name='OneDrive',
            cli_tool='rclone',
            install_command='pacman -S --noconfirm rclone',
            config_required=['client_id', 'client_secret'],
        ),
    }
    
    # Extensões padrão do Spicetify
    SPICETIFY_EXTENSIONS = [
        'shuffle+.js',
        'keyboardShortcut.js',
        'autoSkipVideo.js',
    ]
    
    # URLs importantes
    SPICETIFY_INSTALL_URL = 'https://raw.githubusercontent.com/spicetify/cli/main/install.sh'
    SPICETIFY_MARKETPLACE_URL = 'https://raw.githubusercontent.com/spicetify/spicetify-marketplace/main/resources/install.sh'
    CHAOTIC_AUR_KEY_URL = 'https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x3056513887B78AEB'
    
    # Thresholds para sugestão de banco
    DB_RAM_THRESHOLDS = {
        'sqlite': 2,      # < 2GB RAM
        'mariadb': 8,     # 2-8GB RAM
        'postgresql': 16, # 8-16GB RAM
    }
    
    # Arquivos de log
    INSTALL_LOG = LOG_DIR / 'install.log'
    HARDWARE_LOG = LOG_DIR / 'hardware.log'


# Instância global de configuração
config = Config()
