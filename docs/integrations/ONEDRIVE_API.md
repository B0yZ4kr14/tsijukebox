# Integração com OneDrive (Backup na Nuvem)

**Tipo:** Documentação de Integração
**Serviço:** Microsoft OneDrive
**Ferramenta:** Rclone
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX suporta o **Microsoft OneDrive** como uma opção para backups na nuvem. Assim como na integração com o Google Drive, esta funcionalidade é viabilizada pela ferramenta **Rclone**, que simplifica a comunicação com a API do OneDrive.

Utilizar o Rclone como intermediário permite que o TSiJUKEBOX ofereça suporte a mais um grande provedor de armazenamento na nuvem de forma consistente e confiável, sem a necessidade de implementar a lógica específica da API do Microsoft Graph.

### Arquitetura da Integração:

A arquitetura é idêntica à da integração com o Google Drive:

1.  **Configuração do Rclone:** O usuário autoriza o Rclone a acessar sua conta do OneDrive, gerando um token de acesso.
2.  **Serviço de Backend do TSiJUKEBOX:** Executa comandos do Rclone para realizar as operações de backup e restauração.
3.  **Fluxo de Backup:** Comprime os dados, e o backend usa `rclone copy` para enviar o arquivo para uma pasta designada no OneDrive.
4.  **Fluxo de Restauração:** O backend usa `rclone ls` para listar os backups e `rclone copy` para baixar o arquivo selecionado pelo usuário antes de restaurar os dados.

---

## 2. Configuração

O processo é muito similar ao da configuração do Google Drive.

### Passo 1: Configurar o Rclone para o OneDrive

1.  **Inicie a Configuração Interativa do Rclone:**

    ```bash
    rclone config
    ```

2.  **Siga o Assistente:**
    -   `n` para "New remote".
    -   Dê um nome ao remote, por exemplo, `onedrive`.
    -   Escolha o tipo de armazenamento: `onedrive`.
    -   Deixe `client_id` e `client_secret` em branco.
    -   Na escolha da região do OneDrive (`drive_type`), selecione a opção apropriada (geralmente `personal` para contas pessoais ou `business` para contas corporativas).
    -   Quando perguntado sobre "Use auto config?", responda `y`. Uma janela do navegador será aberta.
    -   No navegador, faça login na sua conta da Microsoft e autorize o Rclone.
    -   Volte ao terminal, confirme as configurações e saia do assistente.

3.  **Teste a Configuração:**

    ```bash
    # Este comando deve listar os arquivos e pastas na raiz do seu OneDrive
    rclone ls onedrive:
    ```

### Passo 2: Configurar no TSiJUKEBOX

1.  Navegue até **Configurações > Backup > Provedores de Nuvem**.
2.  Selecione **OneDrive**.
3.  No campo **"Nome do Remote Rclone"**, insira o nome definido no passo anterior (ex: `onedrive`).
4.  No campo **"Pasta de Destino"**, especifique a pasta de backup (ex: `Apps/TSiJUKEBOX/Backups`).
5.  Clique em **"Testar Conexão"** e, se bem-sucedido, **Salve** as configurações.

---

## 3. Comandos do Rclone Utilizados

Os comandos são os mesmos utilizados para outras integrações baseadas em Rclone, apenas alterando o nome do remote:

-   **Backup (Upload):**
    `rclone copy /tmp/backup.tar.gz onedrive:Apps/TSiJUKEBOX/Backups/`

-   **Listar Backups:**
    `rclone ls onedrive:Apps/TSiJUKEBOX/Backups/`

-   **Restauração (Download):**
    `rclone copy onedrive:Apps/TSiJUKEBOX/Backups/backup.tar.gz /tmp/`

-   **Remover Backups Antigos:**
    `rclone delete onedrive:Apps/TSiJUKEBOX/Backups/backup-antigo.tar.gz`

---

## 4. Considerações Específicas do OneDrive

-   **Tipos de Conta:** O Rclone distingue entre contas pessoais (`personal`), empresariais/educacionais (`business`), e outras. É importante selecionar o tipo correto durante a configuração para que a autenticação funcione.
-   **Throttling:** A API do Microsoft Graph pode impor limites de taxa (throttling) em requisições frequentes ou de grande volume. O Rclone possui mecanismos internos para lidar com isso, respeitando os limites da API e tentando novamente quando necessário, mas backups muito grandes ou frequentes podem ocasionalmente encontrar lentidão.
-   **Caminho da Pasta:** É uma boa prática criar os backups dentro da pasta `Apps`, pois isso concede ao Rclone permissões mais contidas, alinhadas com as diretrizes de segurança da Microsoft, em vez de dar acesso a todo o OneDrive do usuário.
