#!/usr/bin/env python3
"""
Script de Automação de Relatório de Code Review
================================================

Este script automatiza o preenchimento das seções do template de Code Review:
- Informações da Revisão (via GitHub API)
- Métricas de Qualidade (via Lighthouse CLI e axe-core)
- Análise estática de acessibilidade

Uso:
    python3 scripts/generate-code-review-report.py --pr 123
    python3 scripts/generate-code-review-report.py --pr 123 --run-lighthouse
    python3 scripts/generate-code-review-report.py --pr 123 --full-analysis
    python3 scripts/generate-code-review-report.py --local --files src/components/LoginForm.tsx

Requisitos:
    - gh CLI instalado e autenticado
    - Node.js para Lighthouse (opcional)
    - axe-core para análise de acessibilidade (opcional)

Autor: TSiJUKEBOX Team
Versão: 1.0.0
Data: 2025-12-25
"""

import os
import re
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple
import tempfile


# =============================================================================
# CONFIGURAÇÕES
# =============================================================================

BASE_DIR = Path(__file__).parent.parent
TEMPLATE_PATH = BASE_DIR / "docs" / "templates" / "CODE_REVIEW_REPORT_TEMPLATE.md"
OUTPUT_DIR = BASE_DIR / "docs" / "reviews"
CHECKLIST_PATH = BASE_DIR / "docs" / "accessibility" / "HYBRID_PATTERN_CODE_REVIEW_CHECKLIST.md"

# GitHub
GITHUB_REPO = os.environ.get("GITHUB_REPOSITORY", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# Lighthouse
LIGHTHOUSE_URL = "http://localhost:5173"  # URL do dev server
LIGHTHOUSE_CATEGORIES = ["accessibility"]

# Thresholds
SCORE_APPROVED = 95
SCORE_WITH_NOTES = 85
SCORE_CHANGES_REQUESTED = 70


# =============================================================================
# ESTRUTURAS DE DADOS
# =============================================================================

@dataclass
class PRInfo:
    """Informações do Pull Request."""
    number: int = 0
    title: str = ""
    author: str = ""
    branch: str = ""
    base_branch: str = ""
    created_at: str = ""
    files_changed: List[str] = field(default_factory=list)
    additions: int = 0
    deletions: int = 0
    url: str = ""


@dataclass
class LighthouseMetrics:
    """Métricas do Lighthouse."""
    accessibility_score: int = 0
    performance_score: int = 0
    best_practices_score: int = 0
    seo_score: int = 0
    accessibility_issues: List[Dict] = field(default_factory=list)


@dataclass
class AxeMetrics:
    """Métricas do axe-core."""
    violations: int = 0
    passes: int = 0
    incomplete: int = 0
    inapplicable: int = 0
    violation_details: List[Dict] = field(default_factory=list)


@dataclass
class StaticAnalysisMetrics:
    """Métricas de análise estática."""
    aria_invalid_count: int = 0
    aria_label_count: int = 0
    aria_describedby_count: int = 0
    role_alert_count: int = 0
    form_count: int = 0
    input_count: int = 0
    label_count: int = 0
    issues: List[Dict] = field(default_factory=list)


@dataclass
class ChecklistScore:
    """Pontuação do checklist."""
    total: int = 96
    approved: int = 0
    attention: int = 0
    rejected: int = 0
    na: int = 0
    score_percentage: float = 0.0
    by_category: Dict[str, Dict] = field(default_factory=dict)


@dataclass
class ReviewReport:
    """Relatório completo de Code Review."""
    pr_info: PRInfo = field(default_factory=PRInfo)
    lighthouse: LighthouseMetrics = field(default_factory=LighthouseMetrics)
    axe: AxeMetrics = field(default_factory=AxeMetrics)
    static_analysis: StaticAnalysisMetrics = field(default_factory=StaticAnalysisMetrics)
    checklist_score: ChecklistScore = field(default_factory=ChecklistScore)
    reviewer: str = ""
    review_date: str = ""
    form_type: str = ""
    pattern_type: str = ""
    complexity: str = ""
    decision: str = ""
    generated_at: str = ""


# =============================================================================
# FUNÇÕES DE COLETA DE DADOS
# =============================================================================

def get_pr_info(pr_number: int) -> PRInfo:
    """Obtém informações do PR via GitHub CLI."""
    pr_info = PRInfo(number=pr_number)
    
    try:
        # Obter dados básicos do PR
        result = subprocess.run(
            ["gh", "pr", "view", str(pr_number), "--json",
             "title,author,headRefName,baseRefName,createdAt,additions,deletions,url,files"],
            capture_output=True,
            text=True,
            cwd=BASE_DIR
        )
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            pr_info.title = data.get("title", "")
            pr_info.author = data.get("author", {}).get("login", "")
            pr_info.branch = data.get("headRefName", "")
            pr_info.base_branch = data.get("baseRefName", "")
            pr_info.created_at = data.get("createdAt", "")[:10]
            pr_info.additions = data.get("additions", 0)
            pr_info.deletions = data.get("deletions", 0)
            pr_info.url = data.get("url", "")
            pr_info.files_changed = [f.get("path", "") for f in data.get("files", [])]
        else:
            print(f"⚠️ Erro ao obter PR: {result.stderr}")
            
    except FileNotFoundError:
        print("⚠️ GitHub CLI (gh) não encontrado. Instale com: sudo apt install gh")
    except Exception as e:
        print(f"⚠️ Erro ao obter informações do PR: {e}")
    
    return pr_info


def get_current_user() -> str:
    """Obtém o usuário atual do GitHub."""
    try:
        result = subprocess.run(
            ["gh", "api", "user", "--jq", ".login"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except:
        pass
    return os.environ.get("USER", "reviewer")


def run_lighthouse(url: str = LIGHTHOUSE_URL) -> LighthouseMetrics:
    """Executa Lighthouse e retorna métricas de acessibilidade."""
    metrics = LighthouseMetrics()
    
    try:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
            tmp_path = tmp.name
        
        # Executar Lighthouse
        result = subprocess.run(
            [
                "npx", "lighthouse", url,
                "--output=json",
                f"--output-path={tmp_path}",
                "--only-categories=accessibility",
                "--chrome-flags=--headless --no-sandbox",
                "--quiet"
            ],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0 and Path(tmp_path).exists():
            with open(tmp_path, 'r') as f:
                data = json.load(f)
            
            categories = data.get("categories", {})
            metrics.accessibility_score = int(
                categories.get("accessibility", {}).get("score", 0) * 100
            )
            
            # Extrair issues de acessibilidade
            audits = data.get("audits", {})
            for audit_id, audit in audits.items():
                if audit.get("score") == 0:
                    metrics.accessibility_issues.append({
                        "id": audit_id,
                        "title": audit.get("title", ""),
                        "description": audit.get("description", ""),
                    })
            
            Path(tmp_path).unlink()
        else:
            print(f"⚠️ Lighthouse falhou: {result.stderr[:200]}")
            
    except subprocess.TimeoutExpired:
        print("⚠️ Lighthouse timeout (120s)")
    except FileNotFoundError:
        print("⚠️ Lighthouse não encontrado. Instale com: npm install -g lighthouse")
    except Exception as e:
        print(f"⚠️ Erro ao executar Lighthouse: {e}")
    
    return metrics


def run_axe_analysis(url: str = LIGHTHOUSE_URL) -> AxeMetrics:
    """Executa análise axe-core via Puppeteer."""
    metrics = AxeMetrics()
    
    # Script Node.js para executar axe-core
    axe_script = """
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(process.argv[2], { waitUntil: 'networkidle0' });
    
    const results = await new AxePuppeteer(page).analyze();
    
    console.log(JSON.stringify({
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
        violation_details: results.violations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length
        }))
    }));
    
    await browser.close();
})();
"""
    
    try:
        with tempfile.NamedTemporaryFile(suffix=".js", delete=False, mode='w') as tmp:
            tmp.write(axe_script)
            tmp_path = tmp.name
        
        result = subprocess.run(
            ["node", tmp_path, url],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            metrics.violations = data.get("violations", 0)
            metrics.passes = data.get("passes", 0)
            metrics.incomplete = data.get("incomplete", 0)
            metrics.inapplicable = data.get("inapplicable", 0)
            metrics.violation_details = data.get("violation_details", [])
        
        Path(tmp_path).unlink()
        
    except Exception as e:
        print(f"⚠️ Erro ao executar axe-core: {e}")
    
    return metrics


def run_static_analysis(files: List[str]) -> StaticAnalysisMetrics:
    """Executa análise estática nos arquivos."""
    metrics = StaticAnalysisMetrics()
    
    patterns = {
        'aria_invalid': r'aria-invalid=',
        'aria_label': r'aria-label=',
        'aria_describedby': r'aria-describedby=',
        'role_alert': r'role="alert"',
        'form': r'<form\b',
        'input': r'<(?:Input|input)\b',
        'label': r'<(?:Label|label)\b',
    }
    
    issue_patterns = [
        (r'<(?:Input|input)[^>]*(?!aria-label)[^>]*placeholder="[^"]+"[^>]*/?>',
         "Input com placeholder sem aria-label", "HIGH"),
        (r'<(?:Input|input)[^>]*(?!aria-invalid)[^>]*className="[^"]*error[^"]*"',
         "Input com classe de erro sem aria-invalid", "HIGH"),
        (r'error\s*&&\s*<(?:span|p|div)(?![^>]*role="alert")',
         "Mensagem de erro sem role='alert'", "MEDIUM"),
        (r'<(?:Input|input)[^>]*required(?![^>]*aria-required)',
         "Campo required sem aria-required", "LOW"),
    ]
    
    for filepath in files:
        full_path = BASE_DIR / filepath if not Path(filepath).is_absolute() else Path(filepath)
        
        if not full_path.exists() or full_path.suffix not in ['.tsx', '.jsx']:
            continue
        
        try:
            content = full_path.read_text()
            
            # Contar padrões
            for key, pattern in patterns.items():
                count = len(re.findall(pattern, content, re.IGNORECASE))
                setattr(metrics, f"{key}_count", getattr(metrics, f"{key}_count") + count)
            
            # Detectar issues
            lines = content.split('\n')
            for i, line in enumerate(lines):
                for pattern, description, severity in issue_patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        metrics.issues.append({
                            "file": str(filepath),
                            "line": i + 1,
                            "description": description,
                            "severity": severity,
                            "context": line.strip()[:80]
                        })
                        
        except Exception as e:
            print(f"⚠️ Erro ao analisar {filepath}: {e}")
    
    return metrics


def calculate_checklist_score(static_metrics: StaticAnalysisMetrics) -> ChecklistScore:
    """Calcula pontuação estimada do checklist baseado na análise estática."""
    score = ChecklistScore()
    
    # Estimativas baseadas em métricas
    categories = {
        "Estrutura do Formulário": {
            "total": 7,
            "estimated": min(7, static_metrics.form_count * 2) if static_metrics.form_count > 0 else 0
        },
        "Resumo de Erros": {
            "total": 15,
            "estimated": 10 if static_metrics.role_alert_count > 0 else 5
        },
        "Erros Inline": {
            "total": 13,
            "estimated": min(13, (
                (3 if static_metrics.aria_invalid_count > 0 else 0) +
                (3 if static_metrics.aria_describedby_count > 0 else 0) +
                (3 if static_metrics.role_alert_count > 0 else 0) +
                4
            ))
        },
        "Labels e Associações": {
            "total": 8,
            "estimated": min(8, (
                (4 if static_metrics.label_count >= static_metrics.input_count else 2) +
                (2 if static_metrics.aria_label_count > 0 else 0) +
                2
            ))
        },
        "Validação e Timing": {
            "total": 8,
            "estimated": 6  # Difícil estimar estaticamente
        },
        "Feedback Visual": {
            "total": 10,
            "estimated": 7  # Difícil estimar estaticamente
        },
        "Autocomplete e Tipos": {
            "total": 8,
            "estimated": 5  # Difícil estimar estaticamente
        },
        "Navegação por Teclado": {
            "total": 7,
            "estimated": 5  # Difícil estimar estaticamente
        },
        "Testes Manuais": {
            "total": 12,
            "estimated": 0  # Requer testes manuais
        },
        "Código Limpo": {
            "total": 8,
            "estimated": 6  # Difícil estimar estaticamente
        },
    }
    
    total_estimated = 0
    total_possible = 0
    
    for category, data in categories.items():
        score.by_category[category] = {
            "total": data["total"],
            "estimated": data["estimated"],
            "percentage": (data["estimated"] / data["total"] * 100) if data["total"] > 0 else 0
        }
        total_estimated += data["estimated"]
        total_possible += data["total"]
    
    # Penalizar por issues encontrados
    penalty = len(static_metrics.issues) * 2
    total_estimated = max(0, total_estimated - penalty)
    
    score.approved = total_estimated
    score.attention = min(10, len(static_metrics.issues))
    score.rejected = max(0, len([i for i in static_metrics.issues if i["severity"] == "HIGH"]))
    score.total = total_possible
    score.score_percentage = (total_estimated / total_possible * 100) if total_possible > 0 else 0
    
    return score


def determine_decision(score: ChecklistScore, lighthouse: LighthouseMetrics, axe: AxeMetrics) -> str:
    """Determina a decisão baseada nas métricas."""
    # Critérios de bloqueio
    if axe.violations > 5:
        return "❌ REPROVADO"
    
    if lighthouse.accessibility_score < 70:
        return "🔄 SOLICITAR ALTERAÇÕES"
    
    # Baseado no score do checklist
    if score.score_percentage >= SCORE_APPROVED and score.rejected == 0:
        return "✅ APROVADO"
    elif score.score_percentage >= SCORE_WITH_NOTES:
        return "⚠️ APROVADO COM RESSALVAS"
    elif score.score_percentage >= SCORE_CHANGES_REQUESTED:
        return "🔄 SOLICITAR ALTERAÇÕES"
    else:
        return "❌ REPROVADO"


# =============================================================================
# GERAÇÃO DO RELATÓRIO
# =============================================================================

def generate_report_markdown(report: ReviewReport) -> str:
    """Gera o relatório em formato Markdown."""
    
    # Carregar template
    if TEMPLATE_PATH.exists():
        template = TEMPLATE_PATH.read_text()
    else:
        template = get_default_template()
    
    # Substituir informações da revisão
    replacements = {
        # Informações da Revisão
        "| **PR/MR #** | |": f"| **PR/MR #** | #{report.pr_info.number} |",
        "| **Título** | |": f"| **Título** | {report.pr_info.title} |",
        "| **Autor** | |": f"| **Autor** | @{report.pr_info.author} |",
        "| **Revisor** | |": f"| **Revisor** | @{report.reviewer} |",
        "| **Data da Revisão** | |": f"| **Data da Revisão** | {report.review_date} |",
        "| **Branch** | |": f"| **Branch** | `{report.pr_info.branch}` → `{report.pr_info.base_branch}` |",
        "| **Arquivos Alterados** | |": f"| **Arquivos Alterados** | {len(report.pr_info.files_changed)} (+{report.pr_info.additions}/-{report.pr_info.deletions}) |",
        
        # Métricas de Qualidade
        "| **Score do Checklist** | % |": f"| **Score do Checklist** | {report.checklist_score.score_percentage:.1f}% |",
        "| **Itens Reprovados** | |": f"| **Itens Reprovados** | {report.checklist_score.rejected} |",
        "| **Itens Bloqueantes** | |": f"| **Itens Bloqueantes** | {len([i for i in report.static_analysis.issues if i['severity'] == 'HIGH'])} |",
        "| **Lighthouse Accessibility** | |": f"| **Lighthouse Accessibility** | {report.lighthouse.accessibility_score} |",
        "| **axe-core Violations** | |": f"| **axe-core Violations** | {report.axe.violations} |",
        
        # Score
        "| **Score Bruto** | /96 |": f"| **Score Bruto** | {report.checklist_score.approved}/96 |",
        "| **Itens N/A** | |": f"| **Itens N/A** | {report.checklist_score.na} |",
        "| **Score Ajustado** | % |": f"| **Score Ajustado** | {report.checklist_score.score_percentage:.1f}% |",
    }
    
    result = template
    for old, new in replacements.items():
        result = result.replace(old, new)
    
    # Adicionar seção de análise estática
    static_section = generate_static_analysis_section(report.static_analysis)
    result = result.replace(
        "## ✅ Pontos Positivos",
        f"{static_section}\n\n## ✅ Pontos Positivos"
    )
    
    # Adicionar issues encontrados
    if report.static_analysis.issues:
        issues_section = generate_issues_section(report.static_analysis.issues)
        result = result.replace(
            "## ❌ Correções Obrigatórias\n\nListe os aspectos que DEVEM ser corrigidos antes do merge:",
            f"## ❌ Correções Obrigatórias\n\n{issues_section}"
        )
    
    # Marcar decisão
    decision_markers = {
        "✅ APROVADO": "- [x] ✅ **APROVADO**",
        "⚠️ APROVADO COM RESSALVAS": "- [x] ⚠️ **APROVADO COM RESSALVAS**",
        "🔄 SOLICITAR ALTERAÇÕES": "- [x] 🔄 **SOLICITAR ALTERAÇÕES**",
        "❌ REPROVADO": "- [x] ❌ **REPROVADO**",
    }
    
    for decision, marker in decision_markers.items():
        if decision in report.decision:
            result = result.replace(f"- [ ] {decision}", marker)
    
    # Adicionar timestamp
    result = result.replace(
        "*Gerado em: 2025-12-25*",
        f"*Gerado automaticamente em: {report.generated_at}*"
    )
    
    return result


def generate_static_analysis_section(metrics: StaticAnalysisMetrics) -> str:
    """Gera seção de análise estática."""
    return f"""
## 🔍 Análise Estática Automática

### Métricas de Acessibilidade Detectadas

| Atributo | Quantidade | Status |
|----------|------------|--------|
| `aria-invalid` | {metrics.aria_invalid_count} | {'✅' if metrics.aria_invalid_count > 0 else '⚠️'} |
| `aria-label` | {metrics.aria_label_count} | {'✅' if metrics.aria_label_count > 0 else '⚠️'} |
| `aria-describedby` | {metrics.aria_describedby_count} | {'✅' if metrics.aria_describedby_count > 0 else '⚠️'} |
| `role="alert"` | {metrics.role_alert_count} | {'✅' if metrics.role_alert_count > 0 else '⚠️'} |
| `<form>` | {metrics.form_count} | {'✅' if metrics.form_count > 0 else '➖'} |
| `<Input>` | {metrics.input_count} | {'✅' if metrics.input_count > 0 else '➖'} |
| `<Label>` | {metrics.label_count} | {'✅' if metrics.label_count >= metrics.input_count else '⚠️'} |

### Cobertura de Labels

{'✅ Todos os inputs possuem labels associados' if metrics.label_count >= metrics.input_count else f'⚠️ {metrics.input_count - metrics.label_count} inputs podem estar sem label'}
"""


def generate_issues_section(issues: List[Dict]) -> str:
    """Gera seção de issues encontrados."""
    if not issues:
        return "Nenhuma correção obrigatória identificada automaticamente."
    
    lines = ["Issues identificados automaticamente:\n"]
    lines.append("| # | Descrição | Arquivo:Linha | Severidade | Bloqueante |")
    lines.append("|---|-----------|---------------|------------|------------|")
    
    for i, issue in enumerate(issues[:10], 1):
        bloqueante = "☑️ Sim" if issue["severity"] == "HIGH" else "☐ Não"
        lines.append(
            f"| {i} | {issue['description']} | `{issue['file']}:{issue['line']}` | {issue['severity']} | {bloqueante} |"
        )
    
    if len(issues) > 10:
        lines.append(f"\n*... e mais {len(issues) - 10} issues*")
    
    return "\n".join(lines)


def get_default_template() -> str:
    """Retorna template padrão caso o arquivo não exista."""
    return """# 📋 Relatório de Code Review - Acessibilidade de Formulários

## 📌 Informações da Revisão

| Campo | Valor |
|-------|-------|
| **PR/MR #** | |
| **Título** | |
| **Autor** | |
| **Revisor** | |
| **Data da Revisão** | |
| **Branch** | |
| **Arquivos Alterados** | |

## 📊 Métricas de Qualidade

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| **Score do Checklist** | % | ≥ 90% | ☐ |
| **Itens Reprovados** | | 0 | ☐ |
| **Itens Bloqueantes** | | 0 | ☐ |
| **Lighthouse Accessibility** | | ≥ 90 | ☐ |
| **axe-core Violations** | | 0 | ☐ |

## ✅ Pontos Positivos

## ❌ Correções Obrigatórias

Liste os aspectos que DEVEM ser corrigidos antes do merge:

## 🎯 Decisão Final

- [ ] ✅ **APROVADO**
- [ ] ⚠️ **APROVADO COM RESSALVAS**
- [ ] 🔄 **SOLICITAR ALTERAÇÕES**
- [ ] ❌ **REPROVADO**

*Gerado em: 2025-12-25*
"""


# =============================================================================
# INTERFACE DE LINHA DE COMANDO
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Gera relatório de Code Review automatizado para formulários acessíveis',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 generate-code-review-report.py --pr 123
  python3 generate-code-review-report.py --pr 123 --run-lighthouse
  python3 generate-code-review-report.py --local --files src/components/LoginForm.tsx
        """
    )
    
    parser.add_argument('--pr', type=int, help='Número do Pull Request')
    parser.add_argument('--local', action='store_true', help='Análise local sem PR')
    parser.add_argument('--files', nargs='+', help='Arquivos para análise local')
    parser.add_argument('--run-lighthouse', action='store_true', help='Executar Lighthouse')
    parser.add_argument('--run-axe', action='store_true', help='Executar axe-core')
    parser.add_argument('--full-analysis', action='store_true', help='Executar todas as análises')
    parser.add_argument('--url', default=LIGHTHOUSE_URL, help='URL para Lighthouse/axe')
    parser.add_argument('--output', type=str, help='Caminho do arquivo de saída')
    parser.add_argument('--reviewer', type=str, help='Nome do revisor')
    
    args = parser.parse_args()
    
    # Validar argumentos
    if not args.pr and not args.local:
        parser.error("Especifique --pr <número> ou --local")
    
    if args.local and not args.files:
        parser.error("--local requer --files")
    
    if args.full_analysis:
        args.run_lighthouse = True
        args.run_axe = True
    
    # Inicializar relatório
    report = ReviewReport()
    report.review_date = datetime.now().strftime("%Y-%m-%d")
    report.generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report.reviewer = args.reviewer or get_current_user()
    
    print("=" * 70)
    print("📋 Gerador de Relatório de Code Review")
    print("=" * 70)
    print(f"⏱️ Início: {datetime.now().strftime('%H:%M:%S')}")
    print()
    
    # Coletar informações do PR
    if args.pr:
        print(f"🔍 Obtendo informações do PR #{args.pr}...")
        report.pr_info = get_pr_info(args.pr)
        files_to_analyze = report.pr_info.files_changed
        print(f"   ✅ {len(files_to_analyze)} arquivos alterados")
    else:
        files_to_analyze = args.files
        report.pr_info.title = "Análise Local"
        report.pr_info.files_changed = files_to_analyze
    
    # Análise estática
    print(f"\n🔬 Executando análise estática...")
    report.static_analysis = run_static_analysis(files_to_analyze)
    print(f"   ✅ {len(report.static_analysis.issues)} issues encontrados")
    
    # Lighthouse
    if args.run_lighthouse:
        print(f"\n🔦 Executando Lighthouse ({args.url})...")
        report.lighthouse = run_lighthouse(args.url)
        print(f"   ✅ Score de acessibilidade: {report.lighthouse.accessibility_score}")
    
    # axe-core
    if args.run_axe:
        print(f"\n🪓 Executando axe-core ({args.url})...")
        report.axe = run_axe_analysis(args.url)
        print(f"   ✅ Violations: {report.axe.violations}")
    
    # Calcular score
    print(f"\n📊 Calculando score do checklist...")
    report.checklist_score = calculate_checklist_score(report.static_analysis)
    print(f"   ✅ Score estimado: {report.checklist_score.score_percentage:.1f}%")
    
    # Determinar decisão
    report.decision = determine_decision(
        report.checklist_score,
        report.lighthouse,
        report.axe
    )
    print(f"\n🎯 Decisão: {report.decision}")
    
    # Gerar relatório
    print(f"\n📝 Gerando relatório...")
    markdown = generate_report_markdown(report)
    
    # Salvar arquivo
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    if args.output:
        output_path = Path(args.output)
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pr_suffix = f"_PR{args.pr}" if args.pr else "_local"
        output_path = OUTPUT_DIR / f"code_review{pr_suffix}_{timestamp}.md"
    
    output_path.write_text(markdown, encoding='utf-8')
    
    print(f"   ✅ Relatório salvo em: {output_path}")
    
    # Resumo final
    print()
    print("=" * 70)
    print("📊 RESUMO")
    print("-" * 70)
    print(f"   PR: #{report.pr_info.number} - {report.pr_info.title[:50]}")
    print(f"   Arquivos: {len(files_to_analyze)}")
    print(f"   Issues: {len(report.static_analysis.issues)}")
    print(f"   Score: {report.checklist_score.score_percentage:.1f}%")
    print(f"   Lighthouse: {report.lighthouse.accessibility_score}")
    print(f"   axe-core: {report.axe.violations} violations")
    print(f"   Decisão: {report.decision}")
    print("=" * 70)
    print(f"⏱️ Fim: {datetime.now().strftime('%H:%M:%S')}")
    
    # Retornar código de saída baseado na decisão
    if "REPROVADO" in report.decision:
        return 2
    elif "ALTERAÇÕES" in report.decision:
        return 1
    return 0


if __name__ == '__main__':
    exit(main())
