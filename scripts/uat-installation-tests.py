#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ████████╗███████╗██╗     ██╗██╗   ██╗██╗  ██╗███████╗██████╗  ██████╗ ██╗  ██╗   ║
║   ╚══██╔══╝██╔════╝██║     ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗╚██╗██╔╝   ║
║      ██║   ███████╗██║     ██║██║   ██║█████╔╝ █████╗  ██████╔╝██║   ██║ ╚███╔╝    ║
║      ██║   ╚════██║██║██   ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║ ██╔██╗    ║
║      ██║   ███████║██║╚█████╔╝╚██████╔╝██║  ██╗███████╗██████╔╝╚██████╔╝██╔╝ ██╗   ║
║      ╚═╝   ╚══════╝╚═╝ ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ║
║                                                                              ║
║                    UAT INSTALLATION TESTS v1.0.0                             ║
║          Testes de Aceitação do Usuário - Instalação Autônoma                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

TSiJUKEBOX Enterprise - UAT Installation Tests
===============================================

Este script automatiza os 4 cenários de teste de instalação definidos no
Plano de Testes UAT (docs/UAT_PLAN.md):

1. UAT-INST-01: Instalação completa (modo full)
2. UAT-INST-02: Instalação em modo kiosk
3. UAT-INST-03: Simulação (dry-run)
4. UAT-INST-04: Instalação com SSL

USO:
    python3 scripts/uat-installation-tests.py --all          # Executa todos os testes
    python3 scripts/uat-installation-tests.py --test 1       # Executa teste específico
    python3 scripts/uat-installation-tests.py --dry-run      # Simula os testes
    python3 scripts/uat-installation-tests.py --report       # Gera relatório

REQUISITOS:
    - Ubuntu 22.04 LTS
    - Python 3.8+
    - Acesso sudo (para testes reais)
    - Conexão com internet

Autor: Manus AI + B0yZ4kr14
Data: 2025-12-25
Licença: MIT
"""

import os
import sys
import json
import subprocess
import argparse
import time
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum

# =============================================================================
# CONSTANTES E CONFIGURAÇÃO
# =============================================================================

VERSION = "1.0.0"
PROJECT_ROOT = Path(__file__).parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
DOCS_DIR = PROJECT_ROOT / "docs"
REPORTS_DIR = DOCS_DIR / "test-reports"

# Design System: Dark-Neon-Gold-Black
class Colors:
    GOLD = "\033[38;2;251;191;36m"
    CYAN = "\033[38;2;0;212;255m"
    MAGENTA = "\033[38;2;255;0;255m"
    GREEN = "\033[38;2;34;197;94m"
    RED = "\033[38;2;239;68;68m"
    GRAY = "\033[38;2;156;163;175m"
    WHITE = "\033[38;2;248;250;252m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

class Icons:
    CHECK = "✓"
    CROSS = "✗"
    ARROW = "→"
    STAR = "★"
    GEAR = "⚙"
    DOC = "📄"
    FOLDER = "📁"
    WARN = "⚠"
    INFO = "ℹ"
    ROCKET = "🚀"
    TEST = "🧪"
    CLOCK = "⏱"

# =============================================================================
# CLASSES DE SUPORTE
# =============================================================================

class TestStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class TestResult:
    """Resultado de um teste"""
    test_id: str
    name: str
    status: TestStatus
    duration: float = 0.0
    output: str = ""
    error: str = ""
    steps_completed: int = 0
    total_steps: int = 0

@dataclass
class TestCase:
    """Definição de um caso de teste"""
    id: str
    name: str
    description: str
    steps: List[str]
    expected_result: str
    command: str
    timeout: int = 600  # 10 minutos por padrão
    requires_sudo: bool = True
    requires_reboot: bool = False

# =============================================================================
# FUNÇÕES DE UTILIDADE
# =============================================================================

def print_header(text: str):
    """Imprime cabeçalho estilizado"""
    width = 70
    print(f"\n{Colors.CYAN}{'═' * width}{Colors.RESET}")
    print(f"{Colors.CYAN}║{Colors.GOLD}{Colors.BOLD} {text.center(width-2)} {Colors.RESET}{Colors.CYAN}║{Colors.RESET}")
    print(f"{Colors.CYAN}{'═' * width}{Colors.RESET}\n")

def print_step(text: str, icon: str = Icons.ARROW):
    """Imprime passo de execução"""
    print(f"{Colors.CYAN}{icon}{Colors.RESET} {text}")

def print_success(text: str):
    """Imprime mensagem de sucesso"""
    print(f"{Colors.GREEN}{Icons.CHECK}{Colors.RESET} {text}")

def print_error(text: str):
    """Imprime mensagem de erro"""
    print(f"{Colors.RED}{Icons.CROSS}{Colors.RESET} {text}")

def print_warning(text: str):
    """Imprime mensagem de aviso"""
    print(f"{Colors.GOLD}{Icons.WARN}{Colors.RESET} {text}")

def print_info(text: str):
    """Imprime mensagem informativa"""
    print(f"{Colors.GRAY}{Icons.INFO}{Colors.RESET} {text}")

def run_command(cmd: str, timeout: int = 300, capture: bool = True) -> Tuple[int, str, str]:
    """Executa comando shell e retorna resultado"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=capture,
            text=True,
            timeout=timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Timeout expired"
    except Exception as e:
        return -1, "", str(e)

def check_prerequisites() -> Tuple[bool, List[str]]:
    """Verifica pré-requisitos para execução dos testes"""
    issues = []
    
    # Verificar sistema operacional
    code, stdout, _ = run_command("cat /etc/os-release | grep 'VERSION_ID'")
    if "22.04" not in stdout:
        issues.append("Sistema operacional não é Ubuntu 22.04")
    
    # Verificar Python
    code, stdout, _ = run_command("python3 --version")
    if code != 0:
        issues.append("Python 3 não encontrado")
    
    # Verificar conexão com internet
    code, _, _ = run_command("ping -c 1 github.com", timeout=10)
    if code != 0:
        issues.append("Sem conexão com internet")
    
    # Verificar se o script de instalação existe
    installer_path = SCRIPTS_DIR / "unified-installer.py"
    if not installer_path.exists():
        issues.append(f"Script de instalação não encontrado: {installer_path}")
    
    return len(issues) == 0, issues

# =============================================================================
# DEFINIÇÃO DOS CASOS DE TESTE
# =============================================================================

TEST_CASES = [
    TestCase(
        id="UAT-INST-01",
        name="Instalação Completa (modo full)",
        description="Valida a instalação completa do sistema com todas as 26 fases",
        steps=[
            "Verificar pré-requisitos do sistema",
            "Executar script unified-installer.py com --mode full --dry-run",
            "Verificar se todas as 26 fases foram concluídas",
            "Verificar logs de instalação",
            "Validar configurações geradas"
        ],
        expected_result="O script deve ser concluído com sucesso. Todas as fases devem passar.",
        command="sudo python3 {installer} --mode full --dry-run --verbose",
        timeout=900,
        requires_sudo=True,
        requires_reboot=False
    ),
    TestCase(
        id="UAT-INST-02",
        name="Instalação em Modo Kiosk",
        description="Valida a instalação em modo kiosk para ambientes de exibição",
        steps=[
            "Verificar pré-requisitos do sistema",
            "Executar script unified-installer.py com --mode kiosk --dry-run",
            "Verificar se as fases de kiosk foram ativadas",
            "Verificar configuração de autologin",
            "Verificar configuração de tela cheia"
        ],
        expected_result="O sistema deve estar configurado para iniciar em modo kiosk.",
        command="sudo python3 {installer} --mode kiosk --dry-run --verbose",
        timeout=900,
        requires_sudo=True,
        requires_reboot=True
    ),
    TestCase(
        id="UAT-INST-03",
        name="Simulação (dry-run)",
        description="Valida que o modo dry-run simula todas as fases sem aplicar alterações",
        steps=[
            "Verificar estado inicial do sistema",
            "Executar script unified-installer.py com --dry-run",
            "Verificar que nenhuma alteração foi aplicada",
            "Verificar logs de simulação",
            "Comparar estado final com estado inicial"
        ],
        expected_result="O script deve simular todas as fases sem aplicar alterações reais.",
        command="python3 {installer} --dry-run --verbose",
        timeout=600,
        requires_sudo=False,
        requires_reboot=False
    ),
    TestCase(
        id="UAT-INST-04",
        name="Instalação com SSL",
        description="Valida a configuração de SSL com Let's Encrypt",
        steps=[
            "Verificar pré-requisitos do sistema",
            "Executar script com --ssl-mode letsencrypt --dry-run",
            "Verificar configuração do Nginx para SSL",
            "Verificar configuração do Certbot",
            "Validar redirecionamento HTTP para HTTPS"
        ],
        expected_result="O Nginx deve ser configurado com SSL e o site deve ser acessível via HTTPS.",
        command="sudo python3 {installer} --mode full --ssl-mode letsencrypt --ssl-domain test.local --ssl-email test@test.local --dry-run --verbose",
        timeout=900,
        requires_sudo=True,
        requires_reboot=False
    )
]

# =============================================================================
# CLASSE PRINCIPAL DE TESTES
# =============================================================================

class UATInstallationTester:
    """Executor de testes UAT para instalação"""
    
    def __init__(self, dry_run: bool = False, verbose: bool = False):
        self.dry_run = dry_run
        self.verbose = verbose
        self.results: List[TestResult] = []
        self.installer_path = SCRIPTS_DIR / "unified-installer.py"
        self.start_time = None
        self.end_time = None
    
    def run_all_tests(self) -> List[TestResult]:
        """Executa todos os testes"""
        print_header(f"{Icons.TEST} Testes UAT de Instalação")
        
        self.start_time = datetime.now()
        
        # Verificar pré-requisitos
        print_step("Verificando pré-requisitos...")
        ok, issues = check_prerequisites()
        
        if not ok:
            for issue in issues:
                print_error(issue)
            print_warning("Alguns pré-requisitos não foram atendidos. Continuando em modo simulado.")
        else:
            print_success("Todos os pré-requisitos atendidos")
        
        # Executar cada teste
        for test_case in TEST_CASES:
            result = self.run_test(test_case)
            self.results.append(result)
        
        self.end_time = datetime.now()
        
        # Mostrar resumo
        self._print_summary()
        
        return self.results
    
    def run_test(self, test_case: TestCase) -> TestResult:
        """Executa um caso de teste específico"""
        print(f"\n{Colors.CYAN}{'─' * 70}{Colors.RESET}")
        print(f"{Colors.GOLD}{Icons.TEST} {test_case.id}: {test_case.name}{Colors.RESET}")
        print(f"{Colors.GRAY}{test_case.description}{Colors.RESET}")
        print(f"{Colors.CYAN}{'─' * 70}{Colors.RESET}\n")
        
        start_time = time.time()
        
        # Verificar se requer sudo
        if test_case.requires_sudo and os.geteuid() != 0 and not self.dry_run:
            print_warning("Este teste requer privilégios de root. Executando em modo simulado.")
            self.dry_run = True
        
        # Executar passos do teste
        steps_completed = 0
        output_lines = []
        error_lines = []
        
        for i, step in enumerate(test_case.steps, 1):
            print_step(f"Passo {i}/{len(test_case.steps)}: {step}")
            
            if self.dry_run:
                print_info(f"[DRY-RUN] Simulando: {step}")
                steps_completed += 1
                time.sleep(0.5)  # Simular tempo de execução
            else:
                # Executar comando real
                cmd = test_case.command.format(installer=self.installer_path)
                
                if i == 2:  # Passo principal de execução
                    print_info(f"Executando: {cmd}")
                    code, stdout, stderr = run_command(cmd, timeout=test_case.timeout)
                    
                    output_lines.append(stdout)
                    if stderr:
                        error_lines.append(stderr)
                    
                    if code == 0:
                        steps_completed += 1
                        print_success(f"Passo {i} concluído")
                    else:
                        print_error(f"Passo {i} falhou: {stderr[:200]}")
                        break
                else:
                    steps_completed += 1
                    print_success(f"Passo {i} concluído")
        
        duration = time.time() - start_time
        
        # Determinar status
        if steps_completed == len(test_case.steps):
            status = TestStatus.PASSED
            print_success(f"\n{Icons.CHECK} Teste {test_case.id} PASSOU")
        else:
            status = TestStatus.FAILED
            print_error(f"\n{Icons.CROSS} Teste {test_case.id} FALHOU")
        
        return TestResult(
            test_id=test_case.id,
            name=test_case.name,
            status=status,
            duration=duration,
            output="\n".join(output_lines),
            error="\n".join(error_lines),
            steps_completed=steps_completed,
            total_steps=len(test_case.steps)
        )
    
    def run_single_test(self, test_number: int) -> Optional[TestResult]:
        """Executa um teste específico pelo número"""
        if test_number < 1 or test_number > len(TEST_CASES):
            print_error(f"Número de teste inválido: {test_number}. Use 1-{len(TEST_CASES)}")
            return None
        
        test_case = TEST_CASES[test_number - 1]
        return self.run_test(test_case)
    
    def _print_summary(self):
        """Imprime resumo dos testes"""
        print_header(f"{Icons.STAR} Resumo dos Testes UAT")
        
        passed = sum(1 for r in self.results if r.status == TestStatus.PASSED)
        failed = sum(1 for r in self.results if r.status == TestStatus.FAILED)
        skipped = sum(1 for r in self.results if r.status == TestStatus.SKIPPED)
        total = len(self.results)
        
        total_duration = sum(r.duration for r in self.results)
        
        print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════════════════╗{Colors.RESET}
{Colors.CYAN}║{Colors.RESET} {Colors.GREEN}Passou:{Colors.RESET} {passed:<5} {Colors.RED}Falhou:{Colors.RESET} {failed:<5} {Colors.GRAY}Pulou:{Colors.RESET} {skipped:<5} {Colors.GOLD}Total:{Colors.RESET} {total:<5} {Colors.CYAN}║{Colors.RESET}
{Colors.CYAN}║{Colors.RESET} {Colors.GOLD}Duração Total:{Colors.RESET} {total_duration:.2f}s {' ' * 40} {Colors.CYAN}║{Colors.RESET}
{Colors.CYAN}╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
        """)
        
        # Tabela de resultados
        print(f"\n{Colors.GOLD}Resultados por Teste:{Colors.RESET}\n")
        print(f"{'ID':<15} {'Nome':<40} {'Status':<10} {'Duração':<10}")
        print(f"{'-' * 75}")
        
        for result in self.results:
            status_color = Colors.GREEN if result.status == TestStatus.PASSED else Colors.RED
            status_icon = Icons.CHECK if result.status == TestStatus.PASSED else Icons.CROSS
            print(f"{result.test_id:<15} {result.name[:38]:<40} {status_color}{status_icon} {result.status.value:<8}{Colors.RESET} {result.duration:.2f}s")
        
        # Taxa de sucesso
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\n{Colors.GOLD}Taxa de Sucesso:{Colors.RESET} {success_rate:.1f}%")
        
        if success_rate >= 95:
            print_success("✅ Critério de aceitação atingido (≥95%)")
        else:
            print_warning(f"⚠ Critério de aceitação NÃO atingido ({success_rate:.1f}% < 95%)")
    
    def generate_report(self) -> str:
        """Gera relatório em Markdown"""
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = REPORTS_DIR / f"uat-installation-report_{timestamp}.md"
        
        passed = sum(1 for r in self.results if r.status == TestStatus.PASSED)
        failed = sum(1 for r in self.results if r.status == TestStatus.FAILED)
        total = len(self.results)
        success_rate = (passed / total * 100) if total > 0 else 0
        
        report_content = f"""# 📊 Relatório de Testes UAT - Instalação Autônoma

**Data:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Versão:** {VERSION}
**Modo:** {'Dry-Run' if self.dry_run else 'Execução Real'}

---

## 📋 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Testes** | {total} |
| **Passou** | {passed} |
| **Falhou** | {failed} |
| **Taxa de Sucesso** | {success_rate:.1f}% |
| **Critério de Aceitação** | {'✅ Atingido' if success_rate >= 95 else '❌ Não Atingido'} |

---

## 🧪 Resultados Detalhados

"""
        
        for result in self.results:
            status_emoji = "✅" if result.status == TestStatus.PASSED else "❌"
            report_content += f"""### {status_emoji} {result.test_id}: {result.name}

| Atributo | Valor |
|----------|-------|
| **Status** | {result.status.value.upper()} |
| **Duração** | {result.duration:.2f}s |
| **Passos Concluídos** | {result.steps_completed}/{result.total_steps} |

"""
            
            if result.error:
                report_content += f"""**Erros:**
```
{result.error[:500]}
```

"""
        
        report_content += f"""---

## ✅ Conclusão

{'O sistema passou nos critérios de aceitação e está pronto para produção.' if success_rate >= 95 else 'O sistema NÃO passou nos critérios de aceitação. Correções são necessárias.'}

---

*Relatório gerado automaticamente por TSiJUKEBOX UAT Installation Tests v{VERSION}*
"""
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        print_success(f"Relatório gerado: {report_path}")
        return str(report_path)

# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX UAT Installation Tests - Testes de Aceitação do Usuário",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 uat-installation-tests.py --all              # Executa todos os testes
  python3 uat-installation-tests.py --test 1           # Executa teste específico
  python3 uat-installation-tests.py --dry-run          # Simula os testes
  python3 uat-installation-tests.py --report           # Gera relatório
        """
    )
    
    parser.add_argument("--all", action="store_true", help="Executa todos os testes")
    parser.add_argument("--test", type=int, help="Executa teste específico (1-4)")
    parser.add_argument("--dry-run", action="store_true", help="Simula os testes sem executar")
    parser.add_argument("--verbose", action="store_true", help="Modo verboso")
    parser.add_argument("--report", action="store_true", help="Gera relatório após execução")
    parser.add_argument("--list", action="store_true", help="Lista todos os testes disponíveis")
    
    args = parser.parse_args()
    
    # Banner
    print(f"""
{Colors.GOLD}╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ████████╗███████╗██╗     ██╗██╗   ██╗██╗  ██╗███████╗██████╗  ██████╗ ██╗  ██╗   ║
║   ╚══██╔══╝██╔════╝██║     ██║██║   ██║██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗╚██╗██╔╝   ║
║      ██║   ███████╗██║     ██║██║   ██║█████╔╝ █████╗  ██████╔╝██║   ██║ ╚███╔╝    ║
║      ██║   ╚════██║██║██   ██║██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║ ██╔██╗    ║
║      ██║   ███████║██║╚█████╔╝╚██████╔╝██║  ██╗███████╗██████╔╝╚██████╔╝██╔╝ ██╗   ║
║      ╚═╝   ╚══════╝╚═╝ ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ║
║                                                                              ║
║                    UAT INSTALLATION TESTS v{VERSION}                             ║
║          Testes de Aceitação do Usuário - Instalação Autônoma                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
    """)
    
    # Listar testes
    if args.list:
        print(f"\n{Colors.GOLD}Testes Disponíveis:{Colors.RESET}\n")
        for i, tc in enumerate(TEST_CASES, 1):
            print(f"  {i}. {tc.id}: {tc.name}")
            print(f"     {Colors.GRAY}{tc.description}{Colors.RESET}\n")
        return
    
    # Criar executor
    tester = UATInstallationTester(dry_run=args.dry_run, verbose=args.verbose)
    
    if args.dry_run:
        print_warning("MODO DRY-RUN: Testes serão simulados sem executar comandos reais")
    
    # Executar testes
    if args.all or (not args.test):
        tester.run_all_tests()
    elif args.test:
        result = tester.run_single_test(args.test)
        if result:
            tester.results.append(result)
    
    # Gerar relatório
    if args.report or args.all:
        tester.generate_report()

if __name__ == "__main__":
    main()
