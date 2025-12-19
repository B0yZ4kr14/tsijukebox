# Guia de Contribuição

Obrigado por considerar contribuir com o TSiJUKEBOX! Este documento fornece 
diretrizes e instruções para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Configurando o Ambiente](#configurando-o-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Commits Convencionais](#commits-convencionais)
- [Pull Requests](#pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Features](#sugerindo-features)

---

## Código de Conduta

Este projeto adota o [Código de Conduta do Contribuidor](../CODE_OF_CONDUCT.md). 
Ao participar, espera-se que você siga este código.

---

## Como Posso Contribuir?

### 🐛 Reportando Bugs

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/yourusername/tsijukebox/issues)
2. Se não, crie uma nova issue usando o template de bug report
3. Inclua o máximo de detalhes possível

### 💡 Sugerindo Features

1. Verifique se a feature já foi sugerida nas [Issues](https://github.com/yourusername/tsijukebox/issues)
2. Se não, crie uma nova issue usando o template de feature request
3. Descreva claramente o problema que a feature resolve

### 🔧 Contribuindo com Código

1. Fork o repositório
2. Crie uma branch para sua feature/fix
3. Faça suas alterações seguindo os padrões
4. Submeta um Pull Request

### 📖 Melhorando a Documentação

- Correções de typos e gramática
- Exemplos adicionais
- Traduções
- Tutoriais

---

## Configurando o Ambiente

### Pré-requisitos

- Node.js 18+ (recomendado: 20 LTS)
- npm 9+ ou bun
- Git

### Instalação

```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/tsijukebox.git

# Entre no diretório
cd tsijukebox

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Scripts Úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run test         # Rodar testes
npm run lint         # Verificar linting
npm run wcag:validate  # Validar acessibilidade
npm run contrast     # Verificar contraste
```

---

## Fluxo de Trabalho

### 1. Crie uma Branch

```bash
# Para features
git checkout -b feature/nome-da-feature

# Para bugfixes
git checkout -b fix/descricao-do-bug

# Para documentação
git checkout -b docs/o-que-foi-alterado
```

### 2. Faça suas Alterações

- Escreva código limpo e legível
- Adicione testes quando aplicável
- Atualize a documentação se necessário

### 3. Teste suas Alterações

```bash
npm run test
npm run lint
npm run build
```

### 4. Commit suas Alterações

Use [commits convencionais](#commits-convencionais):

```bash
git commit -m "feat: adiciona suporte a novo provider"
```

### 5. Push e Pull Request

```bash
git push origin sua-branch
```

Então abra um Pull Request no GitHub.

---

## Padrões de Código

### TypeScript

- Use tipos explícitos sempre que possível
- Evite `any` — prefira `unknown` se necessário
- Use interfaces para objetos públicos
- Use types para unions e intersections

```typescript
// ✅ Bom
interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

// ❌ Ruim
const track: any = { ... };
```

### React

- Use functional components com hooks
- Prefira composição sobre herança
- Mantenha componentes pequenos e focados
- Use barrel files (index.ts) para exports

```tsx
// ✅ Bom
export function TrackCard({ track }: TrackCardProps) {
  return <div>...</div>;
}

// ❌ Ruim
export class TrackCard extends React.Component { ... }
```

### Tailwind CSS

- Use tokens semânticos do design system
- Evite cores hardcoded
- Prefira classes utilitárias sobre CSS custom

```tsx
// ✅ Bom
<div className="bg-background text-foreground">

// ❌ Ruim
<div className="bg-[#1a1a1a] text-[#ffffff]">
```

### Acessibilidade

- Use elementos semânticos HTML
- Adicione labels a todos os inputs
- Garanta contraste mínimo de 4.5:1
- Documente exceções WCAG com comentários

```tsx
// ✅ Bom
<button aria-label="Reproduzir música">
  <PlayIcon />
</button>

// ❌ Ruim
<div onClick={play}>
  <PlayIcon />
</div>
```

---

## Commits Convencionais

Usamos [Conventional Commits](https://www.conventionalcommits.org/) para manter 
um histórico limpo e gerar changelogs automaticamente.

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos

| Tipo | Descrição |
|------|-----------|
| `feat` | Nova feature |
| `fix` | Correção de bug |
| `docs` | Apenas documentação |
| `style` | Formatação (não afeta lógica) |
| `refactor` | Refatoração de código |
| `perf` | Melhoria de performance |
| `test` | Adição/correção de testes |
| `build` | Mudanças no build/dependências |
| `ci` | Mudanças em CI/CD |
| `chore` | Outras mudanças |

### Exemplos

```bash
feat(player): adiciona suporte a crossfade
fix(auth): corrige redirect após login
docs(readme): atualiza instruções de instalação
refactor(hooks): extrai lógica de playlist para hook dedicado
perf(library): implementa virtualização na lista de músicas
```

---

## Pull Requests

### Antes de Submeter

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (`npm run test`)
- [ ] Linting passa (`npm run lint`)
- [ ] Build funciona (`npm run build`)
- [ ] Documentação atualizada (se aplicável)
- [ ] Commits seguem convenção

### Template de PR

O repositório inclui um template de PR. Preencha todas as seções relevantes.

### Revisão

- Pelo menos uma aprovação é necessária
- CI deve passar antes do merge
- Mantenha o PR focado — uma feature/fix por PR

---

## Reportando Bugs

Use o template de bug report e inclua:

1. **Descrição clara** do problema
2. **Passos para reproduzir** o bug
3. **Comportamento esperado** vs **comportamento atual**
4. **Screenshots** (se aplicável)
5. **Ambiente**: OS, browser, versão do Node

---

## Sugerindo Features

Use o template de feature request e inclua:

1. **Problema** que a feature resolve
2. **Solução proposta**
3. **Alternativas** consideradas
4. **Contexto adicional** (mockups, exemplos)

---

## Recursos Adicionais

- [Guia do Desenvolvedor](DEVELOPER-GUIDE.md)
- [Referência de API](API-REFERENCE.md)
- [Design System](DESIGN-SYSTEM.md)
- [Acessibilidade](ACCESSIBILITY.md)

---

## Dúvidas?

Abra uma issue com a tag `question` ou inicie uma discussão no GitHub.

---

**Obrigado por contribuir!** 🎉

<div align="center">
  <sub>TSiJUKEBOX Enterprise — Feito pela comunidade, para a comunidade.</sub>
</div>
