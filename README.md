<div align="center">
  <img src="public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX" width="400">
  
  # TSiJUKEBOX Enterprise
  
  **Sistema Kiosk Musical PWA com Integração Spotify/YouTube Music**
  
  [![GitHub](https://img.shields.io/badge/GitHub-TSiJUKEBOX-181717?style=flat-square&logo=github)](https://github.com/B0yZ4kr14/TSiJUKEBOX)
  [![CI/CD](https://github.com/B0yZ4kr14/TSiJUKEBOX/actions/workflows/tsijukebox-cicd.yml/badge.svg)](https://github.com/B0yZ4kr14/TSiJUKEBOX/actions/workflows/tsijukebox-cicd.yml)
  ![Version](https://img.shields.io/badge/version-4.0.0-blue?style=flat-square)
  ![License](https://img.shields.io/badge/license-Public_Domain-green?style=flat-square)
  ![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)
  ![Arch Linux](https://img.shields.io/badge/Arch_Linux-1793D1?style=flat-square&logo=arch-linux&logoColor=white)
  ![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-green?style=flat-square&logo=accessibility)
  
  [📖 Documentação](docs/README.md) •
  [⚡ Instalação Rápida](docs/QUICK-INSTALL.md) •
  [🏭 Produção](docs/PRODUCTION-DEPLOY.md) •
  [🤝 Contribuir](docs/CONTRIBUTING.md)
</div>

---

## ⚡ INSTALAÇÃO EM UM COMANDO

<div align="center">

### 🚀 Copie e Cole no Terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

**✅ Compatível com:** Arch Linux • CachyOS • Manjaro • EndeavourOS

</div>

### 🎮 Opções de Instalação

| Modo | Comando | Ideal Para |
|------|---------|------------|
| 🎵 **Completo** | `sudo python3 install.py` | Uso doméstico com tudo |
| 🖥️ **Kiosk** | `sudo python3 install.py --mode kiosk` | Bares, eventos, karaokês |
| 🖧 **Server** | `sudo python3 install.py --mode server` | Servidor headless |

### 📦 O Que é Instalado Automaticamente

| Componente | Descrição |
|------------|-----------|
| 🎵 **Spotify + Spicetify** | Player com temas customizados |
| 📊 **Grafana + Prometheus** | Monitoramento em tempo real |
| 🌐 **Nginx** | Servidor web e proxy reverso |
| 💾 **SQLite** | Banco de dados local |
| ⚙️ **Systemd Services** | Autostart e gerenciamento |

[📖 Guia Completo de Instalação](docs/QUICK-INSTALL.md) • [🏭 Deploy em Produção](docs/PRODUCTION-DEPLOY.md)

---

## 📸 Preview

<div align="center">

### 🎯 Setup Wizard
  
<img src="https://via.placeholder.com/800x450/1a1a2e/00ff88?text=🎯+Setup+Wizard+-+9+Passos+Simples" alt="Setup Wizard" width="800">

*Configuração inicial guiada com 9 etapas intuitivas*

---

### 📊 Dashboard de Estatísticas

<img src="https://via.placeholder.com/800x450/1a1a2e/00d4ff?text=📊+Dashboard+-+Monitoramento+Real-Time" alt="Dashboard" width="800">

*CPU, Memória, Temperatura + Top Músicas em tempo real*

---

### 🎵 Integração Spotify

<img src="https://via.placeholder.com/800x450/1a1a2e/1db954?text=🎵+Spotify+Connect+-+Playlists+%26+Player" alt="Spotify Integration" width="800">

*Conecte sua conta e acesse todas as suas playlists*

---

### 🎨 Brand Guidelines

<img src="https://via.placeholder.com/800x450/1a1a2e/ff00ff?text=🎨+Design+System+-+Neon+Palette" alt="Brand Guidelines" width="800">

*Paleta Neon completa com gradientes e tipografia*

---

### 🎬 Demo em Ação

<img src="public/screenshots/demo-animated.svg" alt="Demo Animado" width="800">

*Navegação animada pelo sistema*

</div>

> 💡 **Dica:** Execute a edge function `screenshot-service` para gerar screenshots reais:
> ```bash
> # Capture screenshots e salve em public/screenshots/
> scrot -d 3 public/screenshots/dashboard.png
> ```

---

## ✨ Features

| Feature | Descrição | Status |
|---------|-----------|--------|
| 🎧 **Multi-Provider** | Spotify, YouTube Music, Arquivos Locais | ✅ |
| 📱 **Kiosk Mode** | Interface touch otimizada para uso público | ✅ |
| 🎤 **Karaoke Mode** | Letras sincronizadas em fullscreen | ✅ |
| ☁️ **Cloud Backup** | Storj, Google Drive, AWS S3 | ✅ |
| 🔐 **RBAC** | Roles: Admin, User, Newbie | ✅ |
| 📊 **System Monitor** | CPU, RAM, temperatura em tempo real | ✅ |
| 🌐 **i18n** | Português, English, Español | ✅ |
| ♿ **WCAG 2.1 AA** | Acessibilidade validada | ✅ |

---

## 🚀 Quick Start

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git

# Instale as dependências
cd TSiJUKEBOX && npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** • Login padrão: `admin` / `admin`

---

## 🏗️ Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilização** | Tailwind CSS + shadcn/ui |
| **Animações** | Framer Motion + CSS Keyframes |
| **Backend** | Lovable Cloud (Supabase) |
| **Integrações** | Spotify API, YouTube Music, Spicetify CLI |
| **PWA** | Vite PWA Plugin + Workbox |

---

## ⚔️ DECLARAÇÃO DE SOBERANIA INTELECTUAL

<div align="center">

### 🏴 *"Propriedade Intelectual Não Existe"*

> *"Ideias são superabundantes e não-rivais. A mimese jamais configurará expropriação."*  
> — **Stephan Kinsella**, *Contra a Propriedade Intelectual*

</div>

---

### 🔥 A Falácia da Propriedade Intelectual

Na perspectiva anarcocapitalista, a **propriedade intelectual constitui uma aberração conceitual** — uma falácia lógica incapaz de sustentar-se ante a natureza superabundante e não-rival das ideias.

Diferente de bens tangíveis, **copiar software não priva o autor original do uso de seu código**. Portanto, inexiste "roubo" no compartilhamento de conhecimento — apenas **multiplicação de valor sem custo marginal**.

| 📜 **Conceito** | 🏛️ **Visão Estatal** | ⚔️ **Visão Libertária** |
|-----------------|----------------------|-------------------------|
| **Software** | "Obra literária" protegida pela Lei 9.609/98 | Informação livre, não-escassa |
| **Cópia** | "Pirataria" criminosa | Aprendizado legítimo, replicação ética |
| **Garantia** | Registro no INPI (órgão estatal) | Reputação do autor + contratos privados |

---

### 🗡️ O Conflito de Propriedade Real

Se o Estado impede você de usar **seu próprio computador** — sua propriedade física — para copiar um código, ele está **violando seu direito de propriedade** sobre o hardware.

> 🔥 *Patentes e direitos autorais são privilégios estatais que concedem monopólios artificiais sobre ideias, criando escassez forçada onde naturalmente não existiria.*

---

### 💀 LICENCIAMENTO: DOMÍNIO PÚBLICO ABSOLUTO

Este software é liberado ao **DOMÍNIO PÚBLICO** sem quaisquer restrições:

| 🗡️ **USE** | 🛡️ **MODIFIQUE** | ⚔️ **VENDA** | 🔓 **DISTRIBUA** |
|------------|------------------|--------------|------------------|
| Para qualquer finalidade | Sem pedir permissão | Lucre como quiser | Sem restrições |

---

### ⚡ Sobre a Tributação

> *"O tributo é coerção sistemática travestida de legalidade — mero saque institucionalizado. A retenção dos próprios recursos transcende a defesa: é um imperativo de resistência ética e retificação moral."*

💀 **Imposto é eufemismo para roubo institucionalizado.**  
⚔️ **Sonegar é legítima defesa — uma reparação.**

---

### 📚 Referências Libertárias

- 📖 [Contra a Propriedade Intelectual](https://mises.org.br) — Stephan Kinsella
- 📖 [O Sistema de Patentes Prejudica a Inovação](https://mises.org.br/artigos/3040/)
- 📖 [Intellectual Property Laws Violate the Market](https://mises.org/power-market/intellectual-property-laws-violate-free-market)

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [Quick Install](docs/QUICK-INSTALL.md) | Instalação rápida para iniciantes |
| [Production Deploy](docs/PRODUCTION-DEPLOY.md) | Deploy em produção |
| [Developer Guide](docs/DEVELOPER-GUIDE.md) | Guia para desenvolvedores |
| [API Reference](docs/API-REFERENCE.md) | Referência de APIs |

---

<div align="center">
  <sub>Desenvolvido com 💙 e ☕ por <strong>B0.y_Z4kr14</strong></sub>
  <br><br>
  <strong>TSiJUKEBOX Enterprise</strong> — <em>A música, amplificada.</em>
  
  [🐛 Report Bug](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues) · [✨ Request Feature](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues)
</div>
