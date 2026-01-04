# GlobalSidebar

**Tipo:** React Component  
**Localização:** `src/components/navigation/GlobalSidebar.tsx`  
**Versão:** 1.0.0  
**Categoria:** Navigation & Layout

---

## Descrição

A `GlobalSidebar` é a barra de navegação lateral principal da aplicação TSiJUKEBOX. É um componente altamente estilizado e interativo que serve como o principal meio de navegação entre as diferentes seções do sistema. Ela é responsiva, animada e integrada com o Design System da aplicação.

**Principais recursos:**
- Navegação principal e seções de documentação.
- Estado recolhível (collapsed) com animações suaves (`Framer Motion`).
- Destaque do item de menu ativo baseado na rota atual (`react-router-dom`).
- Tooltips informativos quando a barra está recolhida.
- Seções de navegação e itens de menu configuráveis.
- Design consistente com o `Design System` (ícones, cores, tipografia).

---

## Uso Básico

O componente é geralmente usado dentro de um layout principal, como o `MainLayout`.

```typescript
import { GlobalSidebar } from '@/components/navigation/GlobalSidebar';
import { Header } from '@/components/layout/Header';

function MainLayout({ children }) {
  return (
    <div class="flex h-screen bg-bg-primary">
      <GlobalSidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main class="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Propriedades (`GlobalSidebarProps`)

| Propriedade | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `className` | `string` | Não | `undefined` | Classes CSS adicionais para customização do container principal. |
| `defaultCollapsed` | `boolean` | Não | `false` | Define se a sidebar deve iniciar no estado recolhido. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | Não | `undefined` | Função de callback que é chamada quando o estado de recolhimento muda. |

---

## Estrutura de Navegação

A navegação é definida pelo array `navigationSections` dentro do componente.

### `NavSection`

```typescript
interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}
```

### `NavItem`

```typescript
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType; // Ícone do Lucide React
  path: string;
  badge?: string; // Badge opcional (ex: "Beta")
  color?: string; // Classe de cor para o ícone ativo
}
```

### Exemplo de Dados

```typescript
const navigationSections: NavSection[] = [
  {
    id: 'main',
    title: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'player', label: 'Player', icon: Music, path: '/player' },
    ],
  },
  {
    id: 'documentation',
    title: 'Documentação',
    items: [
      { id: 'installation', label: 'Instalação', icon: Download, path: '/docs/installation' },
      // ... outros itens
    ],
  },
];
```

---

## Animações e Interatividade

- **Animações:** O componente utiliza `Framer Motion` para animar a largura da sidebar ao expandir/recolher e para animar a aparição/desaparição dos textos e títulos.
- **Estado Ativo:** O hook `useLocation` de `react-router-dom` é usado para determinar o item de menu ativo, aplicando estilos específicos (`bg-bg-tertiary`, borda lateral colorida, etc.).
- **Tooltips:** Quando a sidebar está recolhida, um tooltip aparece ao passar o mouse sobre um ícone, mostrando o label do item de menu.

---

## Exemplo Completo com Estado Controlado

É possível controlar o estado de recolhimento da sidebar a partir de um componente pai.

```typescript
import { useState } from 'react';
import { GlobalSidebar } from '@/components/navigation/GlobalSidebar';
import { Button } from '@/components/ui/button';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div class="flex">
      <GlobalSidebar 
        defaultCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
      />
      <main class="p-4">
        <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          Toggle Sidebar Externamente
        </Button>
        {/* Conteúdo da página */}
      </main>
    </div>
  );
}
```

---

## Estilização

- **Layout:** Construído com Flexbox e Tailwind CSS.
- **Cores e Temas:** Utiliza variáveis CSS do Design System para cores de fundo (`bg-bg-secondary`), bordas (`border-white/5`), e cores de destaque (`text-accent-cyan`, `text-accent-yellowGold`, etc.).
- **Ícones:** Utiliza a biblioteca `lucide-react` para todos os ícones.
- **Utilitário `cn`:** As classes são combinadas de forma condicional usando o utilitário `cn` para um código mais limpo.

---

## Componentes Internos

- **Header da Sidebar:** Exibe o logo e o botão de toggle.
- **Lista de Navegação:** Renderiza as seções e os itens de menu.
- **Footer da Sidebar:** Exibe informações do usuário, link para perfil/logout e créditos.

---

## Relacionados

- [LayoutContext](../contexts/LAYOUTCONTEXT.md) - Contexto que pode ser usado para gerenciar o estado da sidebar globalmente.
- [MainLayout](./HEADER_AND_LAYOUT.md) - Componente de layout que geralmente encapsula a `GlobalSidebar`.
- [Framer Motion](https://www.framer.com/motion/) - Biblioteca de animação utilizada.
- [Lucide React](https://lucide.dev/) - Biblioteca de ícones.

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação inicial do componente.
- ✅ Navegação por seções e itens.
- ✅ Estado recolhível com animações.
- ✅ Destaque de rota ativa.
- ✅ Documentação completa.
- ✅ Documentação completa.
