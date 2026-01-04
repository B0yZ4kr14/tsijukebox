# LayoutContext

**Tipo:** React Context  
**Localização:** `src/contexts/LayoutContext.tsx`  
**Hook Principal:** `useLayout`  
**Versão:** 1.0.0  
**Categoria:** UI & State Management

---

## Descrição

O `LayoutContext` é responsável por gerenciar o estado global da interface do usuário (UI) do TSiJUKEBOX. Ele controla a visibilidade e o estado de componentes de layout principais, como a barra lateral (sidebar), o menu móvel e o tema (claro/escuro), permitindo que diferentes partes da aplicação compartilhem e modifiquem essas configurações de forma centralizada.

**Principais recursos:**
- Controle do estado da barra lateral (recolhida/expandida)
- Gerenciamento do menu de navegação em dispositivos móveis
- Controle de visibilidade do cabeçalho e rodapé
- Troca de tema (claro/escuro)
- Persistência do estado do layout no `localStorage`

---

## Uso Básico

```typescript
import { useLayout } from '@/contexts/LayoutContext';

function Header() {
  const { 
    sidebarCollapsed, 
    toggleSidebar, 
    mobileMenuOpen, 
    toggleMobileMenu 
  } = useLayout();

  return (
    <header>
      {/* Botão para a sidebar em desktop */}
      <button onClick={toggleSidebar}>
        {sidebarCollapsed ? 'Expandir' : 'Recolher'}
      </button>

      {/* Botão para o menu em mobile */}
      <button onClick={toggleMobileMenu} className="mobile-only">
        {mobileMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}
      </button>
    </header>
  );
}
```

---

## Estado do Contexto (`LayoutState`)

### `sidebarCollapsed`: `boolean`

Indica se a barra lateral principal está recolhida.

**Padrão:** `false`

---

### `mobileMenuOpen`: `boolean`

Indica se o menu de navegação móvel está aberto.

**Padrão:** `false`

---

### `headerVisible`: `boolean`

Indica se o cabeçalho principal da aplicação está visível.

**Padrão:** `true`

---

### `footerVisible`: `boolean`

Indica se o rodapé principal da aplicação está visível.

**Padrão:** `true`

---

### `theme`: `'dark' | 'light'`

Indica o tema atual da aplicação.

**Padrão:** `'dark'`

---

## Funções do Contexto

### `setSidebarCollapsed`: `(collapsed: boolean) => void`

Define o estado de recolhimento da barra lateral.

**Exemplo:**
```typescript
// Forçar o recolhimento da sidebar
setSidebarCollapsed(true);
```

---

### `toggleSidebar`: `() => void`

Alterna o estado de recolhimento da barra lateral.

---

### `setMobileMenuOpen`: `(open: boolean) => void`

Define se o menu móvel está aberto ou fechado.

---

### `toggleMobileMenu`: `() => void`

Alterna a visibilidade do menu móvel.

---

### `setHeaderVisible`: `(visible: boolean) => void`

Controla a visibilidade do cabeçalho.

**Exemplo:**
```typescript
// Esconder o header em uma página específica
useEffect(() => {
  setHeaderVisible(false);
  return () => setHeaderVisible(true); // Mostra novamente ao sair da página
}, [setHeaderVisible]);
```

---

### `setFooterVisible`: `(visible: boolean) => void`

Controla a visibilidade do rodapé.

---

### `setTheme`: `(theme: 'dark' | 'light') => void`

Altera o tema da aplicação.

**Exemplo:**
```typescript
setTheme('light'); // Mudar para o tema claro
```

---

## Exemplo Completo: Layout Principal da Aplicação

```typescript
import { useLayout } from '@/contexts/LayoutContext';
import { GlobalSidebar } from '@/components/navigation/GlobalSidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

function MainLayout({ children }) {
  const { 
    sidebarCollapsed, 
    mobileMenuOpen, 
    headerVisible, 
    footerVisible, 
    theme 
  } = useLayout();

  return (
    <div className={`theme-${theme} flex h-screen`}>
      <GlobalSidebar collapsed={sidebarCollapsed} />
      
      {mobileMenuOpen && <MobileMenu />}

      <div className="flex flex-col flex-1 overflow-hidden">
        {headerVisible && <Header />}

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {footerVisible && <Footer />}
      </div>
    </div>
  );
}

function MobileMenu() {
  // Implementação do menu móvel
  return <div className="mobile-menu-overlay">...</div>;
}
```

---

## Persistência de Estado

O estado do `LayoutContext` é automaticamente salvo no `localStorage` do navegador para manter as preferências do usuário entre as sessões.

- **Chave:** `tsijukebox_layout_state`
- **Valor:** Um objeto JSON contendo o estado `LayoutState`.

```json
{
  "sidebarCollapsed": false,
  "mobileMenuOpen": false,
  "headerVisible": true,
  "footerVisible": true,
  "theme": "dark"
}
```

O estado é carregado na inicialização do `LayoutProvider` e salvo a cada modificação.

---

## Estrutura do Provider

O `LayoutProvider` é o componente que envolve a aplicação para fornecer o contexto.

```typescript
// src/contexts/LayoutContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export function LayoutProvider({ children }) {
  const [state, setState] = useState<LayoutState>(() => {
    // Carrega o estado inicial do localStorage ou usa o padrão
    // ...
  });

  useEffect(() => {
    // Salva o estado no localStorage sempre que ele muda
    localStorage.setItem('tsijukebox_layout_state', JSON.stringify(state));
  }, [state]);

  const value = {
    ...state,
    toggleSidebar: () => { /* ... */ },
    // ...outras funções
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
```

---

## Integração com o `ThemeContext`

Em versões mais recentes, a funcionalidade de tema (`theme`, `setTheme`) foi migrada para o `ThemeContext` para uma melhor separação de responsabilidades. O `LayoutContext` agora foca exclusivamente no estado estrutural do layout (sidebar, menus, etc.), enquanto o `ThemeContext` gerencia a aparência (cores, modo claro/escuro, acessibilidade).

**Estrutura Recomendada:**

```typescript
// Em App.tsx
<ThemeProvider>
  <LayoutProvider>
    {/* Resto da aplicação */}
  </LayoutProvider>
</ThemeProvider>
```

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';

describe('useLayout', () => {
  it('should toggle sidebar state', () => {
    const { result } = renderHook(() => useLayout(), {
      wrapper: LayoutProvider
    });

    expect(result.current.sidebarCollapsed).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarCollapsed).toBe(true);
  });

  it('should change theme', () => {
    const { result } = renderHook(() => useLayout(), {
      wrapper: LayoutProvider
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });
});
```

---

## Relacionados

- [ThemeContext](./THEMECONTEXT.md) - Contexto para gerenciamento de tema e aparência.
- [GlobalSidebar Component](../components/GLOBAL_SIDEBAR.md) - Componente da barra lateral.
- [Header & Layout Components](../components/HEADER_AND_LAYOUT.md) - Componentes de cabeçalho e layout principal.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação inicial do contexto de layout.
- ✅ Controle de estado da sidebar, menu móvel e tema.
- ✅ Persistência de estado no `localStorage`.
- ✅ Documentação completa.
