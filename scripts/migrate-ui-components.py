#!/usr/bin/env python3
"""
TSiJUKEBOX UI Components Migration Script

Automatiza a migração de componentes UI antigos para os novos componentes temáticos.

Uso:
    python3 scripts/migrate-ui-components.py --analyze          # Analisar arquivos
    python3 scripts/migrate-ui-components.py --dry-run          # Simular migração
    python3 scripts/migrate-ui-components.py --migrate FILE     # Migrar arquivo específico
    python3 scripts/migrate-ui-components.py --migrate-all      # Migrar todos os arquivos
    python3 scripts/migrate-ui-components.py --report           # Gerar relatório

Autor: TSiJUKEBOX Team
Versão: 1.0.0
"""

import os
import re
import sys
import argparse
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"
PAGES_DIR = SRC_DIR / "pages"
COMPONENTS_DIR = SRC_DIR / "components"
BACKUP_DIR = PROJECT_ROOT / "backups" / "ui-migration"

# Arquivos prioritários para migração
PRIORITY_FILES = [
    "src/pages/public/Help.tsx",
    "src/pages/public/SetupWizard.tsx",
    "src/pages/brand/BrandGuidelines.tsx",
    "src/pages/settings/SystemDiagnostics.tsx",
    "src/pages/public/DesignSystem.tsx",
    "src/pages/settings/Settings.tsx",
    "src/pages/dashboards/Dashboard.tsx",
    "src/pages/public/LandingPage.tsx",
    "src/pages/spotify/SpotifyBrowser.tsx",
    "src/pages/public/Index.tsx",
]

# Mapeamento de imports antigos para novos
IMPORT_MAPPINGS = {
    # Button
    r'import\s*\{\s*Button\s*\}\s*from\s*["\']@/components/ui/button["\']':
        'import { Button } from "@/components/ui/themed"',
    
    # Card (com subcomponentes)
    r'import\s*\{\s*Card[^}]*\}\s*from\s*["\']@/components/ui/card["\']':
        'import { Card } from "@/components/ui/themed"',
    
    # Input
    r'import\s*\{\s*Input\s*\}\s*from\s*["\']@/components/ui/input["\']':
        'import { Input } from "@/components/ui/themed"',
    
    # Badge
    r'import\s*\{\s*Badge[^}]*\}\s*from\s*["\']@/components/ui/badge["\']':
        'import { Badge } from "@/components/ui/themed"',
    
    # Switch -> Toggle
    r'import\s*\{\s*Switch\s*\}\s*from\s*["\']@/components/ui/switch["\']':
        'import { Toggle } from "@/components/ui/themed"',
    
    # Slider
    r'import\s*\{\s*Slider\s*\}\s*from\s*["\']@/components/ui/slider["\']':
        'import { Slider } from "@/components/ui/themed"',
}

# Mapeamento de props de Button
BUTTON_VARIANT_MAPPINGS = {
    'variant="default"': 'variant="primary"',
    'variant="destructive"': 'variant="danger"',
    'variant="link"': 'variant="ghost"',
    'size="default"': 'size="md"',
    'size="icon"': 'size="xs"',
}

# Padrões de Card antigo para remover/substituir
CARD_PATTERNS = {
    r'<CardHeader[^>]*>': '<!-- CardHeader removed -->',
    r'</CardHeader>': '',
    r'<CardTitle[^>]*>': '<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">',
    r'</CardTitle>': '</h3>',
    r'<CardDescription[^>]*>': '<p className="text-sm text-[var(--text-muted)]">',
    r'</CardDescription>': '</p>',
    r'<CardContent[^>]*>': '<div className="mt-4">',
    r'</CardContent>': '</div>',
    r'<CardFooter[^>]*>': '<div className="mt-4 flex justify-end gap-2">',
    r'</CardFooter>': '</div>',
}

# ============================================================================
# CLASSES DE DADOS
# ============================================================================

@dataclass
class ComponentUsage:
    """Representa o uso de um componente em um arquivo."""
    component: str
    count: int
    lines: List[int] = field(default_factory=list)

@dataclass
class FileAnalysis:
    """Resultado da análise de um arquivo."""
    path: str
    lines: int
    components: Dict[str, ComponentUsage] = field(default_factory=dict)
    imports_to_update: List[str] = field(default_factory=list)
    props_to_update: List[Tuple[int, str, str]] = field(default_factory=list)
    migration_complexity: str = "low"  # low, medium, high

@dataclass
class MigrationResult:
    """Resultado da migração de um arquivo."""
    path: str
    success: bool
    backup_path: Optional[str] = None
    changes_made: int = 0
    errors: List[str] = field(default_factory=list)

# ============================================================================
# FUNÇÕES DE ANÁLISE
# ============================================================================

def analyze_file(file_path: Path) -> FileAnalysis:
    """Analisa um arquivo e retorna informações sobre componentes usados."""
    analysis = FileAnalysis(
        path=str(file_path),
        lines=0,
        components={},
        imports_to_update=[],
        props_to_update=[]
    )
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            analysis.lines = len(lines)
        
        # Analisar imports
        for pattern, replacement in IMPORT_MAPPINGS.items():
            if re.search(pattern, content):
                analysis.imports_to_update.append(pattern)
        
        # Contar uso de componentes
        components_to_check = ['Button', 'Card', 'Input', 'Badge', 'Switch', 'Slider', 'Toggle']
        for comp in components_to_check:
            # Contar ocorrências de <Component
            pattern = rf'<{comp}[\s>]'
            matches = list(re.finditer(pattern, content))
            if matches:
                line_numbers = []
                for match in matches:
                    line_num = content[:match.start()].count('\n') + 1
                    line_numbers.append(line_num)
                
                analysis.components[comp] = ComponentUsage(
                    component=comp,
                    count=len(matches),
                    lines=line_numbers
                )
        
        # Verificar props que precisam ser atualizadas
        for line_num, line in enumerate(lines, 1):
            for old_prop, new_prop in BUTTON_VARIANT_MAPPINGS.items():
                if old_prop in line:
                    analysis.props_to_update.append((line_num, old_prop, new_prop))
        
        # Determinar complexidade
        total_components = sum(c.count for c in analysis.components.values())
        if total_components > 50:
            analysis.migration_complexity = "high"
        elif total_components > 20:
            analysis.migration_complexity = "medium"
        else:
            analysis.migration_complexity = "low"
        
    except Exception as e:
        print(f"Erro ao analisar {file_path}: {e}")
    
    return analysis

def analyze_all_files() -> List[FileAnalysis]:
    """Analisa todos os arquivos de páginas."""
    analyses = []
    
    for tsx_file in list(PAGES_DIR.rglob("*.tsx")) + list(COMPONENTS_DIR.rglob("*.tsx")):
        if ".test." not in str(tsx_file):
            analysis = analyze_file(tsx_file)
            if analysis.imports_to_update or analysis.components:
                analyses.append(analysis)
    
    # Ordenar por complexidade (high primeiro)
    complexity_order = {"high": 0, "medium": 1, "low": 2}
    analyses.sort(key=lambda a: (complexity_order.get(a.migration_complexity, 3), -a.lines))
    
    return analyses

# ============================================================================
# FUNÇÕES DE MIGRAÇÃO
# ============================================================================

def create_backup(file_path: Path) -> Optional[Path]:
    """Cria backup do arquivo antes da migração."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
    backup_path = BACKUP_DIR / backup_name
    
    try:
        shutil.copy2(file_path, backup_path)
        return backup_path
    except Exception as e:
        print(f"Erro ao criar backup: {e}")
        return None

def migrate_imports(content: str) -> Tuple[str, int]:
    """Migra imports antigos para novos."""
    changes = 0
    
    for pattern, replacement in IMPORT_MAPPINGS.items():
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes += 1
    
    # Consolidar imports múltiplos do themed
    themed_imports = set()
    themed_pattern = r'import\s*\{\s*([^}]+)\s*\}\s*from\s*["\']@/components/ui/themed["\']'
    
    for match in re.finditer(themed_pattern, content):
        imports = [i.strip() for i in match.group(1).split(',')]
        themed_imports.update(imports)
    
    if len(themed_imports) > 1:
        # Remover imports individuais
        content = re.sub(themed_pattern, '', content)
        # Adicionar import consolidado
        consolidated = f'import {{ {", ".join(sorted(themed_imports))} }} from "@/components/ui/themed"'
        # Inserir após outros imports
        import_section_end = content.rfind('import ')
        if import_section_end != -1:
            line_end = content.find('\n', import_section_end)
            content = content[:line_end+1] + consolidated + '\n' + content[line_end+1:]
    
    return content, changes

def migrate_button_props(content: str) -> Tuple[str, int]:
    """Migra props de Button para o novo formato."""
    changes = 0
    
    for old_prop, new_prop in BUTTON_VARIANT_MAPPINGS.items():
        if old_prop in content:
            content = content.replace(old_prop, new_prop)
            changes += content.count(new_prop)
    
    return content, changes

def migrate_card_structure(content: str) -> Tuple[str, int]:
    """Migra estrutura de Card para o novo formato."""
    changes = 0
    
    for pattern, replacement in CARD_PATTERNS.items():
        matches = len(re.findall(pattern, content))
        if matches > 0:
            content = re.sub(pattern, replacement, content)
            changes += matches
    
    # Limpar comentários de migração
    content = re.sub(r'<!-- CardHeader removed -->\s*\n?', '', content)
    
    return content, changes

def migrate_file(file_path: Path, dry_run: bool = False) -> MigrationResult:
    """Migra um arquivo para usar os novos componentes."""
    result = MigrationResult(path=str(file_path), success=False)
    
    try:
        # Ler conteúdo
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        content = original_content
        total_changes = 0
        
        # Migrar imports
        content, changes = migrate_imports(content)
        total_changes += changes
        
        # Migrar props de Button
        content, changes = migrate_button_props(content)
        total_changes += changes
        
        # Migrar estrutura de Card
        content, changes = migrate_card_structure(content)
        total_changes += changes
        
        result.changes_made = total_changes
        
        if dry_run:
            print(f"\n[DRY-RUN] {file_path}")
            print(f"  Alterações que seriam feitas: {total_changes}")
            result.success = True
            return result
        
        if total_changes > 0:
            # Criar backup
            backup_path = create_backup(file_path)
            if backup_path:
                result.backup_path = str(backup_path)
            
            # Escrever conteúdo migrado
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Migrado: {file_path} ({total_changes} alterações)")
        else:
            print(f"⏭️  Sem alterações: {file_path}")
        
        result.success = True
        
    except Exception as e:
        result.errors.append(str(e))
        print(f"❌ Erro ao migrar {file_path}: {e}")
    
    return result

# ============================================================================
# FUNÇÕES DE RELATÓRIO
# ============================================================================

def generate_report(analyses: List[FileAnalysis]) -> str:
    """Gera relatório de análise em Markdown."""
    report = []
    report.append("# 📊 Relatório de Análise de Migração UI\n")
    report.append(f"**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
    report.append(f"**Arquivos analisados:** {len(analyses)}\n")
    
    # Estatísticas gerais
    total_buttons = sum(a.components.get('Button', ComponentUsage('Button', 0)).count for a in analyses)
    total_cards = sum(a.components.get('Card', ComponentUsage('Card', 0)).count for a in analyses)
    total_inputs = sum(a.components.get('Input', ComponentUsage('Input', 0)).count for a in analyses)
    
    report.append("\n## 📈 Estatísticas Gerais\n")
    report.append(f"| Componente | Total de Ocorrências |")
    report.append(f"|------------|---------------------|")
    report.append(f"| Button | {total_buttons} |")
    report.append(f"| Card | {total_cards} |")
    report.append(f"| Input | {total_inputs} |")
    
    # Arquivos por complexidade
    high = [a for a in analyses if a.migration_complexity == "high"]
    medium = [a for a in analyses if a.migration_complexity == "medium"]
    low = [a for a in analyses if a.migration_complexity == "low"]
    
    report.append("\n## 🎯 Arquivos por Complexidade\n")
    report.append(f"- 🔴 Alta: {len(high)} arquivos")
    report.append(f"- 🟡 Média: {len(medium)} arquivos")
    report.append(f"- 🟢 Baixa: {len(low)} arquivos")
    
    # Detalhes por arquivo
    report.append("\n## 📁 Detalhes por Arquivo\n")
    
    for analysis in analyses:
        emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(analysis.migration_complexity, "⚪")
        report.append(f"\n### {emoji} `{analysis.path}`\n")
        report.append(f"- **Linhas:** {analysis.lines}")
        report.append(f"- **Complexidade:** {analysis.migration_complexity}")
        
        if analysis.components:
            report.append(f"- **Componentes:**")
            for comp, usage in analysis.components.items():
                report.append(f"  - {comp}: {usage.count} ocorrências")
        
        if analysis.imports_to_update:
            report.append(f"- **Imports a atualizar:** {len(analysis.imports_to_update)}")
        
        if analysis.props_to_update:
            report.append(f"- **Props a atualizar:** {len(analysis.props_to_update)}")
    
    return "\n".join(report)

def print_analysis_summary(analyses: List[FileAnalysis]):
    """Imprime resumo da análise no console."""
    print("\n" + "="*60)
    print("📊 RESUMO DA ANÁLISE DE MIGRAÇÃO")
    print("="*60)
    
    print(f"\n📁 Arquivos analisados: {len(analyses)}")
    
    total_buttons = sum(a.components.get('Button', ComponentUsage('Button', 0)).count for a in analyses)
    total_cards = sum(a.components.get('Card', ComponentUsage('Card', 0)).count for a in analyses)
    total_inputs = sum(a.components.get('Input', ComponentUsage('Input', 0)).count for a in analyses)
    
    print(f"\n📈 Componentes encontrados:")
    print(f"   Button: {total_buttons}")
    print(f"   Card: {total_cards}")
    print(f"   Input: {total_inputs}")
    
    high = len([a for a in analyses if a.migration_complexity == "high"])
    medium = len([a for a in analyses if a.migration_complexity == "medium"])
    low = len([a for a in analyses if a.migration_complexity == "low"])
    
    print(f"\n🎯 Complexidade:")
    print(f"   🔴 Alta: {high}")
    print(f"   🟡 Média: {medium}")
    print(f"   🟢 Baixa: {low}")
    
    print("\n" + "="*60)

# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="TSiJUKEBOX UI Components Migration Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 migrate-ui-components.py --analyze
  python3 migrate-ui-components.py --dry-run
  python3 migrate-ui-components.py --migrate src/pages/public/Help.tsx
  python3 migrate-ui-components.py --migrate-all
  python3 migrate-ui-components.py --report
        """
    )
    
    parser.add_argument('--analyze', action='store_true',
                        help='Analisar arquivos e mostrar resumo')
    parser.add_argument('--dry-run', action='store_true',
                        help='Simular migração sem fazer alterações')
    parser.add_argument('--migrate', type=str, metavar='FILE',
                        help='Migrar arquivo específico')
    parser.add_argument('--migrate-all', action='store_true',
                        help='Migrar todos os arquivos prioritários')
    parser.add_argument('--migrate-priority', action='store_true',
                        help='Migrar apenas arquivos de alta prioridade')
    parser.add_argument('--report', action='store_true',
                        help='Gerar relatório detalhado em Markdown')
    
    args = parser.parse_args()
    
    if not any([args.analyze, args.dry_run, args.migrate, args.migrate_all, 
                args.migrate_priority, args.report]):
        parser.print_help()
        return
    
    # Analisar arquivos
    print("🔍 Analisando arquivos...")
    analyses = analyze_all_files()
    
    if args.analyze:
        print_analysis_summary(analyses)
        return
    
    if args.report:
        report = generate_report(analyses)
        report_path = PROJECT_ROOT / "docs" / "migration" / "MIGRATION_ANALYSIS_REPORT.md"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 Relatório salvo em: {report_path}")
        return
    
    if args.dry_run:
        print("\n🔄 Simulando migração (dry-run)...")
        for analysis in analyses:
            migrate_file(Path(PROJECT_ROOT / analysis.path), dry_run=True)
        return
    
    if args.migrate:
        file_path = Path(args.migrate)
        if not file_path.is_absolute():
            file_path = PROJECT_ROOT / file_path
        
        if not file_path.exists():
            print(f"❌ Arquivo não encontrado: {file_path}")
            return
        
        result = migrate_file(file_path)
        if result.success:
            print(f"\n✅ Migração concluída: {result.changes_made} alterações")
            if result.backup_path:
                print(f"📦 Backup: {result.backup_path}")
        return
    
    if args.migrate_all or args.migrate_priority:
        files_to_migrate = PRIORITY_FILES if args.migrate_priority else [a.path for a in analyses]
        
        print(f"\n🔄 Migrando {len(files_to_migrate)} arquivos...")
        
        results = []
        for file_path in files_to_migrate:
            full_path = PROJECT_ROOT / file_path
            if full_path.exists():
                result = migrate_file(full_path)
                results.append(result)
        
        # Resumo
        successful = sum(1 for r in results if r.success)
        total_changes = sum(r.changes_made for r in results)
        
        print("\n" + "="*60)
        print("📊 RESUMO DA MIGRAÇÃO")
        print("="*60)
        print(f"✅ Arquivos migrados: {successful}/{len(results)}")
        print(f"📝 Total de alterações: {total_changes}")
        print("="*60)

if __name__ == "__main__":
    main()
