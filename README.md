<div align="center">
  <img src="public/logo/tsijukebox-logo.svg" alt="TSiJUKEBOX" width="400">
  
  # TSiJUKEBOX Enterprise
  
  **Sistema Kiosk Musical PWA com Integração Spotify/YouTube Music**
  
  [![GitHub](https://img.shields.io/badge/GitHub-TSiJUKEBOX-181717?style=flat-square&logo=github)](https://github.com/B0yZ4kr14/TSiJUKEBOX)
  ![Version](https://img.shields.io/badge/version-4.0.0-blue?style=flat-square)
  ![License](https://img.shields.io/badge/license-Public_Domain-green?style=flat-square)
  ![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite)
  ![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat-square&logo=tailwindcss)
  ![WCAG](https://img.shields.io/badge/WCAG-2.1_AA-green?style=flat-square&logo=accessibility)
  ![Contrast](https://img.shields.io/badge/contrast-4.5:1+-brightgreen?style=flat-square)
  
  <!-- Dynamic Coverage Badges (updated by CI) -->
  ![Coverage](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/coverage.json&style=flat-square)
  ![Unit Tests](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/unit-tests.json&style=flat-square)
  ![E2E Tests](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/e2e-tests.json&style=flat-square)
  ![Tests Status](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/status.json&style=flat-square)
  
  [📖 Documentação](docs/README.md) •
  [🚀 Quick Start](docs/GETTING-STARTED.md) •
  [🤝 Contribuir](docs/CONTRIBUTING.md) •
  [📜 Licença](LICENSE)
</div>

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
| ♿ **WCAG 2.1 AA** | Acessibilidade validada com 13 exceções documentadas | ✅ |
| 🌤️ **Weather Widget** | Previsão do tempo integrada | ✅ |
| 🔍 **Global Search** | Busca unificada em todo o sistema | ✅ |
| 🎨 **Brand System** | Componentes de marca com animações (splash, glitch, hologram) | ✅ NEW |
| 🖼️ **Splash Screen** | Tela de carregamento customizável com variantes | ✅ NEW |
| ⌨️ **Typing Animation** | Efeito typewriter no logo para splash screens | ✅ NEW |

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

## 📸 Screenshots

| Player Principal | Kiosk Mode | Configurações |
|------------------|------------|---------------|
| ![Player](docs/screenshots/player.png) | ![Kiosk](docs/screenshots/kiosk.png) | ![Settings](docs/screenshots/settings.png) |

> 💡 *Screenshots serão adicionados em breve*

---

## 🏗️ Stack Tecnológico

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilização** | Tailwind CSS + shadcn/ui |
| **Animações** | Framer Motion + CSS Keyframes (glitch, hologram, cascade) |
| **Backend** | Lovable Cloud (Supabase) |
| **Integrações** | Spotify API, YouTube Music, Spicetify CLI |
| **PWA** | Vite PWA Plugin + Workbox |

---

## 🎨 Brand Components

TSiJUKEBOX inclui um sistema completo de componentes de marca:

### Quick Usage

```tsx
import { BrandLogo, SplashScreen } from '@/components/ui';

// Splash Screen para inicialização
<SplashScreen 
  variant="cyberpunk" 
  logoAnimation="glitch"
  onComplete={() => setLoaded(true)}
/>

// Logo com animação para headers
<BrandLogo 
  size="lg" 
  variant="metal" 
  animate="cascade"
/>
```

Veja o [Design System](docs/DESIGN-SYSTEM.md) e [Brand Components](docs/BRAND-COMPONENTS.md) para documentação completa.

---

## ♿ Acessibilidade

Este projeto segue as diretrizes **WCAG 2.1 nível AA**:

- ✅ **13 exceções de contraste documentadas** — [Ver documentação](/wcag-exceptions)
- ✅ **Validação automatizada no CI/CD** — Bloqueia PRs com exceções não documentadas
- ✅ **Auditoria com axe-core** — Verifica rotas principais
- ✅ **Elementos nativos bloqueados** — Usa componentes Radix/Shadcn

### Scripts de Validação

```bash
npm run wcag:validate    # Validar comentários WCAG
npm run a11y:simple      # Auditoria completa
npm run contrast         # Verificação de contraste CSS
```

Consulte [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) para o guia completo.

---

## 🧪 Testes

Este projeto possui cobertura abrangente de testes:

| Tipo | Quantidade | Framework | Cobertura |
|------|------------|-----------|-----------|
| **Unitários** | ~129 | Vitest | Hooks, Contexts, Lib |
| **Componentes** | ~49 | Vitest + RTL | Backup, Auth, Settings |
| **E2E** | ~53 | Playwright | Fluxos críticos |
| **Acessibilidade** | ~10 | axe-core | WCAG 2.1 AA |

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test -- --coverage

# Testes E2E
npx playwright test

# Testes E2E com UI interativa
npx playwright test --ui

# Relatório combinado
node scripts/merge-coverage.js
```

### Relatórios

| Relatório | Localização |
|-----------|-------------|
| Vitest HTML | `coverage/vitest/index.html` |
| Playwright HTML | `playwright-report/index.html` |
| Combinado | `coverage/combined/index.html` |
| Badges | `coverage/combined/badges/` |

### Coverage Threshold

O pipeline CI exige **cobertura mínima de 70%**. Builds falham se a cobertura cair abaixo deste limite.

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [Getting Started](docs/GETTING-STARTED.md) | Primeiros passos |
| [Installation](docs/INSTALLATION.md) | Guia de instalação completo |
| [Developer Guide](docs/DEVELOPER-GUIDE.md) | Guia para desenvolvedores |
| [API Reference](docs/API-REFERENCE.md) | Referência de APIs |
| [Design System](docs/DESIGN-SYSTEM.md) | Sistema de design |
| [GitHub Integration](docs/GITHUB-INTEGRATION.md) | Integração GitHub e CI/CD |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Solução de problemas |
| [Changelog](docs/CHANGELOG.md) | Histórico de versões |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia nosso [Guia de Contribuição](docs/CONTRIBUTING.md) e nosso [Código de Conduta](CODE_OF_CONDUCT.md).

---

## 📄 Licença

Este projeto está sob **Domínio Público** — veja [LICENSE](LICENSE) e [CREDITS](docs/CREDITS.md) para detalhes.

---

<div align="center">
  <sub>Desenvolvido com 💙 e ☕ por <strong>B0.y_Z4kr14</strong></sub>
  <br><br>
  <strong>TSiJUKEBOX Enterprise</strong> — <em>A música, amplificada.</em>
  
  [🐛 Report Bug](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues) · [✨ Request Feature](https://github.com/B0yZ4kr14/TSiJUKEBOX/issues)
</div>
