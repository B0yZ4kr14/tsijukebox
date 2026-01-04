# 📚 FAQ - Reutilização dos Scripts de Automação de Acessibilidade

**Versão:** 1.0  
**Data:** 2025-12-25  
**Audiência:** Time de Desenvolvimento  
**Projeto de Origem:** TSiJUKEBOX

---

## 📋 Índice

1. [Visão Geral](#1-visão-geral)
2. [Requisitos e Compatibilidade](#2-requisitos-e-compatibilidade)
3. [Instalação e Configuração](#3-instalação-e-configuração)
4. [Script: migrate-ui-components.py](#4-script-migrate-ui-componentspy)
5. [Script: add-aria-labels.py](#5-script-add-aria-labelspy)
6. [Script: fix-icon-button-aria.py](#6-script-fix-icon-button-ariapy)
7. [Script: fix-critical-opacity.py](#7-script-fix-critical-opacitypy)
8. [Script: audit-contrast-issues.py](#8-script-audit-contrast-issuespy)
9. [Customização e Extensão](#9-customização-e-extensão)
10. [Troubleshooting](#10-troubleshooting)
11. [Melhores Práticas](#11-melhores-práticas)

---

## 1. Visão Geral

### O que são esses scripts?

Uma suíte de 5 scripts Python desenvolvidos para automatizar tarefas de acessibilidade em projetos React/TypeScript:

| Script | Função | Correções |
|--------|--------|-----------|
| `migrate-ui-components.py` | Migração de componentes UI | 636 |
| `add-aria-labels.py` | Adição de atributos ARIA | 478 |
| `fix-icon-button-aria.py` | Correção de botões de ícone | 97 |
| `fix-critical-opacity.py` | Correção de problemas de contraste | 11 |
| `audit-contrast-issues.py` | Auditoria de contraste | N/A (relatório) |

### Qual a economia de tempo esperada?

Com base nos resultados do TSiJUKEBOX:

| Projeto | Arquivos | Tempo Manual | Tempo Automatizado | Economia |
|---------|----------|--------------|-------------------|----------|
| Pequeno | 50-100 | 8-12h | 15-30 min | 95% |
| Médio | 100-300 | 20-30h | 45-90 min | 95% |
| Grande | 300+ | 40-60h | 2-3h | 95% |

### Os scripts são seguros para usar em produção?

Sim, com as seguintes garantias:
- ✅ Backup automático de todos os arquivos modificados
- ✅ Modo dry-run para simular alterações
- ✅ Validação de sintaxe pós-modificação
- ✅ Logs detalhados de todas as alterações

---

## 2. Requisitos e Compatibilidade

### Quais são os requisitos de sistema?

```
Python >= 3.8
Node.js >= 16 (para validação de build)
```

### Com quais frameworks os scripts são compatíveis?

| Framework | Compatibilidade | Notas |
|-----------|-----------------|-------|
| React + TypeScript | ✅ Total | Testado extensivamente |
| React + JavaScript | ✅ Total | Funciona sem modificações |
| Next.js | ✅ Total | Compatível com estrutura de páginas |
| Remix | ⚠️ Parcial | Pode requerer ajustes de paths |
| Vue.js | ❌ Não | Sintaxe de template diferente |
| Angular | ❌ Não | Arquitetura diferente |

### Quais bibliotecas de componentes são suportadas?

| Biblioteca | Suporte | Script Relevante |
|------------|---------|------------------|
| shadcn/ui | ✅ Total | `migrate-ui-components.py` |
| Radix UI | ✅ Total | `add-aria-labels.py` |
| Lucide Icons | ✅ Total | `fix-icon-button-aria.py` |
| Heroicons | ⚠️ Parcial | Requer mapeamento customizado |
| Material UI | ⚠️ Parcial | Estrutura diferente |
| Chakra UI | ⚠️ Parcial | Já tem boa acessibilidade nativa |

### Posso usar em projetos com Tailwind CSS?

Sim! Os scripts foram desenvolvidos especificamente para projetos com Tailwind CSS. Eles:
- Reconhecem classes Tailwind
- Preservam classes existentes
- Adicionam classes de acessibilidade compatíveis

---

## 3. Instalação e Configuração

### Como copiar os scripts para meu projeto?

```bash
# Opção 1: Copiar pasta inteira
cp -r /path/to/tsijukebox/scripts /path/to/meu-projeto/

# Opção 2: Copiar scripts específicos
cp /path/to/tsijukebox/scripts/add-aria-labels.py /path/to/meu-projeto/scripts/

# Opção 3: Clonar como submódulo (recomendado para equipes)
git submodule add https://github.com/seu-org/a11y-scripts.git scripts/a11y
```

### Quais configurações preciso ajustar?

Cada script tem variáveis de configuração no início do arquivo:

```python
# Configurações principais (ajustar para seu projeto)
BASE_DIR = Path(__file__).parent.parent  # Raiz do projeto
SRC_DIR = BASE_DIR / "src"               # Diretório de código fonte
BACKUP_DIR = BASE_DIR / "backups"        # Diretório de backups

# Padrões de arquivo (ajustar se necessário)
FILE_PATTERNS = ["*.tsx", "*.jsx"]       # Extensões a processar
EXCLUDE_DIRS = ["node_modules", "dist"]  # Diretórios a ignorar
```

### Como verificar se a instalação está correta?

```bash
# Verificar versão do Python
python3 --version  # Deve ser >= 3.8

# Testar execução (dry-run)
python3 scripts/add-aria-labels.py --dry-run

# Saída esperada:
# 🔍 Analisando X arquivos...
# 📊 Resultados:
#    Arquivos analisados: X
#    ...
```

---

## 4. Script: migrate-ui-components.py

### Para que serve?

Migra imports de componentes UI de uma biblioteca para outra, refatorando automaticamente:
- Imports consolidados
- Subcomponentes (CardHeader → div, CardTitle → h3, etc.)
- Props renomeadas (variant="destructive" → variant="danger")

### Como adaptar para minha biblioteca de componentes?

Edite o mapeamento no início do script:

```python
# Mapeamento de imports (origem → destino)
IMPORT_MAPPINGS = {
    # Formato: 'import antigo': 'import novo'
    '@/components/ui/card': '@/components/ui/themed',
    '@/components/ui/button': '@/components/ui/themed',
    '@/components/ui/input': '@/components/ui/themed',
}

# Mapeamento de componentes
COMPONENT_MAPPINGS = {
    'CardHeader': {'tag': 'div', 'className': ''},
    'CardTitle': {'tag': 'h3', 'className': 'text-lg font-semibold'},
    'CardContent': {'tag': 'div', 'className': 'mt-4'},
}

# Mapeamento de props
PROP_MAPPINGS = {
    'variant="destructive"': 'variant="danger"',
    'size="icon"': 'size="xs"',
}
```

### Exemplo de uso:

```bash
# Dry-run (simular)
python3 scripts/migrate-ui-components.py --dry-run

# Migrar arquivo específico
python3 scripts/migrate-ui-components.py --migrate src/components/MyComponent.tsx

# Migrar todos os arquivos
python3 scripts/migrate-ui-components.py --migrate-all

# Gerar relatório
python3 scripts/migrate-ui-components.py --report
```

### O que fazer se a migração quebrar algo?

1. Restaurar do backup:
```bash
cp backups/ui-migration/MyComponent_20251225_*.tsx src/components/MyComponent.tsx
```

2. Verificar o log de alterações:
```bash
cat /tmp/migration_log.txt
```

3. Ajustar o mapeamento e re-executar

---

## 5. Script: add-aria-labels.py

### Para que serve?

Adiciona automaticamente atributos `aria-label` a elementos interativos que não possuem texto visível ou label associado.

### Como funciona a detecção?

O script analisa:
1. Botões sem texto interno
2. Inputs sem label associado
3. Links com apenas ícones
4. Elementos com `onClick` sem identificação

### Como customizar os labels gerados?

Edite o dicionário de mapeamento:

```python
# Mapeamento de contexto para labels
CONTEXT_TO_LABEL = {
    'close': 'Fechar',
    'delete': 'Excluir',
    'edit': 'Editar',
    'save': 'Salvar',
    'search': 'Pesquisar',
    'menu': 'Menu',
    'settings': 'Configurações',
    # Adicione seus próprios mapeamentos
    'custom-action': 'Minha Ação Customizada',
}

# Mapeamento de ícones para labels
ICON_TO_LABEL = {
    'X': 'Fechar',
    'Trash': 'Excluir',
    'Edit': 'Editar',
    # Adicione ícones do seu projeto
    'MyCustomIcon': 'Meu Label Customizado',
}
```

### Como adicionar suporte a novos idiomas?

Crie um arquivo de traduções:

```python
# translations/pt-BR.py
LABELS = {
    'close': 'Fechar',
    'delete': 'Excluir',
    ...
}

# translations/en-US.py
LABELS = {
    'close': 'Close',
    'delete': 'Delete',
    ...
}
```

E importe no script:

```python
from translations.pt_BR import LABELS as CONTEXT_TO_LABEL
```

### Exemplo de uso:

```bash
# Ver correções necessárias
python3 scripts/add-aria-labels.py --dry-run

# Aplicar correções
python3 scripts/add-aria-labels.py --apply

# Processar arquivo específico
python3 scripts/add-aria-labels.py --apply --file src/components/Header.tsx
```

---

## 6. Script: fix-icon-button-aria.py

### Para que serve?

Adiciona `aria-label` especificamente a botões que contêm apenas ícones (sem texto visível).

### Qual a diferença para o add-aria-labels.py?

| Aspecto | add-aria-labels.py | fix-icon-button-aria.py |
|---------|-------------------|------------------------|
| Escopo | Todos os elementos | Apenas botões de ícone |
| Detecção | Contexto geral | Análise de ícone interno |
| Precisão | Média | Alta |
| Falsos positivos | Alguns | Raros |

### Como adicionar novos ícones ao mapeamento?

```python
ICON_TO_LABEL = {
    # Ícones Lucide (padrão)
    'ArrowLeft': 'Voltar',
    'ArrowRight': 'Avançar',
    
    # Adicione ícones customizados
    'MyPlayIcon': 'Reproduzir',
    'MyPauseIcon': 'Pausar',
    'CompanyLogo': 'Ir para página inicial',
}
```

### Exemplo de uso:

```bash
# Dry-run
python3 scripts/fix-icon-button-aria.py --dry-run

# Aplicar
python3 scripts/fix-icon-button-aria.py --apply

# Gerar relatório detalhado
python3 scripts/fix-icon-button-aria.py --report
```

---

## 7. Script: fix-critical-opacity.py

### Para que serve?

Corrige problemas de contraste causados por uso de `opacity-30`, `opacity-40`, etc. em elementos de texto.

### Como o script decide o que corrigir?

Regras de decisão:

| Contexto | Ação | Razão |
|----------|------|-------|
| `aria-hidden="true"` | Skip | Ícone decorativo |
| `disabled` | Skip | Estado visual válido |
| `hover:` | Skip | Efeito de interação |
| `blur` / `background` | Skip | Efeito visual |
| Texto legível | Corrigir | Afeta acessibilidade |

### Como ajustar os níveis de opacidade aceitáveis?

```python
# Configuração de severidade
OPACITY_SEVERITY = {
    'opacity-30': 'CRÍTICA',   # Contraste ~2.5:1 - SEMPRE corrigir
    'opacity-40': 'CRÍTICA',   # Contraste ~3.2:1 - SEMPRE corrigir
    'opacity-50': 'ALTA',      # Contraste ~4.0:1 - Corrigir em texto
    'opacity-60': 'MÉDIA',     # Contraste ~5.5:1 - Verificar contexto
    'opacity-70': 'BAIXA',     # Contraste ~7.0:1 - Geralmente OK
}

# Substituições recomendadas
OPACITY_REPLACEMENTS = {
    'opacity-30': 'opacity-60',  # ou remover e usar cor sólida
    'opacity-40': 'opacity-60',
    'opacity-50': 'opacity-70',
}
```

### Exemplo de uso:

```bash
# Dry-run
python3 scripts/fix-critical-opacity.py --dry-run

# Aplicar
python3 scripts/fix-critical-opacity.py --apply
```

---

## 8. Script: audit-contrast-issues.py

### Para que serve?

Gera um relatório completo de todos os potenciais problemas de contraste no projeto, sem fazer modificações.

### Que tipos de problemas ele detecta?

- Classes de texto com baixo contraste (`text-gray-400`, `text-muted`)
- Uso de opacidade em texto
- Cores hardcoded potencialmente problemáticas
- Placeholders com contraste insuficiente

### Como exportar o relatório?

```bash
# Relatório no terminal
python3 scripts/audit-contrast-issues.py

# Apenas resumo
python3 scripts/audit-contrast-issues.py --summary

# Exportar para CSV
python3 scripts/audit-contrast-issues.py --export

# Apenas arquivos críticos
python3 scripts/audit-contrast-issues.py --critical
```

### Onde encontro o relatório gerado?

```
docs/accessibility/CONTRAST_AUDIT_REPORT.md  # Relatório Markdown
docs/accessibility/contrast_issues.csv       # Dados em CSV
```

---

## 9. Customização e Extensão

### Como criar um novo script baseado nos existentes?

Template básico:

```python
#!/usr/bin/env python3
"""
Meu Script de Acessibilidade
============================
Descrição do que o script faz.
"""

import re
import argparse
from pathlib import Path
from datetime import datetime

# Configurações
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
BACKUP_DIR = BASE_DIR / "backups" / "meu-script"

def process_file(filepath: Path, dry_run: bool = True) -> dict:
    """Processa um arquivo."""
    content = filepath.read_text()
    original = content
    changes = []
    
    # Sua lógica aqui
    # ...
    
    if not dry_run and content != original:
        # Backup
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        backup_path = BACKUP_DIR / f"{filepath.stem}_{datetime.now():%Y%m%d_%H%M%S}{filepath.suffix}"
        backup_path.write_text(original)
        
        # Salvar
        filepath.write_text(content)
    
    return {'file': str(filepath), 'changes': changes}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    
    for filepath in SRC_DIR.rglob('*.tsx'):
        result = process_file(filepath, dry_run=not args.apply)
        # Processar resultado

if __name__ == '__main__':
    main()
```

### Como adicionar validação pós-modificação?

```python
import subprocess

def validate_build():
    """Executa build para validar alterações."""
    result = subprocess.run(
        ['npm', 'run', 'build'],
        capture_output=True,
        text=True
    )
    return result.returncode == 0

# No final do script:
if args.apply:
    print("🔨 Validando build...")
    if validate_build():
        print("✅ Build passou!")
    else:
        print("❌ Build falhou! Restaurando backups...")
        # Lógica de restauração
```

### Como integrar com CI/CD?

```yaml
# .github/workflows/a11y-check.yml
name: Accessibility Check

on: [pull_request]

jobs:
  a11y-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Run Accessibility Audit
        run: |
          python3 scripts/audit-contrast-issues.py --summary
          python3 scripts/add-aria-labels.py --dry-run
      
      - name: Check for issues
        run: |
          # Falhar se houver problemas críticos
          python3 scripts/audit-contrast-issues.py --critical --export
          if [ -s docs/accessibility/contrast_issues.csv ]; then
            echo "❌ Problemas de acessibilidade encontrados!"
            exit 1
          fi
```

---

## 10. Troubleshooting

### Erro: "UnicodeDecodeError"

**Causa:** Arquivo com encoding diferente de UTF-8.

**Solução:**
```python
# Adicionar tratamento de encoding
try:
    content = filepath.read_text(encoding='utf-8')
except UnicodeDecodeError:
    content = filepath.read_text(encoding='latin-1')
```

### Erro: "Build failed after modifications"

**Causa:** Regex capturou mais do que deveria.

**Solução:**
1. Restaurar backups:
```bash
cp backups/*/MyFile_*.tsx src/path/to/MyFile.tsx
```

2. Ajustar regex para ser mais específico:
```python
# ❌ Muito amplo
pattern = r'<Button.*>'

# ✅ Mais específico
pattern = r'<Button\s+[^>]*size="icon"[^>]*>'
```

### Erro: "No files found"

**Causa:** Caminho de diretório incorreto.

**Solução:**
```python
# Verificar se o diretório existe
print(f"SRC_DIR existe: {SRC_DIR.exists()}")
print(f"Arquivos encontrados: {list(SRC_DIR.rglob('*.tsx'))[:5]}")
```

### Script muito lento

**Causa:** Processando arquivos desnecessários.

**Solução:**
```python
# Adicionar exclusões
EXCLUDE_PATTERNS = [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.test.tsx',
    '**/*.spec.tsx',
]

def should_process(filepath):
    return not any(filepath.match(p) for p in EXCLUDE_PATTERNS)
```

---

## 11. Melhores Práticas

### Antes de executar em um novo projeto:

1. ✅ Fazer backup completo do projeto
2. ✅ Executar `--dry-run` primeiro
3. ✅ Revisar as alterações propostas
4. ✅ Testar em um branch separado
5. ✅ Validar build após aplicação

### Ordem recomendada de execução:

```bash
# 1. Auditoria inicial
python3 scripts/audit-contrast-issues.py --export

# 2. Migração de componentes (se aplicável)
python3 scripts/migrate-ui-components.py --dry-run
python3 scripts/migrate-ui-components.py --apply

# 3. ARIA labels gerais
python3 scripts/add-aria-labels.py --dry-run
python3 scripts/add-aria-labels.py --apply

# 4. Botões de ícone
python3 scripts/fix-icon-button-aria.py --dry-run
python3 scripts/fix-icon-button-aria.py --apply

# 5. Problemas de contraste
python3 scripts/fix-critical-opacity.py --dry-run
python3 scripts/fix-critical-opacity.py --apply

# 6. Validação final
npm run build
python3 scripts/audit-contrast-issues.py --summary
```

### Commits recomendados:

```bash
# Commit por fase
git add -A && git commit -m "a11y: migrate UI components to themed library"
git add -A && git commit -m "a11y: add aria-labels to interactive elements"
git add -A && git commit -m "a11y: fix icon buttons accessibility"
git add -A && git commit -m "a11y: fix contrast issues with opacity"
```

---

## 📞 Suporte

### Onde reportar bugs?

Abra uma issue no repositório com:
- Versão do script
- Comando executado
- Mensagem de erro completa
- Exemplo de arquivo que causou o problema

### Como contribuir com melhorias?

1. Fork o repositório
2. Crie um branch: `git checkout -b feature/minha-melhoria`
3. Faça suas alterações
4. Adicione testes se aplicável
5. Abra um Pull Request

---

*Documento gerado em: 2025-12-25*  
*Versão dos scripts: 1.0*  
*Projeto de origem: TSiJUKEBOX*
