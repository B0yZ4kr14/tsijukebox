# AuthContext

**Tipo:** React Context  
**Localização:** `src/contexts/UserContext.tsx`  
**Hook Principal:** `useUser`  
**Versão:** 1.0.0  
**Categoria:** Authentication & Authorization

---

## Descrição

O `AuthContext` (implementado como `UserContext`) é o sistema central de autenticação e autorização do TSiJUKEBOX. Ele gerencia o estado do usuário, provedores de autenticação (Local e Supabase), permissões baseadas em roles e o ciclo de vida da sessão do usuário.

**Principais recursos:**
- Suporte a múltiplos provedores de autenticação (Local, Supabase)
- Gerenciamento de sessão de usuário
- Sistema de permissões baseado em roles (RBAC)
- Funções de login, logout e signup
- Auto-login em ambiente de desenvolvimento
- Sincronização de estado de autenticação em tempo real (com Supabase)

---

## Uso Básico

```typescript
import { useUser } from '@/contexts/UserContext';

function AuthStatus() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    logout, 
    hasPermission 
  } = useUser();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!isAuthenticated) {
    return <a href="/login">Login</a>;
  }

  return (
    <div>
      <p>Bem-vindo, {user?.username}!</p>
      <p>Permissões: {hasPermission('canManageUsers') ? 'Admin' : 'Usuário'}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

---

## Estado do Contexto (`UserContextType`)

### `user`: `AppUser | null`

Objeto com os dados do usuário autenticado.

**Tipo `AppUser`:**
```typescript
interface AppUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole; // 'admin', 'editor', 'viewer', 'guest'
  createdAt: string;
  lastLogin: string;
  customPermissions?: Partial<UserPermissions>;
}
```

---

### `isAuthenticated`: `boolean`

Indica se o usuário está autenticado.

---

### `isLoading`: `boolean`

Indica se o estado de autenticação está sendo inicializado.

---

### `permissions`: `UserPermissions`

Objeto com as permissões do usuário atual.

**Tipo `UserPermissions`:**
```typescript
interface UserPermissions {
  canAddToQueue: boolean;
  canRemoveFromQueue: boolean;
  canModifyPlaylists: boolean;
  canControlPlayback: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canAccessSystemControls: boolean;
}
```

---

### `authConfig`: `AuthConfig`

Configuração atual do provedor de autenticação.

**Tipo `AuthConfig`:**
```typescript
interface AuthConfig {
  provider: AuthProvider; // 'local' | 'supabase'
  allowSignup: boolean;
}
```

---

## Funções do Contexto

### `login`: `(username: string, password: string) => Promise<boolean>`

Autentica o usuário com o provedor configurado.

**Retorno:** `Promise<boolean>` - `true` se o login for bem-sucedido.

**Exemplo:**
```typescript
const success = await login('admin', 'password');
if (success) {
  console.log('Login bem-sucedido!');
} else {
  console.error('Falha no login');
}
```

---

### `logout`: `() => void`

Desconecta o usuário atual.

---

### `signUp`: `(email: string, password: string) => Promise<{ error: Error | null }>`

Registra um novo usuário (disponível apenas com Supabase).

**Retorno:** `Promise<{ error: Error | null }>` - Objeto com erro, se houver.

**Exemplo:**
```typescript
const { error } = await signUp('novo.usuario@email.com', 'senha123');
if (error) {
  alert(error.message);
}
```

---

### `setAuthProvider`: `(provider: AuthProvider) => void`

Altera o provedor de autenticação (ex: de 'local' para 'supabase'). O usuário atual é desconectado ao trocar.

**Parâmetros:**
- `provider`: `'local'` ou `'supabase'`

**Exemplo:**
```typescript
setAuthProvider('supabase');
```

---

### `hasPermission`: `(permission: keyof UserPermissions) => boolean`

Verifica se o usuário atual possui uma permissão específica.

**Retorno:** `boolean` - `true` se o usuário tiver a permissão.

**Exemplo:**
```typescript
if (hasPermission('canManageUsers')) {
  // Renderizar painel de administração
}
```

---

## Exemplo Completo: Formulário de Login

```typescript
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginForm() {
  const { login, isLoading, authConfig, setAuthProvider } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <p className="text-sm text-center text-muted-foreground">
          Provedor: {authConfig.provider}
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuário / Email</Label>
            <Input 
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          <Button 
            variant="link"
            onClick={() => setAuthProvider(
              authConfig.provider === 'local' ? 'supabase' : 'local'
            )}
          >
            Mudar para {authConfig.provider === 'local' ? 'Supabase' : 'Local'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default LoginForm;
```

---

## Provedores de Autenticação

### Local

- **Descrição:** Autenticação simples baseada em um arquivo JSON local (`users.json`). Ideal para desenvolvimento e uso offline.
- **Usuário Padrão (Dev):** `tsi` / `admin` (com auto-login)
- **Persistência:** `sessionStorage`

### Supabase

- **Descrição:** Autenticação segura e escalável usando o serviço Supabase. Suporta registro de usuários, recuperação de senha e provedores OAuth (Google, GitHub, etc.).
- **Persistência:** `localStorage` (gerenciado pelo SDK do Supabase)
- **Real-time:** Sincroniza o estado de autenticação em tempo real entre abas e dispositivos.

---

## Sistema de Permissões (RBAC)

O sistema de permissões é baseado em roles (Role-Based Access Control).

### Roles

| Role | Descrição |
|---|---|
| `admin` | Acesso total ao sistema. | 
| `editor` | Pode gerenciar playlists e filas. |
| `viewer` | Pode ver conteúdo, mas não modificar. |
| `guest` | Acesso limitado, apenas visualização. |

### Permissões Padrão por Role

```typescript
// src/types/user.ts
export const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canAddToQueue: true,
    canRemoveFromQueue: true,
    canModifyPlaylists: true,
    canControlPlayback: true,
    canAccessSettings: true,
    canManageUsers: true,
    canAccessSystemControls: true,
  },
  editor: {
    canAddToQueue: true,
    canRemoveFromQueue: true,
    canModifyPlaylists: true,
    canControlPlayback: true,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessSystemControls: false,
  },
  viewer: {
    canAddToQueue: true,
    canRemoveFromQueue: false,
    canModifyPlaylists: false,
    canControlPlayback: false,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessSystemControls: false,
  },
  guest: {
    canAddToQueue: false,
    canRemoveFromQueue: false,
    canModifyPlaylists: false,
    canControlPlayback: false,
    canAccessSettings: false,
    canManageUsers: false,
    canAccessSystemControls: false,
  },
};
```

### Permissões Customizadas

É possível sobrescrever as permissões de um role para um usuário específico através do campo `customPermissions` no objeto `AppUser`.

---

## Estrutura do Provider

O `UserProvider` é o componente que provê o contexto para a aplicação.

```typescript
// src/contexts/UserContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalAuth } from '@/hooks/auth/useLocalAuth';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authConfig, setProvider } = useAuthConfig();
  const localAuth = useLocalAuth();
  const supabaseAuth = useSupabaseAuth();

  useEffect(() => {
    // Lógica para inicializar o estado de autenticação
    // baseada no authConfig.provider
  }, [authConfig.provider]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: /* ... */,
    logout: /* ... */,
    // ...
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
```

---

## Testes

```typescript
import { renderHook, act } from '@testing-library/react';
import { UserProvider, useUser } from '@/contexts/UserContext';

describe('useUser', () => {
  it('should login a user', async () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: UserProvider
    });

    // Mock da API de login
    // ...

    await act(async () => {
      const success = await result.current.login('testuser', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.username).toBe('testuser');
  });

  it('should check permissions', () => {
    // Mock de um usuário admin
    // ...
    const { result } = renderHook(() => useUser(), { wrapper: UserProvider });

    expect(result.current.hasPermission('canManageUsers')).toBe(true);
    expect(result.current.hasPermission('canAddToQueue')).toBe(true);
  });
});
```

---

## Relacionados

- [useSettings](./USESETTINGS.md) - Hook de configurações
- [Guia de Autenticação](../guides/AUTHENTICATION.md)
- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)

---

## Changelog

### v1.0.0 (24/12/2024)
- ✅ Implementação inicial do contexto de usuário
- ✅ Suporte a provedores Local e Supabase
- ✅ Sistema de permissões (RBAC)
- ✅ Funções de login, logout e signup
- ✅ Documentação completa
