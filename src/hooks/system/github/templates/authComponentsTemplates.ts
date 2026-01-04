// Auth Components Templates - 7 arquivos

export function generateAuthComponentsContent(path: string): string | null {
  switch (path) {
    case 'src/components/auth/AuthFormField.tsx':
      return `import { forwardRef } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: 'email' | 'password' | 'text';
  icon: LucideIcon;
  placeholder: string;
  control: Control<T>;
  autoComplete?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

function AuthFormFieldInner<T extends FieldValues>(
  {
    name,
    label,
    type,
    icon: Icon,
    placeholder,
    control,
    autoComplete,
    disabled,
    'data-testid': testId,
  }: AuthFormFieldProps<T>,
  _ref: React.Ref<HTMLInputElement>
) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="text-label-yellow">
            {label}
          </Label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 icon-neon-blue" />
            <Input
              id={name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              data-testid={testId}
              className={cn(
                'pl-10 bg-kiosk-surface border-kiosk-border text-kiosk-text',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
              {...field}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}

export const AuthFormField = forwardRef(AuthFormFieldInner) as <T extends FieldValues>(
  props: AuthFormFieldProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => React.ReactElement;
`;

    case 'src/components/auth/LocalLoginForm.tsx':
      return `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthFormField } from './AuthFormField';
import { localLoginSchema, LocalLoginData } from '@/lib/validations/authSchemas';

interface LocalLoginFormProps {
  onSubmit: (data: LocalLoginData) => void;
  isLoading?: boolean;
}

export function LocalLoginForm({ onSubmit, isLoading }: LocalLoginFormProps) {
  const { control, handleSubmit } = useForm<LocalLoginData>({
    resolver: zodResolver(localLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthFormField
        name="username"
        label="Username"
        type="text"
        icon={User}
        placeholder="Enter username"
        control={control}
        autoComplete="username"
        disabled={isLoading}
        data-testid="username-input"
      />
      <AuthFormField
        name="password"
        label="Password"
        type="password"
        icon={Lock}
        placeholder="Enter password"
        control={control}
        autoComplete="current-password"
        disabled={isLoading}
        data-testid="password-input"
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        data-testid="login-button"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
`;

    case 'src/components/auth/LoginForm.tsx':
      return `import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success('Welcome back!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
`;

    case 'src/components/auth/SignUpForm.tsx':
      return `import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name },
        },
      });
      if (error) throw error;
      toast.success('Account created! Please check your email.');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="name" placeholder="John Doe" className="pl-10" {...register('name')} />
        </div>
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" type="email" placeholder="you@example.com" className="pl-10" {...register('email')} />
        </div>
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="password" type="password" placeholder="••••••••" className="pl-10" {...register('password')} />
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10" {...register('confirmPassword')} />
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
`;

    case 'src/components/auth/PermissionGate.tsx':
      return `import { ReactNode, createContext, useContext } from 'react';
import { useUser } from '@/contexts/UserContext';

type Permission = 'admin' | 'user' | 'newbie';

interface PermissionContextValue {
  hasPermission: (permission: Permission) => boolean;
  userRole: Permission | null;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionGate');
  }
  return context;
}

interface PermissionGateProps {
  children: ReactNode;
  required?: Permission;
  fallback?: ReactNode;
}

const PERMISSION_HIERARCHY: Record<Permission, number> = {
  admin: 3,
  user: 2,
  newbie: 1,
};

export function PermissionGate({ 
  children, 
  required,
  fallback = null 
}: PermissionGateProps) {
  const { user, role } = useUser();

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false;
    return PERMISSION_HIERARCHY[role] >= PERMISSION_HIERARCHY[permission];
  };

  const value: PermissionContextValue = {
    hasPermission,
    userRole: role as Permission | null,
  };

  // If no permission required, just provide context
  if (!required) {
    return (
      <PermissionContext.Provider value={value}>
        {children}
      </PermissionContext.Provider>
    );
  }

  // Check if user has required permission
  if (!user || !hasPermission(required)) {
    return <>{fallback}</>;
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}
`;

    case 'src/components/auth/ProtectedRoute.tsx':
      return `import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'newbie';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, role, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const roleHierarchy = { admin: 3, user: 2, newbie: 1 };
    const userLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
`;

    case 'src/components/auth/index.ts':
      return `export { AuthFormField } from './AuthFormField';
export { LoginForm } from './LoginForm';
export { SignUpForm } from './SignUpForm';
export { LocalLoginForm } from './LocalLoginForm';
export { PermissionGate, usePermissions } from './PermissionGate';
export { ProtectedRoute } from './ProtectedRoute';
`;

    default:
      return null;
  }
}
