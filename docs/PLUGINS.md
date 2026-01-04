# TSiJUKEBOX Plugin System

## Overview

TSiJUKEBOX supports a modular plugin architecture for extending functionality.

## Available Plugins

### Core Plugins
- **Lyrics Search**: Genius API integration for lyrics
- **GitHub Sync**: Automatic repository synchronization
- **Health Monitor**: System health and performance tracking

### Community Plugins
- Spicetify themes and customizations
- Custom visualizations
- Audio effects

## Creating Plugins

Plugins follow the standard hook pattern:

```typescript
export function useMyPlugin() {
  // Plugin logic
  return { ... };
}
```

## Installation

Plugins are automatically loaded from the `src/hooks` directory.


---

## 🔌 Plugins Oficiais

### Spotify Enhanced

Recursos avançados para integração Spotify:

- Análise de áudio em tempo real
- Recomendações personalizadas
- Controle de dispositivos múltiplos
- Sincronização de letras

**Status:** ✅ Ativo  
**Instalação:** Incluído por padrão

### Lyrics Provider

Busca letras de múltiplas fontes:

- Genius API
- Musixmatch
- Letras embarcadas (LRC)
- Cache local

**Status:** ✅ Ativo  
**Instalação:** Incluído por padrão

### Audio Visualizer

Visualizador de áudio com múltiplos estilos:

- Barras de frequência
- Forma de onda
- Espectrograma
- Visualizações customizadas

**Status:** ⚠️ Beta  
**Instalação:** `npm install @tsijukebox/visualizer`

### Discord Rich Presence

Exibe música atual no Discord:

- Capa do álbum
- Artista e título
- Tempo decorrido
- Botão "Ouvir no Spotify"

**Status:** 🔧 Em Desenvolvimento  
**Instalação:** Em breve

---

## 🛠️ Criar Plugin Customizado

### Estrutura Básica

```typescript
// plugins/my-plugin/index.ts
import { Plugin } from '@tsijukebox/types';

export default class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  
  init(app) {
    console.log('Plugin initialized');
    this.setupHooks(app);
  }
  
  setupHooks(app) {
    app.on('song:play', this.onSongPlay.bind(this));
    app.on('song:end', this.onSongEnd.bind(this));
  }
  
  onSongPlay(song) {
    console.log('Now playing:', song.title);
  }
  
  onSongEnd(song) {
    console.log('Finished:', song.title);
  }
}
```

### Hooks Disponíveis

| Hook | Parâmetros | Descrição |
|------|------------|-----------|
| `app:init` | `app` | Aplicação inicializada |
| `song:play` | `song` | Música começou a tocar |
| `song:pause` | `song` | Música pausada |
| `song:end` | `song` | Música terminou |
| `playlist:change` | `playlist` | Playlist mudou |
| `user:login` | `user` | Usuário fez login |
| `user:logout` | `user` | Usuário fez logout |

### Serviços Disponíveis

```typescript
// Acessar serviços do app
class MyPlugin implements Plugin {
  init(app) {
    // Player
    app.player.play();
    app.player.pause();
    app.player.next();
    
    // Database
    const songs = await app.db.songs.findAll();
    
    // API
    const data = await app.api.get('/endpoint');
    
    // UI
    app.ui.showNotification('Hello!');
  }
}
```

---

## 📦 Instalar Plugin

### Via NPM

```bash
npm install @tsijukebox/plugin-name
```

### Via Arquivo Local

```bash
# Copiar plugin para pasta de plugins
cp -r my-plugin src/plugins/

# Registrar no config
echo '{"plugins": ["my-plugin"]}' >> tsijukebox.config.json
```

### Configurar Plugin

```json
{
  "plugins": {
    "my-plugin": {
      "enabled": true,
      "config": {
        "apiKey": "your-api-key",
        "option1": "value1"
      }
    }
  }
}
```

---

## 🧪 Testar Plugin

```typescript
import { describe, it, expect } from 'vitest';
import MyPlugin from './my-plugin';

describe('MyPlugin', () => {
  it('should initialize correctly', () => {
    const plugin = new MyPlugin();
    expect(plugin.name).toBe('my-plugin');
  });
  
  it('should handle song play event', () => {
    const plugin = new MyPlugin();
    const song = { title: 'Test Song' };
    
    plugin.onSongPlay(song);
    // Assert expected behavior
  });
});
```

---

## 📚 Publicar Plugin

Para publicar seu plugin na galeria oficial:

1. Crie repositório no GitHub
2. Adicione README com documentação
3. Publique no NPM: `npm publish`
4. Submeta PR para adicionar à lista oficial

---

**Desenvolvido por [B0.y_Z4kr14](https://github.com/B0yZ4kr14)** • *TSI Telecom*
