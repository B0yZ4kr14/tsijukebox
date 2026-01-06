# Melhores Práticas - TSiJUKEBOX

**Guia de boas práticas para uso e desenvolvimento do TSiJUKEBOX**

---

## 📋 Índice

- [Uso Geral](#uso-geral)
- [Performance](#performance)
- [Segurança](#segurança)
- [Backup e Manutenção](#backup-e-manutenção)
- [Desenvolvimento](#desenvolvimento)
- [Deploy em Produção](#deploy-em-produção)

---

## Uso Geral

### Organização de Bibliotecas

#### ✅ Recomendado
- Use playlists para organizar músicas por gênero, humor ou ocasião
- Crie playlists temáticas (Trabalho, Festa, Relaxar, Treino)
- Use nomes descritivos para playlists
- Mantenha a fila de reprodução curta (< 50 músicas)

#### ❌ Evite
- Adicionar todas as músicas à mesma playlist
- Usar nomes genéricos ("Playlist 1", "Nova Playlist")
- Deixar a fila muito longa (pode impactar performance)

### Modo Karaokê

#### ✅ Recomendado
- Teste as letras antes de usar em eventos públicos
- Ajuste o tamanho da fonte para a distância da tela
- Use temas de alto contraste para melhor legibilidade
- Configure o delay de letras se necessário

#### ❌ Evite
- Confiar que todas as músicas terão letras sincronizadas
- Usar fontes muito pequenas para platéias grandes
- Esquecer de testar o sistema de áudio

### Modo Kiosk

#### ✅ Recomendado
- Configure bloqueio de configurações sensíveis
- Use modo tela cheia (F11)
- Ative proteção de senha para sair do modo kiosk
- Configure um screensaver após inatividade

#### ❌ Evite
- Deixar configurações críticas acessíveis
- Permitir acesso irrestrito ao sistema operacional
- Esquecer de desabilitar atalhos do navegador

---

## Performance

### Otimização de Recursos

#### ✅ Recomendado
```javascript
// Limpar cache periodicamente
Settings → Advanced → Clear Cache (mensal)

// Otimizar banco de dados
npm run db:optimize  // Semanalmente

// Limitar histórico de reprodução
Settings → Advanced → Keep Last 1000 Plays
```

#### Qualidade de Áudio
- **Alta (320kbps)**: Para eventos e qualidade máxima
- **Média (192kbps)**: Para uso diário (recomendado)
- **Baixa (128kbps)**: Para economizar banda larga

#### Configuração de Cache
```env
# .env
CACHE_SIZE_MB=500          # Tamanho máximo do cache
CACHE_EXPIRY_DAYS=7        # Expiração do cache
PRELOAD_NEXT_TRACK=true    # Pré-carregar próxima música
```

### Banco de Dados

#### SQLite - Uso Pessoal
```bash
# Configuração otimizada para uso pessoal
DATABASE_TYPE=sqlite
SQLITE_JOURNAL_MODE=WAL     # Write-Ahead Logging
SQLITE_CACHE_SIZE=10000     # 10MB de cache
```

#### PostgreSQL - Uso Intenso/Múltiplos Usuários
```bash
# Configuração otimizada para produção
DATABASE_TYPE=postgresql
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=5000
```

#### ✅ Manutenção Regular
```bash
# Backup semanal
npm run db:backup

# Otimização mensal
npm run db:optimize

# Limpeza trimestral
npm run db:cleanup --older-than 90d
```

---

## Segurança

### Credenciais e API Keys

#### ✅ Recomendado
```env
# .env (NÃO commitar este arquivo)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
YOUTUBE_API_KEY=your_api_key

# Use variáveis de ambiente em produção
# Nunca exponha chaves no código fonte
```

#### ❌ Evite
```javascript
// ❌ NUNCA faça isso
const apiKey = "sk-1234567890abcdef";  // Hardcoded
const clientSecret = "secret123";      // Exposto no código
```

### Autenticação

#### ✅ Recomendado
- Use senhas fortes (mínimo 12 caracteres)
- Ative autenticação de dois fatores quando disponível
- Configure timeout de sessão (30 minutos recomendado)
- Use HTTPS em produção

#### Configuração Segura
```javascript
// src/config/security.ts
export const securityConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
  passwordMinLength: 12,
  requireStrongPassword: true,
};
```

### Modo Kiosk Seguro

```javascript
// Bloqueie recursos sensíveis em modo kiosk
const kioskConfig = {
  hideSettings: true,
  hideAdmin: true,
  disableDownloads: true,
  restrictNavigation: true,
  requirePinToExit: true,
  pin: "1234", // Configure um PIN seguro
};
```

---

## Backup e Manutenção

### Estratégia de Backup

#### ✅ Backup Automático (Recomendado)
```javascript
// Configuração de backup automático
Backup Settings:
  - Frequency: Daily
  - Time: 03:00 AM
  - Retention: 30 days
  - Cloud Provider: Google Drive / Storj
  - Include:
    ✓ Database
    ✓ Playlists
    ✓ User Settings
    ✓ Custom Themes
```

#### Backup Manual
```bash
# Backup completo
npm run backup:full

# Backup apenas do banco de dados
npm run backup:db

# Backup de configurações
npm run backup:config

# Restaurar backup
npm run restore -- --file=backup-2026-01-04.tar.gz
```

### Manutenção Preventiva

#### Checklist Semanal
- [ ] Verificar logs de erro
- [ ] Limpar cache desnecessário
- [ ] Atualizar dependências críticas
- [ ] Verificar uso de disco

#### Checklist Mensal
- [ ] Backup completo
- [ ] Otimizar banco de dados
- [ ] Atualizar para última versão estável
- [ ] Revisar e renovar API keys se necessário
- [ ] Testar restauração de backup

#### Checklist Trimestral
- [ ] Auditoria de segurança
- [ ] Limpeza de dados antigos
- [ ] Atualização de documentação
- [ ] Review de performance

### Monitoramento

```javascript
// Configuração de monitoramento
const monitoring = {
  enablePrometheus: true,
  exportInterval: 60000, // 1 minuto
  metrics: [
    'cpu_usage',
    'memory_usage',
    'active_users',
    'tracks_played',
    'api_response_time',
    'database_queries',
  ],
  alerts: {
    highCPU: 80, // %
    highMemory: 90, // %
    slowResponse: 2000, // ms
  },
};
```

---

## Desenvolvimento

### Estrutura de Código

#### ✅ Componentes Reutilizáveis
```tsx
// ✅ BOM: Componente focado e reutilizável
export function Button({ variant, children, onClick }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded font-medium";
  const variantClasses = variants[variant];
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ❌ RUIM: Componente monolítico
export function MegaComponent() {
  // 500+ linhas de código
  // Múltiplas responsabilidades
  // Difícil de testar e manter
}
```

#### ✅ Hooks Customizados
```tsx
// ✅ BOM: Hook focado e testável
export function usePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  
  const play = useCallback((track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);
  
  return { isPlaying, currentTrack, play };
}
```

### Testes

#### ✅ Cobertura de Testes
- **Mínimo:** 70% de cobertura
- **Recomendado:** 80%+ de cobertura
- **Ideal:** 90%+ de cobertura

#### Pirâmide de Testes
```
     /\      E2E (10%) - Fluxos críticos
    /  \     Integration (30%) - Integrações de componentes  
   /____\    Unit (60%) - Funções e componentes isolados
```

#### ✅ Boas Práticas
```typescript
// ✅ BOM: Teste descritivo e isolado
describe('usePlayer', () => {
  it('should start playing when play is called', () => {
    const { result } = renderHook(() => usePlayer());
    const track = { id: '1', name: 'Test Song' };
    
    act(() => {
      result.current.play(track);
    });
    
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTrack).toEqual(track);
  });
});

// ❌ RUIM: Teste vago e acoplado
test('it works', () => {
  // Sem descrição clara
  // Múltiplas responsabilidades
  // Dependências externas não mockadas
});
```

### Commits e Versionamento

#### ✅ Conventional Commits
```bash
# Features
git commit -m "feat: add voice control support"

# Fixes
git commit -m "fix: resolve Spotify authentication issue"

# Documentation
git commit -m "docs: update API reference"

# Refactoring
git commit -m "refactor: improve player performance"

# Tests
git commit -m "test: add integration tests for queue"
```

#### Semantic Versioning
```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (2.0.0)
MINOR: New features, backwards compatible (1.1.0)
PATCH: Bug fixes (1.0.1)
```

---

## Deploy em Produção

### Preparação

#### Checklist Pré-Deploy
- [ ] Todos os testes passando
- [ ] Build de produção gerado
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] SSL/TLS configurado
- [ ] Backup realizado
- [ ] Monitoramento ativado
- [ ] Rollback plan documentado

### Configuração de Produção

```env
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.tsijukebox.com
DATABASE_TYPE=postgresql
DATABASE_SSL=true
ENABLE_MONITORING=true
LOG_LEVEL=warn
CACHE_ENABLED=true
COMPRESSION_ENABLED=true
```

### Nginx (Recomendado)

```nginx
# /etc/nginx/sites-available/tsijukebox
server {
    listen 443 ssl http2;
    server_name tsijukebox.com;
    
    ssl_certificate /etc/letsencrypt/live/tsijukebox.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tsijukebox.com/privkey.pem;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache estático
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoramento e Logs

```javascript
// Configuração de logs em produção
const logger = {
  level: 'warn', // Apenas warnings e errors em produção
  format: 'json',
  destination: {
    file: '/var/log/tsijukebox/app.log',
    maxSize: '100MB',
    maxFiles: 10,
  },
  errorTracking: {
    enabled: true,
    service: 'sentry',
    dsn: process.env.SENTRY_DSN,
  },
};
```

---

## 📚 Recursos Adicionais

- [Arquitetura](../ARCHITECTURE.md)
- [Guia do Desenvolvedor](../DEVELOPER-GUIDE.md)
- [Troubleshooting](../TROUBLESHOOTING.md)
- [Security](../SECURITY.md)
- [Performance Optimization](../performance/OPTIMIZATION.md)

---

**Última atualização:** 04/01/2026  
**Versão:** 1.0.0

**Contribua:** Tem uma melhor prática para adicionar? [Abra uma issue](https://github.com/B0yZ4kr14/tsijukebox/issues/new?labels=documentation&template=best-practice-suggestion.md)!
