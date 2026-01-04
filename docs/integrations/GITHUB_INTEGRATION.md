# Integração com GitHub

**Tipo:** Documentação de Integração
**Serviço:** GitHub
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX possui uma integração profunda com o **GitHub**, utilizando-o não apenas para o controle de versão do código-fonte, mas também como uma plataforma para automação de CI/CD (Integração Contínua / Implantação Contínua), gerenciamento de documentação e sincronização de configurações.

### Principais Pontos da Integração:

1.  **Controle de Versão:** Todo o código-fonte, documentação e scripts do projeto são hospedados em um repositório GitHub.
2.  **CI/CD com GitHub Actions:** Workflows automatizados para testar, construir e implantar a aplicação.
3.  **Sincronização de Arquivos:** Uma funcionalidade única que permite sincronizar arquivos de configuração ou documentação diretamente de um repositório GitHub para a instância do TSiJUKEBOX.
4.  **Gerenciamento de Issues e Projetos:** Utilização do GitHub Issues e Projects para rastrear bugs, novas funcionalidades e o roadmap de desenvolvimento.

---

## 2. CI/CD com GitHub Actions

O coração da automação do projeto reside nos workflows definidos em `.github/workflows/`.

### Workflow de Integração Contínua (CI)

-   **Gatilho:** Executado em cada `push` para qualquer branch ou em cada `pull_request` aberto contra o branch `main`.
-   **Objetivo:** Garantir a qualidade e a integridade do código antes que ele seja mesclado.
-   **Passos Típicos:**
    1.  **Checkout do Código:** Baixa o código do repositório.
    2.  **Setup do Ambiente:** Configura o ambiente de execução com as versões corretas de Node.js e Python.
    3.  **Instalar Dependências:** Executa `npm install` e `pip install -r requirements.txt`.
    4.  **Linting:** Executa `npm run lint` para verificar a conformidade com os padrões de estilo de código.
    5.  **Testes Unitários e de Integração:** Executa `vitest` para o frontend e `pytest` para os scripts de backend.
    6.  **Build de Produção:** Executa `npm run build` para garantir que a aplicação pode ser compilada sem erros.
    7.  **Auditoria de Segurança:** (Opcional) Roda ferramentas como `npm audit` para verificar vulnerabilidades nas dependências.

### Workflow de Implantação Contínua (CD)

-   **Gatilho:** Executado em cada `push` bem-sucedido para o branch `main`.
-   **Objetivo:** Automatizar o processo de deploy da nova versão em um ambiente de produção ou staging.
-   **Passos Típicos:**
    1.  **Checkout e Build:** Passos similares ao CI para construir os artefatos de produção.
    2.  **Autenticação no Servidor:** Usa segredos do GitHub (ex: `SSH_PRIVATE_KEY`) para se conectar de forma segura ao servidor de destino.
    3.  **Deploy dos Arquivos:** Copia os artefatos de build para o servidor usando `scp` ou `rsync`.
    4.  **Executar Migrações:** Executa remotamente os comandos para aplicar migrações de banco de dados, se houver.
    5.  **Reiniciar o Serviço:** Executa `sudo systemctl restart tsijukebox` no servidor remoto para que a nova versão entre no ar.

---

## 3. Sincronização de Arquivos via GitHub

O TSiJUKEBOX possui uma funcionalidade que permite a um administrador sincronizar arquivos (como documentação em Markdown ou arquivos de configuração) de um repositório GitHub para o sistema de arquivos local da aplicação.

### Casos de Uso:

-   **Documentação Dinâmica:** Manter a seção de Ajuda ou a Wiki da aplicação sempre atualizada com o conteúdo mais recente do repositório `docs/`.
-   **Configurações Centralizadas:** Distribuir arquivos de configuração base para múltiplas instâncias do TSiJUKEBOX a partir de um repositório central.

### Funcionamento:

1.  **Configuração na UI:** Em **Configurações > Integrações > GitHub**, o administrador pode configurar:
    -   **Repositório Público:** O nome do repositório (ex: `B0yZ4kr14/TSiJUKEBOX`).
    -   **Branch:** O branch a ser observado (ex: `main`).
    -   **Caminho de Origem:** O diretório no repositório a ser sincronizado (ex: `docs/guides/`).
    -   **Caminho de Destino:** O diretório no sistema de arquivos local onde os arquivos serão salvos (ex: `/var/lib/tsijukebox/synced_docs/`).
2.  **API do GitHub:** O backend utiliza a API REST do GitHub para listar os arquivos no diretório de origem e baixar seu conteúdo.
3.  **Sincronização:** O serviço compara os arquivos locais com os do repositório e baixa apenas os arquivos novos ou modificados.

---

## 4. Ferramentas de Linha de Comando

O TSiJUKEBOX se integra com o **GitHub CLI (`gh`)** para algumas operações de script.

-   **`gh release download`:** Pode ser usado em scripts de atualização para baixar artefatos de uma release específica do GitHub.
-   **`gh api`:** Utilizado para interações mais complexas com a API do GitHub que não são cobertas por outros comandos.

Para que isso funcione, o `gh` CLI precisa estar instalado no servidor e, para repositórios privados, autenticado (geralmente via `gh auth login`).
