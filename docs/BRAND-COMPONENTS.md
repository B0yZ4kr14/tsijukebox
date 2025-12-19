# TSiJUKEBOX Brand Components

> Guia completo dos componentes de marca disponíveis no sistema

---

## Componentes Disponíveis

### BrandText

Renderiza "TSiJUKEBOX" com efeito shimmer opcional e animação de typing.

```tsx
import { BrandText } from '@/components/ui';

// Básico
<BrandText size="lg" />

// Com animação typing
<BrandText 
  size="xl" 
  animate="typing" 
  typingSpeed={80}
  onTypingComplete={() => console.log('Done!')}
/>

// Loop infinito
<BrandText size="lg" animate="typing-loop" />
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'md'` | Tamanho do texto |
| `weight` | `'light' \| 'normal' \| ... \| 'extrabold'` | `'bold'` | Peso da fonte |
| `noShimmer` | `boolean` | `false` | Desabilita efeito shimmer |
| `animate` | `'none' \| 'typing' \| 'typing-loop'` | `'none'` | Animação de typing |
| `typingSpeed` | `number` | `100` | Velocidade em ms por caractere |
| `typingDelay` | `number` | `0` | Delay inicial em ms |
| `onTypingComplete` | `() => void` | - | Callback ao completar |

---

### BrandTagline

Tagline "Enterprise Music System" com estilos variados.

```tsx
import { BrandTagline } from '@/components/ui';

<BrandTagline variant="neon" size="md" />
<BrandTagline variant="gradient" />
<BrandTagline variant="accent" />
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `'default' \| 'subtle' \| 'accent' \| 'neon' \| 'gradient'` | `'default'` | Estilo visual |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Tamanho |
| `className` | `string` | - | Classes adicionais |

---

### BrandLogo

Componente unificado com LogoBrand + BrandTagline.

```tsx
import { BrandLogo } from '@/components/ui';

// Logo completo com tagline
<BrandLogo 
  size="lg" 
  variant="metal" 
  animate="cascade"
  showTagline
/>

// Apenas logo com animação glitch
<BrandLogo 
  variant="hologram"
  animate="glitch"
  showTagline={false}
/>
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamanho do logo |
| `variant` | `LogoVariant` | `'default'` | Estilo visual (ver abaixo) |
| `animate` | `LogoAnimationType` | `'none'` | Animação de entrada |
| `showTagline` | `boolean` | `true` | Mostrar tagline |
| `taglineVariant` | `TaglineVariant` | `'default'` | Estilo da tagline |

**Variantes de Logo:**
- `default` - Estilo padrão com neon
- `ultra` - Ultra brilhante
- `bulge` - Efeito de protuberância
- `mirror` - Reflexo espelhado
- `mirror-dark` - Reflexo escuro
- `silver` - Metálico prateado
- `metal` - Metal escuro premium
- `brand` - Cores da marca
- `hologram` - Efeito 3D holográfico

---

### SplashScreen

Tela de carregamento completa com progress bar.

```tsx
import { SplashScreen } from '@/components/ui';

<SplashScreen 
  variant="cyberpunk"
  logoAnimation="glitch"
  duration={3000}
  onComplete={() => setLoaded(true)}
  allowSkip
/>
```

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `duration` | `number` | `3000` | Duração em ms |
| `onComplete` | `() => void` | - | Callback ao completar |
| `showProgress` | `boolean` | `true` | Mostrar barra de progresso |
| `variant` | `'default' \| 'minimal' \| 'cyberpunk' \| 'elegant'` | `'default'` | Tema visual |
| `logoAnimation` | `LogoAnimationType` | `'splash'` | Animação do logo |
| `logoVariant` | `LogoVariant` | `'metal'` | Estilo do logo |
| `allowSkip` | `boolean` | `true` | Permitir pular com clique |

---

## Animações

| Nome | Duração | Descrição | Uso Recomendado |
|------|---------|-----------|-----------------|
| `none` | - | Sem animação | Estados estáticos |
| `fade` | 0.8s | Fade in suave | Transições gerais |
| `slide-up` | 0.6s | Desliza de baixo | Headers, modais |
| `scale` | 0.5s | Escala de 70% a 100% | Botões, ícones |
| `cascade` | staggered | Elementos em sequência | Listas, menus |
| `splash` | 0.8s | Scale + slide elegante | Splash screens |
| `glitch` | continuous | Distorção cyberpunk | Temas tech/hacker |
| `typing` | variable | Efeito typewriter | Títulos animados |

---

## Hook useSplashScreen

Gerenciador de estado para splash screens.

```tsx
import { useSplashScreen } from '@/hooks/common';

function App() {
  const { 
    isVisible, 
    progress, 
    skip, 
    complete,
    restart 
  } = useSplashScreen({
    minDuration: 3000,
    persistSkip: true,
    onComplete: () => console.log('Splash complete!')
  });

  return (
    <>
      {isVisible && (
        <SplashScreen 
          progress={progress} 
          onSkip={skip}
        />
      )}
      <MainApp />
    </>
  );
}
```

| Config | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `minDuration` | `number` | `2000` | Duração mínima em ms |
| `maxDuration` | `number` | `10000` | Duração máxima em ms |
| `persistSkip` | `boolean` | `false` | Salvar skip no localStorage |
| `storageKey` | `string` | `'tsijukebox_splash_shown'` | Chave do localStorage |
| `waitForResources` | `boolean` | `false` | Aguardar recursos |
| `onStart` | `() => void` | - | Callback ao iniciar |
| `onComplete` | `() => void` | - | Callback ao completar |

---

## Acessibilidade

Todas as animações respeitam `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .brand-logo-glitch-container,
  .logo-animate-hologram,
  .logo-animate {
    animation: none;
  }
}
```

### Considerações

- Animações são desabilitadas automaticamente para usuários que preferem movimento reduzido
- O `SplashScreen` permite skip via clique ou tecla
- Todas as cores atendem ao contraste mínimo WCAG 2.1 AA

---

## Exemplos de Uso

### Splash Screen em App.tsx

```tsx
import { useState } from 'react';
import { SplashScreen } from '@/components/ui';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen 
          variant="cyberpunk"
          logoAnimation="glitch"
          duration={3000}
          onComplete={() => setShowSplash(false)}
        />
      )}
      {!showSplash && <MainContent />}
    </>
  );
}
```

### Header com Logo Animado

```tsx
import { BrandLogo } from '@/components/ui';

function Header() {
  return (
    <header className="p-4">
      <BrandLogo 
        size="md"
        variant="metal"
        animate="fade"
        taglineVariant="neon"
      />
    </header>
  );
}
```

### Título com Typing Effect

```tsx
import { BrandText } from '@/components/ui';

function HeroSection() {
  return (
    <div className="text-center py-16">
      <BrandText 
        size="3xl"
        animate="typing"
        typingSpeed={100}
      />
      <p className="mt-4 text-muted-foreground">
        Enterprise Music System
      </p>
    </div>
  );
}
```

---

## Configuração via Docker

As variantes de brand podem ser configuradas via variáveis de ambiente:

```bash
docker run -d \
  -e VITE_SPLASH_ENABLED=true \
  -e VITE_SPLASH_VARIANT=cyberpunk \
  -e VITE_SPLASH_DURATION=3000 \
  -e VITE_LOGO_VARIANT=metal \
  -e VITE_LOGO_ANIMATION=glitch \
  tsijukebox/app:latest
```

---

## Referência de Cores

### Paleta do Logo

| Elemento | Cor | HSL |
|----------|-----|-----|
| TSi Text | Cyan/Blue | `hsl(210 100% 70%)` |
| JUKEBOX Text | Gold/Amber | `hsl(45 100% 65%)` |
| Glow Primary | Cyan | `hsl(195 100% 50%)` |
| Glow Secondary | Gold | `hsl(45 100% 55%)` |

### Variantes Especiais

| Variante | Característica |
|----------|---------------|
| `hologram` | Gradiente cyan-gold com reflexo 3D flutuante |
| `glitch` | Distorção RGB com scanlines |
| `metal` | Textura metálica com reflexos |

---

**Última atualização:** Dezembro 2024  
**Versão:** 4.1.0
