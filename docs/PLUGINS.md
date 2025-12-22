# 🔌 TSiJUKEBOX - Sistema de Plugins

<p align="center">
  <img src="../public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX Logo" width="120">
</p>

<p align="center">
  <strong>Extensões Modulares para TSiJUKEBOX</strong>
  <br>
  Versão 4.1.0 | Dezembro 2024
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Plugins-4+-green?style=flat-square" alt="Plugins">
  <img src="https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square" alt="Python">
  <img src="https://img.shields.io/badge/Hot_Reload-✓-blue?style=flat-square" alt="Hot Reload">
</p>

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Plugins Disponíveis](#-plugins-disponíveis)
- [Instalação de Plugins](#-instalação-de-plugins)
- [Criando Plugins Customizados](#-criando-plugins-customizados)
- [API de Plugins](#-api-de-plugins)
- [Configuração](#-configuração)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O sistema de plugins do TSiJUKEBOX permite extensões modulares que adicionam funcionalidades sem modificar o núcleo do sistema.

### Características

| Feature | Descrição |
|---------|-----------|
| **Modular** | Plugins são independentes e isolados |
| **Hot Reload** | Atualização sem reiniciar o serviço |
| **Versionado** | Compatibilidade por versão semântica |
| **Seguro** | Sandbox para execução de plugins |
| **Documentado** | API bem definida e tipada |

### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    TSiJUKEBOX Core                      │
├─────────────────────────────────────────────────────────┤
│                    Plugin Manager                        │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ youtube  │ spotify  │ discord  │ lyrics   │  custom...  │
│ -dl      │ -dl      │ -rpc     │ -fetch   │             │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
```

---

## 📦 Plugins Disponíveis

### 1. youtube-music-dl

Download de músicas do YouTube Music via yt-dlp.

| Propriedade | Valor |
|-------------|-------|
| **ID** | `youtube-music-dl` |
| **Versão** | 1.0.0 |
| **Dependências** | yt-dlp, ffmpeg |
| **Tamanho** | ~50MB |

**Instalação:**
```bash
sudo python3 install.py --plugin youtube-music-dl
```

**Funcionalidades:**
- Download de faixas individuais
- Download de playlists completas
- Conversão automática para MP3/FLAC/OPUS
- Metadados e artwork embutidos
- Integração com biblioteca local

---

### 2. spotify-downloader

Download de músicas do Spotify via spotdl.

| Propriedade | Valor |
|-------------|-------|
| **ID** | `spotify-downloader` |
| **Versão** | 1.0.0 |
| **Dependências** | spotdl, ffmpeg |
| **Tamanho** | ~30MB |

**Instalação:**
```bash
sudo python3 install.py --plugin spotify-downloader
```

**Funcionalidades:**
- Download via YouTube (melhor qualidade)
- Sincronização de playlists
- Atualização automática de biblioteca
- Suporte a álbuns e artistas

---

### 3. discord-integration

Integração com Discord: Rich Presence e Webhooks.

| Propriedade | Valor |
|-------------|-------|
| **ID** | `discord-integration` |
| **Versão** | 1.0.0 |
| **Dependências** | pypresence |
| **Tamanho** | ~5MB |

**Instalação:**
```bash
sudo python3 install.py --plugin discord-integration
```

**Funcionalidades:**
- Rich Presence mostrando música atual
- Webhooks para alertas e notificações
- Integração com bot de música
- Status customizável

**Configuração:**
```json
{
  "discord": {
    "client_id": "YOUR_DISCORD_APP_ID",
    "webhook_url": "https://discord.com/api/webhooks/...",
    "show_album_art": true,
    "show_progress": true
  }
}
```

---

### 4. lyrics-fetcher

Busca de letras de múltiplas fontes.

| Propriedade | Valor |
|-------------|-------|
| **ID** | `lyrics-fetcher` |
| **Versão** | 1.0.0 |
| **Dependências** | - |
| **Tamanho** | ~2MB |

**Instalação:**
```bash
sudo python3 install.py --plugin lyrics-fetcher
```

**Fontes suportadas:**
- Genius
- Musixmatch
- AZLyrics
- LyricsOVH
- Local cache

---

## 🔧 Instalação de Plugins

### Via Instalador

```bash
# Listar plugins disponíveis
python3 install.py --list-plugins

# Instalar plugin específico
sudo python3 install.py --plugin PLUGIN_NAME

# Instalar múltiplos plugins
sudo python3 install.py --plugin youtube-music-dl --plugin discord-integration

# Instalar todos os plugins
sudo python3 install.py --all-plugins
```

### Via CLI

```bash
# Após instalação do TSiJUKEBOX
tsijukebox plugin list
tsijukebox plugin install youtube-music-dl
tsijukebox plugin remove youtube-music-dl
tsijukebox plugin update youtube-music-dl
```

---

## 🛠️ Criando Plugins Customizados

### Estrutura de Diretórios

```
plugins/
└── my-plugin/
    ├── __init__.py       # Entry point
    ├── plugin.json       # Manifest
    ├── requirements.txt  # Dependências Python
    └── src/
        └── main.py       # Lógica principal
```

### Manifest (plugin.json)

```json
{
  "id": "my-plugin",
  "name": "My Custom Plugin",
  "version": "1.0.0",
  "description": "Descrição do plugin",
  "author": "Seu Nome",
  "license": "MIT",
  "homepage": "https://github.com/...",
  "main": "src/main.py",
  "tsijukebox": {
    "minVersion": "4.0.0",
    "maxVersion": "5.0.0"
  },
  "dependencies": {
    "python": ["requests>=2.28.0"],
    "system": ["ffmpeg"]
  },
  "hooks": ["on_track_change", "on_playback_start"],
  "settings": {
    "api_key": {
      "type": "string",
      "required": true,
      "description": "API Key para o serviço"
    }
  }
}
```

### Implementação (__init__.py)

```python
"""My Custom Plugin for TSiJUKEBOX"""

from tsijukebox.plugins import PluginBase, hook

class MyPlugin(PluginBase):
    """Plugin customizado exemplo."""
    
    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key")
    
    def on_load(self):
        """Chamado quando o plugin é carregado."""
        self.logger.info("MyPlugin carregado com sucesso!")
    
    def on_unload(self):
        """Chamado quando o plugin é descarregado."""
        self.logger.info("MyPlugin descarregado.")
    
    @hook("on_track_change")
    def handle_track_change(self, track: dict):
        """Chamado quando a faixa muda."""
        self.logger.info(f"Nova faixa: {track['title']} - {track['artist']}")
        # Sua lógica aqui
    
    @hook("on_playback_start")
    def handle_playback_start(self, track: dict):
        """Chamado quando a reprodução inicia."""
        pass

# Export da classe principal
__plugin__ = MyPlugin
```

---

## 📖 API de Plugins

### Classe Base

```python
from tsijukebox.plugins import PluginBase

class PluginBase:
    """Classe base para todos os plugins."""
    
    # Atributos
    config: dict          # Configurações do plugin
    logger: Logger        # Logger do plugin
    storage: Storage      # Armazenamento persistente
    
    # Métodos de ciclo de vida
    def on_load(self) -> None: ...
    def on_unload(self) -> None: ...
    def on_config_change(self, key: str, value: Any) -> None: ...
    
    # Métodos utilitários
    def get_setting(self, key: str, default: Any = None) -> Any: ...
    def set_setting(self, key: str, value: Any) -> None: ...
    def emit_event(self, event: str, data: dict) -> None: ...
```

### Hooks Disponíveis

| Hook | Parâmetros | Descrição |
|------|------------|-----------|
| `on_track_change` | `track: dict` | Faixa mudou |
| `on_playback_start` | `track: dict` | Reprodução iniciou |
| `on_playback_pause` | `track: dict` | Reprodução pausada |
| `on_playback_stop` | `track: dict` | Reprodução parou |
| `on_volume_change` | `volume: int` | Volume alterado |
| `on_queue_update` | `queue: list` | Fila atualizada |
| `on_playlist_change` | `playlist: dict` | Playlist selecionada |
| `on_search` | `query: str` | Busca realizada |

### Storage API

```python
# Armazenar dados
self.storage.set("key", {"data": "value"})

# Recuperar dados
data = self.storage.get("key", default={})

# Remover dados
self.storage.delete("key")

# Listar chaves
keys = self.storage.keys()
```

---

## ⚙️ Configuração

### Arquivo de Configuração

Os plugins são configurados em `~/.config/tsijukebox/plugins.json`:

```json
{
  "enabled": [
    "youtube-music-dl",
    "discord-integration"
  ],
  "settings": {
    "youtube-music-dl": {
      "output_format": "mp3",
      "quality": "320k",
      "output_dir": "~/Music/Downloads"
    },
    "discord-integration": {
      "client_id": "123456789",
      "show_album_art": true
    }
  }
}
```

### Variáveis de Ambiente

```bash
# Diretório de plugins customizados
export TSIJUKEBOX_PLUGINS_DIR="$HOME/.local/share/tsijukebox/plugins"

# Modo debug para plugins
export TSIJUKEBOX_PLUGINS_DEBUG="true"

# Desabilitar hot reload
export TSIJUKEBOX_PLUGINS_HOT_RELOAD="false"
```

---

## 🆘 Troubleshooting

### Plugin não carrega

```bash
# Verificar logs do plugin
journalctl -u tsijukebox -f | grep "plugin"

# Testar plugin isoladamente
python3 -m tsijukebox.plugins.test my-plugin

# Verificar dependências
pip check
```

### Conflito de versões

```bash
# Verificar compatibilidade
tsijukebox plugin check my-plugin

# Forçar reinstalação
sudo python3 install.py --plugin my-plugin --force
```

### Hot reload não funciona

```bash
# Reiniciar serviço de plugins
systemctl restart tsijukebox-plugins

# Verificar inotify
cat /proc/sys/fs/inotify/max_user_watches
```

---

## 📚 Recursos Adicionais

- [API Reference](API-REFERENCE.md) - Referência completa de APIs
- [Developer Guide](DEVELOPER-GUIDE.md) - Guia de desenvolvimento
- [Contributing](CONTRIBUTING.md) - Como contribuir

---

<p align="center">
  <strong>TSiJUKEBOX Plugins</strong> — <em>Estenda suas possibilidades</em> 🔌
</p>
