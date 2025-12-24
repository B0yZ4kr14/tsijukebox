# Integração com MEGA (Backup na Nuvem)

**Tipo:** Documentação de Integração
**Serviço:** MEGA.nz
**Ferramenta:** Rclone
**Versão:** 1.0.0

---

## 1. Visão Geral

O TSiJUKEBOX também oferece suporte para backups na nuvem usando o **MEGA.nz**, um serviço de armazenamento conhecido por seu foco em segurança e criptografia ponta-a-ponta. A integração é realizada através do **Rclone**, que atua como uma camada de abstração para a API do MEGA.

Esta abordagem permite que os usuários do MEGA protejam seus dados do TSiJUKEBOX com a mesma facilidade e consistência das outras integrações de armazenamento em nuvem.

### Arquitetura da Integração:

O fluxo de trabalho é consistente com as outras integrações baseadas em Rclone:

1.  **Configuração do Rclone:** O usuário configura o Rclone com suas credenciais do MEGA (e-mail e senha).
2.  **Serviço de Backend do TSiJUKEBOX:** Utiliza comandos do Rclone para gerenciar os backups.
3.  **Fluxo de Backup:** Os dados são comprimidos, e o backend executa `rclone copy` para fazer o upload do arquivo para uma pasta no MEGA.
4.  **Fluxo de Restauração:** O backend lista os backups com `rclone ls` e baixa o arquivo selecionado com `rclone copy` para a restauração.

---

## 2. Configuração

A configuração do MEGA com o Rclone é um pouco diferente das outras, pois geralmente envolve e-mail e senha em vez de um fluxo OAuth.

### Passo 1: Configurar o Rclone para o MEGA

1.  **Inicie a Configuração Interativa do Rclone:**

    ```bash
    rclone config
    ```

2.  **Siga o Assistente:**
    -   `n` para "New remote".
    -   Dê um nome ao remote, por exemplo, `mega`.
    -   Escolha o tipo de armazenamento: `mega`.
    -   **Usuário (E-mail):** Insira o e-mail da sua conta do MEGA.
    -   **Senha:** O Rclone pedirá sua senha. Você pode digitá-la diretamente ou usar o gerenciador de senhas do Rclone para ofuscá-la.
        -   `y` para "Yes, type in my own password".
        -   Digite sua senha duas vezes.
    -   Confirme as configurações e saia do assistente.

    **Nota de Segurança:** Armazenar a senha diretamente no arquivo de configuração do Rclone é menos seguro. Para ambientes de produção, considere usar variáveis de ambiente para fornecer a senha ao Rclone ou usar um cofre de senhas.

3.  **Teste a Configuração:**

    ```bash
    # Este comando deve listar os arquivos e pastas na raiz da sua nuvem MEGA
    rclone ls mega:
    ```

### Passo 2: Configurar no TSiJUKEBOX

1.  Navegue até **Configurações > Backup > Provedores de Nuvem**.
2.  Selecione **MEGA**.
3.  No campo **"Nome do Remote Rclone"**, insira o nome definido no passo anterior (ex: `mega`).
4.  No campo **"Pasta de Destino"**, especifique a pasta de backup (ex: `Backups/TSiJUKEBOX`).
5.  Clique em **"Testar Conexão"** e, se bem-sucedido, **Salve** as configurações.

---

## 3. Comandos do Rclone Utilizados

Os comandos são os mesmos, adaptados para o remote do MEGA:

-   **Backup (Upload):**
    `rclone copy /tmp/backup.tar.gz mega:Backups/TSiJUKEBOX/`

-   **Listar Backups:**
    `rclone ls mega:Backups/TSiJUKEBOX/`

-   **Restauração (Download):**
    `rclone copy mega:Backups/TSiJUKEBOX/backup.tar.gz /tmp/`

-   **Remover Backups Antigos:**
    `rclone delete mega:Backups/TSiJUKEBOX/backup-antigo.tar.gz`

---

## 4. Considerações Específicas do MEGA

-   **Criptografia Dupla:** O MEGA já criptografa todos os arquivos ponta-a-ponta por padrão. Ao usar o TSiJUKEBOX, você se beneficia de uma camada dupla de segurança: a criptografia do próprio TSiJUKEBOX sobre o arquivo de backup, e a criptografia do MEGA durante o armazenamento e a transferência.
-   **Autenticação:** A autenticação baseada em senha pode ser menos conveniente e segura do que o OAuth. É crucial proteger o arquivo de configuração do Rclone (`rclone.conf`) ou usar métodos mais seguros para gerenciar as credenciais.
-   **Limites de Transferência:** Contas gratuitas do MEGA têm limites de transferência (largura de banda) que são renovados a cada poucas horas. Backups muito grandes ou frequentes podem atingir esse limite. O Rclone pode encontrar erros `509 (Bandwidth limit exceeded)` nesses casos e precisará esperar o limite ser resetado.
