# GitHub Integration

Este documento descreve a integração do TSiJUKEBOX com o GitHub, incluindo a edge function para acesso à API, configuração de badges dinâmicos e pipeline de CI/CD.

## 📋 Índice

- [Edge Function: github-repo](#edge-function-github-repo)
- [Badges Dinâmicos](#badges-dinâmicos)
- [CI/CD Pipeline](#cicd-pipeline)
- [GitHub Pages](#github-pages)
- [Configuração](#configuração)

---

## Edge Function: github-repo

A edge function `github-repo` fornece acesso seguro à API do GitHub para o repositório TSiJUKEBOX.

### Localização

```
supabase/functions/github-repo/index.ts
```

### Ações Disponíveis

| Ação | Descrição | Exemplo de Uso |
|------|-----------|----------------|
| `contents` | Listar conteúdo de diretório | `{ action: 'contents', path: 'src' }` |
| `tree` | Árvore completa do repositório | `{ action: 'tree' }` |
| `raw` | Conteúdo raw de arquivo | `{ action: 'raw', path: 'README.md' }` |
| `repo-info` | Informações do repositório | `{ action: 'repo-info' }` |
| `commits` | Últimos 10 commits | `{ action: 'commits' }` |
| `releases` | Releases do projeto | `{ action: 'releases' }` |
| `branches` | Lista de branches | `{ action: 'branches' }` |
| `contributors` | Contribuidores | `{ action: 'contributors' }` |
| `languages` | Linguagens do projeto | `{ action: 'languages' }` |

### Exemplo de Chamada

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('github-repo', {
  body: { action: 'repo-info' }
});

if (data?.success) {
  console.log('Repo:', data.data.full_name);
  console.log('Stars:', data.data.stargazers_count);
}
```

### Configuração do Token

A função requer um `GITHUB_ACCESS_TOKEN` configurado nos secrets do Supabase:

1. Acesse [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Crie um token com permissão `repo` (read)
3. Adicione o token nos secrets do Supabase

---

## Badges Dinâmicos

Os badges de cobertura são atualizados automaticamente via GitHub Actions e hospedados no GitHub Pages.

### URLs dos Badges

```markdown
<!-- Coverage -->
![Coverage](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/coverage.json)

<!-- Unit Tests -->
![Unit Tests](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/unit-tests.json)

<!-- E2E Tests -->
![E2E Tests](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/e2e-tests.json)

<!-- Status -->
![Tests Status](https://img.shields.io/endpoint?url=https://B0yZ4kr14.github.io/TSiJUKEBOX/coverage/badges/status.json)
```

### Estrutura dos Badges

Os badges seguem o [Shields.io Endpoint Schema](https://shields.io/endpoint):

```json
{
  "schemaVersion": 1,
  "label": "coverage",
  "message": "85%",
  "color": "brightgreen"
}
```

### Arquivos Gerados

| Arquivo | Descrição |
|---------|-----------|
| `badges/coverage.json` | Cobertura total |
| `badges/unit-tests.json` | Cobertura de testes unitários |
| `badges/e2e-tests.json` | Resultados E2E |
| `badges/status.json` | Status geral (passing/failing) |

---

## CI/CD Pipeline

### Workflow: E2E Tests

**Arquivo:** `.github/workflows/e2e-tests.yml`

#### Triggers

- Push para `main` ou `develop`
- Pull requests para `main`

#### Jobs

1. **Checkout** - Clona o repositório
2. **Setup Node.js** - Configura Node 20 com cache npm
3. **Install Dependencies** - Instala dependências
4. **Run Vitest** - Executa testes unitários com cobertura
5. **Install Playwright** - Instala browsers do Playwright
6. **Run Playwright** - Executa testes E2E
7. **Merge Coverage** - Combina relatórios de cobertura
8. **Check Threshold** - Verifica cobertura mínima (70%)
9. **Upload Artifacts** - Salva relatórios
10. **Deploy to GitHub Pages** - Publica badges (apenas `main`)

#### Threshold de Cobertura

O pipeline falha se a cobertura total cair abaixo de **70%**:

```yaml
- name: Check coverage threshold (70% minimum)
  run: |
    COVERAGE=$(cat coverage/combined/summary.json | jq '.totalCoverage')
    if [ "$COVERAGE" -lt 70 ]; then
      echo "❌ Coverage ($COVERAGE%) below 70% threshold"
      exit 1
    fi
```

---

## GitHub Pages

Os badges são publicados automaticamente no GitHub Pages a cada push para `main`.

### Configuração

1. Acesse **Settings → Pages** no repositório
2. Selecione **Source: Deploy from a branch**
3. Escolha branch: `gh-pages`, folder: `/ (root)`
4. Salve as configurações

### URL Base

```
https://B0yZ4kr14.github.io/TSiJUKEBOX/
```

### Estrutura Publicada

```
coverage/
├── badges/
│   ├── coverage.json
│   ├── unit-tests.json
│   ├── e2e-tests.json
│   └── status.json
├── index.html          # Relatório HTML combinado
├── coverage-report.json
├── summary.json
└── badge.json          # Legacy (compatibilidade)
```

---

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Onde Configurar |
|----------|-----------|-----------------|
| `GITHUB_ACCESS_TOKEN` | Token de acesso à API do GitHub | Supabase Secrets |
| `GITHUB_TOKEN` | Token automático do GitHub Actions | Automático |

### Permissões do Workflow

```yaml
permissions:
  contents: write    # Para push no gh-pages
  pages: write       # Para deploy no GitHub Pages
  id-token: write    # Para autenticação OIDC
```

---

## Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                   B0yZ4kr14/TSiJUKEBOX                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────┐              ┌─────────────────────┐
│   Edge Function  │              │   GitHub Actions    │
│    github-repo   │              │   e2e-tests.yml     │
└────────┬─────────┘              └──────────┬──────────┘
         │                                   │
         │ API calls                         │
         │                                   │
         ▼                                   ▼
┌──────────────────┐              ┌─────────────────────┐
│    Frontend      │              │  merge-coverage.js  │
│   Application    │              │  Generate badges    │
└──────────────────┘              └──────────┬──────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │   GitHub Pages      │
                                  │  /coverage/badges/  │
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │    shields.io       │
                                  │   Dynamic Badges    │
                                  └─────────────────────┘
```

---

## Troubleshooting

### Badge não atualiza

1. Verifique se o workflow executou com sucesso
2. Confirme que GitHub Pages está habilitado
3. Aguarde alguns minutos (cache do shields.io)
4. Adicione `?cacheSeconds=3600` ao final da URL do badge

### Edge function retorna erro

1. Verifique se `GITHUB_ACCESS_TOKEN` está configurado
2. Confirme que o token tem permissão de leitura
3. Verifique os logs da edge function no Supabase

### Threshold falha inesperadamente

1. Execute localmente: `node scripts/merge-coverage.js`
2. Verifique `coverage/combined/summary.json`
3. Confirme que os testes estão gerando cobertura

---

## Links Úteis

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Shields.io Endpoint](https://shields.io/endpoint)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
