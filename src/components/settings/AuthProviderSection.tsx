import { Server, Cloud, Check } from 'lucide-react';
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
    icon: <Server className="w-5 h-5 icon-neon-blue" />,
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
    icon: <Cloud className="w-5 h-5 icon-neon-blue" />,
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
      icon={<Server className="w-5 h-5 icon-neon-blue" />}
    >
      <div className="space-y-4">
        <Label className="text-sm text-label-yellow">
          Selecione o método de autenticação
        </Label>

        <div className="grid gap-3" data-tour="auth-provider-selector">
          {providers.map((provider) => {
            const isSelected = authConfig.provider === provider.id;
            
            return (
              <button
                key={provider.id}
                onClick={() => setAuthProvider(provider.id)}
                className={cn(
                  "w-full p-4 rounded-lg text-left transition-all",
                  isSelected
                    ? "card-provider-selected"
                    : "card-provider-option"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary/20" : "bg-kiosk-surface/60"
                  )}>
                    {provider.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-provider-name text-sm">{provider.name}</h4>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-provider-description text-xs mt-0.5">
                      {provider.description}
                    </p>
                    
                    <ul className="mt-3 space-y-1.5">
                      {provider.features.map((feature, i) => (
                        <li key={i} className="text-provider-feature text-xs flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/70" />
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
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <p className="text-xs text-amber-400">
            <strong>Atenção:</strong> Alterar o provedor de autenticação irá desconectar 
            o usuário atual. Os dados de usuários são gerenciados separadamente por cada provedor.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
