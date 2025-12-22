<div align="center">

# ⚡ TSiJUKEBOX - Instalação Super Rápida

**Guia de instalação amigável para iniciantes**

![Version](https://img.shields.io/badge/version-5.0.0-blue?style=flat-square)
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

**Pronto!** O instalador unificado fará todo o trabalho automaticamente, incluindo:

- ✅ Docker + Docker Compose
- ✅ UFW Firewall configurado
- ✅ NTP (sincronização de tempo)
- ✅ Nginx (proxy reverso)
- ✅ Grafana + Prometheus (monitoramento)
- ✅ Spotify + Spicetify (player customizado)
- ✅ spotify-cli-linux (controle via terminal)
- ✅ Autologin configurado
- ✅ Serviços systemd

---

## 📊 O Que Você Vai Ver

Durante a instalação, o progresso é exibido em tempo real:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  🚀 TSiJUKEBOX Enterprise - Unified Installer v5.0.0                          ║
║  Instalador unificado com Docker + todas as integrações                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

[1/13] Verificando sistema...
✓  Usuário: joao
✓  Distro: CachyOS Linux (cachyos)
✓  AUR helper: paru
✓  RAM: 16.0 GB
✓  Disco livre: 120.5 GB
✓  Login manager: sddm

[2/13] Configurando Docker...
✓  Docker configurado

[3/13] Configurando firewall UFW...
✓  UFW configurado (deny incoming, allow outgoing)
✓  Regras: SSH, HTTP, HTTPS, TSiJUKEBOX, Grafana

[4/13] Configurando sincronização de tempo...
✓  NTP configurado via systemd-timesyncd

[5/13] Configurando Nginx...
✓  Nginx configurado como proxy reverso

[6/13] Configurando Grafana + Prometheus...
✓  Monitoramento configurado

[7/13] Instalando Spotify...
✓  Spotify instalado via spotify-launcher

[8/13] Configurando Spicetify...
✓  Spicetify configurado com tema Dribbblish

[9/13] Instalando spotify-cli-linux...
✓  spotify-cli instalado (sp-play, sp-next, sp-pause...)

[10/13] Configurando autologin...
✓  Autologin configurado via SDDM

[11/13] Fazendo deploy da aplicação...
✓  Aplicação deployada via Docker

[12/13] Criando serviços systemd...
✓  Serviço tsijukebox habilitado

[13/13] Verificando instalação...
✓  Docker: OK
✓  Nginx: ativo
✓  Grafana: ativo
✓  Prometheus: ativo

╔══════════════════════════════════════════════════════════════════════════════╗
║  🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!                                        ║
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

**Inclui:** Docker, UFW, NTP, Nginx, Grafana, Prometheus, Spotify, Spicetify, spotify-cli, Autologin

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
- ✅ Login automático no boot

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
# Modo kiosk com timezone específico
curl -fsSL .../unified-installer.py | sudo python3 - \
  --mode kiosk \
  --timezone America/New_York
```

### Instalação Mínima
```bash
# Apenas Docker + App, sem extras
curl -fsSL .../unified-installer.py | sudo python3 - \
  --no-spotify \
  --no-monitoring \
  --no-autologin
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

---

## 📦 O Que é Instalado

### Componentes Principais

| Componente | Descrição | Espaço |
|------------|-----------|--------|
| 🐳 **Docker** | Containerização da aplicação | ~500MB |
| 🔥 **UFW** | Firewall com regras pré-configuradas | ~5MB |
| ⏰ **NTP** | Sincronização de tempo via timesyncd/chrony | ~2MB |
| 🌐 **Nginx** | Proxy reverso e servidor web | ~10MB |
| 🎵 **Spotify + Spicetify** | Player com temas customizados | ~500MB |
| 🎹 **spotify-cli-linux** | Controle do Spotify via terminal | ~5MB |
| 📊 **Grafana** | Dashboards de monitoramento | ~200MB |
| 📈 **Prometheus** | Coleta de métricas | ~100MB |

### Regras UFW Configuradas

| Porta | Serviço | Acesso |
|-------|---------|--------|
| 22 | SSH | Qualquer |
| 80 | HTTP | Qualquer |
| 443 | HTTPS | Qualquer |
| 5173 | TSiJUKEBOX | Qualquer |
| 3000 | Grafana | Qualquer |
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
systemctl status tsijukebox docker nginx grafana prometheus
```

### Saída Esperada:
```
✅ TSiJUKEBOX v5.0.0 - Verificação de Instalação
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Docker: ativo
✅ Nginx: ativo
✅ Grafana: ativo
✅ Prometheus: ativo
✅ UFW: ativo (6 regras)
✅ NTP: sincronizado
✅ Spotify: instalado
✅ Spicetify: aplicado
✅ Interface web: http://localhost:5173

🎉 Instalação verificada com sucesso!
```

---

## 🔍 Acessando a Interface

Após a instalação:

| Interface | URL | Porta |
|-----------|-----|-------|
| 🎵 **Player Principal** | http://localhost:5173 | 5173 |
| 📊 **Grafana** | http://localhost:3000 | 3000 |
| 📈 **Prometheus** | http://localhost:9090 | 9090 |

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
sudo systemctl stop tsijukebox grafana prometheus nginx

# Remover containers Docker
sudo docker-compose -f /opt/tsijukebox/docker-compose.yml down

# Remover pacotes
sudo pacman -Rns spotify spicetify-cli grafana prometheus

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

---

<div align="center">

**Precisa de ajuda?** 

[🐛 Reportar Bug](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues) • 
[💬 Discord](https://discord.gg/tsijukebox) • 
[📧 Contato](mailto:support@tsijukebox.com)

---

*TSiJUKEBOX Enterprise v5.0.0 — A música, amplificada.* 🎵

</div>
