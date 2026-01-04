# Edge Function: spotify-auth

**Data:** 24 de Dezembro de 2024  
**Autor:** Manus AI

---

## 1. Visão Geral

A Edge Function `spotify-auth` é responsável por gerenciar todo o fluxo de autenticação OAuth 2.0 com a API do Spotify. Ela atua como um backend seguro para lidar com credenciais de cliente, troca de códigos de autorização por tokens de acesso e atualização de tokens expirados.

### Funcionalidades Principais

- **Geração de URL de Login:** Cria a URL de autorização do Spotify com os escopos necessários.
- **Callback OAuth:** Recebe o código de autorização do Spotify após o login do usuário.
- **Troca de Código por Token:** Troca o código de autorização por um `access_token` e `refresh_token`.
- **Atualização de Token:** Usa o `refresh_token` para obter um novo `access_token` quando o atual expira.
- **Validação de Token:** Verifica se um `access_token` é válido fazendo uma chamada para a API do Spotify.

---

## 2. Endpoints e Ações

A função é acessada através do endpoint `/functions/v1/spotify-auth` e utiliza o parâmetro de consulta `action` para determinar a operação a ser executada.

| Ação | Método | Descrição |
|---|---|---|
| `login` | `POST` | Gera a URL de autorização do Spotify. |
| `callback` | `GET` | Endpoint de redirecionamento do Spotify após o login. |
| `exchange` | `POST` | Troca um código de autorização por tokens. |
| `refresh` | `POST` | Atualiza um `access_token` expirado. |
| `validate` | `POST` | Valida um `access_token` existente. |

---

## 3. Detalhes dos Endpoints

### 3.1. `action=login`

**Método:** `POST`

**Descrição:** Gera a URL de autorização para o usuário iniciar o processo de login no Spotify.

**Corpo da Requisição (JSON):**
```json
{
  "clientId": "SEU_CLIENT_ID",
  "clientSecret": "SEU_CLIENT_SECRET",
  "redirectUri": "URL_DE_REDIRECIONAMENTO_OPCIONAL"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "authUrl": "https://accounts.spotify.com/authorize?client_id=...",
  "state": "..."
}
```

### 3.2. `action=callback`

**Método:** `GET`

**Descrição:** Endpoint para o qual o Spotify redireciona o usuário após o login. A função extrai o `code` e o redireciona para o frontend.

**Parâmetros de Consulta (do Spotify):**
- `code`: Código de autorização.
- `state`: Estado de segurança.

**Resposta:** Redirecionamento 302 para `/settings?spotify_code=...`

### 3.3. `action=exchange`

**Método:** `POST`

**Descrição:** Troca o código de autorização recebido do callback por um `access_token` e `refresh_token`.

**Corpo da Requisição (JSON):**
```json
{
  "clientId": "SEU_CLIENT_ID",
  "clientSecret": "SEU_CLIENT_SECRET",
  "code": "CODIGO_DE_AUTORIZACAO",
  "redirectUri": "URL_DE_REDIRECIONAMENTO"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": 1671892800000,
  "scope": "..."
}
```

### 3.4. `action=refresh`

**Método:** `POST`

**Descrição:** Usa um `refresh_token` para obter um novo `access_token`.

**Corpo da Requisição (JSON):**
```json
{
  "clientId": "SEU_CLIENT_ID",
  "clientSecret": "SEU_CLIENT_SECRET",
  "refreshToken": "REFRESH_TOKEN_ATUAL"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": 1671896400000
}
```

### 3.5. `action=validate`

**Método:** `POST`

**Descrição:** Verifica se um `access_token` é válido, tentando buscar o perfil do usuário.

**Corpo da Requisição (JSON):**
```json
{
  "accessToken": "ACCESS_TOKEN_A_VALIDAR"
}
```

**Resposta de Sucesso (JSON):**
```json
{
  "valid": true,
  "user": {
    "id": "...",
    "displayName": "...",
    "email": "...",
    "imageUrl": "...",
    "product": "premium"
  }
}
```

---

## 4. Escopos Solicitados

A função solicita os seguintes escopos para garantir funcionalidade completa:

- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`
- `playlist-read-private`
- `playlist-read-collaborative`
- `playlist-modify-public`
- `playlist-modify-private`
- `user-library-read`
- `user-library-modify`
- `user-top-read`
- `user-read-recently-played`

---

## 5. Fluxo de Autenticação

1. **Frontend** chama `action=login` para obter a `authUrl`.
2. **Usuário** é redirecionado para a `authUrl` e faz login no Spotify.
3. **Spotify** redireciona para `action=callback` com um `code`.
4. **Edge Function** redireciona para o frontend com o `code`.
5. **Frontend** chama `action=exchange` com o `code` para obter os tokens.
6. **Frontend** armazena os tokens de forma segura.
7. Quando o `accessToken` expira, o **Frontend** chama `action=refresh` para obter um novo.

---

## 6. Variáveis de Ambiente

Nenhuma variável de ambiente é necessária para esta função, pois as credenciais (`clientId` e `clientSecret`) são passadas no corpo das requisições.

---

## 7. Dependências

- `deno.land/std@0.168.0/http/server.ts`

---

## 8. Considerações de Segurança

- **CORS:** A função implementa headers CORS para permitir requisições de qualquer origem.
- **Credenciais:** `clientId` e `clientSecret` são passados no corpo das requisições e não são armazenados na função.
- **Estado:** Um parâmetro `state` é usado para mitigar ataques CSRF.
- **HTTPS:** Todas as comunicações com a API do Spotify são feitas via HTTPS.
