# Suporte a Banco de Dados: PostgreSQL

**Tipo:** Documentação de Banco de Dados  
**Sistema:** PostgreSQL  
**Versão:** 12.x+

---

## 1. Visão Geral

O TSiJUKEBOX oferece suporte de primeira classe ao **PostgreSQL**, um dos mais avançados sistemas de gerenciamento de banco de dados relacional de código aberto. O PostgreSQL é conhecido por sua robustez, extensibilidade e conformidade com os padrões SQL, sendo uma escolha excelente para implantações críticas e de grande escala.

### Quando Usar PostgreSQL?

-   **Integridade de Dados Crítica:** O PostgreSQL é renomado por sua estrita aderência aos padrões ACID, tornando-o ideal quando a integridade dos dados é a maior prioridade.
-   **Tipos de Dados Avançados e Extensibilidade:** Se você planeja estender as funcionalidades do TSiJUKEBOX com recursos que se beneficiam dos tipos de dados avançados do PostgreSQL (como JSONB, PostGIS para dados geoespaciais, etc.).
-   **Alta Concorrência e Performance:** Assim como o MariaDB/MySQL, o PostgreSQL lida com alta concorrência de forma excepcional, sendo uma ótima alternativa para ambientes multiusuário intensivos.
-   **Ecossistema Robusto:** Para usuários que já estão no ecossistema PostgreSQL e desejam integrar o TSiJUKEBOX com suas ferramentas existentes de administração, backup (`pg_dump`) e monitoramento.

---

## 2. Configuração

O processo de configuração envolve preparar o servidor PostgreSQL e depois apontar o TSiJUKEBOX para ele.

### Passo 1: Preparar o Banco de Dados

1.  **Crie um Usuário (Role):**

    ```sql
    CREATE ROLE jukebox WITH LOGIN PASSWORD 'sua_senha_segura';
    ```

2.  **Crie um Banco de Dados:**

    ```sql
    CREATE DATABASE jukebox OWNER jukebox;
    ```

    Atribuir o `OWNER` ao usuário `jukebox` simplifica o gerenciamento de permissões, pois o dono do banco de dados tem todos os privilégios sobre ele por padrão.

3.  **(Opcional) Conectar e Verificar:**

    ```bash
    psql -h localhost -U jukebox -d jukebox
    ```

### Passo 2: Configurar o TSiJUKEBOX

Edite o arquivo `/etc/jukebox/database.json` com os detalhes da sua instância PostgreSQL.

```json
{
  "type": "postgresql",
  "host": "localhost",
  "port": 5432,
  "database": "jukebox",
  "user": "jukebox",
  "password": "sua_senha_segura",
  "options": {
    "ssl": false,
    "pool": {
      "min": 2,
      "max": 15
    }
  }
}
```

### Parâmetros de Configuração:

-   `"type"`: Deve ser `"postgresql"`.
-   `"host"`: Endereço do servidor PostgreSQL.
-   `"port"`: Porta do servidor (padrão 5432).
-   `"database"`: Nome do banco de dados.
-   `"user"`: Nome do usuário (role).
-   `"password"`: Senha do usuário.
-   `"options"`: Opções para o cliente de conexão.
    -   `"ssl"`: Habilita ou desabilita a conexão SSL. Para produção, é altamente recomendável usar `true` e configurar os certificados.
    -   `"pool"`: Configura o pooling de conexões. O TSiJUKEBOX usa um pool para gerenciar as conexões de forma eficiente, reutilizando-as em vez de abrir e fechar conexões para cada consulta.
        -   `"min"`: Número mínimo de conexões a manter no pool.
        -   `"max"`: Número máximo de conexões que o pool pode abrir.

Após salvar a configuração e reiniciar o TSiJUKEBOX, a aplicação irá se conectar ao PostgreSQL e executar as migrações para criar o schema do banco de dados.

---

## 3. Vantagens e Desvantagens

### Vantagens:

-   **Robustez e Confiabilidade:** Considerado por muitos como o SGBD relacional de código aberto mais robusto, com um forte foco na correção e integridade dos dados.
-   **Extensibilidade:** Suporta uma vasta gama de tipos de dados, funções personalizadas, e extensões que podem adicionar novas capacidades (ex: busca full-text avançada, processamento de dados geoespaciais).
-   **Performance em Concorrência:** Excelente performance em cenários de múltiplas leituras e escritas concorrentes, graças à sua implementação de MVCC (Multiversion Concurrency Control).

### Desvantagens:

-   **Curva de Aprendizagem:** Pode ser considerado um pouco mais complexo de administrar do que o MySQL/MariaDB para iniciantes.
-   **Performance em Cargas de Leitura Simples:** Em cenários muito simples e com alta carga de leitura, o MySQL com o engine MyISAM (embora não transacional) pode, em alguns casos, ser mais rápido. No entanto, para uma aplicação como o TSiJUKEBOX, essa diferença é geralmente insignificante.
-   **Consumo de Recursos:** Assim como outros SGBDs cliente-servidor, consome mais recursos do que o SQLite e requer um servidor dedicado para performance ótima.

O PostgreSQL é uma escolha de nível profissional para rodar o TSiJUKEBOX, ideal para quem busca o máximo em confiabilidade, integridade de dados e capacidade de extensão.
