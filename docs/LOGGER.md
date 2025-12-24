# 📝 TSiJUKEBOX Logger Service

Sistema de logging estruturado para substituir `console.log` em produção, mantendo funcionalidade completa em desenvolvimento.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Uso Básico](#uso-básico)
- [Níveis de Log](#níveis-de-log)
- [Contextos](#contextos)
- [Hooks React](#hooks-react)
- [Configuração](#configuração)
- [Migração](#migração)
- [API Reference](#api-reference)

---

## Visão Geral

O Logger Service oferece:

- ✅ Logging estruturado com níveis (debug, info, warn, error, fatal)
- ✅ Contextos para identificar origem dos logs
- ✅ Formatação colorida no console (desenvolvimento)
- ✅ Buffer e envio para serviço remoto (produção)
- ✅ Medição de performance
- ✅ Hook React para componentes
- ✅ Helpers de migração de console.log

---

## Instalação

O Logger já está incluído no projeto. Importe de:

```typescript
import { logger, useLogger } from '@/lib/logger';
```

---

## Uso Básico

### Logging Direto

```typescript
import { logger } from '@/lib/logger';

// Debug (apenas desenvolvimento)
logger.debug('Variável carregada', { value: 42 });

// Info (operações normais)
logger.info('Usuário logou', { userId: '123' });

// Warning (situações inesperadas)
logger.warn('Cache expirado, recarregando');

// Error (falhas que precisam atenção)
logger.error('Falha ao carregar dados', error);

// Fatal (erros críticos)
logger.fatal('Banco de dados indisponível', error);
```

### Com Contexto

```typescript
// Criar logger com contexto fixo
const log = logger.withContext('PlayerService');

log.info('Música iniciada', { trackId: 'abc' });
log.error('Falha ao reproduzir', error);
```

### Medição de Performance

```typescript
const startTime = performance.now();

// ... operação demorada ...

logger.performance('Carregar playlist', startTime);
// Output: "Performance: Carregar playlist" { duration: 234.56, unit: 'ms' }
```

---

## Níveis de Log

| Nível | Uso | Console | Remoto |
|-------|-----|---------|--------|
| `debug` | Debugging detalhado | ✅ Dev | ❌ |
| `info` | Operações normais | ✅ Dev | ✅ Prod |
| `warn` | Situações inesperadas | ✅ Dev | ✅ Prod |
| `error` | Falhas que precisam atenção | ✅ Dev | ✅ Prod |
| `fatal` | Erros críticos | ✅ Dev | ✅ Prod |

### Ícones e Cores

| Nível | Ícone | Cor |
|-------|-------|-----|
| debug | 🔍 | Cinza (#6b7280) |
| info | ℹ️ | Cyan (#00d4ff) |
| warn | ⚠️ | Amarelo (#f59e0b) |
| error | ❌ | Vermelho (#ef4444) |
| fatal | 💀 | Vermelho escuro (#dc2626) |

---

## Contextos

### Contexto para Componentes

```typescript
const log = logger.forComponent('MusicCard');

log.info('Card renderizado');
log.error('Falha ao carregar imagem', error);
```

### Contexto para Hooks

```typescript
const log = logger.forHook('useSpotify');

log.info('Conectando ao Spotify');
log.error('Token expirado', error);
```

### Contexto para APIs

```typescript
const log = logger.forAPI('SpotifyAPI');

log.info('Buscando playlists', { userId: '123' });
log.error('Erro na requisição', error);
```

---

## Hooks React

### useLogger

```typescript
import { useLogger } from '@/lib/logger';

function MusicCard({ track }) {
  const log = useLogger('MusicCard');

  useEffect(() => {
    log.info('Card montado', { trackId: track.id });
    
    return () => {
      log.debug('Card desmontado');
    };
  }, []);

  const handlePlay = async () => {
    try {
      log.info('Iniciando reprodução', { trackId: track.id });
      await playTrack(track);
    } catch (error) {
      log.error('Falha ao reproduzir', error);
    }
  };

  return <div onClick={handlePlay}>...</div>;
}
```

---

## Configuração

### Configuração Padrão

```typescript
const DEFAULT_CONFIG = {
  minLevel: import.meta.env.DEV ? 'debug' : 'info',
  enableConsole: import.meta.env.DEV,
  enableRemote: import.meta.env.PROD,
  remoteUrl: import.meta.env.VITE_LOG_ENDPOINT,
  includeStackTrace: import.meta.env.DEV,
  appPrefix: 'TSiJUKEBOX',
  bufferSize: 50,
  flushInterval: 5000,
};
```

### Alterar Configuração

```typescript
import { logger } from '@/lib/logger';

// Habilitar console em produção (debugging)
logger.configure({
  enableConsole: true,
  minLevel: 'debug',
});

// Configurar endpoint remoto
logger.configure({
  enableRemote: true,
  remoteUrl: 'https://logs.example.com/api/logs',
});
```

### Variáveis de Ambiente

```env
# .env
VITE_LOG_ENDPOINT=https://logs.example.com/api/logs
```

---

## Migração

### De console.log para logger

**Antes:**
```typescript
console.log('Usuário logou:', userId);
console.warn('Cache expirado');
console.error('Erro:', error);
```

**Depois:**
```typescript
import { logger } from '@/lib/logger';

logger.info('Usuário logou', { userId });
logger.warn('Cache expirado');
logger.error('Erro ao processar', error);
```

### Helpers de Migração

Para migração gradual, use os helpers:

```typescript
import { migrationHelpers as console } from '@/lib/logger';

// Funciona igual ao console.log, mas usa o logger
console.log('Mensagem', data);
console.warn('Aviso', data);
console.error('Erro', error);
```

### Script de Migração

```bash
# Encontrar todos os console.log
grep -rn "console.log" src --include="*.tsx" --include="*.ts"

# Substituir padrões comuns
sed -i 's/console.log(/logger.debug(/g' src/**/*.tsx
sed -i 's/console.warn(/logger.warn(/g' src/**/*.tsx
sed -i 's/console.error(/logger.error(/g' src/**/*.tsx
```

---

## API Reference

### Logger

```typescript
class Logger {
  // Métodos de log
  debug(message: string, data?: Record<string, unknown>, context?: string): void;
  info(message: string, data?: Record<string, unknown>, context?: string): void;
  warn(message: string, data?: Record<string, unknown>, context?: string): void;
  error(message: string, error?: Error | unknown, context?: string): void;
  fatal(message: string, error?: Error | unknown, context?: string): void;
  
  // Performance
  performance(action: string, startTime: number, context?: string): void;
  
  // Contextos
  withContext(context: string): ContextLogger;
  forComponent(componentName: string): ContextLogger;
  forHook(hookName: string): ContextLogger;
  forAPI(apiName: string): ContextLogger;
  
  // Configuração
  configure(config: Partial<LoggerConfig>): void;
  getConfig(): LoggerConfig;
  
  // Buffer
  flush(): Promise<void>;
}
```

### LoggerConfig

```typescript
interface LoggerConfig {
  minLevel: LogLevel;           // 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  enableConsole: boolean;       // Logs no console
  enableRemote: boolean;        // Envio para servidor
  remoteUrl?: string;           // URL do servidor de logs
  includeStackTrace: boolean;   // Stack trace em erros
  appPrefix: string;            // Prefixo nos logs
  bufferSize: number;           // Tamanho do buffer
  flushInterval: number;        // Intervalo de flush (ms)
}
```

### LogEntry

```typescript
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    duration?: number;
  };
}
```

---

## Exemplos Práticos

### Em um Hook

```typescript
// src/hooks/useSpotify.ts
import { logger } from '@/lib/logger';

const log = logger.forHook('useSpotify');

export function useSpotify() {
  const connect = async () => {
    const startTime = performance.now();
    
    try {
      log.info('Iniciando conexão com Spotify');
      const token = await getSpotifyToken();
      log.info('Token obtido', { expiresIn: token.expiresIn });
      log.performance('Conexão Spotify', startTime);
      return token;
    } catch (error) {
      log.error('Falha na conexão', error);
      throw error;
    }
  };

  return { connect };
}
```

### Em um Componente

```typescript
// src/components/player/PlayerControls.tsx
import { useLogger } from '@/lib/logger';

export function PlayerControls() {
  const log = useLogger('PlayerControls');

  const handlePlay = () => {
    log.info('Play clicado', { currentTrack: track?.id });
    // ...
  };

  const handleError = (error: Error) => {
    log.error('Erro no player', error);
    // ...
  };

  return <div>...</div>;
}
```

### Em uma API

```typescript
// src/lib/api/spotify.ts
import { logger } from '@/lib/logger';

const log = logger.forAPI('Spotify');

export async function searchTracks(query: string) {
  const startTime = performance.now();
  
  log.info('Buscando tracks', { query });
  
  try {
    const response = await fetch(`/api/spotify/search?q=${query}`);
    const data = await response.json();
    
    log.info('Busca concluída', { 
      query, 
      resultCount: data.tracks.length 
    });
    log.performance('Busca Spotify', startTime);
    
    return data;
  } catch (error) {
    log.error('Falha na busca', error);
    throw error;
  }
}
```

---

<p align="center">
  <strong>TSiJUKEBOX Logger Service</strong>
  <br>
  Versão 1.0.0 | Dezembro 2024
</p>
