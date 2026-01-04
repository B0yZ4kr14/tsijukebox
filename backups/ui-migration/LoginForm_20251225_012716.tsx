import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { loginSchema, LoginFormData } from '@/lib/validations/authSchemas';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
      <AuthFormField
        name="email"
        label="Email"
        type="email"
        icon={Mail}
        placeholder="seu@email.com"
        control={control}
        autoComplete="email"
        disabled={isLoading}
        data-testid="login-email-input"
      />
      <AuthFormField
        name="password"
        label="Senha"
        type="password"
        icon={Lock}
        placeholder="••••••••"
        control={control}
        autoComplete="current-password"
        disabled={isLoading}
        data-testid="login-password-input"
      />
      <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-submit-button">
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
