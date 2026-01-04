#!/usr/bin/env python3
"""
TSiJUKEBOX - Gerador de Documentações Faltantes
================================================

Este script gera automaticamente os 25 arquivos .md de documentação
faltantes, preenchendo-os com templates básicos para cada categoria.

Categorias:
- Componentes do Player (5)
- Guias de Desenvolvimento (4)
- Guias de Deploy (5)
- Guias de Performance (4)
- Guias de Acessibilidade (4)
- Guias de Testes (3)

Uso:
    python3 generate-missing-docs.py [--dry-run] [--force]

Opções:
    --dry-run   Mostra o que seria criado sem criar os arquivos
    --force     Sobrescreve arquivos existentes
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

# Configuração
DOCS_DIR = Path(__file__).parent.parent / "docs"
DATE_TODAY = datetime.now().strftime("%d/%m/%Y")

# Cores para output
class Colors:
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    RESET = "\033[0m"
    BOLD = "\033[1m"

def print_header():
    """Imprime o cabeçalho do script."""
    print(f"""
{Colors.CYAN}{Colors.BOLD}╔══════════════════════════════════════════════════════════════╗
║     TSiJUKEBOX - Gerador de Documentações Faltantes          ║
║                        v1.0.0                                 ║
╚══════════════════════════════════════════════════════════════╝{Colors.RESET}
""")

# Templates por categoria
TEMPLATES: Dict[str, str] = {
    "player_component": """# {title}

> **Última Atualização:** {date}  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

O componente `{component_name}` é responsável por {description}.

---

## 🎯 Propósito

{purpose}

---

## 📦 Importação

```tsx
import {{ {component_name} }} from '@/components/player/{component_name}';
```

---

## 🔧 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `className` | `string` | `""` | Classes CSS adicionais |
| `disabled` | `boolean` | `false` | Desabilita o componente |

---

## 💻 Uso Básico

```tsx
import {{ {component_name} }} from '@/components/player/{component_name}';

function MyPlayer() {{
  return (
    <{component_name} />
  );
}}
```

---

## 🎨 Variantes

### Padrão

```tsx
<{component_name} />
```

### Com Customização

```tsx
<{component_name} className="custom-class" />
```

---

## ♿ Acessibilidade

- Suporte a navegação por teclado
- Atributos ARIA apropriados
- Compatível com leitores de tela

---

## 🔗 Componentes Relacionados

- [PlayerControls](PLAYER_CONTROLS.md)
- [NowPlaying](NOW_PLAYING.md)
- [VolumeSlider](VOLUME_SLIDER.md)
- [ProgressBar](PROGRESS_BAR.md)
- [Queue](QUEUE.md)

---

## 📚 Referências

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
""",

    "dev_guide": """# {title}

> **Última Atualização:** {date}  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

{description}

---

## 🎯 Objetivo

{purpose}

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Fluxo de Trabalho](#fluxo-de-trabalho)
4. [Boas Práticas](#boas-práticas)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Git
- Editor de código (VS Code recomendado)

---

## ⚙️ Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/B0yZ4kr14/tsijukebox.git
cd tsijukebox
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

---

## 🔄 Fluxo de Trabalho

{workflow}

---

## ✅ Boas Práticas

1. **Commits Semânticos:** Use o padrão Conventional Commits
2. **Code Review:** Todas as alterações devem passar por review
3. **Testes:** Escreva testes para novas funcionalidades
4. **Documentação:** Atualize a documentação quando necessário

---

## 🐛 Troubleshooting

### Problema Comum 1

**Sintoma:** Descrição do problema

**Solução:**
```bash
# Comando para resolver
```

---

## 🔗 Recursos Relacionados

- [Guia do Desenvolvedor](../DEVELOPER-GUIDE.md)
- [Padrões de Código](../CODING-STANDARDS.md)
- [Como Contribuir](../CONTRIBUTING.md)
""",

    "deploy_guide": """# {title}

> **Última Atualização:** {date}  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

{description}

---

## 🎯 Objetivo

{purpose}

---

## 📚 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração](#configuração)
3. [Deploy](#deploy)
4. [Verificação](#verificação)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

{prerequisites}

---

## ⚙️ Configuração

### Passo 1: Preparar o Ambiente

{config_step_1}

### Passo 2: Configurar Variáveis

{config_step_2}

---

## 🚀 Deploy

### Método 1: Deploy Automatizado

```bash
{deploy_command}
```

### Método 2: Deploy Manual

{manual_deploy}

---

## ✅ Verificação

Após o deploy, verifique:

1. [ ] Aplicação está acessível
2. [ ] Logs não mostram erros
3. [ ] Funcionalidades principais funcionam
4. [ ] SSL está configurado (se aplicável)

---

## 🐛 Troubleshooting

### Problema: Aplicação não inicia

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
```bash
# Verificar variáveis
env | grep VITE_
```

---

## 🔗 Recursos Relacionados

- [Guia de Deploy](../PRODUCTION-DEPLOY.md)
- [Monitoramento](../MONITORING.md)
- [Configuração](../CONFIGURATION.md)
""",

    "performance_guide": """# {title}

> **Última Atualização:** {date}  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

{description}

---

## 🎯 Objetivo

{purpose}

---

## 📊 Métricas Alvo

| Métrica | Atual | Meta | Status |
|---------|-------|------|--------|
| LCP | - | < 2.5s | 📅 |
| FID | - | < 100ms | 📅 |
| CLS | - | < 0.1 | 📅 |
| Bundle Size | - | < 500KB | 📅 |

---

## 🔧 Técnicas de Otimização

### 1. {technique_1}

{technique_1_description}

```tsx
{technique_1_code}
```

### 2. {technique_2}

{technique_2_description}

---

## 📈 Ferramentas de Análise

- **Lighthouse:** Análise de performance
- **Bundle Analyzer:** Análise de bundle
- **React DevTools:** Profiling de componentes

---

## ✅ Checklist de Performance

- [ ] Imagens otimizadas
- [ ] Code splitting implementado
- [ ] Lazy loading para rotas
- [ ] Cache configurado
- [ ] Compressão habilitada

---

## 🔗 Recursos Relacionados

- [Otimização de Cards](../CARD_SYSTEM_OPTIMIZATIONS.md)
- [Design System](../DESIGN-SYSTEM.md)
""",

    "a11y_guide": """# {title}

> **Última Atualização:** {date}  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

{description}

---

## 🎯 Objetivo

{purpose}

---

## 📚 Índice

1. [Princípios](#princípios)
2. [Implementação](#implementação)
3. [Testes](#testes)
4. [Checklist](#checklist)

---

## 🌟 Princípios

### WCAG 2.1 - Nível AA

O TSiJUKEBOX segue as diretrizes WCAG 2.1 nível AA:

1. **Perceptível:** Informação apresentada de forma que todos possam perceber
2. **Operável:** Interface navegável por todos
3. **Compreensível:** Informação e operação compreensíveis
4. **Robusto:** Conteúdo interpretável por tecnologias assistivas

---

## 💻 Implementação

### Atributos ARIA

```tsx
<button
  aria-label="Reproduzir música"
  aria-pressed={{isPlaying}}
  role="button"
>
  <PlayIcon />
</button>
```

### Navegação por Teclado

| Tecla | Ação |
|-------|------|
| `Tab` | Navegar entre elementos |
| `Enter` | Ativar elemento |
| `Space` | Alternar estado |
| `Escape` | Fechar modal |

---

## 🧪 Testes

### Ferramentas Recomendadas

- **axe DevTools:** Extensão do Chrome para testes de acessibilidade
- **WAVE:** Ferramenta online de avaliação
- **Lighthouse:** Auditoria de acessibilidade

### Teste Manual

1. Navegue usando apenas o teclado
2. Teste com leitor de tela (NVDA, VoiceOver)
3. Verifique contraste de cores

---

## ✅ Checklist de Acessibilidade

- [ ] Todos os elementos interativos têm `aria-label`
- [ ] Imagens têm texto alternativo (`alt`)
- [ ] Contraste de cores adequado (4.5:1)
- [ ] Navegação por teclado funcional
- [ ] Foco visível em todos os elementos
- [ ] Formulários têm labels associados

---

## 🔗 Recursos Relacionados

- [Guia de Acessibilidade](../ACCESSIBILITY.md)
- [Design System](../DESIGN-SYSTEM.md)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
""",

    "testing_guide": """# {title}

> **Última Atualização:** {date}  
> **Versão:** 1.0.0  
> **Status:** 📝 Em Desenvolvimento

---

## 📋 Visão Geral

{description}

---

## 🎯 Objetivo

{purpose}

---

## 📚 Índice

1. [Configuração](#configuração)
2. [Estrutura](#estrutura)
3. [Exemplos](#exemplos)
4. [Boas Práticas](#boas-práticas)

---

## ⚙️ Configuração

### Dependências

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### Configuração do Vitest

```typescript
// vitest.config.ts
import {{ defineConfig }} from 'vitest/config';

export default defineConfig({{
  test: {{
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  }},
}});
```

---

## 📁 Estrutura de Testes

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── hooks/
│   └── __tests__/
│       └── usePlayer.test.ts
└── test/
    ├── setup.ts
    └── __mocks__/
```

---

## 💻 Exemplos

### Teste de Componente

```tsx
import {{ render, screen }} from '@testing-library/react';
import {{ Button }} from './Button';

describe('Button', () => {{
  it('deve renderizar corretamente', () => {{
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  }});
}});
```

### Teste de Hook

```tsx
import {{ renderHook, act }} from '@testing-library/react';
import {{ useCounter }} from './useCounter';

describe('useCounter', () => {{
  it('deve incrementar o contador', () => {{
    const {{ result }} = renderHook(() => useCounter());
    act(() => {{
      result.current.increment();
    }});
    expect(result.current.count).toBe(1);
  }});
}});
```

---

## ✅ Boas Práticas

1. **Teste comportamento, não implementação**
2. **Use data-testid para seletores estáveis**
3. **Mantenha testes independentes**
4. **Evite mocks excessivos**
5. **Escreva testes legíveis**

---

## 📊 Cobertura de Código

```bash
# Executar testes com cobertura
npm run test:coverage
```

### Metas de Cobertura

| Categoria | Meta |
|-----------|------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

---

## 🔗 Recursos Relacionados

- [Plano de Testes Completo](TEST_PLAN_COMPLETE.md)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
"""
}

# Definição dos arquivos a serem criados
DOCS_TO_CREATE: List[Tuple[str, str, str, Dict]] = [
    # Componentes do Player
    ("components/PLAYER_CONTROLS.md", "player_component", "PlayerControls", {
        "title": "PlayerControls",
        "component_name": "PlayerControls",
        "description": "gerenciar os controles de reprodução de mídia (play, pause, skip, etc.)",
        "purpose": "Fornecer uma interface intuitiva para controlar a reprodução de músicas, incluindo botões de play/pause, anterior, próximo e shuffle."
    }),
    ("components/NOW_PLAYING.md", "player_component", "NowPlaying", {
        "title": "NowPlaying",
        "component_name": "NowPlaying",
        "description": "exibir informações sobre a música atualmente em reprodução",
        "purpose": "Mostrar ao usuário detalhes da música atual, incluindo título, artista, álbum e capa."
    }),
    ("components/VOLUME_SLIDER.md", "player_component", "VolumeSlider", {
        "title": "VolumeSlider",
        "component_name": "VolumeSlider",
        "description": "controlar o volume de reprodução",
        "purpose": "Permitir que o usuário ajuste o volume de forma intuitiva através de um slider."
    }),
    ("components/PROGRESS_BAR.md", "player_component", "ProgressBar", {
        "title": "ProgressBar",
        "component_name": "ProgressBar",
        "description": "exibir e controlar o progresso da reprodução",
        "purpose": "Mostrar o progresso atual da música e permitir que o usuário navegue para diferentes partes da faixa."
    }),
    ("components/QUEUE.md", "player_component", "Queue", {
        "title": "Queue (Fila de Reprodução)",
        "component_name": "QueuePanel",
        "description": "gerenciar a fila de reprodução de músicas",
        "purpose": "Exibir e gerenciar a lista de músicas na fila, permitindo reordenação e remoção."
    }),
    
    # Guias de Desenvolvimento
    ("guides/GETTING_STARTED_DEV.md", "dev_guide", "Getting Started (Dev)", {
        "title": "Getting Started para Desenvolvedores",
        "description": "Este guia ajuda novos desenvolvedores a configurar o ambiente de desenvolvimento do TSiJUKEBOX.",
        "purpose": "Fornecer um onboarding rápido e eficiente para novos contribuidores.",
        "workflow": """
1. Fork o repositório
2. Clone localmente
3. Instale dependências
4. Configure variáveis de ambiente
5. Execute o servidor de desenvolvimento
6. Faça suas alterações
7. Execute os testes
8. Crie um Pull Request
"""
    }),
    ("guides/GIT_WORKFLOW.md", "dev_guide", "Git Workflow", {
        "title": "Git Workflow",
        "description": "Este guia descreve o fluxo de trabalho Git utilizado no projeto TSiJUKEBOX.",
        "purpose": "Padronizar o uso do Git para garantir um histórico limpo e colaboração eficiente.",
        "workflow": """
### Branches

- `main`: Branch principal, sempre estável
- `develop`: Branch de desenvolvimento
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `docs/*`: Atualizações de documentação

### Fluxo

1. Crie uma branch a partir de `develop`
2. Faça commits semânticos
3. Abra um Pull Request
4. Aguarde review
5. Merge após aprovação
"""
    }),
    ("guides/PR_TEMPLATE.md", "dev_guide", "PR Template", {
        "title": "Template de Pull Request",
        "description": "Template padrão para Pull Requests no projeto TSiJUKEBOX.",
        "purpose": "Garantir que todos os PRs contenham informações necessárias para review.",
        "workflow": """
## Descrição

Descreva as alterações feitas neste PR.

## Tipo de Mudança

- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Self-review realizado
"""
    }),
    ("guides/ISSUE_TEMPLATE.md", "dev_guide", "Issue Template", {
        "title": "Template de Issue",
        "description": "Templates padrão para Issues no projeto TSiJUKEBOX.",
        "purpose": "Garantir que issues contenham informações suficientes para triagem e resolução.",
        "workflow": """
## Bug Report

### Descrição
Descrição clara do bug.

### Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

### Comportamento Esperado
O que deveria acontecer.

### Screenshots
Se aplicável.

---

## Feature Request

### Descrição
Descrição da funcionalidade desejada.

### Motivação
Por que essa funcionalidade seria útil?
"""
    }),
    
    # Guias de Deploy
    ("deployment/DOCKER_DEPLOY.md", "deploy_guide", "Docker Deploy", {
        "title": "Deploy com Docker",
        "description": "Guia para deploy do TSiJUKEBOX usando Docker.",
        "purpose": "Facilitar o deploy em qualquer ambiente usando containers Docker.",
        "prerequisites": "- Docker 20.10+\n- Docker Compose 2.0+\n- 2GB RAM mínimo",
        "config_step_1": "```bash\n# Clone o repositório\ngit clone https://github.com/B0yZ4kr14/tsijukebox.git\ncd tsijukebox\n```",
        "config_step_2": "```bash\n# Configure variáveis de ambiente\ncp .env.example .env\nnano .env\n```",
        "deploy_command": "docker-compose up -d",
        "manual_deploy": "```bash\n# Build da imagem\ndocker build -t tsijukebox .\n\n# Executar container\ndocker run -d -p 3000:3000 tsijukebox\n```"
    }),
    ("deployment/KIOSK_DEPLOY.md", "deploy_guide", "Kiosk Deploy", {
        "title": "Deploy em Modo Kiosk",
        "description": "Guia para deploy do TSiJUKEBOX em modo kiosk (tela cheia dedicada).",
        "purpose": "Configurar o sistema para uso em terminais dedicados ou displays públicos.",
        "prerequisites": "- Raspberry Pi 4 ou PC dedicado\n- CachyOS/Arch Linux\n- Openbox\n- Chromium",
        "config_step_1": "```bash\n# Instalar dependências\nsudo pacman -S openbox chromium xorg-server\n```",
        "config_step_2": "```bash\n# Configurar autologin\nsudo systemctl edit getty@tty1.service\n```",
        "deploy_command": "./scripts/unified-installer.py --mode kiosk",
        "manual_deploy": "Veja a seção de configuração manual do Openbox."
    }),
    ("deployment/CLOUD_DEPLOY.md", "deploy_guide", "Cloud Deploy", {
        "title": "Deploy em Cloud",
        "description": "Guia para deploy do TSiJUKEBOX em provedores de cloud (Vercel, Netlify, etc.).",
        "purpose": "Facilitar o deploy em plataformas de cloud para acesso público.",
        "prerequisites": "- Conta no provedor de cloud\n- Repositório GitHub configurado\n- Variáveis de ambiente",
        "config_step_1": "```bash\n# Vercel\nnpx vercel\n```",
        "config_step_2": "Configure as variáveis de ambiente no dashboard do provedor.",
        "deploy_command": "vercel --prod",
        "manual_deploy": "Acesse o dashboard do provedor e conecte o repositório GitHub."
    }),
    ("deployment/SSL_SETUP.md", "deploy_guide", "SSL Setup", {
        "title": "Configuração de SSL/TLS",
        "description": "Guia para configurar certificados SSL/TLS no TSiJUKEBOX.",
        "purpose": "Garantir conexões seguras via HTTPS.",
        "prerequisites": "- Domínio configurado\n- Acesso root ao servidor\n- Certbot instalado",
        "config_step_1": "```bash\n# Instalar Certbot\nsudo pacman -S certbot certbot-nginx\n```",
        "config_step_2": "```bash\n# Obter certificado\nsudo certbot --nginx -d seudominio.com\n```",
        "deploy_command": "sudo certbot --nginx",
        "manual_deploy": "Para certificados self-signed, use:\n```bash\nopenssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout key.pem -out cert.pem\n```"
    }),
    ("deployment/NGINX_CONFIG.md", "deploy_guide", "Nginx Config", {
        "title": "Configuração do Nginx",
        "description": "Guia para configurar o Nginx como reverse proxy para o TSiJUKEBOX.",
        "purpose": "Otimizar a entrega de conteúdo e gerenciar conexões.",
        "prerequisites": "- Nginx instalado\n- Certificado SSL (opcional)\n- Acesso root",
        "config_step_1": "```bash\n# Instalar Nginx\nsudo pacman -S nginx\n```",
        "config_step_2": "```nginx\n# /etc/nginx/sites-available/tsijukebox\nserver {\n    listen 80;\n    server_name midiaserver.local;\n    location / {\n        proxy_pass http://localhost:3000;\n    }\n}\n```",
        "deploy_command": "sudo systemctl restart nginx",
        "manual_deploy": "Edite o arquivo de configuração manualmente e reinicie o Nginx."
    }),
    
    # Guias de Performance
    ("performance/OPTIMIZATION.md", "performance_guide", "Optimization", {
        "title": "Guia de Otimização",
        "description": "Guia completo de otimização de performance para o TSiJUKEBOX.",
        "purpose": "Garantir uma experiência rápida e fluida para os usuários.",
        "technique_1": "Code Splitting",
        "technique_1_description": "Divida o código em chunks menores para carregamento sob demanda.",
        "technique_1_code": "const Player = lazy(() => import('./components/Player'));",
        "technique_2": "Memoização",
        "technique_2_description": "Use `useMemo` e `useCallback` para evitar re-renders desnecessários."
    }),
    ("performance/BUNDLE_SIZE.md", "performance_guide", "Bundle Size", {
        "title": "Análise de Bundle Size",
        "description": "Guia para análise e otimização do tamanho do bundle.",
        "purpose": "Reduzir o tempo de carregamento inicial da aplicação.",
        "technique_1": "Tree Shaking",
        "technique_1_description": "Remova código não utilizado automaticamente.",
        "technique_1_code": "// Importe apenas o necessário\nimport { Button } from '@/components/ui';",
        "technique_2": "Análise com Bundle Analyzer",
        "technique_2_description": "Use `rollup-plugin-visualizer` para visualizar o bundle."
    }),
    ("performance/LAZY_LOADING.md", "performance_guide", "Lazy Loading", {
        "title": "Lazy Loading",
        "description": "Guia para implementação de lazy loading no TSiJUKEBOX.",
        "purpose": "Carregar recursos apenas quando necessário.",
        "technique_1": "React.lazy",
        "technique_1_description": "Carregue componentes sob demanda.",
        "technique_1_code": "const Settings = lazy(() => import('./pages/Settings'));",
        "technique_2": "Intersection Observer",
        "technique_2_description": "Carregue imagens e conteúdo quando visíveis na viewport."
    }),
    ("performance/CACHING.md", "performance_guide", "Caching", {
        "title": "Estratégias de Cache",
        "description": "Guia para implementação de estratégias de cache no TSiJUKEBOX.",
        "purpose": "Reduzir requisições de rede e melhorar a performance.",
        "technique_1": "Service Worker",
        "technique_1_description": "Cache de assets estáticos com Service Worker.",
        "technique_1_code": "// sw.js\nself.addEventListener('fetch', (event) => {\n  event.respondWith(caches.match(event.request));\n});",
        "technique_2": "React Query",
        "technique_2_description": "Cache de dados de API com React Query."
    }),
    
    # Guias de Acessibilidade
    ("accessibility/WCAG_COMPLIANCE.md", "a11y_guide", "WCAG Compliance", {
        "title": "Conformidade WCAG 2.1",
        "description": "Guia de conformidade com as diretrizes WCAG 2.1 nível AA.",
        "purpose": "Garantir que o TSiJUKEBOX seja acessível a todos os usuários."
    }),
    ("accessibility/ARIA_GUIDE.md", "a11y_guide", "ARIA Guide", {
        "title": "Guia de ARIA",
        "description": "Guia para uso correto de atributos ARIA no TSiJUKEBOX.",
        "purpose": "Melhorar a acessibilidade para usuários de tecnologias assistivas."
    }),
    ("accessibility/KEYBOARD_NAVIGATION.md", "a11y_guide", "Keyboard Navigation", {
        "title": "Navegação por Teclado",
        "description": "Guia de navegação por teclado no TSiJUKEBOX.",
        "purpose": "Garantir que todas as funcionalidades sejam acessíveis via teclado."
    }),
    ("accessibility/SCREEN_READER.md", "a11y_guide", "Screen Reader", {
        "title": "Suporte a Leitores de Tela",
        "description": "Guia de suporte a leitores de tela no TSiJUKEBOX.",
        "purpose": "Garantir compatibilidade com NVDA, VoiceOver e outros leitores de tela."
    }),
    
    # Guias de Testes
    ("testing/UNIT_TESTS.md", "testing_guide", "Unit Tests", {
        "title": "Testes Unitários",
        "description": "Guia para escrita de testes unitários no TSiJUKEBOX.",
        "purpose": "Garantir que componentes e funções individuais funcionem corretamente."
    }),
    ("testing/INTEGRATION_TESTS.md", "testing_guide", "Integration Tests", {
        "title": "Testes de Integração",
        "description": "Guia para escrita de testes de integração no TSiJUKEBOX.",
        "purpose": "Garantir que diferentes partes do sistema funcionem bem juntas."
    }),
    ("testing/E2E_TESTS.md", "testing_guide", "E2E Tests", {
        "title": "Testes End-to-End",
        "description": "Guia para escrita de testes E2E no TSiJUKEBOX.",
        "purpose": "Garantir que fluxos completos de usuário funcionem corretamente."
    }),
]

def generate_doc(template_key: str, params: Dict) -> str:
    """Gera o conteúdo de uma documentação a partir do template."""
    template = TEMPLATES[template_key]
    params["date"] = DATE_TODAY
    return template.format(**params)

def create_doc_file(filepath: Path, content: str, dry_run: bool = False, force: bool = False) -> bool:
    """Cria um arquivo de documentação."""
    if filepath.exists() and not force:
        print(f"{Colors.YELLOW}⚠️  Arquivo já existe: {filepath}{Colors.RESET}")
        return False
    
    if dry_run:
        print(f"{Colors.BLUE}🔍 [DRY-RUN] Criaria: {filepath}{Colors.RESET}")
        return True
    
    # Criar diretório se não existir
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    # Escrever arquivo
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"{Colors.GREEN}✅ Criado: {filepath}{Colors.RESET}")
    return True

def main():
    """Função principal."""
    print_header()
    
    # Parsear argumentos
    dry_run = "--dry-run" in sys.argv
    force = "--force" in sys.argv
    
    if "--help" in sys.argv:
        print(__doc__)
        sys.exit(0)
    
    if dry_run:
        print(f"{Colors.YELLOW}🔍 Modo DRY-RUN ativado - nenhum arquivo será criado{Colors.RESET}\n")
    
    if force:
        print(f"{Colors.YELLOW}⚠️  Modo FORCE ativado - arquivos existentes serão sobrescritos{Colors.RESET}\n")
    
    # Estatísticas
    created = 0
    skipped = 0
    errors = 0
    
    print(f"{Colors.CYAN}📝 Gerando {len(DOCS_TO_CREATE)} documentações...{Colors.RESET}\n")
    
    for filepath, template_key, name, params in DOCS_TO_CREATE:
        full_path = DOCS_DIR / filepath
        
        try:
            content = generate_doc(template_key, params)
            if create_doc_file(full_path, content, dry_run, force):
                created += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"{Colors.RED}❌ Erro ao criar {filepath}: {e}{Colors.RESET}")
            errors += 1
    
    # Resumo
    print(f"""
{Colors.CYAN}{Colors.BOLD}═══════════════════════════════════════════════════════════════
                         RESUMO
═══════════════════════════════════════════════════════════════{Colors.RESET}

{Colors.GREEN}✅ Criados:  {created}{Colors.RESET}
{Colors.YELLOW}⚠️  Pulados:  {skipped}{Colors.RESET}
{Colors.RED}❌ Erros:    {errors}{Colors.RESET}

{Colors.CYAN}Total:       {len(DOCS_TO_CREATE)}{Colors.RESET}
""")
    
    if not dry_run and created > 0:
        print(f"{Colors.GREEN}🎉 Documentações geradas com sucesso!{Colors.RESET}")
        print(f"{Colors.CYAN}📁 Diretório: {DOCS_DIR}{Colors.RESET}")

if __name__ == "__main__":
    main()
