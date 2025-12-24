# Suporte a Banco de Dados: MariaDB e MySQL

**Tipo:** Documentação de Banco de Dados  
**Sistema:** MariaDB / MySQL  
**Versão:** MariaDB 10.x+, MySQL 8.x+

---

## 1. Visão Geral

Para instalações que exigem maior concorrência, escalabilidade e gerenciamento centralizado, o TSiJUKEBOX oferece suporte total a **MariaDB** e **MySQL**. Estes sistemas de gerenciamento de banco de dados (SGBDs) relacionais cliente-servidor são ideais para ambientes multiusuário ou de alta demanda.

### Quando Usar MariaDB/MySQL?

-   **Múltiplos Usuários Concorrentes:** Se muitos usuários estarão interagindo com o Jukebox simultaneamente, especialmente com operações de escrita (adicionar músicas à fila, criar playlists).
-   **Grande Volume de Dados:** Se você espera que o histórico de reprodução, estatísticas e número de playlists cresçam consideravelmente.
-   **Gerenciamento Centralizado:** Quando você já possui uma infraestrutura de banco de dados e prefere centralizar o gerenciamento, backups e monitoramento.
-   **Acesso Remoto:** Se a aplicação e o banco de dados precisam rodar em máquinas separadas.

O TSiJUKEBOX utiliza um ORM (Object-Relational Mapper) que abstrai as diferenças de sintaxe SQL entre os diferentes SGBDs, garantindo que a aplicação funcione de forma idêntica com qualquer um dos bancos de dados suportados.

---

## 2. Configuração

Para usar MariaDB ou MySQL, você precisa primeiro ter um servidor de banco de dados instalado e configurado. Depois, basta atualizar o arquivo de configuração do TSiJUKEBOX.

### Passo 1: Preparar o Banco de Dados

1.  **Crie um Banco de Dados:**

    ```sql
    CREATE DATABASE jukebox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```

2.  **Crie um Usuário:**

    ```sql
    CREATE USER 'jukebox'@'localhost' IDENTIFIED BY 'sua_senha_segura';
    ```

3.  **Conceda Permissões:**

    ```sql
    GRANT ALL PRIVILEGES ON jukebox.* TO 'jukebox'@'localhost';
    ```

4.  **Aplique as Alterações:**

    ```sql
    FLUSH PRIVILEGES;
    ```

### Passo 2: Configurar o TSiJUKEBOX

Edite o arquivo `/etc/jukebox/database.json` para refletir a nova configuração.

```json
{
  "type": "mariadb", // ou "mysql"
  "host": "localhost", // ou o IP do seu servidor de banco de dados
  "port": 3306,
  "database": "jukebox",
  "user": "jukebox",
  "password": "sua_senha_segura",
  "options": {
    "charset": "utf8mb4",
    "timezone": "local",
    "connectionLimit": 15
  }
}
```

### Parâmetros de Configuração:

-   `"type"`: `"mariadb"` ou `"mysql"`.
-   `"host"`: Endereço do servidor de banco de dados.
-   `"port"`: Porta do servidor (padrão 3306).
-   `"database"`: Nome do banco de dados criado.
-   `"user"`: Nome do usuário criado.
-   `"password"`: Senha do usuário.
-   `"options"`: Opções adicionais para o driver de conexão.
    -   `"connectionLimit"`: Número máximo de conexões que a aplicação pode abrir com o banco de dados (pooling de conexões).

Após salvar a configuração, reinicie o serviço do TSiJUKEBOX. Na primeira inicialização, a aplicação executará as migrações necessárias para criar todas as tabelas e estruturas no novo banco de dados.

---

## 3. Vantagens e Desvantagens

### Vantagens:

-   **Alta Concorrência:** Lida com um número muito maior de conexões e operações de escrita simultâneas em comparação com o SQLite.
-   **Escalabilidade:** Melhor performance em grandes volumes de dados e capacidade de rodar em um servidor dedicado e otimizado.
-   **Ferramentas Robustas:** Ecossistema maduro de ferramentas para administração, monitoramento, backup (ex: `mysqldump`) e replicação.
-   **Segurança:** Recursos de segurança mais granulares, como gerenciamento de usuários e permissões a nível de rede.

### Desvantagens:

-   **Complexidade de Configuração:** Requer a instalação, configuração e manutenção de um serviço de banco de dados separado.
-   **Maior Consumo de Recursos:** Um servidor MariaDB/MySQL consome mais memória e CPU do que a abordagem embarcada do SQLite.
-   **Overhead de Rede:** A comunicação entre a aplicação e o banco de dados ocorre pela rede (mesmo que localmente), o que introduz uma pequena latência em comparação com o acesso direto a um arquivo local.

Para a maioria das instalações do TSiJUKEBOX, o SQLite é suficiente. A opção por MariaDB/MySQL deve ser considerada para cenários de uso mais intensivo e profissional.
