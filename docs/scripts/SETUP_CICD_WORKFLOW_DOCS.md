# Documentação do Script setup-cicd-workflow.sh

> **TSiJUKEBOX Enterprise - Script de Setup do Pipeline CI/CD**  
> **Versão:** 1.0.0  
> **Autor:** Manus AI  
> **Data:** 24 de Dezembro de 2024

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Instalação](#instalação)
4. [Uso](#uso)
5. [Opções de Linha de Comando](#opções-de-linha-de-comando)
6. [Fluxo de Execução](#fluxo-de-execução)
7. [Funções Internas](#funções-internas)
8. [Códigos de Saída](#códigos-de-saída)
9. [Exemplos de Uso](#exemplos-de-uso)
10. [Troubleshooting](#troubleshooting)
11. [Referências](#referências)

---

## Visão Geral

O script `setup-cicd-workflow.sh` é uma ferramenta de automação desenvolvida para facilitar a configuração do pipeline de CI/CD do TSiJUKEBOX. Ele automatiza a cópia do arquivo de workflow `ci-cd-tests.yml` do diretório `docs/workflows/` para o diretório `.github/workflows/`, realizando também o commit e push das alterações para o repositório Git.

Este script foi criado devido a restrições de permissão do GitHub App que impedem a criação direta de arquivos de workflow via automação. Portanto, o script deve ser executado localmente pelo desenvolvedor com as permissões adequadas.

### Propósito

O script resolve o problema de configuração do pipeline CI/CD ao automatizar as seguintes tarefas que normalmente seriam manuais e propensas a erros: verificação de pré-requisitos do ambiente, cópia do arquivo de workflow para o local correto, criação de commit com mensagem padronizada e push das alterações para o repositório remoto.

---

## Requisitos

### Sistema Operacional

O script foi desenvolvido e testado para funcionar em sistemas baseados em Unix, incluindo Linux (Ubuntu, CachyOS, Arch Linux, Debian), macOS (10.15 ou superior) e Windows com WSL2.

### Dependências

| Dependência | Versão Mínima | Verificação |
|-------------|---------------|-------------|
| Bash | 4.0+ | `bash --version` |
| Git | 2.0+ | `git --version` |
| cmp (diffutils) | Qualquer | `which cmp` |

### Permissões

O usuário que executa o script deve possuir permissão de escrita no repositório local, permissão de push para o repositório remoto, acesso ao diretório `.github/workflows/` e credenciais Git configuradas corretamente.

---

## Instalação

O script já está incluído no repositório TSiJUKEBOX e não requer instalação adicional. Basta garantir que o arquivo tenha permissão de execução:

```bash
chmod +x scripts/setup-cicd-workflow.sh
```

---

## Uso

### Sintaxe Básica

```bash
./scripts/setup-cicd-workflow.sh [opções]
```

### Execução Padrão

Para executar o script com comportamento padrão (interativo):

```bash
cd /caminho/para/tsijukebox
./scripts/setup-cicd-workflow.sh
```

---

## Opções de Linha de Comando

O script suporta três opções de linha de comando que modificam seu comportamento:

### --dry-run

A opção `--dry-run` ativa o modo de simulação, onde o script mostra todas as ações que seriam executadas sem realmente modificar nenhum arquivo ou fazer commits. Esta opção é útil para verificar o que o script fará antes de executá-lo de verdade.

```bash
./scripts/setup-cicd-workflow.sh --dry-run
```

**Comportamento:** O script exibe mensagens prefixadas com `[DRY-RUN]` indicando cada ação que seria realizada, mas não modifica arquivos, não cria diretórios, não faz commits e não faz push.

### --force

A opção `--force` desativa a confirmação interativa quando o arquivo de destino já existe. Com esta opção, o arquivo existente será sobrescrito automaticamente sem perguntar ao usuário.

```bash
./scripts/setup-cicd-workflow.sh --force
```

**Comportamento:** Se o arquivo `.github/workflows/ci-cd-tests.yml` já existir, ele será sobrescrito sem confirmação.

### --help

A opção `--help` (ou `-h`) exibe a mensagem de ajuda com informações sobre o uso do script e suas opções.

```bash
./scripts/setup-cicd-workflow.sh --help
```

### Combinação de Opções

As opções podem ser combinadas conforme necessário:

```bash
# Simulação com força (mostra o que seria feito com --force)
./scripts/setup-cicd-workflow.sh --dry-run --force
```

---

## Fluxo de Execução

O script segue um fluxo de execução bem definido com seis etapas principais:

### Etapa 1: Processamento de Argumentos

O script processa os argumentos de linha de comando usando um loop `while` que verifica cada argumento e define as variáveis `DRY_RUN` e `FORCE` conforme apropriado.

### Etapa 2: Verificação de Pré-requisitos

A função `check_prerequisites()` verifica se o diretório do projeto é válido (contém `package.json`), se o arquivo fonte existe em `docs/workflows/ci-cd-tests.yml`, se o Git está instalado no sistema, se o diretório atual é um repositório Git válido e qual é a branch atual.

### Etapa 3: Verificação de Arquivo Existente

A função `check_existing_file()` verifica se o arquivo de destino já existe. Se existir e `--force` não foi especificado, o script compara os arquivos. Se forem idênticos, o script termina sem fazer nada. Se forem diferentes, pergunta ao usuário se deseja sobrescrever.

### Etapa 4: Cópia do Arquivo

A função `copy_workflow_file()` cria o diretório `.github/workflows/` se não existir, copia o arquivo de workflow para o destino e verifica se a cópia foi bem-sucedida.

### Etapa 5: Commit das Alterações

A função `commit_changes()` verifica se há mudanças a serem commitadas, adiciona o arquivo ao staging area e cria um commit com uma mensagem padronizada e detalhada.

### Etapa 6: Push das Alterações

A função `push_changes()` pergunta ao usuário se deseja fazer push das alterações. Se confirmado, executa o push para o repositório remoto.

---

## Funções Internas

O script é organizado em funções modulares para facilitar a manutenção e os testes:

| Função | Descrição |
|--------|-----------|
| `print_header()` | Exibe o cabeçalho visual do script |
| `print_info()` | Exibe mensagens informativas (azul) |
| `print_success()` | Exibe mensagens de sucesso (verde) |
| `print_warning()` | Exibe mensagens de aviso (amarelo) |
| `print_error()` | Exibe mensagens de erro (vermelho) |
| `show_help()` | Exibe a mensagem de ajuda |
| `check_prerequisites()` | Verifica pré-requisitos do sistema |
| `check_existing_file()` | Verifica se o arquivo de destino existe |
| `copy_workflow_file()` | Copia o arquivo de workflow |
| `commit_changes()` | Faz commit das alterações |
| `push_changes()` | Faz push para o repositório remoto |
| `show_next_steps()` | Exibe os próximos passos após a execução |
| `main()` | Função principal que orquestra a execução |

---

## Códigos de Saída

O script utiliza códigos de saída padronizados para indicar o resultado da execução:

| Código | Significado |
|--------|-------------|
| 0 | Sucesso - execução completada sem erros |
| 1 | Erro - falha em alguma etapa da execução |

### Condições de Erro (Exit 1)

O script termina com código 1 nas seguintes situações: diretório do projeto não encontrado, arquivo fonte não encontrado, Git não instalado, não está em um repositório Git, falha na cópia do arquivo, opção de linha de comando desconhecida e usuário cancelou a operação (quando perguntado sobre sobrescrever).

---

## Exemplos de Uso

### Exemplo 1: Primeira Execução

```bash
$ cd ~/projetos/tsijukebox
$ ./scripts/setup-cicd-workflow.sh

╔═══════════════════════════════════════════════════════════════════╗
║           TSiJUKEBOX - Setup CI/CD Workflow Script                ║
╚═══════════════════════════════════════════════════════════════════╝

ℹ Verificando pré-requisitos...
✓ Diretório do projeto encontrado: /home/user/projetos/tsijukebox
✓ Arquivo fonte encontrado: /home/user/projetos/tsijukebox/docs/workflows/ci-cd-tests.yml
✓ Git está instalado
✓ Repositório Git válido
ℹ Branch atual: main

ℹ Copiando arquivo de workflow...
✓ Diretório criado/verificado: /home/user/projetos/tsijukebox/.github/workflows
✓ Arquivo copiado: /home/user/projetos/tsijukebox/.github/workflows/ci-cd-tests.yml
✓ Verificação: arquivo copiado com sucesso

ℹ Preparando commit...
✓ Arquivo adicionado ao staging
✓ Commit realizado com sucesso
ℹ Commit hash: abc1234

ℹ Deseja fazer push das alterações? (s/N)
s
ℹ Fazendo push...
✓ Push realizado com sucesso

═══════════════════════════════════════════════════════════════════
✓ Setup concluído com sucesso!
═══════════════════════════════════════════════════════════════════
```

### Exemplo 2: Modo Dry-Run

```bash
$ ./scripts/setup-cicd-workflow.sh --dry-run

╔═══════════════════════════════════════════════════════════════════╗
║           TSiJUKEBOX - Setup CI/CD Workflow Script                ║
╚═══════════════════════════════════════════════════════════════════╝

⚠ Modo DRY-RUN ativado - nenhuma alteração será feita

ℹ Verificando pré-requisitos...
✓ Diretório do projeto encontrado: /home/user/projetos/tsijukebox
✓ Arquivo fonte encontrado: /home/user/projetos/tsijukebox/docs/workflows/ci-cd-tests.yml
✓ Git está instalado
✓ Repositório Git válido
ℹ Branch atual: main

ℹ Copiando arquivo de workflow...
ℹ [DRY-RUN] Criaria diretório: /home/user/projetos/tsijukebox/.github/workflows
ℹ [DRY-RUN] Copiaria: docs/workflows/ci-cd-tests.yml -> .github/workflows/ci-cd-tests.yml

ℹ Preparando commit...
ℹ [DRY-RUN] Adicionaria ao staging: .github/workflows/ci-cd-tests.yml
ℹ [DRY-RUN] Faria commit com mensagem: 'ci: Adicionar pipeline CI/CD completo'

ℹ Deseja fazer push das alterações? (s/N)
ℹ [DRY-RUN] Faria push para origin
```

### Exemplo 3: Sobrescrever Arquivo Existente

```bash
$ ./scripts/setup-cicd-workflow.sh --force

# O arquivo existente será sobrescrito sem confirmação
```

---

## Troubleshooting

### Problema: "Não foi possível encontrar o diretório raiz do projeto"

**Causa:** O script não encontrou o arquivo `package.json` no diretório pai.

**Solução:** Certifique-se de executar o script a partir do diretório raiz do projeto ou de dentro do diretório `scripts/`.

### Problema: "Arquivo fonte não encontrado"

**Causa:** O arquivo `docs/workflows/ci-cd-tests.yml` não existe.

**Solução:** Verifique se o arquivo existe no caminho correto. Se não existir, pode ser necessário baixar ou criar o arquivo de workflow.

### Problema: "Git não está instalado"

**Causa:** O comando `git` não foi encontrado no PATH do sistema.

**Solução:** Instale o Git usando o gerenciador de pacotes do seu sistema:
- Ubuntu/Debian: `sudo apt install git`
- CachyOS/Arch: `sudo pacman -S git`
- macOS: `brew install git`

### Problema: "Falha no push"

**Causa:** Permissões insuficientes ou credenciais Git não configuradas.

**Solução:** Verifique suas credenciais Git e permissões no repositório remoto. Configure SSH keys ou token de acesso pessoal se necessário.

---

## Referências

1. [GitHub Actions Documentation](https://docs.github.com/en/actions) - Documentação oficial do GitHub Actions
2. [Bash Reference Manual](https://www.gnu.org/software/bash/manual/) - Manual de referência do Bash
3. [Git Documentation](https://git-scm.com/doc) - Documentação oficial do Git
4. [TSiJUKEBOX CI/CD Pipeline](../workflows/ci-cd-tests.yml) - Arquivo de workflow do pipeline

---

**Última atualização:** 24 de Dezembro de 2024
