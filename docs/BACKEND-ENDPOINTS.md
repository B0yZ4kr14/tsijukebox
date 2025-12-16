# Endpoints Necessários no Backend FastAPI

Este documento descreve os endpoints que precisam ser implementados no backend FastAPI para suportar as funcionalidades de shuffle, repeat e queue.

## Endpoints de Controle de Reprodução

### 1. Shuffle

**POST `/api/player/shuffle`**

Ativa ou desativa o modo shuffle usando playerctl.

```bash
# Comando playerctl equivalente:
playerctl --player=spotify shuffle Toggle
# ou
playerctl --player=spotify shuffle On/Off
```

**Request Body:**
```json
{
  "enabled": true
}
```

**Response:**
```json
{
  "success": true
}
```

**Implementação sugerida:**
```python
@app.post("/api/player/shuffle")
async def set_shuffle(data: ShuffleRequest):
    mode = "On" if data.enabled else "Off"
    result = subprocess.run(
        ["playerctl", "--player=spotify", "shuffle", mode],
        capture_output=True, text=True
    )
    return {"success": result.returncode == 0}
```

---

### 2. Repeat

**POST `/api/player/repeat`**

Define o modo de repetição usando playerctl.

```bash
# Comando playerctl equivalente:
playerctl --player=spotify loop None/Track/Playlist
```

**Request Body:**
```json
{
  "mode": "off" | "track" | "context"
}
```

Mapeamento:
- `"off"` → `"None"`
- `"track"` → `"Track"`
- `"context"` → `"Playlist"`

**Response:**
```json
{
  "success": true
}
```

**Implementação sugerida:**
```python
@app.post("/api/player/repeat")
async def set_repeat(data: RepeatRequest):
    mode_map = {"off": "None", "track": "Track", "context": "Playlist"}
    playerctl_mode = mode_map.get(data.mode, "None")
    result = subprocess.run(
        ["playerctl", "--player=spotify", "loop", playerctl_mode],
        capture_output=True, text=True
    )
    return {"success": result.returncode == 0}
```

---

### 3. Obter Fila de Reprodução

**GET `/api/player/queue`**

Retorna a fila de reprodução atual. 

**Nota:** O playerctl não tem suporte nativo para queue. Esta funcionalidade pode ser implementada usando a Spotify Web API (se autenticado) ou mantendo um estado local no backend.

**Response:**
```json
{
  "current": {
    "id": "spotify:track:xxx",
    "title": "Song Name",
    "artist": "Artist Name",
    "album": "Album Name",
    "cover": "https://...",
    "duration": 210000,
    "uri": "spotify:track:xxx"
  },
  "next": [
    {
      "id": "spotify:track:yyy",
      "title": "Next Song",
      "artist": "Next Artist",
      "album": "Next Album",
      "cover": "https://...",
      "duration": 180000,
      "uri": "spotify:track:yyy"
    }
  ],
  "history": [
    {
      "id": "spotify:track:zzz",
      "title": "Previous Song",
      "artist": "Previous Artist",
      "album": "Previous Album",
      "cover": "https://...",
      "duration": 190000,
      "uri": "spotify:track:zzz"
    }
  ]
}
```

---

### 4. Adicionar à Fila

**POST `/api/player/queue`**

Adiciona uma faixa à fila de reprodução.

**Nota:** Requer Spotify Premium e uso da Spotify Web API.

**Request Body:**
```json
{
  "uri": "spotify:track:xxx"
}
```

**Response:**
```json
{
  "success": true
}
```

**Implementação usando Spotify Web API:**
```python
@app.post("/api/player/queue")
async def add_to_queue(data: AddToQueueRequest):
    # Requer token OAuth do Spotify
    response = requests.post(
        f"https://api.spotify.com/v1/me/player/queue?uri={data.uri}",
        headers={"Authorization": f"Bearer {spotify_token}"}
    )
    return {"success": response.status_code == 204}
```

---

### 5. Remover da Fila

**DELETE `/api/player/queue/{id}`**

Remove uma faixa específica da fila.

**Nota:** A API do Spotify não suporta remoção direta da fila. Esta funcionalidade pode ser implementada mantendo um estado local no backend.

**Response:**
```json
{
  "success": true
}
```

---

### 6. Limpar Fila

**DELETE `/api/player/queue`**

Limpa toda a fila de reprodução.

**Response:**
```json
{
  "success": true
}
```

---

## Atualização do Status do Sistema

O endpoint `/api/status` deve incluir os novos campos:

```json
{
  "cpu": 45,
  "memory": 62,
  "temp": 55,
  "playing": true,
  "volume": 75,
  "muted": false,
  "shuffle": true,
  "repeat": "off",
  "track": {
    "title": "Song Name",
    "artist": "Artist",
    "album": "Album",
    "cover": "https://...",
    "duration": 210,
    "position": 45
  }
}
```

Para obter o estado de shuffle e repeat:
```bash
playerctl --player=spotify shuffle
# Retorna: On ou Off

playerctl --player=spotify loop
# Retorna: None, Track ou Playlist
```

---

## Resumo de Comandos playerctl

| Funcionalidade | Comando |
|---------------|---------|
| Shuffle On | `playerctl --player=spotify shuffle On` |
| Shuffle Off | `playerctl --player=spotify shuffle Off` |
| Shuffle Toggle | `playerctl --player=spotify shuffle Toggle` |
| Loop Off | `playerctl --player=spotify loop None` |
| Loop Track | `playerctl --player=spotify loop Track` |
| Loop Playlist | `playerctl --player=spotify loop Playlist` |
| Get Shuffle Status | `playerctl --player=spotify shuffle` |
| Get Loop Status | `playerctl --player=spotify loop` |

---

## Schemas Pydantic Sugeridos

```python
from pydantic import BaseModel
from typing import Optional, Literal

class ShuffleRequest(BaseModel):
    enabled: bool

class RepeatRequest(BaseModel):
    mode: Literal["off", "track", "context"]

class AddToQueueRequest(BaseModel):
    uri: str

class QueueItem(BaseModel):
    id: str
    title: str
    artist: str
    album: str
    cover: Optional[str]
    duration: int
    uri: Optional[str]

class PlaybackQueue(BaseModel):
    current: Optional[QueueItem]
    next: list[QueueItem]
    history: list[QueueItem]
```

---

## Endpoint de Reordenação da Fila

### POST `/api/player/queue/reorder`

Reordena uma faixa na fila de reprodução.

**Request Body:**
```json
{
  "trackId": "spotify:track:xxx",
  "fromIndex": 0,
  "toIndex": 2
}
```

**Response:**
```json
{
  "success": true,
  "queue": {
    "next": [
      { "id": "spotify:track:yyy", "title": "...", ... },
      { "id": "spotify:track:xxx", "title": "...", ... },
      { "id": "spotify:track:zzz", "title": "...", ... }
    ]
  }
}
```

**Implementação sugerida:**
```python
from pydantic import BaseModel

class ReorderQueueRequest(BaseModel):
    trackId: str
    fromIndex: int
    toIndex: int

# Manter estado local da fila
queue_state: list[QueueItem] = []

@app.post("/api/player/queue/reorder")
async def reorder_queue(data: ReorderQueueRequest):
    global queue_state
    if 0 <= data.fromIndex < len(queue_state) and 0 <= data.toIndex < len(queue_state):
        item = queue_state.pop(data.fromIndex)
        queue_state.insert(data.toIndex, item)
        return {"success": True, "queue": {"next": queue_state}}
    return {"success": False, "message": "Invalid indices"}
```

---

## Endpoints de Banco de Dados

### GET `/api/database/info`

Retorna informações do banco de dados SQLite.

**Response:**
```json
{
  "path": "/var/lib/tsi-jukebox/database.db",
  "size": "2.4 MB",
  "tables": 12,
  "version": "SQLite 3.40.1",
  "lastModified": "2024-01-15T10:30:00Z"
}
```

### POST `/api/database/vacuum`

Executa VACUUM no banco de dados para otimizar e compactar.

**Response:**
```json
{
  "success": true,
  "message": "Database vacuumed successfully",
  "sizeBefore": "2.6 MB",
  "sizeAfter": "2.4 MB"
}
```

**Implementação sugerida:**
```python
@app.post("/api/database/vacuum")
async def vacuum_database():
    try:
        conn = sqlite3.connect(DB_PATH)
        size_before = os.path.getsize(DB_PATH)
        conn.execute("VACUUM")
        conn.close()
        size_after = os.path.getsize(DB_PATH)
        return {
            "success": True,
            "message": "Database vacuumed successfully",
            "sizeBefore": format_size(size_before),
            "sizeAfter": format_size(size_after)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
```

### POST `/api/database/integrity`

Verifica a integridade do banco de dados.

**Response:**
```json
{
  "success": true,
  "result": "ok",
  "message": "Database integrity check passed"
}
```

**Implementação sugerida:**
```python
@app.post("/api/database/integrity")
async def check_integrity():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.execute("PRAGMA integrity_check")
        result = cursor.fetchone()[0]
        conn.close()
        return {
            "success": result == "ok",
            "result": result,
            "message": "Database integrity check passed" if result == "ok" else f"Issues found: {result}"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
```

### POST `/api/database/reindex`

Reconstrói todos os índices do banco de dados.

**Response:**
```json
{
  "success": true,
  "message": "All indexes rebuilt successfully"
}
```

### POST `/api/database/stats`

Retorna estatísticas de uso do banco de dados.

**Response:**
```json
{
  "success": true,
  "tables": [
    { "name": "tracks", "rowCount": 1250, "size": "1.2 MB" },
    { "name": "playlists", "rowCount": 45, "size": "128 KB" }
  ],
  "totalSize": "2.4 MB",
  "pageSize": 4096,
  "pageCount": 614
}
```

---

## Endpoints de Backup

### GET `/api/backup/list`

Lista todos os backups disponíveis.

**Response:**
```json
{
  "backups": [
    {
      "id": "1",
      "name": "backup_2024-01-15_full.db",
      "type": "full",
      "size": "2.4 MB",
      "date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST `/api/backup/full`

Cria um backup completo do banco de dados.

**Response:**
```json
{
  "success": true,
  "backup": {
    "id": "2",
    "name": "backup_2024-01-16_full.db",
    "type": "full",
    "size": "2.4 MB",
    "date": "2024-01-16T14:00:00Z"
  }
}
```

### POST `/api/backup/incremental`

Cria um backup incremental (apenas mudanças desde o último backup).

**Response:**
```json
{
  "success": true,
  "backup": {
    "id": "3",
    "name": "backup_2024-01-16_inc.db",
    "type": "incremental",
    "size": "128 KB",
    "date": "2024-01-16T18:00:00Z"
  }
}
```

### POST `/api/backup/restore`

Restaura o banco de dados a partir de um backup.

**Request Body:**
```json
{
  "backupId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Database restored successfully"
}
```

### DELETE `/api/backup/{id}`

Exclui um backup específico.

**Response:**
```json
{
  "success": true,
  "message": "Backup deleted"
}
```

---

## Endpoints de Backup em Nuvem

### GET `/api/backup/cloud/config`

Obtém a configuração atual de backup em nuvem.

**Response:**
```json
{
  "provider": "aws",
  "awsBucket": "my-backup-bucket",
  "awsRegion": "us-east-1",
  "lastSync": "2024-01-15T10:30:00Z"
}
```

### POST `/api/backup/cloud/config`

Salva a configuração de backup em nuvem.

**Request Body (AWS S3):**
```json
{
  "provider": "aws",
  "awsBucket": "my-backup-bucket",
  "awsAccessKey": "AKIAIOSFODNN7EXAMPLE",
  "awsSecretKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "awsRegion": "us-east-1"
}
```

**Request Body (MEGA):**
```json
{
  "provider": "mega",
  "megaEmail": "user@email.com",
  "megaPassword": "password123"
}
```

**Request Body (Storj):**
```json
{
  "provider": "storj",
  "storjAccessGrant": "1DZZn..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cloud backup configuration saved"
}
```

### GET `/api/backup/cloud/oauth/{provider}`

Inicia fluxo OAuth para provedores que suportam (Google Drive, Dropbox, OneDrive).

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### POST `/api/backup/cloud/sync`

Sincroniza o backup mais recente com a nuvem.

**Response:**
```json
{
  "success": true,
  "message": "Backup synced to cloud",
  "uploadedFile": "backup_2024-01-16_full.db",
  "uploadedSize": "2.4 MB"
}
```

### POST `/api/backup/cloud/download`

Baixa um backup da nuvem.

**Request Body:**
```json
{
  "fileName": "backup_2024-01-15_full.db"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Backup downloaded from cloud",
  "localPath": "/var/lib/tsi-jukebox/backups/backup_2024-01-15_full.db"
}
```

---

## Schemas Pydantic Adicionais

```python
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class ReorderQueueRequest(BaseModel):
    trackId: str
    fromIndex: int
    toIndex: int

class DatabaseInfo(BaseModel):
    path: str
    size: str
    tables: int
    version: str
    lastModified: datetime

class BackupItem(BaseModel):
    id: str
    name: str
    type: Literal["full", "incremental"]
    size: str
    date: datetime

class CloudBackupConfig(BaseModel):
    provider: Literal["aws", "gdrive", "dropbox", "mega", "onedrive", "storj"]
    # AWS
    awsBucket: Optional[str] = None
    awsAccessKey: Optional[str] = None
    awsSecretKey: Optional[str] = None
    awsRegion: Optional[str] = None
    # MEGA
    megaEmail: Optional[str] = None
    megaPassword: Optional[str] = None
    # Storj
    storjAccessGrant: Optional[str] = None

class RestoreRequest(BaseModel):
    backupId: str

class CloudDownloadRequest(BaseModel):
    fileName: str

---

## Endpoints de Sistema - NTP

### POST `/api/system/ntp/sync`

Sincroniza o relógio do sistema com um servidor NTP.

**Request Body:**
```json
{
  "server": "pool.ntp.br"
}
```

**Response:**
```json
{
  "success": true,
  "server": "pool.ntp.br",
  "previousTime": "2024-12-16T10:30:00Z",
  "newTime": "2024-12-16T10:30:02Z",
  "offset": "+2.345s",
  "message": "Time synchronized successfully"
}
```

**Implementação sugerida:**
```python
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import subprocess

router = APIRouter()

class NtpSyncRequest(BaseModel):
    server: str = "pool.ntp.br"

class NtpSyncResponse(BaseModel):
    success: bool
    server: str
    previousTime: str
    newTime: str
    offset: str
    message: str

@router.post("/api/system/ntp/sync")
async def sync_ntp(data: NtpSyncRequest) -> NtpSyncResponse:
    try:
        previous_time = datetime.utcnow().isoformat() + "Z"
        
        # Parar serviço de sincronização automática
        subprocess.run(["sudo", "systemctl", "stop", "systemd-timesyncd"], check=False)
        
        # Sincronizar com servidor NTP
        result = subprocess.run(
            ["sudo", "ntpdate", "-u", data.server],
            capture_output=True,
            text=True
        )
        
        # Reiniciar serviço de sincronização
        subprocess.run(["sudo", "systemctl", "start", "systemd-timesyncd"], check=False)
        
        new_time = datetime.utcnow().isoformat() + "Z"
        
        # Extrair offset da saída do ntpdate
        offset = "0.000s"
        if result.stdout:
            # Formato típico: "16 Dec 10:30:02 ntpdate[1234]: adjust time server ... offset 0.123456 sec"
            import re
            match = re.search(r'offset ([+-]?\d+\.\d+)', result.stdout)
            if match:
                offset = f"{float(match.group(1)):+.3f}s"
        
        return NtpSyncResponse(
            success=result.returncode == 0,
            server=data.server,
            previousTime=previous_time,
            newTime=new_time,
            offset=offset,
            message="Time synchronized successfully" if result.returncode == 0 else f"Sync failed: {result.stderr}"
        )
    except Exception as e:
        return NtpSyncResponse(
            success=False,
            server=data.server,
            previousTime="",
            newTime="",
            offset="",
            message=str(e)
        )
```

### GET `/api/system/ntp/config`

Retorna a configuração atual de NTP do sistema.

**Response:**
```json
{
  "server": "pool.ntp.br",
  "enabled": true,
  "lastSync": "2024-12-16T10:30:00Z",
  "status": "synchronized"
}
```

---

## Configuração de Cron Job para Sincronização Automática

### Via Crontab

```bash
# Editar crontab do root
sudo crontab -e

# Adicionar linha para sincronização a cada 6 horas
0 */6 * * * /usr/bin/ntpdate pool.ntp.br >> /var/log/ntp-sync.log 2>&1
```

### Via Systemd Timer (Recomendado)

**Criar arquivo `/etc/systemd/system/ntp-sync.service`:**
```ini
[Unit]
Description=NTP Time Synchronization
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/bin/ntpdate -u pool.ntp.br
```

**Criar arquivo `/etc/systemd/system/ntp-sync.timer`:**
```ini
[Unit]
Description=NTP Sync Timer - Runs every 6 hours

[Timer]
OnBootSec=5min
OnUnitActiveSec=6h
Persistent=true

[Install]
WantedBy=timers.target
```

**Ativar timer:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ntp-sync.timer
sudo systemctl start ntp-sync.timer

# Verificar status
sudo systemctl list-timers --all | grep ntp
```

---

## Servidores NTP Recomendados (Brasil)

| Servidor | Descrição |
|----------|-----------|
| `pool.ntp.br` | Pool brasileiro (recomendado) |
| `a.ntp.br` | Servidor primário NTP.br |
| `b.ntp.br` | Servidor secundário NTP.br |
| `c.ntp.br` | Servidor terciário NTP.br |
| `gps.ntp.br` | Servidor com GPS |
| `a.st1.ntp.br` | Stratum 1 - maior precisão |
```
