#!/usr/bin/env python3
"""
TSiJUKEBOX Systemd Notify Wrapper
=================================
Wrapper para notificar systemd sobre status de saúde do serviço.

Uso:
    python3 systemd-notify-wrapper.py --ready
    python3 systemd-notify-wrapper.py --status "Healthy"
    python3 systemd-notify-wrapper.py --watchdog-loop
    python3 systemd-notify-wrapper.py --test

Autor: TSiJUKEBOX Team
Licença: Domínio Público
"""

import os
import sys
import socket
import time
import argparse
from typing import Tuple, Optional
from pathlib import Path

# =============================================================================
# CONSTANTES
# =============================================================================

DEFAULT_PORT = 5173
WATCHDOG_INTERVAL = 10  # segundos (WatchdogSec / 2)
HEALTH_CHECK_TIMEOUT = 5  # segundos


# =============================================================================
# CORES
# =============================================================================

class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GRAY = '\033[90m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


# =============================================================================
# SYSTEMD NOTIFIER
# =============================================================================

class SystemdNotifier:
    """Notificador para systemd via sd_notify."""
    
    def __init__(self):
        self.socket_path = os.environ.get('NOTIFY_SOCKET')
        self.enabled = self.socket_path is not None
    
    def _send(self, message: str) -> bool:
        """Envia mensagem para o socket de notificação do systemd."""
        if not self.enabled:
            return False
        
        try:
            # Remover @ prefix se existir (abstract socket)
            socket_path = self.socket_path
            if socket_path.startswith('@'):
                socket_path = '\0' + socket_path[1:]
            
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
            sock.connect(socket_path)
            sock.sendall(message.encode())
            sock.close()
            return True
        except Exception as e:
            print(f"{Colors.RED}Erro ao notificar systemd: {e}{Colors.RESET}", file=sys.stderr)
            return False
    
    def ready(self) -> bool:
        """Notifica que o serviço está pronto (READY=1)."""
        return self._send("READY=1")
    
    def status(self, message: str) -> bool:
        """Atualiza status exibido no systemctl status."""
        # Limpar caracteres especiais
        clean_message = message.replace('\n', ' ')[:100]
        return self._send(f"STATUS={clean_message}")
    
    def watchdog(self) -> bool:
        """Envia heartbeat para watchdog (WATCHDOG=1)."""
        return self._send("WATCHDOG=1")
    
    def stopping(self) -> bool:
        """Notifica que está parando (STOPPING=1)."""
        return self._send("STOPPING=1")
    
    def reloading(self) -> bool:
        """Notifica que está recarregando (RELOADING=1)."""
        return self._send("RELOADING=1")
    
    def errno(self, errno: int = 1) -> bool:
        """Reporta erro (ERRNO=n)."""
        return self._send(f"ERRNO={errno}")
    
    def mainpid(self, pid: int) -> bool:
        """Informa PID principal (MAINPID=n)."""
        return self._send(f"MAINPID={pid}")


# =============================================================================
# HEALTH CHECKS
# =============================================================================

def check_port(port: int = DEFAULT_PORT, timeout: float = 2) -> Tuple[bool, str]:
    """Verifica se a porta está acessível."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            return True, f"Porta {port} acessível"
        else:
            return False, f"Porta {port} inacessível (código: {result})"
    except socket.timeout:
        return False, f"Porta {port} timeout"
    except Exception as e:
        return False, f"Erro ao verificar porta {port}: {e}"


def check_http(port: int = DEFAULT_PORT, timeout: float = 5) -> Tuple[bool, str]:
    """Verifica resposta HTTP do serviço."""
    try:
        import urllib.request
        req = urllib.request.urlopen(f'http://localhost:{port}', timeout=timeout)
        status = req.status
        
        if status == 200:
            return True, f"HTTP OK ({status})"
        else:
            return False, f"HTTP retornou {status}"
    except urllib.error.URLError as e:
        return False, f"Erro HTTP: {e.reason}"
    except Exception as e:
        return False, f"Erro HTTP: {e}"


def run_health_check(port: int = DEFAULT_PORT) -> Tuple[bool, str]:
    """Executa verificação completa de saúde."""
    # Verificar porta primeiro (mais rápido)
    port_ok, port_msg = check_port(port, timeout=2)
    if not port_ok:
        return False, port_msg
    
    # Verificar HTTP
    http_ok, http_msg = check_http(port, timeout=5)
    if not http_ok:
        return False, http_msg
    
    return True, "Healthy"


# =============================================================================
# WATCHDOG LOOP
# =============================================================================

def watchdog_loop(port: int = DEFAULT_PORT, interval: float = WATCHDOG_INTERVAL):
    """
    Loop de watchdog que verifica saúde e notifica systemd.
    
    Se o serviço estiver saudável, envia WATCHDOG=1.
    Se não estiver, não envia - o systemd vai reiniciar após WatchdogSec.
    """
    notifier = SystemdNotifier()
    
    if not notifier.enabled:
        print(f"{Colors.YELLOW}NOTIFY_SOCKET não definido - watchdog desabilitado{Colors.RESET}")
        print(f"{Colors.GRAY}Execute via systemd para habilitar watchdog{Colors.RESET}")
        return
    
    print(f"{Colors.CYAN}Iniciando watchdog loop (intervalo: {interval}s){Colors.RESET}")
    
    # Enviar READY primeiro
    notifier.ready()
    notifier.status("Starting up...")
    
    consecutive_failures = 0
    max_failures = 3
    
    try:
        while True:
            healthy, status = run_health_check(port)
            
            if healthy:
                consecutive_failures = 0
                notifier.watchdog()
                notifier.status(f"Healthy - {status}")
            else:
                consecutive_failures += 1
                notifier.status(f"Unhealthy ({consecutive_failures}/{max_failures}) - {status}")
                
                if consecutive_failures >= max_failures:
                    print(f"{Colors.RED}Muitas falhas consecutivas - permitindo restart{Colors.RESET}")
                    notifier.errno(1)
                    # Não enviar watchdog = systemd reinicia após WatchdogSec
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print(f"\n{Colors.CYAN}Watchdog interrompido{Colors.RESET}")
        notifier.stopping()


# =============================================================================
# MAIN
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX Systemd Notify Wrapper",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--ready',
        action='store_true',
        help="Enviar READY=1"
    )
    parser.add_argument(
        '--status',
        type=str,
        metavar='MSG',
        help="Enviar STATUS=MSG"
    )
    parser.add_argument(
        '--watchdog',
        action='store_true',
        help="Enviar WATCHDOG=1"
    )
    parser.add_argument(
        '--stopping',
        action='store_true',
        help="Enviar STOPPING=1"
    )
    parser.add_argument(
        '--watchdog-loop',
        action='store_true',
        help="Iniciar loop de watchdog"
    )
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=DEFAULT_PORT,
        help=f"Porta para verificar (padrão: {DEFAULT_PORT})"
    )
    parser.add_argument(
        '--interval', '-i',
        type=float,
        default=WATCHDOG_INTERVAL,
        help=f"Intervalo do watchdog em segundos (padrão: {WATCHDOG_INTERVAL})"
    )
    parser.add_argument(
        '--health-check',
        action='store_true',
        help="Executar verificação de saúde"
    )
    parser.add_argument(
        '--test',
        action='store_true',
        help="Testar notificações systemd"
    )
    
    args = parser.parse_args()
    
    notifier = SystemdNotifier()
    
    # Modo de teste
    if args.test:
        print(f"{Colors.CYAN}━━━ TESTE SYSTEMD NOTIFY ━━━{Colors.RESET}\n")
        
        print(f"  NOTIFY_SOCKET: {notifier.socket_path or '(não definido)'}")
        print(f"  Notificação habilitada: {'Sim' if notifier.enabled else 'Não'}")
        
        if notifier.enabled:
            print(f"\n{Colors.BLUE}Enviando notificações de teste...{Colors.RESET}")
            
            if notifier.status("Test notification"):
                print(f"  {Colors.GREEN}✓{Colors.RESET} STATUS enviado")
            else:
                print(f"  {Colors.RED}✗{Colors.RESET} STATUS falhou")
            
            if notifier.watchdog():
                print(f"  {Colors.GREEN}✓{Colors.RESET} WATCHDOG enviado")
            else:
                print(f"  {Colors.RED}✗{Colors.RESET} WATCHDOG falhou")
        else:
            print(f"\n{Colors.YELLOW}⚠ Execute via systemd para testar notificações{Colors.RESET}")
        
        # Testar health check
        print(f"\n{Colors.BLUE}Verificando saúde do serviço...{Colors.RESET}")
        healthy, status = run_health_check(args.port)
        
        if healthy:
            print(f"  {Colors.GREEN}✓{Colors.RESET} {status}")
        else:
            print(f"  {Colors.RED}✗{Colors.RESET} {status}")
        
        return 0
    
    # Health check
    if args.health_check:
        healthy, status = run_health_check(args.port)
        print(f"{'Healthy' if healthy else 'Unhealthy'}: {status}")
        return 0 if healthy else 1
    
    # Watchdog loop
    if args.watchdog_loop:
        watchdog_loop(args.port, args.interval)
        return 0
    
    # Comandos simples
    if args.ready:
        success = notifier.ready()
        print(f"READY=1 {'enviado' if success else 'falhou'}")
        return 0 if success else 1
    
    if args.status:
        success = notifier.status(args.status)
        print(f"STATUS={args.status} {'enviado' if success else 'falhou'}")
        return 0 if success else 1
    
    if args.watchdog:
        success = notifier.watchdog()
        print(f"WATCHDOG=1 {'enviado' if success else 'falhou'}")
        return 0 if success else 1
    
    if args.stopping:
        success = notifier.stopping()
        print(f"STOPPING=1 {'enviado' if success else 'falhou'}")
        return 0 if success else 1
    
    # Sem argumentos - mostrar ajuda
    parser.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
