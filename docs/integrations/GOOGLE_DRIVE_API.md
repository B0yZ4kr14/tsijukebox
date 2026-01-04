# Integração com Google Drive (Backup na Nuvem)

**Tipo:** Documentação de Integração
**Serviço:** Google Drive
**Ferramenta:** Rclone
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX se integra com o **Google Drive** para fornecer uma opção de backup na nuvem robusta e familiar para os usuários. Em vez de interagir diretamente com a complexa API do Google Drive, a integração é abstraída pela poderosa ferramenta de linha de comando **Rclone**.

O Rclone, conhecido como "o rsync para armazenamento na nuvem", simplifica a sincronização de arquivos e diretórios com uma vasta gama de provedores de nuvem, incluindo o Google Drive.

### Arquitetura da Integração:

1.  **Configuração do Rclone:** O usuário primeiro configura o Rclone para se conectar à sua conta do Google Drive. Este é um processo único, interativo, que gera um token de acesso OAuth 2.0.
2.  **Serviço de Backend:** O serviço de backup do TSiJUKEBOX, quando acionado (manual ou automaticamente), executa comandos do Rclone em segundo plano.
3.  **Fluxo de Backup:**
    a.  Os dados do TSiJUKEBOX (configurações, banco de dados, etc.) são coletados e comprimidos em um único arquivo.
    b.  O backend executa um comando como `rclone copy /caminho/do/backup.tar.gz gdrive:TSiJUKEBOX_Backups/`.
    c.  O Rclone gerencia o upload do arquivo para a pasta especificada no Google Drive.
4.  **Fluxo de Restauração:**
    a.  O backend lista os backups disponíveis com `rclone ls gdrive:TSiJUKEBOX_Backups/`.
    b.  Após o usuário selecionar um backup, o backend executa `rclone copy gdrive:TSiJUKEBOX_Backups/backup-selecionado.tar.gz /tmp/` para baixá-lo.
    c.  O arquivo é então descomprimido e os dados são restaurados.

---

## 2. Configuração

A configuração é dividida em duas etapas: configurar o Rclone e, em seguida, configurar o TSiJUKEBOX para usá-lo.

### Passo 1: Configurar o Rclone para o Google Drive

Este processo é feito via linha de comando no servidor onde o TSiJUKEBOX está rodando.

1.  **Instale o Rclone:** Se ainda não estiver instalado, siga as instruções em [rclone.org](https://rclone.org/install/).

2.  **Inicie a Configuração Interativa:**

    ```bash
    rclone config
    ```

3.  **Siga o Assistente:**
    -   `n` para "New remote".
    -   Dê um nome ao remote, por exemplo, `gdrive`.
    -   Escolha o tipo de armazenamento: `drive` (para Google Drive).
    -   Deixe `client_id` e `client_secret` em branco para usar as credenciais padrão do Rclone.
    -   Escolha o nível de acesso (`scope`). A opção `1` (`drive`) geralmente é suficiente.
    -   Deixe `root_folder_id` e `service_account_file` em branco.
    -   Quando perguntado sobre "Use auto config?", responda `y` (sim). Isso abrirá uma janela do navegador.
    -   No navegador, faça login na sua conta do Google e autorize o Rclone a acessar seu Google Drive.
    -   Volte para o terminal, confirme as configurações e saia do assistente.

4.  **Teste a Configuração:**

    ```bash
    # Este comando deve listar todos os arquivos e pastas na raiz do seu Google Drive
    rclone ls gdrive:
    ```

### Passo 2: Configurar no TSiJUKEBOX

1.  Navegue até **Configurações > Backup > Provedores de Nuvem**.
2.  Selecione **Google Drive**.
3.  No campo **"Nome do Remote Rclone"**, insira o nome que você deu ao remote na etapa anterior (ex: `gdrive`).
4.  No campo **"Pasta de Destino"**, especifique a pasta dentro do seu Google Drive onde os backups serão salvos (ex: `Backups/TSiJUKEBOX`). Se a pasta não existir, o Rclone a criará.
5.  Clique em **"Testar Conexão"**.
6.  Salve as configurações.

---

## 3. Comandos do Rclone Utilizados

O backend do TSiJUKEBOX utiliza principalmente os seguintes comandos do Rclone:

-   **`rclone copy <origem> <destino>`:** Copia arquivos da origem para o destino. Usado tanto para upload (backup) quanto para download (restauração).
    -   *Exemplo (Backup):* `rclone copy /tmp/backup.tar.gz gdrive:Backups/`

-   **`rclone ls <remote:caminho>`:** Lista os arquivos em um diretório remoto. Usado para mostrar ao usuário os backups disponíveis para restauração.
    -   *Exemplo:* `rclone ls gdrive:Backups/`

-   **`rclone delete <remote:caminho>`:** Exclui arquivos. Usado para aplicar a política de retenção e remover backups antigos.
    -   *Exemplo:* `rclone delete gdrive:Backups/backup-antigo.tar.gz`

-   **`rclone check <origem> <destino>`:** Verifica se os arquivos na origem e no destino são idênticos. Pode ser usado para verificar a integridade de um backup após o upload.

---

## 4. Vantagens de Usar o Rclone

-   **Simplicidade:** Abstrai toda a complexidade da API do Google Drive, incluindo autenticação OAuth 2.0, uploads/downloads multipart, tratamento de erros e retentativas.
-   **Flexibilidade:** A mesma lógica de backend pode ser usada para dezenas de outros provedores de nuvem suportados pelo Rclone (Dropbox, OneDrive, etc.) com pouquíssimas alterações.
-   **Performance:** O Rclone é altamente otimizado para transferências de arquivos, usando múltiplas threads para uploads e downloads mais rápidos.
-   **Confiabilidade:** É uma ferramenta madura, amplamente utilizada e mantida ativamente pela comunidade.
