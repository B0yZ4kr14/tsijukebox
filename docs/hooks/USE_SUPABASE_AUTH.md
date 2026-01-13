# useSupabaseAuth Hook

## Overview
React hook for production-grade authentication using Supabase Auth.

## Import

```typescript
import { useSupabaseAuth } from '@/hooks/auth';
```

## Type Definitions

```typescript
interface SupabaseAuthResult {
  login: (email: string, password: string) => Promise<AppUser | null>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  fetchUserRole: (userId: string) => Promise<UserRole>;
  subscribeToAuthChanges: (
    onUserChange: (user: AppUser | null) => void
  ) => () => void;
  getSession: () => Promise<Session | null>;
}
```

## Usage

```typescript
function AuthComponent() {
  const {
    login,
    signUp,
    logout,
    fetchUserRole,
    subscribeToAuthChanges,
    getSession
  } = useSupabaseAuth();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    const user = await login('user@example.com', 'password');
    if (user) {
      console.log('Logged in:', user);
    }
  };

  const handleSignUp = async () => {
    const { error } = await signUp('new@example.com', 'password');
    if (error) {
      console.error('Sign up failed:', error);
    }
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </>
      )}
    </div>
  );
}
```

## Methods

### login(email, password)
Authenticates user with Supabase.

**Parameters:**
- `email: string` - User email or username
- `password: string` - User password

**Returns:** `Promise<AppUser | null>`
- Success: Returns `AppUser` with role
- Failure: Returns `null`

**Email Handling:**
- If email contains `@`: Uses as-is
- Otherwise: Appends `@example.com`

**Auto-fetches user role** from `user_roles` table.

### signUp(email, password)
Creates new user account.

**Parameters:**
- `email: string` - User email
- `password: string` - User password

**Returns:** `Promise<{ error: Error | null }>`
- Success: `{ error: null }`
- Failure: `{ error: Error }`

**Features:**
- Sends confirmation email
- Sets email redirect URL
- Creates user in Supabase Auth

### logout()
Signs out current user.

**Parameters:** None

**Returns:** `Promise<void>`

**Side Effects:**
- Clears Supabase session
- Triggers auth state change
- Clears local tokens

### fetchUserRole(userId)
Fetches user role from database.

**Parameters:**
- `userId: string` - Supabase user ID

**Returns:** `Promise<UserRole>`
- Returns role from `user_roles` table
- Defaults to `'newbie'` if not found

**Database Query:**
```sql
SELECT role FROM user_roles 
WHERE user_id = :userId 
ORDER BY role 
LIMIT 1
```

### subscribeToAuthChanges(onUserChange)
Subscribes to auth state changes.

**Parameters:**
- `onUserChange: (user: AppUser | null) => void` - Callback

**Returns:** `() => void` - Unsubscribe function

**Events:**
- User logged in
- User logged out
- Session refreshed
- Token updated

**Note:** Role fetch is deferred to avoid deadlocks.

### getSession()
Gets current session.

**Parameters:** None

**Returns:** `Promise<Session | null>`
- Returns current Supabase session
- `null` if not authenticated

## User Mapping

Supabase User → AppUser conversion:

```typescript
{
  id: user.id,                          // Supabase UUID
  username: user.email.split('@')[0],   // Email prefix
  email: user.email,                    // Full email
  role: await fetchUserRole(user.id),   // From user_roles table
  createdAt: user.created_at,           // ISO 8601
  lastLogin: new Date().toISOString()   // Current time
}
```

## Database Schema

### user_roles Table

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | uuid | FK to auth.users |
| `role` | text | User role |

**Roles:**
- `newbie` - Default role
- `regular` - Regular user
- `wizard` - Advanced user
- `admin` - Administrator

## Example: Auth Provider

```typescript
function AuthProvider({ children }) {
  const { subscribeToAuthChanges } = useSupabaseAuth();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return <Loading />;

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Example: Protected Route

```typescript
function ProtectedRoute({ children }) {
  const { getSession } = useSupabaseAuth();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

## Example: Role-Based Access

```typescript
function AdminPanel() {
  const { subscribeToAuthChanges } = useSupabaseAuth();
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(setUser);
    return unsubscribe;
  }, []);

  if (user?.role !== 'admin') {
    return <AccessDenied />;
  }

  return <AdminDashboard />;
}
```

## Email Confirmation

Sign-up flow:
1. User signs up with email/password
2. Supabase sends confirmation email
3. User clicks link in email
4. Redirected to `emailRedirectTo` URL
5. Can now login

## Error Handling

```typescript
const { login } = useSupabaseAuth();

try {
  const user = await login(email, password);
  if (!user) {
    // Invalid credentials
    toast.error('Invalid email or password');
  } else {
    // Success
    toast.success(`Welcome, ${user.username}!`);
  }
} catch (error) {
  // Network or other error
  console.error('Login error:', error);
  toast.error('Login failed. Please try again.');
}
```

## Security Features

✅ **Secure Authentication**
- JWT-based sessions
- Secure token storage
- Automatic token refresh

✅ **Email Verification**
- Confirmation emails
- Magic links
- Password reset

✅ **Row Level Security**
- Database-level protection
- User-specific data access

✅ **Session Management**
- Automatic session refresh
- Cross-tab synchronization
- Secure logout

## See Also
- [useAuthConfig](/docs/hooks/USE_AUTH_CONFIG.md)
- [useLocalAuth](/docs/hooks/USE_LOCAL_AUTH.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
