# TSiJUKEBOX - Documentação de Implantação do Sistema

> Guia técnico completo para implantação do TSiJUKEBOX em sistemas CachyOS/Arch Linux com ambiente Openbox Kiosk.

**Versão:** 4.1.0  
**Última atualização:** Dezembro 2025  
**Autor:** TSiJUKEBOX Team

---

## 📑 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Requisitos de Hardware](#2-requisitos-de-hardware)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Inventário do Frontend](#4-inventário-do-frontend)
5. [Instalação Automática](#5-instalação-automática)
6. [Configuração do Kiosk Openbox](#6-configuração-do-kiosk-openbox)
7. [Integração Spicetify](#7-integração-spicetify)
8. [YouTube Music Bridge](#8-youtube-music-bridge)
9. [Sistema Always-On 24/7](#9-sistema-always-on-247)
10. [Descoberta de Rede (mDNS/Avahi)](#10-descoberta-de-rede-mdnsavahi)
11. [Normalização de Volume](#11-normalização-de-volume)
12. [Dashboard de Estatísticas](#12-dashboard-de-estatísticas)
13. [Monitoramento e Observabilidade](#13-monitoramento-e-observabilidade)
14. [Backup e Recuperação](#14-backup-e-recuperação)
15. [Troubleshooting](#15-troubleshooting)
16. [FAQ](#16-faq)

---

## 1. Visão Geral do Sistema

### O que é o TSiJUKEBOX?

O TSiJUKEBOX é um sistema de jukebox digital enterprise projetado para operar 24/7 em ambientes comerciais como bares, restaurantes, academias e espaços de eventos. Ele oferece:

- **Interface Kiosk Touch-Friendly**: Design responsivo otimizado para telas touch
- **Integração Multi-Provider**: Spotify, YouTube Music e biblioteca local
- **Controle Remoto via QR Code**: Clientes podem controlar a música pelo celular
- **Estatísticas em Tempo Real**: Dashboard com músicas mais tocadas e horários de pico
- **Operação 24/7**: Sistema configurado para nunca hibernar ou desligar tela

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  React 18.3 + TypeScript + Vite + TailwindCSS + Framer Motion   │
│  Shadcn/ui + React Query + React Router + Recharts              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (Lovable Cloud) - PostgreSQL + Auth + Storage + Edge  │
│  Edge Functions (Deno) - Lyrics, Spotify Auth, GitHub, Stats    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SISTEMA OPERACIONAL                          │
├─────────────────────────────────────────────────────────────────┤
│  CachyOS / Arch Linux + Openbox (Kiosk Mode)                    │
│  Spotify + Spicetify + python-ytmusicapi                        │
│  Docker + Nginx + Avahi + Prometheus + Grafana                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Requisitos de Hardware

### Mínimo

| Componente | Especificação |
|------------|---------------|
| CPU | Intel Core i3 / AMD Ryzen 3 ou equivalente |
| RAM | 4 GB DDR4 |
| Armazenamento | 64 GB SSD |
| Rede | Ethernet 100 Mbps ou WiFi 802.11n |
| Tela | 1280x720 (HD) |

### Recomendado

| Componente | Especificação |
|------------|---------------|
| CPU | Intel Core i5 / AMD Ryzen 5 ou superior |
| RAM | 8 GB DDR4 |
| Armazenamento | 256 GB NVMe SSD |
| Rede | Ethernet Gigabit |
| Tela | 1920x1080 (Full HD) Touch |
| Áudio | Placa de som dedicada ou DAC USB |

### Para Operação 24/7

- **Fonte de alimentação redundante** (recomendado)
- **Sistema de refrigeração adequado** (ventilação passiva preferível)
- **No-break (UPS)** para proteção contra quedas de energia
- **SSD de alta durabilidade** (TBW elevado)

---

## 3. Arquitetura do Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CachyOS Linux                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │    Openbox      │  │     Spotify     │  │   YouTube Music Bridge  │  │
│  │  (Window Mgr)   │  │   + Spicetify   │  │   (python-ytmusicapi)   │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘  │
│           │                    │                        │                │
│           ▼                    ▼                        ▼                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Xorg (Servidor X11)                          │   │
│  │                     - DPMS Desabilitado                           │   │
│  │                     - Screensaver Desabilitado                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │     Nginx       │  │     Docker      │  │        Avahi            │  │
│  │  (Proxy Reverso)│  │  (TSiJUKEBOX)   │  │   (mDNS Discovery)      │  │
│  │  Port 80/443    │  │   Port 8080     │  │   tsijukebox.local      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │   Prometheus    │  │     Grafana     │  │         UFW             │  │
│  │  (Métricas)     │  │  (Dashboards)   │  │      (Firewall)         │  │
│  │   Port 9090     │  │   Port 3000     │  │                         │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Fluxo de Boot

```
systemd
   │
   ├─► getty@tty1.service (autologin: tsi)
   │      │
   │      └─► ~/.bash_profile
   │             │
   │             └─► startx
   │                    │
   │                    └─► ~/.xinitrc
   │                           │
   │                           ├─► xset -dpms (desabilita DPMS)
   │                           ├─► xset s off (desabilita screensaver)
   │                           ├─► unclutter (esconde cursor)
   │                           │
   │                           └─► exec openbox-session
   │                                  │
   │                                  └─► ~/.config/openbox/autostart
   │                                         │
   │                                         └─► spotify (fullscreen)
   │
   ├─► tsijukebox.service (Docker container)
   │
   ├─► ytmusic-bridge.service (YouTube Music)
   │
   ├─► nginx.service (Proxy reverso)
   │
   ├─► avahi-daemon.service (mDNS)
   │
   ├─► prometheus.service (Métricas)
   │
   └─► grafana.service (Dashboards)
```

---

## 4. Inventário do Frontend

### Páginas Principais

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| Player Principal | `src/pages/Index.tsx` | Interface do player com controles, letras, fila |
| Configurações | `src/pages/Settings.tsx` | Painel de configurações do sistema |
| Dashboard Admin | `src/pages/Dashboard.tsx` | Visão geral para administradores |
| Estatísticas | `src/pages/JukeboxStatsDashboard.tsx` | Músicas mais tocadas, horários de pico |
| Navegador Spotify | `src/pages/SpotifyBrowser.tsx` | Browse de playlists e álbuns |
| Navegador YouTube | `src/pages/YouTubeMusicBrowser.tsx` | Browse do YouTube Music |
| Wiki/Ajuda | `src/pages/Help.tsx`, `Wiki.tsx` | Documentação e ajuda |
| Diagnósticos | `src/pages/SystemDiagnostics.tsx` | Informações do sistema |

### Componentes do Player

| Componente | Arquivo | Função |
|------------|---------|--------|
| PlayerControls | `src/components/player/PlayerControls.tsx` | Play/Pause/Skip |
| PlaybackControls | `src/components/player/PlaybackControls.tsx` | Shuffle/Repeat |
| VolumeSlider | `src/components/player/VolumeSlider.tsx` | Controle de volume |
| ProgressBar | `src/components/player/ProgressBar.tsx` | Barra de progresso |
| NowPlaying | `src/components/player/NowPlaying.tsx` | Info da música atual |
| QueuePanel | `src/components/player/QueuePanel.tsx` | Fila de reprodução |
| LyricsDisplay | `src/components/player/LyricsDisplay.tsx` | Exibição de letras |
| KaraokeLyrics | `src/components/player/KaraokeLyrics.tsx` | Modo karaoke |
| AudioVisualizer | `src/components/player/AudioVisualizer.tsx` | Visualizador de áudio |
| LibraryPanel | `src/components/player/LibraryPanel.tsx` | Biblioteca de músicas |

### Hooks Principais

| Hook | Arquivo | Função |
|------|---------|--------|
| usePlayer | `src/hooks/player/usePlayer.ts` | Estado do player |
| useVolume | `src/hooks/player/useVolume.ts` | Controle de volume |
| useVolumeNormalization | `src/hooks/player/useVolumeNormalization.ts` | Normalização automática |
| usePlaybackStats | `src/hooks/system/usePlaybackStats.ts` | Estatísticas de uso |
| useLyrics | `src/hooks/player/useLyrics.ts` | Busca de letras |
| useSpotifyPlayer | `src/hooks/spotify/useSpotifyPlayer.ts` | Controle Spotify |
| useYouTubeMusicPlayer | `src/hooks/youtube/useYouTubeMusicPlayer.ts` | Controle YouTube |

### Dependências NPM

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "@tanstack/react-query": "^5.83.0",
  "@supabase/supabase-js": "^2.87.3",
  "framer-motion": "^11.18.2",
  "tailwind-merge": "^2.6.0",
  "recharts": "^2.15.4",
  "lucide-react": "^0.462.0",
  "zod": "^3.25.76",
  "date-fns": "^3.6.0",
  "@radix-ui/react-*": "várias versões",
  "sonner": "^1.7.4"
}
```

---

## 5. Instalação Automática

### Pré-requisitos

```bash
# Verificar que está em CachyOS, Arch ou Manjaro
cat /etc/os-release

# Atualizar sistema
sudo pacman -Syu

# Instalar git se necessário
sudo pacman -S git
```

### Download do Instalador

```bash
# Clonar repositório
git clone https://github.com/seu-repo/tsijukebox.git
cd tsijukebox

# Executar instalador como root
sudo python3 scripts/installer/main.py
```

### Modos de Instalação

```bash
# Instalação interativa (wizard web)
sudo python3 scripts/installer/main.py

# Instalação automática com configuração padrão
sudo python3 scripts/installer/main.py --auto

# Instalação apenas Docker
sudo python3 scripts/installer/main.py --docker

# Instalação kiosk (Spotify fullscreen)
sudo python3 scripts/installer/main.py --auto --mode kiosk

# Instalação servidor (headless)
sudo python3 scripts/installer/main.py --auto --mode server

# Instalação completa (kiosk + server + monitoring)
sudo python3 scripts/installer/main.py --auto --mode full
```

### Opções do Instalador

| Flag | Descrição |
|------|-----------|
| `--auto` | Modo automático (sem perguntas) |
| `--docker` | Apenas container Docker |
| `--mode kiosk\|server\|full` | Tipo de instalação |
| `--port 8080` | Porta do servidor web |
| `--no-browser` | Não abrir browser automaticamente |
| `--config arquivo.json` | Usar arquivo de configuração |
| `-v, --verbose` | Output detalhado |
| `--analytics` | Enviar telemetria anônima |
| `--uninstall` | Desinstalar TSiJUKEBOX |

### Configuração Personalizada

```json
{
  "mode": "full",
  "user": "tsi",
  "database": {
    "type": "sqlite",
    "path": "/var/lib/jukebox/jukebox.db"
  },
  "kiosk": {
    "enabled": true,
    "autologin": true,
    "hide_cursor": true
  },
  "spotify": {
    "enabled": true,
    "spicetify": true,
    "theme": "Dribbblish",
    "extensions": ["shuffle+.js", "keyboardShortcut.js"]
  },
  "youtube_music": {
    "enabled": true,
    "oauth_enabled": true
  },
  "network": {
    "avahi_enabled": true,
    "hostname": "tsijukebox"
  },
  "monitoring": {
    "prometheus": true,
    "grafana": true
  },
  "brand": {
    "splash_enabled": true,
    "splash_variant": "cyberpunk",
    "logo_variant": "metal"
  }
}
```

---

## 6. Configuração do Kiosk Openbox

### Estrutura de Arquivos

```
~/.config/openbox/
├── rc.xml          # Configuração principal do Openbox
├── menu.xml        # Menu de contexto (click direito)
├── autostart       # Script de inicialização automática
└── environment     # Variáveis de ambiente
```

### rc.xml - Configuração Principal

Características principais:
- **Sem bordas de janela**: `<decor>no</decor>`
- **Sem barra de título**: `<titlebar>no</titlebar>`
- **Foco automático**: `<focusNew>yes</focusNew>`
- **Spotify maximizado**: Regra específica para abrir fullscreen

### menu.xml - Menu de Contexto

Menu minimalista acessível por click direito:
- Abrir Terminal (emergência)
- Reiniciar Openbox
- Reiniciar TSiJUKEBOX
- Desligar Sistema

### autostart - Inicialização

```bash
#!/bin/bash
# Desabilitar DPMS e screensaver
xset -dpms &
xset s off &
xset s noblank &

# Esconder cursor após 3 segundos
unclutter --timeout 3 --jitter 50 --ignore-scrolling &

# Aguardar rede
sleep 5

# Iniciar Spotify em fullscreen
spotify &

# Aguardar Spotify iniciar e aplicar fullscreen
sleep 3
wmctrl -r "Spotify" -b add,maximized_vert,maximized_horz
wmctrl -r "Spotify" -b add,fullscreen
```

---

## 7. Integração Spicetify

### Extensões Instaladas

| Extensão | Função |
|----------|--------|
| shuffle+.js | Shuffle melhorado |
| keyboardShortcut.js | Atalhos de teclado customizados |
| autoSkipVideo.js | Pular vídeos automaticamente |
| tsijukebox-overlay.js | **Overlay customizado com QR Code** |

### Extensão TSiJUKEBOX Overlay

A extensão customizada `tsijukebox-overlay.js` adiciona:

1. **QR Code Dinâmico**: Mostra QR Code com URL do controle remoto
2. **Fila de Reprodução**: Exibe próximas músicas na fila
3. **Estatísticas ao Vivo**: Contador de músicas tocadas
4. **Logo TSiJUKEBOX**: Branding no canto inferior

### Configuração do Tema

```bash
# Aplicar tema Dribbblish
spicetify config current_theme Dribbblish
spicetify config color_scheme purple

# Habilitar normalização de volume nativa
spicetify config inject_css 1
spicetify config replace_colors 1
spicetify apply
```

---

## 8. YouTube Music Bridge

### Arquitetura

```
┌──────────────────┐     WebSocket      ┌──────────────────┐
│   TSiJUKEBOX     │◄──────────────────►│  ytmusic_bridge  │
│   (Frontend)     │     Port 9876      │  (Python)        │
└──────────────────┘                    └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │  YouTube Music   │
                                        │  (ytmusicapi)    │
                                        └──────────────────┘
```

### Comandos Suportados

| Comando | Descrição |
|---------|-----------|
| `play` | Iniciar reprodução |
| `pause` | Pausar |
| `next` | Próxima música |
| `previous` | Música anterior |
| `search` | Buscar músicas |
| `queue` | Adicionar à fila |
| `like` | Curtir música atual |
| `shuffle` | Ativar/desativar shuffle |

### Autenticação OAuth

```bash
# Primeira execução - gerar oauth.json
ytmusicapi oauth

# Seguir instruções no terminal para autenticar
# O arquivo oauth.json será criado em ~/.config/ytmusic/
```

---

## 9. Sistema Always-On 24/7

### Configurações Aplicadas

```bash
# Desabilitar DPMS (Display Power Management)
xset -dpms

# Desabilitar screensaver
xset s off
xset s noblank

# Desabilitar suspensão do sistema
systemctl mask sleep.target
systemctl mask suspend.target
systemctl mask hibernate.target
systemctl mask hybrid-sleep.target

# Configurar logind.conf
# HandleLidSwitch=ignore
# HandlePowerKey=ignore
# IdleAction=ignore
```

### Verificação

```bash
# Verificar DPMS
xset q | grep -i dpms

# Verificar targets mascarados
systemctl status sleep.target suspend.target hibernate.target

# Verificar logind
cat /etc/systemd/logind.conf | grep -i handle
```

---

## 10. Descoberta de Rede (mDNS/Avahi)

### Configuração

O sistema é automaticamente descoberto na rede local como `tsijukebox.local`:

```bash
# Arquivo de serviço: /etc/avahi/services/tsijukebox.service
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>TSiJUKEBOX</name>
  <service>
    <type>_http._tcp</type>
    <port>80</port>
    <txt-record>path=/</txt-record>
  </service>
</service-group>
```

### Acesso

Qualquer dispositivo na rede pode acessar:
- `http://tsijukebox.local` - Interface principal
- `http://tsijukebox.local:3000` - Grafana
- `http://tsijukebox.local:9090` - Prometheus

---

## 11. Normalização de Volume

### Funcionamento

O sistema de normalização automática de volume opera em duas camadas:

1. **Backend (Spotify/Spicetify)**: Normalização nativa do Spotify
2. **Frontend (Web Audio API)**: Compressão dinâmica adicional

### Modos Disponíveis

| Modo | Threshold | Ratio | Uso Recomendado |
|------|-----------|-------|-----------------|
| Suave | -24 dB | 2:1 | Ambientes calmos |
| Moderado | -18 dB | 4:1 | Uso geral (padrão) |
| Agressivo | -12 dB | 8:1 | Ambientes barulhentos |

### Configuração via UI

Acesse: **Configurações → Aparência → Normalização de Volume**

Opções:
- Ativar/desativar normalização
- Selecionar modo (Suave/Moderado/Agressivo)
- Ajustar loudness alvo (-23 a -6 LUFS)
- Definir limite de pico (90-100%)
- Monitor em tempo real de loudness

---

## 12. Dashboard de Estatísticas

### Métricas Disponíveis

- **Top 10 Músicas**: Músicas mais tocadas no período
- **Horários de Pico**: Gráfico de atividade por hora do dia
- **Artistas Favoritos**: Ranking de artistas mais reproduzidos
- **Tempo Total**: Total de horas de música tocada
- **Distribuição por Provider**: Spotify vs YouTube Music
- **Tendências**: Comparação com período anterior

### Acesso

`http://tsijukebox.local/jukebox-stats`

### Filtros de Período

- Hoje
- Últimos 7 dias
- Últimos 30 dias
- Este mês
- Período personalizado

---

## 13. Monitoramento e Observabilidade

### Prometheus (Métricas)

Métricas coletadas:
- CPU, memória, disco
- Rede e I/O
- Status dos serviços
- Métricas customizadas do TSiJUKEBOX

### Grafana (Dashboards)

Dashboards pré-configurados:
- System Overview
- TSiJUKEBOX Statistics
- Network Performance
- Service Health

### Alertas

Alertas configurados:
- CPU > 90% por 5 minutos
- Memória > 85%
- Disco > 90%
- Serviço TSiJUKEBOX down

---

## 14. Backup e Recuperação

### Estratégia de Backup

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Banco SQLite   │────►│  Backup Local   │────►│  Cloud Storage  │
│  /var/lib/...   │     │  /backup/daily  │     │  Storj/S3/etc   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        ▼                       ▼
   Configurações          Logs e Métricas
```

### Comandos

```bash
# Backup manual
/opt/jukebox/scripts/backup.sh

# Restaurar backup
/opt/jukebox/scripts/restore.sh /backup/backup-2024-12-01.tar.gz

# Listar backups
ls -la /backup/
```

---

## 15. Troubleshooting

### Spotify não inicia

```bash
# Verificar logs
journalctl -u spotify --no-pager -n 50

# Reinstalar Spicetify
spicetify restore backup apply

# Limpar cache
rm -rf ~/.cache/spotify
```

### TSiJUKEBOX não acessível

```bash
# Verificar container
docker ps | grep jukebox

# Reiniciar serviço
sudo systemctl restart tsijukebox

# Verificar logs
docker logs tsijukebox-web
```

### Tela desligando

```bash
# Verificar configurações DPMS
xset q

# Reaplicar configurações
xset -dpms
xset s off

# Verificar logind
sudo systemctl restart systemd-logind
```

### mDNS não funciona

```bash
# Verificar Avahi
sudo systemctl status avahi-daemon

# Testar descoberta
avahi-browse -a

# Reiniciar
sudo systemctl restart avahi-daemon
```

---

## 16. FAQ

### Posso usar outro Window Manager além do Openbox?

Sim, mas o Openbox foi escolhido por ser leve e altamente configurável para modo kiosk. Alternativas: i3, bspwm, sway (Wayland).

### O sistema funciona sem internet?

Parcialmente. Músicas já em cache funcionam, mas streaming e busca requerem conexão. Recomenda-se biblioteca local para operação offline.

### Como atualizar o TSiJUKEBOX?

```bash
cd /opt/jukebox
git pull
docker-compose pull
docker-compose up -d
```

### Posso usar monitor vertical?

Sim. Configure a rotação no Xorg:
```bash
xrandr --output HDMI-1 --rotate left
```

### Como resetar para configurações de fábrica?

```bash
sudo python3 scripts/installer/main.py --uninstall
sudo python3 scripts/installer/main.py --auto
```

---

## Suporte

- **Documentação**: https://docs.tsijukebox.com
- **GitHub**: https://github.com/seu-repo/tsijukebox
- **Discord**: https://discord.gg/tsijukebox
- **Email**: suporte@tsijukebox.com

---

*Documento gerado automaticamente pelo TSiJUKEBOX Installer v4.1.0*
