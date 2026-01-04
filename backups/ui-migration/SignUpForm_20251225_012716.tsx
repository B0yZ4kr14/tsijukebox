import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { signUpSchema, SignUpFormData } from '@/lib/validations/authSchemas';

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>;
  isLoading: boolean;
}

export function SignUpForm({ onSubmit, isLoading }: SignUpFormProps) {
  const { control, handleSubmit } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="signup-form">
      <AuthFormField
        name="email"
        label="Email"
        type="email"
        icon={Mail}
        placeholder="seu@email.com"
        control={control}
        autoComplete="email"
        disabled={isLoading}
        data-testid="signup-email-input"
      />
      <AuthFormField
        name="password"
        label="Senha"
        type="password"
        icon={Lock}
        placeholder="Mínimo 6 caracteres"
        control={control}
        autoComplete="new-password"
        disabled={isLoading}
        data-testid="signup-password-input"
      />
      <AuthFormField
        name="confirmPassword"
        label="Confirmar Senha"
        type="password"
        icon={Lock}
        placeholder="Repita a senha"
        control={control}
        autoComplete="new-password"
        disabled={isLoading}
        data-testid="signup-confirm-password-input"
      />
      <Button type="submit" className="w-full" disabled={isLoading} data-testid="signup-submit-button">
        {isLoading ? 'Criando conta...' : 'Criar Conta'}
      </Button>
    </form>
  );
}
