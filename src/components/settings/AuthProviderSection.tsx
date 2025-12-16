import { Server, Cloud, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SettingsSection } from './SettingsSection';
import { useUser } from '@/contexts/UserContext';
import type { AuthProvider } from '@/types/user';
import { cn } from '@/lib/utils';

interface ProviderOption {
  id: AuthProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const providers: ProviderOption[] = [
  {
    id: 'local',
    name: 'Backend FastAPI',
    description: 'Autenticação local via SQLite',
    icon: <Server className="w-5 h-5" />,
    features: [
      'Funciona offline',
      'Dados locais no servidor',
      'Ideal para ambientes isolados',
      'Configuração simples',
    ],
  },
  {
    id: 'supabase',
    name: 'Lovable Cloud',
    description: 'Autenticação via Supabase Auth',
    icon: <Cloud className="w-5 h-5" />,
    features: [
      'Autenticação segura',
      'Sincronização na nuvem',
      'OAuth social disponível',
      'Backup automático',
    ],
  },
];

export function AuthProviderSection() {
  const { authConfig, setAuthProvider } = useUser();

  return (
    <SettingsSection
      title="Provedor de Autenticação"
      description="Escolha como os usuários serão autenticados"
      icon={<Server className="w-5 h-5 text-green-400" />}
    >
      <div className="space-y-4">
        <Label className="text-sm text-settings-label">
          Selecione o método de autenticação
        </Label>

        <div className="grid gap-3">
          {providers.map((provider) => {
            const isSelected = authConfig.provider === provider.id;
            
            return (
              <button
                key={provider.id}
                onClick={() => setAuthProvider(provider.id)}
                className={cn(
                  "w-full p-4 rounded-lg border text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border/50 bg-background/50 hover:border-border hover:bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted text-kiosk-text/70"
                  )}>
                    {provider.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-foreground">{provider.name}</h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-settings-description mt-0.5">
                      {provider.description}
                    </p>
                    
                    <ul className="mt-3 space-y-1">
                      {provider.features.map((feature, i) => (
                        <li key={i} className="text-xs text-settings-hint flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-kiosk-text/50" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning when switching */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-400">
            <strong>Atenção:</strong> Alterar o provedor de autenticação irá desconectar 
            o usuário atual. Os dados de usuários são gerenciados separadamente por cada provedor.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
