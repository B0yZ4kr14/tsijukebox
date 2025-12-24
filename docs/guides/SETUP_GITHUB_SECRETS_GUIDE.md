# Guia de Configuração de Secrets no GitHub Actions

> **TSiJUKEBOX Enterprise - Configuração de Secrets para CI/CD**  
> **Versão:** 1.0.0  
> **Autor:** Manus AI  
> **Data:** 24 de Dezembro de 2024

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Lista de Secrets Necessários](#lista-de-secrets-necessários)
3. [Como Acessar as Configurações de Secrets](#como-acessar-as-configurações-de-secrets)
4. [Configuração de Cada Secret](#configuração-de-cada-secret)
5. [Verificação da Configuração](#verificação-da-configuração)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral

Este guia fornece instruções passo a passo para configurar todos os secrets necessários para o pipeline de CI/CD do TSiJUKEBOX no GitHub Actions. Os secrets são variáveis de ambiente criptografadas que permitem que o workflow acesse serviços externos de forma segura.

### Importância dos Secrets

Os secrets são essenciais para a segurança do pipeline, pois permitem armazenar credenciais sensíveis como tokens de API, chaves de acesso e senhas sem expô-las no código-fonte. O GitHub criptografa esses valores e os disponibiliza apenas durante a execução dos workflows.

---

## Lista de Secrets Necessários

O pipeline de CI/CD do TSiJUKEBOX requer os seguintes secrets:

### Secrets Obrigatórios

| Secret | Serviço | Obrigatório | Descrição |
|--------|---------|-------------|-----------|
| `VITE_SUPABASE_URL` | Supabase | ✅ Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Supabase | ✅ Sim | Chave anônima do Supabase |
| `SUPABASE_ACCESS_TOKEN` | Supabase | ✅ Sim | Token de acesso da CLI |
| `SUPABASE_PROJECT_ID` | Supabase | ✅ Sim | ID do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ Sim | Chave de serviço (testes) |

### Secrets Opcionais (Deploy)

| Secret | Serviço | Obrigatório | Descrição |
|--------|---------|-------------|-----------|
| `VERCEL_TOKEN` | Vercel | ⚠️ Deploy | Token de API da Vercel |
| `VERCEL_ORG_ID` | Vercel | ⚠️ Deploy | ID da organização Vercel |
| `VERCEL_PROJECT_ID` | Vercel | ⚠️ Deploy | ID do projeto Vercel |
| `CODECOV_TOKEN` | Codecov | ❌ Opcional | Token para cobertura |
| `SLACK_WEBHOOK_URL` | Slack | ❌ Opcional | Webhook para notificações |

---

## Como Acessar as Configurações de Secrets

### Passo 1: Acessar o Repositório

Navegue até o repositório do TSiJUKEBOX no GitHub: `https://github.com/B0yZ4kr14/tsijukebox`

### Passo 2: Acessar Settings

Clique na aba **Settings** no menu superior do repositório. Esta opção está disponível apenas para administradores do repositório.

### Passo 3: Navegar para Secrets

No menu lateral esquerdo, expanda a seção **Secrets and variables** e clique em **Actions**.

### Passo 4: Adicionar Novo Secret

Clique no botão **New repository secret** para adicionar um novo secret.

### Passo 5: Preencher os Campos

Para cada secret, preencha o campo **Name** com o nome exato do secret (ex: `VITE_SUPABASE_URL`) e o campo **Secret** com o valor correspondente. Em seguida, clique em **Add secret**.

---

## Configuração de Cada Secret

### 1. VITE_SUPABASE_URL

**Descrição:** URL do projeto Supabase que será usada pelo frontend para conectar ao backend.

**Como obter:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto TSiJUKEBOX
3. Vá para **Settings** > **API**
4. Copie o valor de **Project URL**

**Formato esperado:**
```
https://[project-id].supabase.co
```

**Exemplo:**
```
https://abcdefghijklmnop.supabase.co
```

---

### 2. VITE_SUPABASE_ANON_KEY

**Descrição:** Chave pública anônima do Supabase usada para autenticação no frontend.

**Como obter:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto TSiJUKEBOX
3. Vá para **Settings** > **API**
4. Na seção **Project API keys**, copie a chave **anon public**

**Formato esperado:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Nota de Segurança:** Esta chave é pública e pode ser exposta no frontend. Ela tem permissões limitadas definidas pelas Row Level Security (RLS) policies.

---

### 3. SUPABASE_ACCESS_TOKEN

**Descrição:** Token de acesso pessoal usado pela CLI do Supabase para operações administrativas.

**Como obter:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Clique no seu avatar no canto superior direito
3. Selecione **Account settings**
4. Vá para a seção **Access Tokens**
5. Clique em **Generate new token**
6. Dê um nome ao token (ex: "GitHub Actions CI/CD")
7. Copie o token gerado (ele só será exibido uma vez)

**Formato esperado:**
```
sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Nota de Segurança:** Este token tem acesso total à sua conta Supabase. Mantenha-o seguro e nunca o compartilhe.

---

### 4. SUPABASE_PROJECT_ID

**Descrição:** Identificador único do projeto Supabase.

**Como obter:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto TSiJUKEBOX
3. Vá para **Settings** > **General**
4. Copie o valor de **Reference ID**

**Formato esperado:**
```
abcdefghijklmnop
```

**Alternativa:** O Project ID também pode ser extraído da URL do projeto: `https://supabase.com/dashboard/project/[project-id]`

---

### 5. SUPABASE_SERVICE_ROLE_KEY

**Descrição:** Chave de serviço com permissões administrativas, usada para testes de integração que precisam ignorar RLS.

**Como obter:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto TSiJUKEBOX
3. Vá para **Settings** > **API**
4. Na seção **Project API keys**, copie a chave **service_role secret**

**Formato esperado:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ AVISO DE SEGURANÇA:** Esta chave tem acesso total ao banco de dados e ignora todas as políticas de segurança (RLS). NUNCA exponha esta chave no frontend ou em código público.

---

### 6. VERCEL_TOKEN

**Descrição:** Token de API da Vercel para deploy automatizado.

**Como obter:**

1. Acesse [Vercel Account Settings](https://vercel.com/account/tokens)
2. Clique em **Create Token**
3. Dê um nome ao token (ex: "TSiJUKEBOX CI/CD")
4. Selecione o escopo (Full Account ou específico do projeto)
5. Defina a expiração (recomendado: 1 ano ou sem expiração)
6. Clique em **Create**
7. Copie o token gerado

**Formato esperado:**
```
xxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 7. VERCEL_ORG_ID

**Descrição:** ID da organização ou conta pessoal na Vercel.

**Como obter:**

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique no nome da sua organização/conta no canto superior esquerdo
3. Vá para **Settings**
4. Na seção **General**, copie o **Team ID** (ou **User ID** para contas pessoais)

**Alternativa via CLI:**
```bash
vercel whoami
# ou
vercel teams ls
```

**Formato esperado:**
```
team_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 8. VERCEL_PROJECT_ID

**Descrição:** ID do projeto TSiJUKEBOX na Vercel.

**Como obter:**

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecione o projeto TSiJUKEBOX
3. Vá para **Settings** > **General**
4. Copie o **Project ID**

**Alternativa via CLI:**
```bash
cd /caminho/para/tsijukebox
vercel link
cat .vercel/project.json
```

**Formato esperado:**
```
prj_xxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 9. CODECOV_TOKEN

**Descrição:** Token para upload de relatórios de cobertura de código para o Codecov.

**Como obter:**

1. Acesse [Codecov](https://codecov.io/)
2. Faça login com sua conta GitHub
3. Selecione o repositório TSiJUKEBOX
4. Vá para **Settings**
5. Copie o **Repository Upload Token**

**Formato esperado:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Nota:** Para repositórios públicos, o token pode não ser necessário.

---

### 10. SLACK_WEBHOOK_URL

**Descrição:** URL do webhook do Slack para notificações de sucesso/falha do pipeline.

**Como obter:**

1. Acesse o [Slack API](https://api.slack.com/apps)
2. Clique em **Create New App** > **From scratch**
3. Dê um nome ao app (ex: "TSiJUKEBOX CI/CD")
4. Selecione o workspace
5. Vá para **Incoming Webhooks**
6. Ative **Activate Incoming Webhooks**
7. Clique em **Add New Webhook to Workspace**
8. Selecione o canal para notificações
9. Copie a **Webhook URL**

**Formato esperado:**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Verificação da Configuração

### Verificar Secrets Configurados

Após configurar todos os secrets, você pode verificar se estão configurados corretamente acessando **Settings** > **Secrets and variables** > **Actions** no repositório. Os secrets configurados aparecerão na lista, mas seus valores não serão visíveis.

### Testar o Pipeline

Para testar se os secrets estão funcionando corretamente, você pode disparar o workflow manualmente através da aba **Actions** no GitHub, selecionando o workflow **CI/CD Pipeline** e clicando em **Run workflow**.

### Verificar Logs

Após a execução, verifique os logs de cada job para garantir que os secrets estão sendo utilizados corretamente. Os valores dos secrets serão mascarados nos logs como `***`.

---

## Troubleshooting

### Erro: "Secret not found"

**Causa:** O nome do secret está incorreto ou o secret não foi configurado.

**Solução:** Verifique se o nome do secret no workflow corresponde exatamente ao nome configurado no GitHub. Os nomes são case-sensitive.

### Erro: "Invalid token" ou "Unauthorized"

**Causa:** O token expirou ou foi revogado.

**Solução:** Gere um novo token no serviço correspondente e atualize o secret no GitHub.

### Erro: "Permission denied"

**Causa:** O token não tem as permissões necessárias.

**Solução:** Verifique as permissões do token e gere um novo com as permissões adequadas.

### Erro: "Project not found" (Vercel)

**Causa:** O VERCEL_PROJECT_ID está incorreto ou o projeto não está vinculado.

**Solução:** Execute `vercel link` no diretório do projeto e verifique o arquivo `.vercel/project.json`.

### Erro: "Invalid Supabase URL"

**Causa:** A URL do Supabase está mal formatada.

**Solução:** Verifique se a URL segue o formato `https://[project-id].supabase.co` sem barra no final.

---

## Checklist de Configuração

Use este checklist para garantir que todos os secrets foram configurados corretamente:

- [ ] `VITE_SUPABASE_URL` - URL do projeto Supabase
- [ ] `VITE_SUPABASE_ANON_KEY` - Chave anônima pública
- [ ] `SUPABASE_ACCESS_TOKEN` - Token de acesso da CLI
- [ ] `SUPABASE_PROJECT_ID` - ID do projeto
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço
- [ ] `VERCEL_TOKEN` - Token da API Vercel (opcional)
- [ ] `VERCEL_ORG_ID` - ID da organização (opcional)
- [ ] `VERCEL_PROJECT_ID` - ID do projeto (opcional)
- [ ] `CODECOV_TOKEN` - Token do Codecov (opcional)
- [ ] `SLACK_WEBHOOK_URL` - Webhook do Slack (opcional)

---

## Referências

1. [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) - Documentação oficial do GitHub sobre secrets
2. [Supabase API Settings](https://supabase.com/docs/guides/api) - Documentação da API do Supabase
3. [Vercel CLI](https://vercel.com/docs/cli) - Documentação da CLI da Vercel
4. [Codecov Quick Start](https://docs.codecov.com/docs/quick-start) - Guia rápido do Codecov
5. [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks) - Documentação de webhooks do Slack

---

**Última atualização:** 24 de Dezembro de 2024
