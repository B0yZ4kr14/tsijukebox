# Integração com Dropbox (Backup na Nuvem)

**Tipo:** Documentação de Integração
**Serviço:** Dropbox
**Ferramenta:** Rclone
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX oferece integração com o **Dropbox** para backups na nuvem, utilizando a versatilidade da ferramenta **Rclone** como ponte. Esta abordagem permite que os usuários do Dropbox também possam proteger suas configurações e dados do TSiJUKEBOX de forma segura e automatizada.

A arquitetura da integração segue o mesmo padrão das outras implementações baseadas em Rclone, garantindo consistência e confiabilidade.

### Arquitetura da Integração:

1.  **Configuração do Rclone:** O usuário autoriza o Rclone a acessar sua conta do Dropbox através de um fluxo OAuth 2.0.
2.  **Serviço de Backend do TSiJUKEBOX:** Orquestra as operações de backup e restauração executando comandos do Rclone.
3.  **Fluxo de Backup:** Os dados da aplicação são comprimidos, e o backend utiliza o comando `rclone copy` para fazer o upload do arquivo para uma pasta específica no Dropbox.
4.  **Fluxo de Restauração:** O backend lista os backups disponíveis com `rclone ls` e baixa o arquivo selecionado com `rclone copy` para realizar a restauração.

---

## 2. Configuração

O processo de configuração é simples e familiar para quem já utilizou o Rclone.

### Passo 1: Configurar o Rclone para o Dropbox

1.  **Inicie a Configuração Interativa do Rclone:**

    ```bash
    rclone config
    ```

2.  **Siga o Assistente:**
    -   `n` para "New remote".
    -   Dê um nome ao remote, por exemplo, `dropbox`.
    -   Escolha o tipo de armazenamento: `dropbox`.
    -   Deixe `client_id` e `client_secret` em branco para usar as credenciais padrão do Rclone.
    -   Quando perguntado sobre "Use auto config?", responda `y`. Isso abrirá uma janela do navegador.
    -   No navegador, faça login na sua conta do Dropbox e autorize o Rclone a acessar seus arquivos.
    -   Volte ao terminal, confirme as configurações e saia do assistente.

3.  **Teste a Configuração:**

    ```bash
    # Este comando deve listar os arquivos e pastas na raiz do seu Dropbox
    rclone ls dropbox:
    ```

### Passo 2: Configurar no TSiJUKEBOX

1.  Navegue até **Configurações > Backup > Provedores de Nuvem**.
2.  Selecione **Dropbox**.
3.  No campo **"Nome do Remote Rclone"**, insira o nome definido no passo anterior (ex: `dropbox`).
4.  No campo **"Pasta de Destino"**, especifique a pasta de backup (ex: `Apps/TSiJUKEBOX/Backups`).
5.  Clique em **"Testar Conexão"** e, se bem-sucedido, **Salve** as configurações.

---

## 3. Comandos do Rclone Utilizados

Os comandos são padronizados, alterando-se apenas o nome do remote:

-   **Backup (Upload):**
    `rclone copy /tmp/backup.tar.gz dropbox:Apps/TSiJUKEBOX/Backups/`

-   **Listar Backups:**
    `rclone ls dropbox:Apps/TSiJUKEBOX/Backups/`

-   **Restauração (Download):**
    `rclone copy dropbox:Apps/TSiJUKEBOX/Backups/backup.tar.gz /tmp/`

-   **Remover Backups Antigos:**
    `rclone delete dropbox:Apps/TSiJUKEBOX/Backups/backup-antigo.tar.gz`

---

## 4. Considerações Específicas do Dropbox

-   **Tipo de Acesso:** Por padrão, o Rclone solicita acesso do tipo "App folder". Isso significa que ele só poderá ler e escrever arquivos dentro de uma pasta específica, `Apps/TSiJUKEBOX`, no seu Dropbox. Esta é uma medida de segurança que impede que a aplicação acesse outros arquivos seus, o que é uma excelente prática.
-   **Performance:** O Dropbox pode ter um desempenho ligeiramente diferente de outros provedores para um grande número de arquivos pequenos. A abordagem do TSiJUKEBOX de comprimir tudo em um único arquivo de backup (`.tar.gz`) é ideal para otimizar a velocidade de transferência com o Dropbox.
-   **Nomes de Arquivo:** O Dropbox tem algumas restrições em nomes de arquivo (por exemplo, não permite certos caracteres). O Rclone lida com isso automaticamente, mas é bom saber que os nomes dos arquivos de backup são padronizados para evitar problemas.
