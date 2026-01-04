#!/usr/bin/env python3
"""
TSiJUKEBOX Installation Wizard v6.1.0
=====================================
Wizard interativo com análise de hardware e sugestão inteligente de modo

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import subprocess
import platform
import psutil
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# ═══════════════════════════════════════════════════════════════════════════
# CORES E FORMATAÇÃO
# ═══════════════════════════════════════════════════════════════════════════

class Colors:
    """Cores ANSI para terminal"""
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    RESET = '\033[0m'
    
    # Neon colors
    NEON_CYAN = '\033[38;5;51m'
    NEON_MAGENTA = '\033[38;5;201m'
    NEON_GOLD = '\033[38;5;220m'


def print_header():
    """Imprime cabeçalho do wizard"""
    print(f"""
{Colors.NEON_CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  {Colors.NEON_MAGENTA}🎵 TSiJUKEBOX{Colors.NEON_CYAN} - Installation Wizard v6.1.0                          ║
║                                                                              ║
║  {Colors.DIM}Enterprise Digital Jukebox System{Colors.NEON_CYAN}                                     ║
║  {Colors.DIM}Instalador Inteligente com Análise de Hardware{Colors.NEON_CYAN}                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")


def print_section(title: str):
    """Imprime título de seção"""
    print(f"\n{Colors.BOLD}{Colors.NEON_CYAN}{'═' * 80}")
    print(f"  {title}")
    print(f"{'═' * 80}{Colors.RESET}\n")


def print_step(step: int, total: int, message: str):
    """Imprime passo do wizard"""
    print(f"{Colors.CYAN}[{step}/{total}]{Colors.RESET} {message}")


def print_success(message: str):
    """Imprime mensagem de sucesso"""
    print(f"{Colors.GREEN}✓{Colors.RESET}  {message}")


def print_warning(message: str):
    """Imprime aviso"""
    print(f"{Colors.YELLOW}⚠{Colors.RESET}  {message}")


def print_error(message: str):
    """Imprime erro"""
    print(f"{Colors.RED}✗{Colors.RESET}  {message}")


def print_info(message: str):
    """Imprime informação"""
    print(f"{Colors.BLUE}ℹ{Colors.RESET}  {message}")


# ═══════════════════════════════════════════════════════════════════════════
# ANÁLISE DE HARDWARE
# ═══════════════════════════════════════════════════════════════════════════

class HardwareAnalyzer:
    """Analisa hardware do sistema"""
    
    def __init__(self):
        self.cpu_count = psutil.cpu_count(logical=True)
        self.cpu_freq = psutil.cpu_freq()
        self.memory = psutil.virtual_memory()
        self.disk = psutil.disk_usage('/')
        self.gpu_info = self._detect_gpu()
        
    def _detect_gpu(self) -> Optional[str]:
        """Detecta GPU do sistema"""
        try:
            # Tenta detectar GPU NVIDIA
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=name', '--format=csv,noheader'],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except:
            pass
        
        try:
            # Tenta detectar GPU AMD
            result = subprocess.run(
                ['lspci'],
                capture_output=True,
                text=True,
                timeout=2
            )
            for line in result.stdout.split('\n'):
                if 'VGA' in line or 'Display' in line:
                    if 'AMD' in line or 'ATI' in line:
                        return line.split(':')[-1].strip()
                    elif 'Intel' in line:
                        return line.split(':')[-1].strip()
        except:
            pass
        
        return "Não detectada"
    
    def get_recommendation(self) -> Tuple[str, str, List[str]]:
        """
        Retorna recomendação de modo baseado no hardware
        
        Returns:
            (modo, confiança, razões)
        """
        score_full = 0
        score_kiosk = 0
        score_server = 0
        reasons = []
        
        # Análise de CPU
        if self.cpu_count >= 8:
            score_full += 3
            score_kiosk += 2
            reasons.append(f"CPU potente ({self.cpu_count} threads)")
        elif self.cpu_count >= 4:
            score_full += 2
            score_kiosk += 3
            score_server += 1
            reasons.append(f"CPU adequada ({self.cpu_count} threads)")
        else:
            score_server += 2
            reasons.append(f"CPU limitada ({self.cpu_count} threads)")
        
        # Análise de RAM
        ram_gb = self.memory.total / (1024**3)
        if ram_gb >= 16:
            score_full += 3
            score_kiosk += 2
            reasons.append(f"RAM abundante ({ram_gb:.1f} GB)")
        elif ram_gb >= 8:
            score_full += 2
            score_kiosk += 3
            score_server += 1
            reasons.append(f"RAM adequada ({ram_gb:.1f} GB)")
        elif ram_gb >= 4:
            score_kiosk += 2
            score_server += 2
            reasons.append(f"RAM suficiente ({ram_gb:.1f} GB)")
        else:
            score_server += 3
            reasons.append(f"RAM limitada ({ram_gb:.1f} GB)")
        
        # Análise de GPU
        if self.gpu_info and self.gpu_info != "Não detectada":
            if any(x in self.gpu_info.upper() for x in ['RTX', 'RX', 'GTX']):
                score_full += 2
                score_kiosk += 3
                reasons.append(f"GPU dedicada detectada")
            else:
                score_kiosk += 1
                reasons.append("GPU integrada detectada")
        else:
            score_server += 2
            reasons.append("Sem GPU dedicada")
        
        # Análise de disco
        disk_gb = self.disk.total / (1024**3)
        if disk_gb >= 500:
            score_full += 1
            reasons.append(f"Disco amplo ({disk_gb:.0f} GB)")
        elif disk_gb < 100:
            score_server += 1
            reasons.append(f"Disco limitado ({disk_gb:.0f} GB)")
        
        # Determina modo recomendado
        scores = {
            'full': score_full,
            'kiosk': score_kiosk,
            'server': score_server
        }
        
        recommended_mode = max(scores, key=scores.get)
        max_score = scores[recommended_mode]
        total_score = sum(scores.values())
        confidence = (max_score / total_score * 100) if total_score > 0 else 0
        
        confidence_level = "Alta" if confidence >= 60 else "Média" if confidence >= 40 else "Baixa"
        
        return recommended_mode, confidence_level, reasons
    
    def print_analysis(self):
        """Imprime análise de hardware"""
        print_section("🔍 ANÁLISE DE HARDWARE")
        
        print(f"{Colors.BOLD}CPU:{Colors.RESET}")
        print(f"  Threads: {self.cpu_count}")
        if self.cpu_freq:
            print(f"  Frequência: {self.cpu_freq.current:.0f} MHz (max: {self.cpu_freq.max:.0f} MHz)")
        
        ram_gb = self.memory.total / (1024**3)
        ram_available_gb = self.memory.available / (1024**3)
        print(f"\n{Colors.BOLD}RAM:{Colors.RESET}")
        print(f"  Total: {ram_gb:.1f} GB")
        print(f"  Disponível: {ram_available_gb:.1f} GB")
        print(f"  Uso: {self.memory.percent}%")
        
        print(f"\n{Colors.BOLD}GPU:{Colors.RESET}")
        print(f"  {self.gpu_info}")
        
        disk_gb = self.disk.total / (1024**3)
        disk_free_gb = self.disk.free / (1024**3)
        print(f"\n{Colors.BOLD}Disco:{Colors.RESET}")
        print(f"  Total: {disk_gb:.0f} GB")
        print(f"  Livre: {disk_free_gb:.0f} GB")
        print(f"  Uso: {self.disk.percent}%")
        
        # Recomendação
        mode, confidence, reasons = self.get_recommendation()
        
        print(f"\n{Colors.BOLD}{Colors.NEON_GOLD}💡 RECOMENDAÇÃO:{Colors.RESET}")
        mode_names = {
            'full': '🎵 Modo Completo (Full)',
            'kiosk': '🖥️ Modo Kiosk',
            'server': '🖧 Modo Server'
        }
        print(f"  {mode_names[mode]}")
        print(f"  Confiança: {confidence}")
        print(f"\n  {Colors.DIM}Razões:{Colors.RESET}")
        for reason in reasons:
            print(f"    • {reason}")


# ═══════════════════════════════════════════════════════════════════════════
# WIZARD INTERATIVO
# ═══════════════════════════════════════════════════════════════════════════

class InstallationWizard:
    """Wizard de instalação interativo"""
    
    def __init__(self):
        self.config = {
            'mode': None,
            'user': os.getenv('SUDO_USER') or os.getenv('USER'),
            'timezone': 'America/Sao_Paulo',
            'ssl_mode': 'self-signed',
            'ssl_domain': 'midiaserver.local',
            'avahi_hostname': 'midiaserver',
            'install_docker': True,
            'install_ufw': True,
            'install_ntp': True,
            'install_nginx': True,
            'install_grafana': True,
            'install_prometheus': True,
            'install_fail2ban': True,
            'install_spotify': True,
            'install_spicetify': True,
            'database': 'sqlite',
            'sqlite_path': '/var/lib/tsijukebox/data.db',
        }
        self.hardware = HardwareAnalyzer()
    
    def run(self):
        """Executa o wizard"""
        print_header()
        
        # Passo 1: Análise de hardware
        self.hardware.print_analysis()
        input(f"\n{Colors.DIM}Pressione Enter para continuar...{Colors.RESET}")
        
        # Passo 2: Escolha do modo
        self._choose_mode()
        
        # Passo 3: Configurações avançadas
        self._advanced_settings()
        
        # Passo 4: Resumo e confirmação
        self._show_summary()
        
        # Passo 5: Instalação
        if self._confirm_installation():
            self._run_installation()
        else:
            print_warning("Instalação cancelada pelo usuário.")
            sys.exit(0)
    
    def _choose_mode(self):
        """Escolha do modo de instalação"""
        print_section("🎮 ESCOLHA DO MODO DE INSTALAÇÃO")
        
        recommended_mode, confidence, _ = self.hardware.get_recommendation()
        
        print(f"{Colors.BOLD}Modos disponíveis:{Colors.RESET}\n")
        
        modes = {
            '1': ('full', '🎵 Modo Completo (Full)', 'Docker, UFW, NTP, Nginx, SSL, Avahi, Grafana, Prometheus, Fail2ban, Spotify'),
            '2': ('kiosk', '🖥️ Modo Kiosk', 'Interface touchscreen, HTTPS via midiaserver.local/jukebox, Chromium --kiosk'),
            '3': ('server', '🖧 Modo Server', 'Headless, API REST, sem interface gráfica, baixo consumo'),
        }
        
        for key, (mode_id, name, desc) in modes.items():
            marker = f" {Colors.NEON_GOLD}← RECOMENDADO{Colors.RESET}" if mode_id == recommended_mode else ""
            print(f"{Colors.CYAN}{key}.{Colors.RESET} {Colors.BOLD}{name}{Colors.RESET}{marker}")
            print(f"   {Colors.DIM}{desc}{Colors.RESET}\n")
        
        while True:
            choice = input(f"{Colors.CYAN}Escolha o modo [1-3]:{Colors.RESET} ").strip()
            if choice in modes:
                self.config['mode'] = modes[choice][0]
                print_success(f"Modo selecionado: {modes[choice][1]}")
                break
            else:
                print_error("Opção inválida. Digite 1, 2 ou 3.")
    
    def _advanced_settings(self):
        """Configurações avançadas"""
        print_section("⚙️ CONFIGURAÇÕES AVANÇADAS")
        
        print(f"{Colors.DIM}Configurações padrão:{Colors.RESET}")
        print(f"  • Usuário: {self.config['user']}")
        print(f"  • Timezone: {self.config['timezone']}")
        print(f"  • SSL: {self.config['ssl_mode']}")
        print(f"  • Domínio: https://{self.config['ssl_domain']}/jukebox")
        print(f"  • Hostname mDNS: {self.config['avahi_hostname']}.local")
        print(f"  • Login padrão: admin / admin")
        
        change = input(f"\n{Colors.CYAN}Deseja alterar alguma configuração? [s/N]:{Colors.RESET} ").strip().lower()
        
        if change == 's':
            self._customize_settings()
        else:
            print_info("Usando configurações padrão.")
    
    def _customize_settings(self):
        """Customiza configurações"""
        # Usuário
        user = input(f"Usuário do sistema [{self.config['user']}]: ").strip()
        if user:
            self.config['user'] = user
        
        # Timezone
        tz = input(f"Timezone [{self.config['timezone']}]: ").strip()
        if tz:
            self.config['timezone'] = tz
        
        # SSL
        print(f"\nModo SSL:")
        print(f"  1. self-signed (padrão)")
        print(f"  2. letsencrypt")
        ssl_choice = input(f"Escolha [1-2]: ").strip()
        if ssl_choice == '2':
            self.config['ssl_mode'] = 'letsencrypt'
            email = input(f"Email para Let's Encrypt: ").strip()
            self.config['ssl_email'] = email
        
        # Domínio
        domain = input(f"Domínio [{self.config['ssl_domain']}]: ").strip()
        if domain:
            self.config['ssl_domain'] = domain
    
    def _show_summary(self):
        """Mostra resumo da instalação"""
        print_section("📋 RESUMO DA INSTALAÇÃO")
        
        mode_names = {
            'full': '🎵 Modo Completo (Full)',
            'kiosk': '🖥️ Modo Kiosk',
            'server': '🖧 Modo Server'
        }
        
        print(f"{Colors.BOLD}Configuração:{Colors.RESET}")
        print(f"  Modo: {mode_names[self.config['mode']]}")
        print(f"  Usuário: {self.config['user']}")
        print(f"  Acesso: https://{self.config['ssl_domain']}/jukebox")
        print(f"  Login: admin / admin")
        print(f"  Banco de dados: SQLite ({self.config['sqlite_path']})")
        
        print(f"\n{Colors.BOLD}Componentes a serem instalados:{Colors.RESET}")
        components = [
            ('Docker + Docker Compose', self.config['install_docker']),
            ('UFW Firewall', self.config['install_ufw']),
            ('NTP (sincronização de tempo)', self.config['install_ntp']),
            ('Nginx (proxy reverso)', self.config['install_nginx']),
            ('SQLite (banco de dados)', True),
            ('Grafana (monitoramento)', self.config['install_grafana']),
            ('Prometheus (métricas)', self.config['install_prometheus']),
            ('Fail2ban (segurança)', self.config['install_fail2ban']),
            ('Spotify + Spicetify', self.config['install_spotify']),
        ]
        
        for name, enabled in components:
            status = f"{Colors.GREEN}✓{Colors.RESET}" if enabled else f"{Colors.DIM}✗{Colors.RESET}"
            print(f"  {status} {name}")
        
        print(f"\n{Colors.BOLD}Estimativa de tempo:{Colors.RESET} 15-30 minutos")
        print(f"{Colors.BOLD}Espaço necessário:{Colors.RESET} ~2 GB")
    
    def _confirm_installation(self) -> bool:
        """Confirma instalação"""
        print()
        confirm = input(f"{Colors.BOLD}{Colors.NEON_CYAN}Deseja prosseguir com a instalação? [S/n]:{Colors.RESET} ").strip().lower()
        return confirm != 'n'
    
    def _run_installation(self):
        """Executa a instalação"""
        print_section("🚀 INICIANDO INSTALAÇÃO")
        
        # Salva configuração
        config_path = Path('/tmp/tsijukebox-wizard-config.json')
        with open(config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
        
        print_info(f"Configuração salva em: {config_path}")
        
        # Monta comando do instalador
        installer_path = Path(__file__).parent / 'unified-installer.py'
        
        cmd = [
            'sudo', 'python3', str(installer_path),
            '--mode', self.config['mode'],
            '--user', self.config['user'],
            '--timezone', self.config['timezone'],
            '--ssl-mode', self.config['ssl_mode'],
            '--ssl-domain', self.config['ssl_domain'],
            '--avahi-hostname', self.config['avahi_hostname'],
            '--auto',  # Modo automático
        ]
        
        if self.config['ssl_mode'] == 'letsencrypt' and 'ssl_email' in self.config:
            cmd.extend(['--ssl-email', self.config['ssl_email']])
        
        if not self.config['install_docker']:
            cmd.append('--no-docker')
        if not self.config['install_spotify']:
            cmd.append('--no-spotify')
        
        # SQLite como banco de dados padrão
        cmd.extend(['--database', 'sqlite'])
        cmd.extend(['--sqlite-path', self.config['sqlite_path']])
        
        print_info(f"Executando: {' '.join(cmd)}")
        print()
        
        # Executa instalador
        try:
            subprocess.run(cmd, check=True)
            print_success("\n🎉 Instalação concluída com sucesso!")
            print(f"\n{Colors.NEON_CYAN}Acesse: https://{self.config['ssl_domain']}/jukebox{Colors.RESET}")
            print(f"{Colors.DIM}Login: admin / admin{Colors.RESET}")
        except subprocess.CalledProcessError as e:
            print_error(f"Erro durante a instalação: {e}")
            sys.exit(1)


# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

def main():
    """Função principal"""
    # Verifica se está rodando como root
    if os.geteuid() == 0:
        print_error("Não execute este script como root diretamente.")
        print_info("Use: python3 installation-wizard.py")
        sys.exit(1)
    
    # Verifica se tem sudo
    try:
        subprocess.run(['sudo', '-n', 'true'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print_error("Este script requer privilégios sudo.")
        print_info("Execute: sudo -v")
        sys.exit(1)
    
    # Executa wizard
    wizard = InstallationWizard()
    wizard.run()


if __name__ == '__main__':
    main()
