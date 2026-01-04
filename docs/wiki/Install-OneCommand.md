# ⚡ Instalação em Um Comando

> Instale o TSiJUKEBOX completo com um único comando no terminal.

---

## 🚀 O Comando Mágico

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3
```

**✅ Compatível com:**
- Arch Linux
- CachyOS
- Manjaro
- EndeavourOS
- Outras distros baseadas em Arch

---

## 🆕 Novidades v6.0.0

| Feature | Descrição |
|---------|-----------|
| 🔍 **Análise de Hardware** | Detecta CPU/RAM/GPU e sugere modo de instalação |
| 🔒 **SSL/HTTPS** | Certificados self-signed ou Let's Encrypt |
| 📡 **Avahi/mDNS** | Acesse via `midiaserver.local` sem configurar DNS |
| 🐙 **GitHub CLI** | `gh` instalado para gerenciamento Git |
| 💎 **Storj CLI** | Backup descentralizado completo |
| 🔐 **Autologin Inteligente** | Detecta SDDM/GDM/LightDM/Ly/greetd automaticamente |
| 📋 **26 Fases** | Instalação completa e modular |

---

## 🎮 Modos de Instalação

| Modo | Comando | Ideal Para |
|------|---------|------------|
| 🎵 **Completo** | `sudo python3 install.py` | Uso doméstico com tudo |
| 🖥️ **Kiosk** | `sudo python3 install.py --mode kiosk` | Bares, eventos, karaokês |
| 🖧 **Server** | `sudo python3 install.py --mode server` | Servidor headless |
| 🔧 **Minimal** | `sudo python3 install.py --mode minimal` | Apenas o essencial |

### Modo Completo (Padrão)
Instalação full com todas as features:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3
```

### Modo Kiosk
Otimizado para uso público em estabelecimentos:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3 - --mode kiosk
```

### Modo Server
Apenas backend, sem interface gráfica:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3 - --mode server
```

---

## 📦 O Que é Instalado (26 Fases)

| Fase | Componente | Descrição |
|------|------------|-----------|
| 0 | 🔍 **Hardware Analysis** | Detecta CPU, RAM, GPU, disco |
| 1 | ✓ **System Check** | Verifica distro e dependências |
| 2 | 🐳 **Docker** | Containerização da aplicação |
| 3 | 🔥 **UFW** | Firewall configurado |
| 4 | ⏰ **NTP** | Sincronização de tempo |
| 5 | 🔤 **Fontes** | Noto, DejaVu, Liberation |
| 6 | 🔊 **Áudio** | PipeWire/PulseAudio |
| 7 | 💾 **Database** | SQLite/MariaDB/Postgres |
| 8 | 🌐 **Nginx** | Proxy reverso com HTTPS |
| 9 | 📊 **Monitoramento** | Grafana + Prometheus |
| 10 | ☁️ **Cloud Backup** | rclone + Storj |
| 11 | 🎵 **Spotify** | Cliente Spotify oficial |
| 12 | 🎨 **Spicetify** | Customização de temas |
| 13 | 🎹 **Spotify CLI** | Controle via terminal |
| 14 | 🖥️ **Kiosk** | Chromium + Openbox |
| 15 | 🎤 **Voice Control** | Vosk + wake word |
| 16 | 🛠️ **Dev Tools** | Node.js, Python, etc. |
| 17 | 🔐 **Autologin** | Detecta login manager |
| 18 | 🚀 **Deploy** | Docker Compose |
| 19 | ⚙️ **Systemd** | Serviços e autostart |
| 20 | 🔒 **SSL Setup** | Self-signed ou Let's Encrypt |
| 21 | 📡 **Avahi/mDNS** | midiaserver.local |
| 22 | 🐙 **GitHub CLI** | gh instalado |
| 23 | 💎 **Storj CLI** | uplink configurado |
| 24 | 📋 **Hardware Report** | JSON com specs |
| 25 | ✅ **Verify** | Testes finais |

---

## 🔧 Opções Avançadas

### Instalação com Flags

```bash
# Instalação automática (sem prompts)
sudo python3 unified-installer.py --auto

# Instalação verbosa
sudo python3 unified-installer.py --verbose

# Especificar diretório de instalação
sudo python3 unified-installer.py --install-dir /opt/tsijukebox

# Pular instalação do Spotify
sudo python3 unified-installer.py --skip-spotify

# Pular instalação do Grafana/Prometheus
sudo python3 unified-installer.py --skip-monitoring
```

### Opções SSL (NOVO v6.0.0)

```bash
# Usar Let's Encrypt (produção)
sudo python3 unified-installer.py --ssl-mode letsencrypt --ssl-domain meusite.com --ssl-email admin@meusite.com

# Usar certificado self-signed (padrão)
sudo python3 unified-installer.py --ssl-mode self-signed

# Sem SSL
sudo python3 unified-installer.py --no-ssl
```

### Opções Avahi/mDNS (NOVO v6.0.0)

```bash
# Hostname customizado
sudo python3 unified-installer.py --avahi-hostname myjukebox

# Sem Avahi
sudo python3 unified-installer.py --no-avahi
```

### Variáveis de Ambiente

```bash
# Definir porta do servidor web
export TSIJUKEBOX_PORT=8080

# Definir usuário do sistema
export TSIJUKEBOX_USER=jukebox

# Executar instalação
sudo -E python3 unified-installer.py
```

---

## 📋 Pré-Requisitos

### Sistema
- Python 3.8+
- sudo / root access
- Conexão com internet

### Hardware Mínimo
| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Disco | 500 MB | 2+ GB |

---

## 🔍 Verificação Pós-Instalação

Após a instalação, verifique se tudo está funcionando:

```bash
# Verificar serviços
systemctl status tsijukebox
systemctl status nginx
systemctl status grafana-server
systemctl status avahi-daemon

# Verificar portas
ss -tlnp | grep -E '(80|443|3000|9090)'

# Verificar SSL
curl -k https://midiaserver.local

# Acessar interface web
xdg-open https://midiaserver.local
```

---

## 🌐 Acessando o Sistema

Após a instalação, o sistema estará disponível em:

| Interface | URL |
|-----------|-----|
| 🎵 **TSiJUKEBOX** | https://midiaserver.local |
| 📊 **Grafana** | https://midiaserver.local:3000 |
| 📈 **Prometheus** | https://midiaserver.local:9090 |
| 🔧 **SSH** | ssh user@midiaserver.local |

---

## 🐛 Troubleshooting

### Erro: "Python not found"
```bash
sudo pacman -S python
```

### Erro: "Permission denied"
```bash
sudo python3 unified-installer.py
```

### Erro: "Network unreachable"
```bash
ping -c 3 github.com
```

### Erro: "midiaserver.local não resolve"
```bash
# Verificar Avahi
systemctl status avahi-daemon

# Reiniciar
sudo systemctl restart avahi-daemon
```

### Erro: "Certificado SSL inválido"
```bash
# Para self-signed, adicione exceção no browser
# Ou regenere:
sudo tsijukebox --regenerate-ssl
```

### Logs de Instalação
```bash
cat /var/log/tsijukebox-install.log
```

---

## 📚 Próximos Passos

1. [Primeira Configuração](Tutorial-First-Setup.md)
2. [Integração Spotify](Tutorial-Spotify-Integration.md)
3. [Configurar Modo Kiosk](Tutorial-Kiosk-Mode.md)
4. [Referência Completa v6.0.0](Installer-v6-Reference.md)

---

## 🔗 Links Relacionados

- [Instalação CachyOS](Install-CachyOS.md)
- [Setup Openbox Kiosk](Openbox-Kiosk-Setup.md)
- [Deploy em Produção](../PRODUCTION-DEPLOY.md)
- [Referência de Dependências](Dependencies-Reference.md)

---

*TSiJUKEBOX v6.0.0 - Dedicated to the Public Domain*
