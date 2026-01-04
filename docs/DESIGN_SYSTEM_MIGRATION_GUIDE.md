# 🎨 Guia de Migração do Design System

## 🚀 Migrando para o Padrão "Dark Neon Gold Black"

Este guia detalha as mudanças necessárias para migrar componentes para o novo padrão visual do TSiJUKEBOX, focado em uma estética "dark-neon-gold-black".

---

### 1. 🎨 Paleta de Cores

A nova paleta de cores é a base do design. Substitua todas as cores hardcoded pelos seguintes tokens:

| Token | Hex | Propósito |
|---|---|---|
| `--bg-primary` | `#000000` | Fundo principal |
| `--bg-secondary` | `#111111` | Fundo de containers |
| `--bg-tertiary` | `#1A1A1A` | Fundo de itens de lista |
| `--accent-gold` | `#FFD700` | Acentos principais, títulos, ícones |
| `--accent-cyan` | `#00d4ff` | Acentos secundários, links, botões |
| `--accent-green` | `#22c55e` | Sucesso, validação positiva |
| `--accent-red` | `#ef4444` | Erro, ações destrutivas |
| `--accent-yellow` | `#fbbf24` | Avisos, alertas |
| `--text-primary` | `#FFFFFF` | Texto principal |
| `--text-secondary` | `#AAAAAA` | Texto secundário, hints |
| `--text-tertiary` | `#666666` | Texto desabilitado, placeholders |
| `--glass-bg` | `rgba(26, 26, 26, 0.6)` | Fundo de elementos com glassmorphism |
| `--glass-border` | `rgba(255, 255, 255, 0.1)` | Borda de elementos com glassmorphism |

**Exemplo de Uso (CSS):**
```css
.container {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
}
```

---

### 2. 🖋️ Tipografia

A tipografia foi padronizada para melhorar a legibilidade e a estética:

| Fonte | Uso | Peso |
|---|---|---|
| `Space Grotesk` | Títulos principais, headers | 700 (Bold) |
| `Inter` | Corpo de texto, parágrafos | 400 (Regular), 600 (Semibold) |
| `JetBrains Mono` | Código, labels, timestamps | 400 (Regular), 700 (Bold) |

**Exemplo de Uso (CSS):**
```css
h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
}

p {
  font-family: 'Inter', sans-serif;
}

.label {
  font-family: 'JetBrains Mono', monospace;
}
```

---

### 3. ✨ Efeitos Visuais

#### Glassmorphism

Use `backdrop-blur` para criar o efeito de vidro fosco em containers.

**Exemplo de Uso (Tailwind CSS):**
```html
<div class="bg-bg-secondary/80 backdrop-blur-sm border border-glass-border">
  <!-- Conteúdo -->
</div>
```

#### Glow Effects

Use `box-shadow` ou `drop-shadow` para criar brilhos neon em elementos ativos.

**Exemplo de Uso (Tailwind CSS):**
```html
<button class="shadow-glow-cyan focus:shadow-glow-cyan">
  Salvar
</button>
```

**CSS:**
```css
.shadow-glow-cyan {
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
}
```

---

### 4. 🧩 Componentes Principais

#### Badges

Use o componente `Badge` com as novas variantes semânticas.

**Exemplo de Uso (React/TSX):**
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="success" size="sm">
  <CheckCircle2 className="w-3 h-3" />
  Válida
</Badge>
```

#### Inputs

Inputs devem usar os tokens de fundo, borda e foco.

**Exemplo de Uso (Tailwind CSS):**
```html
<input class="bg-bg-secondary/80 backdrop-blur-sm border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan" />
```

#### Botões

Botões devem ter variantes `outline` e `default` com hover effects.

**Exemplo de Uso (Tailwind CSS):**
```html
<button class="border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-glow-cyan">
  Testar
</button>
```

---

### 5. 📋 Checklist de Migração

Ao refatorar um componente, siga este checklist:

- [ ] **Cores:** Substituir todas as cores hardcoded por tokens CSS.
- [ ] **Fontes:** Aplicar `Space Grotesk`, `Inter` e `JetBrains Mono` conforme o guia.
- [ ] **Glassmorphism:** Adicionar `backdrop-blur` em containers principais.
- [ ] **Glow Effects:** Aplicar `shadow-glow-*` em elementos interativos (foco, hover).
- [ ] **Badges:** Substituir badges antigos pelo novo componente `Badge` com variantes.
- [ ] **Inputs:** Atualizar inputs com os novos estilos de fundo, borda e foco.
- [ ] **Botões:** Atualizar botões com as novas variantes e hover effects.
- [ ] **Acessibilidade:** Garantir que o contraste e a navegação por teclado sejam mantidos.
- [ ] **Transições:** Adicionar `transition-all duration-normal` para suavizar interações.
- [ ] **Documentação:** Adicionar JSDoc ao componente refatorado.

---

### 🚀 Exemplo Prático: Antes e Depois

**Antes:**
```tsx
<div style={{ backgroundColor: '#EEE', color: 'black' }}>
  <p>URL do Dashboard</p>
  <input type="text" style={{ border: '1px solid gray' }} />
  <button style={{ background: 'blue' }}>Salvar</button>
</div>
```

**Depois (com Tailwind CSS):**
```tsx
<div className="bg-bg-secondary/80 backdrop-blur-sm border border-glass-border p-4 rounded-lg">
  <Label className="text-text-primary font-medium">URL do Dashboard</Label>
  <Input className="bg-bg-tertiary border-border-primary focus:border-accent-cyan focus:shadow-glow-cyan" />
  <Button className="bg-accent-cyan hover:bg-accent-cyan/90 text-text-primary shadow-glow-cyan">
    Salvar
  </Button>
</div>
```

---

**Status:** Guia completo. Pronto para ser usado na refatoração da Phase 8.
