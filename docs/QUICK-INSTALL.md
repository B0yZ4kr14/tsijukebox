<div align="center">

# ⚡ TSiJUKEBOX - Instalação Super Rápida

**Guia de instalação amigável para iniciantes**

![Version](https://img.shields.io/badge/version-6.0.0-blue?style=flat-square)
![Arch Linux](https://img.shields.io/badge/Arch_Linux-1793D1?style=flat-square&logo=arch-linux&logoColor=white)
![CachyOS](https://img.shields.io/badge/CachyOS-00ADD8?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---

## 🎯 Um Comando, Tudo Pronto!

Abra o terminal e cole este comando:

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3
```

**Pronto!** O instalador unificado v6.0.0 fará todo o trabalho automaticamente, incluindo:

### ✅ Novidades v6.0.0
- 🔍 **Análise de Hardware** - Detecta CPU, RAM, GPU automaticamente
- 🔒 **SSL/HTTPS** - Certificados self-signed ou Let's Encrypt
- 📡 **Avahi/mDNS** - Acesse via `midiaserver.local`
- 🐙 **GitHub CLI** - `gh` instalado e configurado
- 💎 **Storj CLI** - Backup descentralizado completo
- 🔐 **Autologin Inteligente** - Detecta SDDM/GDM/LightDM automaticamente

### ✅ Componentes Base
- 🐳 Docker + Docker Compose
- 🔥 UFW Firewall configurado
- ⏰ NTP (sincronização de tempo)
- 🌐 Nginx (proxy reverso com HTTPS)
- 📊 Grafana + Prometheus (monitoramento)
- 🎵 Spotify + Spicetify (player customizado)
- 🎹 spotify-cli-linux (controle via terminal)
- ⚙️ Serviços systemd

---

## 📊 O Que Você Vai Ver

Durante a instalação, o progresso é exibido em tempo real:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚀 TSiJUKEBOX Enterprise - Unified Installer v6.0.0                          ║
║  Instalador unificado com 26 fases de instalação                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

[0/26] Analisando hardware...
✓  CPU: AMD Ryzen 7 5800X (16 threads)
✓  RAM: 32 GB
✓  GPU: NVIDIA RTX 3080
✓  Disco: 500 GB NVMe
✓  Recomendação: Modo full com todas as features

[1/26] Verificando sistema...
✓  Usuário: joao
✓  Distro: CachyOS Linux (cachyos)
✓  AUR helper: paru
✓  Login manager: sddm

[2/26] Configurando Docker...
✓  Docker configurado

...

[20/26] Configurando SSL...
✓  Certificado self-signed gerado para midiaserver.local

[21/26] Configurando Avahi/mDNS...
✓  Hostname: midiaserver.local
✓  Serviços: HTTP, Grafana, Prometheus, SSH

[22/26] Instalando GitHub CLI...
✓  gh instalado

[23/26] Instalando Storj CLI...
✓  uplink configurado

[24/26] Gerando relatório de hardware...
✓  Relatório salvo em /var/log/tsijukebox/hardware.json

[25/26] Verificando instalação...
✓  Todos os serviços: OK

╔══════════════════════════════════════════════════════════════════════════════╗
║  🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!                                        ║
║  Acesse: https://midiaserver.local                                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🎮 Modos de Instalação

Escolha o modo que melhor se adapta ao seu uso:

### 🎵 Modo Completo (Padrão)
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3
```
**Ideal para:** Uso doméstico com todas as funcionalidades

**Inclui:** Docker, UFW, NTP, Nginx, SSL, Avahi, Grafana, Prometheus, Spotify, Spicetify, GitHub CLI, Storj, Autologin

---

### 🖥️ Modo Kiosk
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3 - --mode kiosk
```
**Ideal para:** Bares, eventos, festas, karaokês

**Características:**
- ✅ Interface touchscreen otimizada
- ✅ Proteção contra saída do app
- ✅ Reinício automático em caso de falha
- ✅ Login automático no boot (Chromium --kiosk)
- ✅ HTTPS via `https://midiaserver.local/jukebox`

---

### 🖧 Modo Server
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3 - --mode server --no-spotify
```
**Ideal para:** Servidores headless, streaming remoto

**Características:**
- ✅ Sem interface gráfica
- ✅ API REST disponível
- ✅ Baixo consumo de recursos
- ✅ Controle via app mobile/web

---

### 🔧 Modo Minimal
```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3 - --mode minimal --no-monitoring --no-spotify
```
**Ideal para:** Instalação mínima apenas com o essencial

---

## 📋 Todas as Opções Disponíveis

### Opções Principais

| Flag | Descrição | Valor Padrão |
|------|-----------|--------------|
| `--mode` | Modo: `full`, `kiosk`, `server`, `minimal` | `full` |
| `--user` | Usuário do sistema para o serviço | Usuário atual |
| `--timezone` | Timezone do sistema | `America/Sao_Paulo` |
| `--auto`, `-y` | Instalação automática sem confirmações | (interativo) |
| `--dry-run` | Simular instalação sem executar | - |
| `--verbose`, `-v` | Output detalhado | - |
| `--quiet`, `-q` | Modo silencioso | - |

### Opções SSL (NOVO v6.0.0)

| Flag | Descrição | Valor Padrão |
|------|-----------|--------------|
| `--ssl-mode` | Modo: `self-signed` ou `letsencrypt` | `self-signed` |
| `--ssl-domain` | Domínio para certificado | `midiaserver.local` |
| `--ssl-email` | Email para Let's Encrypt | - |
| `--no-ssl` | Não configurar SSL | (configura) |

### Opções Avahi/mDNS (NOVO v6.0.0)

| Flag | Descrição | Valor Padrão |
|------|-----------|--------------|
| `--avahi-hostname` | Hostname mDNS | `midiaserver` |
| `--no-avahi` | Não configurar Avahi | (configura) |

### Opções DevTools (NOVO v6.0.0)

| Flag | Descrição | Valor Padrão |
|------|-----------|--------------|
| `--no-github-cli` | Não instalar GitHub CLI | (instala) |
| `--no-storj` | Não instalar Storj CLI | (instala) |

### Componentes (usar `--no-COMPONENTE` para desativar)

| Flag | Descrição | Padrão |
|------|-----------|--------|
| `--no-docker` | Não instalar Docker | (instala) |
| `--no-ufw` | Não configurar UFW firewall | (configura) |
| `--no-ntp` | Não configurar sincronização de tempo | (configura) |
| `--no-nginx` | Não instalar Nginx | (instala) |
| `--no-monitoring` | Não instalar Grafana/Prometheus | (instala) |
| `--no-spotify` | Não instalar Spotify | (instala) |
| `--no-spicetify` | Não instalar Spicetify | (instala) |
| `--no-spotify-cli` | Não instalar spotify-cli-linux | (instala) |
| `--no-autologin` | Não configurar autologin | (configura) |

---

## 🔧 Exemplos de Uso

### Instalação Personalizada
```bash
# Modo kiosk com Let's Encrypt
curl -fsSL .../unified-installer.py | sudo python3 - \
  --mode kiosk \
  --ssl-mode letsencrypt \
  --ssl-domain meudominio.com \
  --ssl-email admin@meudominio.com
```

### Instalação Mínima
```bash
# Apenas Docker + App, sem extras
curl -fsSL .../unified-installer.py | sudo python3 - \
  --no-spotify \
  --no-monitoring \
  --no-autologin \
  --no-ssl
```

### Simular Instalação
```bash
# Ver o que seria feito sem executar
curl -fsSL .../unified-installer.py | sudo python3 - --dry-run --verbose
```

### Instalação Totalmente Automática
```bash
# Sem confirmações, usar todos os padrões
curl -fsSL .../unified-installer.py | sudo python3 - --auto
```

### Hostname Customizado
```bash
# Usar hostname diferente
curl -fsSL .../unified-installer.py | sudo python3 - \
  --avahi-hostname myjukebox
```

---

## 📦 O Que é Instalado

### Componentes Principais

| Componente | Descrição | Espaço |
|------------|-----------|--------|
| 🐳 **Docker** | Containerização da aplicação | ~500MB |
| 🔥 **UFW** | Firewall com regras pré-configuradas | ~5MB |
| ⏰ **NTP** | Sincronização de tempo via timesyncd/chrony | ~2MB |
| 🌐 **Nginx** | Proxy reverso com HTTPS | ~10MB |
| 🔒 **SSL** | Certificados self-signed ou Let's Encrypt | ~1MB |
| 📡 **Avahi** | mDNS para midiaserver.local | ~5MB |
| 🎵 **Spotify + Spicetify** | Player com temas customizados | ~500MB |
| 🎹 **spotify-cli-linux** | Controle do Spotify via terminal | ~5MB |
| 📊 **Grafana** | Dashboards de monitoramento | ~200MB |
| 📈 **Prometheus** | Coleta de métricas | ~100MB |
| 🐙 **GitHub CLI** | Gerenciamento Git | ~50MB |
| 💎 **Storj CLI** | Backup descentralizado | ~30MB |

### Regras UFW Configuradas

| Porta | Serviço | Acesso |
|-------|---------|--------|
| 22 | SSH | Qualquer |
| 80 | HTTP (redirect) | Qualquer |
| 443 | HTTPS | Qualquer |
| 5173 | TSiJUKEBOX | Qualquer |
| 3000 | Grafana | Qualquer |
| 5353/udp | mDNS | Qualquer |
| 9090 | Prometheus | Local |
| 9100 | Node Exporter | Local |

### Aliases spotify-cli

Após a instalação, você terá estes comandos disponíveis:

```bash
sp-play     # Iniciar reprodução
sp-pause    # Pausar
sp-next     # Próxima música
sp-prev     # Música anterior
sp-status   # Status atual
sp-song     # Nome da música atual
sp-artist   # Nome do artista
sp-album    # Nome do álbum
sp-lyrics   # Letras da música
sp-art      # URL da arte do álbum
```

---

## ✅ Verificação Pós-Instalação

Após a instalação, execute este comando para verificar se tudo está funcionando:

```bash
# Script de verificação automática
tsijukebox --verify

# Ou verificar manualmente:
systemctl status tsijukebox docker nginx grafana prometheus avahi-daemon
```

### Saída Esperada:
```
✅ TSiJUKEBOX v6.0.0 - Verificação de Instalação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker: ativo
✅ Nginx: ativo
✅ SSL: válido (midiaserver.local)
✅ Avahi: ativo
✅ Grafana: ativo
✅ Prometheus: ativo
✅ UFW: ativo (8 regras)
✅ NTP: sincronizado
✅ Spotify: instalado
✅ Spicetify: aplicado
✅ GitHub CLI: instalado
✅ Storj CLI: instalado
✅ Interface web: https://midiaserver.local

🎉 Instalação verificada com sucesso!
```

---

## 🔍 Acessando a Interface

Após a instalação:

| Interface | URL | Porta |
|-----------|-----|-------|
| 🎵 **Player Principal** | https://midiaserver.local | 443 |
| 📊 **Grafana** | https://midiaserver.local:3000 | 3000 |
| 📈 **Prometheus** | https://midiaserver.local:9090 | 9090 |
| 🔧 **SSH** | ssh user@midiaserver.local | 22 |

**Credenciais padrão:**
- **Grafana:** admin / admin (alterar no primeiro login)
- **TSiJUKEBOX:** admin / admin

---

## 🆘 Problemas Comuns

### "Comando não encontrado: python3"
```bash
# Instalar Python
sudo pacman -S python
```

### "Permissão negada"
```bash
# Executar com sudo
curl ... | sudo python3
```

### "Docker não inicia"
```bash
# Verificar logs
journalctl -u docker -f

# Reiniciar serviço
sudo systemctl restart docker
```

### "Certificado SSL inválido no browser"
```bash
# Para certificados self-signed, adicione exceção no browser
# Ou regenere o certificado:
sudo tsijukebox --regenerate-ssl
```

### "midiaserver.local não resolve"
```bash
# Verificar Avahi
systemctl status avahi-daemon

# Reiniciar serviço
sudo systemctl restart avahi-daemon
```

### "UFW bloqueando conexões"
```bash
# Verificar regras
sudo ufw status numbered

# Adicionar regra temporária
sudo ufw allow 8080/tcp
```

### "Erro de conexão com Spotify"
```bash
# Reconfigurar autenticação
tsijukebox --spotify-auth
```

### "Serviço não inicia"
```bash
# Ver logs detalhados
journalctl -u tsijukebox -f
```

---

## 🔄 Desinstalação

Para remover completamente:

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/unified-installer.py | sudo python3 - --uninstall
```

Ou manualmente:
```bash
# Parar serviços
sudo systemctl stop tsijukebox grafana prometheus nginx avahi-daemon

# Remover containers Docker
sudo docker-compose -f /opt/tsijukebox/docker-compose.yml down

# Remover pacotes
sudo pacman -Rns spotify spicetify-cli grafana prometheus avahi github-cli

# Remover dados
sudo rm -rf /opt/tsijukebox /etc/tsijukebox /var/lib/tsijukebox /var/log/tsijukebox
```

---

## 📚 Próximos Passos

- 📖 [Guia de Configuração](CONFIGURATION.md)
- 🏭 [Deploy em Produção](PRODUCTION-DEPLOY.md)
- 🔧 [Troubleshooting](TROUBLESHOOTING.md)
- 🎨 [Customização de Temas](THEMES.md)
- 📊 [Monitoramento Avançado](MONITORING.md)
- 🔌 [Sistema de Plugins](PLUGINS.md)
- 📋 [Referência Completa v6.0.0](wiki/Installer-v6-Reference.md)

---

<div align="center">

**Precisa de ajuda?** 

[🐛 Reportar Bug](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues) • 
[💬 Discord](https://discord.gg/tsijukebox) • 
[📧 Contato](mailto:support@tsijukebox.com)

---

*TSiJUKEBOX Enterprise v6.0.0 — A música, amplificada.* 🎵

</div>
