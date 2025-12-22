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
    --config-file, -c FILE      Arquivos JSON de configuração (suporta múltiplos para herança)
    --validate                  Validar instalação existente (não instala)
    --generate-config FILE      Gerar config.json interativamente
    --backup LABEL              Criar backup das configurações antes de reinstalar
    --restore FILE              Restaurar backup de configurações
    --list-backups              Listar backups disponíveis
    --doctor                    Diagnosticar problemas e sugerir correções
    --doctor-fix                Diagnosticar e aplicar correções automaticamente
    --quiet, -q                 Modo silencioso (apenas erros)
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

VERSION = "4.3.0"
INSTALL_DIR = Path("/opt/tsijukebox")
CONFIG_DIR = Path("/etc/tsijukebox")
LOG_DIR = Path("/var/log/tsijukebox")
DATA_DIR = Path("/var/lib/tsijukebox")
REPO_URL = "https://github.com/B0yZ4kr14/TSiJUKEBOX.git"

# Modos globais
DRY_RUN = False
QUIET_MODE = False
ROLLBACK_DRY_RUN = False

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

class InstallationError(Exception):
    """Erro durante instalação que pode ser revertido."""
    
    def __init__(self, message: str, stage: str = "", recoverable: bool = True):
        super().__init__(message)
        self.stage = stage
        self.recoverable = recoverable


@dataclass
class InstallationCheckpoint:
    """Checkpoint para rollback de instalação."""
    name: str
    state: Dict[str, Any]
    rollback_commands: List[str]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat() if 'datetime' in dir() else "")
    
    def __post_init__(self):
        from datetime import datetime
        if not self.timestamp:
            self.timestamp = datetime.now().isoformat()


class RollbackManager:
    """Gerenciador de rollback para instalação."""
    
    def __init__(self):
        self.checkpoints: List[InstallationCheckpoint] = []
        self._lock = False
    
    def create_checkpoint(self, name: str, state: Dict[str, Any], rollback_commands: List[str]) -> None:
        """Cria novo checkpoint."""
        checkpoint = InstallationCheckpoint(
            name=name,
            state=state,
            rollback_commands=rollback_commands
        )
        self.checkpoints.append(checkpoint)
        if not QUIET_MODE:
            log_info(f"📍 Checkpoint criado: {name}")
            if rollback_commands:
                log_info(f"   └─ {len(rollback_commands)} comando(s) de rollback registrado(s)")
    
    def has_checkpoints(self) -> bool:
        return len(self.checkpoints) > 0
    
    def get_checkpoint(self, name: str) -> Optional[InstallationCheckpoint]:
        for cp in self.checkpoints:
            if cp.name == name:
                return cp
        return None
    
    def rollback_to(self, checkpoint_name: str) -> bool:
        """Reverte até checkpoint específico."""
        target_idx = None
        for i, cp in enumerate(self.checkpoints):
            if cp.name == checkpoint_name:
                target_idx = i
                break
        
        if target_idx is None:
            return False
        
        # Reverter do mais recente até o target (não inclui target)
        for cp in reversed(self.checkpoints[target_idx + 1:]):
            self._execute_rollback(cp)
        
        self.checkpoints = self.checkpoints[:target_idx + 1]
        return True
    
    def rollback_all(self) -> bool:
        """Reverte todos os checkpoints."""
        if not self.checkpoints:
            return True
        
        log_warning("⏪ Iniciando rollback completo...")
        
        for cp in reversed(self.checkpoints):
            self._execute_rollback(cp)
        
        self.checkpoints.clear()
        log_success("Rollback completo executado")
        return True
    
    def _execute_rollback(self, checkpoint: InstallationCheckpoint) -> None:
        """Executa comandos de rollback de um checkpoint."""
        log_info(f"↩️  Revertendo: {checkpoint.name}")
        
        for cmd in checkpoint.rollback_commands:
            # Modo dry-run ou rollback-dry-run: apenas logar
            if DRY_RUN:
                log_info(f"  [DRY-RUN] {cmd}")
                continue
            if ROLLBACK_DRY_RUN:
                log_info(f"  [ROLLBACK-DRY-RUN] {cmd}")
                continue
            
            try:
                # Usar shell=True para suportar ||, &&, pipes e comandos complexos
                result = subprocess.run(
                    cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=120
                )
                if result.returncode == 0:
                    log_info(f"  ✓ {cmd[:60]}{'...' if len(cmd) > 60 else ''}")
                elif result.stderr:
                    log_warning(f"  ⚠ Aviso: {result.stderr.strip()[:100]}")
            except subprocess.TimeoutExpired:
                log_warning(f"  ⏱ Timeout ao executar: {cmd[:50]}...")
            except Exception as e:
                log_warning(f"  ✗ Falha ao executar: {cmd[:50]}... ({e})")
    
    def cleanup(self) -> None:
        """Limpa checkpoints após sucesso."""
        self.checkpoints.clear()
    
    def export_state(self) -> Dict[str, Any]:
        """Exporta estado para debug."""
        return {
            "checkpoints": [
                {"name": cp.name, "timestamp": cp.timestamp, "commands": len(cp.rollback_commands)}
                for cp in self.checkpoints
            ]
        }


# Import datetime for checkpoints
from datetime import datetime


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
    REQUIRED_FILES = {
        INSTALL_DIR / 'package.json': 'Repositório clonado',
        INSTALL_DIR / 'node_modules': 'npm dependencies',
        CONFIG_DIR / 'config.yaml': 'Configuração YAML',
        DATA_DIR / 'tsijukebox.db': 'Banco SQLite',
    }
    PORTS = {
        5173: 'TSiJUKEBOX Web',
        3000: 'Grafana',
        9090: 'Prometheus',
        9100: 'Node Exporter',
    }
    
    def __init__(self, args: argparse.Namespace):
        self.args = args
        self.results: List[Tuple[str, bool, str, str]] = []  # (name, ok, level, message)
        self.repair_commands: List[str] = []  # Comandos de correção
    
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
                self.repair_commands.append(f"sudo mkdir -p {dir_path}")
                all_ok = False
        return all_ok
    
    def check_repository(self) -> bool:
        """Verifica se repositório foi clonado corretamente."""
        package_json = INSTALL_DIR / 'package.json'
        node_modules = INSTALL_DIR / 'node_modules'
        
        if not INSTALL_DIR.exists():
            self._add_result("Repositório clonado", False, "ERROR", f"{INSTALL_DIR} não existe")
            self.repair_commands.append(f"sudo git clone --depth 1 {REPO_URL} {INSTALL_DIR}")
            return False
        
        if not package_json.exists():
            self._add_result("package.json", False, "ERROR", "repositório incompleto")
            self.repair_commands.append(f"sudo rm -rf {INSTALL_DIR} && sudo git clone --depth 1 {REPO_URL} {INSTALL_DIR}")
            return False
        
        self._add_result("Repositório clonado", True, "OK", str(INSTALL_DIR))
        
        if not node_modules.exists():
            self._add_result("node_modules", False, "WARN", "npm install necessário")
            self.repair_commands.append(f"cd {INSTALL_DIR} && sudo npm install")
            return True  # Não é erro crítico
        
        self._add_result("npm dependencies", True, "OK", "instaladas")
        return True
    
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
        
        # Repositório e npm
        print(f"{Colors.YELLOW}━━━ REPOSITÓRIO ━━━{Colors.RESET}")
        self.check_repository()
        
        # Serviços obrigatórios
        print(f"\n{Colors.YELLOW}━━━ SERVIÇOS SYSTEMD ━━━{Colors.RESET}")
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
        
        # Mostrar comandos de reparo se houver erros
        if self.repair_commands:
            print(f"\n{Colors.YELLOW}━━━ COMANDOS DE CORREÇÃO ━━━{Colors.RESET}\n")
            for cmd in self.repair_commands:
                print(f"  {Colors.CYAN}${Colors.RESET} {cmd}")
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
# CONFIG GENERATOR (--generate-config)
# =============================================================================

class ConfigGenerator:
    """Gera arquivo de configuração JSON interativamente."""
    
    def __init__(self):
        self.menu = InteractiveMenu()
    
    def generate(self, output_path: str = 'config.json') -> bool:
        """Gera config.json baseado nas escolhas do usuário."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}📝 GERADOR DE CONFIGURAÇÃO{Colors.RESET}{Colors.CYAN}                                 ║
║   Responda as perguntas para gerar seu config.json              ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        try:
            choices = self.menu.show_menu()
        except KeyboardInterrupt:
            log_warning("Geração cancelada")
            return False
        
        # Coletar informações adicionais
        print(f"\n{Colors.YELLOW}━━━ CONFIGURAÇÕES ADICIONAIS ━━━{Colors.RESET}\n")
        
        try:
            user = input(f"{Colors.CYAN}Usuário do sistema (Enter para auto-detectar): {Colors.RESET}").strip()
            music_dir = input(f"{Colors.CYAN}Diretório de músicas (Enter para 'Musics'): {Colors.RESET}").strip() or "Musics"
        except EOFError:
            user = ""
            music_dir = "Musics"
        
        # Construir config
        config = {
            "$schema": "https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/docs/config-schema.json",
            "_comment": "Gerado por: python3 install.py --generate-config",
            "mode": "kiosk" if choices.get('kiosk') else "full",
            "database": self.menu.database,
            "music_dir": music_dir,
            "no_spotify": not choices['spotify'],
            "no_spotify_cli": not choices['spotify_cli'],
            "no_monitoring": not choices['monitoring'],
            "skip_packages": False,
            "autologin": choices['autologin'],
            "kiosk": choices['kiosk'],
            "chromium_homepage": choices['chromium'],
        }
        
        # Adicionar user apenas se especificado
        if user:
            config["user"] = user
        
        # Salvar arquivo
        path = Path(output_path)
        try:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            log_success(f"Configuração salva em: {path.absolute()}")
            log_info(f"Use: sudo python3 install.py --config-file {output_path}")
            return True
        except Exception as e:
            log_error(f"Falha ao salvar configuração: {e}")
            return False


# =============================================================================
# CONFIG BACKUP (--backup, --restore, --list-backups)
# =============================================================================

class ConfigBackup:
    """Gerencia backups de configuração do TSiJUKEBOX."""
    
    BACKUP_DIR = Path("/var/backups/tsijukebox")
    
    def __init__(self):
        self.BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    def create_backup(self, label: str = "") -> Optional[Path]:
        """Cria backup completo das configurações."""
        import tarfile
        from datetime import datetime
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"tsijukebox_backup_{timestamp}"
        if label and label != 'auto':
            backup_name += f"_{label}"
        backup_path = self.BACKUP_DIR / f"{backup_name}.tar.gz"
        
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}💾 BACKUP DE CONFIGURAÇÕES{Colors.RESET}{Colors.CYAN}                                 ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        files_backed_up = 0
        
        try:
            with tarfile.open(backup_path, "w:gz") as tar:
                # Config dir
                if CONFIG_DIR.exists():
                    tar.add(CONFIG_DIR, arcname="etc/tsijukebox")
                    log_success(f"  {CONFIG_DIR}")
                    files_backed_up += 1
                
                # Database
                db_path = DATA_DIR / 'tsijukebox.db'
                if db_path.exists():
                    tar.add(db_path, arcname="var/lib/tsijukebox/tsijukebox.db")
                    log_success(f"  {db_path}")
                    files_backed_up += 1
                
                # Spotify/Spicetify configs por usuário
                home_dir = Path("/home")
                if home_dir.exists():
                    for user_home in home_dir.iterdir():
                        if user_home.is_dir():
                            spicetify = user_home / ".spicetify"
                            if spicetify.exists():
                                tar.add(spicetify, arcname=f"home/{user_home.name}/.spicetify")
                                log_success(f"  {spicetify}")
                                files_backed_up += 1
                            
                            spotify_prefs = user_home / ".config" / "spotify" / "prefs"
                            if spotify_prefs.exists():
                                tar.add(spotify_prefs, arcname=f"home/{user_home.name}/.config/spotify/prefs")
                                log_success(f"  {spotify_prefs}")
                                files_backed_up += 1
            
            size_kb = backup_path.stat().st_size / 1024
            log_success(f"\n✅ Backup criado: {backup_path}")
            log_info(f"   {files_backed_up} itens | {size_kb:.1f} KB")
            
            return backup_path
        except Exception as e:
            log_error(f"Falha ao criar backup: {e}")
            return None
    
    def restore_backup(self, backup_path: str) -> bool:
        """Restaura backup de configurações."""
        import tarfile
        
        path = Path(backup_path)
        if not path.exists():
            log_error(f"Arquivo de backup não encontrado: {backup_path}")
            return False
        
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}📦 RESTAURANDO BACKUP{Colors.RESET}{Colors.CYAN}                                       ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        try:
            with tarfile.open(path, "r:gz") as tar:
                tar.extractall("/")
            log_success(f"Backup restaurado de: {backup_path}")
            return True
        except Exception as e:
            log_error(f"Falha ao restaurar backup: {e}")
            return False
    
    def list_backups(self) -> List[Path]:
        """Lista backups disponíveis."""
        backups = sorted(self.BACKUP_DIR.glob("tsijukebox_backup_*.tar.gz"), reverse=True)
        
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}📋 BACKUPS DISPONÍVEIS{Colors.RESET}{Colors.CYAN}                                      ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        if not backups:
            log_warning("Nenhum backup encontrado")
            log_info(f"Diretório de backups: {self.BACKUP_DIR}")
            return []
        
        for backup in backups:
            size_kb = backup.stat().st_size / 1024
            mtime = backup.stat().st_mtime
            from datetime import datetime
            date_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")
            print(f"  {Colors.GREEN}•{Colors.RESET} {backup.name}")
            print(f"    {Colors.WHITE}Data: {date_str} | Tamanho: {size_kb:.1f} KB{Colors.RESET}")
        
        print(f"\n{Colors.CYAN}Para restaurar:{Colors.RESET}")
        print(f"  sudo python3 install.py --restore {backups[0]}")
        
        return backups


# =============================================================================
# SYSTEMD HEALTH TIMER (--install-timer, --uninstall-timer)
# =============================================================================

class SystemdHealthTimer:
    """Cria timer systemd para health-check automático com alertas."""
    
    TIMER_PATH = Path("/etc/systemd/system/tsijukebox-healthcheck.timer")
    SERVICE_PATH = Path("/etc/systemd/system/tsijukebox-healthcheck.service")
    ENV_PATH = CONFIG_DIR / "healthcheck.env"
    
    TIMER_UNIT = """[Unit]
Description=TSiJUKEBOX Health Check Timer
Documentation=https://github.com/B0yZ4kr14/TSiJUKEBOX

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min
Unit=tsijukebox-healthcheck.service
Persistent=true

[Install]
WantedBy=timers.target
"""
    
    SERVICE_UNIT = """[Unit]
Description=TSiJUKEBOX Health Check Service
Documentation=https://github.com/B0yZ4kr14/TSiJUKEBOX
After=network.target tsijukebox.service

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 {install_dir}/scripts/install.py --health-check --alert-on-failure
User=root
EnvironmentFile=-{env_path}
TimeoutStartSec=60

[Install]
WantedBy=multi-user.target
"""
    
    def __init__(self):
        self.install_dir = INSTALL_DIR
    
    def install(self, alert_channels: List[str] = None) -> bool:
        """Instala timer e service de health-check."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}⏰ INSTALANDO HEALTH CHECK TIMER{Colors.RESET}{Colors.CYAN}                           ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        # Criar diretório de config se não existir
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        
        # Criar arquivo de ambiente
        log_step("Criando arquivo de configuração...")
        env_content = self._generate_env_file(alert_channels or ['database'])
        
        if not DRY_RUN:
            self.ENV_PATH.write_text(env_content)
            log_success(f"Arquivo de ambiente criado: {self.ENV_PATH}")
        
        # Criar service unit
        log_step("Criando service unit...")
        service_content = self.SERVICE_UNIT.format(
            install_dir=self.install_dir,
            env_path=self.ENV_PATH
        )
        
        if not DRY_RUN:
            self.SERVICE_PATH.write_text(service_content)
            log_success(f"Service criado: {self.SERVICE_PATH}")
        
        # Criar timer unit
        log_step("Criando timer unit...")
        if not DRY_RUN:
            self.TIMER_PATH.write_text(self.TIMER_UNIT)
            log_success(f"Timer criado: {self.TIMER_PATH}")
        
        # Recarregar systemd
        log_step("Recarregando systemd...")
        run_command(['systemctl', 'daemon-reload'], check=False)
        
        # Habilitar e iniciar timer
        log_step("Habilitando timer...")
        run_command(['systemctl', 'enable', 'tsijukebox-healthcheck.timer'], check=False)
        run_command(['systemctl', 'start', 'tsijukebox-healthcheck.timer'], check=False)
        
        log_success("Health check timer instalado e ativado!")
        log_info("  O sistema será verificado a cada 5 minutos")
        log_info(f"  Status: systemctl status tsijukebox-healthcheck.timer")
        
        # Configurar alertas interativamente se solicitado
        if alert_channels and 'telegram' in alert_channels:
            self._configure_telegram()
        
        return True
    
    def _generate_env_file(self, channels: List[str]) -> str:
        """Gera conteúdo do arquivo de ambiente."""
        lines = [
            "# TSiJUKEBOX Health Check Configuration",
            "# Gerado automaticamente pelo instalador",
            "",
            f"ALERT_CHANNELS={','.join(channels)}",
            "",
            "# Telegram (preencha se usar alertas via Telegram)",
            "TELEGRAM_BOT_TOKEN=",
            "TELEGRAM_CHAT_ID=",
            "",
            "# Discord (preencha se usar alertas via Discord)",
            "DISCORD_WEBHOOK_URL=",
            "",
            "# Email (preencha se usar alertas via Email)",
            "RESEND_API_KEY=",
            "ALERT_EMAIL=admin@example.com",
            "",
            "# Supabase (para alertas via database)",
            f"SUPABASE_URL=https://ynkqczsmcnxvapljofel.supabase.co",
            "SUPABASE_ANON_KEY=",
        ]
        return '\n'.join(lines)
    
    def _configure_telegram(self):
        """Configura alertas via Telegram interativamente."""
        print(f"\n{Colors.YELLOW}━━━ CONFIGURAR TELEGRAM ━━━{Colors.RESET}\n")
        
        try:
            bot_token = input(f"{Colors.CYAN}Telegram Bot Token (do @BotFather): {Colors.RESET}").strip()
            chat_id = input(f"{Colors.CYAN}Chat ID (do @userinfobot): {Colors.RESET}").strip()
            
            if bot_token and chat_id:
                # Atualizar arquivo de ambiente
                env_content = self.ENV_PATH.read_text()
                env_content = env_content.replace("TELEGRAM_BOT_TOKEN=", f"TELEGRAM_BOT_TOKEN={bot_token}")
                env_content = env_content.replace("TELEGRAM_CHAT_ID=", f"TELEGRAM_CHAT_ID={chat_id}")
                self.ENV_PATH.write_text(env_content)
                log_success("Telegram configurado!")
            else:
                log_warning("Configuração do Telegram pulada")
        except (EOFError, KeyboardInterrupt):
            log_warning("Configuração do Telegram cancelada")
    
    def uninstall(self) -> bool:
        """Remove timer e service de health-check."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🗑️  REMOVENDO HEALTH CHECK TIMER{Colors.RESET}{Colors.CYAN}                           ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        # Parar e desabilitar timer
        log_step("Parando timer...")
        run_command(['systemctl', 'stop', 'tsijukebox-healthcheck.timer'], check=False)
        run_command(['systemctl', 'disable', 'tsijukebox-healthcheck.timer'], check=False)
        
        # Remover arquivos
        for path in [self.TIMER_PATH, self.SERVICE_PATH]:
            if path.exists():
                log_step(f"Removendo {path}...")
                if not DRY_RUN:
                    path.unlink()
        
        # Recarregar systemd
        run_command(['systemctl', 'daemon-reload'], check=False)
        
        log_success("Health check timer removido!")
        return True
    
    def status(self) -> Dict[str, Any]:
        """Retorna status do timer."""
        code, stdout, _ = run_command(
            ['systemctl', 'is-active', 'tsijukebox-healthcheck.timer'],
            capture=True, check=False
        )
        is_active = stdout.strip() == 'active'
        
        code, stdout, _ = run_command(
            ['systemctl', 'list-timers', '--no-pager', 'tsijukebox-healthcheck.timer'],
            capture=True, check=False
        )
        
        return {
            'installed': self.TIMER_PATH.exists(),
            'active': is_active,
            'env_configured': self.ENV_PATH.exists(),
            'timer_info': stdout if is_active else None,
        }


# =============================================================================
# HEALTH CHECK (--health-check) - Verificação rápida para monitoramento
# =============================================================================

class HealthCheck:
    """Verificação rápida de saúde para scripts de monitoramento.
    
    Retorna códigos de saída padronizados:
    - 0 = OK (sistema saudável)
    - 1 = WARNING (problemas não críticos)
    - 2 = CRITICAL (problemas graves)
    - 3 = UNKNOWN (erro na verificação)
    """
    
    EXIT_OK = 0
    EXIT_WARNING = 1
    EXIT_CRITICAL = 2
    EXIT_UNKNOWN = 3
    
    def __init__(self, verbose: bool = False, alert_on_failure: bool = False, alert_channels: List[str] = None):
        self.verbose = verbose
        self.alert_on_failure = alert_on_failure
        self.alert_channels = alert_channels or ['database']
        self.status = self.EXIT_OK
        self.messages: List[str] = []
        self.checks_results: List[Dict[str, Any]] = []
    
    def _log(self, message: str):
        """Adiciona mensagem ao log."""
        self.messages.append(message)
        if self.verbose:
            print(message)
    
    def check_service(self, name: str) -> bool:
        """Verifica se um serviço systemd está ativo."""
        try:
            code, stdout, _ = run_command(['systemctl', 'is-active', name], capture=True, check=False)
            return stdout.strip() == 'active'
        except Exception:
            return False
    
    def check_port(self, port: int) -> bool:
        """Verifica se uma porta está respondendo."""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result == 0
        except Exception:
            return False
    
    def check_disk(self, min_gb: float = 1.0) -> bool:
        """Verifica espaço mínimo em disco."""
        try:
            _, _, free = shutil.disk_usage("/")
            return (free / (1024**3)) >= min_gb
        except Exception:
            return False
    
    def check_process(self, name: str) -> bool:
        """Verifica se um processo está rodando."""
        try:
            code, _, _ = run_command(['pgrep', '-x', name], capture=True, check=False)
            return code == 0
        except Exception:
            return False
    
    def check_memory(self, max_percent: float = 90.0) -> bool:
        """Verifica se uso de memória está abaixo do limite."""
        try:
            with open('/proc/meminfo', 'r') as f:
                lines = f.readlines()
            mem_total = mem_available = 0
            for line in lines:
                if line.startswith('MemTotal:'):
                    mem_total = int(line.split()[1])
                elif line.startswith('MemAvailable:'):
                    mem_available = int(line.split()[1])
            if mem_total > 0:
                used_percent = ((mem_total - mem_available) / mem_total) * 100
                return used_percent < max_percent
            return True
        except Exception:
            return True
    
    def check_cpu_load(self, max_load: float = 5.0) -> bool:
        """Verifica se load average está abaixo do limite."""
        try:
            load1, _, _ = os.getloadavg()
            return load1 < max_load
        except Exception:
            return True
    
    def run(self) -> int:
        """Executa health check e retorna código de saída."""
        checks = [
            # (nome, função, required)
            ("tsijukebox.service", lambda: self.check_service('tsijukebox'), True),
            ("port-5173", lambda: self.check_port(5173), True),
            ("disk-space-1gb", lambda: self.check_disk(1.0), True),
            ("memory-usage", lambda: self.check_memory(90.0), True),
            ("cpu-load", lambda: self.check_cpu_load(5.0), False),
            ("grafana.service", lambda: self.check_service('grafana'), False),
            ("prometheus.service", lambda: self.check_service('prometheus'), False),
            ("nginx.service", lambda: self.check_service('nginx'), False),
        ]
        
        for name, check_fn, required in checks:
            try:
                ok = check_fn()
                status = 'ok' if ok else ('critical' if required else 'warning')
                self.checks_results.append({'name': name, 'ok': ok, 'required': required, 'status': status})
                
                if ok:
                    self._log(f"OK: {name}")
                else:
                    if required:
                        self.status = max(self.status, self.EXIT_CRITICAL)
                        self._log(f"CRITICAL: {name}")
                    else:
                        self.status = max(self.status, self.EXIT_WARNING)
                        self._log(f"WARNING: {name}")
            except Exception as e:
                self.status = max(self.status, self.EXIT_UNKNOWN)
                self._log(f"UNKNOWN: {name} ({e})")
                self.checks_results.append({'name': name, 'ok': False, 'required': required, 'status': 'unknown', 'error': str(e)})
        
        # Sempre imprimir se houver problemas
        if self.status != self.EXIT_OK and not self.verbose:
            for msg in self.messages:
                if not msg.startswith("OK:"):
                    print(msg)
        
        # Enviar alertas se configurado
        if self.alert_on_failure and self.status != self.EXIT_OK:
            self._send_alerts()
        
        return self.status
    
    def _send_alerts(self):
        """Envia alertas para os canais configurados."""
        failed_checks = [c for c in self.checks_results if not c['ok']]
        if not failed_checks:
            return
        
        severity = 'critical' if self.status == self.EXIT_CRITICAL else 'warning'
        title = f"TSiJUKEBOX Health Check {'CRÍTICO' if severity == 'critical' else 'Aviso'}"
        message = "Verificações com falha:\n" + "\n".join([f"- {c['name']} ({c['status']})" for c in failed_checks])
        
        for channel in self.alert_channels:
            self._send_alert_to_channel(channel, title, message, severity, failed_checks)
    
    def _send_alert_to_channel(self, channel: str, title: str, message: str, severity: str, metadata: Any):
        """Envia alerta para um canal específico."""
        import urllib.request
        import urllib.error
        
        if channel == 'telegram':
            self._send_telegram_alert(title, message, severity)
        elif channel == 'discord':
            self._send_discord_alert(title, message, severity)
        elif channel == 'database':
            self._send_database_alert(title, message, severity, metadata)
    
    def _send_telegram_alert(self, title: str, message: str, severity: str):
        """Envia alerta via Telegram."""
        import urllib.request
        import urllib.error
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        chat_id = os.environ.get('TELEGRAM_CHAT_ID')
        
        if not bot_token or not chat_id:
            if self.verbose:
                print("WARN: Telegram não configurado")
            return
        
        emoji = '🚨' if severity == 'critical' else '⚠️'
        text = f"{emoji} *{title}*\n\n{message}"
        
        try:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = json.dumps({
                'chat_id': chat_id,
                'text': text,
                'parse_mode': 'Markdown'
            }).encode('utf-8')
            
            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
            
            if self.verbose:
                print("OK: Alerta enviado via Telegram")
        except Exception as e:
            if self.verbose:
                print(f"WARN: Falha ao enviar alerta Telegram: {e}")
    
    def _send_discord_alert(self, title: str, message: str, severity: str):
        """Envia alerta via Discord webhook."""
        import urllib.request
        import urllib.error
        
        webhook_url = os.environ.get('DISCORD_WEBHOOK_URL')
        
        if not webhook_url:
            if self.verbose:
                print("WARN: Discord não configurado")
            return
        
        color = 0xe74c3c if severity == 'critical' else 0xf39c12
        
        try:
            data = json.dumps({
                'embeds': [{
                    'title': title,
                    'description': message,
                    'color': color
                }]
            }).encode('utf-8')
            
            req = urllib.request.Request(webhook_url, data=data, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
            
            if self.verbose:
                print("OK: Alerta enviado via Discord")
        except Exception as e:
            if self.verbose:
                print(f"WARN: Falha ao enviar alerta Discord: {e}")
    
    def _send_database_alert(self, title: str, message: str, severity: str, metadata: Any):
        """Registra alerta no banco de dados via edge function."""
        import urllib.request
        import urllib.error
        
        supabase_url = os.environ.get('SUPABASE_URL', 'https://ynkqczsmcnxvapljofel.supabase.co')
        
        try:
            url = f"{supabase_url}/functions/v1/alert-notifications"
            data = json.dumps({
                'type': 'health_check_failure',
                'channel': 'database',
                'title': title,
                'message': message,
                'severity': severity,
                'metadata': {'checks': metadata, 'hostname': socket.gethostname()}
            }).encode('utf-8')
            
            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
            
            if self.verbose:
                print("OK: Alerta registrado no banco")
        except Exception as e:
            if self.verbose:
                print(f"WARN: Falha ao registrar alerta no banco: {e}")


# =============================================================================
# PLUGIN SYSTEM (--plugin, --list-plugins)
# =============================================================================

class PluginBase:
    """Classe base abstrata para plugins do TSiJUKEBOX."""
    
    # Metadados obrigatórios
    name: str = "unnamed"
    version: str = "0.0.0"
    description: str = ""
    author: str = ""
    
    # Dependências
    required_packages: List[str] = []
    required_commands: List[str] = []
    
    def __init__(self, args: Optional[argparse.Namespace] = None):
        self.args = args
        self.enabled = True
    
    def install(self) -> bool:
        """Executa a instalação do plugin. Deve ser implementado."""
        raise NotImplementedError("Plugin deve implementar install()")
    
    def uninstall(self) -> bool:
        """Remove o plugin (opcional)."""
        return True
    
    def validate(self) -> bool:
        """Valida se o plugin está funcionando."""
        for cmd in self.required_commands:
            if not shutil.which(cmd):
                return False
        return True
    
    def get_info(self) -> Dict[str, Any]:
        """Retorna informações do plugin."""
        return {
            'name': self.name,
            'version': self.version,
            'description': self.description,
            'author': self.author,
            'required_packages': self.required_packages,
            'required_commands': self.required_commands,
        }


class PluginManager:
    """Gerencia descoberta e carregamento de plugins."""
    
    PLUGINS_DIR = Path(__file__).parent / "plugins"
    
    # Plugins built-in registrados manualmente
    BUILTIN_PLUGINS: Dict[str, type] = {}
    
    def __init__(self):
        self.plugins: Dict[str, type] = {}
        self._register_builtin_plugins()
        self._discover_plugins()
    
    def _register_builtin_plugins(self):
        """Registra plugins built-in."""
        
        # Plugin: spotify-downloader
        class SpotifyDownloaderPlugin(PluginBase):
            name = "spotify-downloader"
            version = "1.0.0"
            description = "Baixa músicas do Spotify usando spotdl"
            author = "B0.y_Z4kr14"
            required_packages = ['python-spotdl']
            required_commands = ['spotdl']
            
            def install(self) -> bool:
                log_step("Instalando spotify-downloader (spotdl)...")
                code, _, stderr = run_command(
                    ['pip', 'install', '--user', 'spotdl'],
                    check=False, capture=True
                )
                if code == 0:
                    log_success("spotify-downloader instalado!")
                    log_info("  Uso: spotdl <URL do Spotify>")
                    return True
                else:
                    log_error(f"Falha na instalação: {stderr}")
                    return False
        
        # Plugin: youtube-dl
        class YoutubeDLPlugin(PluginBase):
            name = "youtube-dl"
            version = "1.0.0"
            description = "Baixa músicas/vídeos do YouTube usando yt-dlp"
            author = "B0.y_Z4kr14"
            required_packages = ['yt-dlp']
            required_commands = ['yt-dlp']
            
            def install(self) -> bool:
                log_step("Instalando yt-dlp...")
                # Tentar via pacman primeiro
                code, _, _ = run_command(['pacman', '-S', '--noconfirm', 'yt-dlp'], check=False, capture=True)
                if code == 0:
                    log_success("yt-dlp instalado via pacman!")
                    return True
                # Fallback para pip
                code, _, _ = run_command(['pip', 'install', '--user', 'yt-dlp'], check=False, capture=True)
                if code == 0:
                    log_success("yt-dlp instalado via pip!")
                    return True
                log_error("Falha ao instalar yt-dlp")
                return False
        
        # Plugin: lyrics-fetcher
        class LyricsFetcherPlugin(PluginBase):
            name = "lyrics-fetcher"
            version = "1.0.0"
            description = "Busca letras de músicas automaticamente"
            author = "B0.y_Z4kr14"
            required_packages = ['syncedlyrics']
            required_commands = ['syncedlyrics']
            
            def install(self) -> bool:
                log_step("Instalando lyrics-fetcher (syncedlyrics)...")
                code, _, _ = run_command(
                    ['pip', 'install', '--user', 'syncedlyrics'],
                    check=False, capture=True
                )
                if code == 0:
                    log_success("syncedlyrics instalado!")
                    log_info("  Uso: syncedlyrics 'Artist - Song'")
                    return True
                log_error("Falha na instalação")
                return False
        
        # Plugin: youtube-music-dl (NOVO)
        class YouTubeMusicDLPlugin(PluginBase):
            name = "youtube-music-dl"
            version = "1.0.0"
            description = "Baixa músicas do YouTube Music integrado ao TSiJUKEBOX"
            author = "B0.y_Z4kr14"
            required_packages = ['yt-dlp', 'ffmpeg']
            required_commands = ['yt-dlp', 'ffmpeg']
            
            def install(self) -> bool:
                log_step("Instalando youtube-music-dl...")
                
                # 1. Instalar yt-dlp e ffmpeg
                code, _, _ = run_command(['pacman', '-S', '--noconfirm', 'yt-dlp', 'ffmpeg'], check=False, capture=True)
                if code != 0:
                    # Fallback pip
                    run_command(['pip', 'install', '--user', 'yt-dlp'], check=False, capture=True)
                
                # 2. Criar script wrapper /usr/local/bin/ytm-dl
                log_step("Criando wrapper ytm-dl...")
                script_content = '''#!/bin/bash
# youtube-music-dl wrapper para TSiJUKEBOX
# Baixa músicas do YouTube Music com metadados

MUSIC_DIR="${TSIJUKEBOX_MUSIC_DIR:-$HOME/Musics}"
COOKIES_FROM="${COOKIES_FROM:-firefox}"

usage() {
    echo "Uso: ytm-dl [OPTIONS] <URL>"
    echo ""
    echo "Opções:"
    echo "  -d, --dir DIR      Diretório de saída (padrão: $MUSIC_DIR)"
    echo "  -p, --playlist     Baixar playlist inteira"
    echo "  -q, --quality Q    Qualidade de áudio (0-9, 0=melhor)"
    echo "  -h, --help         Mostrar esta ajuda"
    exit 0
}

QUALITY=0
PLAYLIST_OPTS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dir) MUSIC_DIR="$2"; shift 2 ;;
        -p|--playlist) PLAYLIST_OPTS="--yes-playlist"; shift ;;
        -q|--quality) QUALITY="$2"; shift 2 ;;
        -h|--help) usage ;;
        *) break ;;
    esac
done

if [ -z "$1" ]; then
    usage
fi

mkdir -p "$MUSIC_DIR"

yt-dlp --extract-audio --audio-format mp3 --audio-quality "$QUALITY" \\
       --output "$MUSIC_DIR/%(artist)s/%(album)s/%(title)s.%(ext)s" \\
       --embed-thumbnail --add-metadata \\
       --cookies-from-browser "$COOKIES_FROM" \\
       --sponsorblock-remove all \\
       --parse-metadata "%(uploader)s:%(artist)s" \\
       $PLAYLIST_OPTS \\
       "$@"

echo ""
echo "✅ Download concluído! Arquivos em: $MUSIC_DIR"
'''
                wrapper_path = Path('/usr/local/bin/ytm-dl')
                if not DRY_RUN:
                    wrapper_path.write_text(script_content)
                    wrapper_path.chmod(0o755)
                
                log_success("youtube-music-dl instalado!")
                log_info("  Uso: ytm-dl <URL do YouTube Music>")
                log_info("       ytm-dl --playlist <URL da Playlist>")
                log_info("       ytm-dl --dir ~/MinhasMusicas <URL>")
                return True
        
        # Plugin: discord-integration (NOVO)
        class DiscordIntegrationPlugin(PluginBase):
            name = "discord-integration"
            version = "1.0.0"
            description = "Notificações de reprodução e controle remoto via Discord"
            author = "B0.y_Z4kr14"
            required_packages = ['pypresence']
            required_commands = []
            
            def install(self) -> bool:
                log_step("Instalando discord-integration...")
                
                # 1. Instalar pypresence para Rich Presence
                code, _, _ = run_command(['pip', 'install', '--user', 'pypresence'], check=False, capture=True)
                
                # 2. Configurar webhook
                print(f"\n{Colors.YELLOW}━━━ CONFIGURAR DISCORD ━━━{Colors.RESET}\n")
                
                try:
                    webhook_url = input(f"{Colors.CYAN}Discord Webhook URL (Enter para pular): {Colors.RESET}").strip()
                    
                    if webhook_url:
                        env_file = CONFIG_DIR / 'discord.env'
                        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
                        env_content = f"""# Discord Integration Configuration
DISCORD_WEBHOOK_URL={webhook_url}
DISCORD_RICH_PRESENCE=true
DISCORD_NOTIFY_ON_PLAY=true
"""
                        if not DRY_RUN:
                            env_file.write_text(env_content)
                        log_success(f"Configuração salva em: {env_file}")
                except (EOFError, KeyboardInterrupt):
                    log_warning("Configuração pulada")
                
                # 3. Criar script de Rich Presence
                log_step("Criando serviço de Rich Presence...")
                
                rpc_script = '''#!/usr/bin/env python3
"""Discord Rich Presence para TSiJUKEBOX"""
import os
import time
import subprocess
from pypresence import Presence
from datetime import datetime

CLIENT_ID = "1234567890"  # Placeholder - usar ID real

def get_spotify_status():
    """Obtém status atual do Spotify via sp-status."""
    try:
        result = subprocess.run(['sp-status'], capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    return None

def main():
    try:
        RPC = Presence(CLIENT_ID)
        RPC.connect()
        print("Discord Rich Presence conectado!")
        
        while True:
            status = get_spotify_status()
            if status and " - " in status:
                artist, song = status.split(" - ", 1)
                RPC.update(
                    details=song[:128],
                    state=f"por {artist}"[:128],
                    large_image="tsijukebox",
                    large_text="TSiJUKEBOX",
                    start=int(datetime.now().timestamp())
                )
            time.sleep(15)
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    main()
'''
                rpc_path = INSTALL_DIR / 'scripts' / 'discord_rpc.py'
                if not DRY_RUN:
                    rpc_path.parent.mkdir(parents=True, exist_ok=True)
                    rpc_path.write_text(rpc_script)
                    rpc_path.chmod(0o755)
                
                log_success("discord-integration instalado!")
                log_info("  Configuração: /etc/tsijukebox/discord.env")
                log_info("  Rich Presence: scripts/discord_rpc.py")
                return True
        
        # Registrar plugins
        self.BUILTIN_PLUGINS = {
            'spotify-downloader': SpotifyDownloaderPlugin,
            'youtube-dl': YoutubeDLPlugin,
            'lyrics-fetcher': LyricsFetcherPlugin,
            'youtube-music-dl': YouTubeMusicDLPlugin,
            'discord-integration': DiscordIntegrationPlugin,
        }
        self.plugins.update(self.BUILTIN_PLUGINS)
    
    def _discover_plugins(self):
        """Descobre plugins no diretório de plugins."""
        if not self.PLUGINS_DIR.exists():
            return
        
        import importlib.util
        
        for plugin_dir in self.PLUGINS_DIR.iterdir():
            if plugin_dir.is_dir() and (plugin_dir / "plugin.py").exists():
                try:
                    spec = importlib.util.spec_from_file_location(
                        f"plugins.{plugin_dir.name}",
                        plugin_dir / "plugin.py"
                    )
                    if spec and spec.loader:
                        module = importlib.util.module_from_spec(spec)
                        spec.loader.exec_module(module)
                        
                        if hasattr(module, 'Plugin'):
                            self.plugins[plugin_dir.name] = module.Plugin
                except Exception as e:
                    log_warning(f"Falha ao carregar plugin {plugin_dir.name}: {e}")
    
    def list_plugins(self):
        """Lista plugins disponíveis."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🔌 PLUGINS DISPONÍVEIS{Colors.RESET}{Colors.CYAN}                                       ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        if not self.plugins:
            log_warning("Nenhum plugin encontrado")
            return
        
        for name, plugin_class in sorted(self.plugins.items()):
            try:
                p = plugin_class(None)
                installed = p.validate()
                status = f"{Colors.GREEN}[instalado]{Colors.RESET}" if installed else f"{Colors.YELLOW}[disponível]{Colors.RESET}"
                print(f"  {Colors.GREEN}•{Colors.RESET} {p.name} v{p.version} {status}")
                print(f"    {Colors.WHITE}{p.description}{Colors.RESET}")
                if p.required_commands:
                    print(f"    {Colors.CYAN}Comandos: {', '.join(p.required_commands)}{Colors.RESET}")
                print()
            except Exception as e:
                print(f"  {Colors.RED}•{Colors.RESET} {name} (erro: {e})")
        
        print(f"{Colors.CYAN}Para instalar: sudo python3 install.py --plugin <nome>{Colors.RESET}\n")
    
    def run_plugin(self, name: str, args: Optional[argparse.Namespace] = None) -> bool:
        """Executa um plugin específico."""
        if name not in self.plugins:
            log_error(f"Plugin não encontrado: {name}")
            log_info(f"Use --list-plugins para ver plugins disponíveis")
            return False
        
        plugin_class = self.plugins[name]
        plugin = plugin_class(args)
        
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🔌 EXECUTANDO PLUGIN{Colors.RESET}{Colors.CYAN}                                         ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        log_info(f"Plugin: {plugin.name} v{plugin.version}")
        log_info(f"Descrição: {plugin.description}")
        print()
        
        try:
            success = plugin.install()
            if success:
                log_success(f"Plugin {plugin.name} executado com sucesso!")
            else:
                log_error(f"Plugin {plugin.name} falhou")
            return success
        except Exception as e:
            log_error(f"Erro ao executar plugin: {e}")
            return False


# =============================================================================
# CONFIG MIGRATOR (--migrate)
# =============================================================================

class ConfigMigrator:
    """Migra configurações entre versões do TSiJUKEBOX."""
    
    # Mapeamento de migrações por versão
    MIGRATIONS = {
        '3.0.0': '_migrate_v3_to_v4',
        '4.0.0': '_migrate_v4_to_v41',
        '4.1.0': None,  # Versão atual
    }
    
    VERSION_ORDER = ['3.0.0', '4.0.0', '4.1.0']
    
    def __init__(self, from_version: Optional[str] = None, to_version: str = VERSION):
        self.from_version = from_version
        self.to_version = to_version
        self.changes_made: List[str] = []
    
    def detect_version(self) -> str:
        """Detecta versão atual da instalação."""
        # 1. Verificar arquivo de versão
        version_file = CONFIG_DIR / 'version'
        if version_file.exists():
            return version_file.read_text().strip()
        
        # 2. Verificar formato do config.yaml
        config_yaml = CONFIG_DIR / 'config.yaml'
        if config_yaml.exists():
            content = config_yaml.read_text()
            # v4+ tem seção 'integrations'
            if 'integrations:' in content:
                return '4.0.0'
            # v3 tinha 'spotify_enabled'
            if 'spotify_enabled:' in content:
                return '3.0.0'
        
        # 3. Verificar estrutura de diretórios
        if (INSTALL_DIR / 'scripts').exists():
            return '4.0.0'
        
        return 'unknown'
    
    def _version_index(self, version: str) -> int:
        """Retorna índice da versão na ordem."""
        try:
            return self.VERSION_ORDER.index(version)
        except ValueError:
            return -1
    
    def _should_apply(self, migration_version: str, current: str, target: str) -> bool:
        """Verifica se uma migração deve ser aplicada."""
        mig_idx = self._version_index(migration_version)
        cur_idx = self._version_index(current)
        tgt_idx = self._version_index(target)
        
        # Aplicar se migração está entre current e target
        return cur_idx < mig_idx <= tgt_idx
    
    def migrate(self, dry_run: bool = False) -> bool:
        """Executa migração entre versões."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🔄 MIGRAÇÃO DE CONFIGURAÇÕES{Colors.RESET}{Colors.CYAN}                               ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        # Detectar versão atual
        current = self.from_version or self.detect_version()
        log_info(f"Versão detectada: {current}")
        log_info(f"Versão alvo: {self.to_version}")
        
        if current == 'unknown':
            log_error("Não foi possível detectar a versão atual")
            log_info("Use --migrate <versão> para especificar manualmente")
            return False
        
        if current == self.to_version:
            log_success("Sistema já está na versão mais recente!")
            return True
        
        # Backup automático
        if not dry_run:
            log_step("Criando backup antes da migração...")
            backup = ConfigBackup()
            backup_path = backup.create_backup(f"pre-migrate-{current}")
            if backup_path:
                log_success(f"Backup criado: {backup_path}")
            else:
                log_warning("Falha ao criar backup, continuando...")
        
        # Aplicar migrações em sequência
        log_step("Aplicando migrações...")
        
        for version, migration_fn_name in self.MIGRATIONS.items():
            if self._should_apply(version, current, self.to_version):
                if migration_fn_name:
                    log_info(f"  Aplicando migração para {version}...")
                    migration_fn = getattr(self, migration_fn_name, None)
                    if migration_fn:
                        success = migration_fn(dry_run)
                        if not success:
                            log_error(f"Migração para {version} falhou")
                            return False
                        self.changes_made.append(f"Migração {version}")
                else:
                    log_info(f"  Versão {version} não requer migração")
        
        # Atualizar arquivo de versão
        if not dry_run:
            (CONFIG_DIR / 'version').write_text(self.to_version)
        
        # Resumo
        print(f"\n{Colors.GREEN}━━━ MIGRAÇÃO CONCLUÍDA ━━━{Colors.RESET}\n")
        
        if self.changes_made:
            log_success(f"Alterações aplicadas:")
            for change in self.changes_made:
                log_info(f"  • {change}")
        else:
            log_info("Nenhuma alteração necessária")
        
        log_success(f"Sistema atualizado para v{self.to_version}")
        return True
    
    def _migrate_v3_to_v4(self, dry_run: bool = False) -> bool:
        """Migra de v3.x para v4.0."""
        config_yaml = CONFIG_DIR / 'config.yaml'
        
        if not config_yaml.exists():
            log_warning("config.yaml não encontrado, pulando migração de config")
            return True
        
        log_step("Migrando config.yaml de v3 para v4...")
        
        content = config_yaml.read_text()
        
        # Transformações
        transformations = [
            # Renomear campos
            ('spotify_enabled: true', 'integrations:\n  spotify:\n    enabled: true'),
            ('spotify_enabled: false', 'integrations:\n  spotify:\n    enabled: false'),
            ('db_type:', 'database:\n  type:'),
            # Adicionar novas seções
        ]
        
        for old, new in transformations:
            if old in content:
                content = content.replace(old, new)
                self.changes_made.append(f"Transformado: {old[:30]}...")
        
        if not dry_run:
            config_yaml.write_text(content)
        
        return True
    
    def _migrate_v4_to_v41(self, dry_run: bool = False) -> bool:
        """Migra de v4.0 para v4.1."""
        log_step("Migrando para v4.1...")
        
        # v4.1 adiciona suporte a plugins e health-check
        config_yaml = CONFIG_DIR / 'config.yaml'
        
        if config_yaml.exists():
            content = config_yaml.read_text()
            
            # Adicionar seção de plugins se não existir
            if 'plugins:' not in content:
                content += '''

# Plugins habilitados
plugins:
  enabled: true
  auto_update: false
'''
                self.changes_made.append("Adicionada seção 'plugins'")
            
            # Adicionar seção de monitoring
            if 'health_check:' not in content:
                content += '''

# Health Check
health_check:
  enabled: true
  interval_minutes: 5
  alert_channels:
    - database
'''
                self.changes_made.append("Adicionada seção 'health_check'")
            
            if not dry_run:
                config_yaml.write_text(content)
        
        return True


# =============================================================================
# DOCTOR DIAGNOSTIC (--doctor, --doctor-fix)
# =============================================================================

class DoctorDiagnostic:
    """Diagnostica problemas e sugere/aplica correções."""
    
    def __init__(self, auto_fix: bool = False):
        self.auto_fix = auto_fix
        self.issues: List[Dict[str, Any]] = []
    
    def add_issue(self, name: str, severity: str, description: str, fix_cmd: Optional[List[str]] = None):
        """Registra um problema encontrado."""
        self.issues.append({
            'name': name,
            'severity': severity,  # 'critical', 'warning', 'info'
            'description': description,
            'fix_cmd': fix_cmd,
        })
    
    def check_services(self):
        """Verifica serviços systemd."""
        services = [
            ('tsijukebox', True, ['systemctl', 'restart', 'tsijukebox']),
            ('grafana', False, ['systemctl', 'restart', 'grafana']),
            ('prometheus', False, ['systemctl', 'restart', 'prometheus']),
        ]
        
        for service, required, fix_cmd in services:
            code, stdout, _ = run_command(['systemctl', 'is-active', service], capture=True, check=False)
            if stdout.strip() != 'active':
                severity = 'critical' if required else 'warning'
                self.add_issue(
                    f"Serviço {service} inativo",
                    severity,
                    f"O serviço {service} não está rodando",
                    fix_cmd
                )
    
    def check_permissions(self):
        """Verifica permissões de diretórios."""
        dirs = [
            (CONFIG_DIR, 0o755),
            (LOG_DIR, 0o755),
            (DATA_DIR, 0o755),
            (INSTALL_DIR, 0o755),
        ]
        
        for dir_path, expected_mode in dirs:
            if dir_path.exists():
                stat = dir_path.stat()
                mode = stat.st_mode & 0o777
                if mode != expected_mode:
                    self.add_issue(
                        f"Permissões incorretas em {dir_path}",
                        'warning',
                        f"Esperado {oct(expected_mode)}, encontrado {oct(mode)}",
                        ['chmod', oct(expected_mode)[2:], str(dir_path)]
                    )
            else:
                self.add_issue(
                    f"Diretório não existe: {dir_path}",
                    'critical',
                    f"O diretório {dir_path} não foi criado",
                    ['mkdir', '-p', str(dir_path)]
                )
    
    def check_configs(self):
        """Verifica arquivos de configuração."""
        required_configs = [
            CONFIG_DIR / 'config.yaml',
        ]
        
        for config_path in required_configs:
            if not config_path.exists():
                self.add_issue(
                    f"Config ausente: {config_path.name}",
                    'warning',
                    f"Arquivo de configuração {config_path} não encontrado",
                    None  # Sem fix automático
                )
    
    def check_disk_space(self):
        """Verifica espaço em disco."""
        total, used, free = shutil.disk_usage("/")
        free_gb = free / (1024**3)
        
        if free_gb < 1:
            self.add_issue(
                "Pouco espaço em disco",
                'critical',
                f"Apenas {free_gb:.1f} GB disponíveis",
                None
            )
        elif free_gb < 5:
            self.add_issue(
                "Espaço em disco baixo",
                'warning',
                f"{free_gb:.1f} GB disponíveis (recomendado: > 5GB)",
                None
            )
    
    def check_database(self):
        """Verifica integridade do banco de dados."""
        db_path = DATA_DIR / 'tsijukebox.db'
        if db_path.exists():
            if shutil.which('sqlite3'):
                code, stdout, stderr = run_command(
                    ['sqlite3', str(db_path), 'PRAGMA integrity_check;'],
                    capture=True, check=False
                )
                if code != 0 or 'ok' not in stdout.lower():
                    self.add_issue(
                        "Banco de dados pode estar corrompido",
                        'critical',
                        f"Integrity check falhou: {stderr or stdout}",
                        None
                    )
        else:
            self.add_issue(
                "Banco de dados não encontrado",
                'info',
                f"Arquivo {db_path} não existe (será criado na primeira execução)",
                None
            )
    
    def check_network_ports(self):
        """Verifica se portas estão disponíveis."""
        ports = [
            (5173, 'TSiJUKEBOX Web', True),
            (3000, 'Grafana', False),
            (9090, 'Prometheus', False),
        ]
        
        for port, name, required in ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(2)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result != 0 and required:
                    self.add_issue(
                        f"Porta {port} ({name}) não responde",
                        'warning',
                        f"Serviço pode não estar rodando corretamente",
                        None
                    )
            except Exception:
                pass
    
    def _collect_system_info(self) -> Dict[str, Any]:
        """Coleta informações do sistema para relatório."""
        import platform
        from datetime import datetime
        uptime_str = "N/A"
        try:
            with open('/proc/uptime', 'r') as f:
                uptime_seconds = float(f.readline().split()[0])
                days, remainder = divmod(int(uptime_seconds), 86400)
                hours, remainder = divmod(remainder, 3600)
                minutes, seconds = divmod(remainder, 60)
                uptime_str = f"{days}d {hours}h {minutes}m {seconds}s"
        except Exception:
            pass
        total, used, free = shutil.disk_usage("/")
        return {
            "timestamp": datetime.now().isoformat(),
            "hostname": socket.gethostname(),
            "platform": platform.system(),
            "release": platform.release(),
            "python_version": sys.version,
            "installer_version": VERSION,
            "disk": {"total_gb": round(total / (1024**3), 2), "used_gb": round(used / (1024**3), 2), "free_gb": round(free / (1024**3), 2), "percent_used": round((used / total) * 100, 1)},
            "uptime": uptime_str,
        }
    
    def export_json(self, output_path: str) -> bool:
        """Exporta relatório do diagnóstico em JSON."""
        from datetime import datetime
        report = {"version": VERSION, "generated_at": datetime.now().isoformat(), "hostname": socket.gethostname(), "issues": self.issues, "summary": {"total": len(self.issues), "critical": len([i for i in self.issues if i['severity'] == 'critical']), "warning": len([i for i in self.issues if i['severity'] == 'warning']), "info": len([i for i in self.issues if i['severity'] == 'info']), "healthy": len(self.issues) == 0}, "system_info": self._collect_system_info()}
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            log_success(f"Relatório JSON exportado: {output_path}")
            return True
        except Exception as e:
            log_error(f"Erro ao exportar JSON: {e}")
            return False
    
    def export_html(self, output_path: str) -> bool:
        """Exporta relatório do diagnóstico em HTML."""
        from datetime import datetime
        system_info = self._collect_system_info()
        critical = len([i for i in self.issues if i['severity'] == 'critical'])
        warnings = len([i for i in self.issues if i['severity'] == 'warning'])
        infos = len([i for i in self.issues if i['severity'] == 'info'])
        issues_html = '<div class="no-issues">✅ Nenhum problema encontrado!</div>' if not self.issues else ''.join([f'<div class="issue {i["severity"]}"><strong>{i["name"]}</strong><p>{i["description"]}</p></div>' for i in self.issues])
        html = f'''<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TSiJUKEBOX Doctor Report</title><style>body{{font-family:system-ui;max-width:900px;margin:0 auto;padding:2rem;background:#0f172a;color:#f1f5f9}}.header{{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:2rem;border-radius:12px;text-align:center;margin-bottom:2rem}}.summary{{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}}.stat{{background:#1e293b;padding:1.5rem;border-radius:8px;text-align:center}}.stat.critical{{border:1px solid #dc2626}}.stat.warning{{border:1px solid #f59e0b}}.stat.info{{border:1px solid #3b82f6}}.stat.ok{{border:1px solid #22c55e}}.issue{{margin:1rem 0;padding:1rem;border-radius:8px;border-left:4px solid}}.issue.critical{{background:#450a0a;border-color:#dc2626}}.issue.warning{{background:#451a03;border-color:#f59e0b}}.issue.info{{background:#172554;border-color:#3b82f6}}.no-issues{{text-align:center;color:#22c55e;padding:2rem}}</style></head><body><div class="header"><h1>🩺 TSiJUKEBOX Doctor Report</h1><p>Gerado em: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")} | Host: {system_info["hostname"]}</p></div><div class="summary"><div class="stat critical"><strong style="color:#dc2626;font-size:2rem">{critical}</strong><br>Críticos</div><div class="stat warning"><strong style="color:#f59e0b;font-size:2rem">{warnings}</strong><br>Avisos</div><div class="stat info"><strong style="color:#3b82f6;font-size:2rem">{infos}</strong><br>Info</div><div class="stat ok"><strong style="color:#22c55e;font-size:2rem">{"✓" if not self.issues else "—"}</strong><br>Status</div></div><h2>📋 Problemas</h2>{issues_html}<h2>💻 Sistema</h2><p>Disco: {system_info["disk"]["free_gb"]}GB livre | Uptime: {system_info["uptime"]} | Python: {sys.version.split()[0]}</p></body></html>'''
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html)
            log_success(f"Relatório HTML exportado: {output_path}")
            return True
        except Exception as e:
            log_error(f"Erro ao exportar HTML: {e}")
            return False
    
    def run_all_checks(self) -> bool:
        """Executa todas as verificações."""
        print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {Colors.BOLD}{Colors.WHITE}🩺 TSiJUKEBOX DOCTOR{Colors.RESET}{Colors.CYAN}                                          ║
║   Diagnosticando problemas comuns...                            ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
        
        log_step("Verificando serviços...")
        self.check_services()
        
        log_step("Verificando permissões...")
        self.check_permissions()
        
        log_step("Verificando configurações...")
        self.check_configs()
        
        log_step("Verificando espaço em disco...")
        self.check_disk_space()
        
        log_step("Verificando banco de dados...")
        self.check_database()
        
        log_step("Verificando portas de rede...")
        self.check_network_ports()
        
        # Exibir resultados
        self._print_results()
        
        # Aplicar correções se auto_fix
        if self.auto_fix and self.issues:
            self._apply_fixes()
        
        return len([i for i in self.issues if i['severity'] == 'critical']) == 0
    
    def _print_results(self):
        """Exibe resultados do diagnóstico."""
        if not self.issues:
            print(f"\n{Colors.GREEN}✅ Nenhum problema encontrado! Sistema saudável.{Colors.RESET}\n")
            return
        
        print(f"\n{Colors.YELLOW}━━━ PROBLEMAS ENCONTRADOS ({len(self.issues)}) ━━━{Colors.RESET}\n")
        
        for issue in self.issues:
            if issue['severity'] == 'critical':
                icon = f"{Colors.RED}🔴{Colors.RESET}"
            elif issue['severity'] == 'warning':
                icon = f"{Colors.YELLOW}🟡{Colors.RESET}"
            else:
                icon = f"{Colors.BLUE}🔵{Colors.RESET}"
            
            print(f"  {icon} {issue['name']}")
            print(f"     {Colors.WHITE}{issue['description']}{Colors.RESET}")
            if issue['fix_cmd']:
                cmd_str = ' '.join(issue['fix_cmd'])
                print(f"     {Colors.GREEN}Fix: sudo {cmd_str}{Colors.RESET}")
            print()
        
        # Sugerir --doctor-fix se houver correções disponíveis
        fixable = [i for i in self.issues if i['fix_cmd']]
        if fixable and not self.auto_fix:
            print(f"{Colors.CYAN}💡 {len(fixable)} problemas podem ser corrigidos automaticamente:{Colors.RESET}")
            print(f"   sudo python3 install.py --doctor-fix\n")
    
    def _apply_fixes(self):
        """Aplica correções automáticas."""
        print(f"\n{Colors.CYAN}━━━ APLICANDO CORREÇÕES AUTOMÁTICAS ━━━{Colors.RESET}\n")
        
        fixed = 0
        for issue in self.issues:
            if issue['fix_cmd']:
                log_step(f"Corrigindo: {issue['name']}")
                code, _, _ = run_command(issue['fix_cmd'], check=False)
                if code == 0:
                    log_success(f"  Corrigido!")
                    fixed += 1
                else:
                    log_error(f"  Falha ao corrigir")
        
        if fixed > 0:
            print(f"\n{Colors.GREEN}✅ {fixed} correções aplicadas com sucesso!{Colors.RESET}")
            print(f"{Colors.YELLOW}   Recomendado: execute --doctor novamente para verificar{Colors.RESET}\n")


# =============================================================================
# CARREGAMENTO DE CONFIGURAÇÃO JSON (COM HERANÇA)
# =============================================================================

def deep_merge(base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
    """Mescla recursivamente dois dicionários. Override sobrescreve base."""
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def load_config_files(config_paths: List[str]) -> Dict[str, Any]:
    """Carrega e mescla múltiplos arquivos de configuração com herança."""
    merged_config: Dict[str, Any] = {}
    
    log_info("📄 Carregando configurações com herança:")
    
    for config_path in config_paths:
        path = Path(config_path)
        
        if not path.exists():
            log_error(f"Arquivo de configuração não encontrado: {config_path}")
            sys.exit(1)
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            # Deep merge: override sobrescreve base
            merged_config = deep_merge(merged_config, config)
            log_info(f"  ✓ {config_path}")
        except json.JSONDecodeError as e:
            log_error(f"JSON inválido em {config_path}: {e}")
            sys.exit(1)
        except Exception as e:
            log_error(f"Erro ao ler {config_path}: {e}")
            sys.exit(1)
    
    return merged_config


def load_config_file(config_path: str) -> Dict[str, Any]:
    """Carrega configuração de um único arquivo JSON (compatibilidade)."""
    return load_config_files([config_path])


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
    """Log colorido no terminal. Respeita QUIET_MODE."""
    global QUIET_MODE
    if not QUIET_MODE:
        print(f"{color}{prefix}{message}{Colors.RESET}")


def log_success(message: str):
    log(message, Colors.GREEN, "✅ ")


def log_error(message: str):
    """Erros sempre são exibidos, mesmo em modo quiet."""
    print(f"{Colors.RED}❌ {message}{Colors.RESET}", file=sys.stderr)


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
    
    import sqlite3
    
    # Criar diretório de dados
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    
    db_path = DATA_DIR / "tsijukebox.db"
    
    try:
        # Criar banco com schema inicial
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS playback_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                track_id TEXT NOT NULL,
                track_name TEXT NOT NULL,
                artist_name TEXT NOT NULL,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', ('version', VERSION))
        
        conn.commit()
        conn.close()
        
        # Corrigir ownership
        user = os.environ.get('SUDO_USER', 'root')
        run_command(['chown', '-R', f'{user}:{user}', str(DATA_DIR)])
        
    except Exception as e:
        log_warning(f"Falha ao criar banco: {e}")
    
    # Criar config.yaml
    create_config_yaml()
    
    log_success(f"SQLite configurado: {db_path}")
    return True


def create_config_yaml() -> bool:
    """Cria arquivo config.yaml."""
    config_content = f"""version: "{VERSION}"
server:
  port: 5173
  host: "0.0.0.0"
database:
  type: sqlite
  path: {DATA_DIR / 'tsijukebox.db'}
spotify:
  enabled: true
monitoring:
  enabled: true
"""
    config_file = CONFIG_DIR / 'config.yaml'
    config_file.write_text(config_content)
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
        
        # Iniciar Spotify brevemente para garantir criação do prefs (tempo maior)
        log_info("Iniciando Spotify para criar arquivo de configuração...")
        try:
            proc = subprocess.Popen(
                ['sudo', '-u', user, 'spotify', '--no-zygote'],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True
            )
            import time
            time.sleep(10)  # Aumentado de 5 para 10 segundos
            subprocess.run(['pkill', '-f', 'spotify'], capture_output=True)
            time.sleep(2)
            
            # Criar prefs manualmente se não existir
            home = Path(pwd.getpwnam(user).pw_dir)
            prefs_dir = home / ".config/spotify"
            prefs_path = prefs_dir / "prefs"
            if not prefs_path.exists():
                prefs_dir.mkdir(parents=True, exist_ok=True)
                prefs_path.touch()
                run_command(['chown', '-R', f'{user}:{user}', str(prefs_dir)])
                log_info("Arquivo prefs criado manualmente")
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

def clone_and_setup_repository(user: str) -> bool:
    """Clona repositório TSiJUKEBOX e instala dependências npm."""
    log_step("Clonando repositório TSiJUKEBOX...")
    
    if INSTALL_DIR.exists():
        # Verificar se é um repositório git válido
        if (INSTALL_DIR / '.git').exists():
            log_info("Repositório já existe, atualizando...")
            result = subprocess.run(
                ['git', 'pull'],
                cwd=str(INSTALL_DIR),
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                log_warning(f"Falha ao atualizar: {result.stderr}")
        else:
            log_warning(f"{INSTALL_DIR} existe mas não é repositório git")
            shutil.rmtree(INSTALL_DIR)
    
    if not INSTALL_DIR.exists():
        INSTALL_DIR.parent.mkdir(parents=True, exist_ok=True)
        code, _, err = run_command([
            'git', 'clone', '--depth', '1', REPO_URL, str(INSTALL_DIR)
        ])
        if code != 0:
            log_error(f"Falha ao clonar repositório: {err}")
            return False
        log_success(f"Repositório clonado em {INSTALL_DIR}")
    
    # Corrigir ownership antes de npm install
    run_command(['chown', '-R', f'{user}:{user}', str(INSTALL_DIR)])
    
    # Instalar dependências npm
    log_step("Instalando dependências npm...")
    package_json = INSTALL_DIR / 'package.json'
    if not package_json.exists():
        log_error("package.json não encontrado no repositório")
        return False
    
    result = subprocess.run(
        ['sudo', '-u', user, 'npm', 'install'],
        cwd=str(INSTALL_DIR),
        capture_output=True,
        text=True,
        timeout=600
    )
    
    if result.returncode == 0:
        log_success("Dependências npm instaladas")
    else:
        log_warning(f"npm install pode ter falhado: {result.stderr[:200]}")
    
    return True


def create_systemd_services(user: str) -> bool:
    """Cria serviços systemd para TSiJUKEBOX."""
    log_step("Criando serviços systemd")
    
    # Serviço principal do TSiJUKEBOX
    service_content = f"""[Unit]
Description=TSiJUKEBOX Enterprise Music System
After=network.target
Wants=network.target

[Service]
Type=simple
User={user}
WorkingDirectory={INSTALL_DIR}
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5173

# Hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true
ReadWritePaths={DATA_DIR} {LOG_DIR}

[Install]
WantedBy=multi-user.target
"""
    
    service_path = Path('/etc/systemd/system/tsijukebox.service')
    service_path.write_text(service_content)
    
    # Recarregar e habilitar
    run_command(['systemctl', 'daemon-reload'])
    run_command(['systemctl', 'enable', 'tsijukebox.service'], check=False)
    
    # Iniciar serviço se repositório e npm estão prontos
    node_modules = INSTALL_DIR / 'node_modules'
    if node_modules.exists():
        log_step("Iniciando serviço TSiJUKEBOX...")
        run_command(['systemctl', 'start', 'tsijukebox.service'], check=False)
        
        # Verificar se iniciou
        import time
        time.sleep(3)
        code, stdout, _ = run_command(['systemctl', 'is-active', 'tsijukebox.service'], capture=True, check=False)
        if stdout.strip() == 'active':
            log_success("Serviço TSiJUKEBOX ativo!")
        else:
            log_warning("Serviço não iniciou. Verifique: journalctl -u tsijukebox -f")
    else:
        log_warning("node_modules não encontrado - serviço não iniciado")
        log_info("Execute: cd /opt/tsijukebox && npm install && systemctl start tsijukebox")
    
    log_success("Serviço systemd criado e habilitado")
    return True


# =============================================================================
# INSTALAÇÃO PRINCIPAL
# =============================================================================

def run_installation(args: argparse.Namespace) -> bool:
    """Executa a instalação completa com rollback automático em caso de falha."""
    
    # Inicializar gerenciador de rollback
    rollback = RollbackManager()
    
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
    
    try:
        # ========================================================================
        # ETAPA 0: DETECÇÃO DO SISTEMA
        # ========================================================================
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
        home_dir = Path(pwd.getpwnam(user).pw_dir)
        
        # Checkpoint inicial (estado limpo, nada a reverter)
        rollback.create_checkpoint("pre_install", {"user": user, "started": True}, [])
        
        # ========================================================================
        # ETAPA 1: INSTALAÇÃO DE PACOTES BASE
        # ========================================================================
        if getattr(args, 'skip_packages', False):
            log_warning("⏭️  Pulando instalação de pacotes (--skip-packages)")
        else:
            try:
                # 1.1 Instalar paru se necessário
                if not system_info.has_paru:
                    log_step("Instalando paru (AUR helper)...")
                    if not install_paru():
                        raise InstallationError("Falha ao instalar paru", stage="paru")
                    
                    rollback.create_checkpoint("paru_installed", 
                        {"installed": True},
                        ["rm -rf /tmp/paru || true"]
                    )
                
                # 1.2 Atualizar sistema
                log_step("Atualizando sistema com paru -Sy...")
                run_command(['paru', '-Sy', '--noconfirm'], capture=True, check=False)
                
                # 1.3 Instalar pacotes base
                log_step("Instalando pacotes base...")
                install_packages(BASE_PACKAGES, system_info=system_info)
                
                rollback.create_checkpoint("base_packages_installed",
                    {"packages": BASE_PACKAGES},
                    [f"pacman -R --noconfirm {' '.join(BASE_PACKAGES)} 2>/dev/null || true"]
                )
                
            except InstallationError:
                raise
            except Exception as e:
                raise InstallationError(f"Falha na instalação de pacotes: {e}", stage="packages")
        
        # ========================================================================
        # ETAPA 2: CONFIGURAÇÃO DO SISTEMA
        # ========================================================================
        try:
            # 2.1 Configurar diretório de músicas
            log_step("Configurando diretório de músicas...")
            setup_music_directory(user, music_dir)
            
            music_path = home_dir / music_dir
            rollback.create_checkpoint("music_dir_created",
                {"path": str(music_path)},
                [f"rm -rf {music_path} 2>/dev/null || true"]
            )
            
            # 2.2 Configurar autologin
            log_step("Configurando autologin...")
            configure_autologin(user, system_info.login_manager)
            
            rollback.create_checkpoint("autologin_configured",
                {"user": user, "login_manager": system_info.login_manager},
                []  # Autologin é complexo de reverter de forma segura
            )
            
        except InstallationError:
            raise
        except Exception as e:
            raise InstallationError(f"Falha na configuração do sistema: {e}", stage="system_config")
        
        # ========================================================================
        # ETAPA 3: SPOTIFY E SPICETIFY
        # ========================================================================
        if not args.no_spotify:
            try:
                log_step("Instalando Spotify + Spicetify...")
                install_spotify_spicetify(user, system_info)
                configure_spotify_only_session(user)
                
                rollback.create_checkpoint("spotify_installed",
                    {"user": user},
                    [
                        "paru -R --noconfirm spotify-launcher spicetify-cli 2>/dev/null || true",
                        f"rm -rf {home_dir}/.spicetify 2>/dev/null || true",
                        f"rm -rf {home_dir}/.config/spotify 2>/dev/null || true"
                    ]
                )
                
                # 3.2 Instalar spotify-cli-linux
                if not args.no_spotify_cli:
                    log_step("Instalando spotify-cli-linux...")
                    install_spotify_cli_tools(user)
                    
                    rollback.create_checkpoint("spotify_cli_installed",
                        {},
                        [f"sudo -u {user} pip uninstall -y spotify-cli-linux 2>/dev/null || true"]
                    )
                    
            except InstallationError:
                raise
            except Exception as e:
                raise InstallationError(f"Falha na instalação do Spotify: {e}", stage="spotify")
        
        # ========================================================================
        # ETAPA 4: CHROMIUM E SQLITE
        # ========================================================================
        try:
            # 4.1 Configurar Chromium
            log_step("Configurando Chromium...")
            configure_chromium_homepage(user)
            
            # 4.2 Configurar SQLite
            log_step("Configurando banco de dados SQLite...")
            setup_sqlite_database()
            
            rollback.create_checkpoint("chromium_sqlite_done",
                {},
                [
                    f"rm -rf {home_dir}/.config/chromium/Default/Preferences 2>/dev/null || true",
                    f"rm -rf {DATA_DIR}/tsijukebox.db 2>/dev/null || true",
                    f"rm -rf {CONFIG_DIR}/config.yaml 2>/dev/null || true"
                ]
            )
            
        except InstallationError:
            raise
        except Exception as e:
            raise InstallationError(f"Falha na configuração do Chromium/SQLite: {e}", stage="chromium_sqlite")
        
        # ========================================================================
        # ETAPA 5: MONITORAMENTO E WEB
        # ========================================================================
        try:
            # 5.1 Instalar monitoramento
            if not args.no_monitoring:
                log_step("Instalando stack de monitoramento...")
                install_packages(MONITORING_PACKAGES, system_info=system_info)
                
                rollback.create_checkpoint("monitoring_installed",
                    {"packages": MONITORING_PACKAGES},
                    [f"pacman -R --noconfirm {' '.join(MONITORING_PACKAGES)} 2>/dev/null || true"]
                )
            
            # 5.2 Instalar pacotes web
            log_step("Instalando pacotes web (Nginx, Avahi)...")
            install_packages(WEB_PACKAGES, system_info=system_info)
            
            rollback.create_checkpoint("web_packages_installed",
                {"packages": WEB_PACKAGES},
                [f"pacman -R --noconfirm {' '.join(WEB_PACKAGES)} 2>/dev/null || true"]
            )
            
        except InstallationError:
            raise
        except Exception as e:
            raise InstallationError(f"Falha na instalação de monitoramento/web: {e}", stage="monitoring_web")
        
        # ========================================================================
        # ETAPA 6: REPOSITÓRIO E NPM
        # ========================================================================
        try:
            log_step("Clonando repositório e instalando dependências npm...")
            if not clone_and_setup_repository(user):
                raise InstallationError("Falha ao clonar repositório ou instalar npm", stage="repository")
            
            rollback.create_checkpoint("repository_cloned",
                {"path": str(INSTALL_DIR)},
                [f"rm -rf {INSTALL_DIR} 2>/dev/null || true"]
            )
            
        except InstallationError:
            raise
        except Exception as e:
            raise InstallationError(f"Falha ao configurar repositório: {e}", stage="repository")
        
        # ========================================================================
        # ETAPA 7: SERVIÇOS SYSTEMD
        # ========================================================================
        try:
            log_step("Criando e iniciando serviços systemd...")
            create_systemd_services(user)
            
            rollback.create_checkpoint("services_created",
                {},
                [
                    "systemctl stop tsijukebox.service 2>/dev/null || true",
                    "systemctl disable tsijukebox.service 2>/dev/null || true",
                    "rm -f /etc/systemd/system/tsijukebox.service 2>/dev/null || true",
                    "systemctl daemon-reload"
                ]
            )
            
        except InstallationError:
            raise
        except Exception as e:
            raise InstallationError(f"Falha ao criar serviços: {e}", stage="services")
        
        # ========================================================================
        # ETAPA 8: VALIDAÇÃO PÓS-INSTALAÇÃO
        # ========================================================================
        if not DRY_RUN:
            print()
            log_step("Executando validação pós-instalação...")
            validator = PostInstallValidator(args)
            validation_ok = validator.validate_all()
            
            if not validation_ok:
                log_warning("Algumas verificações falharam. Verifique os erros acima.")
        
        # ========================================================================
        # SUCESSO! LIMPAR CHECKPOINTS
        # ========================================================================
        rollback.cleanup()
        
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
    
    except KeyboardInterrupt:
        # Ctrl+C pressionado pelo usuário
        print()
        log_warning("⚠️  Instalação cancelada pelo usuário (Ctrl+C)")
        
        if rollback.has_checkpoints():
            print()
            try:
                response = input(f"{Colors.YELLOW}Deseja reverter as mudanças feitas até agora? [s/N]: {Colors.RESET}")
                if response.lower() in ('s', 'sim', 'y', 'yes'):
                    log_step("Revertendo mudanças...")
                    rollback.rollback_all()
                    log_success("Mudanças revertidas com sucesso")
                else:
                    log_info("Mudanças mantidas. Execute com --doctor para diagnosticar problemas.")
            except EOFError:
                # stdin fechado, reverter automaticamente
                log_step("Revertendo mudanças automaticamente...")
                rollback.rollback_all()
        
        return False
    
    except InstallationError as e:
        # Erro controlado durante instalação
        print()
        log_error(f"❌ Erro na etapa '{e.stage}': {e}")
        
        if rollback.has_checkpoints() and e.recoverable:
            log_step("Iniciando rollback automático...")
            rollback.rollback_all()
            log_info("Sistema restaurado ao estado anterior.")
            log_info("Corrija o problema e execute novamente a instalação.")
        
        return False
    
    except Exception as e:
        # Erro inesperado
        print()
        log_error(f"❌ Erro fatal inesperado: {e}")
        
        if rollback.has_checkpoints():
            log_step("Iniciando rollback automático de emergência...")
            rollback.rollback_all()
            log_info("Sistema restaurado ao estado anterior.")
        
        # Re-raise para que o traceback seja exibido se --verbose
        raise
    
    finally:
        # Log do estado final do rollback manager para debug
        if not QUIET_MODE and rollback.checkpoints:
            log_info(f"Estado do rollback: {len(rollback.checkpoints)} checkpoint(s) pendente(s)")


# =============================================================================
# MAIN
# =============================================================================


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(
        description='TSiJUKEBOX Enterprise - One-Line Installer',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Argumentos principais
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
    parser.add_argument('--rollback-dry-run', action='store_true',
                       help='Simular rollback sem executar comandos de reversão')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Modo interativo: escolher componentes via menu')
    
    # Configuração de arquivo JSON (suporta múltiplos para herança)
    parser.add_argument('--config-file', '-c', type=str, action='append', dest='config_files',
                       help='Arquivos JSON de configuração (use múltiplas vezes para herança)')
    
    # Comandos de validação e diagnóstico
    parser.add_argument('--validate', action='store_true',
                       help='Validar instalação existente (não instala)')
    parser.add_argument('--doctor', action='store_true',
                       help='Diagnosticar problemas e sugerir correções')
    parser.add_argument('--doctor-fix', action='store_true',
                       help='Diagnosticar e aplicar correções automaticamente')
    
    # Gerador de configuração
    parser.add_argument('--generate-config', type=str, nargs='?', const='config.json', metavar='FILE',
                       help='Gerar config.json interativamente (padrão: config.json)')
    
    # Backup e restore
    parser.add_argument('--backup', nargs='?', const='auto', metavar='LABEL',
                       help='Criar backup das configurações (label opcional)')
    parser.add_argument('--restore', type=str, metavar='FILE',
                       help='Restaurar backup de configurações')
    parser.add_argument('--list-backups', action='store_true',
                       help='Listar backups disponíveis')
    
    # Export report
    parser.add_argument('--export-report', type=str, metavar='FILE',
                       help='Exportar relatório do doctor (suporta .json e .html)')
    
    # Health check para monitoramento
    parser.add_argument('--health-check', action='store_true',
                       help='Verificação rápida de saúde (retorna código de saída para monitoramento)')
    parser.add_argument('--alert-on-failure', action='store_true',
                       help='Enviar alerta se health-check falhar')
    parser.add_argument('--alert-channels', type=str, default='database',
                       help='Canais de alerta separados por vírgula (telegram,discord,email,database)')
    
    # Timer systemd para health-check
    parser.add_argument('--install-timer', action='store_true',
                       help='Instalar timer systemd para health-check automático')
    parser.add_argument('--uninstall-timer', action='store_true',
                       help='Remover timer systemd de health-check')
    parser.add_argument('--timer-status', action='store_true',
                       help='Verificar status do timer de health-check')
    
    # Migração de configurações
    parser.add_argument('--migrate', type=str, nargs='?', const='auto', metavar='FROM_VERSION',
                       help='Migrar configurações para versão atual (detecta versão automaticamente)')
    
    # Sistema de plugins
    parser.add_argument('--plugin', type=str, metavar='NAME',
                       help='Executar plugin de extensão (ex: --plugin spotify-downloader)')
    parser.add_argument('--list-plugins', action='store_true',
                       help='Listar plugins disponíveis')
    
    # Outros
    parser.add_argument('--uninstall', action='store_true',
                       help='Remover instalação existente')
    parser.add_argument('--quiet', '-q', action='store_true',
                       help='Modo silencioso (apenas erros)')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Modo verboso')
    parser.add_argument('--version', action='version', version=f'TSiJUKEBOX Installer v{VERSION}')
    
    args = parser.parse_args()
    
    # Ativar modo quiet (antes de qualquer log)
    global QUIET_MODE
    if args.quiet:
        QUIET_MODE = True
    
    # Ativar modo dry-run
    global DRY_RUN
    if args.dry_run:
        DRY_RUN = True
        log_warning("🧪 MODO DRY-RUN: Nenhum comando será executado de fato")
    
    # Ativar modo rollback-dry-run
    global ROLLBACK_DRY_RUN
    if getattr(args, 'rollback_dry_run', False):
        ROLLBACK_DRY_RUN = True
        log_info("🔄 MODO ROLLBACK-DRY-RUN: Comandos de reversão serão apenas exibidos")
    
    # =========================================================================
    # COMANDOS STANDALONE (não requerem root, executam e saem)
    # =========================================================================
    
    # --generate-config: Gerar config.json interativamente
    if args.generate_config:
        generator = ConfigGenerator()
        success = generator.generate(args.generate_config)
        sys.exit(0 if success else 1)
    
    # --list-backups: Listar backups disponíveis
    if args.list_backups:
        backup_mgr = ConfigBackup()
        backup_mgr.list_backups()
        sys.exit(0)
    
    # --backup: Criar backup das configurações
    if args.backup:
        check_root()
        backup_mgr = ConfigBackup()
        result = backup_mgr.create_backup(args.backup)
        sys.exit(0 if result else 1)
    
    # --restore: Restaurar backup
    if args.restore:
        check_root()
        backup_mgr = ConfigBackup()
        success = backup_mgr.restore_backup(args.restore)
        sys.exit(0 if success else 1)
    
    # --doctor ou --doctor-fix: Diagnóstico
    if args.doctor or args.doctor_fix:
        doctor = DoctorDiagnostic(auto_fix=args.doctor_fix)
        success = doctor.run_all_checks()
        
        # Exportar relatório se solicitado
        if hasattr(args, 'export_report') and args.export_report:
            output = args.export_report
            if output.endswith('.json'):
                doctor.export_json(output)
            elif output.endswith('.html'):
                doctor.export_html(output)
            else:
                # Default: gerar ambos
                doctor.export_json(f"{output}.json")
                doctor.export_html(f"{output}.html")
        
        sys.exit(0 if success else 1)
    
    # --validate: Validar instalação existente
    if args.validate:
        log_info("🔍 Executando validação pós-instalação...")
        validator = PostInstallValidator(args)
        success = validator.validate_all()
        sys.exit(0 if success else 1)
    
    # --health-check: Verificação rápida para monitoramento
    if args.health_check:
        alert_channels = args.alert_channels.split(',') if args.alert_channels else ['database']
        health = HealthCheck(
            verbose=args.verbose,
            alert_on_failure=args.alert_on_failure,
            alert_channels=alert_channels
        )
        exit_code = health.run()
        sys.exit(exit_code)
    
    # --install-timer: Instalar timer de health-check
    if args.install_timer:
        check_root()
        alert_channels = args.alert_channels.split(',') if args.alert_channels else ['database']
        timer = SystemdHealthTimer()
        success = timer.install(alert_channels)
        sys.exit(0 if success else 1)
    
    # --uninstall-timer: Remover timer
    if args.uninstall_timer:
        check_root()
        timer = SystemdHealthTimer()
        success = timer.uninstall()
        sys.exit(0 if success else 1)
    
    # --timer-status: Status do timer
    if args.timer_status:
        timer = SystemdHealthTimer()
        status = timer.status()
        print(f"\n{Colors.CYAN}━━━ STATUS DO TIMER ━━━{Colors.RESET}\n")
        print(f"  Instalado: {'Sim' if status['installed'] else 'Não'}")
        print(f"  Ativo: {'Sim' if status['active'] else 'Não'}")
        print(f"  Configuração: {'OK' if status['env_configured'] else 'Pendente'}")
        if status['timer_info']:
            print(f"\n{status['timer_info']}")
        sys.exit(0)
    
    # --migrate: Migrar configurações
    if args.migrate:
        from_version = args.migrate if args.migrate != 'auto' else None
        migrator = ConfigMigrator(from_version=from_version)
        success = migrator.migrate(dry_run=args.dry_run)
        sys.exit(0 if success else 1)
    
    # --list-plugins: Listar plugins disponíveis
    if args.list_plugins:
        plugin_mgr = PluginManager()
        plugin_mgr.list_plugins()
        sys.exit(0)
    
    # --plugin: Executar plugin específico
    if args.plugin:
        plugin_mgr = PluginManager()
        success = plugin_mgr.run_plugin(args.plugin, args)
        sys.exit(0 if success else 1)
    
    # =========================================================================
    # CARREGAR CONFIGURAÇÃO (antes do menu interativo)
    # =========================================================================
    
    # Carregar configuração de arquivos JSON (suporta herança com múltiplos arquivos)
    if args.config_files:
        config = load_config_files(args.config_files)
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
    
    # =========================================================================
    # INSTALAÇÃO PRINCIPAL
    # =========================================================================
    
    # Verificar root para instalação
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
