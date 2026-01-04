# Suporte a Banco de Dados: Firebird

**Tipo:** Documentação de Banco de Dados  
**Sistema:** Firebird  
**Versão:** 3.x, 4.x

---

## 1. Visão Geral

O TSiJUKEBOX também suporta o **Firebird**, um sistema de gerenciamento de banco de dados relacional de código aberto, conhecido por sua leveza, performance e facilidade de manutenção. Originado do código do InterBase da Borland, o Firebird é uma solução robusta que pode operar tanto em modo embarcado (similar ao SQLite) quanto em modo cliente-servidor.

### Quando Usar Firebird?

-   **Facilidade de Implantação:** O Firebird é famoso por sua instalação "zero-admin" ou de baixa administração, especialmente no modo embarcado.
-   **Pegada Leve (Low Footprint):** Consome poucos recursos do sistema, sendo uma ótima opção para rodar na mesma máquina que a aplicação sem impactar significativamente a performance.
-   **Conformidade com Padrões:** Oferece boa conformidade com os padrões SQL e suporte a transações ACID.
-   **Multi-plataforma:** Roda em uma vasta gama de sistemas operacionais, incluindo Linux, Windows e macOS.

### Modos de Operação no TSiJUKEBOX:

1.  **Embarcado (Embedded):** Similar ao SQLite, o motor do banco de dados roda como uma biblioteca dentro do processo do TSiJUKEBOX. O acesso é feito a um arquivo local (`.fdb`). É ideal para instalações single-user ou com baixa concorrência.
2.  **Cliente-Servidor (Server):** O Firebird roda como um serviço separado (servidor), e o TSiJUKEBOX se conecta a ele pela rede. Este modo é recomendado para ambientes multiusuário.

---

## 2. Configuração

### Passo 1: Preparar o Banco de Dados

#### Modo Cliente-Servidor:

1.  **Instale o Servidor Firebird:** Baixe e instale o Firebird a partir do site oficial [firebirdsql.org](https://firebirdsql.org/).
2.  **Crie um Banco de Dados:** Use a ferramenta de linha de comando `isql` para criar o arquivo do banco de dados.

    ```sql
    -- Conecte-se ao servidor como o usuário padrão SYSDBA
    isql -user SYSDBA -password masterkey

    -- Crie o banco de dados
    CREATE DATABASE 
/caminho/para/seu/jukebox.fdb
 PAGE_SIZE 8192
    DEFAULT CHARACTER SET UTF8;
    QUIT;
    ```

3.  **(Recomendado) Crie um Usuário Dedicado:** Ainda no `isql`, crie um usuário específico para a aplicação para evitar usar o `SYSDBA`.

    ```sql
    CREATE USER jukebox PASSWORD 'sua_senha_segura';
    GRANT ALL ON DATABASE TO jukebox;
    ```

#### Modo Embarcado:

Neste modo, a aplicação pode criar o banco de dados automaticamente se ele não existir. Apenas as bibliotecas cliente do Firebird precisam estar presentes no sistema.

### Passo 2: Configurar o TSiJUKEBOX

Edite o arquivo `/etc/jukebox/database.json`.

**Configuração Cliente-Servidor:**

```json
{
  "type": "firebird",
  "host": "localhost",
  "port": 3050,
  "database": "/caminho/para/seu/jukebox.fdb",
  "user": "jukebox",
  "password": "sua_senha_segura",
  "options": {
    "role": null,
    "pool": {
      "min": 1,
      "max": 10
    }
  }
}
```

**Configuração Embarcada:**

```json
{
  "type": "firebird",
  "host": null, // Nulo para modo embarcado
  "port": null,
  "database": "/var/lib/jukebox/jukebox.fdb", // Caminho para o arquivo
  "user": "SYSDBA",
  "password": "masterkey",
  "options": {}
}
```

### Parâmetros de Configuração:

-   `"type"`: `"firebird"`.
-   `"host"`: Endereço do servidor Firebird. Deixe `null` para o modo embarcado.
-   `"port"`: Porta do servidor (padrão 3050).
-   `"database"`: Caminho absoluto para o arquivo `.fdb`.
-   `"user"` e `"password"`: Credenciais de acesso.
-   `"options.pool"`: Configura o pooling de conexões para o modo cliente-servidor.

Após salvar e reiniciar o TSiJUKEBOX, a aplicação irá se conectar ao Firebird e criar as tabelas necessárias.

---

## 3. Vantagens e Desvantagens

### Vantagens:

-   **Flexibilidade:** A capacidade de operar tanto em modo embarcado quanto cliente-servidor oferece grande flexibilidade de implantação.
-   **Baixa Manutenção:** O Firebird é conhecido por sua estabilidade e por exigir pouca administração contínua.
-   **Performance:** Oferece uma performance sólida, especialmente em hardware mais modesto.
-   **Recursos Avançados:** Suporta stored procedures, triggers e outros recursos avançados de banco de dados.

### Desvantagens:

-   **Popularidade:** Embora seja uma tecnologia madura e estável, sua comunidade e o ecossistema de ferramentas são menores em comparação com gigantes como PostgreSQL e MySQL.
-   **Drivers:** Encontrar drivers de banco de dados modernos e bem mantidos para certas linguagens de programação pode, às vezes, ser mais desafiador do que para SGBDs mais populares.
-   **Concorrência no Modo Embarcado:** O modo embarcado do Firebird tem limitações de concorrência (apenas um processo pode acessar o arquivo por vez), tornando o modo cliente-servidor a escolha necessária para ambientes multiusuário.

O Firebird é uma excelente alternativa ao SQLite para quem deseja um banco de dados embarcado com mais recursos, ou uma alternativa leve ao PostgreSQL/MariaDB para o modo cliente-servidor.
