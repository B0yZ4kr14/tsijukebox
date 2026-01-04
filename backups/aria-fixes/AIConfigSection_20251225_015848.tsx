import { useState, useEffect } from 'react';
import { Bot, Key, ExternalLink, Check, AlertCircle, Eye, EyeOff, Loader2, Sparkles, Zap, Brain, Cpu, RefreshCw } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge, Button, Card, Input } from "@/components/ui/themed"

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
  priority: number;
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
    prefix: 'sk-ant-',
    priority: 1
  },
  {
    name: 'OpenAI GPT-5',
    secretName: 'OPENAI_API_KEY',
    description: 'Modelo GPT-5 da OpenAI para tarefas gerais de IA',
    placeholder: 'sk-proj-...',
    consoleUrl: 'https://platform.openai.com/api-keys',
    consoleName: 'OpenAI Platform',
    icon: <Brain className="w-5 h-5" />,
    color: 'text-green-500',
    prefix: 'sk-',
    priority: 2
  },
  {
    name: 'Google Gemini',
    secretName: 'GEMINI_API_KEY',
    description: 'Modelo Gemini 2.5 do Google para análise multimodal',
    placeholder: 'AIza...',
    consoleUrl: 'https://aistudio.google.com/app/apikey',
    consoleName: 'Google AI Studio',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-blue-500',
    prefix: 'AIza',
    priority: 3
  },
  {
    name: 'Groq',
    secretName: 'GROQ_API_KEY',
    description: 'Inferência ultra-rápida com LLama 3.3 70B',
    placeholder: 'gsk_...',
    consoleUrl: 'https://console.groq.com/keys',
    consoleName: 'Groq Console',
    icon: <Cpu className="w-5 h-5" />,
    color: 'text-cyan-500',
    prefix: 'gsk_',
    priority: 4
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
    prefix: 'manus_',
    priority: 5
  }
];

interface KeyStatus {
  configured: boolean;
  needsCredits?: boolean;
  lastMessage?: string;
  available?: boolean;
}

export function AIConfigSection() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [keyStatus, setKeyStatus] = useState<Record<string, KeyStatus>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testingFallback, setTestingFallback] = useState(false);

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
            configured: !error && data?.exists === true,
            available: !error && data?.exists === true
          };
        } catch {
          status[config.secretName] = { configured: false, available: false };
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
          [config.secretName]: { configured: true, needsCredits: false, available: true } 
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
          lastMessage: data?.message,
          available: data?.valid && !data?.needsCredits
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

  const handleTestFallback = async () => {
    setTestingFallback(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: { 
          action: 'status'
        }
      });

      if (error) throw error;

      if (data?.providers) {
        const available = data.providers.filter((p: { available: boolean }) => p.available);
        const unavailable = data.providers.filter((p: { available: boolean }) => !p.available);

        if (available.length > 0) {
          toast.success(`${available.length} providers disponíveis para fallback`, {
            description: `Ativos: ${available.map((p: { name: string }) => p.name).join(', ')}`,
            duration: 5000
          });
        } else {
          toast.error('Nenhum provider de IA disponível', {
            description: 'Configure pelo menos uma API Key'
          });
        }

        // Update status for all providers
        const newStatus = { ...keyStatus };
        for (const provider of data.providers) {
          const config = API_CONFIGS.find(c => c.name.toLowerCase().includes(provider.name.toLowerCase()));
          if (config) {
            newStatus[config.secretName] = {
              ...newStatus[config.secretName],
              available: provider.available,
              needsCredits: provider.needsCredits
            };
          }
        }
        setKeyStatus(newStatus);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao testar fallback';
      toast.error(message);
    } finally {
      setTestingFallback(false);
    }
  };

  const toggleShowKey = (secretName: string) => {
    setShowKeys(prev => ({ ...prev, [secretName]: !prev[secretName] }));
  };

  // Count available providers
  const availableCount = Object.values(keyStatus).filter(s => s.available).length;
  const configuredCount = Object.values(keyStatus).filter(s => s.configured).length;

  return (
    <SettingsSection
      icon={<Bot className="w-5 h-5 text-kiosk-primary" />}
      title="Configuração de APIs de IA"
      description="Configure as chaves de API para integrações com múltiplos providers de IA com fallback automático"
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
          'O sistema usa fallback automático entre providers',
          'Configure múltiplos providers para maior disponibilidade'
        ],
        warning: 'Se um provider falhar ou ficar sem créditos, o sistema tentará o próximo automaticamente'
      }}
    >
      <div className="space-y-4">
        {/* Fallback Status Card */}
        <Card 
          data-testid="ai-fallback-status"
          className="p-4 bg-gradient-to-r from-kiosk-primary/10 to-kiosk-secondary/10 border-kiosk-primary/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw aria-hidden="true" className="w-5 h-5 text-kiosk-primary" />
              <div>
                <h4 className="font-medium text-kiosk-text">Sistema de Fallback</h4>
                <p className="text-xs text-description-visible">
                  {configuredCount} providers configurados, {availableCount} disponíveis
                </p>
              </div>
            </div>
            <Button
              data-testid="ai-test-fallback"
              variant="outline"
              size="sm"
              onClick={handleTestFallback}
              disabled={testingFallback}
              className="button-outline-neon"
            >
              {testingFallback ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw aria-hidden="true" className="w-3 h-3 mr-1" />
                  Testar Fallback
                </>
              )}
            </Button>
          </div>
          
          {/* Provider priority order */}
          <div className="mt-3 flex flex-wrap gap-2">
            {API_CONFIGS.sort((a, b) => a.priority - b.priority).map((config, index) => (
              <Badge 
                key={config.secretName}
                data-testid={`ai-priority-badge-${config.secretName.toLowerCase()}`}
                variant="outline"
                className={`text-xs ${
                  keyStatus[config.secretName]?.available 
                    ? 'border-green-500/50 text-green-500' 
                    : keyStatus[config.secretName]?.configured 
                      ? 'border-yellow-500/50 text-yellow-500'
                      : 'border-muted text-muted-foreground'
                }`}
              >
                {index + 1}. {config.name}
              </Badge>
            ))}
          </div>
        </Card>

        {API_CONFIGS.map((config, index) => (
          <Card 
            key={config.secretName} 
            data-testid={`ai-provider-${config.secretName.toLowerCase()}`}
            className="p-4 bg-kiosk-surface border-kiosk-border"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={config.color}>{config.icon}</span>
                  <span className="font-medium text-kiosk-text">{config.name}</span>
                  <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                    #{config.priority}
                  </Badge>
                  {keyStatus[config.secretName]?.configured && (
                    <>
                      {keyStatus[config.secretName]?.needsCredits ? (
                        <Badge 
                          data-testid={`ai-status-${config.secretName.toLowerCase()}-credits`}
                          variant="outline" 
                          className="border-yellow-500/50 text-yellow-500"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Sem Créditos
                        </Badge>
                      ) : keyStatus[config.secretName]?.available ? (
                        <Badge 
                          data-testid={`ai-status-${config.secretName.toLowerCase()}-available`}
                          variant="outline" 
                          className="border-green-500/50 text-green-500"
                        >
                          <Check aria-hidden="true" className="w-3 h-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge 
                          data-testid={`ai-status-${config.secretName.toLowerCase()}-configured`}
                          variant="outline" 
                          className="border-blue-500/50 text-blue-500"
                        >
                          <Check aria-hidden="true" className="w-3 h-3 mr-1" />
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
                  <ExternalLink aria-hidden="true" className="w-3 h-3" />
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
                      data-testid={`ai-apikey-input-${config.secretName.toLowerCase()}`}
                      type={showKeys[config.secretName] ? 'text' : 'password'}
                      value={apiKeys[config.secretName] || ''}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [config.secretName]: e.target.value }))}
                      placeholder={config.placeholder}
                      className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      data-testid={`ai-toggle-visibility-${config.secretName.toLowerCase()}`}
                      className="absolute right-0 top-0 h-full px-3 text-nav-neon-white hover:text-kiosk-text"
                      onClick={() => toggleShowKey(config.secretName)}
                    >
                      {showKeys[config.secretName] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  
                  <Button
                    data-testid={`ai-save-${config.secretName.toLowerCase()}`}
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
                    <span 
                      data-testid={`ai-message-${config.secretName.toLowerCase()}`}
                      className={`text-xs ${
                        keyStatus[config.secretName]?.needsCredits 
                          ? 'text-yellow-400' 
                          : keyStatus[config.secretName]?.available 
                            ? 'text-green-400' 
                            : 'text-blue-400'
                      }`}
                    >
                      {keyStatus[config.secretName].lastMessage}
                    </span>
                  )}
                  <Button
                    data-testid={`ai-test-${config.secretName.toLowerCase()}`}
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
                        <Check aria-hidden="true" className="w-3 h-3 mr-1" />
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
            <p className="font-medium">Sistema de Fallback Inteligente</p>
            <p className="text-xs opacity-80 mt-1">
              Quando um provider falha ou fica sem créditos, o sistema automaticamente tenta o próximo 
              na ordem de prioridade. Configure múltiplos providers para garantir alta disponibilidade.
            </p>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
