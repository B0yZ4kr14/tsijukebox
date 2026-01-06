# useLocalAuth Hook

## Overview
React hook for local/development authentication using sessionStorage.

## Import

```typescript
import { useLocalAuth } from '@/hooks/auth';
```

## Type Definitions

```typescript
interface LocalAuthResult {
  login: (username: string, password: string) => Promise<AppUser | null>;
  logout: () => void;
  checkSession: () => AppUser | null;
  isDevAutoLogin: boolean;
  getDevUser: () => AppUser | null;
}
```

## Usage

```typescript
function LoginForm() {
  const { login, logout, checkSession, isDevAutoLogin, getDevUser } = useLocalAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const user = await login(username, password);
    if (user) {
      console.log('Logged in:', user);
    } else {
      console.error('Invalid credentials');
    }
  };

  // Auto-login for development
  useEffect(() => {
    if (isDevAutoLogin) {
      const devUser = getDevUser();
      if (devUser) {
        console.log('Dev auto-login:', devUser);
      }
    }
  }, [isDevAutoLogin]);

  return (
    <form>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="button" onClick={handleLogin}>Login</button>
      <button type="button" onClick={logout}>Logout</button>
    </form>
  );
}
```

## Methods

### login(username, password)
Authenticates user with local credentials.

**Parameters:**
- `username: string` - Username
- `password: string` - Password

**Returns:** `Promise<AppUser | null>`
- Returns `AppUser` on success
- Returns `null` on failure

**Side Effects:**
- Stores user in `sessionStorage`
- Generates and stores session token

### logout()
Clears current session.

**Parameters:** None

**Returns:** `void`

**Side Effects:**
- Removes user from `sessionStorage`
- Removes session token

### checkSession()
Checks for active session.

**Parameters:** None

**Returns:** `AppUser | null`
- Returns `AppUser` if session exists
- Returns `null` if no session

### getDevUser()
Gets development auto-login user.

**Parameters:** None

**Returns:** `AppUser | null`
- Returns dev user if `DEV_AUTO_LOGIN` enabled
- Returns `null` otherwise

## Session Storage Keys

```typescript
'current_user'    // User data
'auth_session'    // Session token
```

## User Object Structure

```typescript
interface AppUser {
  id: string;           // Format: 'local_{username}'
  username: string;
  role: UserRole;       // 'newbie' | 'regular' | 'wizard' | 'admin'
  createdAt: string;    // ISO 8601
  lastLogin: string;    // ISO 8601
}
```

## Development Features

### Auto-Login
```typescript
const { isDevAutoLogin, getDevUser } = useLocalAuth();

if (isDevAutoLogin) {
  const devUser = getDevUser();
  // Auto-logged in as dev user
}
```

### Demo Users
Pre-configured demo users for testing:
- Admin user
- Regular user
- Test accounts

## Example: Protected Route

```typescript
function ProtectedPage() {
  const { checkSession } = useLocalAuth();
  const user = checkSession();

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Dashboard user={user} />;
}
```

## Example: Session Persistence

```typescript
function App() {
  const { checkSession } = useLocalAuth();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const existingUser = checkSession();
    setUser(existingUser);
  }, []);

  return user ? <Dashboard /> : <Login />;
}
```

## Security Considerations

⚠️ **Development Only**
- Not suitable for production
- Uses sessionStorage (not secure)
- No password hashing
- No rate limiting

⚠️ **Session Lifecycle**
- Sessions cleared on tab close
- No cross-tab synchronization
- No token expiration

## Migration Path

To migrate from local to Supabase auth:

```typescript
const { login: localLogin } = useLocalAuth();
const { login: supabaseLogin } = useSupabaseAuth();
const { authConfig } = useAuthConfig();

const login = authConfig.provider === 'local' 
  ? localLogin 
  : supabaseLogin;
```

## See Also
- [useAuthConfig](/docs/hooks/USE_AUTH_CONFIG.md)
- [useSupabaseAuth](/docs/hooks/USE_SUPABASE_AUTH.md)
