# UserContext

**Tipo:** React Context  
**Localização:** `src/contexts/UserContext.tsx`  
**Versão:** 1.0.0

---

## Descrição

Contexto de autenticação e gerenciamento de usuário. Fornece informações do usuário logado, funções de login/logout e configurações de autenticação.

---

## Provider

```typescript
import { UserProvider } from '@/contexts/UserContext';

function App() {
  return (
    <UserProvider>
      {/* Sua aplicação */}
    </UserProvider>
  );
}
```

---

## Valores do Contexto

### `user`: `User | null`

Usuário autenticado ou null se não autenticado

---

### `isAuthenticated`: `boolean`

Se o usuário está autenticado

---

### `isLoading`: `boolean`

Se está carregando dados do usuário

---

### `authConfig`: `AuthConfig`

Configurações de autenticação (provider, etc.)

---

### `login`: `(email: string, password: string) => Promise<boolean>`

Função de login

---

### `logout`: `() => Promise<void>`

Função de logout

---

### `signUp`: `(email: string, password: string) => Promise<{error?: Error}>`

Função de registro

---

### `setAuthProvider`: `(provider: "supabase" | "local") => void`

Altera provider de autenticação

---

## Hook

```typescript
import { useUser } from '@/contexts/UserContext';

const user = useUser();
```

---

## Exemplo Completo

```typescript
import { UserProvider, useUser } from '@/contexts/UserContext';

// No App.tsx
function App() {
  return (
    <UserProvider>
      <YourApp />
    </UserProvider>
  );
}

// Em qualquer componente
function Profile() {
  const { user, logout } = useUser();
  
  if (!user) return <div>Não autenticado</div>;
  
  return (
    <div>
      <h1>Olá, {user.email}</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

## Notas

- O Provider deve envolver toda a aplicação ou a parte que precisa acessar o contexto
- Valores são memoizados para evitar re-renders desnecessários
- Suporta TypeScript com tipagem completa

---

## Relacionados

- [Arquitetura](../ARCHITECTURE.md)
- [Hooks](../hooks/)
