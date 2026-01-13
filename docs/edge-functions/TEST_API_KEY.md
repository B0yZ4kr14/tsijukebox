# Test API Key Edge Function

## Overview
The `test-api-key` edge function validates API keys for various AI services by making test requests.

## Endpoint
`POST /functions/v1/test-api-key`

## Supported Services

| Service | Key Name | Test Method |
|---------|----------|-------------|
| Anthropic Claude | `ANTHROPIC_CLAUDE_OPUS`, `ANTHROPIC_API_KEY` | Messages API |
| OpenAI | `OPENAI_API_KEY` | Models API |
| Google Gemini | `GEMINI_API_KEY`, `GEMINI_GOOGLE_API_KEY` | Models API |
| Groq | `GROQ_API_KEY` | Models API |
| Manus.im | `MANUS_API_KEY` | User Info API |

## Request Schema

```typescript
interface TestKeyRequest {
  keyName: string;  // One of the supported key names
}
```

## Response Schema

```typescript
interface TestKeyResponse {
  keyName: string;
  valid: boolean;
  message: string;
  needsCredits?: boolean;
  testedAt: string;
}
```

## Example Request

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/test-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "ANTHROPIC_CLAUDE_OPUS"
  }'
```

## Example Responses

### Valid Key
```json
{
  "keyName": "ANTHROPIC_CLAUDE_OPUS",
  "valid": true,
  "message": "Claude API key válida e funcionando",
  "testedAt": "2024-01-04T10:00:00Z"
}
```

### Valid Key - No Credits
```json
{
  "keyName": "ANTHROPIC_CLAUDE_OPUS",
  "valid": true,
  "message": "Chave válida, mas conta sem créditos suficientes",
  "needsCredits": true,
  "testedAt": "2024-01-04T10:00:00Z"
}
```

### Invalid Key
```json
{
  "keyName": "ANTHROPIC_CLAUDE_OPUS",
  "valid": false,
  "message": "Chave inválida - autenticação falhou",
  "testedAt": "2024-01-04T10:00:00Z"
}
```

### Key Not Configured
```json
{
  "keyName": "ANTHROPIC_CLAUDE_OPUS",
  "valid": false,
  "message": "ANTHROPIC_CLAUDE_OPUS não está configurada",
  "testedAt": "2024-01-04T10:00:00Z"
}
```

## Service-Specific Testing

### Anthropic Claude
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Test**: Creates minimal message with Claude Sonnet
- **Status Codes**:
  - `200`: Valid and working
  - `401`: Invalid key
  - `402`: Valid but no credits
  - `403`: No permissions
  - `429`: Valid (rate limited but authenticated)

### OpenAI
- **Endpoint**: `https://api.openai.com/v1/models`
- **Test**: Lists available models
- **Status Codes**:
  - `200`: Valid and working
  - `401`: Invalid key
  - `402`/`429`: Valid but quota exceeded

### Google Gemini
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models`
- **Test**: Lists available models
- **Status Codes**:
  - `200`: Valid and working
  - `400`/`403`: Invalid or no permissions
  - `429`: Valid but quota limit reached

### Groq
- **Endpoint**: `https://api.groq.com/openai/v1/models`
- **Test**: Lists available models
- **Status Codes**:
  - `200`: Valid and working
  - `401`: Invalid key
  - `429`: Valid (temporarily rate limited)

### Manus.im
- **Endpoint**: `https://api.manus.im/v1/user/info`
- **Test**: Get user information
- **Prefix Validation**: Must start with `manus_`, `mk_`, or `manus-`
- **Fallback**: If API unavailable, validates format only

## Error Responses

### Missing Key Name (400)
```json
{
  "valid": false,
  "error": "keyName is required"
}
```

### Unknown Key Type
```json
{
  "keyName": "INVALID_KEY",
  "valid": false,
  "message": "Tipo de chave desconhecido: INVALID_KEY",
  "testedAt": "2024-01-04T10:00:00Z"
}
```

### Connection Error
```json
{
  "keyName": "ANTHROPIC_CLAUDE_OPUS",
  "valid": false,
  "message": "Erro de conexão: Network timeout",
  "testedAt": "2024-01-04T10:00:00Z"
}
```

## Features
- ✅ Real API validation (not just format)
- ✅ Multiple AI service support
- ✅ Credit/quota detection
- ✅ Rate limit handling
- ✅ Connection error handling
- ✅ Detailed error messages
- ✅ CORS enabled

## Security Notes
- Keys are read from environment variables
- Keys are never exposed in responses
- Only validation results are returned
- All tests use minimal API calls

## Use Cases
- Setup wizard API key validation
- Health check for configured services
- Troubleshooting integration issues
- Monitoring service availability
- Credit/quota alerts
