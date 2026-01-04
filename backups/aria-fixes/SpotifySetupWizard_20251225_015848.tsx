import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Music,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  Clock,
  Globe,
  Key,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Input } from "@/components/ui/themed"

interface SpotifySetupWizardProps {
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
  {
    title: 'Introdução',
    description: 'O que você precisa saber',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    title: 'Developer Dashboard',
    description: 'Acessar o painel do Spotify',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    title: 'Criar Aplicativo',
    description: 'Configurar novo app',
    icon: <Music className="w-5 h-5" />,
  },
  {
    title: 'Redirect URI',
    description: 'URL de redirecionamento',
    icon: <Shield className="w-5 h-5" />,
  },
  {
    title: 'Credenciais',
    description: 'Client ID e Secret',
    icon: <Key className="w-5 h-5" />,
  },
];

export function SpotifySetupWizard({
  isOpen,
  onClose,
  onComplete,
}: SpotifySetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    loggedIn: false,
    appCreated: false,
    uriAdded: false,
    clientId: '',
    clientSecret: '',
  });
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const redirectUri = `${window.location.origin}/settings`;
  const productionUri = 'https://midiaserver.local/jukebox/settings';

  const handleCopyUri = async (uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      toast.success('URI copiada para a área de transferência');
    } catch {
      toast.error('Falha ao copiar URI');
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return wizardData.loggedIn;
      case 2:
        return wizardData.appCreated;
      case 3:
        return wizardData.uriAdded;
      case 4:
        return (
          wizardData.clientId.length >= 20 &&
          wizardData.clientSecret.length >= 20
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!wizardData.clientId || !wizardData.clientSecret) {
      toast.error('Preencha Client ID e Client Secret');
      return;
    }

    setIsValidating(true);

    // Simular validação (em produção, fazer uma chamada real para validar)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsValidating(false);
    onComplete(wizardData.clientId.trim(), wizardData.clientSecret.trim());
    
    // Reset wizard
    setCurrentStep(0);
    setWizardData({
      loggedIn: false,
      appCreated: false,
      uriAdded: false,
      clientId: '',
      clientSecret: '',
    });
  };

  const handleSkipWizard = () => {
    onClose();
    toast.info('Você pode configurar manualmente inserindo as credenciais');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 border border-[#1DB954]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-[#1DB954]/20">
                  <Music className="w-8 h-8 text-[#1DB954]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-kiosk-text">
                    Bem-vindo à Configuração do Spotify!
                  </h3>
                  <p className="text-sm text-description-visible">
                    Vamos conectar sua conta em poucos passos
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-kiosk-text">
                Para conectar, você precisará:
              </h4>

              <div className="grid gap-3">
                {[
                  {
                    icon: <Check aria-hidden="true" className="w-4 h-4 text-[#1DB954]" />,
                    text: 'Conta Spotify (Premium recomendado para controle total)',
                  },
                  {
                    icon: <Check aria-hidden="true" className="w-4 h-4 text-[#1DB954]" />,
                    text: 'Acesso ao Spotify Developer Dashboard',
                  },
                  {
                    icon: <Check aria-hidden="true" className="w-4 h-4 text-[#1DB954]" />,
                    text: 'Criar um aplicativo no painel de desenvolvedor',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/50 border border-kiosk-border"
                  >
                    <div className="p-1.5 rounded-full bg-[#1DB954]/20">
                      {item.icon}
                    </div>
                    <span className="text-sm text-kiosk-text">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-kiosk-primary/10 border border-kiosk-primary/20">
                <Clock className="w-4 h-4 text-kiosk-primary" />
                <span className="text-sm text-kiosk-text">
                  Tempo estimado: <strong>3-5 minutos</strong>
                </span>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-description-visible">
                Primeiro, acesse o painel de desenvolvedores do Spotify para criar
                seu aplicativo.
              </p>

              <Button
                onClick={() =>
                  window.open(
                    'https://developer.spotify.com/dashboard',
                    '_blank'
                  )
                }
                className="w-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-white py-6"
              >
                <Globe className="w-5 h-5 mr-2" />
                Abrir Spotify Developer Dashboard
                <ExternalLink aria-hidden="true" className="w-4 h-4 ml-2" />
              </Button>

              <div className="p-4 rounded-lg bg-kiosk-surface/50 border border-kiosk-border space-y-3">
                <h4 className="font-medium text-kiosk-text">Instruções:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-description-visible">
                  <li>Clique no botão acima para abrir o Dashboard</li>
                  <li>Faça login com sua conta Spotify</li>
                  <li>Se for seu primeiro acesso, aceite os termos de uso</li>
                </ol>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
                <Checkbox
                  id="loggedIn"
                  checked={wizardData.loggedIn}
                  onCheckedChange={(checked) =>
                    setWizardData((prev) => ({
                      ...prev,
                      loggedIn: checked === true,
                    }))
                  }
                  className="border-[#1DB954] data-[state=checked]:bg-[#1DB954]"
                />
                <Label
                  htmlFor="loggedIn"
                  className="text-sm text-kiosk-text cursor-pointer"
                >
                  Já estou logado no Developer Dashboard
                </Label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-description-visible">
              Agora vamos criar um novo aplicativo no Spotify Developer Dashboard.
            </p>

            <div className="p-4 rounded-lg bg-kiosk-surface/50 border border-kiosk-border space-y-4">
              <h4 className="font-medium text-kiosk-text flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-xs text-[#1DB954]">
                  1
                </span>
                Clique em "Create app"
              </h4>

              <div className="space-y-3 pl-8">
                <div className="space-y-1">
                  <Label className="text-sm text-label-yellow">App name</Label>
                  <div className="p-2 rounded bg-kiosk-background border border-kiosk-border">
                    <code className="text-cyan-400 text-sm">TSiJUKEBOX</code>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-label-yellow">
                    App description
                  </Label>
                  <div className="p-2 rounded bg-kiosk-background border border-kiosk-border">
                    <code className="text-cyan-400 text-sm">
                      TSiJUKEBOX Enterprise — A música, amplificada.
                    </code>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-label-yellow">Website</Label>
                  <div className="p-2 rounded bg-kiosk-background border border-kiosk-border">
                    <code className="text-cyan-400 text-sm">
                      {window.location.origin}
                    </code>
                  </div>
                </div>
              </div>

              <h4 className="font-medium text-kiosk-text flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-xs text-[#1DB954]">
                  2
                </span>
                Selecione as APIs
              </h4>

              <div className="pl-8 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                  <span className="text-sm text-kiosk-text">Web API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                  <span className="text-sm text-kiosk-text">
                    Web Playback SDK
                  </span>
                </div>
              </div>

              <h4 className="font-medium text-kiosk-text flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-xs text-[#1DB954]">
                  3
                </span>
                Aceite os termos e clique em "Save"
              </h4>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
              <Checkbox
                id="appCreated"
                checked={wizardData.appCreated}
                onCheckedChange={(checked) =>
                  setWizardData((prev) => ({
                    ...prev,
                    appCreated: checked === true,
                  }))
                }
                className="border-[#1DB954] data-[state=checked]:bg-[#1DB954]"
              />
              <Label
                htmlFor="appCreated"
                className="text-sm text-kiosk-text cursor-pointer"
              >
                Aplicativo criado com sucesso
              </Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-description-visible">
              Adicione a URL de redirecionamento nas configurações do seu
              aplicativo Spotify.
            </p>

            <div className="p-4 rounded-lg bg-kiosk-surface/50 border border-kiosk-border space-y-4">
              <h4 className="font-medium text-kiosk-text">
                No seu app, vá em Settings → Redirect URIs:
              </h4>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-label-yellow">
                    Ambiente de Desenvolvimento:
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded bg-kiosk-background border border-kiosk-border text-cyan-400 text-sm overflow-x-auto">
                      {redirectUri}
                    </code>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleCopyUri(redirectUri)}
                      className="border-kiosk-border hover:bg-kiosk-surface"
                    >
                      <Copy aria-hidden="true" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-label-orange">
                    Ambiente de Produção (se aplicável):
                  </Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 rounded bg-kiosk-background border border-kiosk-border text-cyan-400/70 text-sm overflow-x-auto">
                      {productionUri}
                    </code>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleCopyUri(productionUri)}
                      className="border-kiosk-border hover:bg-kiosk-surface"
                    >
                      <Copy aria-hidden="true" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-200">
                  Adicione ambas as URIs se você pretende usar em desenvolvimento
                  e produção. Clique em "Add" após colar cada URI.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-lg bg-kiosk-background border border-kiosk-border">
              <Checkbox
                id="uriAdded"
                checked={wizardData.uriAdded}
                onCheckedChange={(checked) =>
                  setWizardData((prev) => ({
                    ...prev,
                    uriAdded: checked === true,
                  }))
                }
                className="border-[#1DB954] data-[state=checked]:bg-[#1DB954]"
              />
              <Label
                htmlFor="uriAdded"
                className="text-sm text-kiosk-text cursor-pointer"
              >
                URI(s) adicionada(s) e salva(s)
              </Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-description-visible">
              Por fim, copie as credenciais do seu aplicativo. No Dashboard, clique
              em "Settings" no seu app.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-label-yellow">
                  Client ID
                </Label>
                <Input
                  id="clientId"
                  value={wizardData.clientId}
                  onChange={(e) =>
                    setWizardData((prev) => ({
                      ...prev,
                      clientId: e.target.value,
                    }))
                  }
                  placeholder="Cole seu Spotify Client ID aqui"
                  className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono"
                />
                <p className="text-xs text-description-visible">
                  Encontrado na página principal do seu app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientSecret" className="text-label-yellow">
                  Client Secret
                </Label>
                <div className="relative">
                  <Input
                    id="clientSecret"
                    type={showClientSecret ? 'text' : 'password'}
                    value={wizardData.clientSecret}
                    onChange={(e) =>
                      setWizardData((prev) => ({
                        ...prev,
                        clientSecret: e.target.value,
                      }))
                    }
                    placeholder="Cole seu Spotify Client Secret aqui"
                    className="bg-kiosk-background border-kiosk-border text-kiosk-text font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="absolute right-0 top-0 h-full px-3 text-nav-neon-white hover:text-kiosk-text"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                  >
                    {showClientSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-description-visible">
                  Clique em "View client secret" para revelar
                </p>
              </div>

              {wizardData.clientId.length >= 20 &&
                wizardData.clientSecret.length >= 20 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                    <span className="text-sm text-[#1DB954]">
                      Credenciais parecem válidas! Clique em "Finalizar" para
                      conectar.
                    </span>
                  </motion.div>
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-kiosk-card border-kiosk-border max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1DB954]/20">
              <Music className="w-5 h-5 text-[#1DB954]" />
            </div>
            <div>
              <span className="text-kiosk-text">Configurar Spotify</span>
              <Badge variant="outline" className="ml-2 border-[#1DB954]/50 text-[#1DB954]">
                Passo {currentStep + 1} de {steps.length}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex-shrink-0 space-y-2">
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between gap-1">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-[#1DB954]/10'
                    : index < currentStep
                    ? 'bg-[#1DB954]/5'
                    : 'bg-transparent'
                }`}
              >
                <div
                  className={`p-1.5 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-[#1DB954]/20 text-[#1DB954]'
                      : index < currentStep
                      ? 'bg-[#1DB954] text-white'
                      : 'bg-kiosk-surface text-kiosk-text/50'
                  }`}
                >
                  {index < currentStep ? (
                    <Check aria-hidden="true" className="w-3 h-3" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`text-[10px] text-center hidden sm:block ${
                    index === currentStep
                      ? 'text-[#1DB954] font-medium'
                      : 'text-description-visible'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-kiosk-border">
          <Button
            variant="ghost"
            onClick={handleSkipWizard}
            className="text-description-visible hover:text-kiosk-text"
          >
            Pular Wizard
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="border-kiosk-border"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white disabled:opacity-50"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isValidating}
                className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Validando...
                  </>
                ) : (
                  <>
                    <Check aria-hidden="true" className="w-4 h-4 mr-2" />
                    Finalizar Configuração
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
