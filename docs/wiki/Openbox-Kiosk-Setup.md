# 🖥️ Setup Openbox Kiosk Mode

> Guia completo para configurar TSiJUKEBOX como sistema kiosk usando Openbox no CachyOS/Arch Linux.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Instalação de Pacotes](#-instalação-de-pacotes)
- [Configuração do Openbox](#-configuração-do-openbox)
- [Autostart do Sistema](#-autostart-do-sistema)
- [Segurança do Kiosk](#-segurança-do-kiosk)
- [Compositor Picom](#-compositor-picom)
- [Login Automático](#-login-automático)
- [Monitoramento](#-monitoramento)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O modo kiosk permite usar TSiJUKEBOX em:

- 🎵 **Bares e restaurantes** - Jukebox público
- 🎤 **Karaokês** - Interface de seleção de músicas
- 🏪 **Estabelecimentos comerciais** - Ambiente musical
- 🎪 **Eventos** - Controle de playlist

### Características do Modo Kiosk

- ✅ Tela cheia sem bordas
- ✅ Cursor oculto automaticamente
- ✅ Atalhos de teclado desabilitados
- ✅ Login automático
- ✅ Recuperação automática de falhas
- ✅ Proteção contra acesso não autorizado

---

## 📦 Instalação de Pacotes

```bash
# Atualizar sistema
sudo pacman -Syu

# Instalar Openbox e dependências
sudo pacman -S --needed \
    openbox \
    obconf \
    obmenu-generator \
    xorg-server \
    xorg-xinit \
    xorg-xset \
    xorg-xrandr \
    picom \
    unclutter \
    chromium \
    feh \
    xdotool \
    xclip

# Opcional: Ferramentas de debug
sudo pacman -S --needed \
    xterm \
    neofetch
```

---

## ⚙️ Configuração do Openbox

### Criar diretórios de configuração

```bash
mkdir -p ~/.config/openbox
mkdir -p ~/.config/picom
```

### rc.xml - Configuração Principal

Criar `~/.config/openbox/rc.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<openbox_config xmlns="http://openbox.org/3.4/rc"
                xmlns:xi="http://www.w3.org/2001/XInclude">

  <resistance>
    <strength>10</strength>
    <screen_edge_strength>20</screen_edge_strength>
  </resistance>

  <focus>
    <focusNew>yes</focusNew>
    <followMouse>no</followMouse>
    <focusLast>yes</focusLast>
    <underMouse>no</underMouse>
    <focusDelay>200</focusDelay>
    <raiseOnFocus>no</raiseOnFocus>
  </focus>

  <placement>
    <policy>Smart</policy>
    <center>yes</center>
    <monitor>Primary</monitor>
    <primaryMonitor>1</primaryMonitor>
  </placement>

  <theme>
    <name>Clearlooks</name>
    <titleLayout>NLIMC</titleLayout>
    <keepBorder>no</keepBorder>
    <animateIconify>no</animateIconify>
    <font place="ActiveWindow">
      <name>sans</name>
      <size>10</size>
    </font>
  </theme>

  <desktops>
    <number>1</number>
    <firstdesk>1</firstdesk>
    <popupTime>0</popupTime>
  </desktops>

  <!-- KEYBOARD BINDINGS - KIOSK MODE -->
  <keyboard>
    <!-- Desabilitar TODOS os atalhos padrão -->
    
    <!-- Manter APENAS atalho de emergência para admin -->
    <keybind key="C-A-Delete">
      <action name="Execute">
        <command>systemctl poweroff</command>
      </action>
    </keybind>
    
    <!-- Atalho secreto para terminal de manutenção -->
    <keybind key="C-A-S-t">
      <action name="Execute">
        <command>xterm -fs 14 -bg black -fg green</command>
      </action>
    </keybind>
    
    <!-- Atalho secreto para reiniciar kiosk -->
    <keybind key="C-A-S-r">
      <action name="Execute">
        <command>pkill chromium; ~/.config/openbox/autostart</command>
      </action>
    </keybind>
  </keyboard>

  <!-- MOUSE BINDINGS -->
  <mouse>
    <dragThreshold>1</dragThreshold>
    <doubleClickTime>500</doubleClickTime>
    <screenEdgeWarpTime>400</screenEdgeWarpTime>
    <screenEdgeWarpMouse>false</screenEdgeWarpMouse>
    
    <!-- Desabilitar context menu -->
    <context name="Root">
      <mousebind button="Right" action="Press">
        <!-- Sem ação -->
      </mousebind>
    </context>
  </mouse>

  <!-- APPLICATION RULES -->
  <applications>
    <!-- Chromium sempre fullscreen sem decoração -->
    <application class="Chromium" type="normal">
      <fullscreen>yes</fullscreen>
      <decor>no</decor>
      <shade>no</shade>
      <focus>yes</focus>
      <desktop>1</desktop>
      <layer>normal</layer>
      <maximized>true</maximized>
    </application>
    
    <!-- Chromium popups -->
    <application class="Chromium" type="dialog">
      <fullscreen>yes</fullscreen>
      <decor>no</decor>
    </application>
    
    <!-- Terminal de emergência -->
    <application class="XTerm">
      <decor>no</decor>
      <layer>above</layer>
    </application>
  </applications>

</openbox_config>
```

### Recarregar configuração

```bash
openbox --reconfigure
```

---

## 🚀 Autostart do Sistema

Criar `~/.config/openbox/autostart`:

```bash
#!/bin/bash
# ============================================
# TSiJUKEBOX Kiosk Mode - Autostart Script
# ============================================

# Log de inicialização
exec > >(tee -a ~/.kiosk.log) 2>&1
echo "=== Kiosk start: $(date) ==="

# ============================================
# 1. Configurações de Display
# ============================================

# Desabilitar screensaver e power management
xset s off
xset s noblank
xset -dpms

# Configurar resolução (ajustar conforme seu monitor)
# xrandr --output HDMI-1 --mode 1920x1080 --rate 60

# ============================================
# 2. Aparência
# ============================================

# Wallpaper preto (para transição suave)
feh --bg-fill /usr/share/backgrounds/black.png 2>/dev/null || \
    xsetroot -solid "#000000"

# Ocultar cursor após 2 segundos de inatividade
unclutter -idle 2 -root -noevents &

# Compositor para transparência e vsync
picom -b --config ~/.config/picom/picom.conf &

# ============================================
# 3. Aguardar Serviços
# ============================================

# Aguardar Docker iniciar
echo "Aguardando Docker..."
for i in {1..30}; do
    if docker info >/dev/null 2>&1; then
        echo "Docker pronto!"
        break
    fi
    sleep 1
done

# Aguardar TSiJUKEBOX responder
echo "Aguardando TSiJUKEBOX..."
for i in {1..60}; do
    if curl -s http://localhost:80/health >/dev/null 2>&1; then
        echo "TSiJUKEBOX pronto!"
        break
    fi
    sleep 1
done

# Delay adicional para garantir que tudo carregou
sleep 2

# ============================================
# 4. Iniciar Chromium em Modo Kiosk
# ============================================

# Limpar cache antigo
rm -rf ~/.config/chromium/Default/Cache/*
rm -rf /tmp/chromium-cache/*

# Iniciar Chromium com todas as flags de kiosk
chromium \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-translate \
    --disable-features=TranslateUI \
    --no-first-run \
    --fast \
    --fast-start \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --disable-session-crashed-bubble \
    --disable-component-update \
    --check-for-update-interval=31536000 \
    --disable-backgrounding-occluded-windows \
    --disable-breakpad \
    --disable-component-extensions-with-background-pages \
    --disable-default-apps \
    --disable-dev-shm-usage \
    --disable-extensions \
    --disable-hang-monitor \
    --disable-ipc-flooding-protection \
    --disable-popup-blocking \
    --disable-prompt-on-repost \
    --disable-renderer-backgrounding \
    --disable-sync \
    --disk-cache-dir=/tmp/chromium-cache \
    --disk-cache-size=104857600 \
    --enable-features=OverlayScrollbar \
    --force-device-scale-factor=1 \
    --metrics-recording-only \
    --no-default-browser-check \
    --password-store=basic \
    --use-mock-keychain \
    http://localhost:80 &

CHROMIUM_PID=$!
echo "Chromium iniciado (PID: $CHROMIUM_PID)"

# ============================================
# 5. Watchdog - Reiniciar se Chromium morrer
# ============================================

while true; do
    if ! kill -0 $CHROMIUM_PID 2>/dev/null; then
        echo "Chromium morreu! Reiniciando..."
        sleep 2
        exec $0  # Reinicia o script
    fi
    sleep 10
done
```

Tornar executável:

```bash
chmod +x ~/.config/openbox/autostart
```

---

## 🔒 Segurança do Kiosk

### Desabilitar terminais virtuais

```bash
# Em /etc/X11/xorg.conf.d/10-kiosk.conf
Section "ServerFlags"
    Option "DontVTSwitch" "true"
EndSection
```

### Bloquear Ctrl+Alt+Backspace

```bash
# Em /etc/X11/xorg.conf.d/10-kiosk.conf
Section "ServerFlags"
    Option "DontZap" "true"
EndSection
```

### Criar usuário dedicado para kiosk

```bash
# Criar usuário sem senha
sudo useradd -m -s /bin/bash kiosk

# Copiar configurações
sudo cp -r ~/.config/openbox /home/kiosk/.config/
sudo cp ~/.xinitrc /home/kiosk/
sudo cp ~/.bash_profile /home/kiosk/
sudo chown -R kiosk:kiosk /home/kiosk
```

---

## 🎨 Compositor Picom

Criar `~/.config/picom/picom.conf`:

```ini
# ============================================
# Picom Configuration for Kiosk Mode
# ============================================

# Backend
backend = "glx";
glx-no-stencil = true;
glx-copy-from-front = false;

# Shadows (desabilitado para kiosk)
shadow = false;

# Fading
fading = true;
fade-in-step = 0.05;
fade-out-step = 0.05;
fade-delta = 5;

# Opacity
inactive-opacity = 1.0;
active-opacity = 1.0;
frame-opacity = 1.0;

# VSync
vsync = true;

# Window type settings
wintypes:
{
  tooltip = { fade = true; shadow = false; opacity = 0.9; };
  dock = { shadow = false; };
  dnd = { shadow = false; };
  popup_menu = { opacity = 1.0; };
  dropdown_menu = { opacity = 1.0; };
};

# Focus
mark-wmwin-focused = true;
mark-ovredir-focused = true;
detect-rounded-corners = true;
detect-client-opacity = true;

# Performance
unredir-if-possible = true;
detect-transient = true;
detect-client-leader = true;
```

---

## 🔐 Login Automático

### Método 1: Getty Override (Recomendado)

```bash
# Criar override para getty
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d/

# Criar arquivo de override
sudo tee /etc/systemd/system/getty@tty1.service.d/override.conf << 'EOF'
[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin kiosk --noclear %I $TERM
EOF

# Recarregar systemd
sudo systemctl daemon-reload
```

### Método 2: SDDM Autologin

```bash
# Instalar SDDM
sudo pacman -S sddm

# Configurar autologin
sudo tee /etc/sddm.conf.d/autologin.conf << 'EOF'
[Autologin]
User=kiosk
Session=openbox
EOF

# Habilitar SDDM
sudo systemctl enable sddm
```

### Configurar .xinitrc

Criar `~/.xinitrc`:

```bash
#!/bin/bash
exec openbox-session
```

### Configurar .bash_profile

Adicionar ao `~/.bash_profile`:

```bash
# Auto-start X no TTY1
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then
    exec startx -- -nocursor
fi
```

---

## 📊 Monitoramento

### Script de Status

Criar `/opt/tsijukebox/scripts/kiosk-status.sh`:

```bash
#!/bin/bash
echo "=== TSiJUKEBOX Kiosk Status ==="
echo ""
echo "System:"
echo "  Uptime: $(uptime -p)"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
echo "  Disk:   $(df -h / | awk 'NR==2 {print $3 "/" $2}')"
echo ""
echo "Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Chromium:"
pgrep -a chromium | head -1
echo ""
echo "Display:"
echo "  DISPLAY=$DISPLAY"
xrandr 2>/dev/null | grep " connected"
```

### Systemd Service para Watchdog

Criar `/etc/systemd/system/kiosk-watchdog.service`:

```ini
[Unit]
Description=TSiJUKEBOX Kiosk Watchdog
After=docker.service

[Service]
Type=simple
User=kiosk
ExecStart=/opt/tsijukebox/scripts/kiosk-watchdog.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

---

## 🐛 Troubleshooting

### Chromium não inicia

```bash
# Verificar logs
tail -f ~/.kiosk.log

# Testar Chromium manualmente
chromium --kiosk http://localhost:80

# Verificar permissões
ls -la ~/.config/chromium/
```

### Tela preta

```bash
# Verificar Xorg
cat ~/.local/share/xorg/Xorg.0.log | grep "(EE)"

# Verificar driver de vídeo
lspci -k | grep -A 3 VGA
```

### Cursor não some

```bash
# Verificar se unclutter está rodando
pgrep unclutter

# Reiniciar unclutter
killall unclutter
unclutter -idle 2 -root &
```

### Container não responde

```bash
# Verificar container
docker ps -a

# Ver logs
docker logs tsijukebox-app

# Reiniciar
docker-compose restart
```

---

## 📚 Próximos Passos

- [Instalação CachyOS](Install-CachyOS.md)
- [Configuração de Shell](Shell-Configuration.md)
- [Referência de Dependências](Dependencies-Reference.md)

---

*TSiJUKEBOX - Modo Kiosk Profissional*
