# 📋 Plano de Migração de Componentes UI

## Migração para Componentes Temáticos TSiJUKEBOX

**Data:** 24/12/2024  
**Versão:** 1.0.0  
**Autor:** TSiJUKEBOX Team  
**Status:** Pronto para Execução

---

## 📊 Resumo Executivo

Este documento detalha o plano de migração dos componentes UI antigos (`src/components/ui/*.tsx`) para os novos componentes temáticos (`src/components/ui/themed/index.tsx`), priorizando as 10 telas mais acessadas do sistema.

### Métricas de Impacto

| Métrica | Valor |
|---------|-------|
| **Arquivos usando Button** | 176 |
| **Arquivos usando Card** | 76 |
| **Arquivos usando Input** | 77 |
| **Componentes UI antigos** | 72 |
| **Páginas a migrar (prioridade)** | 10 |
| **Tempo estimado total** | 3 semanas |

---

## 🎯 Top 10 Telas Priorizadas

Baseado em complexidade (linhas de código) e uso de componentes:

| # | Página | Linhas | Buttons | Cards | Inputs | Prioridade |
|---|--------|--------|---------|-------|--------|------------|
| 1 | **Help.tsx** | 1.140 | 8 | 15 | 2 | 🔴 Alta |
| 2 | **SetupWizard.tsx** | 1.013 | 13 | 8 | 6 | 🔴 Alta |
| 3 | **BrandGuidelines.tsx** | 881 | 17 | 159 | 0 | 🔴 Alta |
| 4 | **SystemDiagnostics.tsx** | 833 | 12 | 20 | 3 | 🔴 Alta |
| 5 | **DesignSystem.tsx** | 617 | 25 | 30 | 5 | 🟡 Média |
| 6 | **Settings.tsx** | 572 | 18 | 12 | 3 | 🟡 Média |
| 7 | **Dashboard.tsx** | 378 | 3 | 41 | 0 | 🟡 Média |
| 8 | **LandingPage.tsx** | 422 | 9 | 6 | 0 | 🟢 Normal |
| 9 | **SpotifyBrowser.tsx** | 207 | 11 | 2 | 0 | 🟢 Normal |
| 10 | **Index.tsx** | 156 | 3 | 0 | 0 | 🟢 Normal |

---

## 🔄 Mapeamento de Componentes

### Componentes com Migração Direta

| Componente Antigo | Componente Novo | Compatibilidade |
|-------------------|-----------------|-----------------|
| `@/components/ui/button` | `Button` de `@/components/ui/themed` | ⚠️ Props diferentes |
| `@/components/ui/card` | `Card` de `@/components/ui/themed` | ⚠️ Props diferentes |
| `@/components/ui/input` | `Input` de `@/components/ui/themed` | ⚠️ Props diferentes |
| `@/components/ui/badge` | `Badge` de `@/components/ui/themed` | ✅ Compatível |
| `@/components/ui/switch` | `Toggle` de `@/components/ui/themed` | ⚠️ Props diferentes |
| `@/components/ui/slider` | `Slider` de `@/components/ui/themed` | ⚠️ Props diferentes |

### Componentes sem Equivalente (Manter)

| Componente | Motivo |
|------------|--------|
| `accordion` | Funcionalidade específica Radix |
| `alert-dialog` | Funcionalidade específica Radix |
| `dialog` | Funcionalidade específica Radix |
| `dropdown-menu` | Funcionalidade específica Radix |
| `popover` | Funcionalidade específica Radix |
| `select` | Funcionalidade específica Radix |
| `tabs` | Funcionalidade específica Radix |
| `tooltip` | Funcionalidade específica Radix |

---

## 📅 Cronograma de Migração (3 Semanas)

### Semana 1: Páginas de Alta Prioridade

#### Dia 1-2: Help.tsx (1.140 linhas)

**Arquivo:** `src/pages/public/Help.tsx`

**Tarefas:**
1. Substituir imports de Button
2. Substituir imports de Card
3. Substituir imports de Input
4. Atualizar props para novo formato
5. Testar funcionalidades
6. Criar PR

**Código de Migração:**

```tsx
// ANTES
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// DEPOIS
import { Button, Card, Input } from "@/components/ui/themed";
```

**Mapeamento de Props - Button:**

```tsx
// ANTES
<Button variant="default" size="lg" onClick={handleClick}>
  Texto
</Button>

// DEPOIS
<Button variant="primary" size="lg" onClick={handleClick}>
  Texto
</Button>
```

| Prop Antiga | Prop Nova | Notas |
|-------------|-----------|-------|
| `variant="default"` | `variant="primary"` | Renomeado |
| `variant="destructive"` | `variant="danger"` | Renomeado |
| `variant="outline"` | `variant="outline"` | Igual |
| `variant="secondary"` | `variant="secondary"` | Igual |
| `variant="ghost"` | `variant="ghost"` | Igual |
| `variant="link"` | `variant="ghost"` | Usar ghost |
| `size="default"` | `size="md"` | Renomeado |
| `size="sm"` | `size="sm"` | Igual |
| `size="lg"` | `size="lg"` | Igual |
| `size="icon"` | `size="xs"` + className | Usar xs |
| N/A | `isLoading` | Novo |
| N/A | `leftIcon` | Novo |
| N/A | `rightIcon` | Novo |
| N/A | `fullWidth` | Novo |

**Mapeamento de Props - Card:**

```tsx
// ANTES
<Card className="p-4">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Conteúdo
  </CardContent>
</Card>

// DEPOIS
<Card variant="default" padding="md">
  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Título</h3>
  <div>Conteúdo</div>
</Card>
```

| Prop Antiga | Prop Nova | Notas |
|-------------|-----------|-------|
| `className="p-4"` | `padding="md"` | Usar prop |
| N/A | `variant` | Novo (default, elevated, outlined, glass, gradient) |
| N/A | `hoverable` | Novo |
| N/A | `clickable` | Novo |
| `CardHeader` | Remover | Usar elementos HTML |
| `CardTitle` | Remover | Usar h3 com classes |
| `CardContent` | Remover | Usar div |
| `CardDescription` | Remover | Usar p com classes |
| `CardFooter` | Remover | Usar div com classes |

**Mapeamento de Props - Input:**

```tsx
// ANTES
<Input 
  type="text" 
  placeholder="Digite..." 
  className="w-full"
/>

// DEPOIS
<Input 
  type="text" 
  placeholder="Digite..." 
  variant="default"
  inputSize="md"
  label="Campo"
/>
```

| Prop Antiga | Prop Nova | Notas |
|-------------|-----------|-------|
| `className` | `className` | Igual |
| N/A | `variant` | Novo (default, filled, outline) |
| N/A | `inputSize` | Novo (sm, md, lg) |
| N/A | `leftIcon` | Novo |
| N/A | `rightIcon` | Novo |
| N/A | `error` | Novo |
| N/A | `label` | Novo |

---

#### Dia 3-4: SetupWizard.tsx (1.013 linhas)

**Arquivo:** `src/pages/public/SetupWizard.tsx`

**Componentes a migrar:**
- 13 Buttons
- 8 Cards
- 6 Inputs

**Checklist:**
- [ ] Backup do arquivo original
- [ ] Substituir imports
- [ ] Migrar Buttons (13)
- [ ] Migrar Cards (8)
- [ ] Migrar Inputs (6)
- [ ] Testar wizard completo (9 etapas)
- [ ] Verificar navegação entre etapas
- [ ] Criar PR

---

#### Dia 5: BrandGuidelines.tsx (881 linhas)

**Arquivo:** `src/pages/brand/BrandGuidelines.tsx`

**Componentes a migrar:**
- 17 Buttons
- 159 Cards (maior quantidade!)
- 0 Inputs

**Estratégia especial:**
- Usar find/replace com regex para Cards
- Testar cada seção individualmente

**Regex para migração de Cards:**

```bash
# Encontrar padrões de Card antigo
grep -n "CardHeader\|CardTitle\|CardContent\|CardFooter" src/pages/brand/BrandGuidelines.tsx
```

---

### Semana 2: Páginas de Média Prioridade

#### Dia 6-7: SystemDiagnostics.tsx (833 linhas)

**Arquivo:** `src/pages/settings/SystemDiagnostics.tsx`

**Componentes a migrar:**
- 12 Buttons
- 20 Cards
- 3 Inputs

**Checklist:**
- [ ] Migrar componentes
- [ ] Testar diagnósticos de sistema
- [ ] Verificar gráficos e métricas
- [ ] Criar PR

---

#### Dia 8-9: DesignSystem.tsx (617 linhas)

**Arquivo:** `src/pages/public/DesignSystem.tsx`

**Componentes a migrar:**
- 25 Buttons
- 30 Cards
- 5 Inputs

**Nota:** Esta página é showcase de componentes, deve demonstrar os novos componentes temáticos.

---

#### Dia 10: Settings.tsx (572 linhas)

**Arquivo:** `src/pages/settings/Settings.tsx`

**Componentes a migrar:**
- 18 Buttons
- 12 Cards
- 3 Inputs

**Integração com ThemeSelector:**
- Substituir seletor de tema antigo pelo novo `ThemeSelector`

---

### Semana 3: Páginas de Prioridade Normal + Finalização

#### Dia 11: Dashboard.tsx (378 linhas)

**Arquivo:** `src/pages/dashboards/Dashboard.tsx`

**Componentes a migrar:**
- 3 Buttons
- 41 Cards
- 0 Inputs

**Usar StatCard:**
- Substituir cards de estatísticas pelo novo `StatCard`

---

#### Dia 12: LandingPage.tsx (422 linhas)

**Arquivo:** `src/pages/public/LandingPage.tsx`

**Componentes a migrar:**
- 9 Buttons
- 6 Cards
- 0 Inputs

---

#### Dia 13: SpotifyBrowser.tsx + Index.tsx

**Arquivos:**
- `src/pages/spotify/SpotifyBrowser.tsx` (207 linhas)
- `src/pages/public/Index.tsx` (156 linhas)

**Componentes a migrar:**
- SpotifyBrowser: 11 Buttons, 2 Cards
- Index: 3 Buttons

---

#### Dia 14-15: Testes e Documentação

**Tarefas:**
- [ ] Executar testes E2E em todas as páginas migradas
- [ ] Verificar responsividade
- [ ] Testar troca de temas
- [ ] Atualizar documentação
- [ ] Criar release notes

---

## 🛠️ Scripts de Migração

### Script 1: Atualizar Imports

```bash
#!/bin/bash
# migrate-imports.sh

FILE=$1

# Backup
cp "$FILE" "${FILE}.bak"

# Substituir imports de Button
sed -i 's/import { Button } from "@\/components\/ui\/button"/import { Button } from "@\/components\/ui\/themed"/g' "$FILE"

# Substituir imports de Card
sed -i 's/import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@\/components\/ui\/card"/import { Card } from "@\/components\/ui\/themed"/g' "$FILE"

# Substituir imports de Input
sed -i 's/import { Input } from "@\/components\/ui\/input"/import { Input } from "@\/components\/ui\/themed"/g' "$FILE"

echo "Imports atualizados em $FILE"
```

### Script 2: Verificar Migração

```bash
#!/bin/bash
# verify-migration.sh

echo "=== Verificando arquivos com imports antigos ==="

echo "Button antigo:"
grep -rln "from.*@/components/ui/button" src/pages/ | wc -l

echo "Card antigo:"
grep -rln "from.*@/components/ui/card" src/pages/ | wc -l

echo "Input antigo:"
grep -rln "from.*@/components/ui/input" src/pages/ | wc -l

echo ""
echo "=== Arquivos usando componentes temáticos ==="
grep -rln "from.*@/components/ui/themed" src/pages/ | wc -l
```

---

## ✅ Checklist de Migração por Arquivo

### Template de Checklist

```markdown
## [Nome do Arquivo]

- [ ] Backup criado
- [ ] Imports atualizados
- [ ] Buttons migrados (X/X)
- [ ] Cards migrados (X/X)
- [ ] Inputs migrados (X/X)
- [ ] Props atualizadas
- [ ] Testes manuais passando
- [ ] Testes E2E passando
- [ ] PR criado
- [ ] Code review aprovado
- [ ] Merge realizado
```

---

## 🔙 Estratégia de Rollback

### Se algo der errado:

1. **Reverter arquivo individual:**
```bash
git checkout HEAD~1 -- src/pages/[arquivo].tsx
```

2. **Reverter PR completo:**
```bash
git revert [commit-hash]
```

3. **Usar backup:**
```bash
cp src/pages/[arquivo].tsx.bak src/pages/[arquivo].tsx
```

---

## 📊 Métricas de Sucesso

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Páginas migradas** | 10/10 | Contagem manual |
| **Testes passando** | 100% | `npm run test` |
| **Build sem erros** | ✅ | `npm run build` |
| **Lighthouse Performance** | ≥90 | Chrome DevTools |
| **Bundle size** | ≤5% aumento | `npm run analyze` |
| **Tempo de carregamento** | ≤3s | Performance API |

---

## 📝 Notas de Implementação

### Compatibilidade com Temas

Os novos componentes usam CSS Variables que são automaticamente atualizadas pelo `ThemeProvider`. Certifique-se de que:

1. O `ThemeProvider` envolve toda a aplicação
2. As CSS Variables estão sendo geradas corretamente
3. Os componentes usam `var(--nome-da-variavel)` para cores

### Acessibilidade

Os novos componentes incluem:
- `aria-label` automático em botões de ícone
- `role` apropriado em elementos interativos
- `focus-visible` para navegação por teclado
- Contraste de cores WCAG 2.1 AA

### Performance

Os novos componentes são otimizados com:
- `forwardRef` para refs
- Memoização onde apropriado
- CSS-in-JS mínimo (preferência por Tailwind)

---

## 🎯 Próximos Passos Após Migração

1. **Deprecar componentes antigos** - Adicionar warnings
2. **Remover componentes antigos** - Após 2 sprints
3. **Documentar novos componentes** - Storybook
4. **Criar testes de snapshot** - Para regressão visual

---

## 📞 Suporte

Em caso de dúvidas durante a migração:

1. Consultar este documento
2. Verificar exemplos em `src/components/ui/themed/index.tsx`
3. Abrir issue no GitHub com label `migration`

---

**Última atualização:** 24/12/2024  
**Próxima revisão:** Após Semana 1
