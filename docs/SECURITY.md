# TSiJUKEBOX Security Guide

Security practices, policies, and recommendations.

---

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Database Security](#database-security)
4. [API Security](#api-security)
5. [Frontend Security](#frontend-security)
6. [Infrastructure Security](#infrastructure-security)
7. [Security Checklist](#security-checklist)

---

## Security Overview

TSiJUKEBOX implements security at multiple layers:

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  • Input validation • XSS prevention         │
├─────────────────────────────────────────────┤
│                  API Layer                   │
│  • Rate limiting • Authentication            │
├─────────────────────────────────────────────┤
│                  Backend                     │
│  • Edge functions • RLS policies             │
├─────────────────────────────────────────────┤
│                  Database                    │
│  • Row Level Security • Encryption           │
└─────────────────────────────────────────────┘
```

---

## Authentication Security

### Password Requirements

| Requirement | Minimum |
|-------------|---------|
| Length | 8 characters |
| Uppercase | 1 character |
| Lowercase | 1 character |
| Number | 1 digit |
| Special character | Optional |

### Secure Password Handling

```typescript
// Password hashing (bcrypt)
import { hashPassword, verifyPassword } from '@/lib/auth/passwordUtils';

// Hash password before storage
const hash = await hashPassword(plainPassword);

// Verify password
const isValid = await verifyPassword(plainPassword, storedHash);
```

### Session Management

- Sessions expire after 24 hours of inactivity
- JWT tokens are stored securely
- Refresh tokens rotate on use
- Concurrent sessions limited to 5 devices

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `admin` | Full access, user management, settings |
| `user` | Playback, queue, playlists |
| `newbie` | Limited queue access, no settings |

```typescript
// Checking permissions
import { PermissionGate } from '@/components/auth';

<PermissionGate 
  permissions={['manage_users', 'edit_settings']}
  requireAll={false}
>
  <AdminPanel />
</PermissionGate>
```

---

## Database Security

### Row Level Security (RLS)

All tables use RLS policies to ensure users can only access their own data.

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can view own data" ON user_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Example: Users can only insert their own data  
CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Sensitive Data Protection

| Data Type | Protection |
|-----------|------------|
| Passwords | bcrypt hash (cost 12) |
| API keys | AES-256 encryption |
| Personal info | Column-level encryption |
| Session tokens | Signed JWTs |

### Database Hardening

```sql
-- Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Grant specific permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON table_name TO authenticated;
```

---

## API Security

### Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 5 requests/minute |
| Search | 30 requests/minute |
| Playback | 60 requests/minute |
| General | 100 requests/minute |

### Input Validation

```typescript
import { z } from 'zod';

// Validate all inputs with Zod schemas
const searchSchema = z.object({
  query: z.string()
    .trim()
    .min(1, "Query cannot be empty")
    .max(100, "Query too long"),
  limit: z.number()
    .int()
    .min(1)
    .max(50)
    .default(20),
});

// In edge function
const validated = searchSchema.parse(requestBody);
```

### CORS Configuration

```typescript
// Edge function headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};
```

### API Key Management

- Never expose API keys in frontend code
- Use edge functions for external API calls
- Rotate keys periodically
- Use separate keys for development/production

```typescript
// ✅ Good: API key in edge function (server-side)
const response = await fetch(externalApi, {
  headers: { 'Authorization': `Bearer ${Deno.env.get('API_KEY')}` }
});

// ❌ Bad: API key in frontend
const response = await fetch(externalApi, {
  headers: { 'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}` }
});
```

---

## Frontend Security

### XSS Prevention

```typescript
// ❌ Never use dangerouslySetInnerHTML with user content
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Use text content or sanitize
<div>{userContent}</div>

// ✅ If HTML is required, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### URL Parameter Validation

```typescript
// Always encode user input in URLs
const safeUrl = `https://api.example.com/search?q=${encodeURIComponent(userQuery)}`;

// Validate URL parameters
const searchParams = new URLSearchParams(window.location.search);
const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  font-src 'self';
">
```

### Local Storage Security

```typescript
// ❌ Don't store sensitive data in localStorage
localStorage.setItem('authToken', token);

// ✅ Use httpOnly cookies for auth tokens
// Or store in memory with refresh from secure API
```

---

## Infrastructure Security

### Production Deployment

| Practice | Description |
|----------|-------------|
| HTTPS only | Force TLS 1.2+ |
| Security headers | HSTS, X-Frame-Options, etc. |
| Firewall | Allow only necessary ports |
| Updates | Regular security patches |

### Environment Variables

```bash
# Never commit these files
.env
.env.local
.env.production

# Use secrets management in production
# Supabase Edge Functions use Deno.env.get()
```

### Logging Security

```typescript
// ❌ Don't log sensitive data
console.log('User login:', { email, password });

// ✅ Redact sensitive information
console.log('User login:', { email, password: '[REDACTED]' });
```

---

## Audit Logging System

### Overview

TSiJUKEBOX implements comprehensive audit logging to track administrative actions and security-relevant events. All audit logs are immutable and accessible only to administrators.

### Audit Log Structure

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `timestamp` | Timestamp | When the event occurred |
| `actor_id` | UUID | User who performed the action |
| `actor_email` | Text | Email of the actor |
| `actor_role` | Text | Role of the actor |
| `action` | Text | Action performed |
| `category` | Text | Category (kiosk, user, system, security) |
| `severity` | Text | Severity level (info, warning, critical) |
| `target_type` | Text | Type of affected resource |
| `target_id` | Text | ID of affected resource |
| `target_name` | Text | Name of affected resource |
| `details` | JSON | Action-specific details |
| `metadata` | JSON | Additional context (IP, user-agent) |
| `status` | Text | Outcome (success, failure, pending) |
| `error_message` | Text | Error details if failed |

### Audited Events

| Category | Events |
|----------|--------|
| **Kiosk** | command_sent, command_executed, command_failed, kiosk_offline, kiosk_recovered |
| **User** | role_changed, user_created, user_deleted, permissions_changed |
| **System** | login_success, login_failed, settings_changed |
| **Security** | password_reset, session_revoked, suspicious_activity |

### Access Control

- Only administrators can read audit logs
- Logs are inserted automatically by the system
- Logs cannot be modified or deleted (immutable)

### Retention Policy

| Severity | Retention Period |
|----------|------------------|
| Info | 90 days |
| Warning | 180 days |
| Critical | 1 year |

### Querying Audit Logs

```typescript
import { useAuditLogs } from '@/hooks/useAuditLogs';

// Fetch logs with filters
const { logs, isLoading, filters, updateFilters } = useAuditLogs({
  category: 'kiosk',
  severity: 'critical',
  startDate: new Date('2024-01-01'),
});

// Log an audit event
import { useLogAudit } from '@/hooks/useAuditLogs';

const { logAudit } = useLogAudit();
await logAudit({
  action: 'command_sent',
  category: 'kiosk',
  severity: 'info',
  target_type: 'kiosk',
  target_id: 'kiosk-001',
  target_name: 'Main Lobby Kiosk',
  details: { command: 'restart' },
});
```

### Export Functionality

The AuditLogViewer component provides export options:
- **JSON**: Full structured data export
- **CSV**: Spreadsheet-compatible format

---

## Security Checklist

### Development

- [ ] Input validation on all forms
- [ ] No sensitive data in console logs
- [ ] API keys in environment variables
- [ ] Dependencies regularly updated
- [ ] No `any` types in security-critical code

### Pre-Production

- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] RLS policies verified
- [ ] Rate limiting configured
- [ ] Error messages don't leak info

### Production

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Monitoring and alerting active
- [ ] Backup encryption enabled
- [ ] Incident response plan ready

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email security@example.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
3. Allow 90 days for response before disclosure

---

## Security Updates

Stay informed about security updates:

- Watch the GitHub repository
- Subscribe to security advisories
- Monitor the CHANGELOG

---

<p align="center">
  Security is everyone's responsibility.
</p>
