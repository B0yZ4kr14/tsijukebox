_# Sistema de Migrações de Banco de Dados

**Tipo:** Documentação de Banco de Dados  
**Ferramenta:** Supabase CLI

---

## 1. Visão Geral

O TSiJUKEBOX utiliza o sistema de migrações integrado do **Supabase** para gerenciar a evolução do schema do banco de dados de forma controlada e versionada. As migrações são essenciais para garantir que as alterações na estrutura do banco de dados (como criar tabelas, adicionar colunas ou definir políticas de segurança) sejam aplicadas de forma consistente em diferentes ambientes (desenvolvimento local, staging e produção).

O Supabase CLI gera arquivos de migração em SQL puro, o que oferece total controle sobre as alterações e garante a compatibilidade com todas as funcionalidades do PostgreSQL.

### Principais Conceitos:

-   **Schema Versioning:** Cada alteração no banco de dados é capturada em um arquivo SQL com um timestamp, criando um histórico linear de versões do schema.
-   **Desenvolvimento Local Primeiro:** O fluxo de trabalho incentiva a criação e o teste de alterações no banco de dados em um ambiente de desenvolvimento local antes de aplicá-las em produção.
-   **Reprodutibilidade:** Qualquer pessoa pode recriar o estado exato do banco de dados do zero, simplesmente aplicando todas as migrações em ordem.

---

## 2. Fluxo de Trabalho de Migração

O gerenciamento das migrações é feito através de comandos do Supabase CLI.

### Passo 1: Iniciar o Ambiente Local

Antes de fazer qualquer alteração, o ambiente de desenvolvimento local do Supabase deve estar em execução.

```bash
# Inicia os containers Docker do Supabase (PostgreSQL, GoTrue, etc.)
supabase start
```

### Passo 2: Criar uma Nova Migração

Quando uma alteração no schema é necessária (ex: criar uma nova tabela), o comando `db diff` é usado. Ele compara o estado atual do banco de dados local com o estado da última migração e gera um novo arquivo SQL com as diferenças.

```bash
# Cria um novo arquivo de migração com as alterações detectadas
# O nome 'add_sync_history_table' é descritivo
supabase db diff -f add_sync_history_table
```

Isso criará um novo arquivo no diretório `supabase/migrations/`, como por exemplo:
`20251224120000_add_sync_history_table.sql`

O conteúdo deste arquivo será o código SQL necessário para aplicar a alteração, como um `CREATE TABLE ...`.

### Passo 3: Aplicar Migrações

Para aplicar as migrações em um banco de dados (seja para atualizar um ambiente local ou para implantar em produção), usa-se o comando `db push` ou `db reset`.

-   **`db push` (Ambiente Remoto/Produção):** Aplica apenas as migrações que ainda não foram executadas no banco de dados remoto do Supabase.

    ```bash
    # Aplica as migrações no banco de dados de produção
    # Requer que as variáveis de ambiente SUPABASE_ACCESS_TOKEN e SUPABASE_DB_PASSWORD estejam definidas
    supabase db push
    ```

-   **`db reset` (Ambiente Local):** Apaga completamente o banco de dados local e o recria do zero, aplicando todas as migrações desde o início. É útil para garantir que o histórico de migrações esteja limpo e funcional.

    ```bash
    # Reseta o banco de dados local e aplica todas as migrações
    supabase db reset
    ```

---

## 3. Estrutura dos Arquivos de Migração

Os arquivos de migração gerados pelo Supabase são arquivos SQL padrão. Eles contêm não apenas as alterações de DDL (Data Definition Language), mas também podem incluir políticas de RLS (Row Level Security) e outras configurações específicas do PostgreSQL.

**Exemplo de Arquivo de Migração (`..._create_sync_history_table.sql`):**

```sql
-- Cria a tabela para o histórico de sincronizações
CREATE TABLE public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_sha TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilita a Segurança a Nível de Linha (RLS)
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

-- Define a política de acesso: apenas administradores podem ler o histórico
CREATE POLICY "Admins can read sync_history"
ON public.sync_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Habilita o envio de alterações em tempo real (realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE sync_history;
```

---

## 4. Boas Práticas

-   **Migrações Pequenas e Atômicas:** Prefira criar migrações pequenas e focadas em uma única alteração lógica. Isso facilita a depuração e o rollback, se necessário.
-   **Nomes Descritivos:** Sempre use nomes descritivos ao criar um arquivo de migração (`-f nome_descritivo`). Isso torna o histórico muito mais fácil de entender.
-   **Não Edite Migrações Antigas:** Uma vez que uma migração foi aplicada (especialmente em produção), ela não deve ser editada. Se uma correção for necessária, crie uma *nova* migração que corrija o problema.
-   **Versionamento:** O diretório `supabase/migrations` deve ser sempre versionado no Git. Isso garante que toda a equipe tenha o mesmo histórico de schema e que a implantação seja consistente.
-   **Dados Iniciais (Seeding):** Para popular o banco de dados com dados iniciais, o Supabase utiliza um arquivo `supabase/seed.sql`, que é executado após todas as migrações serem aplicadas durante um `supabase db reset`.
