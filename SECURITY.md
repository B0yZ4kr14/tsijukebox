# Security Policy

## Supported Versions

We release patches for security vulnerabilities. The following versions are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 4.x.x   | :white_check_mark: |
| 3.x.x   | :warning: Security fixes only |
| < 3.0   | :x:                |

## Reporting Security Vulnerabilities

**Please do NOT report security vulnerabilities through public GitHub issues.**

We take security seriously and appreciate your efforts to responsibly disclose your findings. If you discover a security vulnerability in TSiJUKEBOX, please follow our responsible disclosure process:

### Responsible Disclosure Process

1. **Do not** open a public issue or discuss the vulnerability publicly
2. **Report privately** using one of these methods:
   - Use GitHub's [Security Advisories](https://github.com/B0yZ4kr14/tsijukebox/security/advisories/new) feature (preferred)
   - Email the maintainers directly through GitHub
3. **Include detailed information**:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact and severity assessment
   - Any suggested fixes or mitigation strategies (optional)
   - Your preferred contact method for follow-up

### Response Timeline

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: Detailed response within 7 days
- **Fix Timeline**: Critical issues will be addressed within 30 days
- **Disclosure**: Coordinated public disclosure after patch is available

### Security Contacts

- **Primary Contact**: @B0yZ4kr14 (GitHub)
- **Security Advisory**: Use GitHub Security Advisories for encrypted communication

### PGP Key (Optional)

For sensitive communications, PGP encryption is available upon request. Contact the maintainers through GitHub to exchange keys.

## CVE Handling Process

When a security vulnerability is confirmed:

1. **CVE Assignment**: We will request a CVE ID if the issue is significant
2. **Patch Development**: Fix will be developed in a private repository
3. **Security Advisory**: GitHub Security Advisory will be published
4. **Release**: Patched version will be released with security notes
5. **Public Disclosure**: Full details disclosed after users have time to update
6. **Credit**: Security researchers will be credited (if desired)

## Security Measures

TSiJUKEBOX implements security at multiple layers:

| Layer | Protection |
|-------|------------|
| **Authentication** | Supabase Auth with JWT, OAuth 2.0 |
| **Database** | Row Level Security (RLS) policies |
| **API** | Rate limiting, input validation with Zod |
| **Frontend** | XSS prevention, CSP headers |
| **Secrets** | Environment variables, never in code |

For detailed security documentation, see:

📖 **[Security Guide](docs/SECURITY.md)**

## Supported Versions

| Version | Supported |
|---------|-----------|
| 4.x.x   | ✅ Active  |
| 3.x.x   | ⚠️ Security fixes only |
| < 3.0   | ❌ End of life |

## Best Practices for Users

- Keep your installation updated
- Use strong, unique passwords
- Enable two-factor authentication when available
- Regularly rotate API keys
- Review access logs periodically

---

**TSiJUKEBOX Enterprise** — Security is everyone's responsibility.
