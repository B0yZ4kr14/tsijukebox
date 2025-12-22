# 🎵 TSiJUKEBOX Wiki

> **Enterprise Music System v4.2.0** - Sistema kiosk musical profissional com integração Spotify, YouTube Music e arquivos locais.

[![Version](https://img.shields.io/badge/version-4.2.0-blue)](../CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Public%20Domain-green)](../../LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-success)](../ACCESSIBILITY.md)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)](https://typescriptlang.org)

---

## ⚡ Instalação em Um Comando

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

**✅ Compatível com:** Arch Linux • CachyOS • Manjaro • EndeavourOS

[📖 Guia Completo de Instalação](Install-OneCommand.md)

---

## 📖 Navegação Rápida

### 🚀 Primeiros Passos
- [⚡ Instalação em Um Comando](Install-OneCommand.md)
- [Tutorial: Primeira Configuração](Tutorial-First-Setup.md)
- [Requisitos do Sistema](../INSTALLATION.md#system-requirements)
- [Instalação Completa](../INSTALLATION.md)

### 🐧 CachyOS / Arch Linux
- [Instalação CachyOS](Install-CachyOS.md)
- [Configuração de Shell](Shell-Configuration.md)
- [Setup Openbox Kiosk](Openbox-Kiosk-Setup.md)
- [Referência de Dependências](Dependencies-Reference.md)

### 🎧 Integrações de Música
- [Integração Spotify](Tutorial-Spotify-Integration.md)
- [YouTube Music](Tutorial-YouTube-Music.md)
- [Arquivos Locais](User-Guide-Local-Files.md)

### 🎤 Modos Especiais
- [Modo Karaoke](Tutorial-Karaoke-Mode.md)
- [Modo Kiosk](Tutorial-Kiosk-Mode.md)

### 👤 Guias de Usuário
- [Uso Básico](User-Guide-Basic.md)
- [Recursos Avançados](User-Guide-Advanced.md)
- [Administração](User-Guide-Admin.md)

### ⚙️ Configuração
- [Banco de Dados](Config-Database.md)
- [Backup na Nuvem](Config-Cloud-Backup.md)
- [Temas e Personalização](Config-Themes.md)
- [Acessibilidade](Config-Accessibility.md)

### 👨‍💻 Desenvolvimento
- [Arquitetura do Sistema](Dev-Architecture.md)
- [Sistema de Rotas](Dev-Routes.md)
- [Referência da API](Dev-API-Reference.md)
- [Como Contribuir](Dev-Contributing.md)
- [Guia de Testes](Dev-Testing.md)

---

## 🌟 Destaques do Sistema

### Multi-Provider Music
Integração com múltiplos provedores de música:
- **Spotify** - Streaming via Spotify Connect
- **YouTube Music** - Acesso a músicas e playlists
- **Arquivos Locais** - Suporte a MP3, FLAC, AAC, OGG

### Modos de Operação
| Modo | Comando | Descrição |
|------|---------|-----------|
| 🎵 **Completo** | `sudo python3 install.py` | Uso doméstico com tudo |
| 🖥️ **Kiosk** | `sudo python3 install.py --mode kiosk` | Bares, eventos, karaokês |
| 🖧 **Server** | `sudo python3 install.py --mode server` | Servidor headless |

### Recursos Enterprise
| Feature | Descrição | Status |
|---------|-----------|--------|
| 🔐 **RBAC** | Role-Based Access Control | ✅ |
| ☁️ **Cloud Backup** | Storj, Google Drive, AWS S3 | ✅ |
| 🌐 **i18n** | PT-BR, EN, ES | ✅ |
| ♿ **WCAG 2.1 AA** | Acessibilidade validada | ✅ |
| 📱 **PWA** | Progressive Web App | ✅ |

---

## 📋 Requisitos Mínimos

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| OS | Linux, Windows, macOS | CachyOS / Arch Linux |
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Disco | 500 MB | 2+ GB |
| Display | 1280x720 | 1920x1080+ |
| Browser | Chrome 90+ | Chrome 120+ |

---

## 📦 O Que é Instalado Automaticamente

| Componente | Descrição |
|------------|-----------|
| 🎵 **Spotify + Spicetify** | Player com temas customizados |
| 📊 **Grafana + Prometheus** | Monitoramento em tempo real |
| 🌐 **Nginx** | Servidor web e proxy reverso |
| 💾 **SQLite** | Banco de dados local |
| ⚙️ **Systemd Services** | Autostart e gerenciamento |

---

## 🔗 Links Úteis

- [Repositório GitHub](https://github.com/B0yZ4kr14/TSiJUKEBOX)
- [Documentação Principal](../README.md)
- [Changelog](../CHANGELOG.md)
- [Código de Conduta](../../CODE_OF_CONDUCT.md)
- [Sistema de Rotas](../ROUTES.md)

---

## 📝 Contribuições

Contribuições são bem-vindas! Consulte o [Guia de Contribuição](Dev-Contributing.md) para começar.

---

## ⚔️ Licenciamento

Este software é dedicado ao **DOMÍNIO PÚBLICO** sem quaisquer restrições.

> *"Ideias são superabundantes e não-rivais. A mimese jamais configurará expropriação."*  
> — **Stephan Kinsella**

---

*TSiJUKEBOX v4.2.0 - Dedicated to the Public Domain*
