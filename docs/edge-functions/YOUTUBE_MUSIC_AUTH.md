# Edge Function: youtube-music-auth

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `youtube-music-auth` gerencia o fluxo de autenticação OAuth 2.0 com a API do Google para acesso ao YouTube Music. Ela lida com a geração de URLs de autorização, troca de códigos por tokens e atualização de tokens de acesso.

### Funcionalidades Principais

- **Geração de URL de Login:** Cria a URL de autorização do Google com os escopos necessários para o YouTube Music.
- **Troca de Código por Token:** Troca o código de autorização por um `access_token` e `refresh_token`.
- **Atualização de Token:** Usa o `refresh_token` para obter um novo `access_token`.

---

## 2. Endpoints e Ações

A função é acessada através do endpoint `/functions/v1/youtube-music-auth`.

| Ação | Método | Descrição |
|---|---|---|
| `getAuthUrl` | `POST` | Gera a URL de autorização do Google. |
| `exchangeCode` | `POST` | Troca um código de autorização por tokens. |
| `refreshToken` | `POST` | Atualiza um `access_token` expirado. |

---

## 3. Detalhes dos Endpoints

### 3.1. `action=getAuthUrl`

**Método:** `POST`

**Descrição:** Gera a URL de autorização para o usuário iniciar o processo de login no Google.

**Corpo da Requisição (JSON):**
```json
{
  "action": "getAuthUrl",
  "clientId": "SEU_CLIENT_ID",
  "redirectUri": "URL_DE_REDIRECIONAMENTO"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### 3.2. `action=exchangeCode`

**Método:** `POST`

**Descrição:** Troca o código de autorização recebido do callback por um `access_token` e `refresh_token`.

**Corpo da Requisição (JSON):**
```json
{
  "action": "exchangeCode",
  "code": "CODIGO_DE_AUTORIZACAO",
  "clientId": "SEU_CLIENT_ID",
  "clientSecret": "SEU_CLIENT_SECRET",
  "redirectUri": "URL_DE_REDIRECIONAMENTO"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 3599,
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "imageUrl": "..."
  }
}
```

### 3.3. `action=refreshToken`

**Método:** `POST`

**Descrição:** Usa um `refresh_token` para obter um novo `access_token`.

**Corpo da Requisição (JSON):**
```json
{
  "action": "refreshToken",
  "refreshToken": "REFRESH_TOKEN_ATUAL",
  "clientId": "SEU_CLIENT_ID",
  "clientSecret": "SEU_CLIENT_SECRET"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "accessToken": "...",
  "expiresIn": 3599
}
```

---

## 4. Escopos Solicitados

- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

---

## 5. Fluxo de Autenticação

1. **Frontend** chama `action=getAuthUrl`.
2. **Usuário** é redirecionado para a `authUrl` e faz login no Google.
3. **Google** redireciona para a `redirectUri` com um `code`.
4. **Frontend** chama `action=exchangeCode` com o `code`.
5. **Frontend** armazena os tokens.
6. Quando o `accessToken` expira, o **Frontend** chama `action=refreshToken`.

---

## 6. Dependências

- `deno.land/std@0.168.0/http/server.ts`
