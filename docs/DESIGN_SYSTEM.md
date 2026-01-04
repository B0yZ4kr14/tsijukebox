# Design System - TSiJUKEBOX

Sistema de design completo com componentes, cores, tipografia e padrões visuais do TSiJUKEBOX.

![Settings Screen](assets/mockups/settings-screen.png)

*Exemplo de aplicação do design system na tela de configurações*

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tema e Cores](#tema-e-cores)
3. [Tipografia](#tipografia)
4. [Componentes](#componentes)
5. [Ícones](#ícones)
6. [Espaçamento e Grid](#espaçamento-e-grid)
7. [Efeitos Visuais](#efeitos-visuais)
8. [Acessibilidade](#acessibilidade)
9. [Responsividade](#responsividade)
10. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

O Design System do TSiJUKEBOX foi criado para proporcionar uma experiência visual moderna, consistente e acessível em todas as interfaces do sistema. O design system é baseado em um tema escuro profissional com acentos vibrantes em cyan, ideal para aplicações de música e entretenimento.

### Princípios de Design

O design system segue quatro princípios fundamentais que guiam todas as decisões visuais e de interface. O primeiro princípio é a **consistência visual**, garantindo que todos os componentes sigam os mesmos padrões de cor, tipografia e espaçamento. O segundo é a **acessibilidade**, com contraste adequado (WCAG 2.1 AA) e suporte a leitores de tela. O terceiro princípio é a **modernidade**, utilizando efeitos visuais contemporâneos como glassmorphism e glow. Por fim, a **usabilidade** é priorizada com componentes intuitivos e feedback visual claro.

### Filosofia Visual

A filosofia visual do TSiJUKEBOX combina elementos de design moderno com funcionalidade prática. O tema escuro reduz fadiga visual em uso prolongado, especialmente em ambientes com pouca luz como bares e eventos noturnos. Os acentos em cyan proporcionam destaque visual sem ser agressivo, enquanto os efeitos de glow e glassmorphism adicionam profundidade e modernidade à interface.

---

## Tema e Cores

### Tema Escuro

O tema escuro é o padrão do TSiJUKEBOX, proporcionando uma experiência visual confortável e moderna.

| Elemento | Cor | Hex | RGB | Uso |
|----------|-----|-----|-----|-----|
| **Background Principal** | Preto Profundo | `#0a0a0a` | rgb(10, 10, 10) | Fundo principal de todas as telas |
| **Background Secundário** | Cinza Escuro | `#1a1a1a` | rgb(26, 26, 26) | Fundo de cards e painéis |
| **Background Terciário** | Cinza Médio | `#2a2a2a` | rgb(42, 42, 42) | Fundo de elementos hover |

### Paleta de Cores de Accent

A paleta de cores de accent é vibrante e funcional, com cada cor tendo um propósito específico.

| Cor | Nome | Hex | RGB | Uso Principal |
|-----|------|-----|-----|---------------|
| 🔵 | **Cyan** | `#00d4ff` | rgb(0, 212, 255) | Cor primária, botões, links, elementos interativos |
| 🟢 | **Verde Neon** | `#00ff88` | rgb(0, 255, 136) | Sucesso, instalação, indicadores positivos |
| 🟣 | **Magenta** | `#ff00d4` | rgb(255, 0, 212) | Karaoke, destaque, tutoriais |
| 🟡 | **Amarelo Ouro** | `#ffd400` | rgb(255, 212, 0) | Atenção, desenvolvimento, avisos |
| 🟣 | **Roxo** | `#d400ff` | rgb(212, 0, 255) | API, dados, storage |
| 🟠 | **Laranja** | `#ff4400` | rgb(255, 68, 0) | Segurança, alerta, erros |
| 🟢 | **Verde Lima** | `#00ff44` | rgb(0, 255, 68) | Monitoramento, ativo, online |
| 🔵 | **Azul Elétrico** | `#4400ff` | rgb(68, 0, 255) | Testes, qualidade, QA |

### Cores de Branding

Cores específicas para integrações e branding de terceiros.

| Serviço | Cor | Hex | RGB | Uso |
|---------|-----|-----|-----|-----|
| **Spotify** | Verde Spotify | `#1DB954` | rgb(29, 185, 84) | Botões, badges e elementos Spotify |
| **YouTube** | Vermelho YouTube | `#FF0000` | rgb(255, 0, 0) | Botões, badges e elementos YouTube |
| **GitHub** | Cinza GitHub | `#24292e` | rgb(36, 41, 46) | Integração GitHub |

### Cores de Texto

A hierarquia de cores de texto garante legibilidade e organização visual.

| Elemento | Cor | Hex | Opacidade | Uso |
|----------|-----|-----|-----------|-----|
| **Texto Primário** | Branco | `#ffffff` | 100% | Títulos, labels principais |
| **Texto Secundário** | Cinza Claro | `#cccccc` | 80% | Subtítulos, descrições |
| **Texto Terciário** | Cinza | `#999999` | 60% | Metadados, timestamps |
| **Texto Desabilitado** | Cinza Escuro | `#666666` | 40% | Elementos desabilitados |

### Cores de Estado

Cores para indicar estados de componentes e feedback visual.

| Estado | Cor | Hex | Uso |
|--------|-----|-----|-----|
| **Success** | Verde | `#00ff44` | Operações bem-sucedidas |
| **Warning** | Amarelo | `#ffd400` | Avisos e atenção |
| **Error** | Vermelho | `#ff4444` | Erros e falhas |
| **Info** | Cyan | `#00d4ff` | Informações neutras |

---

## Tipografia

### Família de Fontes

O TSiJUKEBOX utiliza uma stack de fontes modernas e legíveis.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Hierarquia Tipográfica

A hierarquia tipográfica define tamanhos, pesos e espaçamentos para diferentes níveis de conteúdo.

| Nível | Tamanho | Peso | Line Height | Uso |
|-------|---------|------|-------------|-----|
| **H1** | 32px | 700 (Bold) | 1.2 | Títulos principais de página |
| **H2** | 24px | 700 (Bold) | 1.3 | Títulos de seção |
| **H3** | 20px | 600 (Semi-Bold) | 1.4 | Subtítulos de seção |
| **H4** | 18px | 600 (Semi-Bold) | 1.4 | Títulos de card |
| **Body Large** | 16px | 400 (Regular) | 1.5 | Texto principal |
| **Body** | 14px | 400 (Regular) | 1.5 | Texto padrão |
| **Small** | 12px | 400 (Regular) | 1.4 | Metadados, labels |
| **Caption** | 10px | 400 (Regular) | 1.3 | Timestamps, footnotes |

### Estilos de Texto

Estilos especiais para diferentes contextos.

| Estilo | Propriedades | Uso |
|--------|--------------|-----|
| **Link** | color: #00d4ff, text-decoration: underline | Links clicáveis |
| **Code** | font-family: monospace, background: #1a1a1a | Código inline |
| **Bold** | font-weight: 700 | Ênfase forte |
| **Italic** | font-style: italic | Ênfase leve |

---

## Componentes

### Botões

Os botões seguem um padrão consistente com três variantes principais.

#### Botão Primário

Usado para ações principais e CTAs (Call-to-Action).

**Propriedades:**
- Background: `#00d4ff` (cyan)
- Color: `#0a0a0a` (preto)
- Padding: `12px 24px`
- Border Radius: `8px`
- Font Weight: `600`
- Box Shadow: `0 0 20px rgba(0, 212, 255, 0.5)` (glow effect)

**Estados:**
- **Hover:** Background `#00e5ff`, glow intensificado
- **Active:** Background `#00c4ef`, glow reduzido
- **Disabled:** Background `#666666`, sem glow, opacity 50%

#### Botão Secundário

Usado para ações secundárias.

**Propriedades:**
- Background: `transparent`
- Color: `#00d4ff`
- Border: `2px solid #00d4ff`
- Padding: `12px 24px`
- Border Radius: `8px`
- Font Weight: `600`

**Estados:**
- **Hover:** Background `rgba(0, 212, 255, 0.1)`
- **Active:** Background `rgba(0, 212, 255, 0.2)`
- **Disabled:** Border color `#666666`, color `#666666`, opacity 50%

#### Botão Terciário

Usado para ações menos importantes.

**Propriedades:**
- Background: `transparent`
- Color: `#cccccc`
- Padding: `12px 24px`
- Border Radius: `8px`
- Font Weight: `400`

**Estados:**
- **Hover:** Background `#1a1a1a`
- **Active:** Background `#2a2a2a`
- **Disabled:** Color `#666666`, opacity 50%

### Cards

Cards são containers para agrupar conteúdo relacionado.

**Propriedades:**
- Background: `rgba(26, 26, 26, 0.8)` (glassmorphism)
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border Radius: `16px`
- Padding: `24px`
- Box Shadow: `0 4px 12px rgba(0, 0, 0, 0.3)`
- Backdrop Filter: `blur(10px)`

**Estados:**
- **Hover:** Border color `rgba(0, 212, 255, 0.3)`, transform `translateY(-2px)`
- **Active:** Border color `rgba(0, 212, 255, 0.5)`

### Inputs

Campos de entrada de texto e formulários.

**Propriedades:**
- Background: `#1a1a1a`
- Color: `#ffffff`
- Border: `2px solid #2a2a2a`
- Border Radius: `8px`
- Padding: `12px 16px`
- Font Size: `14px`

**Estados:**
- **Focus:** Border color `#00d4ff`, box-shadow `0 0 0 3px rgba(0, 212, 255, 0.2)`
- **Error:** Border color `#ff4444`
- **Disabled:** Background `#0a0a0a`, color `#666666`, opacity 60%

### Toggles (Switches)

Interruptores para ativar/desativar opções.

**Propriedades:**
- Width: `48px`
- Height: `24px`
- Border Radius: `12px` (pill-shaped)
- Background (OFF): `#2a2a2a`
- Background (ON): `#00d4ff`
- Thumb: `20px` circular, branco

**Animação:**
- Transição suave de 200ms para mudança de estado
- Thumb desliza da esquerda (OFF) para direita (ON)

### Sliders

Controles deslizantes para valores numéricos.

**Propriedades:**
- Track Height: `4px`
- Track Background: `#2a2a2a`
- Track Fill: `#00d4ff`
- Thumb: `16px` circular, branco com border cyan
- Border Radius: `2px`

**Estados:**
- **Hover:** Thumb aumenta para `20px`
- **Active:** Thumb com glow effect

### Dropdowns

Menus suspensos para seleção de opções.

**Propriedades:**
- Background: `#1a1a1a`
- Border: `2px solid #2a2a2a`
- Border Radius: `8px`
- Padding: `12px 16px`
- Arrow: Ícone chevron-down em `#cccccc`

**Menu Dropdown:**
- Background: `#1a1a1a`
- Border: `1px solid #2a2a2a`
- Border Radius: `8px`
- Box Shadow: `0 8px 24px rgba(0, 0, 0, 0.5)`
- Max Height: `300px` com scroll

**Item do Menu:**
- Padding: `12px 16px`
- Hover Background: `#2a2a2a`
- Selected Background: `rgba(0, 212, 255, 0.2)`

### Progress Bars

Barras de progresso para indicar carregamento ou progresso.

**Propriedades:**
- Height: `4px`
- Background: `#2a2a2a`
- Fill: `#00d4ff`
- Border Radius: `2px`

**Variantes:**
- **Determinate:** Largura baseada em porcentagem (0-100%)
- **Indeterminate:** Animação de loading contínua

---

## Ícones

### Estilo de Ícones

O TSiJUKEBOX utiliza ícones modernos e minimalistas.

**Propriedades:**
- Estilo: Line icons (outline)
- Stroke Width: `2px`
- Tamanho Padrão: `24x24px`
- Cor: `#cccccc` (texto secundário)
- Cor Ativa: `#00d4ff` (cyan)

### Tamanhos de Ícones

| Tamanho | Dimensões | Uso |
|---------|-----------|-----|
| **Small** | 16x16px | Ícones inline, badges |
| **Medium** | 24x24px | Ícones padrão, botões |
| **Large** | 32x32px | Ícones de navegação |
| **XLarge** | 48x48px | Ícones de features, hero sections |

### Ícones Customizados

O projeto inclui 8 ícones customizados para seções da documentação:

1. **Installation** (Verde Neon) - Ícone de download com seta
2. **Configuration** (Cyan) - Ícone de engrenagem
3. **Tutorials** (Magenta) - Ícone de livro aberto
4. **Development** (Amarelo Ouro) - Ícone de código
5. **API** (Roxo) - Ícone de conexão/plugin
6. **Security** (Laranja) - Ícone de escudo
7. **Monitoring** (Verde Lima) - Ícone de batimento cardíaco
8. **Testing** (Azul Elétrico) - Ícone de tubo de ensaio

---

## Espaçamento e Grid

### Sistema de Espaçamento

O TSiJUKEBOX utiliza um sistema de espaçamento baseado em múltiplos de 4px.

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 4px | Espaçamento mínimo, padding interno |
| `sm` | 8px | Espaçamento pequeno entre elementos |
| `md` | 16px | Espaçamento padrão |
| `lg` | 24px | Espaçamento grande entre seções |
| `xl` | 32px | Espaçamento extra-grande |
| `2xl` | 48px | Espaçamento entre blocos principais |
| `3xl` | 64px | Espaçamento máximo |

### Grid System

O layout utiliza um grid flexível baseado em CSS Grid e Flexbox.

**Container:**
- Max Width: `1440px`
- Padding: `24px` (mobile), `48px` (desktop)
- Margin: `0 auto` (centralizado)

**Grid Columns:**
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3-4 colunas
- Gap: `24px`

---

## Efeitos Visuais

### Glow Effect

Efeito de brilho usado em elementos ativos e interativos.

```css
box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
```

**Uso:**
- Botões primários
- Elementos ativos (botão play, toggles ON)
- Indicadores de foco

### Glassmorphism

Efeito de vidro translúcido usado em cards e overlays.

```css
background: rgba(26, 26, 26, 0.8);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

**Uso:**
- Cards de conteúdo
- Modais e overlays
- Sidebar e painéis

### Shadows

Sombras sutis para criar profundidade.

| Nível | Shadow | Uso |
|-------|--------|-----|
| **Small** | `0 2px 4px rgba(0, 0, 0, 0.2)` | Elementos levemente elevados |
| **Medium** | `0 4px 12px rgba(0, 0, 0, 0.3)` | Cards, dropdowns |
| **Large** | `0 8px 24px rgba(0, 0, 0, 0.5)` | Modais, popovers |

### Transições

Animações suaves para melhorar a experiência do usuário.

**Duração:**
- **Fast:** 100ms - Feedback imediato (hover, active)
- **Normal:** 200ms - Transições padrão
- **Slow:** 300ms - Animações complexas

**Easing:**
- **Ease-out:** Aceleração no início, desaceleração no fim
- **Ease-in-out:** Suave no início e fim

```css
transition: all 200ms ease-out;
```

---

## Acessibilidade

### Contraste de Cores

Todos os pares de cores atendem ao padrão **WCAG 2.1 AA** (mínimo 4.5:1 para texto normal).

| Par de Cores | Contraste | Status |
|--------------|-----------|--------|
| Branco (#ffffff) / Preto (#0a0a0a) | 19.77:1 | ✅ AAA |
| Cyan (#00d4ff) / Preto (#0a0a0a) | 8.12:1 | ✅ AAA |
| Cinza Claro (#cccccc) / Preto (#0a0a0a) | 12.63:1 | ✅ AAA |

### Foco Visível

Todos os elementos interativos possuem indicador de foco visível.

```css
:focus-visible {
  outline: 2px solid #00d4ff;
  outline-offset: 2px;
}
```

### Suporte a Leitores de Tela

Todos os componentes incluem atributos ARIA apropriados:
- `aria-label` para ícones e botões sem texto
- `aria-describedby` para descrições adicionais
- `role` para elementos customizados

---

## Responsividade

### Breakpoints

O design system utiliza breakpoints mobile-first.

| Breakpoint | Largura | Dispositivo |
|------------|---------|-------------|
| `xs` | < 640px | Mobile portrait |
| `sm` | ≥ 640px | Mobile landscape |
| `md` | ≥ 768px | Tablet |
| `lg` | ≥ 1024px | Desktop |
| `xl` | ≥ 1280px | Desktop large |
| `2xl` | ≥ 1536px | Desktop XL |

### Adaptações por Dispositivo

**Mobile (< 768px):**
- Navegação em hamburger menu
- Cards em coluna única
- Botões full-width
- Tipografia reduzida (H1: 24px)

**Tablet (768px - 1024px):**
- Navegação em tabs
- Grid de 2 colunas
- Sidebar colapsável

**Desktop (≥ 1024px):**
- Navegação completa
- Grid de 3-4 colunas
- Sidebar fixa
- Tipografia completa

---

## Exemplos de Uso

### Exemplo 1: Botão Primário

```jsx
<button className="btn-primary">
  Conectar ao Spotify
</button>
```

```css
.btn-primary {
  background: #00d4ff;
  color: #0a0a0a;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  transition: all 200ms ease-out;
}

.btn-primary:hover {
  background: #00e5ff;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.7);
  transform: translateY(-2px);
}
```

### Exemplo 2: Card com Glassmorphism

```jsx
<div className="card">
  <h3>Estatísticas</h3>
  <p>1,247 músicas</p>
</div>
```

```css
.card {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### Exemplo 3: Toggle Switch

```jsx
<label className="toggle">
  <input type="checkbox" />
  <span className="toggle-slider"></span>
</label>
```

```css
.toggle {
  position: relative;
  width: 48px;
  height: 24px;
}

.toggle input:checked + .toggle-slider {
  background: #00d4ff;
}

.toggle-slider {
  background: #2a2a2a;
  border-radius: 12px;
  transition: 200ms;
}
```

---

## Mockups de Referência

Consulte os mockups de alta fidelidade para ver o design system em ação:

- [Settings Screen](assets/mockups/settings-screen.png) - Exemplo de sidebar, toggles, sliders e dropdowns
- [Player Screen](assets/mockups/player-screen.png) - Exemplo de botões, progress bar e cards
- [Dashboard Screen](assets/mockups/dashboard-screen.png) - Exemplo de grid, cards e stats
- [Karaoke Mode](assets/mockups/karaoke-mode-screen.png) - Exemplo de gradientes e efeitos especiais

---

## Recursos Adicionais

### Arquivos de Design

- **Figma:** [TSiJUKEBOX Design System](https://figma.com) (em desenvolvimento)
- **Ícones:** `docs/assets/icons/` (8 ícones customizados)
- **Mockups:** `docs/assets/mockups/` (7 telas de referência)

### Implementação

O design system é implementado usando:
- **React** para componentes
- **Tailwind CSS** para utilitários
- **CSS Modules** para estilos customizados
- **Framer Motion** para animações

### Contribuindo

Para contribuir com o design system:

1. Siga os princípios estabelecidos neste documento
2. Mantenha consistência com componentes existentes
3. Teste acessibilidade (contraste, foco, leitores de tela)
4. Documente novos componentes e padrões
5. Atualize mockups quando necessário

---

## Versionamento

| Versão | Data | Alterações |
|--------|------|------------|
| 1.0 | 2025-12-23 | Criação inicial do design system completo |

---

**Desenvolvido por [B0.y_Z4kr14](https://github.com/B0yZ4kr14)** • *TSI Telecom*

**Documentação:** TSiJUKEBOX Design System v1.0

---

*Este documento é parte do projeto TSiJUKEBOX e está sujeito à mesma licença do projeto principal.*
