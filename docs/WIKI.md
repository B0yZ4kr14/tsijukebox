# TSiJUKEBOX - Wiki Completa

**Versão:** 4.2.1  
**Última Atualização:** 24/12/2024  
**Status:** 100% Completo ✅

---

## 🎯 Visão Geral

O TSiJUKEBOX é um sistema completo de jukebox digital com suporte a múltiplas fontes de música, modo karaokê, controle por voz e interface kiosk. Esta Wiki contém toda a documentação necessária para instalar, configurar, desenvolver e manter o sistema.

---

## 📚 Índice Geral

### 🚀 Guias Principais
- [Guia de Introdução](guides/GETTING_STARTED.md) - Comece a usar o TSiJUKEBOX rapidamente.
- [Guia do Desenvolvedor](guides/DEVELOPER_GUIDE.md) - Detalhes da arquitetura e como contribuir.
- [Guia de Deploy](guides/DEPLOYMENT_GUIDE.md) - Implantação em ambientes de produção.

### ⚙️ Configuração
- [Configuração Geral](CONFIGURATION.md) - Todas as opções de configuração
- [Banco de Dados](wiki/Config-Database.md) - SQLite, MariaDB, PostgreSQL
- [Temas](wiki/Config-Themes.md) - Personalização visual
- [Acessibilidade](wiki/Config-Accessibility.md) - Configurações de acessibilidade
- [Cloud Backup](wiki/Config-Cloud-Backup.md) - Backup na nuvem
- [Shell (Fish)](wiki/Shell-Configuration.md) - Configuração do Fish Shell

### 🗄️ Bancos de Dados
- [SQLite](database/SQLITE.md) - Banco de dados padrão (embarcado)
- [MariaDB/MySQL](database/MARIADB_MYSQL.md) - Banco de dados cliente-servidor
- [PostgreSQL](database/POSTGRESQL.md) - Banco de dados avançado
- [Firebird](database/FIREBIRD.md) - Banco de dados leve e flexível
- [Migrações](database/MIGRATIONS.md) - Sistema de migrações
- [Comparação Técnica](database/COMPARISON.md) - Análise comparativa de escalabilidade e migração

### 🎵 Integrações de Música
- [Spotify](integrations/SPOTIFY_API.md) - Integração com Spotify
- [YouTube Music](integrations/YOUTUBE_API.md) - Integração com YouTube Music
- [Arquivos Locais](integrations/LOCAL_FILES.md) - Reprodução de arquivos locais

### 🎤 Recursos Avançados
- [Modo Karaokê](hooks/USEKARAOKE.md) - Como usar o modo karaokê
- [Controle por Voz](hooks/USEVOICECONTROL.md) - Comandos de voz

### 👥 Guias do Usuário
- [Guia Básico](wiki/User-Guide-Basic.md) - Uso básico do sistema
- [Guia Avançado](wiki/User-Guide-Advanced.md) - Recursos avançados
- [Guia do Administrador](wiki/User-Guide-Admin.md) - Administração do sistema

---

## 🛠️ Desenvolvimento

### 📐 Arquitetura
- [Arquitetura Geral](ARCHITECTURE.md) - Visão geral da arquitetura
- [Análise de Arquitetura](ARCHITECTURE-ANALYSIS.md) - Análise detalhada
- [Mapa do Projeto](PROJECT-MAP.md) - Estrutura de diretórios
- [Arquitetura de Hooks](HOOKS-ARCHITECTURE.md) - Sistema de hooks
- [Rotas](ROUTES.md) - Sistema de roteamento

### 🎨 Design System
- [Design System](DESIGN-SYSTEM.md) - Sistema de design completo
- [Migração do Design System](DESIGN_SYSTEM_MIGRATION_GUIDE.md) - Guia de migração
- [Componentes de Marca](BRAND-COMPONENTS.md) - Logo, cores, tipografia
- [Ícones das Seções](assets/icons/README.md) - 8 ícones modernos
- [Mockups](assets/mockups/README.md) - Mockups de alta fidelidade

### 🧩 Componentes
- [GlobalSidebar](components/GLOBAL_SIDEBAR.md) - Sidebar principal
- [Header & Layout](components/HEADER_AND_LAYOUT.md) - Header e MainLayout
- [Card System](components/CARD_SYSTEM.md) - Sistema de cards
- [Modal System](components/MODAL_SYSTEM.md) - Sistema de modais
- [Toast System](components/TOAST_SYSTEM.md) - Sistema de notificações
- [Button System](components/BUTTON_SYSTEM.md) - Botões e variantes

#### Player
- [PlayerControls](components/PLAYER_CONTROLS.md) - Controles do player
- [NowPlaying](components/NOW_PLAYING.md) - Exibição da música atual
- [VolumeSlider](components/VOLUME_SLIDER.md) - Controle de volume
- [ProgressBar](components/PROGRESS_BAR.md) - Barra de progresso
- [Queue](components/QUEUE.md) - Fila de reprodução

### 🪝 Hooks
- [useQueue](hooks/USEQUEUE.md) - Hook da fila
- [useSpotify](hooks/USESPOTIFY.md) - Hook do Spotify
- [useYouTube](hooks/USEYOUTUBE.md) - Hook do YouTube Music
- [useKaraoke](hooks/USEKARAOKE.md) - Hook do karaokê
- [useVoiceControl](hooks/USEVOICECONTROL.md) - Hook de controle por voz
- [useSettings](hooks/USESETTINGS.md) - Hook de configurações
- [useTheme](hooks/USETHEME.md) - Hook de temas

### 🌐 Contextos
- [AuthContext](contexts/AUTHCONTEXT.md) - Contexto de autenticação
- [PlayerContext](contexts/PLAYERCONTEXT.md) - Contexto do player
- [QueueContext](contexts/QUEUECONTEXT.md) - Contexto da fila
- [LayoutContext](contexts/LAYOUTCONTEXT.md) - Contexto do layout
- [ThemeContext](contexts/THEMECONTEXT.md) - Contexto de temas

### 🔌 Integrações

#### Música e Mídia
- [Spotify API](integrations/SPOTIFY_API.md) - Integração com a API do Spotify
- [YouTube API](integrations/YOUTUBE_API.md) - Integração com a API do YouTube
- [Arquivos Locais](integrations/LOCAL_FILES.md) - Integração com o sistema de arquivos local

#### Cloud Storage
- [Storj](integrations/STORJ_API.md) - Armazenamento descentralizado
- [Google Drive](integrations/GOOGLE_DRIVE_API.md) - Backup via Google Drive
- [OneDrive](integrations/ONEDRIVE_API.md) - Backup via OneDrive
- [Dropbox](integrations/DROPBOX_API.md) - Backup via Dropbox
- [MEGA](integrations/MEGA_API.md) - Backup via MEGA.nz

#### Monitoramento e Alertas
- [Prometheus](integrations/PROMETHEUS_API.md) - Métricas e monitoramento
- [Grafana API](integrations/GRAFANA_API.md) - Dashboards e visualização
- [Discord Webhooks](integrations/DISCORD_WEBHOOKS.md) - Alertas via Discord

#### Backend e Infraestrutura
- [Supabase API](integrations/SUPABASE_API.md) - Backend as a Service
- [GitHub Integration](integrations/GITHUB_INTEGRATION.md) - CI/CD e sincronização

### 📄 Páginas
- [Dashboard](pages/DASHBOARD_PAGE.md) - Página do Dashboard
- [Player](pages/PLAYER_PAGE.md) - Página do Player
- [Settings](pages/SETTINGS_PAGE.md) - Página de Configurações
- [Help](pages/HELP_PAGE.md) - Página de Ajuda
- [Wiki](pages/WIKI_PAGE.md) - Página da Wiki
- [SetupWizard](pages/SETUPWIZARD_PAGE.md) - Página do SetupWizard

### 🧪 Testes
- [Guia de Testes](TESTING.md) - Guia geral de testes
- [Testes Unitários](testing/UNIT_TESTS.md) - Padrões de testes unitários
- [Testes de Integração](testing/INTEGRATION_TESTS.md) - Testes de integração
- [Testes E2E](testing/E2E_TESTS.md) - Testes end-to-end
- [Relatório de Cobertura](TEST-COVERAGE-REPORT.md) - Análise de cobertura
- [Testes Python](PYTHON_TESTING.md) - Testes do backend Python

### 📚 Guias de Desenvolvimento
- [Guia do Desenvolvedor](DEVELOPER-GUIDE.md) - Guia completo
- [Getting Started (Dev)](guides/GETTING_STARTED_DEV.md) - Onboarding de desenvolvedores
- [Padrões de Código](CODING-STANDARDS.md) - Code style guide
- [Git Workflow](guides/GIT_WORKFLOW.md) - Fluxo de trabalho Git
- [Como Contribuir](CONTRIBUTING.md) - Guia de contribuição
- [Template de PR](guides/PR_TEMPLATE.md) - Template de Pull Request
- [Template de Issue](guides/ISSUE_TEMPLATE.md) - Template de Issue

---

## 🚀 Deploy & Produção

### 🐳 Docker
- [Deploy com Docker](deployment/DOCKER_DEPLOY.md) - Deployment Docker
- [Kiosk Deploy](deployment/KIOSK_DEPLOY.md) - Deploy em modo kiosk
- [Docker Compose](PRODUCTION-DEPLOY.md) - Produção com Docker Compose

### ☁️ Cloud
- [Deploy em Cloud](deployment/CLOUD_DEPLOY.md) - Vercel, Netlify, etc.
- [SSL/TLS Setup](deployment/SSL_SETUP.md) - Configuração SSL
- [Nginx Config](deployment/NGINX_CONFIG.md) - Configuração Nginx

### 📊 Monitoramento
- [Monitoramento](MONITORING.md) - Sistema de monitoramento
- [Prometheus](integrations/PROMETHEUS_API.md) - Coleta de métricas
- [Grafana Setup](GRAFANA-SETUP.md) - Configuração do Grafana
- [Logs](LOGGER.md) - Sistema de logs

---

## ⚡ Performance & Otimização

### 🎯 Performance
- [Otimização](performance/OPTIMIZATION.md) - Guia de otimização
- [Bundle Size](performance/BUNDLE_SIZE.md) - Análise de bundle
- [Card System Optimizations](CARD_SYSTEM_OPTIMIZATIONS.md) - Otimizações de cards
- [Lazy Loading](performance/LAZY_LOADING.md) - Code splitting
- [Caching](performance/CACHING.md) - Estratégias de cache

### ♿ Acessibilidade
- [Acessibilidade](ACCESSIBILITY.md) - Guia geral
- [WCAG Compliance](accessibility/WCAG_COMPLIANCE.md) - Conformidade WCAG 2.1 AA
- [ARIA Guide](accessibility/ARIA_GUIDE.md) - Guia de ARIA
- [Navegação por Teclado](accessibility/KEYBOARD_NAVIGATION.md) - Atalhos de teclado
- [Screen Reader](accessibility/SCREEN_READER.md) - Suporte a leitores de tela

---

## 📖 Referências

### 📋 APIs
- [API Reference](API-REFERENCE.md) - Referência completa da API
- [Backend Endpoints](BACKEND-ENDPOINTS.md) - Endpoints do backend
- [Dev API Reference](wiki/Dev-API-Reference.md) - API para desenvolvedores

### 📦 Dependências e Ferramentas
- [Dependencies Reference](wiki/Dependencies-Reference.md) - Referência de dependências
- [Dependencies Audit](DEPENDENCIES-AUDIT.md) - Auditoria de dependências
- [Developer Tools](tooling/DEVELOPER_TOOLS.md) - Scripts e ferramentas de desenvolvimento
- [AUR Publishing](AUR-PUBLISHING.md) - Publicação no AUR

### 🔐 Segurança
- [Segurança](SECURITY.md) - Guia de segurança
- [CI/CD](CI-CD.md) - Pipeline de CI/CD
- [GitHub Integration](integrations/GITHUB_INTEGRATION.md) - Integração com GitHub

---

## 📝 Outros

### 📜 Documentação do Projeto
- [README](README.md) - README principal
- [Changelog](CHANGELOG.md) - Histórico de mudanças
- [Glossário](GLOSSARY.md) - Termos e definições
- [Créditos](CREDITS.md) - Créditos e agradecimentos

### 🔧 Utilitários
- [Auto Sync](AUTO-SYNC.md) - Sincronização automática
- [Plugins](PLUGINS.md) - Sistema de plugins
- [Troubleshooting](TROUBLESHOOTING.md) - Resolução de problemas

### 📊 Análises
- [Análise de Gaps](ANALYSIS-GAPS.md) - Gaps identificados
- [Plano de Implementação 100%](IMPLEMENTATION-PLAN-100.md) - Plano completo
- [Validação do Frontend](FRONTEND-VALIDATION-FINAL.md) - Validação final

### 🏗️ ADRs (Architecture Decision Records)
- [ADR Index](adr/README.md) - Índice de ADRs
- [ADR-0001: Estrutura do Repositório](adr/ADR-0001-repository-structure.md)
- [ADR-0002: Prioridades de Refatoração](adr/ADR-0002-refactoring-priorities.md)

---

## 🎯 Plano de Implementação

### Sprint 1 (Concluído ✅)
- Logger Service
- Testes de Player
- Auth.tsx aprimorado
- Modal System
- Toast System

### Sprint 2 (Em Andamento 🔄)
- Form Components
- Data Table
- YouTube Music API
- Migração de console.log

### Sprint 3 (Planejado 📅)
- Voice Control completo
- WebSocket real-time
- Performance optimization

### Sprint 4 (Planejado 📅)
- Acessibilidade 100%
- i18n completo
- Documentação final

---

## 📊 Métricas Atuais

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| Arquivos | 607 | - | - |
| Linhas de Código | 137,895 | - | - |
| Cobertura de Testes | 25% | 80% | 🔄 |
| Componentes UI | 90% | 100% | 🔄 |
| Documentação | 85% | 100% | 🔄 |
| Acessibilidade | 60% | 100% | 📅 |
| i18n | 60% | 100% | 📅 |
| Performance | 70% | 95% | 📅 |

---

## 🤝 Contribuindo

Quer contribuir com o TSiJUKEBOX? Veja nosso [Guia de Contribuição](CONTRIBUTING.md) e [Guia do Desenvolvedor](DEVELOPER-GUIDE.md).

---

## 📞 Suporte

- **Issues:** [GitHub Issues](https://github.com/B0yZ4kr14/tsijukebox/issues)
- **Discussões:** [GitHub Discussions](https://github.com/B0yZ4kr14/tsijukebox/discussions)
- **Email:** suporte@tsijukebox.com

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](../LICENSE).

---

**Última atualização:** 24/12/2024  
**Versão da Wiki:** 1.0.0  
**Mantido por:** TSiJUKEBOX Team
