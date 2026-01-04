#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TSiJUKEBOX - Script de Automação para ARIA Labels
==================================================

Este script analisa componentes React/TSX e adiciona automaticamente
atributos ARIA para melhorar a acessibilidade.

Uso:
    python3 scripts/add-aria-labels.py --dry-run     # Simular alterações
    python3 scripts/add-aria-labels.py --report      # Gerar relatório
    python3 scripts/add-aria-labels.py --apply       # Aplicar alterações
    python3 scripts/add-aria-labels.py --file FILE   # Processar arquivo específico

Autor: B0yZ4kr14 + Manus AI
Versão: 1.0.0
"""

import re
import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from datetime import datetime

# =============================================================================
# CONFIGURAÇÃO
# =============================================================================

SRC_DIR = Path("src/components")
REPORT_FILE = Path("docs/accessibility/ARIA_AUDIT_REPORT.md")

# Padrões de inferência de aria-label baseados no contexto
ARIA_INFERENCE_PATTERNS = {
    # Player controls
    r'onClick=\{(?:handle)?[Pp]lay(?:Pause)?\}': lambda m: 'aria-label={isPlaying ? "Pausar reprodução" : "Reproduzir"}',
    r'onClick=\{(?:handle)?[Pp]rev(?:ious)?\}': lambda m: 'aria-label="Faixa anterior"',
    r'onClick=\{(?:handle)?[Nn]ext\}': lambda m: 'aria-label="Próxima faixa"',
    r'onClick=\{(?:handle)?[Ss]top\}': lambda m: 'aria-label="Parar reprodução"',
    r'onClick=\{(?:handle)?[Ss]huffle': lambda m: 'aria-label={shuffle ? "Desativar modo aleatório" : "Ativar modo aleatório"}',
    r'onClick=\{(?:handle)?[Rr]epeat': lambda m: 'aria-label="Alternar modo de repetição"',
    
    # Volume controls
    r'onClick=\{(?:handle)?[Mm]ute': lambda m: 'aria-label={isMuted ? "Ativar som" : "Silenciar"}',
    r'onChange=\{(?:handle)?[Vv]olume': lambda m: 'aria-label="Ajustar volume"',
    
    # Navigation
    r'onClick=\{(?:handle)?[Tt]oggle[Mm]enu\}': lambda m: 'aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}',
    r'onClick=\{(?:handle)?[Tt]oggle[Ss]idebar\}': lambda m: 'aria-label={isSidebarOpen ? "Fechar barra lateral" : "Abrir barra lateral"}',
    r'onClick=\{(?:handle)?[Tt]oggle[Nn]otifications?\}': lambda m: 'aria-label="Abrir notificações"',
    
    # Modal/Dialog
    r'onClick=\{(?:on)?[Cc]lose\}': lambda m: 'aria-label="Fechar"',
    r'onClick=\{(?:handle)?[Cc]ancel\}': lambda m: 'aria-label="Cancelar"',
    r'onClick=\{(?:handle)?[Cc]onfirm\}': lambda m: 'aria-label="Confirmar"',
    r'onClick=\{(?:handle)?[Ss]ubmit\}': lambda m: 'aria-label="Enviar"',
    r'onClick=\{(?:handle)?[Ss]ave\}': lambda m: 'aria-label="Salvar"',
    r'onClick=\{(?:handle)?[Dd]elete\}': lambda m: 'aria-label="Excluir"',
    
    # Expansion/Collapse
    r'onClick=\{.*[Tt]oggle.*[Ee]xpand': lambda m: 'aria-label={isExpanded ? "Recolher" : "Expandir"}',
    r'onClick=\{.*set[Ss]how': lambda m: 'aria-expanded={isShown}',
    
    # Search
    r'onClick=\{(?:handle)?[Ss]earch\}': lambda m: 'aria-label="Pesquisar"',
    r'onClick=\{(?:handle)?[Cc]lear[Ss]earch\}': lambda m: 'aria-label="Limpar pesquisa"',
    
    # Filters
    r'onClick=\{.*[Ff]ilter': lambda m: 'aria-label="Aplicar filtro"',
    r'onClick=\{.*[Cc]lear[Ff]ilter': lambda m: 'aria-label="Limpar filtros"',
    
    # Pagination
    r'onClick=\{.*[Pp]rev(?:ious)?[Pp]age': lambda m: 'aria-label="Página anterior"',
    r'onClick=\{.*[Nn]ext[Pp]age': lambda m: 'aria-label="Próxima página"',
    
    # Settings
    r'onClick=\{(?:handle)?[Ss]ettings?\}': lambda m: 'aria-label="Abrir configurações"',
    r'onClick=\{(?:handle)?[Ee]dit\}': lambda m: 'aria-label="Editar"',
    r'onClick=\{(?:handle)?[Rr]efresh\}': lambda m: 'aria-label="Atualizar"',
    
    # Social/Share
    r'onClick=\{(?:handle)?[Ss]hare\}': lambda m: 'aria-label="Compartilhar"',
    r'onClick=\{(?:handle)?[Ll]ike\}': lambda m: 'aria-label={isLiked ? "Remover curtida" : "Curtir"}',
    
    # Add/Remove
    r'onClick=\{(?:handle)?[Aa]dd': lambda m: 'aria-label="Adicionar"',
    r'onClick=\{(?:handle)?[Rr]emove': lambda m: 'aria-label="Remover"',
}

# Ícones comuns e seus aria-labels
ICON_ARIA_LABELS = {
    'PlayIcon': 'Reproduzir',
    'PauseIcon': 'Pausar',
    'StopIcon': 'Parar',
    'SkipBack': 'Faixa anterior',
    'SkipForward': 'Próxima faixa',
    'Volume2': 'Volume',
    'VolumeX': 'Silenciado',
    'Shuffle': 'Modo aleatório',
    'Repeat': 'Repetir',
    'Repeat1': 'Repetir faixa',
    'Heart': 'Favorito',
    'HeartOff': 'Remover dos favoritos',
    'Plus': 'Adicionar',
    'Minus': 'Remover',
    'X': 'Fechar',
    'Check': 'Confirmar',
    'Search': 'Pesquisar',
    'Settings': 'Configurações',
    'Menu': 'Menu',
    'Bell': 'Notificações',
    'User': 'Usuário',
    'Home': 'Início',
    'ChevronLeft': 'Anterior',
    'ChevronRight': 'Próximo',
    'ChevronUp': 'Expandir',
    'ChevronDown': 'Recolher',
    'Maximize2': 'Tela cheia',
    'Minimize2': 'Sair da tela cheia',
    'Download': 'Baixar',
    'Upload': 'Enviar',
    'Trash': 'Excluir',
    'Edit': 'Editar',
    'Copy': 'Copiar',
    'Share': 'Compartilhar',
    'ExternalLink': 'Abrir em nova aba',
    'RefreshCw': 'Atualizar',
    'Filter': 'Filtrar',
    'SortAsc': 'Ordenar crescente',
    'SortDesc': 'Ordenar decrescente',
}

# =============================================================================
# CLASSES DE DADOS
# =============================================================================

@dataclass
class AriaIssue:
    """Representa um problema de ARIA encontrado."""
    file: str
    line: int
    element: str
    issue_type: str
    suggestion: str
    severity: str = "warning"  # error, warning, info
    
@dataclass
class AriaFix:
    """Representa uma correção de ARIA a ser aplicada."""
    file: str
    line: int
    original: str
    fixed: str
    confidence: float = 1.0

@dataclass
class AuditResult:
    """Resultado da auditoria de ARIA."""
    total_files: int = 0
    total_elements: int = 0
    issues: List[AriaIssue] = field(default_factory=list)
    fixes: List[AriaFix] = field(default_factory=list)
    already_accessible: int = 0

# =============================================================================
# FUNÇÕES DE ANÁLISE
# =============================================================================

def find_buttons_without_aria(content: str, filepath: str) -> List[AriaIssue]:
    """Encontra botões sem aria-label."""
    issues = []
    lines = content.split('\n')
    
    # Padrão para encontrar botões
    button_pattern = re.compile(r'<button([^>]*)>', re.DOTALL)
    
    for i, line in enumerate(lines, 1):
        for match in button_pattern.finditer(line):
            attrs = match.group(1)
            
            # Verificar se já tem aria-label
            if 'aria-label' not in attrs:
                # Tentar inferir aria-label
                suggestion = infer_aria_label(attrs, line)
                
                issues.append(AriaIssue(
                    file=filepath,
                    line=i,
                    element='button',
                    issue_type='missing_aria_label',
                    suggestion=suggestion,
                    severity='error'
                ))
            
            # Verificar se tem type
            if 'type=' not in attrs:
                issues.append(AriaIssue(
                    file=filepath,
                    line=i,
                    element='button',
                    issue_type='missing_type',
                    suggestion='type="button"',
                    severity='warning'
                ))
    
    return issues

def find_clickable_divs(content: str, filepath: str) -> List[AriaIssue]:
    """Encontra divs clicáveis sem role e aria-label."""
    issues = []
    lines = content.split('\n')
    
    # Padrão para divs com onClick
    div_pattern = re.compile(r'<div([^>]*onClick[^>]*)>', re.DOTALL)
    
    for i, line in enumerate(lines, 1):
        for match in div_pattern.finditer(line):
            attrs = match.group(1)
            
            if 'role=' not in attrs:
                issues.append(AriaIssue(
                    file=filepath,
                    line=i,
                    element='div',
                    issue_type='clickable_without_role',
                    suggestion='role="button" tabIndex={0}',
                    severity='error'
                ))
            
            if 'aria-label' not in attrs:
                issues.append(AriaIssue(
                    file=filepath,
                    line=i,
                    element='div',
                    issue_type='missing_aria_label',
                    suggestion='aria-label="PREENCHER"',
                    severity='error'
                ))
    
    return issues

def find_images_without_alt(content: str, filepath: str) -> List[AriaIssue]:
    """Encontra imagens sem alt text."""
    issues = []
    lines = content.split('\n')
    
    # Padrão para imagens
    img_pattern = re.compile(r'<img([^>]*)/?>', re.DOTALL)
    
    for i, line in enumerate(lines, 1):
        for match in img_pattern.finditer(line):
            attrs = match.group(1)
            
            if 'alt=' not in attrs:
                issues.append(AriaIssue(
                    file=filepath,
                    line=i,
                    element='img',
                    issue_type='missing_alt',
                    suggestion='alt="Descrição da imagem"',
                    severity='error'
                ))
    
    return issues

def find_icons_without_aria_hidden(content: str, filepath: str) -> List[AriaIssue]:
    """Encontra ícones que deveriam ter aria-hidden."""
    issues = []
    lines = content.split('\n')
    
    # Padrão para ícones comuns (Lucide, etc)
    icon_pattern = re.compile(r'<([A-Z][a-zA-Z]+Icon|' + '|'.join(ICON_ARIA_LABELS.keys()) + r')([^>]*)/?>')
    
    for i, line in enumerate(lines, 1):
        for match in icon_pattern.finditer(line):
            icon_name = match.group(1)
            attrs = match.group(2)
            
            # Se o ícone está dentro de um botão com aria-label, deve ter aria-hidden
            if 'aria-hidden' not in attrs:
                issues.append(AriaIssue(
                    file=filepath,
                    line=i,
                    element=icon_name,
                    issue_type='icon_without_aria_hidden',
                    suggestion='aria-hidden="true"',
                    severity='info'
                ))
    
    return issues

def infer_aria_label(attrs: str, context: str) -> str:
    """Tenta inferir o aria-label baseado no contexto."""
    # Verificar padrões conhecidos
    for pattern, label_func in ARIA_INFERENCE_PATTERNS.items():
        if re.search(pattern, attrs) or re.search(pattern, context):
            return label_func(None)
    
    # Verificar ícones no contexto
    for icon, label in ICON_ARIA_LABELS.items():
        if icon in context:
            return f'aria-label="{label}"'
    
    # Verificar texto visível
    text_match = re.search(r'>([^<]+)</', context)
    if text_match:
        text = text_match.group(1).strip()
        if text and len(text) < 50:
            return f'aria-label="{text}"'
    
    return 'aria-label="PREENCHER"'

# =============================================================================
# FUNÇÕES DE CORREÇÃO
# =============================================================================

def generate_fix(issue: AriaIssue, content: str) -> Optional[AriaFix]:
    """Gera uma correção para um problema de ARIA."""
    lines = content.split('\n')
    if issue.line > len(lines):
        return None
    
    original_line = lines[issue.line - 1]
    fixed_line = original_line
    
    if issue.issue_type == 'missing_aria_label':
        if issue.element == 'button':
            # Adicionar aria-label após <button
            fixed_line = re.sub(
                r'<button(\s)',
                f'<button {issue.suggestion}\\1',
                original_line
            )
        elif issue.element == 'div':
            fixed_line = re.sub(
                r'<div(\s)',
                f'<div {issue.suggestion}\\1',
                original_line
            )
    
    elif issue.issue_type == 'missing_type':
        fixed_line = re.sub(
            r'<button(\s)',
            '<button type="button"\\1',
            original_line
        )
    
    elif issue.issue_type == 'clickable_without_role':
        fixed_line = re.sub(
            r'<div(\s)',
            '<div role="button" tabIndex={0}\\1',
            original_line
        )
    
    elif issue.issue_type == 'missing_alt':
        fixed_line = re.sub(
            r'<img(\s)',
            '<img alt=""\\1',
            original_line
        )
    
    elif issue.issue_type == 'icon_without_aria_hidden':
        # Adicionar aria-hidden ao ícone
        icon_pattern = re.compile(r'<(' + issue.element + r')(\s)')
        fixed_line = icon_pattern.sub(r'<\1 aria-hidden="true"\2', original_line)
    
    if fixed_line != original_line:
        return AriaFix(
            file=issue.file,
            line=issue.line,
            original=original_line,
            fixed=fixed_line,
            confidence=0.8 if 'PREENCHER' in issue.suggestion else 1.0
        )
    
    return None

def apply_fixes(fixes: List[AriaFix], dry_run: bool = True) -> int:
    """Aplica as correções aos arquivos."""
    files_modified = {}
    
    # Agrupar fixes por arquivo
    for fix in fixes:
        if fix.file not in files_modified:
            files_modified[fix.file] = []
        files_modified[fix.file].append(fix)
    
    count = 0
    for filepath, file_fixes in files_modified.items():
        # Ordenar por linha (decrescente para não afetar índices)
        file_fixes.sort(key=lambda f: f.line, reverse=True)
        
        content = Path(filepath).read_text()
        lines = content.split('\n')
        
        for fix in file_fixes:
            if fix.line <= len(lines):
                lines[fix.line - 1] = fix.fixed
                count += 1
        
        new_content = '\n'.join(lines)
        
        if dry_run:
            print(f"[DRY-RUN] Modificaria {filepath} ({len(file_fixes)} alterações)")
        else:
            Path(filepath).write_text(new_content)
            print(f"[APLICADO] {filepath} ({len(file_fixes)} alterações)")
    
    return count

# =============================================================================
# FUNÇÕES DE RELATÓRIO
# =============================================================================

def generate_report(result: AuditResult) -> str:
    """Gera relatório em Markdown."""
    report = f"""# Relatório de Auditoria ARIA - TSiJUKEBOX

> **Data:** {datetime.now().strftime('%d/%m/%Y %H:%M')}  
> **Arquivos analisados:** {result.total_files}  
> **Elementos analisados:** {result.total_elements}

---

## 📊 Resumo

| Métrica | Valor |
|---------|-------|
| **Total de problemas** | {len(result.issues)} |
| **Correções geradas** | {len(result.fixes)} |
| **Elementos já acessíveis** | {result.already_accessible} |
| **Taxa de conformidade** | {result.already_accessible / max(result.total_elements, 1) * 100:.1f}% |

---

## 🔴 Problemas por Severidade

| Severidade | Quantidade |
|------------|------------|
| **Erro** | {len([i for i in result.issues if i.severity == 'error'])} |
| **Aviso** | {len([i for i in result.issues if i.severity == 'warning'])} |
| **Info** | {len([i for i in result.issues if i.severity == 'info'])} |

---

## 📁 Problemas por Arquivo

"""
    
    # Agrupar por arquivo
    issues_by_file = {}
    for issue in result.issues:
        if issue.file not in issues_by_file:
            issues_by_file[issue.file] = []
        issues_by_file[issue.file].append(issue)
    
    for filepath, issues in sorted(issues_by_file.items()):
        report += f"\n### `{filepath}`\n\n"
        report += "| Linha | Elemento | Problema | Sugestão |\n"
        report += "|-------|----------|----------|----------|\n"
        for issue in issues:
            report += f"| {issue.line} | `{issue.element}` | {issue.issue_type} | `{issue.suggestion}` |\n"
    
    report += """
---

## 🔧 Próximos Passos

1. Executar `python3 scripts/add-aria-labels.py --apply` para aplicar correções automáticas
2. Revisar manualmente os itens marcados com "PREENCHER"
3. Testar com leitores de tela (VoiceOver, NVDA)
4. Executar `npm run a11y:audit` para validação final

---

*Relatório gerado automaticamente pelo script add-aria-labels.py*
"""
    
    return report

# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

def audit_file(filepath: Path) -> Tuple[List[AriaIssue], int, int]:
    """Audita um arquivo TSX."""
    content = filepath.read_text()
    issues = []
    
    # Contar elementos
    buttons = len(re.findall(r'<button', content))
    divs_clickable = len(re.findall(r'<div[^>]*onClick', content))
    images = len(re.findall(r'<img', content))
    total = buttons + divs_clickable + images
    
    # Encontrar problemas
    issues.extend(find_buttons_without_aria(content, str(filepath)))
    issues.extend(find_clickable_divs(content, str(filepath)))
    issues.extend(find_images_without_alt(content, str(filepath)))
    issues.extend(find_icons_without_aria_hidden(content, str(filepath)))
    
    # Contar elementos já acessíveis
    accessible = len(re.findall(r'aria-label=', content))
    
    return issues, total, accessible

def main():
    parser = argparse.ArgumentParser(
        description="Auditoria e correção de ARIA labels para TSiJUKEBOX"
    )
    parser.add_argument('--dry-run', action='store_true', 
                        help='Simular alterações sem aplicar')
    parser.add_argument('--report', action='store_true',
                        help='Gerar relatório de auditoria')
    parser.add_argument('--apply', action='store_true',
                        help='Aplicar correções automaticamente')
    parser.add_argument('--file', type=str,
                        help='Processar arquivo específico')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Saída detalhada')
    
    args = parser.parse_args()
    
    # Determinar arquivos a processar
    if args.file:
        files = [Path(args.file)]
    else:
        files = list(SRC_DIR.rglob('*.tsx'))
        files = [f for f in files if '__tests__' not in str(f)]
    
    print(f"🔍 Analisando {len(files)} arquivos...")
    
    result = AuditResult()
    result.total_files = len(files)
    
    for filepath in files:
        issues, total, accessible = audit_file(filepath)
        result.issues.extend(issues)
        result.total_elements += total
        result.already_accessible += accessible
        
        if args.verbose and issues:
            print(f"  📄 {filepath}: {len(issues)} problemas")
    
    # Gerar correções
    for issue in result.issues:
        content = Path(issue.file).read_text()
        fix = generate_fix(issue, content)
        if fix:
            result.fixes.append(fix)
    
    print(f"\n📊 Resultado da Auditoria:")
    print(f"   - Arquivos: {result.total_files}")
    print(f"   - Elementos: {result.total_elements}")
    print(f"   - Problemas: {len(result.issues)}")
    print(f"   - Correções: {len(result.fixes)}")
    print(f"   - Já acessíveis: {result.already_accessible}")
    
    # Gerar relatório
    if args.report:
        report = generate_report(result)
        REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
        REPORT_FILE.write_text(report)
        print(f"\n📝 Relatório salvo em: {REPORT_FILE}")
    
    # Aplicar correções
    if args.apply or args.dry_run:
        print(f"\n{'🔧 Simulando' if args.dry_run else '🔧 Aplicando'} correções...")
        count = apply_fixes(result.fixes, dry_run=not args.apply)
        print(f"   - {'Seriam aplicadas' if args.dry_run else 'Aplicadas'}: {count} correções")
    
    # Mostrar próximos passos
    if not args.apply and result.fixes:
        print(f"\n💡 Próximo passo: Execute com --apply para aplicar as correções")
    
    return 0 if not result.issues else 1

if __name__ == '__main__':
    sys.exit(main())
