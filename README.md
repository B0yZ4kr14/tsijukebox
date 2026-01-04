<div align="center">

<img src="docs/assets/logo.svg" alt="TSiJUKEBOX Logo" width="400">

<br><br>

# 🎵 TSiJUKEBOX

### Enterprise Digital Jukebox System

[![Version](https://img.shields.io/badge/version-4.2.1-00d4ff?style=for-the-badge&logo=github&logoColor=white)](docs/CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Public%20Domain-fbbf24?style=for-the-badge&logo=unlicense&logoColor=white)](LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-22c55e?style=for-the-badge&logo=accessibility&logoColor=white)](docs/ACCESSIBILITY_REPORT_FINAL.md)
[![CachyOS](https://img.shields.io/badge/CachyOS-Ready-00D4FF?style=for-the-badge&logo=archlinux&logoColor=white)](https://cachyos.org)

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

**Sistema kiosk musical profissional com integração Spotify, YouTube Music e arquivos locais.**

[📖 Wiki](https://github.com/B0yZ4kr14/tsijukebox/wiki) · [🌐 Demo](https://tsijukebox.vercel.app) · [🐛 Issues](https://github.com/B0yZ4kr14/tsijukebox/issues) · [🎨 Temas](docs/mockups/index.html)

</div>

---

## ⚡ Instalação Rápida — CachyOS / Arch Linux

<div align="center">

### 🐧 Wizard Interativo (Recomendado):

```fish
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/scripts/installation-wizard.py | python3
```

### 🚀 Instalação Direta:

```fish
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/tsijukebox/main/scripts/unified-installer.py | sudo python3
```

**✅ Otimizado para:** CachyOS · Arch Linux · Manjaro · EndeavourOS

</div>

### 🎮 Modos de Instalação

| Modo | Comando | Acesso | Ideal Para |
|------|---------|--------|------------|
| 🎵 **Full** | `sudo python3 unified-installer.py` | `https://midiaserver.local/jukebox` | Uso doméstico completo |
| 🖥️ **Kiosk** | `sudo python3 unified-installer.py --mode kiosk` | `https://midiaserver.local/jukebox` | Bares, eventos, karaokês |
| 🖧 **Server** | `sudo python3 unified-installer.py --mode server` | `https://midiaserver.local:8080/api` | Servidor headless |

### 📦 Componentes Instalados

| Componente | Descrição | Status |
|------------|-----------|:------:|
| 🐳 **Docker** | Containerização | ✅ |
| 🔥 **UFW** | Firewall | ✅ |
| ⏰ **NTP** | Sincronização de tempo | ✅ |
| 🌐 **Nginx** | Proxy reverso + SSL | ✅ |
| 📊 **Grafana** | Monitoramento visual | ✅ |
| 📈 **Prometheus** | Métricas | ✅ |
| 🛡️ **Fail2ban** | Proteção contra ataques | ✅ |
| 📡 **Avahi/mDNS** | Acesso via `.local` | ✅ |
| 🎵 **Spotify** | Player integrado | ✅ |
| 🎨 **Spicetify** | Customização Spotify | ✅ |

**🔐 Login padrão:** `admin` / `admin`

---

## 🎨 Design System — 6 Temas Visuais

O TSiJUKEBOX oferece **6 temas profissionais** com design neon metallic:

<table>
<tr>
<td align="center" width="33%">

### 🌌 Cosmic Player
`Tema Padrão`

<img src="docs/assets/theme-references/theme-cosmic-player.png" alt="Cosmic Player" width="200">

![#09090B](https://via.placeholder.com/15/09090B/09090B) ![#00D4FF](https://via.placeholder.com/15/00D4FF/00D4FF) ![#FF00D4](https://via.placeholder.com/15/FF00D4/FF00D4)

</td>
<td align="center" width="33%">

### 🎤 Karaoke Stage
`Modo Karaoke`

<img src="docs/assets/theme-references/theme-karaoke-stage.png" alt="Karaoke Stage" width="200">

![#1a0a2e](https://via.placeholder.com/15/1a0a2e/1a0a2e) ![#FF00D4](https://via.placeholder.com/15/FF00D4/FF00D4) ![#8A2BE2](https://via.placeholder.com/15/8A2BE2/8A2BE2)

</td>
<td align="center" width="33%">

### ✨ Stage Neon Metallic
`Novo`

![#0a0a1a](https://via.placeholder.com/15/0a0a1a/0a0a1a) ![#00FFFF](https://via.placeholder.com/15/00FFFF/00FFFF) ![#FF00D4](https://via.placeholder.com/15/FF00D4/FF00D4)

**Variáveis CSS:**
```css
--accent-cyan: #00ffff;
--accent-magenta: #ff00d4;
--metallic-chrome: #e8e8e8;
```

</td>
</tr>
<tr>
<td align="center">

### 🏠 Dashboard Home
`Dourado`

<img src="docs/assets/theme-references/theme-dashboard-home.png" alt="Dashboard Home" width="200">

![#0f0f12](https://via.placeholder.com/15/0f0f12/0f0f12) ![#FFD700](https://via.placeholder.com/15/FFD700/FFD700)

</td>
<td align="center">

### 🎵 Spotify Integration
`Verde Spotify`

<img src="docs/assets/theme-references/theme-spotify-integration.png" alt="Spotify" width="200">

![#121212](https://via.placeholder.com/15/121212/121212) ![#1DB954](https://via.placeholder.com/15/1DB954/1DB954)

</td>
<td align="center">

### ⚙️ Settings Dark
`Roxo`

<img src="docs/assets/theme-references/theme-settings-dark.png" alt="Settings" width="200">

![#0a0a0c](https://via.placeholder.com/15/0a0a0c/0a0a0c) ![#8B5CF6](https://via.placeholder.com/15/8B5CF6/8B5CF6)

</td>
</tr>
</table>

**📄 Ver todos os mockups:** [docs/mockups/index.html](docs/mockups/index.html)

---

## ✨ Features Principais

<table>
<tr>
<td align="center" width="25%">

### 🎤
**Karaoke Pro**

Letras sincronizadas
Controle de pitch
Reverb & Echo
Pontuação em tempo real

</td>
<td align="center" width="25%">

### 🎵
**Player Avançado**

Visualizador de áudio
Equalização 10 bandas
Playlists inteligentes
Fila dinâmica drag-n-drop

</td>
<td align="center" width="25%">

### 📺
**Modo Kiosk**

Interface fullscreen
Suporte a touch
Autoplay contínuo
Otimizado para TVs

</td>
<td align="center" width="25%">

### 🔗
**Integrações**

Spotify Web API
YouTube Music
GitHub Sync
Cloud Backup (Storj/S3)

</td>
</tr>
</table>

### 🎵 Provedores de Música

| Provider | Recursos | Autenticação |
|----------|----------|--------------|
| 🎵 **Spotify** | Streaming, Playlists, Spotify Connect, Letras | OAuth 2.0 |
| 📺 **YouTube Music** | Streaming, Playlists, Mix Personalizado | OAuth 2.0 |
| 📁 **Arquivos Locais** | MP3, FLAC, AAC, OGG, WAV, OPUS | N/A |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TSiJUKEBOX Architecture                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        FRONTEND (React + Vite)                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Player  │ │  Queue   │ │ Karaoke  │ │ Settings │ │  Kiosk   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │                    6 Temas Visuais · WCAG 2.1 AA                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                         NGINX (Proxy Reverso)                       │   │
│  │              https://midiaserver.local/jukebox                      │   │
│  │                    SSL · Avahi/mDNS · UFW                           │   │
│  └─────────────────────────────────┼───────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                          DOCKER CONTAINERS                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │ TSiJUKE  │ │ Grafana  │ │Prometheus│ │ Fail2ban │ │   NTP    │  │   │
│  │  │  :8080   │ │  :3000   │ │  :9090   │ │          │ │          │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        SUPABASE (Backend)                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│  │  │PostgreSQL│ │   Auth   │ │ Storage  │ │Edge Funcs│               │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 📁 Estrutura de Pastas

```
tsijukebox/
├── 📁 src/
│   ├── 📁 components/     # 72 Componentes React
│   │   ├── 📁 ui/         # shadcn/ui base
│   │   ├── 📁 player/     # Player de música
│   │   ├── 📁 karaoke/    # Sistema de karaoke
│   │   └── 📁 settings/   # Configurações
│   ├── 📁 pages/          # 45 Páginas
│   ├── 📁 hooks/          # React hooks customizados
│   ├── 📁 stores/         # Estado global (Zustand)
│   └── 📁 themes/         # 6 Temas visuais
├── 📁 scripts/            # 26 Scripts Python
│   ├── unified-installer.py      # Instalador principal
│   ├── installation-wizard.py    # Wizard interativo
│   └── master-fix.py             # Correções automáticas
├── 📁 docs/               # Documentação completa
│   ├── 📁 mockups/        # Mockups HTML dos temas
│   └── 📁 assets/         # Imagens e ícones
└── 📁 wiki/               # Páginas Wiki preparadas
```

---

## 📋 Requisitos do Sistema

| Componente | Mínimo | Recomendado |
|------------|:------:|:-----------:|
| 🐧 **OS** | Arch Linux | CachyOS + Openbox |
| 🐚 **Shell** | bash | fish |
| ⚙️ **CPU** | 2 cores | 4+ cores |
| 💾 **RAM** | 2 GB | 4+ GB |
| 💿 **Disco** | 500 MB | 2+ GB |
| 🐍 **Python** | 3.9 | 3.11+ |
| 🐳 **Docker** | 20.x | 24.x |

---

## 🛠️ Scripts Disponíveis

```fish
# Instalação
python3 scripts/installation-wizard.py    # Wizard interativo
sudo python3 scripts/unified-installer.py # Instalação direta

# Desenvolvimento
pnpm dev              # Servidor de desenvolvimento
pnpm build            # Build de produção
pnpm preview          # Preview do build

# Qualidade
pnpm lint             # Verifica código
pnpm type-check       # Verifica tipos TypeScript

# Testes
pnpm test             # Testes unitários (Vitest)
pnpm test:e2e         # Testes E2E (Playwright)
pnpm test:coverage    # Relatório de cobertura

# Utilitários
python3 scripts/master-fix.py --all    # Correções automáticas
```

---

## ♿ Acessibilidade WCAG 2.1 AA

| Recurso | Implementação | Status |
|---------|---------------|:------:|
| ⌨️ Navegação por Teclado | Tab, Enter, Escape | ✅ |
| 🔊 Leitores de Tela | ARIA labels e roles | ✅ |
| 🎨 Contraste de Cores | Ratio mínimo 4.5:1 | ✅ |
| 🎯 Foco Visível | Indicador claro | ✅ |

**Métricas:** 238 aria-labels · 550 aria-hidden · 50 roles · [📄 Relatório Completo](docs/ACCESSIBILITY_REPORT_FINAL.md)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| 📖 [Wiki](https://github.com/B0yZ4kr14/tsijukebox/wiki) | Documentação completa |
| 📥 [Instalação](https://github.com/B0yZ4kr14/tsijukebox/wiki/Installation-Guide) | Guia passo a passo |
| ⚙️ [Configuração](https://github.com/B0yZ4kr14/tsijukebox/wiki/Configuration) | Opções avançadas |
| 🎨 [Design System](https://github.com/B0yZ4kr14/tsijukebox/wiki/Design-System) | Tokens e cores |
| 🔌 [API Reference](https://github.com/B0yZ4kr14/tsijukebox/wiki/API-Reference) | Endpoints REST |
| ♿ [Acessibilidade](docs/ACCESSIBILITY_REPORT_FINAL.md) | Relatório WCAG 2.1 AA |
| 🎨 [Mockups](docs/mockups/index.html) | Temas visuais |

---

## 🤝 Contribuindo

1. 🍴 **Fork** → `gh repo fork B0yZ4kr14/tsijukebox`
2. 🌿 **Branch** → `git checkout -b feature/AmazingFeature`
3. 💾 **Commit** → `git commit -m 'feat: add AmazingFeature'`
4. 📤 **Push** → `git push origin feature/AmazingFeature`
5. 🔀 **PR** → `gh pr create`

---

## 📜 Licença e Filosofia

<div align="center">

### ⚔️ DECLARAÇÃO DE SOBERANIA INTELECTUAL

<img src="docs/assets/B0.y_Z4kr14-avatar.png" alt="B0.y_Z4kr14 Avatar" width="300">

</div>

---

### 🏴 "Propriedade Intelectual Não Existe"

> *"Ideias são superabundantes e não-rivais. A mimese jamais configurará expropriação."*
>
> — **Stephan Kinsella**, Contra a Propriedade Intelectual

---

### 🔥 A Falácia da Propriedade Intelectual

Na perspectiva TecnoLibertária, a **propriedade intelectual** constitui uma **aberração conceitual** — uma falácia lógica incapaz de sustentar-se ante a natureza **superabundante** e **não-rival** das ideias.

Diferente de bens tangíveis, **copiar software não priva o autor original** do uso de seu código. Portanto, inexiste "roubo" no compartilhamento de conhecimento — apenas **multiplicação de valor sem custo marginal**.

| 📜 Conceito | 🏛️ Visão Estatal | ⚔️ Visão Libertária |
|------------|-----------------|-------------------|
| **Software** | "Obra literária" protegida pela Lei 9.609/98 | Informação livre, não-escassa |
| **Cópia** | "Pirataria" criminosa | Aprendizado legítimo, replicação ética |
| **Garantia** | Registro no INPI (órgão estatal) | Reputação do autor + contratos privados |

---

### 💀 LICENCIAMENTO: DOMÍNIO PÚBLICO ABSOLUTO

<div align="center">

<img src="docs/assets/gadsden-flag.png" alt="Gadsden Flag - Don't Tread On Me" width="400">

**🐍 DON'T TREAD ON ME 🐍**

</div>

Este software é liberado ao **DOMÍNIO PÚBLICO** sem quaisquer restrições:

| 🗡️ USE | 🛡️ MODIFIQUE | ⚔️ VENDA | 🔓 DISTRIBUA |
|--------|-------------|---------|-------------|
| Para qualquer finalidade | Sem pedir permissão | Lucre como quiser | Sem restrições |

---

## 👨‍💻 Créditos

<div align="center">

<img src="docs/assets/B0.y_Z4kr14-avatar.png" alt="B0.y_Z4kr14" width="200">

### **B0.y_Z4kr14**

⚔️ Desenvolvedor Libertário · 🏴 TecnoLibertária · 🐍 Don't Tread On Me

[![GitHub](https://img.shields.io/badge/GitHub-B0yZ4kr14-00d4ff?style=for-the-badge&logo=github&logoColor=white)](https://github.com/B0yZ4kr14)
[![Bitcoin](https://img.shields.io/badge/Bitcoin-Accepted-fbbf24?style=for-the-badge&logo=bitcoin&logoColor=white)](docs/DONATIONS.md)
[![Monero](https://img.shields.io/badge/Monero-Accepted-ff6600?style=for-the-badge&logo=monero&logoColor=white)](docs/DONATIONS.md)

</div>

---

## 🌟 Agradecimentos

- 🎵 **Spotify** — API e SDK de reprodução
- 📺 **YouTube** — Data API v3
- 🎨 **shadcn/ui** — Component library
- ⚡ **Supabase** — Backend as a Service
- 🐧 **Arch Linux / CachyOS** — Base sólida e filosofia KISS
- 🤖 **Manus AI** — Assistente de desenvolvimento

---

<div align="center">

### 🏴 Desenvolvido com ❤️ e Liberdade

**TSiJUKEBOX** © 2025 B0.y_Z4kr14 · Domínio Público Absoluto

🐍 **Don't Tread On Me** 🐍

[![Star this repo](https://img.shields.io/github/stars/B0yZ4kr14/tsijukebox?style=social)](https://github.com/B0yZ4kr14/tsijukebox)
[![Fork this repo](https://img.shields.io/github/forks/B0yZ4kr14/tsijukebox?style=social)](https://github.com/B0yZ4kr14/tsijukebox/fork)
[![Watch this repo](https://img.shields.io/github/watchers/B0yZ4kr14/tsijukebox?style=social)](https://github.com/B0yZ4kr14/tsijukebox)

</div>
