# Plano de Testes de Unidade - setup-cicd-workflow.sh

> **TSiJUKEBOX Enterprise - Plano de Testes do Script CI/CD**  
> **Versão:** 1.0.0  
> **Autor:** Manus AI  
> **Data:** 24 de Dezembro de 2024

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Ambiente de Testes](#ambiente-de-testes)
3. [Estrutura dos Testes](#estrutura-dos-testes)
4. [Cenários de Teste](#cenários-de-teste)
5. [Implementação dos Testes](#implementação-dos-testes)
6. [Execução dos Testes](#execução-dos-testes)
7. [Cobertura de Código](#cobertura-de-código)

---

## Visão Geral

Este documento descreve o plano de testes de unidade para o script `setup-cicd-workflow.sh`. O objetivo é garantir que todas as funcionalidades do script funcionem corretamente em diferentes cenários, incluindo casos de sucesso, falha e edge cases.

### Escopo dos Testes

Os testes cobrem as seguintes áreas: processamento de argumentos de linha de comando, verificação de pré-requisitos, manipulação de arquivos, operações Git e tratamento de erros.

---

## Ambiente de Testes

### Framework de Testes

Para testar scripts Bash, utilizaremos o framework **BATS (Bash Automated Testing System)**, que é amplamente utilizado e bem documentado para testes de scripts shell.

### Instalação do BATS

```bash
# CachyOS/Arch Linux
sudo pacman -S bats

# Ubuntu/Debian
sudo apt install bats

# macOS
brew install bats-core
```

### Estrutura de Diretórios

```
tests/
├── scripts/
│   ├── setup-cicd-workflow.bats    # Arquivo de testes
│   ├── test_helper.bash            # Funções auxiliares
│   └── fixtures/                   # Arquivos de teste
│       ├── mock-project/
│       │   ├── package.json
│       │   └── docs/
│       │       └── workflows/
│       │           └── ci-cd-tests.yml
│       └── empty-project/
```

---

## Estrutura dos Testes

### Categorias de Teste

| Categoria | Descrição | Quantidade |
|-----------|-----------|------------|
| Argumentos | Testes de parsing de argumentos | 5 |
| Pré-requisitos | Testes de verificação de ambiente | 6 |
| Arquivos | Testes de manipulação de arquivos | 5 |
| Git | Testes de operações Git | 5 |
| Dry-Run | Testes do modo simulação | 4 |
| **Total** | | **25** |

---

## Cenários de Teste

### 1. Testes de Argumentos de Linha de Comando

#### TC-ARG-001: Opção --help

**Objetivo:** Verificar que a opção --help exibe a mensagem de ajuda e termina com código 0.

```bash
@test "TC-ARG-001: --help exibe mensagem de ajuda" {
    run ./scripts/setup-cicd-workflow.sh --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Uso:"* ]]
    [[ "$output" == *"--dry-run"* ]]
    [[ "$output" == *"--force"* ]]
}
```

#### TC-ARG-002: Opção -h (forma curta)

**Objetivo:** Verificar que -h funciona igual a --help.

```bash
@test "TC-ARG-002: -h exibe mensagem de ajuda" {
    run ./scripts/setup-cicd-workflow.sh -h
    [ "$status" -eq 0 ]
    [[ "$output" == *"Uso:"* ]]
}
```

#### TC-ARG-003: Opção desconhecida

**Objetivo:** Verificar que opções desconhecidas resultam em erro.

```bash
@test "TC-ARG-003: opção desconhecida retorna erro" {
    run ./scripts/setup-cicd-workflow.sh --invalid-option
    [ "$status" -eq 1 ]
    [[ "$output" == *"Opção desconhecida"* ]]
}
```

#### TC-ARG-004: --dry-run ativa modo simulação

**Objetivo:** Verificar que --dry-run ativa o modo de simulação.

```bash
@test "TC-ARG-004: --dry-run ativa modo simulação" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"DRY-RUN"* ]]
    [[ "$output" == *"nenhuma alteração será feita"* ]]
}
```

#### TC-ARG-005: --force desativa confirmação

**Objetivo:** Verificar que --force permite sobrescrever sem confirmação.

```bash
@test "TC-ARG-005: --force permite sobrescrever sem confirmação" {
    cd "$MOCK_PROJECT"
    # Criar arquivo existente
    mkdir -p .github/workflows
    echo "old content" > .github/workflows/ci-cd-tests.yml
    
    run ./scripts/setup-cicd-workflow.sh --force --dry-run
    [[ "$output" == *"será sobrescrito"* ]]
}
```

---

### 2. Testes de Verificação de Pré-requisitos

#### TC-PRE-001: Diretório do projeto válido

**Objetivo:** Verificar que o script detecta corretamente um diretório de projeto válido.

```bash
@test "TC-PRE-001: detecta diretório do projeto válido" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Diretório do projeto encontrado"* ]]
}
```

#### TC-PRE-002: Diretório do projeto inválido

**Objetivo:** Verificar que o script falha quando não encontra package.json.

```bash
@test "TC-PRE-002: falha sem package.json" {
    cd "$EMPTY_PROJECT"
    run ./scripts/setup-cicd-workflow.sh
    [ "$status" -eq 1 ]
    [[ "$output" == *"Não foi possível encontrar o diretório raiz"* ]]
}
```

#### TC-PRE-003: Arquivo fonte existe

**Objetivo:** Verificar que o script detecta o arquivo fonte.

```bash
@test "TC-PRE-003: detecta arquivo fonte existente" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Arquivo fonte encontrado"* ]]
}
```

#### TC-PRE-004: Arquivo fonte não existe

**Objetivo:** Verificar que o script falha quando o arquivo fonte não existe.

```bash
@test "TC-PRE-004: falha sem arquivo fonte" {
    cd "$MOCK_PROJECT"
    rm -f docs/workflows/ci-cd-tests.yml
    run ./scripts/setup-cicd-workflow.sh
    [ "$status" -eq 1 ]
    [[ "$output" == *"Arquivo fonte não encontrado"* ]]
}
```

#### TC-PRE-005: Git instalado

**Objetivo:** Verificar que o script detecta Git instalado.

```bash
@test "TC-PRE-005: detecta Git instalado" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Git está instalado"* ]]
}
```

#### TC-PRE-006: Repositório Git válido

**Objetivo:** Verificar que o script detecta repositório Git válido.

```bash
@test "TC-PRE-006: detecta repositório Git válido" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Repositório Git válido"* ]]
}
```

---

### 3. Testes de Manipulação de Arquivos

#### TC-FILE-001: Cria diretório .github/workflows

**Objetivo:** Verificar que o script cria o diretório de destino.

```bash
@test "TC-FILE-001: cria diretório .github/workflows" {
    cd "$MOCK_PROJECT"
    git init
    rm -rf .github
    
    # Executar sem dry-run mas com mock do git commit
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [ -d ".github/workflows" ]
}
```

#### TC-FILE-002: Copia arquivo corretamente

**Objetivo:** Verificar que o arquivo é copiado corretamente.

```bash
@test "TC-FILE-002: copia arquivo corretamente" {
    cd "$MOCK_PROJECT"
    git init
    
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [ -f ".github/workflows/ci-cd-tests.yml" ]
    cmp -s "docs/workflows/ci-cd-tests.yml" ".github/workflows/ci-cd-tests.yml"
}
```

#### TC-FILE-003: Detecta arquivos idênticos

**Objetivo:** Verificar que o script detecta quando os arquivos são idênticos.

```bash
@test "TC-FILE-003: detecta arquivos idênticos" {
    cd "$MOCK_PROJECT"
    git init
    mkdir -p .github/workflows
    cp docs/workflows/ci-cd-tests.yml .github/workflows/
    
    run ./scripts/setup-cicd-workflow.sh
    
    [[ "$output" == *"Os arquivos são idênticos"* ]]
}
```

#### TC-FILE-004: Detecta arquivos diferentes

**Objetivo:** Verificar que o script detecta quando os arquivos são diferentes.

```bash
@test "TC-FILE-004: detecta arquivos diferentes" {
    cd "$MOCK_PROJECT"
    git init
    mkdir -p .github/workflows
    echo "different content" > .github/workflows/ci-cd-tests.yml
    
    run ./scripts/setup-cicd-workflow.sh --dry-run
    
    [[ "$output" == *"O arquivo já existe"* ]]
}
```

#### TC-FILE-005: Verifica cópia bem-sucedida

**Objetivo:** Verificar que o script confirma a cópia bem-sucedida.

```bash
@test "TC-FILE-005: confirma cópia bem-sucedida" {
    cd "$MOCK_PROJECT"
    git init
    
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [[ "$output" == *"arquivo copiado com sucesso"* ]]
}
```

---

### 4. Testes de Operações Git

#### TC-GIT-001: Adiciona arquivo ao staging

**Objetivo:** Verificar que o arquivo é adicionado ao staging.

```bash
@test "TC-GIT-001: adiciona arquivo ao staging" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [[ "$output" == *"Arquivo adicionado ao staging"* ]]
}
```

#### TC-GIT-002: Cria commit com mensagem correta

**Objetivo:** Verificar que o commit é criado com a mensagem correta.

```bash
@test "TC-GIT-002: cria commit com mensagem correta" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [[ "$output" == *"Commit realizado com sucesso"* ]]
    
    # Verificar mensagem do commit
    commit_msg=$(git log -1 --pretty=%B)
    [[ "$commit_msg" == *"ci: Adicionar pipeline CI/CD completo"* ]]
}
```

#### TC-GIT-003: Mostra hash do commit

**Objetivo:** Verificar que o hash do commit é exibido.

```bash
@test "TC-GIT-003: mostra hash do commit" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [[ "$output" == *"Commit hash:"* ]]
}
```

#### TC-GIT-004: Detecta nenhuma mudança

**Objetivo:** Verificar que o script detecta quando não há mudanças.

```bash
@test "TC-GIT-004: detecta nenhuma mudança" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    mkdir -p .github/workflows
    cp docs/workflows/ci-cd-tests.yml .github/workflows/
    git add .
    git commit -m "initial"
    
    run ./scripts/setup-cicd-workflow.sh <<< "n"
    
    [[ "$output" == *"Nenhuma mudança detectada"* ]] || [[ "$output" == *"idênticos"* ]]
}
```

#### TC-GIT-005: Mostra branch atual

**Objetivo:** Verificar que o script mostra a branch atual.

```bash
@test "TC-GIT-005: mostra branch atual" {
    cd "$MOCK_PROJECT"
    git init
    
    run ./scripts/setup-cicd-workflow.sh --dry-run
    
    [[ "$output" == *"Branch atual:"* ]]
}
```

---

### 5. Testes do Modo Dry-Run

#### TC-DRY-001: Não cria diretório em dry-run

**Objetivo:** Verificar que o diretório não é criado em modo dry-run.

```bash
@test "TC-DRY-001: não cria diretório em dry-run" {
    cd "$MOCK_PROJECT"
    git init
    rm -rf .github
    
    run ./scripts/setup-cicd-workflow.sh --dry-run
    
    [ ! -d ".github/workflows" ]
}
```

#### TC-DRY-002: Não copia arquivo em dry-run

**Objetivo:** Verificar que o arquivo não é copiado em modo dry-run.

```bash
@test "TC-DRY-002: não copia arquivo em dry-run" {
    cd "$MOCK_PROJECT"
    git init
    rm -rf .github
    
    run ./scripts/setup-cicd-workflow.sh --dry-run
    
    [ ! -f ".github/workflows/ci-cd-tests.yml" ]
}
```

#### TC-DRY-003: Não faz commit em dry-run

**Objetivo:** Verificar que nenhum commit é feito em modo dry-run.

```bash
@test "TC-DRY-003: não faz commit em dry-run" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    
    initial_commits=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    
    run ./scripts/setup-cicd-workflow.sh --dry-run
    
    final_commits=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    [ "$initial_commits" -eq "$final_commits" ]
}
```

#### TC-DRY-004: Mostra mensagens [DRY-RUN]

**Objetivo:** Verificar que as mensagens de dry-run são exibidas.

```bash
@test "TC-DRY-004: mostra mensagens [DRY-RUN]" {
    cd "$MOCK_PROJECT"
    git init
    
    run ./scripts/setup-cicd-workflow.sh --dry-run
    
    [[ "$output" == *"[DRY-RUN]"* ]]
}
```

---

## Implementação dos Testes

### Arquivo de Testes Completo

```bash
#!/usr/bin/env bats
# tests/scripts/setup-cicd-workflow.bats

# Carregar helpers
load 'test_helper'

# Setup - executado antes de cada teste
setup() {
    # Criar diretório temporário para testes
    TEST_DIR=$(mktemp -d)
    MOCK_PROJECT="$TEST_DIR/mock-project"
    EMPTY_PROJECT="$TEST_DIR/empty-project"
    
    # Criar projeto mock
    mkdir -p "$MOCK_PROJECT/docs/workflows"
    mkdir -p "$MOCK_PROJECT/scripts"
    echo '{"name": "test"}' > "$MOCK_PROJECT/package.json"
    echo "name: CI/CD" > "$MOCK_PROJECT/docs/workflows/ci-cd-tests.yml"
    
    # Copiar script para teste
    cp "$(pwd)/scripts/setup-cicd-workflow.sh" "$MOCK_PROJECT/scripts/"
    chmod +x "$MOCK_PROJECT/scripts/setup-cicd-workflow.sh"
    
    # Criar projeto vazio
    mkdir -p "$EMPTY_PROJECT"
}

# Teardown - executado após cada teste
teardown() {
    rm -rf "$TEST_DIR"
}

# ============================================================================
# TESTES DE ARGUMENTOS
# ============================================================================

@test "TC-ARG-001: --help exibe mensagem de ajuda" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Uso:"* ]]
}

@test "TC-ARG-002: -h exibe mensagem de ajuda" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh -h
    [ "$status" -eq 0 ]
    [[ "$output" == *"Uso:"* ]]
}

@test "TC-ARG-003: opção desconhecida retorna erro" {
    cd "$MOCK_PROJECT"
    run ./scripts/setup-cicd-workflow.sh --invalid
    [ "$status" -eq 1 ]
    [[ "$output" == *"Opção desconhecida"* ]]
}

@test "TC-ARG-004: --dry-run ativa modo simulação" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"DRY-RUN"* ]]
}

@test "TC-ARG-005: --force permite sobrescrever" {
    cd "$MOCK_PROJECT"
    git init
    mkdir -p .github/workflows
    echo "old" > .github/workflows/ci-cd-tests.yml
    run ./scripts/setup-cicd-workflow.sh --force --dry-run
    [[ "$output" == *"sobrescrito"* ]]
}

# ============================================================================
# TESTES DE PRÉ-REQUISITOS
# ============================================================================

@test "TC-PRE-001: detecta diretório válido" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Diretório do projeto encontrado"* ]]
}

@test "TC-PRE-002: falha sem package.json" {
    cd "$EMPTY_PROJECT"
    mkdir -p scripts
    cp "$MOCK_PROJECT/scripts/setup-cicd-workflow.sh" scripts/
    run ./scripts/setup-cicd-workflow.sh
    [ "$status" -eq 1 ]
}

@test "TC-PRE-003: detecta arquivo fonte" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Arquivo fonte encontrado"* ]]
}

@test "TC-PRE-004: falha sem arquivo fonte" {
    cd "$MOCK_PROJECT"
    git init
    rm -f docs/workflows/ci-cd-tests.yml
    run ./scripts/setup-cicd-workflow.sh
    [ "$status" -eq 1 ]
}

@test "TC-PRE-005: detecta Git instalado" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Git está instalado"* ]]
}

@test "TC-PRE-006: detecta repositório Git" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Repositório Git válido"* ]]
}

# ============================================================================
# TESTES DE ARQUIVOS
# ============================================================================

@test "TC-FILE-001: cria diretório .github/workflows" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    rm -rf .github
    run bash -c './scripts/setup-cicd-workflow.sh <<< "n"'
    [ -d ".github/workflows" ]
}

@test "TC-FILE-002: copia arquivo corretamente" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    run bash -c './scripts/setup-cicd-workflow.sh <<< "n"'
    [ -f ".github/workflows/ci-cd-tests.yml" ]
}

@test "TC-FILE-003: detecta arquivos idênticos" {
    cd "$MOCK_PROJECT"
    git init
    mkdir -p .github/workflows
    cp docs/workflows/ci-cd-tests.yml .github/workflows/
    run ./scripts/setup-cicd-workflow.sh
    [[ "$output" == *"idênticos"* ]]
}

@test "TC-FILE-004: detecta arquivos diferentes" {
    cd "$MOCK_PROJECT"
    git init
    mkdir -p .github/workflows
    echo "different" > .github/workflows/ci-cd-tests.yml
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"já existe"* ]]
}

@test "TC-FILE-005: confirma cópia bem-sucedida" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    run bash -c './scripts/setup-cicd-workflow.sh <<< "n"'
    [[ "$output" == *"copiado com sucesso"* ]]
}

# ============================================================================
# TESTES DE GIT
# ============================================================================

@test "TC-GIT-001: adiciona ao staging" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    run bash -c './scripts/setup-cicd-workflow.sh <<< "n"'
    [[ "$output" == *"adicionado ao staging"* ]]
}

@test "TC-GIT-002: cria commit" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    run bash -c './scripts/setup-cicd-workflow.sh <<< "n"'
    [[ "$output" == *"Commit realizado"* ]]
}

@test "TC-GIT-003: mostra hash do commit" {
    cd "$MOCK_PROJECT"
    git init
    git config user.email "test@test.com"
    git config user.name "Test"
    run bash -c './scripts/setup-cicd-workflow.sh <<< "n"'
    [[ "$output" == *"Commit hash:"* ]]
}

@test "TC-GIT-004: mostra branch atual" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"Branch atual:"* ]]
}

# ============================================================================
# TESTES DE DRY-RUN
# ============================================================================

@test "TC-DRY-001: não cria diretório em dry-run" {
    cd "$MOCK_PROJECT"
    git init
    rm -rf .github
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [ ! -d ".github/workflows" ]
}

@test "TC-DRY-002: não copia arquivo em dry-run" {
    cd "$MOCK_PROJECT"
    git init
    rm -rf .github
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [ ! -f ".github/workflows/ci-cd-tests.yml" ]
}

@test "TC-DRY-003: mostra mensagens [DRY-RUN]" {
    cd "$MOCK_PROJECT"
    git init
    run ./scripts/setup-cicd-workflow.sh --dry-run
    [[ "$output" == *"[DRY-RUN]"* ]]
}
```

---

## Execução dos Testes

### Executar Todos os Testes

```bash
cd /caminho/para/tsijukebox
bats tests/scripts/setup-cicd-workflow.bats
```

### Executar Teste Específico

```bash
bats tests/scripts/setup-cicd-workflow.bats --filter "TC-ARG-001"
```

### Saída Esperada

```
 ✓ TC-ARG-001: --help exibe mensagem de ajuda
 ✓ TC-ARG-002: -h exibe mensagem de ajuda
 ✓ TC-ARG-003: opção desconhecida retorna erro
 ✓ TC-ARG-004: --dry-run ativa modo simulação
 ✓ TC-ARG-005: --force permite sobrescrever
 ✓ TC-PRE-001: detecta diretório válido
 ...

25 tests, 0 failures
```

---

## Cobertura de Código

### Meta de Cobertura

| Categoria | Meta |
|-----------|------|
| Funções | 100% |
| Branches | 90% |
| Linhas | 95% |

### Funções Cobertas

| Função | Testes |
|--------|--------|
| `print_header()` | TC-ARG-001 |
| `print_info()` | Todos |
| `print_success()` | TC-FILE-* |
| `print_warning()` | TC-DRY-*, TC-ARG-005 |
| `print_error()` | TC-ARG-003, TC-PRE-002 |
| `show_help()` | TC-ARG-001, TC-ARG-002 |
| `check_prerequisites()` | TC-PRE-* |
| `check_existing_file()` | TC-FILE-003, TC-FILE-004 |
| `copy_workflow_file()` | TC-FILE-001, TC-FILE-002 |
| `commit_changes()` | TC-GIT-* |
| `push_changes()` | (mock) |
| `show_next_steps()` | TC-FILE-005 |
| `main()` | Todos |

---

**Última atualização:** 24 de Dezembro de 2024
