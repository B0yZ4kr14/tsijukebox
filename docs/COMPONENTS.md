# Módulos do Instalador TSiJUKEBOX v5.1.0

Este documento descreve cada módulo do instalador unificado com exemplos de uso standalone.

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Módulos Core](#módulos-core)
4. [Tabela de Módulos](#tabela-de-módulos)
5. [Uso Standalone](#uso-standalone)
6. [Exemplos por Cenário](#exemplos-por-cenário)
7. [CLI Reference](#cli-reference)

---

## Visão Geral

O instalador TSiJUKEBOX v5.1.0 é composto por **20 fases de instalação** e **15+ módulos especializados**. Cada módulo pode ser usado de forma independente ou como parte do fluxo completo de instalação.

### Características

- ✅ Instalação modular e extensível
- ✅ Suporte a dry-run para simulação
- ✅ Rollback automático em caso de falha
- ✅ Logging estruturado (console + arquivo)
- ✅ Compatibilidade com Arch Linux e derivados
- ✅ Configuração via CLI ou programática

---

## Arquitetura

```
scripts/
├── unified-installer.py          # Instalador principal (20 fases)
├── docker-install.py             # Instalador Docker alternativo
├── installer/                    # Módulos especializados
│   ├── __init__.py
│   ├── audio_setup.py            # Configuração de áudio
│   ├── cloud_backup_setup.py     # Backup na nuvem
│   ├── database_setup.py         # Banco de dados
│   ├── fonts_setup.py            # Fontes do sistema
│   ├── kiosk_chromium_setup.py   # Modo kiosk
│   ├── login_manager_setup.py    # Autologin
│   ├── ntp_setup.py              # Sincronização de tempo
│   ├── spicetify_setup.py        # Temas do Spotify
│   ├── spotify_cli_setup.py      # CLI do Spotify
│   ├── ufw_setup.py              # Firewall UFW
│   ├── voice_control_setup.py    # Controle por voz
│   └── utils/
│       └── logger.py             # Sistema de logging
└── tests/                        # Testes automatizados
    ├── conftest.py               # Fixtures compartilhados
    ├── test_unified_installer.py
    └── test_unified_installer_integration.py
```

---

## Módulos Core

### 1. audio_setup.py

**Descrição**: Configura sistema de áudio (PulseAudio ou PipeWire).

**Classes**:
- `AudioBackend` (Enum): PULSEAUDIO, PIPEWIRE, ALSA
- `AudioConfig` (dataclass): Configuração do backend
- `AudioSetup`: Classe principal de setup

**Uso Standalone**:

```python
from installer.audio_setup import AudioSetup, AudioConfig, AudioBackend

# Configuração PipeWire (recomendado)
config = AudioConfig(
    backend=AudioBackend.PIPEWIRE,
    install_bluetooth=True,
    install_equalizer=True,
    install_control_gui=True
)

setup = AudioSetup(config=config, user="seu_usuario")
success = setup.full_setup()
print(f"Audio configurado: {success}")
```

**CLI**:
```bash
# Via unified-installer
sudo python3 unified-installer.py --audio-backend pipewire

# Desabilitar áudio
sudo python3 unified-installer.py --no-audio
```

---

### 2. cloud_backup_setup.py

**Descrição**: Configura backup na nuvem com rclone, Storj, AWS S3.

**Classes**:
- `CloudProvider` (Enum): RCLONE, STORJ, AWS_S3
- `CloudBackupConfig` (dataclass): Configuração de backup
- `CloudBackupSetup`: Classe principal

**Uso Standalone**:

```python
from installer.cloud_backup_setup import CloudBackupSetup, CloudBackupConfig

config = CloudBackupConfig(
    providers=['rclone', 'storj'],
    backup_dirs=['/var/lib/tsijukebox', '/etc/tsijukebox'],
    schedule='0 2 * * *',  # 02:00 diariamente
    retention_days=30
)

setup = CloudBackupSetup(config=config, user="seu_usuario")
success = setup.full_setup()
```

**CLI**:
```bash
# Múltiplos provedores
sudo python3 unified-installer.py --cloud-providers rclone,storj,s3

# Desabilitar backup
sudo python3 unified-installer.py --no-cloud-backup
```

---

### 3. database_setup.py

**Descrição**: Configura banco de dados (SQLite, MariaDB, PostgreSQL).

**Classes**:
- `DatabaseType` (Enum): SQLITE, MARIADB, POSTGRESQL
- `DatabaseConfig` (dataclass): Configuração do banco
- `DatabaseSetup`: Classe principal

**Uso Standalone**:

```python
from installer.database_setup import DatabaseSetup, DatabaseConfig, DatabaseType

# PostgreSQL
config = DatabaseConfig(
    db_type=DatabaseType.POSTGRESQL,
    db_name='tsijukebox',
    db_user='tsi',
    db_password=None,  # Gerado automaticamente
    enable_remote=False
)

setup = DatabaseSetup(config=config)
success = setup.full_setup()
print(f"Database configurado: {success}")
```

**CLI**:
```bash
# PostgreSQL
sudo python3 unified-installer.py --database-type postgresql

# MariaDB
sudo python3 unified-installer.py --database-type mariadb

# SQLite (padrão)
sudo python3 unified-installer.py --database-type sqlite
```

---

### 4. fonts_setup.py

**Descrição**: Instala fontes do sistema (Noto, DejaVu, Liberation, FontAwesome).

**Classes**:
- `FontsConfig` (dataclass): Quais fontes instalar
- `FontsSetup`: Classe principal

**Uso Standalone**:

```python
from installer.fonts_setup import FontsSetup, FontsConfig

config = FontsConfig(
    install_noto=True,
    install_dejavu=True,
    install_liberation=True,
    install_fontawesome=True,
    install_emoji=True
)

setup = FontsSetup(config=config)
success = setup.full_setup()
```

**CLI**:
```bash
# Desabilitar fontes
sudo python3 unified-installer.py --no-fonts
```

---

### 5. kiosk_chromium_setup.py

**Descrição**: Configura modo kiosk com Chromium + Openbox.

**Classes**:
- `KioskConfig` (dataclass): URL, usuário, opções
- `KioskChromiumSetup`: Classe principal

**Uso Standalone**:

```python
from installer.kiosk_chromium_setup import KioskChromiumSetup, KioskConfig

config = KioskConfig(
    url='http://localhost:5173',
    user='kiosk',
    fullscreen=True,
    disable_screensaver=True,
    hide_cursor=True,
    auto_restart=True
)

setup = KioskChromiumSetup(config=config)
success = setup.full_setup()
```

**CLI**:
```bash
# Modo kiosk completo
sudo python3 unified-installer.py --mode kiosk --kiosk-url http://localhost:5173
```

---

### 6. login_manager_setup.py

**Descrição**: Detecta e configura autologin para SDDM, GDM, LightDM, Ly, greetd, getty.

**Classes**:
- `LoginManagerSetup`: Classe principal

**Uso Standalone**:

```python
from installer.login_manager_setup import LoginManagerSetup

setup = LoginManagerSetup()
manager = setup.detect_active_manager()
print(f"Login manager detectado: {manager}")

success = setup.configure_autologin(
    username='seu_usuario',
    session='openbox'
)
```

**CLI**:
```bash
# Desabilitar autologin
sudo python3 unified-installer.py --no-autologin
```

---

### 7. ntp_setup.py

**Descrição**: Configura sincronização de tempo (chrony ou systemd-timesyncd).

**Classes**:
- `NTPSetup`: Classe principal

**Uso Standalone**:

```python
from installer.ntp_setup import NTPSetup

setup = NTPSetup()
success = setup.full_setup(timezone='America/Sao_Paulo')
print(f"NTP configurado: {success}")
```

**CLI**:
```bash
# Timezone customizado
sudo python3 unified-installer.py --timezone Europe/London

# Desabilitar NTP
sudo python3 unified-installer.py --no-ntp
```

---

### 8. spicetify_setup.py

**Descrição**: Instala e configura Spicetify para personalização do Spotify.

**Classes**:
- `SpicetifyStatus` (Enum): Status da instalação
- `SpicetifySetup`: Classe principal

**Uso Standalone**:

```python
from installer.spicetify_setup import SpicetifySetup

setup = SpicetifySetup(user='seu_usuario')

if not setup.is_spicetify_installed():
    setup.install_spicetify()

setup.auto_configure('seu_usuario')
setup.apply_theme('Ziro')
```

**CLI**:
```bash
# Desabilitar Spicetify
sudo python3 unified-installer.py --no-spicetify
```

---

### 9. spotify_cli_setup.py

**Descrição**: Instala spotify-cli-linux para controle via terminal.

**Classes**:
- `SpotifyCLISetup`: Classe principal

**Uso Standalone**:

```python
from installer.spotify_cli_setup import SpotifyCLISetup

setup = SpotifyCLISetup(user='seu_usuario', verbose=True)
success = setup.full_setup()
```

**CLI**:
```bash
# Desabilitar CLI
sudo python3 unified-installer.py --no-spotify-cli
```

---

### 10. ufw_setup.py

**Descrição**: Configura firewall UFW com regras padrão.

**Classes**:
- `UFWSetup`: Classe principal

**Uso Standalone**:

```python
from installer.ufw_setup import UFWSetup

setup = UFWSetup()
success = setup.full_setup(mode='full')

# Regras aplicadas:
# - Deny incoming (default)
# - Allow outgoing (default)
# - Allow SSH (22)
# - Allow HTTP (80)
# - Allow HTTPS (443)
# - Allow TSiJUKEBOX (5173)
# - Allow Grafana (3000)
# - Allow Prometheus (9090)
```

**CLI**:
```bash
# Desabilitar UFW
sudo python3 unified-installer.py --no-ufw
```

---

### 11. voice_control_setup.py

**Descrição**: Configura controle por voz com Vosk.

**Classes**:
- `VoiceControlConfig` (dataclass): Idioma, modelo
- `VoiceControlSetup`: Classe principal

**Uso Standalone**:

```python
from installer.voice_control_setup import VoiceControlSetup, VoiceControlConfig

config = VoiceControlConfig(
    language='pt-BR',
    install_vosk=True,
    download_model=True
)

setup = VoiceControlSetup(config=config, user='seu_usuario')
success = setup.full_setup()
```

**CLI**:
```bash
# Idioma inglês
sudo python3 unified-installer.py --voice-language en-US

# Desabilitar voz
sudo python3 unified-installer.py --no-voice-control
```

---

## Tabela de Módulos

| Módulo | Fase | Dependências | Flags CLI | Crítico? |
|--------|------|--------------|-----------|----------|
| `audio_setup.py` | 6 | pacman | `--no-audio`, `--audio-backend` | Não |
| `cloud_backup_setup.py` | 10 | pacman, pip | `--no-cloud-backup`, `--cloud-providers` | Não |
| `database_setup.py` | 7 | pacman | `--no-database`, `--database-type` | Não |
| `fonts_setup.py` | 5 | pacman | `--no-fonts` | Não |
| `kiosk_chromium_setup.py` | 14 | pacman, xorg | `--mode kiosk`, `--kiosk-url` | Não |
| `login_manager_setup.py` | 17 | systemd | `--no-autologin` | Não |
| `ntp_setup.py` | 4 | pacman/timedatectl | `--no-ntp`, `--timezone` | Não |
| `spicetify_setup.py` | 12 | curl, Spotify | `--no-spicetify` | Não |
| `spotify_cli_setup.py` | 13 | pip | `--no-spotify-cli` | Não |
| `ufw_setup.py` | 3 | pacman | `--no-ufw` | Não |
| `voice_control_setup.py` | 15 | pacman, pip | `--no-voice-control`, `--voice-language` | Não |

### Fases Críticas (Rollback se falhar)

| Fase | Descrição | Rollback? |
|------|-----------|-----------|
| 1 - SYSTEM_CHECK | Verificação do sistema | ❌ (aborta) |
| 2 - DOCKER | Instalação Docker | ✅ |
| 18 - APP_DEPLOY | Deploy da aplicação | ✅ |

---

## Uso Standalone

### Instalação Mínima de Áudio

```python
#!/usr/bin/env python3
"""Instala apenas configuração de áudio."""

import sys
sys.path.insert(0, '/path/to/tsijukebox/scripts')

from installer.audio_setup import AudioSetup, AudioConfig, AudioBackend

config = AudioConfig(
    backend=AudioBackend.PIPEWIRE,
    install_bluetooth=True,
    install_equalizer=False,  # Sem equalizer
    install_control_gui=True
)

setup = AudioSetup(config=config, user='meu_usuario', dry_run=False)

if setup.full_setup():
    print("✓ Áudio configurado com sucesso!")
else:
    print("✗ Falha na configuração de áudio")
```

### Configuração de Database Isolada

```python
#!/usr/bin/env python3
"""Configura apenas o banco de dados."""

from installer.database_setup import DatabaseSetup, DatabaseConfig, DatabaseType

# MariaDB com configurações customizadas
config = DatabaseConfig(
    db_type=DatabaseType.MARIADB,
    db_name='meu_banco',
    db_user='meu_usuario',
    db_password='senha_segura',
    enable_remote=True
)

setup = DatabaseSetup(config=config, dry_run=False)
success = setup.full_setup()

# Obter connection string
conn_str = setup.get_connection_string()
print(f"Connection: {conn_str}")
```

### Setup de Kiosk Standalone

```python
#!/usr/bin/env python3
"""Configura modo kiosk sem instalação completa."""

from installer.kiosk_chromium_setup import KioskChromiumSetup, KioskConfig
from installer.login_manager_setup import LoginManagerSetup

# Configurar kiosk
kiosk_config = KioskConfig(
    url='https://meu-app.local',
    user='kiosk',
    fullscreen=True,
    disable_screensaver=True,
    hide_cursor=True
)

kiosk = KioskChromiumSetup(config=kiosk_config)
kiosk.full_setup()

# Configurar autologin
login = LoginManagerSetup()
login.configure_autologin(username='kiosk', session='openbox')
```

---

## Exemplos por Cenário

### Cenário 1: Servidor Headless

```bash
# Sem GUI, sem Spotify, sem áudio
sudo python3 unified-installer.py \
    --mode server \
    --no-spotify \
    --no-spicetify \
    --no-spotify-cli \
    --no-audio \
    --no-kiosk \
    --database-type postgresql
```

### Cenário 2: Quiosque de Música

```bash
# Modo kiosk com PipeWire
sudo python3 unified-installer.py \
    --mode kiosk \
    --kiosk-url http://localhost:5173 \
    --audio-backend pipewire \
    --no-dev-tools
```

### Cenário 3: Desenvolvimento

```bash
# Com ferramentas de dev, verbose
sudo python3 unified-installer.py \
    --mode full \
    --dev-tools \
    --verbose \
    --database-type sqlite
```

### Cenário 4: Instalação Mínima

```bash
# Apenas essenciais
sudo python3 unified-installer.py \
    --mode minimal \
    --no-docker \
    --no-monitoring \
    --no-cloud-backup \
    --no-voice-control
```

### Cenário 5: Simulação (Dry Run)

```bash
# Ver o que seria executado
sudo python3 unified-installer.py \
    --mode full \
    --dry-run \
    --verbose
```

---

## CLI Reference

### Opções Gerais

| Flag | Descrição | Default |
|------|-----------|---------|
| `--mode` | Modo: full, kiosk, server, minimal | full |
| `--user` | Usuário do sistema | $SUDO_USER |
| `--timezone` | Timezone do sistema | America/Sao_Paulo |
| `--dry-run` | Simular sem executar | false |
| `--verbose` | Saída detalhada | false |
| `--quiet` | Saída mínima | false |
| `--auto` | Aceitar defaults | false |

### Componentes Docker

| Flag | Descrição |
|------|-----------|
| `--no-docker` | Não instalar Docker |

### Componentes de Sistema

| Flag | Descrição |
|------|-----------|
| `--no-ufw` | Não configurar firewall |
| `--no-ntp` | Não configurar sincronização de tempo |
| `--no-fonts` | Não instalar fontes |
| `--no-autologin` | Não configurar autologin |

### Componentes de Áudio

| Flag | Descrição |
|------|-----------|
| `--no-audio` | Não configurar áudio |
| `--audio-backend` | pipewire ou pulseaudio |

### Componentes de Database

| Flag | Descrição |
|------|-----------|
| `--no-database` | Não configurar banco de dados |
| `--database-type` | sqlite, mariadb, postgresql |

### Componentes Spotify

| Flag | Descrição |
|------|-----------|
| `--no-spotify` | Não instalar Spotify |
| `--no-spicetify` | Não instalar Spicetify |
| `--no-spotify-cli` | Não instalar spotify-cli-linux |

### Componentes Avançados

| Flag | Descrição |
|------|-----------|
| `--no-nginx` | Não instalar Nginx |
| `--no-monitoring` | Não instalar Grafana/Prometheus |
| `--no-cloud-backup` | Não configurar backup |
| `--cloud-providers` | Lista: rclone,storj,s3 |
| `--no-voice-control` | Não configurar controle por voz |
| `--voice-language` | Idioma: pt-BR, en-US |
| `--dev-tools` | Instalar ferramentas de dev |

### Componentes Kiosk

| Flag | Descrição |
|------|-----------|
| `--kiosk-url` | URL para modo kiosk |

---

## Testes

### Executar Testes Unitários

```bash
cd scripts
python -m pytest tests/test_unified_installer.py -v
```

### Executar Testes de Integração

```bash
cd scripts
python -m pytest tests/test_unified_installer_integration.py -v
```

### Executar Todos os Testes com Coverage

```bash
cd scripts
python -m pytest tests/ -v --cov=. --cov-report=term-missing
```

### Executar Teste Específico

```bash
cd scripts
python -m pytest tests/test_unified_installer.py::TestInstallConfig -v
```

---

## Troubleshooting

### Módulo Não Encontrado

```
ImportError: No module named 'installer.audio_setup'
```

**Solução**: Adicione o diretório scripts ao PYTHONPATH:

```python
import sys
sys.path.insert(0, '/opt/tsijukebox/scripts')
```

### Permissão Negada

```
PermissionError: [Errno 13] Permission denied
```

**Solução**: Execute como root:

```bash
sudo python3 unified-installer.py
```

### AUR Helper Não Encontrado

```
Warning: Nenhum AUR helper encontrado, instalando paru...
```

**Solução**: O instalador tentará instalar paru automaticamente. Se falhar, instale manualmente:

```bash
git clone https://aur.archlinux.org/paru-bin.git
cd paru-bin
makepkg -si
```

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature
3. Adicione testes para novas funcionalidades
4. Verifique que todos os testes passam
5. Envie um Pull Request

---

## Licença

Domínio Público - Uso livre para qualquer propósito.
