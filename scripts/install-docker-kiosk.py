#!/usr/bin/env python3
"""
TSiJUKEBOX - Docker Kiosk Auto-Installer
=========================================
Instalação 100% automática com Docker + SQLite local + Openbox kiosk.

USO:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install-docker-kiosk.py | sudo python3

    # Com opções:
    curl -fsSL ... | sudo python3 - --webhook https://api.example.com/events
    curl -fsSL ... | sudo python3 - --port 8080 --user mykiosk

CARACTERÍSTICAS:
    ✅ Zero interação humana após iniciar
    ✅ Docker para aplicação web
    ✅ SQLite local (volume montado no container)
    ✅ Openbox em modo kiosk
    ✅ Autologin + Autostart X
    ✅ Chromium fullscreen
    ✅ Watchdog com recovery automático
    ✅ Notificações via webhook

SISTEMAS SUPORTADOS:
    - CachyOS
    - Arch Linux
    - Manjaro
    - EndeavourOS

AUTOR: TSiJUKEBOX Team
VERSÃO: 2.0.0
"""

import argparse
import json
import os
import pwd
import shutil
import sqlite3
import subprocess
import sys
import time
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

@dataclass
class KioskConfig:
    """Configuração do ambiente kiosk."""
    user: str = 'kiosk'
    app_port: int = 80
    docker_image: str = 'ghcr.io/b0yz4kr14/tsijukebox:latest'
    install_dir: str = '/opt/tsijukebox'
    data_dir: str = '/var/lib/tsijukebox'
    sqlite_path: str = '/var/lib/tsijukebox/jukebox.db'
    log_dir: str = '/var/log/tsijukebox'
    webhook_url: Optional[str] = None
    hide_cursor: bool = True
    disable_dpms: bool = True
    auto_reboot: bool = True
    timezone: str = 'America/Sao_Paulo'
    resolution: Optional[str] = None  # e.g., '1920x1080'
    rotation: int = 0  # 0, 90, 180, 270


@dataclass
class InstallPhase:
    """Representa uma fase da instalação."""
    name: str
    description: str
    function: str
    required: bool = True


@dataclass 
class InstallResult:
    """Resultado de uma fase de instalação."""
    success: bool
    message: str
    duration_ms: int = 0
    details: Dict = field(default_factory=dict)


# ============================================================================
# CONSTANTES
# ============================================================================

VERSION = "2.0.0"
GITHUB_REPO = "B0yZ4kr14/TSiJUKEBOX"

# Pacotes necessários para cada distribuição
ARCH_PACKAGES = {
    'base': [
        'base-devel', 'git', 'curl', 'wget', 'sudo',
    ],
    'docker': [
        'docker', 'docker-compose',
    ],
    'xorg': [
        'xorg-server', 'xorg-xinit', 'xorg-xset', 'xorg-xrandr', 
        'xorg-xdpyinfo', 'xf86-video-vesa',
    ],
    'kiosk': [
        'openbox', 'picom', 'unclutter', 'wmctrl', 'xdotool',
        'chromium', 'ttf-dejavu', 'ttf-liberation', 'noto-fonts',
    ],
    'audio': [
        'pulseaudio', 'pulseaudio-alsa', 'alsa-utils', 'pavucontrol',
    ],
    'database': [
        'sqlite',
    ],
    'utils': [
        'htop', 'vim', 'nano', 'lsof', 'net-tools',
    ],
}

# Schema SQLite para o banco local
SQLITE_SCHEMA = """
-- TSiJUKEBOX Local Database Schema
-- Versão: 2.0.0

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- Configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    category TEXT DEFAULT 'general',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de reprodução
CREATE TABLE IF NOT EXISTS playback_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id TEXT NOT NULL,
    track_name TEXT,
    artist_name TEXT,
    album_name TEXT,
    provider TEXT DEFAULT 'spotify',
    duration_ms INTEGER,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT 0
);

-- Sessões Jam
CREATE TABLE IF NOT EXISTS jam_sessions (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    host_nickname TEXT,
    playlist_id TEXT,
    playlist_name TEXT,
    privacy TEXT DEFAULT 'public',
    max_participants INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT 1,
    current_track TEXT,
    playback_state TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Participantes das sessões Jam
CREATE TABLE IF NOT EXISTS jam_participants (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    nickname TEXT NOT NULL,
    avatar_color TEXT,
    is_host BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES jam_sessions(id) ON DELETE CASCADE
);

-- Fila de músicas das sessões
CREATE TABLE IF NOT EXISTS jam_queue (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    track_name TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    album_art TEXT,
    duration_ms INTEGER,
    added_by TEXT,
    added_by_nickname TEXT,
    position INTEGER NOT NULL,
    votes INTEGER DEFAULT 0,
    is_played BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES jam_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES jam_participants(id)
);

-- Arquivos pendentes para sync
CREATE TABLE IF NOT EXISTS pending_sync_files (
    id TEXT PRIMARY KEY,
    file_path TEXT UNIQUE NOT NULL,
    file_hash TEXT,
    category TEXT DEFAULT 'source',
    priority INTEGER DEFAULT 50,
    status TEXT DEFAULT 'pending',
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at DATETIME,
    error_message TEXT
);

-- Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    severity TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT 0,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Métricas do instalador
CREATE TABLE IF NOT EXISTS installer_metrics (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    installer_version TEXT,
    distro_name TEXT,
    distro_family TEXT,
    install_mode TEXT,
    database_type TEXT,
    status TEXT NOT NULL,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    total_duration_ms INTEGER,
    steps TEXT,
    errors TEXT,
    system_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_playback_played_at ON playback_history(played_at);
CREATE INDEX IF NOT EXISTS idx_jam_sessions_code ON jam_sessions(code);
CREATE INDEX IF NOT EXISTS idx_jam_sessions_active ON jam_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_pending_sync_status ON pending_sync_files(status);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Inserir configurações padrão
INSERT OR IGNORE INTO settings (key, value, category) VALUES
    ('app_version', '2.0.0', 'system'),
    ('install_date', datetime('now'), 'system'),
    ('install_mode', 'docker-kiosk', 'system'),
    ('database_type', 'sqlite', 'system'),
    ('theme', 'dark', 'ui'),
    ('language', 'pt-BR', 'ui'),
    ('auto_play', 'true', 'playback'),
    ('shuffle', 'false', 'playback'),
    ('repeat_mode', 'off', 'playback'),
    ('volume', '80', 'playback');
"""

# ============================================================================
# CLASSES AUXILIARES
# ============================================================================

class Colors:
    """Códigos ANSI para cores no terminal."""
    RESET = '\033[0m'
    BOLD = '\033[1m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'


class Logger:
    """Logger com cores e formatação."""
    
    @staticmethod
    def info(message: str):
        print(f"{Colors.BLUE}ℹ{Colors.RESET} {message}")
    
    @staticmethod
    def success(message: str):
        print(f"{Colors.GREEN}✓{Colors.RESET} {message}")
    
    @staticmethod
    def warning(message: str):
        print(f"{Colors.YELLOW}⚠{Colors.RESET} {message}")
    
    @staticmethod
    def error(message: str):
        print(f"{Colors.RED}✗{Colors.RESET} {message}")
    
    @staticmethod
    def step(step: int, total: int, message: str):
        print(f"\n{Colors.CYAN}[{step}/{total}]{Colors.RESET} {Colors.BOLD}{message}{Colors.RESET}")
    
    @staticmethod
    def banner():
        banner = f"""
{Colors.MAGENTA}╔══════════════════════════════════════════════════════════════╗
║                                                                ║
║   ████████╗███████╗██╗     ██╗██╗   ██╗██╗  ██╗███████╗        ║
║   ╚══██╔══╝██╔════╝██║     ██║██║   ██║██║ ██╔╝██╔════╝        ║
║      ██║   ███████╗██║     ██║██║   ██║█████╔╝ █████╗          ║
║      ██║   ╚════██║██║██   ██║██║   ██║██╔═██╗ ██╔══╝          ║
║      ██║   ███████║██║╚█████╔╝╚██████╔╝██║  ██╗███████╗        ║
║      ╚═╝   ╚══════╝╚═╝ ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝        ║
║                                                                ║
║          🎵 Docker Kiosk Auto-Installer v{VERSION}             ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝{Colors.RESET}
"""
        print(banner)


# ============================================================================
# INSTALADOR PRINCIPAL
# ============================================================================

class DockerKioskInstaller:
    """Instalador automático Docker + SQLite para CachyOS/Arch."""
    
    PHASES: List[InstallPhase] = [
        InstallPhase("system_check", "Verificando sistema", "phase_system_check"),
        InstallPhase("create_directories", "Criando diretórios", "phase_create_directories"),
        InstallPhase("install_packages", "Instalando pacotes base", "phase_install_packages"),
        InstallPhase("install_docker", "Instalando Docker", "phase_install_docker"),
        InstallPhase("create_user", "Criando usuário kiosk", "phase_create_user"),
        InstallPhase("setup_sqlite", "Configurando SQLite", "phase_setup_sqlite"),
        InstallPhase("setup_docker_compose", "Criando Docker Compose", "phase_setup_docker_compose"),
        InstallPhase("pull_image", "Baixando imagem Docker", "phase_pull_image"),
        InstallPhase("setup_openbox", "Configurando Openbox", "phase_setup_openbox"),
        InstallPhase("setup_xinitrc", "Configurando X11", "phase_setup_xinitrc"),
        InstallPhase("setup_autologin", "Configurando autologin", "phase_setup_autologin"),
        InstallPhase("setup_chromium", "Configurando Chromium kiosk", "phase_setup_chromium"),
        InstallPhase("setup_watchdog", "Configurando watchdog", "phase_setup_watchdog"),
        InstallPhase("setup_systemd", "Criando serviços systemd", "phase_setup_systemd"),
        InstallPhase("enable_services", "Habilitando serviços", "phase_enable_services"),
        InstallPhase("finalize", "Finalizando instalação", "phase_finalize"),
    ]
    
    def __init__(self, config: KioskConfig):
        self.config = config
        self.log = Logger()
        self.start_time = datetime.now()
        self.results: List[InstallResult] = []
        self.distro_info: Dict[str, str] = {}
    
    def run(self) -> bool:
        """Executa todas as fases de instalação."""
        self.log.banner()
        
        total_phases = len(self.PHASES)
        success = True
        
        for i, phase in enumerate(self.PHASES, 1):
            self.log.step(i, total_phases, phase.description)
            
            start = time.time()
            try:
                method = getattr(self, phase.function)
                result = method()
                duration = int((time.time() - start) * 1000)
                
                if result.success:
                    self.log.success(result.message)
                else:
                    self.log.error(result.message)
                    if phase.required:
                        success = False
                        break
                
                result.duration_ms = duration
                self.results.append(result)
                
            except Exception as e:
                self.log.error(f"Erro na fase {phase.name}: {str(e)}")
                self.results.append(InstallResult(
                    success=False,
                    message=str(e),
                    duration_ms=int((time.time() - start) * 1000)
                ))
                if phase.required:
                    success = False
                    break
        
        # Enviar métricas
        self._send_metrics(success)
        
        # Mostrar resumo
        self._show_summary(success)
        
        return success
    
    def _run_command(
        self, 
        cmd: List[str], 
        check: bool = True,
        capture_output: bool = True,
        env: Optional[Dict] = None
    ) -> subprocess.CompletedProcess:
        """Executa um comando no shell."""
        return subprocess.run(
            cmd,
            check=check,
            capture_output=capture_output,
            text=True,
            env={**os.environ, **(env or {})}
        )
    
    def _write_file(self, path: str, content: str, mode: int = 0o644):
        """Escreve conteúdo em um arquivo."""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(content)
        os.chmod(path, mode)
    
    def _get_distro_info(self) -> Dict[str, str]:
        """Obtém informações da distribuição."""
        info = {}
        try:
            with open('/etc/os-release') as f:
                for line in f:
                    if '=' in line:
                        key, value = line.strip().split('=', 1)
                        info[key] = value.strip('"')
        except Exception:
            pass
        return info
    
    # ========================================================================
    # FASES DE INSTALAÇÃO
    # ========================================================================
    
    def phase_system_check(self) -> InstallResult:
        """Verifica requisitos do sistema."""
        # Verificar root
        if os.geteuid() != 0:
            return InstallResult(False, "Este script precisa ser executado como root (sudo)")
        
        # Obter info da distro
        self.distro_info = self._get_distro_info()
        distro_id = self.distro_info.get('ID', '').lower()
        distro_like = self.distro_info.get('ID_LIKE', '').lower()
        
        # Verificar se é Arch-based
        is_arch = 'arch' in distro_id or 'arch' in distro_like or distro_id in [
            'cachyos', 'manjaro', 'endeavouros', 'artix', 'garuda'
        ]
        
        if not is_arch:
            return InstallResult(
                False, 
                f"Sistema não suportado: {distro_id}. Apenas distribuições Arch-based são suportadas."
            )
        
        # Verificar memória
        try:
            with open('/proc/meminfo') as f:
                for line in f:
                    if line.startswith('MemTotal:'):
                        mem_kb = int(line.split()[1])
                        mem_gb = mem_kb / 1024 / 1024
                        if mem_gb < 1.5:
                            return InstallResult(False, f"Memória insuficiente: {mem_gb:.1f}GB (mínimo: 2GB)")
                        break
        except Exception:
            self.log.warning("Não foi possível verificar memória")
        
        # Verificar espaço em disco
        try:
            stat = os.statvfs('/')
            free_gb = (stat.f_bavail * stat.f_frsize) / (1024 ** 3)
            if free_gb < 5:
                return InstallResult(False, f"Espaço em disco insuficiente: {free_gb:.1f}GB (mínimo: 10GB)")
        except Exception:
            self.log.warning("Não foi possível verificar espaço em disco")
        
        return InstallResult(
            True, 
            f"Sistema compatível: {self.distro_info.get('PRETTY_NAME', distro_id)}",
            details={'distro': distro_id, 'distro_info': self.distro_info}
        )
    
    def phase_create_directories(self) -> InstallResult:
        """Cria diretórios necessários."""
        dirs = [
            self.config.install_dir,
            self.config.data_dir,
            self.config.log_dir,
            f"{self.config.data_dir}/backups",
            f"{self.config.data_dir}/cache",
        ]
        
        for d in dirs:
            Path(d).mkdir(parents=True, exist_ok=True)
        
        return InstallResult(True, f"Diretórios criados em {self.config.install_dir}")
    
    def phase_install_packages(self) -> InstallResult:
        """Instala pacotes base do sistema."""
        # Atualizar pacman
        self._run_command(['pacman', '-Sy', '--noconfirm'])
        
        # Instalar pacotes por categoria
        all_packages = []
        for category in ['base', 'xorg', 'kiosk', 'audio', 'database', 'utils']:
            all_packages.extend(ARCH_PACKAGES.get(category, []))
        
        # Remover duplicatas
        all_packages = list(set(all_packages))
        
        # Instalar
        self._run_command(['pacman', '-S', '--noconfirm', '--needed'] + all_packages)
        
        return InstallResult(True, f"{len(all_packages)} pacotes instalados")
    
    def phase_install_docker(self) -> InstallResult:
        """Instala e configura Docker."""
        # Instalar Docker
        self._run_command(['pacman', '-S', '--noconfirm', '--needed'] + ARCH_PACKAGES['docker'])
        
        # Habilitar e iniciar Docker
        self._run_command(['systemctl', 'enable', 'docker'])
        self._run_command(['systemctl', 'start', 'docker'])
        
        # Aguardar Docker iniciar
        time.sleep(3)
        
        # Verificar se está rodando
        result = self._run_command(['docker', 'info'], check=False)
        if result.returncode != 0:
            return InstallResult(False, "Docker não iniciou corretamente")
        
        return InstallResult(True, "Docker instalado e rodando")
    
    def phase_create_user(self) -> InstallResult:
        """Cria usuário kiosk dedicado."""
        user = self.config.user
        
        # Verificar se usuário já existe
        try:
            pwd.getpwnam(user)
            self.log.info(f"Usuário {user} já existe")
        except KeyError:
            # Criar usuário
            self._run_command([
                'useradd', '-m', '-s', '/bin/bash',
                '-G', 'audio,video,docker',
                user
            ])
        
        # Adicionar aos grupos necessários
        self._run_command(['usermod', '-aG', 'audio,video,docker', user], check=False)
        
        # Permitir usuário iniciar X sem root
        xwrapper_config = '/etc/X11/Xwrapper.config'
        self._write_file(xwrapper_config, 'allowed_users=anybody\nneeds_root_rights=yes\n')
        
        return InstallResult(True, f"Usuário {user} configurado")
    
    def phase_setup_sqlite(self) -> InstallResult:
        """Configura banco de dados SQLite local."""
        db_path = self.config.sqlite_path
        
        # Garantir diretório existe
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Criar banco e executar schema
        conn = sqlite3.connect(db_path)
        conn.executescript(SQLITE_SCHEMA)
        conn.commit()
        conn.close()
        
        # Ajustar permissões
        os.chown(db_path, pwd.getpwnam(self.config.user).pw_uid, -1)
        os.chmod(db_path, 0o644)
        
        return InstallResult(True, f"SQLite configurado em {db_path}")
    
    def phase_setup_docker_compose(self) -> InstallResult:
        """Cria arquivo docker-compose.yml."""
        compose_content = f"""# TSiJUKEBOX Docker Compose
# Gerado automaticamente pelo instalador v{VERSION}

version: '3.9'

services:
  app:
    image: {self.config.docker_image}
    container_name: tsijukebox
    restart: unless-stopped
    ports:
      - "{self.config.app_port}:80"
    volumes:
      - {self.config.data_dir}:/app/data:rw
      - {self.config.sqlite_path}:/app/jukebox.db:rw
    environment:
      - TZ={self.config.timezone}
      - DATABASE_URL=file:/app/jukebox.db
      - NODE_ENV=production
      - VITE_LOCAL_MODE=true
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    labels:
      - "com.tsijukebox.kiosk=true"
      - "com.tsijukebox.version={VERSION}"

networks:
  default:
    driver: bridge
"""
        
        compose_path = f"{self.config.install_dir}/docker-compose.yml"
        self._write_file(compose_path, compose_content)
        
        return InstallResult(True, f"Docker Compose criado em {compose_path}")
    
    def phase_pull_image(self) -> InstallResult:
        """Baixa imagem Docker."""
        # Tentar baixar imagem
        result = self._run_command(
            ['docker', 'pull', self.config.docker_image],
            check=False
        )
        
        if result.returncode != 0:
            # Se falhar, tentar build local
            self.log.warning("Imagem não encontrada, tentando build local...")
            
            # Clonar repositório
            repo_path = f"{self.config.install_dir}/repo"
            if Path(repo_path).exists():
                shutil.rmtree(repo_path)
            
            self._run_command([
                'git', 'clone', '--depth', '1',
                f'https://github.com/{GITHUB_REPO}.git',
                repo_path
            ])
            
            # Build da imagem
            self._run_command([
                'docker', 'build', '-t', 'tsijukebox:local', repo_path
            ])
            
            # Atualizar config para usar imagem local
            self.config.docker_image = 'tsijukebox:local'
            
            # Recriar docker-compose com nova imagem
            self.phase_setup_docker_compose()
        
        return InstallResult(True, f"Imagem {self.config.docker_image} pronta")
    
    def phase_setup_openbox(self) -> InstallResult:
        """Configura Openbox para kiosk."""
        user_home = f"/home/{self.config.user}"
        openbox_dir = f"{user_home}/.config/openbox"
        Path(openbox_dir).mkdir(parents=True, exist_ok=True)
        
        # rc.xml - Configuração principal
        rc_xml = """<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc">
  <resistance><strength>10</strength><screen_edge_strength>20</screen_edge_strength></resistance>
  <focus><focusNew>yes</focusNew><followMouse>no</followMouse></focus>
  <placement><policy>Smart</policy><center>yes</center></placement>
  <theme><name>Clearlooks</name></theme>
  <desktops><number>1</number></desktops>
  <keyboard>
    <!-- Atalho de emergência: Ctrl+Alt+Backspace para sair -->
    <keybind key="C-A-BackSpace">
      <action name="Exit"><prompt>no</prompt></action>
    </keybind>
    <!-- Atalho para reiniciar Chromium: Ctrl+Alt+R -->
    <keybind key="C-A-r">
      <action name="Execute">
        <command>pkill chromium; sleep 2; /usr/local/bin/start-kiosk.sh</command>
      </action>
    </keybind>
  </keyboard>
  <mouse>
    <dragThreshold>1</dragThreshold>
    <doubleClickTime>500</doubleClickTime>
  </mouse>
  <applications>
    <application class="*">
      <decor>no</decor>
      <shade>no</shade>
      <focus>yes</focus>
      <fullscreen>yes</fullscreen>
    </application>
  </applications>
</openbox_config>
"""
        self._write_file(f"{openbox_dir}/rc.xml", rc_xml)
        
        # autostart - Executado quando Openbox inicia
        autostart = f"""#!/bin/bash
# TSiJUKEBOX Kiosk Autostart

# Desabilitar screensaver e DPMS
xset s off
xset -dpms
xset s noblank

# Configurar resolução se especificada
{"xrandr -s " + self.config.resolution if self.config.resolution else "# Usando resolução padrão"}

# Rotação de tela
{f"xrandr -o {['normal', 'left', 'inverted', 'right'][self.config.rotation // 90]}" if self.config.rotation else "# Sem rotação"}

# Esconder cursor após 2 segundos de inatividade
{"unclutter -idle 2 -root &" if self.config.hide_cursor else "# Cursor visível"}

# Compositor para suavidade
picom --backend glx --vsync &

# Aguardar container Docker
while ! curl -sf http://localhost:{self.config.app_port}/ > /dev/null 2>&1; do
    sleep 2
done

# Iniciar Chromium em modo kiosk
/usr/local/bin/start-kiosk.sh &

# Iniciar watchdog
/usr/local/bin/kiosk-watchdog.sh &
"""
        self._write_file(f"{openbox_dir}/autostart", autostart, mode=0o755)
        
        # Ajustar permissões
        uid = pwd.getpwnam(self.config.user).pw_uid
        for root, dirs, files in os.walk(f"{user_home}/.config"):
            for d in dirs:
                os.chown(os.path.join(root, d), uid, -1)
            for f in files:
                os.chown(os.path.join(root, f), uid, -1)
        
        return InstallResult(True, "Openbox configurado")
    
    def phase_setup_xinitrc(self) -> InstallResult:
        """Configura .xinitrc para iniciar X automaticamente."""
        user_home = f"/home/{self.config.user}"
        
        xinitrc = f"""#!/bin/bash
# TSiJUKEBOX X11 Init

# Configurações de teclado
setxkbmap -layout br

# Variáveis de ambiente
export XDG_SESSION_TYPE=x11
export XDG_CURRENT_DESKTOP=openbox

# Log de erros do X
exec > {self.config.log_dir}/xsession.log 2>&1

# Iniciar Openbox
exec openbox-session
"""
        self._write_file(f"{user_home}/.xinitrc", xinitrc, mode=0o755)
        
        # .bash_profile para auto-startx
        bash_profile = f"""# TSiJUKEBOX Auto Start X
if [ -z "$DISPLAY" ] && [ "$(tty)" = "/dev/tty1" ]; then
    exec startx -- -nocursor
fi
"""
        self._write_file(f"{user_home}/.bash_profile", bash_profile)
        
        # Ajustar permissões
        uid = pwd.getpwnam(self.config.user).pw_uid
        os.chown(f"{user_home}/.xinitrc", uid, -1)
        os.chown(f"{user_home}/.bash_profile", uid, -1)
        
        return InstallResult(True, "X11 configurado para auto-start")
    
    def phase_setup_autologin(self) -> InstallResult:
        """Configura autologin via getty."""
        override_dir = "/etc/systemd/system/getty@tty1.service.d"
        Path(override_dir).mkdir(parents=True, exist_ok=True)
        
        autologin_conf = f"""[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin {self.config.user} --noclear %I $TERM
"""
        self._write_file(f"{override_dir}/autologin.conf", autologin_conf)
        
        # Recarregar systemd
        self._run_command(['systemctl', 'daemon-reload'])
        
        return InstallResult(True, f"Autologin configurado para {self.config.user}")
    
    def phase_setup_chromium(self) -> InstallResult:
        """Configura script de inicialização do Chromium kiosk."""
        start_script = f"""#!/bin/bash
# TSiJUKEBOX Chromium Kiosk Launcher

APP_URL="http://localhost:{self.config.app_port}"
CACHE_DIR="/tmp/chromium-kiosk-cache"

# Limpar cache antigo
rm -rf "$CACHE_DIR"
mkdir -p "$CACHE_DIR"

# Aguardar aplicação estar disponível
while ! curl -sf "$APP_URL" > /dev/null 2>&1; do
    echo "Aguardando TSiJUKEBOX..."
    sleep 2
done

# Iniciar Chromium
exec chromium \\
    --kiosk \\
    --noerrdialogs \\
    --disable-infobars \\
    --disable-translate \\
    --no-first-run \\
    --fast \\
    --fast-start \\
    --disable-features=TranslateUI \\
    --disk-cache-dir="$CACHE_DIR" \\
    --disable-pinch \\
    --overscroll-history-navigation=0 \\
    --check-for-update-interval=31536000 \\
    --disable-background-mode \\
    --disable-component-update \\
    --disable-default-apps \\
    --disable-extensions \\
    --disable-popup-blocking \\
    --disable-prompt-on-repost \\
    --disable-sync \\
    --autoplay-policy=no-user-gesture-required \\
    --user-data-dir="$CACHE_DIR/userdata" \\
    "$APP_URL"
"""
        self._write_file('/usr/local/bin/start-kiosk.sh', start_script, mode=0o755)
        
        return InstallResult(True, "Script do Chromium kiosk criado")
    
    def phase_setup_watchdog(self) -> InstallResult:
        """Configura watchdog para recovery automático."""
        webhook_cmd = ""
        if self.config.webhook_url:
            webhook_cmd = f"""
notify_webhook() {{
    curl -sf -X POST "{self.config.webhook_url}" \\
        -H "Content-Type: application/json" \\
        -d '{{"event": "'$1'", "timestamp": "'$(date -Iseconds)'", "hostname": "'$(hostname)'", "details": "'$2'"}}' \\
        > /dev/null 2>&1 || true
}}
"""
        else:
            webhook_cmd = """
notify_webhook() {
    echo "[$(date)] Event: $1 - $2"
}
"""
        
        watchdog_script = f"""#!/bin/bash
# TSiJUKEBOX Kiosk Watchdog
# Monitora e reinicia componentes em caso de falha

LOG_FILE="{self.config.log_dir}/watchdog.log"
APP_URL="http://localhost:{self.config.app_port}"
CHECK_INTERVAL=30
MAX_FAILURES=3

# Contadores de falha
chromium_failures=0
docker_failures=0
health_failures=0

log() {{
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}}

{webhook_cmd}

restart_chromium() {{
    log "Reiniciando Chromium..."
    pkill -9 chromium || true
    sleep 2
    DISPLAY=:0 /usr/local/bin/start-kiosk.sh &
    notify_webhook "chromium_restart" "Chromium reiniciado após $chromium_failures falhas"
    chromium_failures=0
}}

restart_container() {{
    log "Reiniciando container Docker..."
    cd {self.config.install_dir}
    docker compose down || true
    sleep 3
    docker compose up -d
    notify_webhook "container_restart" "Container reiniciado após $docker_failures falhas"
    docker_failures=0
    # Aguardar container iniciar
    sleep 10
}}

check_health() {{
    if ! curl -sf "$APP_URL" > /dev/null 2>&1; then
        ((health_failures++))
        log "Health check falhou ($health_failures/$MAX_FAILURES)"
        
        if [ $health_failures -ge $MAX_FAILURES ]; then
            notify_webhook "health_check_failed" "$health_failures falhas consecutivas"
            restart_container
            health_failures=0
        fi
        return 1
    fi
    health_failures=0
    return 0
}}

check_chromium() {{
    if ! pgrep -x chromium > /dev/null 2>&1; then
        ((chromium_failures++))
        log "Chromium não está rodando ($chromium_failures/$MAX_FAILURES)"
        
        if [ $chromium_failures -ge $MAX_FAILURES ]; then
            restart_chromium
        fi
        return 1
    fi
    chromium_failures=0
    return 0
}}

check_docker() {{
    if ! docker ps | grep -q tsijukebox; then
        ((docker_failures++))
        log "Container não está rodando ($docker_failures/$MAX_FAILURES)"
        
        if [ $docker_failures -ge $MAX_FAILURES ]; then
            restart_container
        fi
        return 1
    fi
    docker_failures=0
    return 0
}}

# Loop principal
log "Watchdog iniciado"
notify_webhook "watchdog_started" "Monitoramento ativo"

while true; do
    check_docker
    sleep 2
    check_health
    sleep 2
    check_chromium
    
    sleep $CHECK_INTERVAL
done
"""
        self._write_file('/usr/local/bin/kiosk-watchdog.sh', watchdog_script, mode=0o755)
        
        return InstallResult(True, "Watchdog configurado" + (" com webhook" if self.config.webhook_url else ""))
    
    def phase_setup_systemd(self) -> InstallResult:
        """Cria serviços systemd."""
        # Serviço principal do Docker Compose
        docker_service = f"""[Unit]
Description=TSiJUKEBOX Docker Container
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory={self.config.install_dir}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
"""
        self._write_file('/etc/systemd/system/tsijukebox.service', docker_service)
        
        # Serviço do watchdog
        watchdog_service = f"""[Unit]
Description=TSiJUKEBOX Kiosk Watchdog
After=tsijukebox.service
Requires=tsijukebox.service

[Service]
Type=simple
User={self.config.user}
ExecStart=/usr/local/bin/kiosk-watchdog.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
"""
        self._write_file('/etc/systemd/system/tsijukebox-watchdog.service', watchdog_service)
        
        # Recarregar systemd
        self._run_command(['systemctl', 'daemon-reload'])
        
        return InstallResult(True, "Serviços systemd criados")
    
    def phase_enable_services(self) -> InstallResult:
        """Habilita e inicia serviços."""
        services = [
            'tsijukebox.service',
            'tsijukebox-watchdog.service',
        ]
        
        for service in services:
            self._run_command(['systemctl', 'enable', service])
        
        # Iniciar container agora
        self._run_command(['systemctl', 'start', 'tsijukebox.service'])
        
        return InstallResult(True, f"{len(services)} serviços habilitados")
    
    def phase_finalize(self) -> InstallResult:
        """Finaliza instalação."""
        duration = (datetime.now() - self.start_time).total_seconds()
        
        # Criar arquivo de versão
        version_info = {
            'version': VERSION,
            'installed_at': datetime.now().isoformat(),
            'config': {
                'user': self.config.user,
                'port': self.config.app_port,
                'docker_image': self.config.docker_image,
            },
            'distro': self.distro_info,
        }
        self._write_file(
            f"{self.config.install_dir}/version.json",
            json.dumps(version_info, indent=2)
        )
        
        return InstallResult(
            True, 
            f"Instalação concluída em {duration:.0f} segundos",
            details={'duration_seconds': duration}
        )
    
    # ========================================================================
    # MÉTODOS AUXILIARES
    # ========================================================================
    
    def _send_metrics(self, success: bool):
        """Envia métricas da instalação para o banco."""
        try:
            conn = sqlite3.connect(self.config.sqlite_path)
            cursor = conn.cursor()
            
            import uuid
            session_id = str(uuid.uuid4())
            
            cursor.execute("""
                INSERT INTO installer_metrics 
                (id, session_id, installer_version, distro_name, distro_family, 
                 install_mode, database_type, status, started_at, completed_at, 
                 total_duration_ms, steps, system_info)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                session_id,
                VERSION,
                self.distro_info.get('PRETTY_NAME', 'Unknown'),
                self.distro_info.get('ID_LIKE', self.distro_info.get('ID', 'unknown')),
                'docker-kiosk',
                'sqlite',
                'success' if success else 'failed',
                self.start_time.isoformat(),
                datetime.now().isoformat(),
                int((datetime.now() - self.start_time).total_seconds() * 1000),
                json.dumps([{'name': r.message, 'success': r.success, 'duration_ms': r.duration_ms} for r in self.results]),
                json.dumps(self.distro_info)
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            self.log.warning(f"Não foi possível salvar métricas: {e}")
    
    def _show_summary(self, success: bool):
        """Mostra resumo da instalação."""
        duration = (datetime.now() - self.start_time).total_seconds()
        
        if success:
            print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════╗
║                    ✅ INSTALAÇÃO CONCLUÍDA!                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  🎵 TSiJUKEBOX está pronto para uso!                          ║
║                                                                ║
║  📍 Acesso local: http://localhost:{self.config.app_port:<24}║
║  👤 Usuário kiosk: {self.config.user:<41}║
║  📁 Diretório: {self.config.install_dir:<46}║
║  🗄️  Banco de dados: {self.config.sqlite_path:<40}║
║                                                                ║
║  ⏱️  Tempo total: {duration:.0f} segundos{" " * (42 - len(f"{duration:.0f}"))}║
║                                                                ║
╠══════════════════════════════════════════════════════════════╣
║  PRÓXIMOS PASSOS:                                             ║
║                                                                ║
║  1. Reinicie o sistema: sudo reboot                           ║
║  2. O sistema iniciará automaticamente em modo kiosk          ║
║  3. Pressione Ctrl+Alt+Backspace para sair (emergência)       ║
║  4. Pressione Ctrl+Alt+R para reiniciar Chromium              ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
            
            if self.config.auto_reboot:
                print(f"{Colors.YELLOW}O sistema será reiniciado em 10 segundos...{Colors.RESET}")
                print(f"{Colors.YELLOW}Pressione Ctrl+C para cancelar.{Colors.RESET}")
                try:
                    time.sleep(10)
                    self._run_command(['reboot'])
                except KeyboardInterrupt:
                    print(f"\n{Colors.GREEN}Reinício cancelado. Execute 'sudo reboot' quando estiver pronto.{Colors.RESET}")
        else:
            print(f"""
{Colors.RED}╔══════════════════════════════════════════════════════════════╗
║                    ❌ INSTALAÇÃO FALHOU                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Verifique os logs em: {self.config.log_dir:<38}║
║                                                                ║
║  Erros encontrados:                                           ║""")
            
            for r in self.results:
                if not r.success:
                    print(f"║    • {r.message[:54]:<54}║")
            
            print(f"""║                                                                ║
╚══════════════════════════════════════════════════════════════╝{Colors.RESET}
""")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Ponto de entrada principal."""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Docker Kiosk Auto-Installer',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  sudo python3 install-docker-kiosk.py
  sudo python3 install-docker-kiosk.py --port 8080
  sudo python3 install-docker-kiosk.py --webhook https://api.example.com/events
  sudo python3 install-docker-kiosk.py --no-reboot
        """
    )
    
    parser.add_argument('--user', default='kiosk', help='Nome do usuário kiosk (default: kiosk)')
    parser.add_argument('--port', type=int, default=80, help='Porta da aplicação (default: 80)')
    parser.add_argument('--webhook', help='URL do webhook para notificações')
    parser.add_argument('--timezone', default='America/Sao_Paulo', help='Timezone (default: America/Sao_Paulo)')
    parser.add_argument('--resolution', help='Resolução da tela (ex: 1920x1080)')
    parser.add_argument('--rotation', type=int, choices=[0, 90, 180, 270], default=0, help='Rotação da tela')
    parser.add_argument('--show-cursor', action='store_true', help='Manter cursor visível')
    parser.add_argument('--no-reboot', action='store_true', help='Não reiniciar automaticamente após instalação')
    parser.add_argument('--version', action='version', version=f'TSiJUKEBOX Installer v{VERSION}')
    
    args = parser.parse_args()
    
    # Criar configuração
    config = KioskConfig(
        user=args.user,
        app_port=args.port,
        webhook_url=args.webhook,
        timezone=args.timezone,
        resolution=args.resolution,
        rotation=args.rotation,
        hide_cursor=not args.show_cursor,
        auto_reboot=not args.no_reboot,
    )
    
    # Executar instalação
    installer = DockerKioskInstaller(config)
    success = installer.run()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
