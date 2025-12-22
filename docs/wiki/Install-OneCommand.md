# ⚡ Instalação em Um Comando

> Instale o TSiJUKEBOX completo com um único comando no terminal.

---

## 🚀 O Comando Mágico

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

**✅ Compatível com:**
- Arch Linux
- CachyOS
- Manjaro
- EndeavourOS
- Outras distros baseadas em Arch

---

## 🎮 Modos de Instalação

| Modo | Comando | Ideal Para |
|------|---------|------------|
| 🎵 **Completo** | `sudo python3 install.py` | Uso doméstico com tudo |
| 🖥️ **Kiosk** | `sudo python3 install.py --mode kiosk` | Bares, eventos, karaokês |
| 🖧 **Server** | `sudo python3 install.py --mode server` | Servidor headless |

### Modo Completo (Padrão)
Instalação full com todas as features:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

### Modo Kiosk
Otimizado para uso público em estabelecimentos:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3 - --mode kiosk
```

### Modo Server
Apenas backend, sem interface gráfica:
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3 - --mode server
```

---

## 📦 O Que é Instalado

| Componente | Descrição |
|------------|-----------|
| 🎵 **Spotify** | Cliente Spotify oficial |
| 🎨 **Spicetify** | Customização de temas |
| 📊 **Grafana** | Dashboards de monitoramento |
| 📈 **Prometheus** | Coleta de métricas |
| 🌐 **Nginx** | Servidor web e proxy reverso |
| 💾 **SQLite** | Banco de dados local |
| ⚙️ **Systemd Services** | Autostart e gerenciamento |

---

## 🔧 Opções Avançadas

### Instalação com Flags

```bash
# Instalação automática (sem prompts)
sudo python3 install.py --auto

# Instalação verbosa
sudo python3 install.py --verbose

# Especificar diretório de instalação
sudo python3 install.py --install-dir /opt/tsijukebox

# Pular instalação do Spotify
sudo python3 install.py --skip-spotify

# Pular instalação do Grafana/Prometheus
sudo python3 install.py --skip-monitoring
```

### Variáveis de Ambiente

```bash
# Definir porta do servidor web
export TSIJUKEBOX_PORT=8080

# Definir usuário do sistema
export TSIJUKEBOX_USER=jukebox

# Executar instalação
sudo -E python3 install.py
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

# Verificar portas
ss -tlnp | grep -E '(80|3000|9090)'

# Acessar interface web
xdg-open http://localhost:5173
```

---

## 🐛 Troubleshooting

### Erro: "Python not found"
```bash
sudo pacman -S python
```

### Erro: "Permission denied"
```bash
sudo python3 install.py
```

### Erro: "Network unreachable"
```bash
ping -c 3 github.com
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

---

## 🔗 Links Relacionados

- [Instalação CachyOS](Install-CachyOS.md)
- [Setup Openbox Kiosk](Openbox-Kiosk-Setup.md)
- [Deploy em Produção](../PRODUCTION-DEPLOY.md)
- [Referência de Dependências](Dependencies-Reference.md)

---

*TSiJUKEBOX v4.2.0 - Dedicated to the Public Domain*
