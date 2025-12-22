# TSiJUKEBOX Enterprise Documentation

<div align="center">

<img src="assets/logo.svg" alt="TSiJUKEBOX Logo" width="350">

<br><br>

**Enterprise Music System for Kiosk and Bar Environments**

[![Version](https://img.shields.io/badge/version-4.2.0-blue?style=for-the-badge&logo=github)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Public%20Domain-green?style=for-the-badge&logo=unlicense)](../LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-success?style=for-the-badge&logo=accessibility)](ACCESSIBILITY.md)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

[🚀 Quick Start](GETTING-STARTED.md) · [📦 Installation](INSTALLATION.md) · [👨‍💻 Developer Guide](DEVELOPER-GUIDE.md) · [🤝 Contributing](CONTRIBUTING.md) · [📖 API Reference](API-REFERENCE.md)

</div>

---

## 📚 Índice da Documentação

### 🚀 Primeiros Passos

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Quick Start Guide**](GETTING-STARTED.md) | Iniciantes | Configure e execute em 5 minutos |
| [**Quick Install**](QUICK-INSTALL.md) | Todos | Instalação em um comando |
| [**Installation Guide**](INSTALLATION.md) | Todos | Instruções completas de instalação |
| [**Glossary**](GLOSSARY.md) | Iniciantes | Termos técnicos explicados |

### 👤 Para Usuários

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Configuration Guide**](CONFIGURATION.md) | Power Users | Todas as opções de configuração |
| [**Troubleshooting**](TROUBLESHOOTING.md) | Todos | Problemas comuns e soluções |
| [**System Deployment**](SYSTEM-DEPLOYMENT.md) | Administradores | Deploy completo do sistema |
| [**Production Deploy**](PRODUCTION-DEPLOY.md) | DevOps | Deploy em ambiente de produção |

### 🎨 Para Designers e Entusiastas

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Design System**](DESIGN-SYSTEM.md) | Designers | Cores, tipografia, componentes |
| [**Brand Components**](BRAND-COMPONENTS.md) | Designers | Componentes de marca |
| [**Accessibility**](ACCESSIBILITY.md) | Todos | Conformidade WCAG 2.1 AA |

### 👨‍💻 Para Desenvolvedores

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Project Map**](PROJECT-MAP.md) | Desenvolvedores | Mapa completo com 95+ componentes, 52 hooks |
| [**Developer Guide**](DEVELOPER-GUIDE.md) | Desenvolvedores | Arquitetura e guia de contribuição |
| [**Contributing Guide**](CONTRIBUTING.md) | Desenvolvedores | Como contribuir para o projeto |
| [**Coding Standards**](CODING-STANDARDS.md) | Desenvolvedores | Padrões de código e estilo |
| [**Hooks Architecture**](HOOKS-ARCHITECTURE.md) | Desenvolvedores | Organização de React hooks |
| [**Components**](COMPONENTS.md) | Desenvolvedores | Documentação de componentes |
| [**Routes**](ROUTES.md) | Desenvolvedores | Sistema de rotas da aplicação |

### 🔌 APIs e Integrações

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**API Reference**](API-REFERENCE.md) | Desenvolvedores | Documentação completa de hooks e contexts |
| [**Backend Endpoints**](BACKEND-ENDPOINTS.md) | Desenvolvedores | Documentação de edge functions |
| [**Backend README**](README-BACKEND.md) | Desenvolvedores | Visão geral do backend |

### 🏗️ Arquitetura e Infraestrutura

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Architecture**](ARCHITECTURE.md) | Desenvolvedores | Arquitetura do sistema |
| [**Architecture Analysis**](ARCHITECTURE-ANALYSIS.md) | Desenvolvedores | Análise e recomendações de refatoração |
| [**CI/CD**](CI-CD.md) | DevOps | Integração e deploy contínuos |
| [**Grafana Setup**](GRAFANA-SETUP.md) | DevOps | Configuração de monitoramento |
| [**Monitoring**](MONITORING.md) | DevOps | Sistema de monitoramento |

### 🔒 Segurança

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Security Guide**](SECURITY.md) | Desenvolvedores | Práticas e políticas de segurança |
| [**GitHub Integration**](GITHUB-INTEGRATION.md) | DevOps | Integração com GitHub Actions |

### 🧪 Testes

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Testing Guide**](TESTING.md) | Desenvolvedores | Guia completo de testes |
| [**Python Testing**](PYTHON_TESTING.md) | Desenvolvedores | Testes do instalador Python |

### 📜 Referência

| Documento | Público | Descrição |
| --------- | ------- | --------- |
| [**Changelog**](CHANGELOG.md) | Todos | Histórico de versões e atualizações |
| [**Credits**](CREDITS.md) | Todos | Autoria e licenciamento |
| [**Code of Conduct**](../CODE_OF_CONDUCT.md) | Todos | Diretrizes da comunidade |
| [**License**](../LICENSE) | Todos | Dedicação ao Domínio Público |

---

## 🎯 O que é o TSiJUKEBOX?

TSiJUKEBOX é um **sistema de jukebox digital de nível empresarial** projetado para:

| Ambiente | Caso de Uso | Recursos Principais |
| -------- | ----------- | ------------------- |
| 🎵 **Bares e Restaurantes** | Clientes escolhem músicas | Fila de reprodução, controle de volume |
| 🎤 **Karaokês** | Letras sincronizadas | Modo fullscreen, pontuação |
| 🏪 **Lojas** | Música ambiente | Playlists automáticas, agendamento |
| 🏠 **Uso Doméstico** | Servidor de música pessoal | Multi-room, integração smart home |

### Recursos Principais

| Feature | Descrição | Status |
| ------- | --------- | ------ |
| 🎧 **Multi-Provider** | Spotify, YouTube Music, Arquivos Locais | ✅ |
| 📱 **Kiosk Mode** | Interface touch otimizada para uso público | ✅ |
| 🎤 **Karaoke Mode** | Letras sincronizadas em tempo real | ✅ |
| ☁️ **Cloud Backup** | Storj, Google Drive, Dropbox, AWS S3 | ✅ |
| 🔐 **RBAC** | Roles: Admin, User, Newbie | ✅ |
| 📊 **System Monitor** | CPU, RAM, temperatura em tempo real | ✅ |
| 🌐 **i18n** | Português, English, Español | ✅ |
| ♿ **WCAG 2.1 AA** | Acessibilidade validada | ✅ |
| 📱 **PWA** | Progressive Web App com suporte offline | ✅ |

---

## 🖥️ Requisitos do Sistema

### Requisitos Mínimos

| Componente | Requisito |
| ---------- | --------- |
| **OS** | Arch Linux, CachyOS, Manjaro, EndeavourOS |
| **CPU** | x86_64, 2+ cores |
| **RAM** | 2 GB |
| **Disco** | 10 GB livre |
| **Display** | 1024x768 mínimo |
| **Node.js** | 18.x ou superior |

### Especificações Recomendadas

| Componente | Recomendação |
| ---------- | ------------ |
| **OS** | CachyOS (Arch otimizado) com Openbox |
| **CPU** | 4+ cores |
| **RAM** | 8 GB |
| **Disco** | 50+ GB (para biblioteca de música) |
| **Display** | 1920x1080 touchscreen |
| **Network** | Ethernet para confiabilidade |
| **Node.js** | 20.x LTS |

---

## 🚀 Instalação Rápida

### Um Comando (Recomendado)

```bash
curl -fsSL https://raw.githubusercontent.com/B0yZ4kr14/TSiJUKEBOX/main/scripts/install.py | sudo python3
```

### Manual

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/TSiJUKEBOX.git
cd TSiJUKEBOX

# Execute o instalador (requer root)
sudo python3 scripts/installer/main.py

# Ou para instalação automática com padrões
sudo python3 scripts/installer/main.py --auto
```

Para instruções detalhadas, veja [INSTALLATION.md](INSTALLATION.md) ou [QUICK-INSTALL.md](QUICK-INSTALL.md).

---

## 📁 Estrutura do Projeto

```
tsijukebox/
├── docs/                    # Documentação
│   ├── assets/             # Assets da documentação (logo, imagens)
│   ├── adr/                # Architecture Decision Records
│   └── wiki/               # Conteúdo da Wiki
├── e2e/                     # Testes end-to-end (Playwright)
├── public/                  # Assets estáticos
│   ├── logo/               # Assets de marca
│   └── screenshots/        # Screenshots e demos
├── scripts/
│   ├── installer/          # Instalador Python
│   └── tests/              # Testes do instalador
├── src/
│   ├── components/         # Componentes React
│   │   ├── auth/          # Autenticação
│   │   ├── player/        # Player de música
│   │   ├── settings/      # Painéis de configuração
│   │   ├── spotify/       # Integração Spotify
│   │   ├── ui/            # Primitivos de UI (shadcn)
│   │   └── youtube/       # YouTube Music
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   │   ├── auth/          # Hooks de autenticação
│   │   ├── player/        # Hooks do player
│   │   ├── spotify/       # Hooks do Spotify
│   │   └── youtube/       # Hooks do YouTube
│   ├── lib/               # Utilitários
│   ├── pages/             # Páginas de rotas
│   └── i18n/              # Traduções
├── supabase/
│   └── functions/         # Edge functions
└── docker/                 # Configurações Docker
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia:

- [**Contributing Guide**](CONTRIBUTING.md) — Como contribuir
- [**Code of Conduct**](../CODE_OF_CONDUCT.md) — Diretrizes da comunidade
- [**Developer Guide**](DEVELOPER-GUIDE.md) — Arquitetura e estilo de código
- [**Coding Standards**](CODING-STANDARDS.md) — Padrões de código

### Passos Rápidos para Contribuição

1. Fork o repositório
2. Crie uma branch de feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças usando [Conventional Commits](https://www.conventionalcommits.org/)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

## 📄 Licença

TSiJUKEBOX é liberado sob dedicação ao **Domínio Público**.

Veja [LICENSE](../LICENSE) e [CREDITS.md](CREDITS.md) para detalhes completos de autoria e licenciamento.

---

## 🙏 Agradecimentos

| Projeto | Contribuição |
| ------- | ------------ |
| **shadcn/ui** | Biblioteca de componentes UI |
| **Lucide Icons** | Conjunto de ícones |
| **Tailwind CSS** | Framework de estilização |
| **Supabase** | Infraestrutura de backend |
| **Framer Motion** | Animações |
| **Vite** | Build tool |
| **Vitest** | Framework de testes |
| **Playwright** | Testes E2E |

---

<div align="center">

<img src="assets/B0.y_Z4kr14-v3.png" alt="B0.y_Z4kr14" width="80" style="border-radius: 50%;">

**Desenvolvido por [B0.y_Z4kr14](https://github.com/B0yZ4kr14)**

*TSI Telecom*

<br>

**TSiJUKEBOX Enterprise** — *A música, amplificada.*

</div>
