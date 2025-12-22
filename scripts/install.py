#!/usr/bin/env python3
"""
TSiJUKEBOX Enterprise - One-Line Installer
============================================
Script de instalação automatizada para Arch Linux e derivados.

USO:
    curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
    
    # Com opções:
    curl -fsSL .../install.py | sudo python3 - --mode kiosk --no-monitoring

OPÇÕES:
    --mode kiosk|server|full    Modo de instalação (padrão: full)
    --database sqlite|mariadb|postgresql    Banco de dados (padrão: sqlite)
    --user USERNAME             Usuário do sistema (padrão: detectado)
    --music-dir DIR             Diretório de músicas (padrão: ~/Musics)
    --no-spotify                Não instalar Spotify/Spicetify
    --no-spotify-cli            Não instalar spotify-cli-linux
    --no-monitoring             Não instalar Grafana/Prometheus
    --skip-packages             Pular instalação de pacotes (re-configuração)
    --dry-run                   Simular instalação (não executa comandos)
    --interactive, -i           Modo interativo: escolher componentes via menu
    --config-file, -c FILE      Carregar configuração de arquivo JSON
    --validate                  Validar instalação existente (não instala)
    --uninstall                 Remover instalação existente
    --verbose                   Output detalhado

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
from pathlib import Path
from typing import Optional, List, Dict, Tuple, Any
from dataclasses import dataclass, field

# Import opcional para spotify-cli-linux
try:
    from installer.spotify_cli_setup import SpotifyCLISetup, install_spotify_cli
    HAS_SPOTIFY_CLI_SETUP = True
except ImportError:
    HAS_SPOTIFY_CLI_SETUP = False

# =============================================================================
# CONSTANTES E CONFIGURAÇÃO
# =============================================================================

VERSION = "4.1.0"
INSTALL_DIR = Path("/opt/tsijukebox")
CONFIG_DIR = Path("/etc/tsijukebox")
LOG_DIR = Path("/var/log/tsijukebox")
DATA_DIR = Path("/var/lib/tsijukebox")

# Modo dry-run global
DRY_RUN = False

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

# Pacotes base necessários
BASE_PACKAGES = [
    'base-devel', 'git', 'nodejs', 'npm', 'python', 'python-pip',
    'chromium', 'openbox', 'xorg-server', 'xorg-xinit', 'xorg-xset',
    'xorg-xrandr', 'unclutter', 'wmctrl', 'xdotool'
]

# Pacotes de monitoramento
MONITORING_PACKAGES = ['grafana', 'prometheus', 'prometheus-node-exporter']

# Pacotes de rede/web
WEB_PACKAGES = ['nginx', 'avahi', 'nss-mdns']

# Login managers suportados
SUPPORTED_LOGIN_MANAGERS = ['sddm', 'gdm', 'lightdm', 'ly', 'greetd', 'getty']


# =============================================================================
# MENU INTERATIVO
# =============================================================================

class InteractiveMenu:
    """Menu interativo para seleção de componentes da instalação."""
    
    def __init__(self):
        self.options = {
            'spotify': True,
            'spotify_cli': True,
            'monitoring': True,
            'autologin': True,
            'chromium': True,
            'kiosk': False,
        }
        self.database = 'sqlite'
    
    def clear_screen(self):
        """Limpa a tela do terminal."""
        print("\033[2J\033[H", end="")
    
    def show_menu(self) -> Dict[str, bool]:
        """Exibe menu e retorna opções selecionadas."""
        self.clear_screen()
        
        # Símbolos de checkbox
        def cb(val: bool) -> str:
            return f"{Colors.GREEN}[x]{Colors.RESET}" if val else f"{Colors.WHITE}[ ]{Colors.RESET}"
        
        def rb(val: str, opt: str) -> str:
            return f"{Colors.GREEN}(•){Colors.RESET}" if val == opt else f"{Colors.WHITE}( ){Colors.RESET}"
        
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🎵 TSiJUKEBOX - INSTALAÇÃO INTERATIVA{Colors.RESET}{Colors.CYAN}                      ║
╠════════════════════════════════════════════════════════════════╣
║   Selecione os componentes que deseja instalar:               ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}

{Colors.YELLOW}━━━ COMPONENTES ━━━{Colors.RESET}

  {Colors.BOLD}1{Colors.RESET}. {cb(self.options['spotify'])} Spotify + Spicetify {Colors.CYAN}(player principal){Colors.RESET}
  {Colors.BOLD}2{Colors.RESET}. {cb(self.options['spotify_cli'])} spotify-cli-linux {Colors.CYAN}(comandos sp-play, sp-next...){Colors.RESET}
  {Colors.BOLD}3{Colors.RESET}. {cb(self.options['monitoring'])} Monitoramento {Colors.CYAN}(Grafana + Prometheus){Colors.RESET}
  {Colors.BOLD}4{Colors.RESET}. {cb(self.options['autologin'])} Configurar autologin
  {Colors.BOLD}5{Colors.RESET}. {cb(self.options['chromium'])} Chromium como homepage
  {Colors.BOLD}6{Colors.RESET}. {cb(self.options['kiosk'])} Modo Kiosk {Colors.CYAN}(tela cheia, sem desktop){Colors.RESET}

{Colors.YELLOW}━━━ BANCO DE DADOS ━━━{Colors.RESET}

  {Colors.BOLD}a{Colors.RESET}. {rb(self.database, 'sqlite')} SQLite {Colors.GREEN}(padrão, leve){Colors.RESET}
  {Colors.BOLD}b{Colors.RESET}. {rb(self.database, 'mariadb')} MariaDB {Colors.CYAN}(multi-usuário){Colors.RESET}
  {Colors.BOLD}c{Colors.RESET}. {rb(self.database, 'postgresql')} PostgreSQL {Colors.CYAN}(avançado){Colors.RESET}

{Colors.WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}
  {Colors.GREEN}[1-6]{Colors.RESET} Toggle componente   {Colors.GREEN}[a-c]{Colors.RESET} Selecionar DB
  {Colors.GREEN}[Enter]{Colors.RESET} Confirmar          {Colors.GREEN}[q]{Colors.RESET} Cancelar
{Colors.WHITE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}
""")
        
        while True:
            try:
                choice = input(f"{Colors.CYAN}→ Escolha: {Colors.RESET}").strip().lower()
            except EOFError:
                raise KeyboardInterrupt()
            
            if choice == '':
                # Confirmar seleção
                self._print_summary()
                return self.options
            elif choice == 'q':
                raise KeyboardInterrupt()
            elif choice == '1':
                self.options['spotify'] = not self.options['spotify']
                # Se desativar spotify, desativar spotify_cli também
                if not self.options['spotify']:
                    self.options['spotify_cli'] = False
            elif choice == '2':
                # Só pode ativar se spotify estiver ativo
                if self.options['spotify']:
                    self.options['spotify_cli'] = not self.options['spotify_cli']
                else:
                    print(f"{Colors.YELLOW}  ⚠️  Spotify precisa estar ativado para usar spotify-cli{Colors.RESET}")
                    continue
            elif choice == '3':
                self.options['monitoring'] = not self.options['monitoring']
            elif choice == '4':
                self.options['autologin'] = not self.options['autologin']
            elif choice == '5':
                self.options['chromium'] = not self.options['chromium']
            elif choice == '6':
                self.options['kiosk'] = not self.options['kiosk']
            elif choice == 'a':
                self.database = 'sqlite'
            elif choice == 'b':
                self.database = 'mariadb'
            elif choice == 'c':
                self.database = 'postgresql'
            else:
                print(f"{Colors.RED}  ✗ Opção inválida: {choice}{Colors.RESET}")
                continue
            
            # Redesenhar menu
            return self.show_menu()
    
    def _print_summary(self):
        """Imprime resumo das seleções."""
        print(f"\n{Colors.GREEN}✓ Configuração selecionada:{Colors.RESET}")
        
        components = []
        if self.options['spotify']:
            components.append("Spotify/Spicetify")
        if self.options['spotify_cli']:
            components.append("spotify-cli")
        if self.options['monitoring']:
            components.append("Monitoramento")
        if self.options['kiosk']:
            components.append("Modo Kiosk")
        
        print(f"  • Componentes: {', '.join(components) if components else 'Nenhum'}")
        print(f"  • Banco de dados: {self.database}")
        print()


# =============================================================================
# CLASSES DE DADOS
# =============================================================================

@dataclass
class InstallConfig:
    """Configuração de instalação carregada de arquivo JSON."""
    mode: str = 'full'
    database: str = 'sqlite'
    user: Optional[str] = None
    music_dir: str = 'Musics'
    no_spotify: bool = False
    no_spotify_cli: bool = False
    no_monitoring: bool = False
    skip_packages: bool = False
    autologin: bool = True
    kiosk: bool = False
    chromium_homepage: bool = True
    custom_packages: List[str] = field(default_factory=list)


@dataclass
class SystemInfo:
    """Informações do sistema detectadas."""
    distro: str
    distro_id: str
    user: str
    home: Path
    login_manager: str
    installed_packages: List[str]
    has_paru: bool
    has_spotify: bool


# =============================================================================
# VALIDAÇÃO PÓS-INSTALAÇÃO
# =============================================================================

class PostInstallValidator:
    """Valida se a instalação está funcionando corretamente."""
    
    SERVICES = ['tsijukebox']
    OPTIONAL_SERVICES = ['grafana', 'prometheus', 'prometheus-node-exporter']
    REQUIRED_DIRS = [INSTALL_DIR, CONFIG_DIR, LOG_DIR, DATA_DIR]
    PORTS = {
        5173: 'TSiJUKEBOX Web',
        3000: 'Grafana',
        9090: 'Prometheus',
        9100: 'Node Exporter',
    }
    
    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.results: List[Tuple[str, bool, str, str]] = []  # (name, ok, level, message)
    
    def _add_result(self, name: str, ok: bool, level: str, message: str = ""):
        """Adiciona resultado de verificação."""
        self.results.append((name, ok, level, message))
    
    def check_service(self, service: str, required: bool = True) -> bool:
        """Verifica se um serviço systemd está ativo."""
        code, stdout, _ = run_command(
            ['systemctl', 'is-active', service],
            capture=True, check=False
        )
        is_active = stdout.strip() == 'active'
        
        if is_active:
            self._add_result(f"Serviço {service}", True, "OK", "ativo")
        elif required:
            self._add_result(f"Serviço {service}", False, "ERROR", "inativo (obrigatório)")
        else:
            self._add_result(f"Serviço {service}", False, "WARN", "inativo (opcional)")
        
        return is_active
    
    def check_port(self, port: int, name: str, required: bool = True) -> bool:
        """Verifica se uma porta está respondendo."""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            is_open = result == 0
            
            if is_open:
                self._add_result(f"Porta {port} ({name})", True, "OK", "aberta")
            elif required:
                self._add_result(f"Porta {port} ({name})", False, "ERROR", "fechada")
            else:
                self._add_result(f"Porta {port} ({name})", False, "WARN", "fechada (opcional)")
            
            return is_open
        except Exception:
            self._add_result(f"Porta {port} ({name})", False, "ERROR", "erro ao verificar")
            return False
    
    def check_directories(self) -> bool:
        """Verifica se diretórios foram criados."""
        all_ok = True
        for dir_path in self.REQUIRED_DIRS:
            if dir_path.exists():
                self._add_result(f"Diretório {dir_path}", True, "OK", "existe")
            else:
                self._add_result(f"Diretório {dir_path}", False, "ERROR", "não encontrado")
                all_ok = False
        return all_ok
    
    def check_database(self) -> bool:
        """Verifica se banco de dados está acessível."""
        db_path = DATA_DIR / 'tsijukebox.db'
        if db_path.exists():
            size = db_path.stat().st_size
            self._add_result("Banco SQLite", True, "OK", f"existe ({size} bytes)")
            return True
        else:
            self._add_result("Banco SQLite", False, "WARN", "não encontrado")
            return False
    
    def check_config_files(self) -> bool:
        """Verifica arquivos de configuração."""
        config_files = [
            CONFIG_DIR / 'config.yaml',
            CONFIG_DIR / 'nginx.conf',
        ]
        all_ok = True
        for cfg in config_files:
            if cfg.exists():
                self._add_result(f"Config {cfg.name}", True, "OK", "existe")
            else:
                self._add_result(f"Config {cfg.name}", False, "WARN", "não encontrado")
                all_ok = False
        return all_ok
    
    def validate_all(self) -> bool:
        """Executa todas as validações."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🔍 VALIDAÇÃO PÓS-INSTALAÇÃO{Colors.RESET}{Colors.CYAN}                                 ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        # Serviços obrigatórios
        print(f"{Colors.YELLOW}━━━ SERVIÇOS SYSTEMD ━━━{Colors.RESET}")
        for service in self.SERVICES:
            self.check_service(service, required=True)
        
        # Serviços opcionais (monitoramento)
        if not getattr(self.args, 'no_monitoring', False):
            for service in self.OPTIONAL_SERVICES:
                self.check_service(service, required=False)
        
        # Diretórios
        print(f"\n{Colors.YELLOW}━━━ DIRETÓRIOS ━━━{Colors.RESET}")
        self.check_directories()
        
        # Banco de dados
        print(f"\n{Colors.YELLOW}━━━ BANCO DE DADOS ━━━{Colors.RESET}")
        self.check_database()
        
        # Arquivos de configuração
        print(f"\n{Colors.YELLOW}━━━ CONFIGURAÇÕES ━━━{Colors.RESET}")
        self.check_config_files()
        
        # Portas
        print(f"\n{Colors.YELLOW}━━━ PORTAS ━━━{Colors.RESET}")
        self.check_port(5173, 'TSiJUKEBOX', required=True)
        if not getattr(self.args, 'no_monitoring', False):
            self.check_port(3000, 'Grafana', required=False)
            self.check_port(9090, 'Prometheus', required=False)
        
        # Exibir resultados
        self._print_results()
        
        # Retornar True se não houver erros críticos
        errors = sum(1 for _, ok, level, _ in self.results if not ok and level == "ERROR")
        return errors == 0
    
    def _print_results(self):
        """Exibe resultados da validação."""
        print(f"\n{Colors.WHITE}━━━ RESULTADOS ━━━{Colors.RESET}\n")
        
        for name, ok, level, message in self.results:
            if ok:
                icon = f"{Colors.GREEN}✓{Colors.RESET}"
            elif level == "ERROR":
                icon = f"{Colors.RED}✗{Colors.RESET}"
            else:
                icon = f"{Colors.YELLOW}⚠{Colors.RESET}"
            
            print(f"  {icon} {name}: {message}")
        
        # Resumo
        total = len(self.results)
        passed = sum(1 for _, ok, _, _ in self.results if ok)
        errors = sum(1 for _, ok, level, _ in self.results if not ok and level == "ERROR")
        warns = sum(1 for _, ok, level, _ in self.results if not ok and level == "WARN")
        
        print()
        if errors == 0:
            print(f"{Colors.GREEN}✅ Validação concluída: {passed}/{total} verificações OK{Colors.RESET}")
            if warns > 0:
                print(f"{Colors.YELLOW}   ({warns} avisos){Colors.RESET}")
        else:
            print(f"{Colors.RED}❌ Validação falhou: {errors} erros encontrados{Colors.RESET}")
            print(f"{Colors.YELLOW}   Sugestão: verifique os serviços com 'systemctl status <serviço>'{Colors.RESET}")


# =============================================================================
# CARREGAMENTO DE CONFIGURAÇÃO JSON
# =============================================================================

def load_config_file(config_path: str) -> Dict[str, Any]:
    """Carrega configuração de arquivo JSON."""
    path = Path(config_path)
    
    if not path.exists():
        log_error(f"Arquivo de configuração não encontrado: {config_path}")
        sys.exit(1)
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        log_success(f"Configuração carregada: {config_path}")
        return config
    except json.JSONDecodeError as e:
        log_error(f"JSON inválido em {config_path}: {e}")
        sys.exit(1)
    except Exception as e:
        log_error(f"Erro ao ler {config_path}: {e}")
        sys.exit(1)


def apply_config_to_args(args: argparse.Namespace, config: Dict[str, Any]) -> None:
    """Aplica configuração JSON aos argumentos do parser."""
    # Mapeamento direto de chaves JSON para atributos args
    direct_mapping = {
        'mode': 'mode',
        'database': 'database',
        'user': 'user',
        'music_dir': 'music_dir',
        'no_spotify': 'no_spotify',
        'no_spotify_cli': 'no_spotify_cli',
        'no_monitoring': 'no_monitoring',
        'skip_packages': 'skip_packages',
    }
    
    for json_key, arg_key in direct_mapping.items():
        if json_key in config:
            setattr(args, arg_key, config[json_key])
    
    # Configurações especiais
    if config.get('kiosk', False):
        args.mode = 'kiosk'
    
    # Log das configurações aplicadas
    log_info(f"  • Modo: {args.mode}")
    log_info(f"  • Database: {args.database}")
    if args.user:
        log_info(f"  • Usuário: {args.user}")


# =============================================================================
# FUNÇÕES UTILITÁRIAS
# =============================================================================

def log(message: str, color: str = Colors.WHITE, prefix: str = ""):
    """Log colorido no terminal."""
    print(f"{color}{prefix}{message}{Colors.RESET}")


def log_success(message: str):
    log(message, Colors.GREEN, "✅ ")


def log_error(message: str):
    log(message, Colors.RED, "❌ ")


def log_warning(message: str):
    log(message, Colors.YELLOW, "⚠️  ")


def log_info(message: str):
    log(message, Colors.CYAN, "ℹ️  ")


def log_step(message: str):
    log(message, Colors.BLUE, "🔧 ")


def run_command(
    cmd: List[str],
    capture: bool = True,
    check: bool = True,
    sudo: bool = False,
    user: Optional[str] = None
) -> Tuple[int, str, str]:
    """Executa comando shell com tratamento de erros."""
    global DRY_RUN
    
    if sudo and os.geteuid() != 0:
        cmd = ["sudo"] + cmd
    
    if user and os.geteuid() == 0:
        cmd = ["sudo", "-u", user] + cmd
    
    # Modo dry-run: simular execução sem rodar comandos
    if DRY_RUN:
        log_info(f"[DRY-RUN] {' '.join(cmd)}")
        return 0, "[dry-run output]", ""
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            timeout=600
        )
        return result.returncode, result.stdout or "", result.stderr or ""
    except subprocess.TimeoutExpired:
        return 1, "", "Comando expirou (timeout)"
    except Exception as e:
        return 1, "", str(e)


# =============================================================================
# DETECÇÃO DE SISTEMA
# =============================================================================

def check_root():
    """Verifica se está executando como root."""
    if os.geteuid() != 0:
        log_error("Este script deve ser executado como root (sudo)")
        log_info("Uso: sudo python3 install.py")
        sys.exit(1)


def detect_logged_user() -> str:
    """Detecta o usuário logado (não root)."""
    # Tentar SUDO_USER primeiro
    sudo_user = os.environ.get('SUDO_USER')
    if sudo_user and sudo_user != 'root':
        return sudo_user
    
    # Verificar usuários logados via who
    code, out, _ = run_command(['who'], capture=True, check=False)
    if code == 0 and out.strip():
        first_user = out.strip().split()[0]
        if first_user != 'root':
            return first_user
    
    # Fallback: primeiro usuário com UID >= 1000
    for pw in pwd.getpwall():
        if 1000 <= pw.pw_uid < 60000:
            return pw.pw_name
    
    return 'tsi'


def detect_distro() -> Tuple[str, str]:
    """Detecta a distribuição Linux."""
    os_release = Path("/etc/os-release")
    
    if os_release.exists():
        content = os_release.read_text()
        info = {}
        for line in content.split('\n'):
            if '=' in line:
                key, value = line.split('=', 1)
                info[key] = value.strip('"')
        
        name = info.get('NAME', 'Unknown')
        distro_id = info.get('ID', 'unknown').lower()
        
        # Verificar se é Arch-based
        if distro_id in ['arch', 'cachyos', 'manjaro', 'endeavouros', 'garuda']:
            return name, distro_id
        
        # Verificar ID_LIKE
        id_like = info.get('ID_LIKE', '').lower()
        if 'arch' in id_like:
            return name, distro_id
    
    # Verificar pacman como fallback
    if shutil.which('pacman'):
        return 'Arch Linux', 'arch'
    
    log_error("Distribuição não suportada. Este script requer Arch Linux ou derivados.")
    sys.exit(1)


def detect_login_manager() -> str:
    """Detecta o login manager ativo."""
    # Verificar serviços systemd ativos
    for dm in ['sddm', 'gdm', 'lightdm', 'ly', 'greetd']:
        code, out, _ = run_command(
            ['systemctl', 'is-active', dm],
            capture=True, check=False
        )
        if out.strip() == 'active':
            return dm
    
    # Verificar serviços habilitados
    for dm in ['sddm', 'gdm', 'lightdm', 'ly', 'greetd']:
        code, out, _ = run_command(
            ['systemctl', 'is-enabled', dm],
            capture=True, check=False
        )
        if out.strip() == 'enabled':
            return dm
    
    # Verificar binários instalados
    for dm in SUPPORTED_LOGIN_MANAGERS:
        if shutil.which(dm):
            return dm
    
    return 'getty'


def get_installed_packages() -> List[str]:
    """Retorna lista de pacotes instalados."""
    code, out, _ = run_command(['pacman', '-Qq'], capture=True, check=False)
    if code == 0:
        return out.strip().split('\n')
    return []


def detect_system() -> SystemInfo:
    """Detecta informações completas do sistema."""
    distro_name, distro_id = detect_distro()
    user = detect_logged_user()
    home = Path(pwd.getpwnam(user).pw_dir)
    login_manager = detect_login_manager()
    installed_packages = get_installed_packages()
    has_paru = shutil.which('paru') is not None
    has_spotify = 'spotify' in installed_packages or 'spotify-launcher' in installed_packages
    
    return SystemInfo(
        distro=distro_name,
        distro_id=distro_id,
        user=user,
        home=home,
        login_manager=login_manager,
        installed_packages=installed_packages,
        has_paru=has_paru,
        has_spotify=has_spotify
    )


# =============================================================================
# INSTALAÇÃO DE PARU
# =============================================================================

def install_paru() -> bool:
    """Instala paru como AUR helper."""
    if shutil.which('paru'):
        log_info("paru já está instalado")
        return True
    
    log_step("Instalando paru (AUR helper)...")
    
    # Instalar dependências
    code, _, err = run_command(
        ['pacman', '-Sy', '--noconfirm', '--needed', 'base-devel', 'git'],
        capture=True
    )
    if code != 0:
        log_error(f"Falha ao instalar dependências: {err}")
        return False
    
    # Clonar e compilar paru
    temp_dir = Path("/tmp/paru-install")
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    
    try:
        # Clonar
        code, _, err = run_command(
            ['git', 'clone', 'https://aur.archlinux.org/paru.git', str(temp_dir)],
            capture=True
        )
        if code != 0:
            log_error(f"Falha ao clonar paru: {err}")
            return False
        
        # Compilar (como usuário não-root)
        user = detect_logged_user()
        
        # Mudar ownership do diretório
        run_command(['chown', '-R', f'{user}:{user}', str(temp_dir)])
        
        # Compilar
        code, _, err = run_command(
            ['makepkg', '-si', '--noconfirm'],
            capture=True,
            user=user
        )
        
        # Alternativa: usar subprocess diretamente com cwd
        result = subprocess.run(
            ['sudo', '-u', user, 'makepkg', '-si', '--noconfirm'],
            cwd=str(temp_dir),
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            log_success("paru instalado com sucesso")
            return True
        else:
            log_error(f"Falha ao compilar paru: {result.stderr}")
            return False
            
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)


# =============================================================================
# INSTALAÇÃO DE PACOTES
# =============================================================================

def install_packages(
    packages: List[str],
    aur: bool = False,
    system_info: Optional[SystemInfo] = None
) -> bool:
    """Instala pacotes via paru -Sy --noconfirm."""
    # Filtrar pacotes já instalados
    if system_info:
        to_install = [p for p in packages if p not in system_info.installed_packages]
    else:
        installed = get_installed_packages()
        to_install = [p for p in packages if p not in installed]
    
    if not to_install:
        log_info("Todos os pacotes já estão instalados")
        return True
    
    log_step(f"Instalando: {', '.join(to_install)}")
    
    if aur and shutil.which('paru'):
        # Usar paru para AUR
        user = detect_logged_user()
        result = subprocess.run(
            ['sudo', '-u', user, 'paru', '-Sy', '--noconfirm'] + to_install,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            log_warning(f"Alguns pacotes podem ter falhado: {result.stderr}")
        return True
    else:
        # Usar pacman
        code, _, err = run_command(
            ['pacman', '-Sy', '--noconfirm', '--needed'] + to_install,
            capture=True
        )
        if code != 0:
            log_error(f"Falha ao instalar pacotes: {err}")
            return False
        return True


# =============================================================================
# CONFIGURAÇÃO DE DIRETÓRIO DE MÚSICAS
# =============================================================================

def setup_music_directory(user: str, music_dir: str = "Musics") -> bool:
    """Configura diretório de músicas locais ~/Musics."""
    log_step(f"Configurando diretório de músicas: ~/{music_dir}")
    
    home = Path(pwd.getpwnam(user).pw_dir)
    music_path = home / music_dir
    
    # Criar diretório principal e subdiretórios
    subdirs = ['Albums', 'Singles', 'Playlists', 'Downloads', 'Podcasts']
    for subdir in subdirs:
        (music_path / subdir).mkdir(parents=True, exist_ok=True)
    
    # Configurar XDG user-dirs
    xdg_config = home / '.config'
    xdg_config.mkdir(parents=True, exist_ok=True)
    
    xdg_dirs = xdg_config / 'user-dirs.dirs'
    xdg_content = f'''# Configurado por TSiJUKEBOX Installer
XDG_MUSIC_DIR="$HOME/{music_dir}"
XDG_DOWNLOAD_DIR="$HOME/Downloads"
XDG_DESKTOP_DIR="$HOME/Desktop"
XDG_DOCUMENTS_DIR="$HOME/Documents"
XDG_PICTURES_DIR="$HOME/Pictures"
XDG_VIDEOS_DIR="$HOME/Videos"
'''
    xdg_dirs.write_text(xdg_content)
    
    # Corrigir ownership
    run_command(['chown', '-R', f'{user}:{user}', str(music_path)])
    run_command(['chown', f'{user}:{user}', str(xdg_dirs)])
    
    log_success(f"Diretório de músicas configurado: {music_path}")
    return True


# =============================================================================
# CONFIGURAÇÃO DE LOGIN MANAGER (AUTOLOGIN)
# =============================================================================

def configure_autologin(user: str, login_manager: str) -> bool:
    """Configura autologin no login manager detectado."""
    log_step(f"Configurando autologin via {login_manager}")
    
    if login_manager == 'sddm':
        return _configure_sddm_autologin(user)
    elif login_manager == 'gdm':
        return _configure_gdm_autologin(user)
    elif login_manager == 'lightdm':
        return _configure_lightdm_autologin(user)
    elif login_manager == 'ly':
        return _configure_ly_autologin(user)
    elif login_manager == 'greetd':
        return _configure_greetd_autologin(user)
    else:
        return _configure_getty_autologin(user)


def _configure_sddm_autologin(user: str) -> bool:
    """Configura autologin no SDDM."""
    config_dir = Path('/etc/sddm.conf.d')
    config_dir.mkdir(parents=True, exist_ok=True)
    
    config = f"""[Autologin]
User={user}
Session=openbox
Relogin=false

[Theme]
Current=breeze

[General]
HaltCommand=/usr/bin/systemctl poweroff
RebootCommand=/usr/bin/systemctl reboot
"""
    
    (config_dir / 'autologin.conf').write_text(config)
    log_success("SDDM autologin configurado")
    return True


def _configure_gdm_autologin(user: str) -> bool:
    """Configura autologin no GDM."""
    config_file = Path('/etc/gdm/custom.conf')
    
    config = f"""[daemon]
AutomaticLoginEnable=True
AutomaticLogin={user}

[security]

[xdmcp]

[chooser]

[debug]
"""
    
    config_file.parent.mkdir(parents=True, exist_ok=True)
    config_file.write_text(config)
    log_success("GDM autologin configurado")
    return True


def _configure_lightdm_autologin(user: str) -> bool:
    """Configura autologin no LightDM."""
    config_dir = Path('/etc/lightdm/lightdm.conf.d')
    config_dir.mkdir(parents=True, exist_ok=True)
    
    config = f"""[Seat:*]
autologin-user={user}
autologin-user-timeout=0
autologin-session=openbox
"""
    
    (config_dir / '50-autologin.conf').write_text(config)
    
    # Adicionar usuário ao grupo autologin
    if not _group_exists('autologin'):
        run_command(['groupadd', 'autologin'], check=False)
    run_command(['usermod', '-aG', 'autologin', user], check=False)
    
    log_success("LightDM autologin configurado")
    return True


def _configure_ly_autologin(user: str) -> bool:
    """Configura autologin no Ly."""
    config_file = Path('/etc/ly/config.ini')
    
    if config_file.exists():
        content = config_file.read_text()
        # Modificar configurações existentes
        lines = []
        for line in content.split('\n'):
            if line.startswith('default_user'):
                lines.append(f'default_user = {user}')
            elif line.startswith('autologin'):
                lines.append('autologin = true')
            else:
                lines.append(line)
        config_file.write_text('\n'.join(lines))
    else:
        config_file.parent.mkdir(parents=True, exist_ok=True)
        config = f"""animation = matrix
default_user = {user}
autologin = true
"""
        config_file.write_text(config)
    
    log_success("Ly autologin configurado")
    return True


def _configure_greetd_autologin(user: str) -> bool:
    """Configura autologin no greetd."""
    config_file = Path('/etc/greetd/config.toml')
    
    config = f'''[terminal]
vt = 1

[default_session]
command = "openbox-session"
user = "{user}"

[initial_session]
command = "openbox-session"
user = "{user}"
'''
    
    config_file.parent.mkdir(parents=True, exist_ok=True)
    config_file.write_text(config)
    log_success("greetd autologin configurado")
    return True


def _configure_getty_autologin(user: str) -> bool:
    """Configura autologin via getty (TTY)."""
    override_dir = Path('/etc/systemd/system/getty@tty1.service.d')
    override_dir.mkdir(parents=True, exist_ok=True)
    
    config = f"""[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin {user} --noclear %I $TERM
Type=idle
"""
    
    (override_dir / 'autologin.conf').write_text(config)
    
    # Recarregar systemd
    run_command(['systemctl', 'daemon-reload'])
    run_command(['systemctl', 'enable', 'getty@tty1.service'])
    
    log_success("getty autologin configurado")
    return True


def _group_exists(groupname: str) -> bool:
    """Verifica se um grupo existe."""
    try:
        grp.getgrnam(groupname)
        return True
    except KeyError:
        return False


# =============================================================================
# CONFIGURAÇÃO DE SESSÃO SPOTIFY-ONLY
# =============================================================================

def configure_spotify_only_session(user: str) -> bool:
    """Configura sessão onde APENAS Spotify aparece."""
    log_step("Configurando sessão Spotify-only")
    
    home = Path(pwd.getpwnam(user).pw_dir)
    
    # Criar .xinitrc minimalista para Spotify
    xinitrc_content = """#!/bin/bash
# ============================================
# TSiJUKEBOX - Sessão Spotify Only
# Gerado automaticamente pelo instalador
# ============================================

# Desabilitar screensaver e DPMS
xset s off &
xset -dpms &
xset s noblank &
xset b off &

# Esconder cursor após 3 segundos de inatividade
unclutter --timeout 3 --jitter 50 --ignore-scrolling &

# Variáveis de ambiente
export DISPLAY=:0
export TSIJUKEBOX_KIOSK=1
export TSIJUKEBOX_VERSION="4.1.0"

# Iniciar Openbox em background (para gerenciamento de janelas)
openbox &

# Aguardar X inicializar
sleep 2

# Iniciar Spotify em fullscreen
spotify &

# Aguardar Spotify iniciar
sleep 3

# Maximizar Spotify (fullscreen)
wmctrl -r "Spotify" -b add,fullscreen 2>/dev/null || true

# Loop de monitoramento - reiniciar Spotify se fechado
while true; do
    sleep 30
    
    # Verificar se Spotify está rodando
    if ! pgrep -x "spotify" > /dev/null; then
        # Reiniciar Spotify
        spotify &
        sleep 3
        wmctrl -r "Spotify" -b add,fullscreen 2>/dev/null || true
    fi
done
"""
    
    xinitrc_path = home / '.xinitrc'
    xinitrc_path.write_text(xinitrc_content)
    os.chmod(xinitrc_path, 0o755)
    
    # Criar .bash_profile para auto-startx
    bash_profile_content = """# ============================================
# TSiJUKEBOX Kiosk - Auto-start X
# ============================================

# Carregar .bashrc se existir
[[ -f ~/.bashrc ]] && . ~/.bashrc

# Iniciar X automaticamente no tty1
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx -- -nocursor 2>/dev/null
fi
"""
    
    bash_profile_path = home / '.bash_profile'
    
    # Append se já existir
    if bash_profile_path.exists():
        current = bash_profile_path.read_text()
        if 'TSiJUKEBOX' not in current:
            bash_profile_path.write_text(current + '\n' + bash_profile_content)
    else:
        bash_profile_path.write_text(bash_profile_content)
    
    # Corrigir ownership
    run_command(['chown', f'{user}:{user}', str(xinitrc_path)])
    run_command(['chown', f'{user}:{user}', str(bash_profile_path)])
    
    log_success("Sessão Spotify-only configurada")
    return True


# =============================================================================
# CONFIGURAÇÃO DO CHROMIUM
# =============================================================================

def configure_chromium_homepage(user: str, url: str = "http://localhost:5173") -> bool:
    """Configura Chromium para abrir TSiJUKEBOX como página inicial."""
    log_step("Configurando Chromium homepage")
    
    home = Path(pwd.getpwnam(user).pw_dir)
    
    # Diretório de configuração do Chromium
    chromium_config_dir = home / '.config' / 'chromium' / 'Default'
    chromium_config_dir.mkdir(parents=True, exist_ok=True)
    
    # Preferences do Chromium
    preferences = {
        "homepage": url,
        "homepage_is_newtabpage": False,
        "session": {
            "restore_on_startup": 4,
            "startup_urls": [url]
        },
        "browser": {
            "show_home_button": False,
            "check_default_browser": False,
            "custom_chrome_frame": False
        },
        "profile": {
            "default_content_setting_values": {
                "notifications": 2
            }
        }
    }
    
    prefs_path = chromium_config_dir / 'Preferences'
    
    # Merge com preferências existentes se houver
    if prefs_path.exists():
        try:
            existing = json.loads(prefs_path.read_text())
            _deep_merge(existing, preferences)
            preferences = existing
        except json.JSONDecodeError:
            pass
    
    prefs_path.write_text(json.dumps(preferences, indent=2))
    
    # Criar alias para chromium --kiosk
    bashrc_path = home / '.bashrc'
    alias_block = f'''
# ============================================
# TSiJUKEBOX Browser Aliases
# ============================================
alias tsi-browser="chromium --kiosk {url}"
alias tsi-kiosk="chromium --kiosk --no-first-run --disable-infobars {url}"
'''
    
    if bashrc_path.exists():
        content = bashrc_path.read_text()
        if 'tsi-browser' not in content:
            bashrc_path.write_text(content + alias_block)
    else:
        bashrc_path.write_text(alias_block)
    
    # Corrigir ownership
    run_command(['chown', '-R', f'{user}:{user}', str(chromium_config_dir.parent)])
    run_command(['chown', f'{user}:{user}', str(bashrc_path)])
    
    log_success(f"Chromium configurado com homepage: {url}")
    return True


def _deep_merge(base: dict, update: dict) -> dict:
    """Merge profundo de dicionários."""
    for key, value in update.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            _deep_merge(base[key], value)
        else:
            base[key] = value
    return base


# =============================================================================
# CONFIGURAÇÃO DE SQLITE
# =============================================================================

def setup_sqlite_database() -> bool:
    """Configura SQLite como banco de dados padrão."""
    log_step("Configurando SQLite como banco de dados")
    
    # Criar diretório de dados
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    # Instalar sqlite se não estiver instalado
    if 'sqlite' not in get_installed_packages():
        install_packages(['sqlite'])
    
    # Criar arquivo de configuração do banco
    db_config = {
        "type": "sqlite",
        "path": str(DATA_DIR / "tsijukebox.db"),
        "options": {
            "journal_mode": "WAL",
            "synchronous": "NORMAL",
            "cache_size": -64000,
            "foreign_keys": True
        }
    }
    
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    config_file = CONFIG_DIR / 'database.json'
    config_file.write_text(json.dumps(db_config, indent=2))
    
    log_success(f"SQLite configurado: {DATA_DIR / 'tsijukebox.db'}")
    return True


# =============================================================================
# INSTALAÇÃO DO SPOTIFY E SPICETIFY
# =============================================================================

def install_spotify_spicetify(user: str, system_info: SystemInfo) -> bool:
    """Instala Spotify e Spicetify com auto-configuração."""
    log_step("Instalando Spotify + Spicetify")
    
    # Verificar se já está instalado
    if system_info.has_spotify:
        log_info("Spotify já está instalado")
    else:
        # Tentar spotify-launcher primeiro (oficial do Arch)
        if 'spotify-launcher' not in system_info.installed_packages:
            code, _, _ = run_command(
                ['pacman', '-Sy', '--noconfirm', 'spotify-launcher'],
                capture=True, check=False
            )
            
            if code != 0:
                # Fallback: usar paru para instalar do AUR
                log_info("Tentando via AUR com paru...")
                result = subprocess.run(
                    ['sudo', '-u', user, 'paru', '-Sy', '--noconfirm', 'spotify'],
                    capture_output=True,
                    text=True
                )
                if result.returncode != 0:
                    log_warning("Spotify não pôde ser instalado automaticamente")
                    return False
    
    # Instalar Spicetify
    log_info("Instalando Spicetify CLI...")
    
    home = Path(pwd.getpwnam(user).pw_dir)
    
    # Instalar via curl (método oficial)
    install_cmd = "curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh"
    
    result = subprocess.run(
        ['sudo', '-u', user, 'bash', '-c', install_cmd],
        capture_output=True,
        text=True,
        cwd=str(home)
    )
    
    spicetify_installed = False
    
    if result.returncode == 0:
        log_success("Spicetify instalado via curl")
        spicetify_installed = True
    else:
        # Fallback: instalar via paru
        log_info("Tentando instalar Spicetify via AUR...")
        result = subprocess.run(
            ['sudo', '-u', user, 'paru', '-Sy', '--noconfirm', 'spicetify-cli'],
            capture_output=True,
            text=True
        )
        spicetify_installed = result.returncode == 0
    
    if not spicetify_installed:
        log_warning("Spicetify não pôde ser instalado")
        return False
    
    # ===== AUTO-CONFIGURAÇÃO DO SPICETIFY =====
    log_info("Auto-configurando Spicetify...")
    
    try:
        # Importar SpicetifySetup
        installer_path = Path(__file__).parent / 'installer'
        if str(installer_path) not in sys.path:
            sys.path.insert(0, str(installer_path))
        
        from spicetify_setup import SpicetifySetup
        
        # Criar instância com o usuário alvo
        spicetify = SpicetifySetup(user=user)
        
        # Iniciar Spotify brevemente para garantir criação do prefs
        log_info("Iniciando Spotify para criar arquivo de configuração...")
        try:
            proc = subprocess.Popen(
                ['sudo', '-u', user, 'spotify', '--no-zygote'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True
            )
            import time
            time.sleep(5)
            subprocess.run(['pkill', '-f', 'spotify'], capture_output=True)
            time.sleep(1)
        except Exception as e:
            log_warning(f"Não foi possível iniciar Spotify: {e}")
        
        # Executar auto-configuração
        if spicetify.auto_configure(user=user):
            log_success("Spicetify auto-configurado com sucesso")
            
            # Instalar Marketplace
            log_info("Instalando Spicetify Marketplace...")
            if spicetify.install_marketplace():
                log_success("Marketplace instalado")
            
            # Setup para TSiJUKEBOX (tema e extensões)
            log_info("Aplicando configurações TSiJUKEBOX...")
            spicetify.setup_for_tsijukebox()
            
            return True
        else:
            log_warning("Auto-configuração do Spicetify falhou")
            log_info("Execute manualmente: spicetify-auto-setup.sh")
            return False
            
    except ImportError as e:
        log_warning(f"Não foi possível importar SpicetifySetup: {e}")
        log_info("Spicetify instalado, mas requer configuração manual")
        return True
    except Exception as e:
        log_warning(f"Erro na auto-configuração: {e}")
        log_info("Spicetify instalado, mas requer configuração manual")
        return True


# =============================================================================
# INSTALAÇÃO DO SPOTIFY-CLI-LINUX
# =============================================================================

def install_spotify_cli_tools(user: str) -> bool:
    """Instala spotify-cli-linux para controle via terminal."""
    log_step("Instalando spotify-cli-linux...")
    
    if not HAS_SPOTIFY_CLI_SETUP:
        log_warning("Módulo spotify_cli_setup não encontrado, usando pip diretamente")
        # Fallback: instalar diretamente via pip
        result = subprocess.run(
            ['sudo', '-u', user, 'pip', 'install', '--user', '--break-system-packages', 'spotify-cli-linux'],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            log_success("spotify-cli-linux instalado via pip")
            return True
        log_warning(f"Falha ao instalar spotify-cli-linux: {result.stderr}")
        return False
    
    try:
        setup = SpotifyCLISetup(user, verbose=True)
        if setup.full_setup():
            log_success("spotify-cli-linux configurado com aliases")
            return True
        log_warning("Falha na configuração completa do spotify-cli-linux")
        return False
    except Exception as e:
        log_warning(f"Erro ao configurar spotify-cli-linux: {e}")
        return False


# =============================================================================
# CRIAÇÃO DE SERVIÇOS SYSTEMD
# =============================================================================

def create_systemd_services(user: str) -> bool:
    """Cria serviços systemd para TSiJUKEBOX."""
    log_step("Criando serviços systemd")
    
    # Serviço principal do TSiJUKEBOX
    service_content = f"""[Unit]
Description=TSiJUKEBOX Enterprise Music System
After=network.target

[Service]
Type=simple
User={user}
WorkingDirectory={INSTALL_DIR}
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5173

[Install]
WantedBy=multi-user.target
"""
    
    service_path = Path('/etc/systemd/system/tsijukebox.service')
    service_path.write_text(service_content)
    
    # Recarregar e habilitar
    run_command(['systemctl', 'daemon-reload'])
    run_command(['systemctl', 'enable', 'tsijukebox.service'], check=False)
    
    log_success("Serviço systemd criado e habilitado")
    return True


# =============================================================================
# INSTALAÇÃO PRINCIPAL
# =============================================================================

def run_installation(args: argparse.Namespace) -> bool:
    """Executa a instalação completa."""
    
    # Banner
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗
║   {Colors.MAGENTA}████████╗{Colors.CYAN}███████╗{Colors.GREEN}██╗{Colors.CYAN}      ██╗██╗   ██╗██╗  ██╗███████╗██████╗   ║
║   {Colors.MAGENTA}╚══██╔══╝{Colors.CYAN}██╔════╝{Colors.GREEN}██║{Colors.CYAN}      ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗  ║
║   {Colors.MAGENTA}   ██║   {Colors.CYAN}███████╗{Colors.GREEN}██║{Colors.CYAN}█████ ██║██║   ██║█████╔╝ █████╗  ██████╔╝  ║
║   {Colors.MAGENTA}   ██║   {Colors.CYAN}╚════██║{Colors.GREEN}██║{Colors.CYAN}╚════ ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗  ║
║   {Colors.MAGENTA}   ██║   {Colors.CYAN}███████║{Colors.GREEN}██║{Colors.CYAN}      ██║╚██████╔╝██║  ██╗███████╗██████╔╝  ║
║   {Colors.MAGENTA}   ╚═╝   {Colors.CYAN}╚══════╝{Colors.GREEN}╚═╝{Colors.CYAN}      ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝   ║
║                                                                      ║
║   {Colors.WHITE}E N T E R P R I S E   I N S T A L L E R   v{VERSION}{Colors.CYAN}              ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    # Detectar sistema
    log_step("Detectando sistema...")
    system_info = detect_system()
    
    print(f"""
{Colors.GREEN}✓ Sistema detectado:{Colors.RESET}
  • Distribuição: {system_info.distro}
  • Usuário: {system_info.user}
  • Home: {system_info.home}
  • Login Manager: {system_info.login_manager}
  • paru instalado: {'Sim' if system_info.has_paru else 'Não'}
  • Spotify instalado: {'Sim' if system_info.has_spotify else 'Não'}
  • Pacotes instalados: {len(system_info.installed_packages)}
""")
    
    user = args.user or system_info.user
    music_dir = args.music_dir or "Musics"
    
    # 1-3. Instalação de pacotes (pular se --skip-packages)
    if getattr(args, 'skip_packages', False):
        log_warning("⏭️  Pulando instalação de pacotes (--skip-packages)")
    else:
        # 1. Instalar paru se necessário
        if not system_info.has_paru:
            if not install_paru():
                log_error("Falha ao instalar paru")
                return False
        
        # 2. Atualizar sistema
        log_step("Atualizando sistema com paru -Sy...")
        run_command(['paru', '-Sy', '--noconfirm'], capture=True, check=False)
        
        # 3. Instalar pacotes base
        log_step("Instalando pacotes base...")
        install_packages(BASE_PACKAGES, system_info=system_info)
    
    # 4. Configurar diretório de músicas
    setup_music_directory(user, music_dir)
    
    # 5. Configurar autologin
    configure_autologin(user, system_info.login_manager)
    
    # 6. Instalar Spotify e Spicetify (se não --no-spotify)
    if not args.no_spotify:
        install_spotify_spicetify(user, system_info)
        configure_spotify_only_session(user)
        
        # Instalar spotify-cli-linux (se não --no-spotify-cli)
        if not args.no_spotify_cli:
            install_spotify_cli_tools(user)
    
    # 7. Configurar Chromium
    configure_chromium_homepage(user)
    
    # 8. Configurar SQLite
    setup_sqlite_database()
    
    # 9. Instalar monitoramento (se não --no-monitoring)
    if not args.no_monitoring:
        log_step("Instalando stack de monitoramento...")
        install_packages(MONITORING_PACKAGES, system_info=system_info)
    
    # 10. Instalar Nginx
    install_packages(WEB_PACKAGES, system_info=system_info)
    
    # 11. Criar serviços systemd
    create_systemd_services(user)
    
    # 12. Validação pós-instalação automática
    if not DRY_RUN:
        print()
        log_step("Executando validação pós-instalação...")
        validator = PostInstallValidator(args)
        validation_ok = validator.validate_all()
        
        if not validation_ok:
            log_warning("Algumas verificações falharam. Verifique os erros acima.")
    
    # Relatório final
    print(f"""
{Colors.GREEN}╔══════════════════════════════════════════════════════════════════╗
║                    ✅ INSTALAÇÃO COMPLETA!                        ║
╚══════════════════════════════════════════════════════════════════════╝{Colors.RESET}

{Colors.CYAN}Configurações aplicadas:{Colors.RESET}
  • Usuário: {user}
  • Diretório de músicas: ~/{music_dir}
  • Login Manager: {system_info.login_manager} (autologin configurado)
  • Sessão: Spotify-only em fullscreen
  • Chromium: Homepage TSiJUKEBOX
  • Banco de dados: SQLite ({DATA_DIR / 'tsijukebox.db'})

{Colors.YELLOW}Próximos passos:{Colors.RESET}
  1. Reinicie o sistema: sudo reboot
  2. O Spotify iniciará automaticamente em fullscreen
  3. Acesse TSiJUKEBOX: http://localhost:5173
  
{Colors.MAGENTA}Comandos úteis:{Colors.RESET}
  • tsi-browser    - Abre TSiJUKEBOX no Chromium (kiosk)
  • tsi-kiosk      - Modo kiosk completo
  • sp-status      - Status atual do Spotify (artista - música)
  • sp-play/pause  - Controlar reprodução
  • sp-next/prev   - Trocar música
  • sp-lyrics      - Ver letra da música atual
  • systemctl status tsijukebox  - Status do serviço
  • sudo python3 install.py --validate  - Verificar instalação

{Colors.GREEN}Obrigado por usar TSiJUKEBOX Enterprise! 🎵{Colors.RESET}
""")
    
    return True


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise - One-Line Installer',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument('--mode', choices=['kiosk', 'server', 'full'],
                       default='full', help='Modo de instalação')
    parser.add_argument('--database', choices=['sqlite', 'mariadb', 'postgresql'],
                       default='sqlite', help='Banco de dados (padrão: sqlite)')
    parser.add_argument('--user', type=str, help='Usuário do sistema')
    parser.add_argument('--music-dir', type=str, default='Musics',
                       help='Diretório de músicas (padrão: Musics)')
    parser.add_argument('--no-spotify', action='store_true',
                       help='Não instalar Spotify/Spicetify')
    parser.add_argument('--no-spotify-cli', action='store_true',
                       help='Não instalar spotify-cli-linux (CLI para terminal)')
    parser.add_argument('--no-monitoring', action='store_true',
                       help='Não instalar Grafana/Prometheus')
    parser.add_argument('--skip-packages', action='store_true',
                       help='Pular instalação de pacotes (útil para re-configuração)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simular instalação sem executar comandos')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Modo interativo: escolher componentes via menu')
    parser.add_argument('--config-file', '-c', type=str,
                       help='Carregar configuração de arquivo JSON')
    parser.add_argument('--validate', action='store_true',
                       help='Validar instalação existente (não instala)')
    parser.add_argument('--uninstall', action='store_true',
                       help='Remover instalação existente')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Modo verboso')
    parser.add_argument('--version', action='version', version=f'TSiJUKEBOX Installer v{VERSION}')
    
    args = parser.parse_args()
    
    # Ativar modo dry-run
    global DRY_RUN
    if args.dry_run:
        DRY_RUN = True
        log_warning("🧪 MODO DRY-RUN: Nenhum comando será executado de fato")
    
    # Carregar configuração de arquivo JSON (se fornecido)
    if args.config_file:
        log_info(f"📄 Carregando configuração de: {args.config_file}")
        config = load_config_file(args.config_file)
        apply_config_to_args(args, config)
        log_success("Configuração JSON aplicada!")
    
    # Modo interativo: exibir menu de seleção
    if args.interactive:
        log_info("🎛️  Modo interativo ativado")
        menu = InteractiveMenu()
        try:
            choices = menu.show_menu()
            
            # Aplicar escolhas do menu aos argumentos
            args.no_spotify = not choices['spotify']
            args.no_spotify_cli = not choices['spotify_cli']
            args.no_monitoring = not choices['monitoring']
            args.database = menu.database
            
            # Configurações adicionais baseadas no menu
            if choices['kiosk']:
                args.mode = 'kiosk'
            
            log_success("Configuração interativa aplicada!")
        except KeyboardInterrupt:
            log_warning("\nInstalação cancelada pelo usuário")
            sys.exit(130)
    
    # Modo validação: apenas verificar instalação existente
    if args.validate:
        log_info("🔍 Executando validação pós-instalação...")
        validator = PostInstallValidator(args)
        success = validator.validate_all()
        sys.exit(0 if success else 1)
    
    # Verificar root
    check_root()
    
    # Executar instalação
    try:
        success = run_installation(args)
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        log_warning("\nInstalação cancelada pelo usuário")
        sys.exit(130)
    except Exception as e:
        log_error(f"Erro durante instalação: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
