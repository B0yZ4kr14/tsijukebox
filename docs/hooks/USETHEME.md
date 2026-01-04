# useTheme

**Tipo:** React Hook (Context)  
**Localização:** `src/contexts/ThemeContext.tsx`  
**Versão:** 1.0.0  
**Categoria:** UI & Styling

---

## Descrição

O hook `useTheme` gerencia o sistema de temas do TSiJUKEBOX, incluindo cores, modo claro/escuro, idioma, acessibilidade e preferências de feedback visual/sonoro. Integra-se com as preferências do sistema operacional e persiste configurações em localStorage.

**Principais recursos:**
- Sistema de cores com 6 temas predefinidos
- Modo escuro/claro/automático
- Suporte a preferências do sistema (prefers-color-scheme)
- Controles de acessibilidade (alto contraste, redução de movimento)
- Gerenciamento de idioma
- Controle de sons e animações
- Persistência automática

---

## Uso Básico

```typescript
import { useTheme } from '@/contexts/ThemeContext';

function ThemeSwitcher() {
  const {
    theme,
    setTheme,
    themeMode,
    setThemeMode,
    isDarkMode,
    animationsEnabled,
    setAnimationsEnabled
  } = useTheme();

  return (
    <div>
      {/* Seletor de Cor */}
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="blue">Azul</option>
        <option value="green">Verde</option>
        <option value="purple">Roxo</option>
        <option value="orange">Laranja</option>
        <option value="pink">Rosa</option>
        <option value="custom">Personalizado</option>
      </select>

      {/* Modo Claro/Escuro */}
      <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)}>
        <option value="dark">Escuro</option>
        <option value="light">Claro</option>
        <option value="system">Sistema</option>
      </select>

      {/* Status */}
      <p>Modo atual: {isDarkMode ? 'Escuro' : 'Claro'}</p>

      {/* Animações */}
      <label>
        <input
          type="checkbox"
          checked={animationsEnabled}
          onChange={(e) => setAnimationsEnabled(e.target.checked)}
        />
        Animações
      </label>
    </div>
  );
}
```

---

## Retorno

### `ThemeContextType`

O hook retorna um objeto com o estado do tema e funções de controle.

---

## Configurações de Cor

### `theme`: `ThemeColor`

Tema de cores ativo.

**Tipo `ThemeColor`:**
```typescript
type ThemeColor = 
  | 'blue'    // Azul (padrão)
  | 'green'   // Verde
  | 'purple'  // Roxo
  | 'orange'  // Laranja
  | 'pink'    // Rosa
  | 'custom'; // Personalizado
```

**Padrão:** `'blue'`

**Cores CSS aplicadas:**
```css
/* blue */
--primary: 217 91% 60%;
--primary-foreground: 0 0% 100%;

/* green */
--primary: 142 76% 36%;
--primary-foreground: 0 0% 100%;

/* purple */
--primary: 262 83% 58%;
--primary-foreground: 0 0% 100%;

/* orange */
--primary: 25 95% 53%;
--primary-foreground: 0 0% 100%;

/* pink */
--primary: 330 81% 60%;
--primary-foreground: 0 0% 100%;
```

---

### `setTheme`: `(theme: ThemeColor) => void`

Define o tema de cores.

**Exemplo:**
```typescript
setTheme('purple'); // Tema roxo
setTheme('green');  // Tema verde
```

---

## Configurações de Modo

### `themeMode`: `ThemeMode`

Modo de tema (claro/escuro/sistema).

**Tipo `ThemeMode`:**
```typescript
type ThemeMode = 
  | 'dark'   // Sempre escuro
  | 'light'  // Sempre claro
  | 'system'; // Seguir sistema
```

**Padrão:** `'dark'`

---

### `setThemeMode`: `(mode: ThemeMode) => void`

Define o modo de tema.

**Exemplo:**
```typescript
setThemeMode('dark');   // Forçar escuro
setThemeMode('light');  // Forçar claro
setThemeMode('system'); // Seguir sistema
```

---

### `isDarkMode`: `boolean`

Indica se o modo escuro está ativo (considerando preferências do sistema).

**Lógica:**
```typescript
const isDarkMode = 
  themeMode === 'dark' || 
  (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
```

---

## Configurações de Idioma

### `language`: `Language`

Idioma da interface.

**Tipo `Language`:**
```typescript
type Language = 'pt-BR' | 'en-US' | 'es-ES';
```

**Padrão:** `'pt-BR'`

---

### `setLanguage`: `(lang: Language) => void`

Define o idioma da interface.

**Exemplo:**
```typescript
setLanguage('en-US'); // Inglês
setLanguage('pt-BR'); // Português
setLanguage('es-ES'); // Espanhol
```

---

## Configurações de Feedback

### `soundEnabled`: `boolean`

Indica se efeitos sonoros estão habilitados.

**Padrão:** `true`

---

### `setSoundEnabled`: `(value: boolean) => void`

Habilita/desabilita efeitos sonoros.

**Exemplo:**
```typescript
setSoundEnabled(false); // Desabilitar sons
```

---

### `animationsEnabled`: `boolean`

Indica se animações estão habilitadas.

**Padrão:** `true`

---

### `setAnimationsEnabled`: `(value: boolean) => void`

Habilita/desabilita animações.

**Exemplo:**
```typescript
setAnimationsEnabled(false); // Desabilitar animações
```

---

## Configurações de Acessibilidade

### `highContrast`: `boolean`

Indica se o modo de alto contraste está ativo.

**Padrão:** `false` (ou preferência do sistema)

---

### `setHighContrast`: `(value: boolean) => void`

Ativa/desativa alto contraste.

**Exemplo:**
```typescript
setHighContrast(true); // Ativar alto contraste
```

**Efeito:**
```css
[data-high-contrast="true"] {
  --border: 0 0% 100%;
  --foreground: 0 0% 100%;
  /* Contraste aumentado */
}
```

---

### `reducedMotion`: `boolean`

Indica se a redução de movimento está ativa.

**Padrão:** `false` (ou preferência do sistema)

---

### `setReducedMotion`: `(value: boolean) => void`

Ativa/desativa redução de movimento.

**Exemplo:**
```typescript
setReducedMotion(true); // Reduzir animações
```

**Efeito:**
```css
[data-reduced-motion="true"] * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

---

## Exemplo Completo: Painel de Tema e Acessibilidade

```typescript
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Volume2,
  VolumeX,
  Sparkles,
  Eye,
  Accessibility
} from 'lucide-react';

function ThemeSettings() {
  const {
    theme,
    setTheme,
    themeMode,
    setThemeMode,
    isDarkMode,
    language,
    setLanguage,
    soundEnabled,
    setSoundEnabled,
    animationsEnabled,
    setAnimationsEnabled,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion
  } = useTheme();

  const themes: Array<{ value: ThemeColor; label: string; color: string }> = [
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
    { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
    { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
    { value: 'custom', label: 'Personalizado', color: 'bg-gradient-to-r from-cyan-500 to-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Cor do Tema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <h3 className="font-semibold">Cor do Tema</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${theme === t.value 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                <div className={`w-full h-12 rounded ${t.color} mb-2`} />
                <p className="text-sm font-medium">{t.label}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modo Claro/Escuro */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            <h3 className="font-semibold">Modo de Exibição</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setThemeMode('light')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${themeMode === 'light' 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <Sun className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Claro</p>
            </button>

            <button
              onClick={() => setThemeMode('dark')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${themeMode === 'dark' 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <Moon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Escuro</p>
            </button>

            <button
              onClick={() => setThemeMode('system')}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${themeMode === 'system' 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <Monitor className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Sistema</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Idioma */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Idioma</h3>
        </CardHeader>
        <CardContent>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full p-2 rounded-lg border bg-background"
          >
            <option value="pt-BR">🇧🇷 Português (Brasil)</option>
            <option value="en-US">🇺🇸 English (US)</option>
            <option value="es-ES">🇪🇸 Español</option>
          </select>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Feedback</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <p className="font-medium">Efeitos Sonoros</p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {/* Animações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <p className="font-medium">Animações</p>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Acessibilidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            <h3 className="font-semibold">Acessibilidade</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alto Contraste */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <div>
                <p className="font-medium">Alto Contraste</p>
                <p className="text-xs text-muted-foreground">
                  Aumenta o contraste das cores
                </p>
              </div>
            </div>
            <Switch
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>

          {/* Redução de Movimento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <div>
                <p className="font-medium">Reduzir Movimento</p>
                <p className="text-xs text-muted-foreground">
                  Minimiza animações e transições
                </p>
              </div>
            </div>
            <Switch
              checked={reducedMotion}
              onCheckedChange={setReducedMotion}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ThemeSettings;
```

---

## Integração com Sistema Operacional

### Preferências Detectadas

O hook detecta automaticamente as seguintes preferências do sistema:

#### `prefers-color-scheme`

```typescript
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

**Uso:**
```typescript
// Quando themeMode === 'system'
const isDarkMode = systemPrefersDark;
```

---

#### `prefers-reduced-motion`

```typescript
const systemPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

**Uso:**
```typescript
// Inicialização
const [reducedMotion, setReducedMotion] = useState(systemPrefersReducedMotion);
```

---

#### `prefers-contrast`

```typescript
const systemPrefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;
```

**Uso:**
```typescript
// Inicialização
const [highContrast, setHighContrast] = useState(systemPrefersHighContrast);
```

---

## Persistência

As configurações são automaticamente salvas em **localStorage**.

### Chaves de Storage

| Configuração | Chave | Tipo |
|--------------|-------|------|
| Tema de cores | `tsi_jukebox_theme` | `ThemeColor` |
| Modo (claro/escuro) | `tsi_jukebox_theme_mode` | `ThemeMode` |
| Idioma | `tsi_jukebox_language` | `Language` |
| Feedback (sons/animações) | `tsi_jukebox_feedback` | `FeedbackSettings` |
| Acessibilidade | `tsi_jukebox_accessibility` | `AccessibilitySettings` |

**Estrutura `FeedbackSettings`:**
```typescript
interface FeedbackSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
}
```

**Estrutura `AccessibilitySettings`:**
```typescript
interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
}
```

---

## Aplicação de Estilos

### Data Attributes

O ThemeProvider aplica data attributes no elemento `<html>`:

```html
<html
  data-theme="purple"
  data-theme-mode="dark"
  data-high-contrast="false"
  data-reduced-motion="false"
  class="dark"
>
```

### CSS Variables

```css
:root {
  /* Cores do tema */
  --primary: 262 83% 58%;
  --primary-foreground: 0 0% 100%;
  
  /* Background */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* ... outras variáveis */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## Integração com Framer Motion

```typescript
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

function AnimatedComponent() {
  const { animationsEnabled, reducedMotion } = useTheme();

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: reducedMotion ? 0.01 : 0.3,
        ease: 'easeOut'
      }}
      // Desabilitar animações se necessário
      {...(!animationsEnabled && { initial: false, animate: false })}
    >
      Conteúdo animado
    </motion.div>
  );
}
```

---

## Performance

### Otimizações

1. **useMemo** - Valor do contexto memoizado
2. **useCallback** - Funções memoizadas
3. **localStorage** - Salvamento debounced
4. **Media queries** - Listeners otimizados

### Recomendações

```typescript
// ✅ Preferir
const { theme, isDarkMode } = useTheme();

// ❌ Evitar
const themeContext = useTheme();
// Acessa tudo, causa re-renders desnecessários
```

---

## Acessibilidade

- ✅ Suporte a `prefers-color-scheme`
- ✅ Suporte a `prefers-reduced-motion`
- ✅ Suporte a `prefers-contrast`
- ✅ Alto contraste configurável
- ✅ Redução de movimento configurável
- ✅ Múltiplos idiomas

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

describe('useTheme', () => {
  it('should change theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    });

    act(() => {
      result.current.setTheme('purple');
    });

    expect(result.current.theme).toBe('purple');
  });

  it('should toggle dark mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ThemeProvider
    });

    act(() => {
      result.current.setThemeMode('light');
    });

    expect(result.current.isDarkMode).toBe(false);
  });
});
```

---

## Notas

- Requer **ThemeProvider** no topo da árvore de componentes
- Preferências do sistema são **detectadas automaticamente**
- Configurações são **persistidas automaticamente**
- Suporta **hot reload** sem perda de estado
- **6 temas de cores** predefinidos

---

## Relacionados

- [useSettings](./USESETTINGS.md) - Hook de configurações gerais
- [Design System](../DESIGN_SYSTEM.md) - Sistema de design
- [Guia de Acessibilidade](../guides/ACCESSIBILITY.md)
- [Tailwind CSS](https://tailwindcss.com/)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Sistema de temas com 6 cores
- ✅ Modo claro/escuro/sistema
- ✅ Integração com preferências do sistema
- ✅ Controles de acessibilidade
- ✅ Gerenciamento de idioma
- ✅ Persistência automática
- ✅ Documentação completa
