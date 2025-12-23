import { useState, useEffect } from 'react';
import { Bot, Key, ExternalLink, Check, AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface APIKeyConfig {
  name: string;
  secretName: string;
  description: string;
  placeholder: string;
  consoleUrl: string;
  consoleName: string;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
}

const API_CONFIGS: APIKeyConfig[] = [
  {
    name: 'Claude Opus',
    secretName: 'ANTHROPIC_CLAUDE_OPUS',
    description: 'Modelo avançado de IA da Anthropic para refatoração de código',
    placeholder: 'sk-ant-api03-...',
    consoleUrl: 'https://console.anthropic.com/settings/keys',
    consoleName: 'Anthropic Console',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-orange-500',
    prefix: 'sk-ant-'
  },
  {
    name: 'Manus.im',
    secretName: 'MANUS_API_KEY',
    description: 'Plataforma de automação de agentes de IA para tarefas complexas',
    placeholder: 'manus_...',
    consoleUrl: 'https://manus.im/dashboard',
    consoleName: 'Manus Dashboard',
    icon: <Bot className="w-5 h-5" />,
    color: 'text-purple-500',
    prefix: 'manus_'
  }
];

interface KeyStatus {
  configured: boolean;
  needsCredits?: boolean;
  lastMessage?: string;
}

export function AIConfigSection() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyStatus, setKeyStatus] = useState<Record<string, KeyStatus>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  // Check if keys are already configured on mount
  useEffect(() => {
    checkConfiguredKeys();
  }, []);

  const checkConfiguredKeys = async () => {
    try {
      const status: Record<string, KeyStatus> = {};
      
      for (const config of API_CONFIGS) {
        try {
          const { data, error } = await supabase.functions.invoke('check-api-key', {
            body: { keyName: config.secretName }
          });
          
          status[config.secretName] = {
            configured: !error && data?.exists === true
          };
        } catch {
          status[config.secretName] = { configured: false };
        }
      }
      
      setKeyStatus(status);
    } catch (error) {
      console.error('[AIConfigSection] Error checking configured keys:', error);
    }
  };

  const handleSaveKey = async (config: APIKeyConfig) => {
    const key = apiKeys[config.secretName];
    
    if (!key?.trim()) {
      toast.error(`Digite a API Key da ${config.name}`);
      return;
    }

    // Validate prefix if specified
    if (config.prefix && !key.startsWith(config.prefix)) {
      toast.error(`A API Key deve começar com "${config.prefix}"`);
      return;
    }

    setSavingKey(config.secretName);

    try {
      // Save the key using edge function
      const { data, error } = await supabase.functions.invoke('save-api-key', {
        body: { 
          keyName: config.secretName, 
          keyValue: key.trim() 
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`API Key da ${config.name} salva com sucesso!`);
        setKeyStatus(prev => ({ 
          ...prev, 
          [config.secretName]: { configured: true, needsCredits: false } 
        }));
        setApiKeys(prev => ({ ...prev, [config.secretName]: '' }));
      } else {
        throw new Error(data?.error || 'Falha ao salvar a chave');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar a API Key';
      toast.error(message);
      console.error(`[AIConfigSection] Error saving ${config.secretName}:`, error);
    } finally {
      setSavingKey(null);
    }
  };

  const handleTestKey = async (config: APIKeyConfig) => {
    setTestingKey(config.secretName);

    try {
      const { data, error } = await supabase.functions.invoke('test-api-key', {
        body: { keyName: config.secretName }
      });

      if (error) throw error;

      // Update status with detailed info
      setKeyStatus(prev => ({
        ...prev,
        [config.secretName]: {
          configured: true,
          needsCredits: data?.needsCredits || false,
          lastMessage: data?.message
        }
      }));

      if (data?.valid) {
        if (data?.needsCredits) {
          toast.warning(data.message || `${config.name}: Chave válida, mas adicione créditos à sua conta`, {
            duration: 5000
          });
        } else {
          toast.success(data.message || `API Key da ${config.name} está funcionando!`);
        }
      } else {
        toast.error(data?.message || `API Key da ${config.name} inválida ou expirada`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao testar a API Key';
      toast.error(message);
      console.error(`[AIConfigSection] Error testing ${config.secretName}:`, error);
    } finally {
      setTestingKey(null);
    }
  };

  const toggleShowKey = (secretName: string) => {
    setShowKeys(prev => ({ ...prev, [secretName]: !prev[secretName] }));
  };

  return (
    <SettingsSection
      icon={<Bot className="w-5 h-5 text-kiosk-primary" />}
      title="Configuração de APIs de IA"
      description="Configure as chaves de API para integrações com Claude Opus e Manus.im"
      instructions={{
        title: 'Como obter as API Keys',
        steps: [
          'Acesse o console/dashboard do provedor de IA',
          'Crie uma nova API Key com as permissões necessárias',
          'Copie a chave e cole no campo correspondente',
          'Clique em "Salvar" para armazenar de forma segura'
        ],
        tips: [
          'As chaves são armazenadas de forma segura no Supabase Vault',
          'Nunca compartilhe suas API Keys com terceiros',
          'Você pode testar a conexão após salvar'
        ],
        warning: 'Chaves inválidas podem causar falhas nas integrações de IA'
      }}
    >
      <div className="space-y-4">
        {API_CONFIGS.map((config, index) => (
          <Card key={config.secretName} className="p-4 bg-kiosk-surface border-kiosk-border">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={config.color}>{config.icon}</span>
                  <span className="font-medium text-kiosk-text">{config.name}</span>
                  {keyStatus[config.secretName]?.configured && (
                    <>
                      {keyStatus[config.secretName]?.needsCredits ? (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Sem Créditos
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500/50 text-green-500">
                          <Check className="w-3 h-3 mr-1" />
                          Configurado
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <a
                  href={config.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {config.consoleName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Description */}
              <p className="text-xs text-description-visible">{config.description}</p>

              {/* Input */}
              <div className="space-y-2">
                <Label htmlFor={config.secretName} className="text-label-yellow text-sm">
                  API Key
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id={config.secretName}
                      type={showKeys[config.secretName] ? 'text' : 'password'}
                      value={apiKeys[config.secretName] || ''}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [config.secretName]: e.target.value }))}
                      placeholder={config.placeholder}
                      className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-nav-neon-white hover:text-kiosk-text"
                      onClick={() => toggleShowKey(config.secretName)}
                    >
                      {showKeys[config.secretName] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <Button
                    onClick={() => handleSaveKey(config)}
                    disabled={savingKey === config.secretName || !apiKeys[config.secretName]?.trim()}
                    className="bg-kiosk-primary hover:bg-kiosk-primary/90"
                  >
                    {savingKey === config.secretName ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Test Button and Status Message (only if configured) */}
              {keyStatus[config.secretName]?.configured && (
                <div className="flex items-center justify-between">
                  {keyStatus[config.secretName]?.lastMessage && (
                    <span className={`text-xs ${keyStatus[config.secretName]?.needsCredits ? 'text-yellow-400' : 'text-green-400'}`}>
                      {keyStatus[config.secretName].lastMessage}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestKey(config)}
                    disabled={testingKey === config.secretName}
                    className="button-outline-neon ml-auto"
                  >
                    {testingKey === config.secretName ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              )}

              {index < API_CONFIGS.length - 1 && <Separator className="bg-kiosk-border mt-3" />}
            </div>
          </Card>
        ))}

        {/* Info Card */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Sobre as integrações de IA</p>
            <p className="text-xs opacity-80 mt-1">
              O <strong>Claude Opus</strong> é usado para refatoração avançada de código via{' '}
              <code className="bg-blue-500/20 px-1 rounded">ScriptRefactorSection</code>.
              O <strong>Manus.im</strong> permite automação de tarefas complexas via agentes de IA.
            </p>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
