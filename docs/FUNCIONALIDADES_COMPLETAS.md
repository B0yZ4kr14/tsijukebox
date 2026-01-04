# 🎵 TSiJUKEBOX - Funcionalidades Completas

## 📊 Visão Geral do Sistema

| Categoria | Quantidade |
|-----------|------------|
| Páginas/Rotas | 38+ |
| Componentes | 95+ |
| Hooks | 52+ |
| Contexts | 6 |
| Endpoints API | 50+ |

---

## 🌐 Acesso ao Sistema

| Ambiente | URL |
|----------|-----|
| **Local/Rede Interna** | `https://midiaserver.local/jukebox` |
| **Landing Page** | `https://tsijukebox.vercel.app` |
| **GitHub Pages** | `https://b0yz4kr14.github.io/tsijukebox/` |
| **Login Padrão** | `admin` / `admin` |

---

## 👤 Sistema de Usuários e Permissões

### Roles

| Role | Descrição |
|------|-----------|
| **admin** | Acesso total ao sistema |
| **user** | Acesso a configurações e controles |
| **newbie** | Acesso básico apenas |

### Permissões

| Permissão | admin | user | newbie |
|-----------|:-----:|:----:|:------:|
| canAccessSettings | ✅ | ✅ | ❌ |
| canManageUsers | ✅ | ❌ | ❌ |
| canAccessSystemControls | ✅ | ✅ | ❌ |

### Endpoints de Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/users` | Listar usuários |
| GET | `/api/users/{id}` | Obter usuário |
| PUT | `/api/users/{id}` | Atualizar usuário |
| DELETE | `/api/users/{id}` | Excluir usuário |
| PUT | `/api/users/{id}/role` | Alterar role |
| PUT | `/api/users/{id}/password` | Alterar senha |

---

## 🎵 Player de Música

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Play/Pause | Controle de reprodução |
| Next/Previous | Navegação entre faixas |
| Shuffle | Modo aleatório |
| Repeat | Off, Track, Context |
| Volume | Controle de volume com mute |
| Seek | Navegação na faixa |
| Queue | Fila de reprodução |
| Visualizer | Visualizador de áudio |
| Lyrics | Letras sincronizadas |

### Endpoints do Player

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/player/status` | Status atual |
| POST | `/api/player/play` | Play |
| POST | `/api/player/pause` | Pause |
| POST | `/api/player/next` | Próxima |
| POST | `/api/player/previous` | Anterior |
| POST | `/api/player/shuffle` | Toggle shuffle |
| POST | `/api/player/repeat` | Definir repeat |
| POST | `/api/player/volume` | Definir volume |
| POST | `/api/player/seek` | Seek posição |
| GET | `/api/player/queue` | Obter fila |
| POST | `/api/player/queue` | Adicionar à fila |
| DELETE | `/api/player/queue/{id}` | Remover da fila |
| POST | `/api/player/queue/reorder` | Reordenar fila |

---

## 🟢 Integração Spotify

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| OAuth | Autenticação via Spotify |
| Library | Biblioteca do usuário |
| Search | Busca de músicas |
| Playlists | Gerenciamento de playlists |
| Playback | Controle via Spotify Connect |
| Sync | Sincronização de biblioteca |

### Endpoints Spotify

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/spotify/auth` | Iniciar OAuth |
| GET | `/api/spotify/callback` | Callback OAuth |
| GET | `/api/spotify/me` | Perfil do usuário |
| GET | `/api/spotify/library` | Biblioteca |
| GET | `/api/spotify/playlists` | Playlists |
| GET | `/api/spotify/search` | Busca |
| POST | `/api/spotify/play` | Reproduzir |
| POST | `/api/spotify/sync` | Sincronizar |

### Hooks Spotify

| Hook | Descrição |
|------|-----------|
| useSpotifyAuth | Autenticação |
| useSpotifyLibrary | Biblioteca |
| useSpotifyPlayer | Player |
| useSpotifyPlaylists | Playlists |
| useSpotifySearch | Busca |
| useSpotifySync | Sincronização |

---

## 🔴 Integração YouTube Music

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Browse | Navegação de conteúdo |
| Library | Biblioteca do usuário |
| Search | Busca de músicas |
| Playlists | Gerenciamento de playlists |
| Recommendations | Recomendações |

### Endpoints YouTube Music

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/youtube/auth` | Iniciar OAuth |
| GET | `/api/youtube/callback` | Callback OAuth |
| GET | `/api/youtube/library` | Biblioteca |
| GET | `/api/youtube/playlists` | Playlists |
| GET | `/api/youtube/search` | Busca |
| GET | `/api/youtube/recommendations` | Recomendações |

### Hooks YouTube Music

| Hook | Descrição |
|------|-----------|
| useYouTubeMusicBrowse | Navegação |
| useYouTubeMusicLibrary | Biblioteca |
| useYouTubeMusicPlayer | Player |
| useYouTubeMusicPlaylists | Playlists |
| useYouTubeMusicRecommendations | Recomendações |
| useYouTubeMusicSearch | Busca |

---

## 🗄️ Banco de Dados

### Engines Suportados

| Engine | Porta | Descrição |
|--------|-------|-----------|
| **SQLite** | - | Arquivo único, ideal para single-node |
| **PostgreSQL** | 5432 | Robusto e escalável |
| **MariaDB** | 3306 | Fork do MySQL |
| **Firebird** | 3050 | Legado multiplataforma |

### Abas do DatabaseSettings

| Aba | Ícone | Descrição |
|-----|-------|-----------|
| Motor | ⚙️ | Seleção do engine |
| Config | 🗄️ | Configuração de conexão |
| Reparo | 🔧 | Ferramentas de reparo |
| Migração | ↔️ | Migração entre engines |
| Templates | 📄 | Templates de queries |
| Docs | 📖 | Documentação |

### Endpoints de Banco de Dados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/database/info` | Informações do banco |
| POST | `/api/database/vacuum` | Otimizar banco |
| POST | `/api/database/integrity` | Verificar integridade |
| POST | `/api/database/reindex` | Reconstruir índices |
| GET | `/api/database/stats` | Estatísticas |
| POST | `/api/database/migrate` | Migrar para outro engine |
| GET | `/api/database/engines` | Listar engines disponíveis |
| POST | `/api/database/test-connection` | Testar conexão |

---

## 💾 Backup

### Tipos de Backup

| Tipo | Descrição |
|------|-----------|
| **Full** | Backup completo do banco |
| **Incremental** | Apenas mudanças desde último backup |
| **Auto** | Backup automático agendado |
| **Manual** | Backup iniciado pelo usuário |

### Provedores de Nuvem

| Provedor | Descrição |
|----------|-----------|
| AWS S3 | Amazon Web Services |
| Google Drive | Google Cloud |
| Dropbox | Dropbox |
| OneDrive | Microsoft |
| MEGA | MEGA.nz |
| Storj | Descentralizado |

### Endpoints de Backup

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/backup/list` | Listar backups |
| POST | `/api/backup/full` | Backup completo |
| POST | `/api/backup/incremental` | Backup incremental |
| POST | `/api/backup/restore` | Restaurar backup |
| DELETE | `/api/backup/{id}` | Excluir backup |
| GET | `/api/backup/cloud/config` | Config nuvem |
| POST | `/api/backup/cloud/config` | Salvar config nuvem |
| POST | `/api/backup/cloud/sync` | Sincronizar com nuvem |
| POST | `/api/backup/cloud/download` | Baixar da nuvem |

---

## 📁 Mídia Local

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Scan | Escanear diretórios |
| Import | Importar músicas |
| Organize | Organizar biblioteca |
| Metadata | Editar metadados |
| Cover | Buscar capas de álbum |

### Formatos Suportados

| Formato | Extensão |
|---------|----------|
| MP3 | .mp3 |
| FLAC | .flac |
| WAV | .wav |
| OGG | .ogg |
| AAC | .aac, .m4a |
| OPUS | .opus |

### Endpoints de Mídia Local

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/media/directories` | Listar diretórios |
| POST | `/api/media/directories` | Adicionar diretório |
| DELETE | `/api/media/directories/{id}` | Remover diretório |
| POST | `/api/media/scan` | Escanear diretório |
| GET | `/api/media/tracks` | Listar músicas locais |
| PUT | `/api/media/tracks/{id}` | Atualizar metadados |
| POST | `/api/media/import` | Importar arquivos |

---

## 🔗 Integração GitHub

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Sync | Sincronização de código |
| Export | Exportar configurações |
| Backup | Backup de dados |
| Issues | Criar issues |
| Releases | Verificar releases |

### Endpoints GitHub

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/github/status` | Status da conexão |
| POST | `/api/github/sync` | Sincronizar |
| POST | `/api/github/export` | Exportar |
| GET | `/api/github/releases` | Listar releases |
| POST | `/api/github/issue` | Criar issue |

---

## 🎤 Modo Karaoke

### Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| Lyrics Sync | Letras sincronizadas |
| Pitch Control | Controle de tom |
| Reverb | Efeito de reverberação |
| Echo | Efeito de eco |
| Vocal Guide | Guia vocal |
| Score | Pontuação |

### Endpoints Karaoke

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/karaoke/lyrics/{trackId}` | Obter letras |
| POST | `/api/karaoke/session/start` | Iniciar sessão |
| POST | `/api/karaoke/session/end` | Encerrar sessão |
| POST | `/api/karaoke/pitch` | Ajustar pitch |
| POST | `/api/karaoke/effects` | Configurar efeitos |
| GET | `/api/karaoke/scores` | Histórico de pontuações |

---

## ⚙️ Sistema

### Endpoints de Sistema

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/system/status` | Status do sistema |
| GET | `/api/system/health` | Health check |
| GET | `/api/system/metrics` | Métricas (CPU, RAM, Temp) |
| POST | `/api/system/ntp/sync` | Sincronizar NTP |
| GET | `/api/system/ntp/config` | Config NTP |
| GET | `/api/system/logs` | Logs do sistema |
| POST | `/api/system/restart` | Reiniciar serviço |
| GET | `/api/system/version` | Versão do sistema |

### Serviços Instalados

| Serviço | Descrição |
|---------|-----------|
| Docker | Containerização |
| UFW | Firewall |
| NTP | Sincronização de tempo |
| Nginx | Proxy reverso + SSL |
| Grafana | Monitoramento visual |
| Prometheus | Métricas |
| Fail2ban | Proteção contra ataques |
| Avahi/mDNS | Acesso via .local |

---

## 🎨 Temas Visuais

### 6 Temas Disponíveis

| # | Tema | Cores Principais |
|---|------|------------------|
| 1 | Cosmic Player | Cyan #00D4FF, Magenta #FF00D4 |
| 2 | Karaoke Stage | Magenta #FF00D4, Purple #8A2BE2 |
| 3 | Stage Neon Metallic | Cyan #00FFFF, Magenta #FF00D4, Gold #FFD700 |
| 4 | Dashboard Home | Gold #FFD700, Amber #FBB724 |
| 5 | Spotify Integration | Green #1DB954 |
| 6 | Settings Dark | Purple #8B5CF6 |

### CSS Variables (Stage Neon Metallic)

```css
--bg-primary: #0a0a1a
--bg-secondary: #1a0a2e
--bg-tertiary: #2a1040
--accent-primary: #00FFFF (Cyan Neon)
--accent-secondary: #FF00D4 (Magenta Neon)
--accent-tertiary: #FFD700 (Gold Neon)
--text-primary: #FFFFFF
--text-secondary: #B0B0B0
--success: #00FF44
--warning: #FFD700
--error: #FF4444
```

---

## 🐳 Backend Python + Docker

### Estrutura

```
backend/
├── main.py              # FastAPI app
├── Dockerfile           # Container
├── requirements.txt     # Dependências
├── api/                 # Routers
│   ├── auth.py
│   ├── users.py
│   ├── settings.py
│   ├── tracks.py
│   ├── playlists.py
│   ├── player.py
│   ├── spotify.py
│   ├── youtube.py
│   ├── database.py
│   ├── backup.py
│   ├── media.py
│   ├── karaoke.py
│   └── system.py
├── models/              # SQLAlchemy models
│   ├── database.py
│   ├── user.py
│   ├── track.py
│   ├── playlist.py
│   └── settings.py
├── services/            # Business logic
└── utils/               # Utilitários
```

### Variáveis de Ambiente

```env
SQLITE_PATH=/var/lib/tsijukebox/data.db
MEDIA_PATH=/var/lib/tsijukebox/media
BACKUP_PATH=/var/lib/tsijukebox/backups
SECRET_KEY=your-secret-key
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
YOUTUBE_API_KEY=your-youtube-api-key
```

---

## 🚀 Modos de Instalação

| Modo | Comando | Descrição |
|------|---------|-----------|
| **Full** | `python3 installation-wizard.py` | Completo com todas as features |
| **Kiosk** | `python3 installation-wizard.py --mode kiosk` | Interface touchscreen |
| **Server** | `python3 installation-wizard.py --mode server` | Headless, apenas API |

---

🐍 **Don't Tread On Me** 🐍
