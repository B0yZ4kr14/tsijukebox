# TSiJUKEBOX Design System

> Sistema de design para interface kiosk com tema escuro e efeitos neon

## Paleta de Cores

### Cores Base (Dark Theme)

| Variável CSS | Valor HSL | Uso |
|-------------|-----------|-----|
| `--kiosk-bg` | `240 10% 10%` | Fundo principal da aplicação |
| `--kiosk-surface` | `240 10% 15%` | Cards e superfícies elevadas |
| `--kiosk-text` | `0 0% 96%` | Texto principal |
| `--kiosk-border` | `240 10% 25%` | Bordas padrão |
| `--kiosk-primary` | `330 100% 65%` | Cor primária (rosa/pink) |
| `--kiosk-accent` | `195 100% 50%` | Cor de destaque (ciano) |

### Cores Neon

| Classe | Cor HSL | Uso |
|--------|---------|-----|
| Cyan (accent) | `185-195 100% 50-70%` | Ícones, bordas, acentos interativos |
| Golden | `45 100% 65-70%` | Títulos, labels de alta visibilidade |
| Blue | `210 100% 70%` | Logo TSi, links |
| Green (Spotify) | `141 70% 35-50%` | Estados selecionados, Spotify |
| Red | `0 100% 50%` | Ações destrutivas, alertas críticos |
| Amber | `38 100% 60%` | Avisos, ações intermediárias |

---

## Classes de Texto

### Títulos e Labels

| Classe | Descrição | Quando Usar |
|--------|-----------|-------------|
| `.text-gold-neon` | Dourado com glow de 3 camadas | Títulos de página, headings principais |
| `.text-gold-neon-hover` | Dourado interativo com hover intensificado | Títulos clicáveis, navegação |
| `.text-gold-blue-outline` | Dourado com contorno azul neon | Variante alternativa de título |
| `.text-title-white-neon` | Branco com contorno neon | Títulos de track, destaque máximo |
| `.text-artist-neon-blue` | Ciano semi-negrito | Nomes de artistas |
| `.text-album-neon` | Azul claro sutil | Nomes de álbuns |

### Labels de Formulário

| Classe | Descrição | Quando Usar |
|--------|-----------|-------------|
| `.text-label-yellow` | Amarelo alta visibilidade | Labels obrigatórios, campos importantes |
| `.text-label-orange` | Laranja alta visibilidade | Labels secundários |
| `.text-label-neon` | Ciano neon | Labels de status |
| `.text-settings-label` | 88% opacidade | Labels gerais em settings |
| `.text-settings-description` | 75% opacidade | Descrições de campos |
| `.text-settings-hint` | 68% opacidade | Dicas e hints |

### Ações Rápidas

| Classe | Descrição | Quando Usar |
|--------|-----------|-------------|
| `.text-neon-action-label` | Ciano bold com glow | Labels de botões de ação |
| `.text-neon-action-label-gold` | Dourado bold com glow | Labels de ações importantes |

---

## Classes de Botões

### Botões Padrão (via variant)

| Variant | Descrição | Quando Usar |
|---------|-----------|-------------|
| `variant="kiosk-outline"` | Outline com fundo escuro | Botões secundários padrão |
| `variant="ghost"` | Transparente | Ações terciárias, ícones |
| `variant="destructive"` | Vermelho para destruição | Deletar, cancelar |

### Classes 3D Customizadas

| Classe | Descrição | Quando Usar |
|--------|-----------|-------------|
| `.button-outline-neon` | Outline com efeito neon | Botões que precisam de destaque extra |
| `.button-play-chrome-neon` | Chrome brilhante | Botão Play/Pause principal |
| `.button-control-extreme-3d` | 3D com elevação | Controles de player (next/prev) |
| `.button-stop-extreme-3d` | 3D com glow amarelo | Botão Stop |
| `.deck-button-3d-ultra` | Ultra 3D com sombras múltiplas | Botões do CommandDeck |

### Cores de Botões do CommandDeck

| Classe | Cor | Uso |
|--------|-----|-----|
| `.deck-button-cyan` | Ciano | Informação (Dashboard, Datasource) |
| `.deck-button-amber` | Âmbar | Ações intermediárias (Reload) |
| `.deck-button-white` | Branco | Neutro (Setup, Help) |
| `.deck-button-red` | Vermelho | Crítico (Reboot) |

---

## Classes de Cards

| Classe | Descrição | Quando Usar |
|--------|-----------|-------------|
| `.card-neon-border` | Borda azul neon com glow | Cards gerais com destaque |
| `.card-gold-neon-border` | Borda dourada neon | Cards importantes, admin |
| `.card-admin-extreme-3d` | 3D com sombras múltiplas (32px) | Cards em páginas admin |
| `.card-option-dark-3d` | Fundo escuro para opções | Cards de seleção (radio, toggle) |
| `.card-option-selected-3d` | Estado selecionado | Card ativo/selecionado |
| `.card-extreme-3d` | Profundidade extrema (120px) | Cards de destaque máximo |

---

## Classes de Ícones

| Classe | Descrição | Quando Usar |
|--------|-----------|-------------|
| `.icon-neon-blue` | Ciano com drop-shadow glow | Ícones padrão em toda interface |
| `.icon-neon-blue-hover` | Intensifica no hover | Ícones interativos |
| `.icon-neon-themed` | Usa cor do tema atual | Ícones que mudam com tema |

---

## Classes de Logo

| Classe | Descrição |
|--------|-----------|
| `.logo-tsi` | Estilo "TSi" com neon ciano |
| `.logo-jukebox` | Estilo "JUKEBOX" com neon |
| `.logo-tsi-metal` | Variante metal escuro para TSi |
| `.logo-jukebox-metal` | Variante metal escuro para JUKEBOX |
| `.logo-container-3d` | Container com profundidade 3D |
| `.logo-container-metal` | Container para variante metal |
| `.logo-animate` | Animação de pulsação |

---

## Animações

### Keyframes Disponíveis

| Animação | Duração | Uso |
|----------|---------|-----|
| `pulse-glow-cyan` | 1.5s | Hover em botões ciano |
| `pulse-glow-amber` | 1.5s | Hover em botões âmbar |
| `pulse-glow-white` | 1.5s | Hover em botões brancos |
| `pulse-glow-red` | 1.2s | Hover em botões vermelhos (urgência) |
| `pulse-glow-primary` | 1.2s | Botão Play/Pause |
| `shimmer-border` | 2s | Borda com shimmer em cards |
| `logo-pulse` | 2s | Pulsação do logo |

---

## Regras de Uso

### ✅ FAÇA

```tsx
// Use classes semânticas do design system
<Button variant="kiosk-outline">

// Use tokens de cor
<div className="bg-kiosk-surface text-kiosk-text">

// Use classes de label apropriadas
<Label className="text-label-yellow">Campo Obrigatório</Label>

// Use ícones com classe neon
<Settings className="icon-neon-blue" />
```

### ❌ NÃO FAÇA

```tsx
// ❌ Não use cores diretas
<div className="bg-white text-black">

// ❌ Não use variant="outline" sem neon
<Button variant="outline">

// ❌ Não use opacidades arbitrárias
<p className="text-gray-500">

// ❌ Não use bg-background ou bg-muted sozinhos
<div className="bg-background">
```

---

## Componentes Reutilizáveis

### LogoBrand

```tsx
import { LogoBrand } from '@/components/ui/LogoBrand';

// Tamanhos: sm, md, lg, xl
// Variantes: default, ultra, bulge, mirror, mirror-dark, silver, metal, hologram
<LogoBrand size="lg" variant="metal" showTagline animate />
```

### BrandLogo (Recomendado)

```tsx
import { BrandLogo } from '@/components/ui';

// Componente unificado com LogoBrand + Tagline
<BrandLogo 
  size="lg" 
  variant="metal" 
  animate="cascade"
  showTagline
  taglineVariant="neon"
/>
```

### BrandText

```tsx
import { BrandText } from '@/components/ui';

// Texto "TSiJUKEBOX" com shimmer e typing
<BrandText size="xl" animate="typing" typingSpeed={80} />
```

### SplashScreen

```tsx
import { SplashScreen } from '@/components/ui';

<SplashScreen 
  variant="cyberpunk"
  logoAnimation="glitch"
  duration={3000}
  onComplete={() => setLoaded(true)}
/>
```

### PageTitle

```tsx
import { PageTitle } from '@/components/ui/PageTitle';

<PageTitle 
  title="Dashboard" 
  subtitle="Estatísticas do sistema"
  icon={LayoutDashboard}
  backTo="/"
  showLogo
/>
```

### SettingsSection

```tsx
import { SettingsSection } from '@/components/settings/SettingsSection';

<SettingsSection
  icon={<Database className="icon-neon-blue" />}
  title="Banco de Dados"
  description="Configure o armazenamento"
  defaultOpen={false}
>
  {/* Conteúdo */}
</SettingsSection>
```

---

## Brand Components API

Veja [BRAND-COMPONENTS.md](./BRAND-COMPONENTS.md) para documentação completa.

### Tipos de Animação

| Animação | Duração | Descrição |
|----------|---------|-----------|
| `none` | - | Sem animação |
| `fade` | 0.8s | Fade in suave |
| `slide-up` | 0.6s | Desliza de baixo |
| `scale` | 0.5s | Escala de 70% a 100% |
| `cascade` | staggered | Elementos em sequência |
| `splash` | 0.8s | Scale + slide elegante |
| `glitch` | continuous | Distorção cyberpunk |

### Variantes de Logo

| Variante | Descrição |
|----------|-----------|
| `default` | Estilo padrão neon |
| `metal` | Metal escuro premium |
| `hologram` | Efeito 3D flutuante |
| `ultra` | Ultra brilhante |
| `mirror` | Reflexo espelhado |
| `silver` | Metálico prateado |

---

## Referência Rápida de Contraste

| Elemento | Classe Recomendada | Ratio Mínimo |
|----------|-------------------|--------------|
| Texto principal | `text-kiosk-text` | 4.5:1 |
| Texto grande (≥18px bold) | `text-kiosk-text/90` | 3:1 |
| Labels | `text-label-yellow` | 4.5:1 |
| Ícones decorativos | `icon-neon-blue` | 3:1 |
| Bordas ativas | `border-cyan-500` | 3:1 |

---

## Manutenção

### Adicionando Novas Cores

1. Defina a variável CSS em `src/index.css` dentro de `:root`
2. Adicione ao `tailwind.config.ts` se precisar de classes Tailwind
3. Documente neste arquivo com uso recomendado

### Criando Novas Classes de Efeito

1. Adicione em `src/index.css` na seção apropriada
2. Use HSL para cores (compatibilidade com temas)
3. Inclua estados de hover quando aplicável
4. Teste contraste em modo escuro

---

**Última atualização:** Dezembro 2024  
**Versão do Design System:** 4.1
