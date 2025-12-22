# 🐧 Instalação no CachyOS / Arch Linux

> Guia completo de instalação do TSiJUKEBOX em sistemas baseados em Arch Linux, com foco em CachyOS e configuração de ambiente Openbox para modo kiosk.

[![CachyOS](https://img.shields.io/badge/CachyOS-1793D1?style=flat-square&logo=arch-linux&logoColor=white)](https://cachyos.org)
[![Arch Linux](https://img.shields.io/badge/Arch_Linux-1793D1?style=flat-square&logo=arch-linux&logoColor=white)](https://archlinux.org)

---

## 📋 Índice

- [Requisitos do Sistema](#-requisitos-do-sistema)
- [Instalação Automatizada](#-instalação-automatizada)
- [Instalação Manual](#-instalação-manual)
- [Otimizações CachyOS](#-otimizações-cachyos)
- [Modo Kiosk com Openbox](#-modo-kiosk-com-openbox)
- [Solução de Problemas](#-solução-de-problemas)

---

## 💻 Requisitos do Sistema

### Requisitos Mínimos

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| **CPU** | 2 cores x86_64 | 4+ cores |
| **RAM** | 2 GB | 4+ GB |
| **Disco** | 10 GB | 20+ GB (SSD) |
| **Display** | 1280x720 | 1920x1080+ |
| **Rede** | 10 Mbps | 50+ Mbps |

### Sistemas Compatíveis

- ✅ **CachyOS** (recomendado)
- ✅ Arch Linux
- ✅ Manjaro
- ✅ EndeavourOS
- ✅ Garuda Linux
- ✅ Artix Linux

---

## 🚀 Instalação Automatizada

### Método 1: One-liner (Recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/docker-install.py | sudo python3
```

### Método 2: Download e Execução

```bash
# Baixar instalador
wget https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/docker-install.py

# Executar com opções
sudo python3 docker-install.py --monitoring --cache
```

### Opções de Instalação

| Flag | Descrição |
|------|-----------|
| `--port PORT` | Porta HTTP (padrão: 80) |
| `--monitoring` | Instalar Prometheus + Grafana |
| `--cache` | Habilitar Redis cache |
| `--ssl` | Habilitar SSL auto-assinado |
| `--ssl-letsencrypt` | SSL com Let's Encrypt |
| `--ssl-cloudflare` | SSL via Cloudflare DNS |
| `--domain DOMAIN` | Domínio para SSL |
| `--email EMAIL` | Email para Let's Encrypt |

### Exemplos de Uso

```bash
# Instalação completa com monitoramento
sudo python3 docker-install.py --monitoring --cache --port 8080

# Instalação com SSL Let's Encrypt
sudo python3 docker-install.py --ssl-letsencrypt --domain jukebox.exemplo.com --email admin@exemplo.com

# Instalação para kiosk (porta padrão)
sudo python3 docker-install.py --monitoring
```

---

## 🔧 Instalação Manual

### 1. Atualizar Sistema

```bash
# CachyOS / Arch
sudo pacman -Syu

# Instalar dependências base
sudo pacman -S --needed \
    base-devel \
    git \
    docker \
    docker-compose \
    nginx \
    python \
    python-pip
```

### 2. Configurar Docker

```bash
# Habilitar e iniciar Docker
sudo systemctl enable --now docker.service

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Relogar para aplicar (ou usar newgrp)
newgrp docker
```

### 3. Clonar Repositório

```bash
# Clonar TSiJUKEBOX
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
cd TSiJUKEBOX

# Instalar dependências Node.js
npm install

# Build para produção
npm run build
```

### 4. Deploy com Docker

```bash
# Criar diretório de configuração
sudo mkdir -p /opt/tsijukebox/docker

# Copiar arquivos
sudo cp -r dist/* /opt/tsijukebox/

# Iniciar container
docker-compose up -d
```

---

## ⚡ Otimizações CachyOS

### Scheduler BORE

CachyOS usa o scheduler BORE por padrão, otimizado para responsividade:

```bash
# Verificar scheduler atual
cat /sys/kernel/debug/sched/preempt

# Configurar prioridade para containers Docker
sudo docker run --cpuset-cpus="0-3" --cpu-shares=1024 ...
```

### Kernel Otimizado

```bash
# Verificar kernel CachyOS
uname -r
# Exemplo: 6.12.1-1-cachyos

# Parâmetros de boot recomendados para kiosk
# Em /etc/kernel/cmdline ou GRUB:
quiet splash mitigations=off nowatchdog
```

### Memória e Swap

```bash
# Ajustar swappiness para desktop
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.d/99-sysctl.conf

# Aplicar
sudo sysctl -p /etc/sysctl.d/99-sysctl.conf
```

### Cache de Pacotes

```bash
# Habilitar cache de pacotes para builds mais rápidos
sudo pacman -S ccache

# Configurar ccache para compilações
echo 'export PATH="/usr/lib/ccache/bin:$PATH"' >> ~/.bashrc
```

---

## 🖥️ Modo Kiosk com Openbox

### Instalar Openbox

```bash
# Instalar Openbox e dependências
sudo pacman -S --needed \
    openbox \
    obconf \
    xorg-server \
    xorg-xinit \
    picom \
    unclutter \
    chromium
```

### Configurar Autostart

Criar `~/.config/openbox/autostart`:

```bash
#!/bin/bash
# TSiJUKEBOX Kiosk Mode Autostart

# Desabilitar screensaver
xset s off
xset -dpms
xset s noblank

# Esconder cursor após 3 segundos
unclutter -idle 3 -root &

# Compositor para transparência
picom -b --config ~/.config/picom/picom.conf &

# Aguardar serviços
sleep 2

# Abrir TSiJUKEBOX em modo kiosk
chromium \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-translate \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-features=TranslateUI \
    --disk-cache-dir=/tmp/chromium-cache \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    http://localhost:80
```

Tornar executável:

```bash
chmod +x ~/.config/openbox/autostart
```

### Configurar rc.xml

Editar `~/.config/openbox/rc.xml` para desabilitar atalhos de teclado:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config>
  <keyboard>
    <!-- Desabilitar Alt+F4 -->
    <keybind key="A-F4">
      <!-- Vazio: sem ação -->
    </keybind>
    
    <!-- Desabilitar Alt+Tab -->
    <keybind key="A-Tab">
    </keybind>
    
    <!-- Manter apenas atalho de emergência -->
    <keybind key="C-A-Delete">
      <action name="Execute">
        <command>systemctl poweroff</command>
      </action>
    </keybind>
  </keyboard>
  
  <applications>
    <!-- Chromium sempre em fullscreen -->
    <application class="Chromium">
      <fullscreen>yes</fullscreen>
      <decor>no</decor>
    </application>
  </applications>
</openbox_config>
```

### Configurar Login Automático

Criar serviço systemd para auto-login. Em `/etc/systemd/system/getty@tty1.service.d/override.conf`:

```ini
[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin USUARIO --noclear %I $TERM
```

Substitua `USUARIO` pelo usuário do kiosk.

### Iniciar X Automaticamente

Adicionar ao `~/.bash_profile` ou `~/.zprofile`:

```bash
# Auto-start X no tty1
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx
fi
```

Criar `~/.xinitrc`:

```bash
#!/bin/bash
exec openbox-session
```

---

## 🐛 Solução de Problemas

### Docker não inicia

```bash
# Verificar status
systemctl status docker

# Ver logs
journalctl -u docker -f

# Reiniciar serviço
sudo systemctl restart docker
```

### Permissão negada no Docker

```bash
# Verificar grupos do usuário
groups $USER

# Adicionar ao grupo docker (se não estiver)
sudo usermod -aG docker $USER

# Aplicar sem logout
newgrp docker
```

### Container não acessível

```bash
# Verificar containers rodando
docker ps

# Ver logs do container
docker logs tsijukebox-app -f

# Testar conectividade
curl -I http://localhost:80
```

### Tela preta no Openbox

```bash
# Verificar logs Xorg
cat ~/.local/share/xorg/Xorg.0.log | grep "(EE)"

# Verificar driver de vídeo
lspci -k | grep -A 3 VGA
```

### Chromium não abre em kiosk

```bash
# Limpar cache e perfil
rm -rf ~/.config/chromium
rm -rf /tmp/chromium-cache

# Testar manualmente
chromium --kiosk http://localhost:80
```

---

## 📚 Próximos Passos

- [Configuração de Shell](Shell-Configuration.md) - fish, zsh, bash
- [Setup Openbox Detalhado](Openbox-Kiosk-Setup.md)
- [Referência de Dependências](Dependencies-Reference.md)
- [Troubleshooting Completo](../TROUBLESHOOTING.md)

---

*TSiJUKEBOX - Otimizado para CachyOS e Arch Linux*
