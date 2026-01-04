#!/usr/bin/env python3
"""
TSiJUKEBOX - Correção de Opacidade Crítica (opacity-30/40)
==========================================================

Este script corrige automaticamente ocorrências de opacity-30 e opacity-40
que afetam a acessibilidade, substituindo por alternativas com contraste adequado.

Regras de correção:
1. Ícones decorativos (aria-hidden="true") → Manter opacity-30, é intencional
2. Texto legível → Substituir por cor sólida
3. Estados visuais (blur, background) → Manter, não afeta leitura
4. Linhas passadas em karaokê → Substituir opacity-40 por opacity-60

Uso:
    python3 scripts/fix-critical-opacity.py --dry-run
    python3 scripts/fix-critical-opacity.py --apply
"""

import re
import argparse
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass
from typing import List, Tuple, Optional

# Diretório base
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
BACKUP_DIR = BASE_DIR / "backups" / "opacity-fixes"

@dataclass
class OpacityFix:
    """Representa uma correção de opacidade."""
    file: str
    line: int
    original: str
    fixed: str
    reason: str
    action: str  # 'fix', 'skip', 'manual'


def analyze_context(line: str, full_content: str, line_num: int) -> Tuple[str, str, str]:
    """
    Analisa o contexto da linha e determina a ação apropriada.
    Retorna: (ação, substituição, razão)
    """
    
    # 1. Ícones decorativos com aria-hidden - MANTER
    if 'aria-hidden="true"' in line and 'opacity-30' in line:
        return ('skip', line, 'Ícone decorativo com aria-hidden - OK para acessibilidade')
    
    # 2. Ícones sem aria-hidden mas claramente decorativos (className com Icon)
    if re.search(r'<\w+Icon|Icon\s|className="[^"]*icon', line, re.IGNORECASE):
        if 'opacity-30' in line:
            # Adicionar aria-hidden se não tiver
            if 'aria-hidden' not in line:
                fixed = re.sub(
                    r'(<\w+)(\s+className="[^"]*opacity-30)',
                    r'\1 aria-hidden="true"\2',
                    line
                )
                if fixed != line:
                    return ('fix', fixed, 'Adicionado aria-hidden a ícone decorativo')
            return ('skip', line, 'Ícone decorativo - OK')
    
    # 3. Efeitos visuais (blur, background, absolute) - MANTER
    if any(x in line.lower() for x in ['blur', 'background', 'bg-', 'absolute', 'rounded-full']):
        return ('skip', line, 'Efeito visual/background - não afeta leitura')
    
    # 4. Karaokê - linhas passadas (opacity-40) → opacity-60
    if 'isPastLine' in line and 'opacity-40' in line:
        fixed = line.replace('opacity-40', 'opacity-60')
        return ('fix', fixed, 'Karaokê: aumentado contraste de linhas passadas')
    
    # 5. Calendar - aria-selected com opacity-30 → opacity-50
    if 'aria-selected' in line and 'opacity-30' in line:
        fixed = line.replace('opacity-30', 'opacity-50')
        return ('fix', fixed, 'Calendar: aumentado contraste de dias selecionados')
    
    # 6. Texto com opacity-30 em contexto de mensagem/empty state
    if any(x in line.lower() for x in ['mb-3', 'mb-4', 'mx-auto', 'text-center']):
        # Provavelmente é um ícone em empty state
        if 'className=' in line and 'opacity-30' in line:
            # Verificar se é um ícone Lucide
            if re.search(r'<[A-Z][a-zA-Z]+\s', line):
                if 'aria-hidden' not in line:
                    # Adicionar aria-hidden
                    fixed = re.sub(
                        r'(<[A-Z][a-zA-Z]+)(\s)',
                        r'\1 aria-hidden="true"\2',
                        line
                    )
                    return ('fix', fixed, 'Adicionado aria-hidden a ícone de empty state')
                return ('skip', line, 'Ícone de empty state com aria-hidden - OK')
    
    # 7. Outros casos de opacity-30 em texto - marcar para revisão manual
    if 'opacity-30' in line:
        return ('manual', line, 'Requer análise manual - contexto não identificado')
    
    # 8. opacity-40 genérico - aumentar para opacity-60
    if 'opacity-40' in line:
        fixed = line.replace('opacity-40', 'opacity-60')
        return ('fix', fixed, 'Aumentado opacity-40 para opacity-60 (melhor contraste)')
    
    return ('skip', line, 'Sem alteração necessária')


def process_file(filepath: Path, dry_run: bool = True) -> List[OpacityFix]:
    """Processa um arquivo e aplica correções de opacidade."""
    
    fixes = []
    
    try:
        content = filepath.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Erro ao ler {filepath}: {e}")
        return fixes
    
    lines = content.split('\n')
    new_lines = []
    modified = False
    
    rel_path = str(filepath.relative_to(BASE_DIR))
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # Verificar se a linha contém opacity-30 ou opacity-40
        if 'opacity-30' in line or 'opacity-40' in line:
            action, fixed_line, reason = analyze_context(line, content, line_num)
            
            fix = OpacityFix(
                file=rel_path,
                line=line_num,
                original=line.strip(),
                fixed=fixed_line.strip() if fixed_line != line else '',
                reason=reason,
                action=action
            )
            fixes.append(fix)
            
            if action == 'fix' and fixed_line != line:
                new_lines.append(fixed_line)
                modified = True
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    # Salvar alterações se não for dry-run
    if not dry_run and modified:
        # Criar backup
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        backup_name = f"{filepath.stem}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{filepath.suffix}"
        backup_path = BACKUP_DIR / backup_name
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Salvar arquivo modificado
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
    
    return fixes


def main():
    parser = argparse.ArgumentParser(
        description='Corrige opacidade crítica (opacity-30/40) no TSiJUKEBOX'
    )
    parser.add_argument('--dry-run', action='store_true',
                        help='Simular alterações sem aplicar')
    parser.add_argument('--apply', action='store_true',
                        help='Aplicar alterações')
    
    args = parser.parse_args()
    
    if not any([args.dry_run, args.apply]):
        args.dry_run = True
    
    start_time = datetime.now()
    
    print("=" * 70)
    print("🔧 TSiJUKEBOX - Correção de Opacidade Crítica (Fase 1)")
    print("=" * 70)
    print(f"⏱️ Início: {start_time.strftime('%H:%M:%S')}")
    print()
    
    # Coletar arquivos
    files = list(SRC_DIR.rglob('*.tsx'))
    print(f"🔍 Analisando {len(files)} arquivos...")
    
    all_fixes = []
    files_modified = 0
    
    for filepath in files:
        fixes = process_file(filepath, dry_run=not args.apply)
        if fixes:
            all_fixes.extend(fixes)
            if any(f.action == 'fix' for f in fixes):
                files_modified += 1
    
    # Estatísticas
    fixed = [f for f in all_fixes if f.action == 'fix']
    skipped = [f for f in all_fixes if f.action == 'skip']
    manual = [f for f in all_fixes if f.action == 'manual']
    
    print()
    print("📊 RESULTADOS")
    print("-" * 50)
    print(f"   Total de ocorrências analisadas: {len(all_fixes)}")
    print(f"   ✅ Corrigidas automaticamente: {len(fixed)}")
    print(f"   ⏭️ Ignoradas (OK): {len(skipped)}")
    print(f"   🔍 Requerem análise manual: {len(manual)}")
    print(f"   📁 Arquivos modificados: {files_modified}")
    print()
    
    # Detalhes das correções
    if fixed:
        print("✅ CORREÇÕES APLICADAS:")
        print("-" * 50)
        for fix in fixed:
            print(f"   📁 {fix.file}:{fix.line}")
            print(f"      Razão: {fix.reason}")
            if fix.fixed:
                print(f"      Antes: {fix.original[:60]}...")
                print(f"      Depois: {fix.fixed[:60]}...")
            print()
    
    # Itens ignorados
    if skipped:
        print("⏭️ IGNORADOS (já estão OK):")
        print("-" * 50)
        for fix in skipped[:10]:  # Mostrar apenas os 10 primeiros
            print(f"   📁 {fix.file}:{fix.line} - {fix.reason}")
        if len(skipped) > 10:
            print(f"   ... e mais {len(skipped) - 10} itens")
        print()
    
    # Itens para revisão manual
    if manual:
        print("🔍 REQUEREM ANÁLISE MANUAL:")
        print("-" * 50)
        for fix in manual:
            print(f"   📁 {fix.file}:{fix.line}")
            print(f"      Contexto: {fix.original[:70]}...")
        print()
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print("=" * 70)
    print(f"⏱️ Tempo total: {duration:.1f} segundos")
    print("=" * 70)
    
    if args.apply:
        print("✅ Alterações aplicadas!")
        print(f"📦 Backups salvos em: {BACKUP_DIR}")
    else:
        print("💡 Execute com --apply para aplicar as alterações")


if __name__ == '__main__':
    main()
