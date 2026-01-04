<h1 align="center">
  <img src="https://img.shields.io/badge/🚀-Deploy_GitHub_Pages-00D4FF?style=for-the-badge&labelColor=09090B" alt="Deploy">
</h1>

<p align="center">
  <strong>Guia Wizard para Implantar o TSiJUKEBOX no GitHub Pages</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/⏱️_Tempo-5_minutos-FFD400?style=flat-square" alt="Tempo">
  <img src="https://img.shields.io/badge/📊_Dificuldade-Fácil-00FF88?style=flat-square" alt="Dificuldade">
  <img src="https://img.shields.io/badge/🔧_Passos-4-FF00D4?style=flat-square" alt="Passos">
</p>

---

## 📋 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   📥 Clone  →  ⚙️ Configure  →  🔨 Build  →  🚀 Deploy         │
│                                                                 │
│   Passo 1      Passo 2         Passo 3      Passo 4            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Wizard de Implantação

<table>
<tr>
<td align="center" width="100">

### 1️⃣

</td>
<td>

### ⚙️ Habilitar GitHub Pages

1. Acesse: **[Settings do Repositório](https://github.com/B0yZ4kr14/tsijukebox/settings/pages)**
2. Em **Source**, selecione: `GitHub Actions`
3. Clique em **Save**

```
📍 Navegação: Repository → Settings → Pages → Source → GitHub Actions
```

</td>
<td align="center" width="80">

✅

</td>
</tr>
<tr>
<td align="center">

### 2️⃣

</td>
<td>

### 📝 Criar Workflow de Deploy

1. Acesse: **[Criar Novo Arquivo](https://github.com/B0yZ4kr14/tsijukebox/new/main)**
2. Nome do arquivo: `.github/workflows/deploy-pages.yml`
3. Cole o conteúdo abaixo
4. Clique em **Commit changes**

<details>
<summary><strong>📋 Clique para ver o código do workflow</strong></summary>

```yaml
name: 🚀 Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: 📦 Install dependencies
        run: pnpm install --frozen-lockfile

      - name: 🔨 Build
        run: pnpm build

      - name: 📄 Setup Pages
        uses: actions/configure-pages@v4

      - name: 📤 Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./dist"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: 🚀 Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

</details>

</td>
<td align="center">

✅

</td>
</tr>
<tr>
<td align="center">

### 3️⃣

</td>
<td>

### ⏳ Aguardar Deploy

1. Acesse: **[Actions](https://github.com/B0yZ4kr14/tsijukebox/actions)**
2. Aguarde o workflow **"Deploy to GitHub Pages"** completar
3. Tempo estimado: **2-3 minutos**

```
📊 Status: ⏳ In Progress → ✅ Success
```

</td>
<td align="center">

⏳

</td>
</tr>
<tr>
<td align="center">

### 4️⃣

</td>
<td>

### 🎉 Acessar o Site

Após o deploy, o site estará disponível em:

<h3 align="center">
  <a href="https://b0yz4kr14.github.io/tsijukebox/">
    🌐 https://b0yz4kr14.github.io/tsijukebox/
  </a>
</h3>

</td>
<td align="center">

🎉

</td>
</tr>
</table>

---

## 📄 Páginas Disponíveis

<table>
<tr>
<td align="center" width="33%">

### 🏠 Home

[![Home](https://img.shields.io/badge/Acessar-Home-00D4FF?style=for-the-badge)](https://b0yz4kr14.github.io/tsijukebox/)

Aplicação SPA

</td>
<td align="center" width="33%">

### 🎨 Showcase

[![Showcase](https://img.shields.io/badge/Acessar-Showcase-FF00D4?style=for-the-badge)](https://b0yz4kr14.github.io/tsijukebox/showcase.html)

Design System

</td>
<td align="center" width="33%">

### 🎭 Mockups

[![Mockups](https://img.shields.io/badge/Acessar-Mockups-FFD400?style=for-the-badge)](https://b0yz4kr14.github.io/tsijukebox/stage-theme-mockups.html)

Stage Theme

</td>
</tr>
</table>

---

## 🔧 Solução de Problemas

<details>
<summary><strong>❌ Erro 404 nas rotas</strong></summary>

**Causa:** O React Router precisa do base path configurado.

**Solução:** Verifique se o `vite.config.ts` contém:

```typescript
export default defineConfig({
  base: '/tsijukebox/',
  // ...
})
```

</details>

<details>
<summary><strong>❌ Workflow não aparece</strong></summary>

**Causa:** O arquivo do workflow pode estar no local errado.

**Solução:** Verifique se o caminho é exatamente:
```
.github/workflows/deploy-pages.yml
```

</details>

<details>
<summary><strong>❌ Site não atualiza</strong></summary>

**Causa:** Cache do navegador ou deploy em andamento.

**Solução:**
1. Verifique a aba **Actions** para confirmar que o deploy foi bem-sucedido
2. Limpe o cache do navegador: `Ctrl + Shift + R`

</details>

<details>
<summary><strong>❌ Build falha</strong></summary>

**Causa:** Dependências desatualizadas ou erro no código.

**Solução:**
1. Verifique os logs do workflow na aba **Actions**
2. Execute localmente: `pnpm build`
3. Corrija os erros indicados

</details>

---

## 📊 Status do Deploy

| Recurso | URL |
|---------|-----|
| 🔄 **Actions** | [Ver Workflows](https://github.com/B0yZ4kr14/tsijukebox/actions) |
| 🚀 **Deployments** | [Ver Deployments](https://github.com/B0yZ4kr14/tsijukebox/deployments) |
| ⚙️ **Settings** | [Configurar Pages](https://github.com/B0yZ4kr14/tsijukebox/settings/pages) |

---

## ✅ Checklist de Verificação

```
□ GitHub Pages habilitado com source "GitHub Actions"
□ Workflow deploy-pages.yml criado
□ Workflow executado com sucesso (✅)
□ Site acessível na URL pública
□ Rotas SPA funcionando corretamente
```

---

<p align="center">
  <strong>🎉 Parabéns! Seu site está no ar!</strong>
</p>

<p align="center">
  <a href="https://b0yz4kr14.github.io/tsijukebox/">
    <img src="https://img.shields.io/badge/🌐_Acessar_Site-00D4FF?style=for-the-badge" alt="Acessar Site">
  </a>
</p>
