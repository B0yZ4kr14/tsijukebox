_# Ferramentas de Desenvolvimento e Scripts

**Tipo:** Documentação de Ferramentas  
**Público:** Desenvolvedores

---

## 1. Visão Geral

O TSiJUKEBOX vem com um conjunto robusto de scripts e ferramentas para automatizar tarefas de desenvolvimento, garantir a qualidade do código, gerenciar dependências e facilitar a instalação e o deploy. Este documento fornece uma visão geral das principais ferramentas encontradas no diretório `/scripts`.

---

## 2. Scripts de Instalação e Gerenciamento

Estes scripts são o ponto de entrada principal para instalar, atualizar e gerenciar uma instância do TSiJUKEBOX.

### `unified-installer.py`

-   **Descrição:** O instalador principal e unificado. É um script Python interativo que guia o usuário através da instalação completa, permitindo a seleção de diferentes modos (Full, Kiosk, Server, Minimal) e componentes (Spotify, Monitoramento, etc.).
-   **Uso:** `sudo python3 unified-installer.py --mode full`
-   **Principais Features:**
    -   Detecção automática do sistema operacional (Arch, Debian, etc.).
    -   Instalação de todas as dependências necessárias.
    -   Configuração de serviços do systemd.
    -   Suporte a flags para automação (`--auto`, `--config`).

### `install.py` / `install_standalone.py`

-   **Descrição:** Versões mais antigas ou específicas do instalador, agora majoritariamente substituídas pelo `unified-installer.py`.

### `update.py`

-   **Descrição:** Script dedicado para atualizar uma instalação existente do TSiJUKEBOX. Ele puxa as últimas alterações do Git, reinstala dependências e reinicia os serviços.
-   **Uso:** `sudo python3 update.py`

### `docker-install.py`

-   **Descrição:** Um script para gerenciar a instalação e configuração do TSiJUKEBOX em um ambiente Docker.
-   **Uso:** `sudo python3 docker-install.py --up`

---

## 3. Scripts de Teste e Qualidade de Código

Essenciais para manter a qualidade e a estabilidade do projeto.

### `run-python-tests.sh` / `run-coverage.sh`

-   **Descrição:** Scripts de shell para executar a suíte de testes Python usando `pytest`. O `run-coverage.sh` também gera um relatório de cobertura de código.
-   **Uso:** `./scripts/run-python-tests.sh`

### `pytest.ini`

-   **Descrição:** Arquivo de configuração para o `pytest`, definindo caminhos, marcadores e opções padrão para os testes.

### `a11y-audit.js` / `check-contrast.js`

-   **Descrição:** Scripts Node.js que utilizam ferramentas como o `axe-core` para realizar auditorias de acessibilidade na interface do usuário, verificando problemas como falta de labels, baixo contraste de cores, etc.
-   **Uso:** `node scripts/a11y-audit.js`

### `check-i18n-coverage.js`

-   **Descrição:** Ferramenta para verificar a cobertura da internacionalização (i18n), garantindo que todas as strings de texto na UI estejam traduzidas nos idiomas suportados.

---

## 4. Scripts de Build e Dependências

Ferramentas para gerenciar o processo de build e as dependências do projeto.

### `fix-missing-dependencies.mjs`

-   **Descrição:** Um script crucial que analisa o código-fonte, detecta `import` de pacotes que não estão listados no `package.json` e os adiciona automaticamente. Ajuda a manter o `package.json` sincronizado com o código.
-   **Uso:** `npm run fix-deps`

### `setup-build-environment.sh` / `.ps1`

-   **Descrição:** Scripts para configurar o ambiente de build em diferentes sistemas operacionais (Linux/macOS e Windows), garantindo que todas as ferramentas necessárias (Node.js, Python, etc.) estejam instaladas.

---

## 5. Scripts Utilitários e de Diagnóstico

Ferramentas para ajudar no diagnóstico de problemas e em tarefas diversas.

### `tsijukebox-doctor`

-   **Descrição:** Um script de diagnóstico que verifica a saúde geral de uma instalação do TSiJUKEBOX. Ele checa o status dos serviços, a validade das configurações, a conectividade com as APIs externas, etc.
-   **Uso:** `sudo tsijukebox-doctor`

### `diagnose-service.py`

-   **Descrição:** Script Python focado em diagnosticar problemas com um serviço específico do systemd, analisando logs do `journalctl` e o status do serviço.

### `tsi-status`

-   **Descrição:** Um script simples que fornece um resumo rápido do status de todos os serviços relacionados ao TSiJUKEBOX.

---

## 6. Integração com GitHub

O TSiJUKEBOX possui uma integração profunda com o GitHub para automação e sincronização.

### Sincronização Automática de Documentação

-   **Descrição:** Um fluxo de trabalho de GitHub Actions é configurado para monitorar alterações no diretório `/docs` do repositório. Quando um push é feito, a Action pode automaticamente sincronizar a documentação com uma Wiki do GitHub ou outro sistema de gerenciamento de conhecimento.

### Validação de Pull Requests (CI)

-   **Descrição:** O pipeline de Integração Contínua (CI) no GitHub Actions executa automaticamente vários scripts de qualidade em cada Pull Request:
    1.  **Linting:** Executa o `eslint` para verificar o estilo do código.
    2.  **Testes Unitários:** Roda os testes de frontend (`vitest`) e backend (`pytest`).
    3.  **Auditoria de Acessibilidade:** Executa os scripts de `a11y`.
    4.  **Verificação de Build:** Tenta construir o projeto (`npm run build`) para garantir que não há erros de compilação.
-   **Objetivo:** Garantir que apenas código de alta qualidade que passe em todos os testes seja mesclado ao branch principal.

### Deploy Automático (CD)

-   **Descrição:** Para o ambiente de produção, um fluxo de Continuous Deployment (CD) pode ser configurado. Após um merge bem-sucedido no branch `main`, uma Action pode:
    1.  Construir a aplicação para produção.
    2.  Fazer o deploy dos artefatos para um servidor.
    3.  Executar migrações de banco de dados remotamente.
    4.  Reiniciar os serviços no servidor de produção.

Esta parte é gerenciada através de segredos do GitHub para autenticação segura com o servidor de deploy._
