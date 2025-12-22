# TSiJUKEBOX - Instalação Docker Kiosk

Guia completo para instalação 100% automática do TSiJUKEBOX em modo kiosk usando Docker + SQLite local.

## 📋 Índice

- [Requisitos](#requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Opções de Instalação](#opções-de-instalação)
- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [Comandos Úteis](#comandos-úteis)
- [Troubleshooting](#troubleshooting)
- [Manutenção](#manutenção)

---

## 📦 Requisitos

### Hardware Mínimo
- **CPU**: x86_64 (Intel/AMD)
- **RAM**: 2GB (recomendado 4GB)
- **Armazenamento**: 10GB livres
- **Rede**: Conexão com internet (apenas para instalação)

### Sistemas Suportados
- ✅ CachyOS
- ✅ Arch Linux
- ✅ Manjaro
- ✅ EndeavourOS
- ✅ Artix Linux
- ✅ Garuda Linux

---

## ⚡ Instalação Rápida

### One-liner (recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install-docker-kiosk.py | sudo python3
```

### Download e execução manual

```bash
# Download
wget https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install-docker-kiosk.py

# Executar
sudo python3 install-docker-kiosk.py
```

---

## 🔧 Opções de Instalação

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--user` | Nome do usuário kiosk | `kiosk` |
| `--port` | Porta da aplicação | `80` |
| `--webhook` | URL para notificações | - |
| `--timezone` | Fuso horário | `America/Sao_Paulo` |
| `--resolution` | Resolução da tela | auto |
| `--rotation` | Rotação (0, 90, 180, 270) | `0` |
| `--show-cursor` | Manter cursor visível | `false` |
| `--no-reboot` | Não reiniciar após instalação | `false` |

### Exemplos

```bash
# Porta customizada
sudo python3 install-docker-kiosk.py --port 8080

# Com webhook para notificações
sudo python3 install-docker-kiosk.py --webhook https://api.example.com/kiosk-events

# Resolução específica com rotação
sudo python3 install-docker-kiosk.py --resolution 1920x1080 --rotation 90

# Usuário personalizado sem reboot automático
sudo python3 install-docker-kiosk.py --user myjukebox --no-reboot
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Sistema Operacional                     │
│                    (CachyOS/Arch Linux)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Systemd    │    │   Openbox    │    │  Watchdog    │  │
│  │  (serviços)  │    │   (kiosk)    │    │  (recovery)  │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                      Docker                          │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │           TSiJUKEBOX Container                 │  │  │
│  │  │  ┌─────────────┐    ┌─────────────────────┐   │  │  │
│  │  │  │   Nginx     │◄───│   React App (Vite)  │   │  │  │
│  │  │  │   :80       │    │                     │   │  │  │
│  │  │  └─────────────┘    └─────────────────────┘   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                          │                            │  │
│  │                          ▼                            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │              SQLite (Volume)                   │  │  │
│  │  │         /var/lib/tsijukebox/jukebox.db        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Chromium (Kiosk)                    │  │
│  │               http://localhost:80                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Função |
|------------|--------|
| **Docker** | Container com a aplicação web |
| **SQLite** | Banco de dados local (volume montado) |
| **Openbox** | Window manager minimalista para kiosk |
| **Chromium** | Navegador em modo fullscreen |
| **Watchdog** | Monitora e reinicia componentes em caso de falha |
| **Systemd** | Gerencia serviços e autologin |

---

## ⚙️ Configuração

### Diretórios Principais

```
/opt/tsijukebox/          # Instalação principal
├── docker-compose.yml    # Configuração Docker
├── version.json          # Informações da instalação
└── repo/                 # Código fonte (se build local)

/var/lib/tsijukebox/      # Dados persistentes
├── jukebox.db            # Banco SQLite
├── backups/              # Backups automáticos
└── cache/                # Cache da aplicação

/var/log/tsijukebox/      # Logs
├── watchdog.log          # Log do watchdog
└── xsession.log          # Log da sessão X

/home/kiosk/              # Home do usuário kiosk
├── .config/openbox/      # Configuração Openbox
├── .xinitrc              # Inicialização do X
└── .bash_profile         # Auto-startx
```

### Serviços Systemd

```bash
# Container Docker
systemctl status tsijukebox.service

# Watchdog
systemctl status tsijukebox-watchdog.service
```

---

## 🔑 Comandos Úteis

### Gerenciamento do Container

```bash
# Ver status
docker ps

# Logs do container
docker logs -f tsijukebox

# Reiniciar container
cd /opt/tsijukebox && docker compose restart

# Parar tudo
cd /opt/tsijukebox && docker compose down

# Iniciar tudo
cd /opt/tsijukebox && docker compose up -d
```

### Gerenciamento do Kiosk

```bash
# Sair do modo kiosk (emergência)
Ctrl+Alt+Backspace

# Reiniciar Chromium
Ctrl+Alt+R

# Acessar terminal (de outra máquina via SSH)
ssh kiosk@<ip-do-kiosk>
```

### Banco de Dados

```bash
# Acessar SQLite
sqlite3 /var/lib/tsijukebox/jukebox.db

# Ver tabelas
.tables

# Ver histórico de reprodução
SELECT * FROM playback_history ORDER BY played_at DESC LIMIT 10;

# Ver configurações
SELECT * FROM settings;
```

### Logs

```bash
# Log do watchdog
tail -f /var/log/tsijukebox/watchdog.log

# Log do Docker
journalctl -u tsijukebox.service -f

# Log da sessão X
cat /var/log/tsijukebox/xsession.log
```

---

## 🔧 Troubleshooting

### Container não inicia

```bash
# Verificar status
systemctl status tsijukebox.service

# Ver logs detalhados
journalctl -u tsijukebox.service -n 50

# Tentar iniciar manualmente
cd /opt/tsijukebox && docker compose up

# Verificar imagem
docker images | grep tsijukebox
```

### Chromium não abre

```bash
# Verificar se X está rodando
DISPLAY=:0 xdpyinfo

# Verificar se container está acessível
curl http://localhost:80

# Reiniciar Chromium manualmente
DISPLAY=:0 /usr/local/bin/start-kiosk.sh
```

### Tela preta

```bash
# Verificar Openbox
DISPLAY=:0 openbox --debug

# Verificar logs X
cat /var/log/tsijukebox/xsession.log

# Reiniciar sessão
sudo systemctl restart getty@tty1
```

### Sem áudio

```bash
# Verificar PulseAudio
pulseaudio --check

# Reiniciar PulseAudio
pulseaudio -k && pulseaudio --start

# Verificar dispositivos
aplay -l
```

---

## 🛠️ Manutenção

### Atualizar Aplicação

```bash
# Baixar nova imagem
cd /opt/tsijukebox
docker compose pull

# Reiniciar com nova versão
docker compose down
docker compose up -d
```

### Backup do Banco

```bash
# Backup manual
cp /var/lib/tsijukebox/jukebox.db /var/lib/tsijukebox/backups/jukebox-$(date +%Y%m%d).db

# Backup comprimido
sqlite3 /var/lib/tsijukebox/jukebox.db ".backup '/var/lib/tsijukebox/backups/jukebox-$(date +%Y%m%d).db'"
gzip /var/lib/tsijukebox/backups/jukebox-$(date +%Y%m%d).db
```

### Restaurar Backup

```bash
# Parar container
cd /opt/tsijukebox && docker compose down

# Restaurar
cp /var/lib/tsijukebox/backups/jukebox-YYYYMMDD.db /var/lib/tsijukebox/jukebox.db

# Reiniciar
docker compose up -d
```

### Limpar Cache

```bash
# Limpar cache do Docker
docker system prune -a

# Limpar cache do Chromium
rm -rf /tmp/chromium-kiosk-cache/*
```

---

## 📊 Webhooks

Se configurado com `--webhook`, o sistema envia notificações para eventos:

| Evento | Descrição |
|--------|-----------|
| `watchdog_started` | Watchdog iniciou monitoramento |
| `chromium_restart` | Chromium foi reiniciado |
| `container_restart` | Container Docker foi reiniciado |
| `health_check_failed` | Falha no health check |

### Formato do Payload

```json
{
  "event": "chromium_restart",
  "timestamp": "2024-01-15T10:30:00-03:00",
  "hostname": "kiosk-01",
  "details": "Chromium reiniciado após 3 falhas"
}
```

---

## 📝 Notas

- O sistema reinicia automaticamente após a instalação
- O usuário `kiosk` não possui senha (autologin)
- Para acesso remoto, configure SSH antes da instalação
- O watchdog verifica o sistema a cada 30 segundos
- Backups automáticos podem ser configurados via cron

---

## 🆘 Suporte

- **GitHub Issues**: [github.com/B0yZ4kr14/TSiJUKEBOX/issues](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues)
- **Documentação**: [docs.tsijukebox.com](https://docs.tsijukebox.com)
- **Discord**: [discord.gg/tsijukebox](https://discord.gg/tsijukebox)

---

*Versão do Instalador: 2.0.0*
*Última atualização: Dezembro 2024*
