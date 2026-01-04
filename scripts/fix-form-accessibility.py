#!/usr/bin/env python3
"""
Script de Correção de Acessibilidade de Formulários
====================================================

Este script automatiza a correção de problemas comuns de acessibilidade
em formulários React/TypeScript, incluindo:

1. Inputs sem labels associados
2. Campos obrigatórios sem indicação
3. Mensagens de erro sem aria-describedby
4. Grupos de radio/checkbox sem fieldset/legend
5. Selects sem labels
6. Placeholders usados como labels
7. Autocomplete ausente em campos comuns

Uso:
    python3 scripts/fix-form-accessibility.py --dry-run      # Simular alterações
    python3 scripts/fix-form-accessibility.py --apply        # Aplicar correções
    python3 scripts/fix-form-accessibility.py --report       # Gerar relatório
    python3 scripts/fix-form-accessibility.py --file <path>  # Arquivo específico

Autor: TSiJUKEBOX Team
Versão: 1.0.0
Data: 2025-12-25
"""

import re
import argparse
import json
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple
from enum import Enum
import subprocess


# =============================================================================
# CONFIGURAÇÕES
# =============================================================================

# Diretórios
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
BACKUP_DIR = BASE_DIR / "backups" / "form-a11y-fixes"
REPORT_DIR = BASE_DIR / "docs" / "accessibility"

# Padrões de arquivo
FILE_PATTERNS = ["*.tsx", "*.jsx"]
EXCLUDE_DIRS = ["node_modules", "dist", ".next", "build", "__tests__"]

# Configurações de correção
AUTO_FIX_ENABLED = True
CREATE_BACKUPS = True
VALIDATE_BUILD = True


# =============================================================================
# MAPEAMENTOS E REGRAS
# =============================================================================

class Severity(Enum):
    """Níveis de severidade dos problemas."""
    CRITICAL = "🔴 CRÍTICA"
    HIGH = "🟠 ALTA"
    MEDIUM = "🟡 MÉDIA"
    LOW = "🟢 BAIXA"


class IssueType(Enum):
    """Tipos de problemas de acessibilidade em formulários."""
    MISSING_LABEL = "Input sem label associado"
    MISSING_REQUIRED_INDICATOR = "Campo obrigatório sem indicação"
    MISSING_ERROR_ASSOCIATION = "Erro sem aria-describedby"
    MISSING_FIELDSET = "Grupo sem fieldset/legend"
    PLACEHOLDER_AS_LABEL = "Placeholder usado como label"
    MISSING_AUTOCOMPLETE = "Autocomplete ausente"
    MISSING_INPUT_TYPE = "Tipo de input incorreto"
    MISSING_ARIA_INVALID = "aria-invalid ausente em erro"


# Mapeamento de nomes de campos para autocomplete
AUTOCOMPLETE_MAPPINGS = {
    # Identificação pessoal
    'name': 'name',
    'fullName': 'name',
    'full_name': 'name',
    'firstName': 'given-name',
    'first_name': 'given-name',
    'lastName': 'family-name',
    'last_name': 'family-name',
    'nickname': 'nickname',
    'username': 'username',
    
    # Contato
    'email': 'email',
    'e-mail': 'email',
    'phone': 'tel',
    'telephone': 'tel',
    'tel': 'tel',
    'mobile': 'tel',
    'celular': 'tel',
    
    # Endereço
    'address': 'street-address',
    'street': 'street-address',
    'endereco': 'street-address',
    'city': 'address-level2',
    'cidade': 'address-level2',
    'state': 'address-level1',
    'estado': 'address-level1',
    'zip': 'postal-code',
    'zipCode': 'postal-code',
    'zip_code': 'postal-code',
    'cep': 'postal-code',
    'postalCode': 'postal-code',
    'country': 'country-name',
    'pais': 'country-name',
    
    # Pagamento
    'cardNumber': 'cc-number',
    'card_number': 'cc-number',
    'ccNumber': 'cc-number',
    'cardName': 'cc-name',
    'cardExpiry': 'cc-exp',
    'cardCvc': 'cc-csc',
    'cvv': 'cc-csc',
    'cvc': 'cc-csc',
    
    # Autenticação
    'password': 'current-password',
    'senha': 'current-password',
    'newPassword': 'new-password',
    'new_password': 'new-password',
    'confirmPassword': 'new-password',
    'confirm_password': 'new-password',
    
    # Datas
    'birthday': 'bday',
    'birthdate': 'bday',
    'dob': 'bday',
    'dataNascimento': 'bday',
    
    # Organização
    'company': 'organization',
    'organization': 'organization',
    'empresa': 'organization',
    'jobTitle': 'organization-title',
    'job_title': 'organization-title',
    'cargo': 'organization-title',
}

# Mapeamento de tipos de input recomendados
INPUT_TYPE_MAPPINGS = {
    'email': 'email',
    'phone': 'tel',
    'tel': 'tel',
    'telephone': 'tel',
    'celular': 'tel',
    'password': 'password',
    'senha': 'password',
    'url': 'url',
    'website': 'url',
    'site': 'url',
    'search': 'search',
    'busca': 'search',
    'pesquisa': 'search',
    'date': 'date',
    'data': 'date',
    'time': 'time',
    'hora': 'time',
    'number': 'number',
    'numero': 'number',
    'quantity': 'number',
    'quantidade': 'number',
    'age': 'number',
    'idade': 'number',
}

# Labels em português para campos comuns
FIELD_LABELS_PT = {
    'name': 'Nome',
    'fullName': 'Nome completo',
    'firstName': 'Nome',
    'lastName': 'Sobrenome',
    'email': 'E-mail',
    'phone': 'Telefone',
    'password': 'Senha',
    'confirmPassword': 'Confirmar senha',
    'address': 'Endereço',
    'city': 'Cidade',
    'state': 'Estado',
    'zip': 'CEP',
    'country': 'País',
    'message': 'Mensagem',
    'subject': 'Assunto',
    'description': 'Descrição',
    'title': 'Título',
    'username': 'Nome de usuário',
    'search': 'Pesquisar',
}


# =============================================================================
# ESTRUTURAS DE DADOS
# =============================================================================

@dataclass
class FormIssue:
    """Representa um problema de acessibilidade encontrado."""
    file: str
    line: int
    column: int = 0
    issue_type: IssueType = IssueType.MISSING_LABEL
    severity: Severity = Severity.HIGH
    element: str = ""
    context: str = ""
    suggestion: str = ""
    auto_fixable: bool = False
    fixed: bool = False


@dataclass
class FormFix:
    """Representa uma correção aplicada."""
    file: str
    line: int
    original: str
    fixed: str
    issue_type: IssueType
    description: str


@dataclass
class FileResult:
    """Resultado do processamento de um arquivo."""
    file: str
    issues_found: int = 0
    issues_fixed: int = 0
    issues: List[FormIssue] = field(default_factory=list)
    fixes: List[FormFix] = field(default_factory=list)


@dataclass
class ProcessingStats:
    """Estatísticas gerais do processamento."""
    files_analyzed: int = 0
    files_modified: int = 0
    total_issues: int = 0
    total_fixed: int = 0
    issues_by_type: Dict[str, int] = field(default_factory=dict)
    issues_by_severity: Dict[str, int] = field(default_factory=dict)


# =============================================================================
# FUNÇÕES DE DETECÇÃO
# =============================================================================

def detect_input_without_label(content: str, filepath: str) -> List[FormIssue]:
    """Detecta inputs sem labels associados."""
    issues = []
    lines = content.split('\n')
    
    # Padrão para inputs
    input_pattern = re.compile(
        r'<(Input|input|TextField|TextInput)\s+([^>]*?)(/?>)',
        re.IGNORECASE | re.DOTALL
    )
    
    for i, line in enumerate(lines):
        for match in input_pattern.finditer(line):
            attrs = match.group(2)
            
            # Verificar se tem label associado
            has_label = any([
                'aria-label=' in attrs,
                'aria-labelledby=' in attrs,
                'id=' in attrs and _has_label_for_id(content, attrs),
            ])
            
            # Verificar se é um input escondido ou submit
            is_hidden = 'type="hidden"' in attrs or 'type="submit"' in attrs
            
            if not has_label and not is_hidden:
                # Extrair nome do campo para sugestão
                field_name = _extract_field_name(attrs)
                suggested_label = FIELD_LABELS_PT.get(field_name, field_name.replace('_', ' ').title())
                
                issues.append(FormIssue(
                    file=str(filepath),
                    line=i + 1,
                    issue_type=IssueType.MISSING_LABEL,
                    severity=Severity.CRITICAL,
                    element=match.group(0)[:80],
                    context=line.strip()[:100],
                    suggestion=f'Adicionar aria-label="{suggested_label}" ou associar com <Label htmlFor="...">',
                    auto_fixable=True
                ))
    
    return issues


def detect_placeholder_as_label(content: str, filepath: str) -> List[FormIssue]:
    """Detecta inputs que usam placeholder como único identificador."""
    issues = []
    lines = content.split('\n')
    
    pattern = re.compile(
        r'<(Input|input)\s+([^>]*placeholder="[^"]+")[^>]*(/?>)',
        re.IGNORECASE
    )
    
    for i, line in enumerate(lines):
        for match in pattern.finditer(line):
            attrs = match.group(2)
            
            # Verificar se tem label além do placeholder
            has_proper_label = any([
                'aria-label=' in attrs,
                'aria-labelledby=' in attrs,
            ])
            
            if not has_proper_label:
                # Extrair placeholder para usar como sugestão
                placeholder_match = re.search(r'placeholder="([^"]+)"', attrs)
                placeholder = placeholder_match.group(1) if placeholder_match else ""
                
                issues.append(FormIssue(
                    file=str(filepath),
                    line=i + 1,
                    issue_type=IssueType.PLACEHOLDER_AS_LABEL,
                    severity=Severity.HIGH,
                    element=match.group(0)[:80],
                    context=line.strip()[:100],
                    suggestion=f'Adicionar aria-label="{placeholder}" (placeholder não é suficiente)',
                    auto_fixable=True
                ))
    
    return issues


def detect_missing_autocomplete(content: str, filepath: str) -> List[FormIssue]:
    """Detecta inputs que deveriam ter autocomplete."""
    issues = []
    lines = content.split('\n')
    
    pattern = re.compile(
        r'<(Input|input)\s+([^>]*(?:name|id)="([^"]+)")[^>]*(/?>)',
        re.IGNORECASE
    )
    
    for i, line in enumerate(lines):
        for match in pattern.finditer(line):
            attrs = match.group(2)
            field_name = match.group(3).lower()
            
            # Verificar se já tem autocomplete
            has_autocomplete = 'autoComplete=' in attrs or 'autocomplete=' in attrs
            
            # Verificar se é um campo que deveria ter autocomplete
            suggested_autocomplete = None
            for key, value in AUTOCOMPLETE_MAPPINGS.items():
                if key.lower() in field_name:
                    suggested_autocomplete = value
                    break
            
            if suggested_autocomplete and not has_autocomplete:
                issues.append(FormIssue(
                    file=str(filepath),
                    line=i + 1,
                    issue_type=IssueType.MISSING_AUTOCOMPLETE,
                    severity=Severity.MEDIUM,
                    element=match.group(0)[:80],
                    context=line.strip()[:100],
                    suggestion=f'Adicionar autoComplete="{suggested_autocomplete}"',
                    auto_fixable=True
                ))
    
    return issues


def detect_missing_required_indicator(content: str, filepath: str) -> List[FormIssue]:
    """Detecta campos required sem indicação visual/ARIA."""
    issues = []
    lines = content.split('\n')
    
    pattern = re.compile(
        r'<(Input|input|Select|select|Textarea|textarea)\s+([^>]*required[^>]*)(/?>)',
        re.IGNORECASE
    )
    
    for i, line in enumerate(lines):
        for match in pattern.finditer(line):
            attrs = match.group(2)
            
            # Verificar se tem indicação ARIA
            has_aria_required = 'aria-required=' in attrs
            
            if not has_aria_required:
                issues.append(FormIssue(
                    file=str(filepath),
                    line=i + 1,
                    issue_type=IssueType.MISSING_REQUIRED_INDICATOR,
                    severity=Severity.MEDIUM,
                    element=match.group(0)[:80],
                    context=line.strip()[:100],
                    suggestion='Adicionar aria-required="true" para leitores de tela',
                    auto_fixable=True
                ))
    
    return issues


def detect_missing_error_association(content: str, filepath: str) -> List[FormIssue]:
    """Detecta mensagens de erro sem associação com o campo."""
    issues = []
    lines = content.split('\n')
    
    # Padrões comuns de mensagens de erro
    error_patterns = [
        r'error\s*&&\s*<(span|p|div)',
        r'errors?\.[a-zA-Z]+\s*&&',
        r'<FormError',
        r'<ErrorMessage',
        r'className="[^"]*error[^"]*"',
    ]
    
    for i, line in enumerate(lines):
        for pattern in error_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # Verificar se tem aria-describedby ou role="alert"
                has_association = any([
                    'aria-describedby=' in line,
                    'role="alert"' in line,
                    'aria-live=' in line,
                ])
                
                if not has_association:
                    issues.append(FormIssue(
                        file=str(filepath),
                        line=i + 1,
                        issue_type=IssueType.MISSING_ERROR_ASSOCIATION,
                        severity=Severity.HIGH,
                        element=line.strip()[:80],
                        context=line.strip()[:100],
                        suggestion='Adicionar role="alert" ou aria-live="polite" para anunciar erros',
                        auto_fixable=True
                    ))
                break
    
    return issues


def detect_missing_fieldset(content: str, filepath: str) -> List[FormIssue]:
    """Detecta grupos de radio/checkbox sem fieldset."""
    issues = []
    lines = content.split('\n')
    
    # Detectar múltiplos radio/checkbox com mesmo name
    radio_pattern = re.compile(r'type="(radio|checkbox)"[^>]*name="([^"]+)"')
    
    radio_groups = {}
    for i, line in enumerate(lines):
        for match in radio_pattern.finditer(line):
            name = match.group(2)
            if name not in radio_groups:
                radio_groups[name] = []
            radio_groups[name].append(i + 1)
    
    # Verificar grupos com mais de 1 elemento
    for name, line_numbers in radio_groups.items():
        if len(line_numbers) > 1:
            # Verificar se está dentro de fieldset
            start_line = min(line_numbers) - 1
            end_line = max(line_numbers)
            context_before = '\n'.join(lines[max(0, start_line-5):start_line])
            
            if '<fieldset' not in context_before.lower():
                issues.append(FormIssue(
                    file=str(filepath),
                    line=line_numbers[0],
                    issue_type=IssueType.MISSING_FIELDSET,
                    severity=Severity.MEDIUM,
                    element=f'Grupo "{name}" com {len(line_numbers)} opções',
                    context=f'Linhas: {line_numbers}',
                    suggestion=f'Envolver grupo "{name}" em <fieldset> com <legend>',
                    auto_fixable=False
                ))
    
    return issues


def detect_missing_aria_invalid(content: str, filepath: str) -> List[FormIssue]:
    """Detecta campos com erro sem aria-invalid."""
    issues = []
    lines = content.split('\n')
    
    # Padrões que indicam estado de erro
    error_state_patterns = [
        r'className="[^"]*(?:error|invalid|border-red|ring-red)[^"]*"',
        r'(?:isInvalid|hasError|error)={true}',
        r'(?:isInvalid|hasError|error)=\{[^}]+\}',
    ]
    
    for i, line in enumerate(lines):
        for pattern in error_state_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # Verificar se tem aria-invalid
                if 'aria-invalid=' not in line:
                    issues.append(FormIssue(
                        file=str(filepath),
                        line=i + 1,
                        issue_type=IssueType.MISSING_ARIA_INVALID,
                        severity=Severity.HIGH,
                        element=line.strip()[:80],
                        context=line.strip()[:100],
                        suggestion='Adicionar aria-invalid={hasError} para indicar estado de erro',
                        auto_fixable=True
                    ))
                break
    
    return issues


# =============================================================================
# FUNÇÕES DE CORREÇÃO
# =============================================================================

def fix_missing_label(line: str, issue: FormIssue) -> Tuple[str, Optional[FormFix]]:
    """Corrige input sem label adicionando aria-label."""
    # Extrair nome do campo
    name_match = re.search(r'(?:name|id)="([^"]+)"', line)
    if not name_match:
        return line, None
    
    field_name = name_match.group(1)
    label = FIELD_LABELS_PT.get(field_name, field_name.replace('_', ' ').replace('-', ' ').title())
    
    # Adicionar aria-label antes do />
    if '/>' in line:
        fixed = line.replace('/>', f' aria-label="{label}" />')
    elif '>' in line:
        fixed = re.sub(r'(<(?:Input|input)[^>]*)(>)', rf'\1 aria-label="{label}"\2', line)
    else:
        return line, None
    
    if fixed != line:
        return fixed, FormFix(
            file=issue.file,
            line=issue.line,
            original=line.strip(),
            fixed=fixed.strip(),
            issue_type=issue.issue_type,
            description=f'Adicionado aria-label="{label}"'
        )
    
    return line, None


def fix_placeholder_as_label(line: str, issue: FormIssue) -> Tuple[str, Optional[FormFix]]:
    """Corrige input com placeholder como label."""
    # Extrair placeholder
    placeholder_match = re.search(r'placeholder="([^"]+)"', line)
    if not placeholder_match:
        return line, None
    
    placeholder = placeholder_match.group(1)
    
    # Adicionar aria-label com o mesmo texto do placeholder
    if 'aria-label=' not in line:
        if '/>' in line:
            fixed = line.replace('/>', f' aria-label="{placeholder}" />')
        else:
            fixed = re.sub(r'(<(?:Input|input)[^>]*)(>)', rf'\1 aria-label="{placeholder}"\2', line)
        
        if fixed != line:
            return fixed, FormFix(
                file=issue.file,
                line=issue.line,
                original=line.strip(),
                fixed=fixed.strip(),
                issue_type=issue.issue_type,
                description=f'Adicionado aria-label="{placeholder}"'
            )
    
    return line, None


def fix_missing_autocomplete(line: str, issue: FormIssue) -> Tuple[str, Optional[FormFix]]:
    """Adiciona autocomplete apropriado."""
    # Extrair nome do campo
    name_match = re.search(r'(?:name|id)="([^"]+)"', line)
    if not name_match:
        return line, None
    
    field_name = name_match.group(1).lower()
    
    # Encontrar autocomplete apropriado
    autocomplete_value = None
    for key, value in AUTOCOMPLETE_MAPPINGS.items():
        if key.lower() in field_name:
            autocomplete_value = value
            break
    
    if not autocomplete_value:
        return line, None
    
    # Adicionar autoComplete
    if '/>' in line:
        fixed = line.replace('/>', f' autoComplete="{autocomplete_value}" />')
    else:
        fixed = re.sub(r'(<(?:Input|input)[^>]*)(>)', rf'\1 autoComplete="{autocomplete_value}"\2', line)
    
    if fixed != line:
        return fixed, FormFix(
            file=issue.file,
            line=issue.line,
            original=line.strip(),
            fixed=fixed.strip(),
            issue_type=issue.issue_type,
            description=f'Adicionado autoComplete="{autocomplete_value}"'
        )
    
    return line, None


def fix_missing_required_indicator(line: str, issue: FormIssue) -> Tuple[str, Optional[FormFix]]:
    """Adiciona aria-required a campos required."""
    if 'aria-required=' in line:
        return line, None
    
    # Adicionar aria-required="true" após required
    fixed = re.sub(r'\brequired\b', 'required aria-required="true"', line)
    
    if fixed != line:
        return fixed, FormFix(
            file=issue.file,
            line=issue.line,
            original=line.strip(),
            fixed=fixed.strip(),
            issue_type=issue.issue_type,
            description='Adicionado aria-required="true"'
        )
    
    return line, None


def fix_missing_error_association(line: str, issue: FormIssue) -> Tuple[str, Optional[FormFix]]:
    """Adiciona role="alert" a mensagens de erro."""
    if 'role="alert"' in line or 'aria-live=' in line:
        return line, None
    
    # Adicionar role="alert" ao elemento de erro
    patterns = [
        (r'(<(?:span|p|div)\s+)', r'\1role="alert" '),
        (r'(<FormError\s+)', r'\1role="alert" '),
        (r'(<ErrorMessage\s+)', r'\1role="alert" '),
    ]
    
    fixed = line
    for pattern, replacement in patterns:
        new_fixed = re.sub(pattern, replacement, fixed)
        if new_fixed != fixed:
            fixed = new_fixed
            break
    
    if fixed != line:
        return fixed, FormFix(
            file=issue.file,
            line=issue.line,
            original=line.strip(),
            fixed=fixed.strip(),
            issue_type=issue.issue_type,
            description='Adicionado role="alert"'
        )
    
    return line, None


# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def _has_label_for_id(content: str, attrs: str) -> bool:
    """Verifica se existe um label com htmlFor apontando para o id do input."""
    id_match = re.search(r'id="([^"]+)"', attrs)
    if not id_match:
        return False
    
    input_id = id_match.group(1)
    return f'htmlFor="{input_id}"' in content or f'for="{input_id}"' in content


def _extract_field_name(attrs: str) -> str:
    """Extrai o nome do campo dos atributos."""
    for attr in ['name', 'id', 'placeholder']:
        match = re.search(rf'{attr}="([^"]+)"', attrs)
        if match:
            return match.group(1)
    return "campo"


def should_process_file(filepath: Path) -> bool:
    """Verifica se o arquivo deve ser processado."""
    # Ignorar diretórios excluídos
    for exclude in EXCLUDE_DIRS:
        if exclude in filepath.parts:
            return False
    
    # Verificar extensão
    return filepath.suffix in ['.tsx', '.jsx']


def create_backup(filepath: Path, content: str) -> Path:
    """Cria backup do arquivo."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{filepath.stem}_{timestamp}{filepath.suffix}"
    backup_path = BACKUP_DIR / backup_name
    backup_path.write_text(content, encoding='utf-8')
    return backup_path


def validate_build() -> bool:
    """Executa build para validar alterações."""
    try:
        result = subprocess.run(
            ['npm', 'run', 'build'],
            capture_output=True,
            text=True,
            cwd=BASE_DIR,
            timeout=300
        )
        return result.returncode == 0
    except Exception as e:
        print(f"⚠️ Erro ao validar build: {e}")
        return False


# =============================================================================
# PROCESSAMENTO PRINCIPAL
# =============================================================================

def process_file(filepath: Path, dry_run: bool = True) -> FileResult:
    """Processa um arquivo e aplica correções."""
    result = FileResult(file=str(filepath.relative_to(BASE_DIR)))
    
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f"❌ Erro ao ler {filepath}: {e}")
        return result
    
    original_content = content
    lines = content.split('\n')
    
    # Detectar todos os problemas
    all_issues = []
    all_issues.extend(detect_input_without_label(content, filepath))
    all_issues.extend(detect_placeholder_as_label(content, filepath))
    all_issues.extend(detect_missing_autocomplete(content, filepath))
    all_issues.extend(detect_missing_required_indicator(content, filepath))
    all_issues.extend(detect_missing_error_association(content, filepath))
    all_issues.extend(detect_missing_fieldset(content, filepath))
    all_issues.extend(detect_missing_aria_invalid(content, filepath))
    
    result.issues = all_issues
    result.issues_found = len(all_issues)
    
    if not all_issues:
        return result
    
    # Aplicar correções (se não for dry-run)
    if not dry_run:
        # Mapeamento de funções de correção
        fix_functions = {
            IssueType.MISSING_LABEL: fix_missing_label,
            IssueType.PLACEHOLDER_AS_LABEL: fix_placeholder_as_label,
            IssueType.MISSING_AUTOCOMPLETE: fix_missing_autocomplete,
            IssueType.MISSING_REQUIRED_INDICATOR: fix_missing_required_indicator,
            IssueType.MISSING_ERROR_ASSOCIATION: fix_missing_error_association,
        }
        
        # Agrupar issues por linha
        issues_by_line = {}
        for issue in all_issues:
            if issue.auto_fixable and issue.issue_type in fix_functions:
                if issue.line not in issues_by_line:
                    issues_by_line[issue.line] = []
                issues_by_line[issue.line].append(issue)
        
        # Aplicar correções linha por linha
        new_lines = []
        for i, line in enumerate(lines):
            line_num = i + 1
            current_line = line
            
            if line_num in issues_by_line:
                for issue in issues_by_line[line_num]:
                    fix_func = fix_functions.get(issue.issue_type)
                    if fix_func:
                        fixed_line, fix = fix_func(current_line, issue)
                        if fix:
                            current_line = fixed_line
                            result.fixes.append(fix)
                            result.issues_fixed += 1
            
            new_lines.append(current_line)
        
        new_content = '\n'.join(new_lines)
        
        # Salvar se houve alterações
        if new_content != original_content:
            if CREATE_BACKUPS:
                create_backup(filepath, original_content)
            
            filepath.write_text(new_content, encoding='utf-8')
    
    return result


def generate_report(stats: ProcessingStats, results: List[FileResult]) -> str:
    """Gera relatório em Markdown."""
    report = []
    report.append("# 📋 Relatório de Acessibilidade de Formulários")
    report.append(f"\n**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append(f"**Projeto:** {BASE_DIR.name}")
    report.append("")
    
    # Resumo
    report.append("## 📊 Resumo")
    report.append("")
    report.append("| Métrica | Valor |")
    report.append("|---------|-------|")
    report.append(f"| Arquivos analisados | {stats.files_analyzed} |")
    report.append(f"| Arquivos modificados | {stats.files_modified} |")
    report.append(f"| Total de problemas | {stats.total_issues} |")
    report.append(f"| Problemas corrigidos | {stats.total_fixed} |")
    report.append("")
    
    # Por tipo
    if stats.issues_by_type:
        report.append("## 📋 Por Tipo de Problema")
        report.append("")
        report.append("| Tipo | Quantidade |")
        report.append("|------|------------|")
        for issue_type, count in sorted(stats.issues_by_type.items(), key=lambda x: -x[1]):
            report.append(f"| {issue_type} | {count} |")
        report.append("")
    
    # Por severidade
    if stats.issues_by_severity:
        report.append("## 🚨 Por Severidade")
        report.append("")
        report.append("| Severidade | Quantidade |")
        report.append("|------------|------------|")
        for severity, count in stats.issues_by_severity.items():
            report.append(f"| {severity} | {count} |")
        report.append("")
    
    # Detalhes por arquivo
    files_with_issues = [r for r in results if r.issues_found > 0]
    if files_with_issues:
        report.append("## 📁 Detalhes por Arquivo")
        report.append("")
        
        for file_result in sorted(files_with_issues, key=lambda x: -x.issues_found)[:20]:
            report.append(f"### {file_result.file}")
            report.append(f"- Problemas: {file_result.issues_found}")
            report.append(f"- Corrigidos: {file_result.issues_fixed}")
            report.append("")
            
            for issue in file_result.issues[:5]:
                report.append(f"- **Linha {issue.line}:** {issue.issue_type.value}")
                report.append(f"  - Sugestão: {issue.suggestion}")
            
            if len(file_result.issues) > 5:
                report.append(f"- ... e mais {len(file_result.issues) - 5} problemas")
            report.append("")
    
    return '\n'.join(report)


# =============================================================================
# INTERFACE DE LINHA DE COMANDO
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Corrige problemas de acessibilidade em formulários React/TypeScript',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 fix-form-accessibility.py --dry-run
  python3 fix-form-accessibility.py --apply
  python3 fix-form-accessibility.py --report
  python3 fix-form-accessibility.py --file src/components/LoginForm.tsx --apply
        """
    )
    
    parser.add_argument('--dry-run', action='store_true',
                        help='Simular alterações sem aplicar')
    parser.add_argument('--apply', action='store_true',
                        help='Aplicar correções')
    parser.add_argument('--report', action='store_true',
                        help='Gerar relatório detalhado')
    parser.add_argument('--file', type=str,
                        help='Processar arquivo específico')
    parser.add_argument('--no-backup', action='store_true',
                        help='Não criar backups')
    parser.add_argument('--no-validate', action='store_true',
                        help='Não validar build após correções')
    
    args = parser.parse_args()
    
    # Configurar flags globais
    global CREATE_BACKUPS, VALIDATE_BUILD
    CREATE_BACKUPS = not args.no_backup
    VALIDATE_BUILD = not args.no_validate
    
    # Modo padrão é dry-run
    if not any([args.dry_run, args.apply, args.report]):
        args.dry_run = True
    
    dry_run = not args.apply
    
    # Header
    print("=" * 70)
    print("🔧 Correção de Acessibilidade de Formulários")
    print("=" * 70)
    print(f"⏱️ Início: {datetime.now().strftime('%H:%M:%S')}")
    print(f"📁 Diretório: {SRC_DIR}")
    print(f"🔄 Modo: {'Simulação (dry-run)' if dry_run else 'Aplicação'}")
    print()
    
    # Coletar arquivos
    if args.file:
        filepath = Path(args.file)
        if not filepath.is_absolute():
            filepath = BASE_DIR / filepath
        files = [filepath] if filepath.exists() else []
    else:
        files = [f for f in SRC_DIR.rglob('*') if should_process_file(f)]
    
    print(f"🔍 Analisando {len(files)} arquivos...")
    print()
    
    # Processar arquivos
    stats = ProcessingStats()
    results = []
    
    for filepath in files:
        result = process_file(filepath, dry_run=dry_run)
        results.append(result)
        
        stats.files_analyzed += 1
        stats.total_issues += result.issues_found
        stats.total_fixed += result.issues_fixed
        
        if result.issues_fixed > 0:
            stats.files_modified += 1
        
        # Contabilizar por tipo e severidade
        for issue in result.issues:
            type_name = issue.issue_type.value
            stats.issues_by_type[type_name] = stats.issues_by_type.get(type_name, 0) + 1
            
            severity_name = issue.severity.value
            stats.issues_by_severity[severity_name] = stats.issues_by_severity.get(severity_name, 0) + 1
    
    # Exibir resultados
    print("📊 RESULTADOS")
    print("-" * 50)
    print(f"   Arquivos analisados: {stats.files_analyzed}")
    print(f"   Arquivos modificados: {stats.files_modified}")
    print(f"   Total de problemas: {stats.total_issues}")
    print(f"   Problemas corrigidos: {stats.total_fixed}")
    print()
    
    # Por tipo
    if stats.issues_by_type:
        print("📋 POR TIPO:")
        print("-" * 50)
        for issue_type, count in sorted(stats.issues_by_type.items(), key=lambda x: -x[1]):
            print(f"   {issue_type}: {count}")
        print()
    
    # Por severidade
    if stats.issues_by_severity:
        print("🚨 POR SEVERIDADE:")
        print("-" * 50)
        for severity, count in stats.issues_by_severity.items():
            print(f"   {severity}: {count}")
        print()
    
    # Gerar relatório se solicitado
    if args.report:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        report_path = REPORT_DIR / "FORM_ACCESSIBILITY_REPORT.md"
        report_content = generate_report(stats, results)
        report_path.write_text(report_content, encoding='utf-8')
        print(f"📄 Relatório salvo em: {report_path}")
        print()
    
    # Validar build se aplicou correções
    if args.apply and VALIDATE_BUILD and stats.files_modified > 0:
        print("🔨 Validando build...")
        if validate_build():
            print("✅ Build passou!")
        else:
            print("❌ Build falhou! Verifique os logs.")
        print()
    
    # Tempo total
    print("=" * 70)
    print(f"⏱️ Fim: {datetime.now().strftime('%H:%M:%S')}")
    print("=" * 70)
    
    if dry_run:
        print("💡 Execute com --apply para aplicar as correções")


if __name__ == '__main__':
    main()
