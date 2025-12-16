import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Music, 
  Palette, 
  Eye, 
  Cloud, 
  Sparkles,
  Volume2,
  Trophy,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { useSettings } from '@/contexts/SettingsContext';
import { STORAGE_KEYS } from '@/lib/constants';
import { toast } from 'sonner';

type ThemeColor = 'blue' | 'green' | 'purple';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  achievementId?: string;
}

const steps: WizardStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo!',
    description: 'Vamos configurar seu TSi JUKEBOX',
    icon: <Music className="w-8 h-8" />,
  },
  {
    id: 'theme',
    title: 'Escolha seu Tema',
    description: 'Personalize as cores do sistema',
    icon: <Palette className="w-8 h-8" />,
    achievementId: 'designer',
  },
  {
    id: 'accessibility',
    title: 'Acessibilidade',
    description: 'Ajuste o tamanho e contraste',
    icon: <Eye className="w-8 h-8" />,
    achievementId: 'accessible',
  },
  {
    id: 'connections',
    title: 'Conexões',
    description: 'Configure Spotify e Clima',
    icon: <Cloud className="w-8 h-8" />,
    achievementId: 'connected',
  },
  {
    id: 'complete',
    title: 'Tudo Pronto!',
    description: 'Configuração concluída',
    icon: <Sparkles className="w-8 h-8" />,
    achievementId: 'master',
  },
];

const initialAchievements: Achievement[] = [
  { id: 'designer', title: '🎨 Designer', description: 'Escolheu um tema', icon: <Palette className="w-4 h-4" />, unlocked: false },
  { id: 'accessible', title: '👁️ Acessível', description: 'Configurou acessibilidade', icon: <Eye className="w-4 h-4" />, unlocked: false },
  { id: 'connected', title: '🔗 Conectado', description: 'Configurou conexões', icon: <Cloud className="w-4 h-4" />, unlocked: false },
  { id: 'master', title: '🏆 Mestre', description: 'Completou o setup', icon: <Trophy className="w-4 h-4" />, unlocked: false },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const { theme, setTheme, weather, setWeatherConfig } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [wizardData, setWizardData] = useState<{
    theme: ThemeColor;
    highContrast: boolean;
    fontSize: number;
    spotifyClientId: string;
    weatherApiKey: string;
    weatherCity: string;
  }>({
    theme: (theme as ThemeColor) || 'blue',
    highContrast: false,
    fontSize: 100,
    spotifyClientId: '',
    weatherApiKey: '',
    weatherCity: 'Montes Claros, MG',
  });

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      setAchievements(prev => prev.map(a => 
        a.id === achievementId ? { ...a, unlocked: true } : a
      ));
      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 2500);
    }
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.achievementId) {
      unlockAchievement(currentStepData.achievementId);
    }
    
    if (isLastStep) {
      completeSetup();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeSetup = () => {
    // Apply theme
    setTheme(wizardData.theme as 'blue' | 'green' | 'purple');
    
    // Apply accessibility
    document.documentElement.setAttribute('data-high-contrast', String(wizardData.highContrast));
    document.documentElement.style.fontSize = `${wizardData.fontSize}%`;
    localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify({
      highContrast: wizardData.highContrast,
      fontSize: wizardData.fontSize,
      reducedMotion: false,
    }));

    // Apply weather config if provided
    if (wizardData.weatherApiKey) {
      setWeatherConfig({
        apiKey: wizardData.weatherApiKey,
        city: wizardData.weatherCity,
        isEnabled: true,
      });
    }

    // Save achievements
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

    // Mark setup as complete
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
    
    toast.success('🏆 Configuração concluída com sucesso!');
    navigate('/');
  };

  const skipSetup = () => {
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
    navigate('/');
  };

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <LogoBrand size="xl" showTagline animate centered />
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-lg text-kiosk-text">
                O TSi JUKEBOX é seu sistema de música inteligente.
              </p>
              <p className="text-kiosk-text/70">
                Nas próximas telas, vamos configurar o visual, acessibilidade e conexões
                para deixar tudo do seu jeito.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Volume2 className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <p className="text-center text-kiosk-text/70">
              Escolha a cor que mais combina com você:
            </p>
            <RadioGroup
              value={wizardData.theme}
              onValueChange={(value) => setWizardData(prev => ({ ...prev, theme: value as ThemeColor }))}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: 'blue', label: 'Azul Neon', color: 'bg-cyan-500' },
                { value: 'green', label: 'Verde Tech', color: 'bg-green-500' },
                { value: 'purple', label: 'Roxo Vibrante', color: 'bg-purple-500' },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={`flex flex-col items-center gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                    wizardData.theme === option.value
                      ? 'card-option-selected-3d'
                      : 'card-option-dark-3d'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                  <div className={`w-16 h-16 rounded-full ${option.color} shadow-lg shadow-current/30`} />
                  <span className="text-sm font-medium text-kiosk-text">{option.label}</span>
                  {wizardData.theme === option.value && (
                    <Check className="w-5 h-5 text-cyan-400" />
                  )}
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <p className="text-center text-kiosk-text/70">
              Ajuste para sua melhor experiência visual:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg card-option-dark-3d">
                <div>
                  <Label className="text-kiosk-text font-medium">Modo Alto Contraste</Label>
                  <p className="text-xs text-kiosk-text/70">Cores mais fortes e visíveis</p>
                </div>
                <Switch
                  checked={wizardData.highContrast}
                  onCheckedChange={(checked) => setWizardData(prev => ({ ...prev, highContrast: checked }))}
                />
              </div>

              <div className="p-4 rounded-lg card-option-dark-3d space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-kiosk-text font-medium">Tamanho da Fonte</Label>
                    <p className="text-xs text-kiosk-text/70">{wizardData.fontSize}%</p>
                  </div>
                  <span className="text-lg font-mono text-label-yellow">{wizardData.fontSize}%</span>
                </div>
                <Slider
                  value={[wizardData.fontSize]}
                  onValueChange={([value]) => setWizardData(prev => ({ ...prev, fontSize: value }))}
                  min={80}
                  max={150}
                  step={5}
                />
              </div>

              {/* Preview */}
              <div 
                className="p-4 rounded-lg border-2 border-border"
                style={{ fontSize: `${wizardData.fontSize}%` }}
              >
                <p className="font-bold">Prévia do Texto</p>
                <p className="text-sm text-kiosk-text/70">Este é o tamanho que os textos terão.</p>
              </div>
            </div>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-6">
            <p className="text-center text-kiosk-text/70">
              Configure suas conexões (opcional):
            </p>

            <div className="space-y-4">
              {/* Weather Config */}
              <div className="p-4 rounded-lg card-option-dark-3d space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 icon-neon-blue" />
                  <Label className="text-label-yellow">Widget de Clima</Label>
                </div>
                <Input
                  placeholder="Chave API OpenWeatherMap (opcional)"
                  value={wizardData.weatherApiKey}
                  onChange={(e) => setWizardData(prev => ({ ...prev, weatherApiKey: e.target.value }))}
                  className="bg-background/50"
                />
                <Input
                  placeholder="Cidade (ex: São Paulo, BR)"
                  value={wizardData.weatherCity}
                  onChange={(e) => setWizardData(prev => ({ ...prev, weatherCity: e.target.value }))}
                  className="bg-background/50"
                />
                <p className="text-xs text-kiosk-text/50">
                  Obtenha sua chave gratuita em openweathermap.org
                </p>
              </div>

              <p className="text-xs text-center text-kiosk-text/50">
                Você pode configurar mais opções depois em Configurações.
              </p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-kiosk-text">Configuração Concluída!</h3>
              <p className="text-kiosk-text/70">
                Seu TSi JUKEBOX está pronto para uso.
              </p>
            </div>
            <div className="p-4 rounded-lg card-option-dark-3d text-left space-y-2">
              <p className="text-sm text-label-yellow">Resumo:</p>
              <ul className="text-sm text-kiosk-text/70 space-y-1">
                <li>• Tema: {wizardData.theme === 'blue' ? 'Azul Neon' : wizardData.theme === 'green' ? 'Verde Tech' : 'Roxo Vibrante'}</li>
                <li>• Fonte: {wizardData.fontSize}%</li>
                <li>• Alto Contraste: {wizardData.highContrast ? 'Ativado' : 'Desativado'}</li>
                <li>• Clima: {wizardData.weatherApiKey ? 'Configurado' : 'Não configurado'}</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-kiosk-bg flex flex-col">
      {/* Progress Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-kiosk-surface text-kiosk-text/50'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 rounded ${
                    index < currentStep ? 'bg-primary' : 'bg-kiosk-surface'
                  }`}
                  style={{ width: '60px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              opacity: { duration: 0.2 },
            }}
            className="w-full max-w-lg"
          >
            {/* Step Header */}
            <div className="text-center mb-8">
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {steps[currentStep].icon}
              </motion.div>
              <h2 className="text-2xl font-bold text-gold-neon">{steps[currentStep].title}</h2>
              <p className="text-kiosk-text/70">{steps[currentStep].description}</p>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 border-t border-kiosk-surface/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="ghost"
            onClick={isFirstStep ? skipSetup : handlePrev}
            className="button-ghost-visible"
          >
            {isFirstStep ? (
              'Pular Configuração'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </>
            )}
          </Button>

          {/* Achievements mini display */}
          <div className="flex items-center gap-1">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  a.unlocked 
                    ? 'bg-yellow-500/20 text-yellow-400 scale-110' 
                    : 'bg-kiosk-surface/50 text-kiosk-text/30'
                }`}
                title={a.title}
              >
                {a.unlocked ? <Star className="w-3 h-3" /> : <span className="opacity-50">?</span>}
              </div>
            ))}
          </div>

          <Button onClick={handleNext} className="button-primary-glow-3d">
            {isLastStep ? (
              <>
                Começar a Usar
                <Trophy className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Achievement Toast */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 shadow-lg shadow-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-yellow-400/80">Conquista Desbloqueada!</p>
                  <p className="text-sm font-bold text-yellow-300">{showAchievement.title}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
