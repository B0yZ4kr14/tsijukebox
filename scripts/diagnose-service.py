#!/usr/bin/env python3
"""
TSiJUKEBOX Service Diagnostics v6.0.0
=====================================
Comprehensive service health checker with auto-fix capabilities.

USO:
    sudo python3 diagnose-service.py
    sudo python3 diagnose-service.py --auto-fix
    sudo python3 diagnose-service.py --verbose

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import argparse
import subprocess
import json
import socket
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

VERSION = "6.0.0"

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
    DIM = '\033[2m'


# =============================================================================
# DATACLASSES
# =============================================================================

@dataclass
class ServiceStatus:
    """Status de um serviço systemd."""
    name: str
    active: bool
    enabled: bool
    status: str
    pid: Optional[int] = None
    memory: Optional[str] = None
    uptime: Optional[str] = None
    error: Optional[str] = None


@dataclass
class DiagnosticResult:
    """Resultado de um teste diagnóstico."""
    name: str
    passed: bool
    message: str
    auto_fixable: bool = False
    fix_command: Optional[str] = None


# =============================================================================
# LOGGING
# =============================================================================

def log_info(msg: str, verbose: bool = True):
    if verbose:
        print(f"{Colors.BLUE}ℹ{Colors.RESET}  {msg}")


def log_success(msg: str):
    print(f"{Colors.GREEN}✓{Colors.RESET}  {msg}")


def log_warning(msg: str):
    print(f"{Colors.YELLOW}⚠{Colors.RESET}  {msg}")


def log_error(msg: str):
    print(f"{Colors.RED}✗{Colors.RESET}  {msg}")


def log_step(current: int, total: int, msg: str):
    print(f"{Colors.CYAN}[{current}/{total}]{Colors.RESET} {msg}")


# =============================================================================
# UTILITIES
# =============================================================================

def run_command(cmd: List[str], capture: bool = True) -> Tuple[int, str, str]:
    """Executa comando e retorna (code, stdout, stderr)."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            timeout=30
        )
        return result.returncode, result.stdout or "", result.stderr or ""
    except subprocess.TimeoutExpired:
        return 1, "", "Command timed out"
    except FileNotFoundError:
        return 1, "", f"Command not found: {cmd[0]}"
    except Exception as e:
        return 1, "", str(e)


def check_port(port: int, host: str = "127.0.0.1") -> bool:
    """Verifica se uma porta está aberta."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False


# =============================================================================
# SERVICE CHECKS
# =============================================================================

def get_service_status(service_name: str) -> ServiceStatus:
    """Obtém status detalhado de um serviço systemd."""
    # Verificar se está ativo
    code, stdout, _ = run_command(["systemctl", "is-active", service_name])
    active = code == 0
    status_text = stdout.strip() if stdout else "unknown"
    
    # Verificar se está habilitado
    code, stdout, _ = run_command(["systemctl", "is-enabled", service_name])
    enabled = code == 0
    
    # Obter detalhes (PID, memória, etc.)
    code, stdout, stderr = run_command([
        "systemctl", "show", service_name,
        "--property=MainPID,MemoryCurrent,ActiveEnterTimestamp"
    ])
    
    pid = None
    memory = None
    uptime = None
    
    if code == 0 and stdout:
        for line in stdout.strip().split('\n'):
            if line.startswith('MainPID='):
                try:
                    pid = int(line.split('=')[1])
                except ValueError:
                    pass
            elif line.startswith('MemoryCurrent='):
                try:
                    bytes_val = int(line.split('=')[1])
                    memory = f"{bytes_val / (1024*1024):.1f} MB"
                except ValueError:
                    pass
            elif line.startswith('ActiveEnterTimestamp='):
                uptime = line.split('=')[1].strip()
    
    return ServiceStatus(
        name=service_name,
        active=active,
        enabled=enabled,
        status=status_text,
        pid=pid if pid and pid > 0 else None,
        memory=memory,
        uptime=uptime,
        error=stderr if not active and stderr else None
    )


def get_service_logs(service_name: str, lines: int = 20) -> str:
    """Obtém logs recentes de um serviço."""
    code, stdout, _ = run_command([
        "journalctl", "-u", service_name, "-n", str(lines), "--no-pager"
    ])
    return stdout if code == 0 else ""


# =============================================================================
# DIAGNOSTIC TESTS
# =============================================================================

def check_systemd() -> DiagnosticResult:
    """Verifica se systemd está funcionando."""
    code, _, _ = run_command(["systemctl", "--version"])
    if code == 0:
        return DiagnosticResult("systemd", True, "systemd está funcionando")
    return DiagnosticResult("systemd", False, "systemd não encontrado ou não funcional")


def check_network() -> DiagnosticResult:
    """Verifica conectividade de rede."""
    code, _, _ = run_command(["ping", "-c", "1", "-W", "2", "1.1.1.1"])
    if code == 0:
        return DiagnosticResult("Rede", True, "Conectividade OK")
    return DiagnosticResult("Rede", False, "Sem conectividade de rede")


def check_dns() -> DiagnosticResult:
    """Verifica resolução DNS."""
    code, _, _ = run_command(["host", "github.com"])
    if code == 0:
        return DiagnosticResult("DNS", True, "Resolução DNS OK")
    return DiagnosticResult("DNS", False, "Resolução DNS falhou", 
                           auto_fixable=True, 
                           fix_command="echo 'nameserver 1.1.1.1' | sudo tee /etc/resolv.conf")


def check_nodejs() -> DiagnosticResult:
    """Verifica instalação do Node.js."""
    code, stdout, _ = run_command(["node", "--version"])
    if code == 0:
        version = stdout.strip()
        return DiagnosticResult("Node.js", True, f"Node.js {version} instalado")
    return DiagnosticResult("Node.js", False, "Node.js não encontrado",
                           auto_fixable=True,
                           fix_command="sudo pacman -S --noconfirm nodejs npm")


def check_npm() -> DiagnosticResult:
    """Verifica instalação do npm."""
    code, stdout, _ = run_command(["npm", "--version"])
    if code == 0:
        version = stdout.strip()
        return DiagnosticResult("npm", True, f"npm {version} instalado")
    return DiagnosticResult("npm", False, "npm não encontrado",
                           auto_fixable=True,
                           fix_command="sudo pacman -S --noconfirm npm")


def check_port_5173() -> DiagnosticResult:
    """Verifica se porta 5173 está disponível ou em uso pelo app."""
    if check_port(5173):
        return DiagnosticResult("Porta 5173", True, "Aplicação respondendo na porta 5173")
    return DiagnosticResult("Porta 5173", False, "Porta 5173 não está respondendo")


def check_install_dir() -> DiagnosticResult:
    """Verifica diretório de instalação."""
    install_dir = Path("/opt/tsijukebox")
    if install_dir.exists():
        return DiagnosticResult("Diretório /opt/tsijukebox", True, "Diretório existe")
    return DiagnosticResult("Diretório /opt/tsijukebox", False, "Diretório não encontrado")


def check_config() -> DiagnosticResult:
    """Verifica arquivo de configuração."""
    config_path = Path("/etc/tsijukebox/config.yaml")
    if config_path.exists():
        return DiagnosticResult("Configuração", True, f"Arquivo {config_path} existe")
    return DiagnosticResult("Configuração", False, f"Arquivo {config_path} não encontrado")


def check_database() -> DiagnosticResult:
    """Verifica banco de dados SQLite."""
    db_path = Path("/var/lib/tsijukebox/tsijukebox.db")
    if db_path.exists():
        size_mb = db_path.stat().st_size / (1024 * 1024)
        return DiagnosticResult("Database", True, f"SQLite OK ({size_mb:.2f} MB)")
    return DiagnosticResult("Database", False, "Banco de dados não encontrado")


# =============================================================================
# MAIN DIAGNOSTICS
# =============================================================================

def run_diagnostics(verbose: bool = False) -> List[DiagnosticResult]:
    """Executa todos os testes diagnósticos."""
    tests = [
        check_systemd,
        check_network,
        check_dns,
        check_nodejs,
        check_npm,
        check_port_5173,
        check_install_dir,
        check_config,
        check_database,
    ]
    
    results = []
    total = len(tests)
    
    for i, test in enumerate(tests, 1):
        if verbose:
            log_step(i, total, f"Testando: {test.__name__}")
        
        try:
            result = test()
            results.append(result)
        except Exception as e:
            results.append(DiagnosticResult(
                test.__name__,
                False,
                f"Erro: {str(e)}"
            ))
    
    return results


def check_services() -> List[ServiceStatus]:
    """Verifica status de todos os serviços TSiJUKEBOX."""
    services = [
        "tsijukebox",
        "tsijukebox-kiosk",
        "nginx",
        "avahi-daemon",
    ]
    
    statuses = []
    for service in services:
        status = get_service_status(service)
        statuses.append(status)
    
    return statuses


def apply_fix(result: DiagnosticResult) -> bool:
    """Aplica correção automática para um problema."""
    if not result.auto_fixable or not result.fix_command:
        return False
    
    log_info(f"Executando: {result.fix_command}")
    code, _, stderr = run_command(result.fix_command.split())
    
    if code == 0:
        log_success(f"Correção aplicada: {result.name}")
        return True
    else:
        log_error(f"Falha ao aplicar correção: {stderr}")
        return False


def print_report(diagnostics: List[DiagnosticResult], services: List[ServiceStatus]):
    """Imprime relatório completo de diagnóstico."""
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗
║  {Colors.WHITE}TSiJUKEBOX Service Diagnostics v{VERSION}{Colors.CYAN}                                      ║
║  {Colors.DIM}Relatório gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.CYAN}                             ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
""")
    
    # Diagnósticos do sistema
    print(f"{Colors.BOLD}📋 DIAGNÓSTICOS DO SISTEMA{Colors.RESET}")
    print("-" * 50)
    
    passed = 0
    failed = 0
    fixable = 0
    
    for result in diagnostics:
        if result.passed:
            log_success(f"{result.name}: {result.message}")
            passed += 1
        else:
            if result.auto_fixable:
                log_warning(f"{result.name}: {result.message} (auto-fix disponível)")
                fixable += 1
            else:
                log_error(f"{result.name}: {result.message}")
            failed += 1
    
    print()
    
    # Status dos serviços
    print(f"{Colors.BOLD}🔧 STATUS DOS SERVIÇOS{Colors.RESET}")
    print("-" * 50)
    
    for svc in services:
        if svc.active:
            status_icon = f"{Colors.GREEN}●{Colors.RESET}"
            status_text = f"ativo (PID: {svc.pid})" if svc.pid else "ativo"
        else:
            status_icon = f"{Colors.RED}○{Colors.RESET}"
            status_text = svc.status
        
        enabled_text = f"{Colors.GREEN}habilitado{Colors.RESET}" if svc.enabled else f"{Colors.DIM}desabilitado{Colors.RESET}"
        
        print(f"  {status_icon} {svc.name}: {status_text} [{enabled_text}]")
        
        if svc.memory:
            print(f"      Memória: {svc.memory}")
    
    print()
    
    # Resumo
    print(f"{Colors.BOLD}📊 RESUMO{Colors.RESET}")
    print("-" * 50)
    print(f"  Testes passados: {Colors.GREEN}{passed}{Colors.RESET}")
    print(f"  Testes falhados: {Colors.RED}{failed}{Colors.RESET}")
    if fixable > 0:
        print(f"  Auto-fix disponível: {Colors.YELLOW}{fixable}{Colors.RESET}")
        print(f"\n  Execute com {Colors.CYAN}--auto-fix{Colors.RESET} para corrigir automaticamente.")
    
    print()


def main() -> int:
    """Entry point principal."""
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX Service Diagnostics",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--auto-fix', '-f',
        action='store_true',
        help='Aplicar correções automáticas quando possível'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Saída detalhada'
    )
    
    parser.add_argument(
        '--json',
        action='store_true',
        help='Saída em formato JSON'
    )
    
    parser.add_argument(
        '--logs', '-l',
        type=str,
        metavar='SERVICE',
        help='Mostrar logs de um serviço específico'
    )
    
    args = parser.parse_args()
    
    # Mostrar logs de um serviço específico
    if args.logs:
        logs = get_service_logs(args.logs, 50)
        if logs:
            print(f"\n{Colors.BOLD}Logs de {args.logs}:{Colors.RESET}\n")
            print(logs)
        else:
            log_error(f"Não foi possível obter logs de {args.logs}")
        return 0
    
    # Executar diagnósticos
    diagnostics = run_diagnostics(args.verbose)
    services = check_services()
    
    # Saída JSON
    if args.json:
        output = {
            "version": VERSION,
            "timestamp": datetime.now().isoformat(),
            "diagnostics": [
                {
                    "name": d.name,
                    "passed": d.passed,
                    "message": d.message,
                    "auto_fixable": d.auto_fixable
                }
                for d in diagnostics
            ],
            "services": [
                {
                    "name": s.name,
                    "active": s.active,
                    "enabled": s.enabled,
                    "status": s.status,
                    "pid": s.pid,
                    "memory": s.memory
                }
                for s in services
            ]
        }
        print(json.dumps(output, indent=2))
        return 0
    
    # Aplicar auto-fix se solicitado
    if args.auto_fix:
        log_info("Modo auto-fix ativado")
        for result in diagnostics:
            if not result.passed and result.auto_fixable:
                apply_fix(result)
        
        # Re-executar diagnósticos após fixes
        diagnostics = run_diagnostics(args.verbose)
        services = check_services()
    
    # Imprimir relatório
    print_report(diagnostics, services)
    
    # Retornar código de erro se houver falhas
    failed = sum(1 for d in diagnostics if not d.passed)
    return 1 if failed > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
