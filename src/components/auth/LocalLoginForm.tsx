import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { User, Lock } from 'lucide-react';
import { AuthFormField } from './AuthFormField';
import { localLoginSchema, LocalLoginFormData } from '@/lib/validations/authSchemas';

interface LocalLoginFormProps {
  onSubmit: (data: LocalLoginFormData) => Promise<void>;
  isLoading: boolean;
}

export function LocalLoginForm({ onSubmit, isLoading }: LocalLoginFormProps) {
  const { control, handleSubmit } = useForm<LocalLoginFormData>({
    resolver: zodResolver(localLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthFormField
        name="username"
        label="Usuário"
        type="text"
        icon={User}
        placeholder="Digite o usuário"
        control={control}
        autoComplete="username"
        disabled={isLoading}
      />
      <AuthFormField
        name="password"
        label="Senha"
        type="password"
        icon={Lock}
        placeholder="Digite a senha"
        control={control}
        autoComplete="current-password"
        disabled={isLoading}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        <Lock className="w-4 h-4 mr-2" />
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
      
      <div className="text-xs text-description-visible text-center mt-4 space-y-1">
        <p>Admin: <code className="bg-kiosk-surface px-1 rounded">admin</code> / <code className="bg-kiosk-surface px-1 rounded">admin</code></p>
        <p>Demo: <code className="bg-kiosk-surface px-1 rounded">demo</code> / <code className="bg-kiosk-surface px-1 rounded">demo</code></p>
        <p className="text-description-visible">⚠️ Modo demo - use Lovable Cloud em produção</p>
      </div>
    </form>
  );
}
