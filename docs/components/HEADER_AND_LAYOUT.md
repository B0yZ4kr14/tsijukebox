# Header & MainLayout

**Tipo:** React Components
**Localização:** `src/components/navigation/Header.tsx` e `src/components/layout/MainLayout.tsx`
**Versão:** 1.0.0
**Categoria:** Navigation & Layout

---

## Descrição

Os componentes `MainLayout` e `Header` formam a espinha dorsal da estrutura visual e de navegação da aplicação TSiJUKEBOX. O `MainLayout` organiza a disposição geral da página, integrando a `GlobalSidebar`, o `Header` e a área de conteúdo principal. O `Header` fornece a navegação superior, incluindo breadcrumbs, busca e ações do usuário.

---

## 1. MainLayout Component

O `MainLayout` é o componente de layout de mais alto nível que define a estrutura da aplicação.

### Principais recursos:
- **Integração de Layout:** Combina `GlobalSidebar`, `Header`, e a área de conteúdo (`children` ou `<Outlet />`).
- **Responsividade:** Adapta a exibição da `GlobalSidebar` para diferentes tamanhos de tela (fixa em desktop, overlay em mobile).
- **Gerenciamento de Estado:** Utiliza o hook `useGlobalSidebar` para controlar o estado da sidebar e gerencia o estado do menu móvel.
- **Animações:** Usa `Framer Motion` para animar a entrada e saída da sidebar móvel e seu backdrop.

### Uso Básico (com React Router)

```typescript
// Em App.tsx ou no seu arquivo de rotas
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Outras rotas aninhadas */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Propriedades (`MainLayoutProps`)

| Propriedade | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `children` | `React.ReactNode` | Não | Conteúdo a ser renderizado dentro do layout. Se não for fornecido, usará o `<Outlet />` do React Router. |

---

## 2. Header Component

O `Header` é a barra de navegação superior da aplicação.

### Principais recursos:
- **Breadcrumbs:** Gera automaticamente um caminho de navegação baseado na rota atual.
- **Busca:** Um campo de busca animado e expansível.
- **Notificações:** Um painel dropdown para exibir notificações do sistema, com um contador de itens não lidos.
- **Menu de Perfil:** Um menu dropdown para acesso ao perfil do usuário, configurações e logout.
- **Controle de Menu Móvel:** Fornece o botão para abrir/fechar a `GlobalSidebar` em telas menores.

### Uso Básico

O `Header` é usado internamente pelo `MainLayout`, mas pode ser usado de forma independente se necessário.

```typescript
import { Header } from '@/components/navigation/Header';

function MyCustomLayout() {
  const handleMenuClick = () => { /* ... */ };

  return (
    <div>
      <Header onMenuClick={handleMenuClick} />
      {/* Resto do layout */}
    </div>
  );
}
```

### Propriedades (`HeaderProps`)

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `className` | `string` | `undefined` | Classes CSS adicionais. |
| `onMenuClick` | `() => void` | `undefined` | Callback para o clique no botão de menu (usado para mobile/toggle da sidebar). |
| `showBreadcrumbs` | `boolean` | `true` | Controla a visibilidade dos breadcrumbs. |
| `showSearch` | `boolean` | `true` | Controla a visibilidade da busca. |
| `showNotifications` | `boolean` | `true` | Controla a visibilidade das notificações. |
| `showProfile` | `boolean` | `true` | Controla a visibilidade do menu de perfil. |

---

## Integração e Fluxo de Dados

1.  **`MainLayout`** detecta o tamanho da tela.
2.  Em **desktop**, ele renderiza a `GlobalSidebar` fixa e o `Header`.
3.  Em **mobile**, ele esconde a `GlobalSidebar` e o `Header` exibe um botão de menu.
4.  O `onMenuClick` do `Header` é passado pelo `MainLayout` para controlar a visibilidade da `GlobalSidebar` no modo overlay em telas móveis.
5.  O estado de recolhimento da sidebar em desktop é gerenciado pelo hook `useGlobalSidebar` e sincronizado com a `GlobalSidebar`.

---

## Exemplo Completo

O arquivo `src/components/layout/MainLayout.tsx` é o melhor exemplo de como os componentes `Header` e `GlobalSidebar` trabalham juntos.

```typescript
// Trecho simplificado de MainLayout.tsx

export function MainLayout({ children }: MainLayoutProps) {
  const { collapsed, setCollapsed, toggleCollapsed } = useGlobalSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ... lógica para detectar se é mobile

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleCollapsed();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar para Desktop */}
      <div className="hidden lg:block">
        <GlobalSidebar defaultCollapsed={collapsed} onCollapsedChange={setCollapsed} />
      </div>

      {/* Sidebar para Mobile (com AnimatePresence) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          // ... Lógica da sidebar móvel e backdrop
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <div className="flex flex-col flex-1">
        <Header onMenuClick={handleMenuClick} />
        <main className="flex-1 p-6">
          {children || <Outlet />}
        </main>
        {/* Footer */}
      </div>
    </div>
  );
}
```

---

## Relacionados

- [GlobalSidebar](./GLOBAL_SIDEBAR.md) - Componente da barra de navegação lateral.
- [LayoutContext](../contexts/LAYOUTCONTEXT.md) - Contexto que pode ser usado para um gerenciamento de estado de layout mais desacoplado.
- [React Router](https://reactrouter.com/) - Usado para navegação e para gerar os breadcrumbs.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação dos componentes `MainLayout` e `Header`.
- ✅ Layout responsivo para desktop e mobile.
- ✅ Integração com `GlobalSidebar`.
- ✅ Funcionalidades de breadcrumbs, busca, notificações e perfil no `Header`.
- ✅ Documentação completa.
