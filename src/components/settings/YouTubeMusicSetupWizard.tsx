import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Youtube, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Clock,
  Shield,
  Key,
  Globe,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from "@/components/ui/themed"

interface YouTubeMusicSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (clientId: string, clientSecret: string) => void;
}

interface WizardStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  { title: 'Introdução', description: 'O que você precisa saber', icon: <Sparkles className="w-5 h-5" /> },
  { title: 'Google Cloud Console', description: 'Acessar o Console do Google', icon: <Globe className="w-5 h-5" /> },
  { title: 'Criar Projeto', description: 'Configurar projeto OAuth', icon: <Shield className="w-5 h-5" /> },
  { title: 'Configurar OAuth', description: 'Adicionar URI de redirecionamento', icon: <Key className="w-5 h-5" /> },
  { title: 'Credenciais', description: 'Copiar Client ID e Secret', icon: <Check aria-hidden="true" className="w-5 h-5" /> },
];

export function YouTubeMusicSetupWizard({ isOpen, onClose, onComplete }: YouTubeMusicSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    clientId: '',
    clientSecret: '',
    consoleOpened: false,
    projectCreated: false,
    oauthConfigured: false,
    uriAdded: false,
  });
  const [copiedUri, setCopiedUri] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const redirectUri = `${window.location.origin}/settings`;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleCopyUri = async () => {
    await navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    toast.success('URI copiada para a área de transferência!');
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return true;
      case 1: return wizardData.consoleOpened;
      case 2: return wizardData.projectCreated;
      case 3: return wizardData.uriAdded;
      case 4: return wizardData.clientId.length > 10 && wizardData.clientSecret.length > 5;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(wizardData.clientId.trim(), wizardData.clientSecret.trim());
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setWizardData({
      clientId: '',
      clientSecret: '',
      consoleOpened: false,
      projectCreated: false,
      oauthConfigured: false,
      uriAdded: false,
    });
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/30 flex items-center justify-center">
                <Youtube className="w-10 h-10 text-red-500" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-foreground">Bem-vindo à Configuração do YouTube Music!</h3>
              <p className="text-muted-foreground text-sm">
                Para conectar sua conta do YouTube Music, você precisará criar credenciais OAuth no Google Cloud Console.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Check aria-hidden="true" className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Conta Google</p>
                  <p className="text-xs text-muted-foreground">Você precisará de uma conta Google ativa</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Tempo estimado</p>
                  <p className="text-xs text-muted-foreground">Aproximadamente 5 minutos</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">Segurança</p>
                  <p className="text-xs text-muted-foreground">Suas credenciais são armazenadas localmente</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">1. Acesse o Google Cloud Console</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Clique no botão abaixo para abrir o Console de APIs do Google em uma nova aba.
                </p>
                <Button
                  variant="primary"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    window.open('https://console.cloud.google.com/apis/credentials', '_blank');
                    setWizardData(prev => ({ ...prev, consoleOpened: true }));
                  }}
                >
                  <ExternalLink aria-hidden="true" className="w-4 h-4 mr-2" />
                  Abrir Google Cloud Console
                </Button>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">2. Faça login com sua conta Google</h4>
                <p className="text-sm text-muted-foreground">
                  Se necessário, faça login com sua conta Google para acessar o console.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="consoleOpened" 
                  checked={wizardData.consoleOpened}
                  onCheckedChange={(checked) => 
                    setWizardData(prev => ({ ...prev, consoleOpened: !!checked }))
                  }
                />
                <Label htmlFor="consoleOpened" className="text-sm cursor-pointer">
                  Já estou logado no Google Cloud Console
                </Label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">1. Criar ou selecionar projeto</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  No topo da página, clique no seletor de projetos e:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Crie um novo projeto chamado <strong>"TSiJUKEBOX"</strong></li>
                  <li>Ou selecione um projeto existente</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">2. Habilitar YouTube Data API v3</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Vá em "APIs e Serviços" → "Biblioteca" e habilite:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
                  <li><strong>YouTube Data API v3</strong></li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">3. Configurar Tela de Consentimento OAuth</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Em "Credenciais" → "Configurar tela de consentimento":
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Selecione "Externo" como tipo de usuário</li>
                  <li>Preencha: Nome do app, Email de suporte</li>
                  <li>Adicione escopos: <code className="bg-muted px-1 rounded">youtube.readonly</code></li>
                </ul>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="projectCreated" 
                  checked={wizardData.projectCreated}
                  onCheckedChange={(checked) => 
                    setWizardData(prev => ({ ...prev, projectCreated: !!checked }))
                  }
                />
                <Label htmlFor="projectCreated" className="text-sm cursor-pointer">
                  Projeto criado e API habilitada
                </Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">1. Criar credencial OAuth</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Em "Credenciais" → "Criar credenciais" → "ID do cliente OAuth":
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Tipo: <strong>Aplicativo da Web</strong></li>
                  <li>Nome: <strong>TSiJUKEBOX</strong></li>
                </ul>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-2">2. Adicionar URI de redirecionamento</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Em "URIs de redirecionamento autorizados", adicione:
                </p>
                
                <div className="flex items-center gap-2">
                  <Input 
                    value={redirectUri} 
                    readOnly 
                    className="font-mono text-sm bg-muted"
                  />
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleCopyUri}
                    className="shrink-0" aria-label="Confirmar">
                    {copiedUri ? (
                      <Check aria-hidden="true" className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy aria-hidden="true" className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  <strong>Importante:</strong> Se você estiver usando um domínio personalizado em produção, 
                  adicione também essa URI (ex: <code>https://seudominio.com/settings</code>)
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="uriAdded" 
                  checked={wizardData.uriAdded}
                  onCheckedChange={(checked) => 
                    setWizardData(prev => ({ ...prev, uriAdded: !!checked }))
                  }
                />
                <Label htmlFor="uriAdded" className="text-sm cursor-pointer">
                  URI de redirecionamento adicionada
                </Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold mb-2">Copie suas credenciais</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Após criar a credencial OAuth, copie o Client ID e Client Secret exibidos.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  placeholder="Seu Client ID do Google OAuth"
                  value={wizardData.clientId}
                  onChange={(e) => setWizardData(prev => ({ ...prev, clientId: e.target.value }))}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Exemplo: 123456789-abcdef.apps.googleusercontent.com
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="clientSecret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Seu Client Secret do Google OAuth"
                    value={wizardData.clientSecret}
                    onChange={(e) => setWizardData(prev => ({ ...prev, clientSecret: e.target.value }))}
                    className="font-mono text-sm pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
              </div>
            </div>

            {wizardData.clientId && wizardData.clientSecret && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check aria-hidden="true" className="w-4 h-4" />
                  <span className="text-sm font-medium">Credenciais preenchidas! Clique em Finalizar.</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Configurar YouTube Music
          </DialogTitle>
          <DialogDescription>
            Passo {currentStep + 1} de {steps.length}: {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index === currentStep 
                      ? 'bg-primary/20 border-2 border-primary text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {index < currentStep ? <Check aria-hidden="true" className="w-4 h-4" /> : index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="py-4">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? handleClose : handleBack}
          >
            {currentStep === 0 ? (
              'Cancelar'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-red-600 hover:bg-red-700"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check aria-hidden="true" className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
