# Save API Key Edge Function

## Overview
The `save-api-key` edge function validates API key formats for various services before storage.

## Endpoint
`POST /functions/v1/save-api-key`

## Request Schema

```typescript
interface SaveKeyRequest {
  keyName: string;   // Key type identifier
  keyValue: string;  // API key value
}
```

## Supported Keys

| Key Name | Prefix | Min Length | Environment Variable |
|----------|--------|------------|---------------------|
| `ANTHROPIC_CLAUDE_OPUS` | `sk-ant-` | 20 | `ANTHROPIC_CLAUDE_OPUS` |
| `MANUS_API_KEY` | None | 20 | `MANUS_API_KEY` |

## Validation Rules

1. **Key Name**: Must be in supported keys list
2. **Prefix**: Must match required prefix (if specified)
3. **Length**: Minimum 20 characters
4. **Format**: Must be trimmed, non-empty string

## Example Request

```bash
curl -X POST https://[project-id].supabase.co/functions/v1/save-api-key \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "ANTHROPIC_CLAUDE_OPUS",
    "keyValue": "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }'
```

## Success Response (200)

```json
{
  "success": true,
  "message": "Key format validated successfully for ANTHROPIC_CLAUDE_OPUS",
  "instructions": "Key has been validated. Use Lovable secrets management to store it securely.",
  "keyInfo": {
    "name": "ANTHROPIC_CLAUDE_OPUS",
    "length": 64,
    "hasValidPrefix": true
  }
}
```

## Error Responses

### Missing Fields (400)
```json
{
  "success": false,
  "error": "keyName and keyValue are required"
}
```

### Unknown Key Type (400)
```json
{
  "success": false,
  "error": "Unknown key type: INVALID_KEY. Supported: ANTHROPIC_CLAUDE_OPUS, MANUS_API_KEY"
}
```

### Invalid Prefix (400)
```json
{
  "success": false,
  "error": "Invalid key format. ANTHROPIC_CLAUDE_OPUS should start with \"sk-ant-\""
}
```

### Key Too Short (400)
```json
{
  "success": false,
  "error": "API key seems too short. Please check if you copied the full key."
}
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **This function validates format only** - it does not store keys
2. **Production deployment should use**:
   - Supabase Vault for secret storage
   - Supabase Management API for configuration
   - Encrypted storage with proper access controls
3. **Keys are logged with redaction** (first 10 chars only)
4. **Never commit keys to source control**
5. **Use Lovable secrets management** for actual storage

## Implementation Details

### Validation Process
1. Check required fields present
2. Verify key type is supported
3. Validate prefix if required
4. Check minimum length (20 chars)
5. Log validation result (redacted)
6. Return success with instructions

### Logging
```typescript
console.log(`[save-api-key] Validated key format for ${keyName}`);
console.log(`[save-api-key] Key length: ${keyValue.length} characters`);
console.log(`[save-api-key] Key prefix: ${keyValue.substring(0, 10)}...`);
```

## Adding New Key Types

To support additional API keys, add to `KEY_CONFIGS`:

```typescript
const KEY_CONFIGS: Record<string, { prefix?: string; envName: string }> = {
  'ANTHROPIC_CLAUDE_OPUS': { prefix: 'sk-ant-', envName: 'ANTHROPIC_CLAUDE_OPUS' },
  'MANUS_API_KEY': { envName: 'MANUS_API_KEY' },
  // Add new keys here:
  'NEW_SERVICE_KEY': { prefix: 'ns-', envName: 'NEW_SERVICE_KEY' },
};
```

## Features
- ✅ API key format validation
- ✅ Prefix validation
- ✅ Length validation
- ✅ Secure logging (redacted keys)
- ✅ Multiple key type support
- ✅ Clear error messages
- ✅ CORS enabled

## Use Cases
- API key validation before storage
- Configuration management
- Setup wizard key validation
- Integration testing
