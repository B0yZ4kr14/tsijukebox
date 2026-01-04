# GitHub Integration - TSiJUKEBOX

Guia completo para configurar e usar a integração do GitHub com o TSiJUKEBOX para controle de versão, CI/CD e colaboração.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Workflows de CI/CD](#workflows-de-cicd)
4. [GitHub Actions](#github-actions)
5. [Branch Protection](#branch-protection)
6. [Pull Requests](#pull-requests)
7. [Issues e Projects](#issues-e-projects)
8. [GitHub Pages](#github-pages)
9. [Webhooks](#webhooks)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

A integração do GitHub com o TSiJUKEBOX permite gerenciamento completo do código-fonte, automação de testes, deploy contínuo e colaboração entre desenvolvedores. O repositório está configurado com workflows automatizados para garantir qualidade e consistência do código.

### Recursos Disponíveis

O repositório TSiJUKEBOX utiliza os seguintes recursos do GitHub:

**Controle de Versão** com Git para rastreamento de mudanças, branches para desenvolvimento paralelo e tags para versionamento semântico. **CI/CD** através de GitHub Actions para testes automatizados, build e deploy automático, e verificação de qualidade de código. **Colaboração** via Pull Requests para code review, Issues para rastreamento de bugs e features, e Projects para gerenciamento de tarefas. **Documentação** com GitHub Wiki para documentação colaborativa, GitHub Pages para site de documentação, e README.md como entrada principal.

---

## Configuração Inicial

### Clonar o Repositório

Para começar a trabalhar com o TSiJUKEBOX, clone o repositório:

```bash
# Via HTTPS
git clone https://github.com/B0yZ4kr14/tsijukebox.git

# Via SSH (recomendado para contribuidores)
git clone git@github.com:B0yZ4kr14/tsijukebox.git

# Navegar para o diretório
cd tsijukebox
```

### Configurar Git

Configure suas credenciais do Git:

```bash
# Configurar nome e email
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"

# Verificar configuração
git config --list
```

### Autenticação

Para operações que requerem autenticação (push, pull de repositórios privados):

**Opção 1: Personal Access Token (Recomendado)**

1. Acesse [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Clique em "Generate new token (classic)"
3. Selecione os escopos necessários: `repo`, `workflow`, `write:packages`
4. Copie o token gerado
5. Use o token como senha ao fazer push/pull

**Opção 2: SSH Key**

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"

# Adicionar chave ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub
```

Adicione a chave pública em [GitHub Settings → SSH and GPG keys](https://github.com/settings/keys).

---

## Workflows de CI/CD

O TSiJUKEBOX possui workflows automatizados para garantir qualidade e facilitar o desenvolvimento.

### Workflow Principal (ci.yml)

Executado em cada push e pull request para as branches `main` e `develop`.

**Etapas:**
1. **Checkout** - Faz checkout do código
2. **Setup Node.js** - Configura ambiente Node.js 22.x
3. **Install Dependencies** - Instala dependências com `pnpm`
4. **Lint** - Verifica qualidade do código com ESLint
5. **Type Check** - Verifica tipos com TypeScript
6. **Test** - Executa testes unitários com Vitest
7. **Build** - Compila o projeto para produção

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build
```

### Workflow de Deploy (deploy.yml)

Executado automaticamente ao fazer push para a branch `main`.

**Etapas:**
1. Build do projeto
2. Deploy para ambiente de produção
3. Notificação de sucesso/falha

### Workflow de Release (release.yml)

Executado ao criar uma nova tag de versão.

**Etapas:**
1. Build do projeto
2. Geração de changelog automático
3. Criação de release no GitHub
4. Upload de artifacts

---

## GitHub Actions

### Actions Customizadas

O projeto utiliza as seguintes GitHub Actions:

| Action | Propósito | Frequência |
|--------|-----------|------------|
| **ci.yml** | Testes e build | Cada push/PR |
| **deploy.yml** | Deploy automático | Push para main |
| **release.yml** | Criação de releases | Tags de versão |
| **dependabot.yml** | Atualização de dependências | Semanal |

### Secrets Configurados

Os seguintes secrets estão configurados no repositório:

| Secret | Descrição | Uso |
|--------|-----------|-----|
| `GITHUB_TOKEN` | Token automático do GitHub | Workflows |
| `DEPLOY_TOKEN` | Token para deploy | Deploy automático |
| `SUPABASE_URL` | URL do Supabase | Testes de integração |
| `SUPABASE_KEY` | Chave do Supabase | Testes de integração |

---

## Branch Protection

A branch `main` possui proteção configurada para garantir qualidade do código.

### Regras de Proteção

**Require pull request reviews before merging** - Pelo menos 1 aprovação necessária antes de merge. **Require status checks to pass before merging** - Todos os testes devem passar. **Require branches to be up to date before merging** - Branch deve estar atualizada com main. **Include administrators** - Regras aplicam-se a todos, incluindo administradores.

### Status Checks Obrigatórios

Os seguintes checks devem passar antes do merge:
- ✅ Lint (ESLint)
- ✅ Type Check (TypeScript)
- ✅ Tests (Vitest)
- ✅ Build (Vite)

---

## Pull Requests

### Criando um Pull Request

1. Crie uma branch para sua feature:
```bash
git checkout -b feature/nome-da-feature
```

2. Faça suas alterações e commits:
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade"
```

3. Faça push da branch:
```bash
git push origin feature/nome-da-feature
```

4. Abra um Pull Request no GitHub

### Template de Pull Request

O repositório possui um template de PR que deve ser preenchido:

```markdown
## Descrição
Descreva as mudanças realizadas

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Todos os testes passam
```

### Code Review

Todos os PRs passam por code review antes do merge. Os revisores verificam:
- Qualidade do código
- Cobertura de testes
- Documentação
- Performance
- Segurança

---

## Issues e Projects

### Criando Issues

Use issues para reportar bugs, solicitar features ou discutir melhorias.

**Labels Disponíveis:**
- `bug` - Bugs e erros
- `enhancement` - Novas features
- `documentation` - Melhorias na documentação
- `good first issue` - Boas issues para iniciantes
- `help wanted` - Issues que precisam de ajuda

### GitHub Projects

O repositório utiliza GitHub Projects para gerenciamento de tarefas:

**Boards:**
- **Backlog** - Issues e features planejadas
- **In Progress** - Trabalho em andamento
- **Review** - PRs aguardando review
- **Done** - Trabalho concluído

---

## GitHub Pages

A documentação do TSiJUKEBOX está disponível via GitHub Pages.

**URL:** https://b0yz4kr14.github.io/tsijukebox

### Atualizar Documentação

A documentação é atualizada automaticamente ao fazer push para `main`:

```bash
# Editar documentação
vim docs/README.md

# Commit e push
git add docs/
git commit -m "docs: atualiza documentação"
git push origin main
```

---

## Webhooks

O repositório pode ser configurado com webhooks para integração com serviços externos.

### Configurar Webhook

1. Acesse **Settings → Webhooks → Add webhook**
2. Configure a URL do payload
3. Selecione eventos (push, pull_request, issues, etc.)
4. Salve o webhook

### Eventos Suportados

- `push` - Quando código é enviado
- `pull_request` - Quando PR é criado/atualizado
- `issues` - Quando issue é criada/atualizada
- `release` - Quando release é publicada

---

## Troubleshooting

### Erro: Permission Denied (publickey)

**Problema:** Não consegue fazer push via SSH.

**Solução:**
```bash
# Verificar se chave SSH está carregada
ssh-add -l

# Adicionar chave se necessário
ssh-add ~/.ssh/id_ed25519

# Testar conexão
ssh -T git@github.com
```

### Erro: Authentication Failed

**Problema:** Token ou senha inválidos.

**Solução:**
1. Gere um novo Personal Access Token
2. Use o token como senha
3. Configure credential helper:
```bash
git config --global credential.helper store
```

### Erro: Merge Conflict

**Problema:** Conflitos ao fazer merge.

**Solução:**
```bash
# Atualizar branch com main
git fetch origin
git merge origin/main

# Resolver conflitos manualmente
# Depois:
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

### CI Falhando

**Problema:** Workflows falhando no GitHub Actions.

**Solução:**
1. Verifique os logs do workflow
2. Execute os comandos localmente:
```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```
3. Corrija os erros encontrados
4. Faça commit e push novamente

---

## Recursos Adicionais

### Documentação Oficial

- [GitHub Docs](https://docs.github.com)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Git Documentation](https://git-scm.com/doc)

### Ferramentas Úteis

- **GitHub CLI:** `gh` - Interface de linha de comando para GitHub
- **GitHub Desktop:** GUI para gerenciar repositórios
- **GitKraken:** Cliente Git avançado

### Comandos Git Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline --graph

# Criar branch
git checkout -b feature/nome

# Atualizar branch
git pull origin main

# Fazer stash de mudanças
git stash
git stash pop

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Ver diferenças
git diff
```

---

## Contribuindo

Para contribuir com o TSiJUKEBOX via GitHub:

1. Fork o repositório
2. Clone seu fork
3. Crie uma branch para sua feature
4. Faça suas alterações
5. Faça commit seguindo [Conventional Commits](https://www.conventionalcommits.org/)
6. Faça push e abra um Pull Request
7. Aguarde code review

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

---

**Desenvolvido por [B0.y_Z4kr14](https://github.com/B0yZ4kr14)** • *TSI Telecom*

**Repositório:** https://github.com/B0yZ4kr14/tsijukebox

---

*Este documento é parte do projeto TSiJUKEBOX e está sujeito à mesma licença do projeto principal.*
