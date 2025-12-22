#!/usr/bin/env python3
"""
TSiJUKEBOX Service Diagnostic Tool
===================================
Diagnóstico detalhado do serviço tsijukebox com logs formatados.

Uso:
    sudo python3 diagnose-service.py
    sudo python3 diagnose-service.py --errors-only
    sudo python3 diagnose-service.py --follow
    sudo python3 diagnose-service.py --rebuild
    sudo python3 diagnose-service.py --json

Autor: B0.y_Z4kr14
Licença: Domínio Público
"""

import os
import sys
import json
import argparse
import subprocess
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

# =============================================================================
# CONSTANTES
# =============================================================================

SERVICE_NAME = "tsijukebox"
INSTALL_DIR = Path("/opt/tsijukebox")
LOG_DIR = Path("/var/log/tsijukebox")
CONFIG_DIR = Path("/etc/tsijukebox")
DATA_DIR = Path("/var/lib/tsijukebox")
DEFAULT_PORT = 5173

# Cores ANSI
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    GRAY = '\033[90m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'


class LogLevel(Enum):
    ERROR = "ERROR"
    WARNING = "WARNING"
    INFO = "INFO"
    DEBUG = "DEBUG"


@dataclass
class ServiceStatus:
    """Status do serviço systemd."""
    name: str
    active: bool
    enabled: bool
    running: bool
    pid: Optional[int]
    memory_mb: Optional[float]
    uptime_seconds: Optional[int]
    exit_code: Optional[int]
    last_start: Optional[str]


@dataclass
class DiagnosticResult:
    """Resultado do diagnóstico."""
    service_status: ServiceStatus
    errors: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]
    suggestions: List[str]
    checks: Dict[str, bool]
    logs: List[Dict[str, Any]]


# Padrões de erro conhecidos
ERROR_PATTERNS = [
    {
        "pattern": r"npm ERR! Missing script:? \"?(\w+)\"?",
        "description": "Script npm não encontrado",
        "solution": "Adicione o script no package.json ou use 'npm run preview'"
    },
    {
        "pattern": r"EADDRINUSE.*:(\d+)",
        "description": "Porta já em uso",
        "solution": "Libere a porta com: sudo fuser -k {port}/tcp"
    },
    {
        "pattern": r"Cannot find module ['\"](.+?)['\"]",
        "description": "Módulo não encontrado",
        "solution": "Execute: cd /opt/tsijukebox && npm install"
    },
    {
        "pattern": r"ENOENT.*['\"](.+?)['\"]",
        "description": "Arquivo ou diretório não encontrado",
        "solution": "Verifique se o caminho existe e permissões estão corretas"
    },
    {
        "pattern": r"EACCES.*permission denied",
        "description": "Permissão negada",
        "solution": "Corrija permissões: sudo chown -R $USER:$USER /opt/tsijukebox"
    },
    {
        "pattern": r"Error: ENOSPC",
        "description": "Sem espaço em disco",
        "solution": "Libere espaço em disco ou limpe node_modules e reinstale"
    },
    {
        "pattern": r"vite.*not found|command not found.*vite",
        "description": "Vite não instalado",
        "solution": "Execute: cd /opt/tsijukebox && npm install"
    },
    {
        "pattern": r"Failed to start|failed \(Result: exit-code\)",
        "description": "Serviço falhou ao iniciar",
        "solution": "Verifique os logs acima para mais detalhes"
    },
    {
        "pattern": r"ERR_SOCKET_BAD_PORT",
        "description": "Porta inválida configurada",
        "solution": "Verifique a configuração de porta no serviço"
    },
    {
        "pattern": r"SyntaxError|TypeError|ReferenceError",
        "description": "Erro de JavaScript/TypeScript",
        "solution": "Verifique o código fonte para erros de sintaxe"
    },
]

WARNING_PATTERNS = [
    {
        "pattern": r"npm WARN",
        "description": "Aviso do npm"
    },
    {
        "pattern": r"deprecated",
        "description": "Pacote deprecado"
    },
    {
        "pattern": r"peer dep missing",
        "description": "Dependência peer faltando"
    },
]

# Mapeamento de erros para correções automáticas
AUTO_FIX_MAP = {
    "npm ERR! Missing script": {
        "description": "Script npm não encontrado",
        "fix_commands": [
            (["systemctl", "stop", "tsijukebox"], None),
            (["npm", "run", "build"], INSTALL_DIR),
            (["systemctl", "start", "tsijukebox"], None),
        ],
        "requires_root": True,
    },
    "EADDRINUSE": {
        "description": "Porta já em uso",
        "fix_function": "fix_port_in_use",
        "requires_root": True,
    },
    "Cannot find module": {
        "description": "Módulo não encontrado",
        "fix_commands": [
            (["npm", "install"], INSTALL_DIR),
        ],
        "requires_root": False,
    },
    "ENOENT": {
        "description": "Arquivo não encontrado",
        "fix_commands": [
            (["npm", "install"], INSTALL_DIR),
        ],
        "requires_root": False,
    },
    "vite.*not found": {
        "description": "Vite não instalado",
        "fix_commands": [
            (["npm", "install"], INSTALL_DIR),
        ],
        "requires_root": False,
    },
    "dist_exists": {
        "description": "Build não existe",
        "fix_commands": [
            (["npm", "run", "build"], INSTALL_DIR),
        ],
        "requires_root": False,
    },
    "node_modules_exists": {
        "description": "Dependências não instaladas",
        "fix_commands": [
            (["npm", "install"], INSTALL_DIR),
        ],
        "requires_root": False,
    },
}


# =============================================================================
# FUNÇÕES UTILITÁRIAS
# =============================================================================

def run_command(cmd: List[str], capture: bool = True, check: bool = False) -> Tuple[int, str, str]:
    """Executa um comando e retorna (código, stdout, stderr)."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture,
            text=True,
            check=check,
            timeout=30
        )
        return result.returncode, result.stdout or "", result.stderr or ""
    except subprocess.TimeoutExpired:
        return 1, "", "Comando expirou (timeout)"
    except Exception as e:
        return 1, "", str(e)


def colorize_log_line(line: str) -> str:
    """Adiciona cores a uma linha de log baseado no nível."""
    # Detectar timestamp
    timestamp_match = re.match(r'^(\w{3}\s+\d+\s+\d+:\d+:\d+|\d{4}-\d{2}-\d{2}[T\s]\d+:\d+:\d+)', line)
    
    # Detectar nível
    if any(x in line.lower() for x in ['error', 'err!', 'fatal', 'failed', 'exception']):
        color = Colors.RED
        level = "[ERROR]"
    elif any(x in line.lower() for x in ['warn', 'warning']):
        color = Colors.YELLOW
        level = "[WARN] "
    elif any(x in line.lower() for x in ['info', 'starting', 'started', 'success']):
        color = Colors.BLUE
        level = "[INFO] "
    else:
        color = Colors.GRAY
        level = "[LOG]  "
    
    if timestamp_match:
        timestamp = timestamp_match.group(1)
        rest = line[len(timestamp):]
        return f"{Colors.DIM}{timestamp}{Colors.RESET} {color}{level}{Colors.RESET}{rest.strip()}"
    
    return f"{color}{level}{Colors.RESET} {line.strip()}"


def print_header(title: str) -> None:
    """Imprime cabeçalho formatado."""
    print(f"\n{Colors.CYAN}━━━ {title} ━━━{Colors.RESET}")


def print_box(title: str, icon: str = "🔍") -> None:
    """Imprime box de título."""
    print(f"""
{Colors.CYAN}╔════════════════════════════════════════════════════════════════╗
║   {icon} {title:<55} ║
╚════════════════════════════════════════════════════════════════╝{Colors.RESET}""")


def check_mark(success: bool) -> str:
    """Retorna símbolo de check ou X."""
    return f"{Colors.GREEN}✓{Colors.RESET}" if success else f"{Colors.RED}✗{Colors.RESET}"


def warning_mark() -> str:
    """Retorna símbolo de warning."""
    return f"{Colors.YELLOW}⚠{Colors.RESET}"


# =============================================================================
# DIAGNÓSTICO
# =============================================================================

def get_service_status() -> ServiceStatus:
    """Obtém status detalhado do serviço."""
    status = ServiceStatus(
        name=SERVICE_NAME,
        active=False,
        enabled=False,
        running=False,
        pid=None,
        memory_mb=None,
        uptime_seconds=None,
        exit_code=None,
        last_start=None
    )
    
    # Verificar se está ativo
    code, stdout, _ = run_command(['systemctl', 'is-active', SERVICE_NAME])
    status.active = stdout.strip() == "active"
    status.running = status.active
    
    # Verificar se está habilitado
    code, stdout, _ = run_command(['systemctl', 'is-enabled', SERVICE_NAME])
    status.enabled = stdout.strip() == "enabled"
    
    # Obter detalhes via show
    code, stdout, _ = run_command([
        'systemctl', 'show', SERVICE_NAME,
        '--property=MainPID,MemoryCurrent,ActiveEnterTimestamp,ExecMainExitTimestamp,ExecMainStatus'
    ])
    
    for line in stdout.splitlines():
        if '=' in line:
            key, value = line.split('=', 1)
            if key == 'MainPID' and value.isdigit():
                status.pid = int(value) if int(value) > 0 else None
            elif key == 'MemoryCurrent' and value.isdigit():
                status.memory_mb = int(value) / (1024 * 1024)
            elif key == 'ActiveEnterTimestamp' and value:
                status.last_start = value
            elif key == 'ExecMainStatus' and value.isdigit():
                status.exit_code = int(value)
    
    return status


def get_service_logs(lines: int = 20, errors_only: bool = False) -> List[Dict[str, Any]]:
    """Obtém logs do serviço via journalctl."""
    logs = []
    
    cmd = ['journalctl', '-u', SERVICE_NAME, '-n', str(lines), '--no-pager', '-o', 'short-iso']
    if errors_only:
        cmd.extend(['-p', 'err'])
    
    code, stdout, _ = run_command(cmd)
    
    if code == 0 and stdout:
        for line in stdout.splitlines():
            if not line.strip() or '-- No entries --' in line:
                continue
            
            log_entry = {
                "raw": line,
                "level": LogLevel.INFO.value,
                "message": line
            }
            
            # Detectar nível
            if any(x in line.lower() for x in ['error', 'err!', 'fatal', 'failed']):
                log_entry["level"] = LogLevel.ERROR.value
            elif any(x in line.lower() for x in ['warn', 'warning']):
                log_entry["level"] = LogLevel.WARNING.value
            
            logs.append(log_entry)
    
    return logs


def analyze_logs(logs: List[Dict[str, Any]]) -> Tuple[List[Dict], List[Dict], List[str]]:
    """Analisa logs para encontrar erros e gerar sugestões."""
    errors = []
    warnings = []
    suggestions = []
    seen_suggestions = set()
    
    full_log_text = "\n".join(log["raw"] for log in logs)
    
    # Verificar padrões de erro
    for pattern_info in ERROR_PATTERNS:
        matches = re.finditer(pattern_info["pattern"], full_log_text, re.IGNORECASE)
        for match in matches:
            error = {
                "pattern": pattern_info["pattern"],
                "description": pattern_info["description"],
                "match": match.group(0),
                "solution": pattern_info["solution"]
            }
            
            # Substituir placeholders na solução
            if "{port}" in error["solution"] and len(match.groups()) > 0:
                error["solution"] = error["solution"].format(port=match.group(1))
            
            if error["description"] not in [e["description"] for e in errors]:
                errors.append(error)
                
                if error["solution"] not in seen_suggestions:
                    suggestions.append(error["solution"])
                    seen_suggestions.add(error["solution"])
    
    # Verificar padrões de warning
    for pattern_info in WARNING_PATTERNS:
        if re.search(pattern_info["pattern"], full_log_text, re.IGNORECASE):
            warnings.append({
                "description": pattern_info["description"]
            })
    
    return errors, warnings, suggestions


def run_checks() -> Dict[str, bool]:
    """Executa verificações do ambiente."""
    checks = {}
    
    # Diretório de instalação
    checks["install_dir_exists"] = INSTALL_DIR.exists()
    
    # package.json
    checks["package_json_exists"] = (INSTALL_DIR / "package.json").exists()
    
    # node_modules
    checks["node_modules_exists"] = (INSTALL_DIR / "node_modules").exists()
    
    # dist (build)
    checks["dist_exists"] = (INSTALL_DIR / "dist").exists()
    
    # Porta
    code, stdout, _ = run_command(['ss', '-tlnp'])
    checks["port_open"] = f":{DEFAULT_PORT}" in stdout
    
    # Node instalado
    code, _, _ = run_command(['which', 'node'])
    checks["node_installed"] = code == 0
    
    # npm instalado
    code, _, _ = run_command(['which', 'npm'])
    checks["npm_installed"] = code == 0
    
    # Diretórios de config/log/data
    checks["config_dir_exists"] = CONFIG_DIR.exists()
    checks["log_dir_exists"] = LOG_DIR.exists()
    checks["data_dir_exists"] = DATA_DIR.exists()
    
    return checks


def diagnose(lines: int = 20, errors_only: bool = False) -> DiagnosticResult:
    """Executa diagnóstico completo."""
    service_status = get_service_status()
    logs = get_service_logs(lines, errors_only)
    errors, warnings, suggestions = analyze_logs(logs)
    checks = run_checks()
    
    # Adicionar sugestões baseadas em checks
    if not checks.get("dist_exists"):
        if "npm run build" not in str(suggestions):
            suggestions.insert(0, "Execute: cd /opt/tsijukebox && npm run build")
    
    if not checks.get("node_modules_exists"):
        if "npm install" not in str(suggestions):
            suggestions.insert(0, "Execute: cd /opt/tsijukebox && npm install")
    
    if not service_status.running and not errors:
        suggestions.append("Inicie o serviço: sudo systemctl start tsijukebox")
    
    return DiagnosticResult(
        service_status=service_status,
        errors=errors,
        warnings=warnings,
        suggestions=suggestions,
        checks=checks,
        logs=logs
    )


# =============================================================================
# AUTO-FIX
# =============================================================================

def fix_port_in_use(port: int = DEFAULT_PORT) -> Tuple[bool, str]:
    """Libera uma porta em uso."""
    import time
    
    code, stdout, _ = run_command(['fuser', f'{port}/tcp'])
    if code != 0:
        return False, f"Nenhum processo encontrado na porta {port}"
    
    code, _, stderr = run_command(['fuser', '-k', f'{port}/tcp'])
    if code == 0:
        time.sleep(1)
        return True, f"Porta {port} liberada"
    else:
        return False, f"Falha ao liberar porta: {stderr}"


def apply_single_fix(fix_info: Dict[str, Any], dry_run: bool = False) -> Tuple[bool, str]:
    """Aplica uma única correção."""
    if "fix_function" in fix_info:
        func_name = fix_info["fix_function"]
        if func_name == "fix_port_in_use":
            if dry_run:
                return True, f"[DRY-RUN] fuser -k {DEFAULT_PORT}/tcp"
            return fix_port_in_use()
        return False, f"Função desconhecida: {func_name}"
    
    if "fix_commands" in fix_info:
        results = []
        for cmd, cwd in fix_info["fix_commands"]:
            cmd_str = " ".join(cmd)
            if cwd:
                cmd_str = f"(cd {cwd}) {cmd_str}"
            
            if dry_run:
                results.append(f"[DRY-RUN] {cmd_str}")
                continue
            
            try:
                kwargs = {"capture_output": True, "text": True, "timeout": 300}
                if cwd:
                    kwargs["cwd"] = str(cwd)
                
                result = subprocess.run(cmd, **kwargs)
                if result.returncode != 0:
                    return False, f"Falhou: {cmd_str}\n{result.stderr[:200]}"
                results.append(f"OK: {cmd_str}")
            except Exception as e:
                return False, f"Erro: {cmd_str} - {e}"
        
        return True, "; ".join(results)
    
    return False, "Nenhuma ação definida"


def auto_fix(result: DiagnosticResult, dry_run: bool = False) -> Tuple[int, int, List[str]]:
    """Aplica correções automáticas baseado nos erros detectados."""
    fixes_attempted = 0
    fixes_successful = 0
    fix_log = []
    
    print(f"\n{Colors.CYAN}━━━ AUTO-FIX {'(DRY-RUN)' if dry_run else ''} ━━━{Colors.RESET}")
    
    # Corrigir baseado em checks falhos
    for check_name, passed in result.checks.items():
        if not passed and check_name in AUTO_FIX_MAP:
            fixes_attempted += 1
            fix_info = AUTO_FIX_MAP[check_name]
            
            print(f"\n  {Colors.BLUE}→{Colors.RESET} Corrigindo: {fix_info['description']}")
            
            success, msg = apply_single_fix(fix_info, dry_run)
            
            if success:
                fixes_successful += 1
                print(f"    {Colors.GREEN}✓ {msg}{Colors.RESET}")
                fix_log.append(f"[OK] {check_name}: {msg}")
            else:
                print(f"    {Colors.RED}✗ {msg}{Colors.RESET}")
                fix_log.append(f"[FAIL] {check_name}: {msg}")
    
    # Corrigir baseado em erros de log
    fixed_patterns = set()
    for error in result.errors:
        match_str = error.get('match', '')
        description = error.get('description', '')
        
        for pattern, fix_info in AUTO_FIX_MAP.items():
            if pattern in fixed_patterns:
                continue
            if pattern in match_str or pattern in description:
                fixes_attempted += 1
                fixed_patterns.add(pattern)
                
                print(f"\n  {Colors.BLUE}→{Colors.RESET} Corrigindo: {fix_info['description']}")
                
                success, msg = apply_single_fix(fix_info, dry_run)
                
                if success:
                    fixes_successful += 1
                    print(f"    {Colors.GREEN}✓ {msg}{Colors.RESET}")
                    fix_log.append(f"[OK] {pattern}: {msg}")
                else:
                    print(f"    {Colors.RED}✗ {msg}{Colors.RESET}")
                    fix_log.append(f"[FAIL] {pattern}: {msg}")
                break
    
    # Resumo
    print(f"\n{Colors.CYAN}━━━ RESUMO AUTO-FIX ━━━{Colors.RESET}")
    if fixes_attempted == 0:
        print(f"  {Colors.GRAY}Nenhuma correção automática disponível{Colors.RESET}")
    else:
        print(f"  Tentativas: {fixes_attempted}")
        print(f"  Sucessos: {Colors.GREEN}{fixes_successful}{Colors.RESET}")
        print(f"  Falhas: {Colors.RED}{fixes_attempted - fixes_successful}{Colors.RESET}")
    
    if not dry_run and fixes_successful > 0:
        print(f"\n{Colors.YELLOW}💡 Execute novamente o diagnóstico para verificar{Colors.RESET}")
    
    return fixes_attempted, fixes_successful, fix_log


# =============================================================================
# OUTPUT
# =============================================================================

def print_diagnostic(result: DiagnosticResult, show_logs: bool = True) -> None:
    """Imprime resultado do diagnóstico formatado."""
    print_box("DIAGNÓSTICO: SERVIÇO TSIJUKEBOX")
    
    # Status do serviço
    print_header("STATUS DO SERVIÇO")
    s = result.service_status
    
    status_text = f"{Colors.GREEN}active (running){Colors.RESET}" if s.running else f"{Colors.RED}inactive (dead){Colors.RESET}"
    print(f"  ● Serviço: {s.name}.service")
    print(f"  ● Status: {status_text}")
    print(f"  ● Habilitado: {'yes' if s.enabled else 'no'}")
    
    if s.pid:
        print(f"  ● PID: {s.pid}")
    if s.memory_mb:
        print(f"  ● Memória: {s.memory_mb:.1f} MB")
    if s.last_start:
        print(f"  ● Última execução: {s.last_start}")
    if s.exit_code is not None and not s.running:
        print(f"  ● Código de saída: {s.exit_code}")
    
    # Verificações
    print_header("VERIFICAÇÕES")
    for check, passed in result.checks.items():
        label = check.replace('_', ' ').title()
        print(f"  {check_mark(passed)} {label}")
    
    # Logs
    if show_logs and result.logs:
        print_header(f"ÚLTIMOS LOGS ({len(result.logs)} linhas)")
        for log in result.logs[-15:]:  # Últimas 15 linhas
            print(f"  {colorize_log_line(log['raw'])}")
    
    # Erros encontrados
    if result.errors:
        print_header("ERROS DETECTADOS")
        for error in result.errors:
            print(f"  {Colors.RED}✗{Colors.RESET} {error['description']}")
            print(f"    {Colors.DIM}Padrão: {error['match'][:80]}{Colors.RESET}")
    
    # Warnings
    if result.warnings:
        print_header("AVISOS")
        for warning in result.warnings:
            print(f"  {warning_mark()} {warning['description']}")
    
    # Sugestões
    if result.suggestions:
        print_header("SOLUÇÕES SUGERIDAS")
        for i, suggestion in enumerate(result.suggestions[:5], 1):
            print(f"  {Colors.CYAN}{i}.{Colors.RESET} {suggestion}")
    
    # Resumo
    print()
    if not result.errors and result.service_status.running:
        print(f"{Colors.GREEN}✓ Serviço funcionando corretamente{Colors.RESET}")
    elif result.errors:
        print(f"{Colors.RED}✗ {len(result.errors)} erro(s) encontrado(s){Colors.RESET}")
    else:
        print(f"{Colors.YELLOW}⚠ Serviço não está rodando{Colors.RESET}")


def print_json(result: DiagnosticResult) -> None:
    """Imprime resultado em JSON."""
    output = {
        "service_status": asdict(result.service_status),
        "errors": result.errors,
        "warnings": result.warnings,
        "suggestions": result.suggestions,
        "checks": result.checks,
        "logs": result.logs[-50:],  # Limitar logs
        "timestamp": datetime.now().isoformat()
    }
    print(json.dumps(output, indent=2, default=str))


def follow_logs() -> None:
    """Segue logs em tempo real."""
    print(f"{Colors.CYAN}Seguindo logs do serviço {SERVICE_NAME}...{Colors.RESET}")
    print(f"{Colors.DIM}Pressione Ctrl+C para sair{Colors.RESET}\n")
    
    try:
        process = subprocess.Popen(
            ['journalctl', '-u', SERVICE_NAME, '-f', '--no-pager', '-o', 'short-iso'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        for line in iter(process.stdout.readline, ''):
            print(colorize_log_line(line))
            
    except KeyboardInterrupt:
        print(f"\n{Colors.CYAN}Logs interrompidos{Colors.RESET}")
    finally:
        if process:
            process.terminate()


def rebuild_service() -> bool:
    """Reconstrói e reinicia o serviço."""
    print(f"{Colors.CYAN}Reconstruindo serviço...{Colors.RESET}\n")
    
    steps = [
        ("Parando serviço", ['systemctl', 'stop', SERVICE_NAME]),
        ("Instalando dependências", ['npm', 'install'], INSTALL_DIR),
        ("Construindo aplicação", ['npm', 'run', 'build'], INSTALL_DIR),
        ("Iniciando serviço", ['systemctl', 'start', SERVICE_NAME]),
    ]
    
    for step_name, cmd, *cwd in steps:
        print(f"  {Colors.BLUE}→{Colors.RESET} {step_name}...")
        
        kwargs = {"capture_output": True, "text": True}
        if cwd:
            kwargs["cwd"] = str(cwd[0])
        
        try:
            result = subprocess.run(cmd, **kwargs, timeout=300)
            if result.returncode != 0:
                print(f"    {Colors.RED}✗ Falhou{Colors.RESET}")
                if result.stderr:
                    print(f"    {Colors.DIM}{result.stderr[:200]}{Colors.RESET}")
                return False
            print(f"    {Colors.GREEN}✓ OK{Colors.RESET}")
        except Exception as e:
            print(f"    {Colors.RED}✗ Erro: {e}{Colors.RESET}")
            return False
    
    print(f"\n{Colors.GREEN}✓ Serviço reconstruído com sucesso!{Colors.RESET}")
    
    # Verificar status
    import time
    time.sleep(3)
    
    code, stdout, _ = run_command(['systemctl', 'is-active', SERVICE_NAME])
    if stdout.strip() == "active":
        print(f"{Colors.GREEN}✓ Serviço está rodando{Colors.RESET}")
        return True
    else:
        print(f"{Colors.YELLOW}⚠ Serviço pode não ter iniciado corretamente{Colors.RESET}")
        print(f"  Execute: sudo python3 {__file__}")
        return False


# =============================================================================
# MAIN
# =============================================================================

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Diagnóstico do serviço TSiJUKEBOX",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--lines', '-n',
        type=int,
        default=20,
        help="Número de linhas de log para analisar (padrão: 20)"
    )
    parser.add_argument(
        '--errors-only', '-e',
        action='store_true',
        help="Mostrar apenas erros"
    )
    parser.add_argument(
        '--follow', '-f',
        action='store_true',
        help="Seguir logs em tempo real"
    )
    parser.add_argument(
        '--rebuild', '-r',
        action='store_true',
        help="Reconstruir e reiniciar o serviço"
    )
    parser.add_argument(
        '--json', '-j',
        action='store_true',
        help="Output em formato JSON"
    )
    parser.add_argument(
        '--no-logs',
        action='store_true',
        help="Não mostrar logs"
    )
    parser.add_argument(
        '--auto-fix', '-a',
        action='store_true',
        help="Aplicar correções automaticamente baseado nos erros"
    )
    parser.add_argument(
        '--fix-dry-run',
        action='store_true',
        help="Simular correções sem executar"
    )
    
    args = parser.parse_args()
    
    # Verificar permissões para alguns comandos
    if (args.rebuild or args.auto_fix) and os.geteuid() != 0:
        print(f"{Colors.RED}Erro: --rebuild/--auto-fix requer privilégios de root{Colors.RESET}")
        print(f"Execute: sudo python3 {__file__} --auto-fix")
        return 1
    
    if args.follow:
        follow_logs()
        return 0
    
    if args.rebuild:
        success = rebuild_service()
        return 0 if success else 1
    
    # Diagnóstico padrão
    result = diagnose(lines=args.lines, errors_only=args.errors_only)
    
    if args.json:
        print_json(result)
    else:
        print_diagnostic(result, show_logs=not args.no_logs)
    
    # Auto-fix
    if args.auto_fix or args.fix_dry_run:
        attempted, successful, log = auto_fix(result, dry_run=args.fix_dry_run)
        if attempted > 0 and not args.fix_dry_run:
            return 0 if successful == attempted else 1
    else:
        print_diagnostic(result, show_logs=not args.no_logs)
    
    # Código de saída baseado em erros
    if result.errors:
        return 1
    if not result.service_status.running:
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
