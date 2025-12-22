# 🛣️ Sistema de Rotas

> Documentação do sistema centralizado de rotas do TSiJUKEBOX.

---

## 📋 Visão Geral

O TSiJUKEBOX utiliza um sistema de rotas centralizado em `src/routes/index.tsx` que organiza todas as rotas em 6 categorias:

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| **Public** | 19 | Acessíveis sem autenticação |
| **Protected** | 3 | Requerem autenticação |
| **Dashboard** | 7 | Monitoramento e analytics |
| **Spotify** | 4 | Integração Spotify |
| **YouTube** | 4 | Integração YouTube Music |
| **Admin** | 4 | Funções administrativas |
| **Total** | **42** | Incluindo 404 |

---

## 🏗️ Arquitetura

```
src/routes/
└── index.tsx          # Configuração centralizada de rotas
    ├── publicRoutes   # Rotas públicas
    ├── protectedRoutes # Rotas protegidas
    ├── dashboardRoutes # Dashboards
    ├── spotifyRoutes   # Spotify
    ├── youtubeRoutes   # YouTube Music
    ├── adminRoutes     # Admin
    └── allRoutes       # Agregação
```

---

## 🔒 Permissões

| Permissão | Descrição | Roles |
|-----------|-----------|-------|
| `canAccessSettings` | Acesso a configurações | Admin, User |
| `canManageUsers` | Gerenciamento de usuários | Admin |
| `canAccessSystemControls` | Controles do sistema | Admin |

---

## 📝 Adicionando Novas Rotas

### 1. Criar o componente

```tsx
// src/pages/MinhaNovaPage.tsx
export default function MinhaNovaPage() {
  return <div>Minha Nova Página</div>;
}
```

### 2. Adicionar import lazy

```tsx
// src/routes/index.tsx
const MinhaNovaPage = lazy(() => import('@/pages/MinhaNovaPage'));
```

### 3. Adicionar à categoria

```tsx
export const publicRoutes: RouteConfig[] = [
  // ... outras rotas
  { path: '/minha-nova-pagina', element: <MinhaNovaPage /> },
];
```

---

## 📚 Documentação Completa

Para documentação completa do sistema de rotas, consulte:

- [📄 docs/ROUTES.md](../ROUTES.md) - Tabela completa de rotas
- [📐 docs/ARCHITECTURE.md](../ARCHITECTURE.md) - Arquitetura do sistema
- [🧪 e2e/specs/routes-validation.spec.ts](../../e2e/specs/routes-validation.spec.ts) - Testes E2E

---

## 🧪 Testando Rotas

```bash
# Executar testes de validação de rotas
npx playwright test routes-validation

# Com UI
npx playwright test routes-validation --ui
```

---

*TSiJUKEBOX v4.2.0 - Dedicated to the Public Domain*
