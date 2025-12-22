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
  Star,
  Globe,
  Server,
  Music2,
  SkipForward,
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  Youtube,
  Disc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { BrandText } from '@/components/ui/BrandText';
import { useSettings } from '@/contexts/SettingsContext';
import { STORAGE_KEYS } from '@/lib/constants';
import { toast } from 'sonner';
import { SettingsIllustration } from '@/components/settings/SettingsIllustration';

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
    description: 'Vamos configurar seu sistema',
    icon: <Music className="w-8 h-8" />,
  },
  {
    id: 'language',
    title: 'Escolha o Idioma',
    description: 'Selecione seu idioma preferido',
    icon: <Globe className="w-8 h-8" />,
    achievementId: 'multilingual',
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
    id: 'backend',
    title: 'Conexão com Servidor',
    description: 'Configure como se conectar ao servidor',
    icon: <Server className="w-8 h-8" />,
    achievementId: 'networked',
  },
  {
    id: 'music-provider',
    title: 'Provedor de Música',
    description: 'Escolha seu serviço de streaming',
    icon: <Disc className="w-8 h-8" />,
    achievementId: 'music_master',
  },
  {
    id: 'spotify',
    title: 'Spotify',
    description: 'Conecte sua conta do Spotify',
    icon: <Music2 className="w-8 h-8" />,
    achievementId: 'music_lover',
  },
  {
    id: 'weather',
    title: 'Widget de Clima',
    description: 'Configure a previsão do tempo',
    icon: <Cloud className="w-8 h-8" />,
    achievementId: 'weather_aware',
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
  { id: 'multilingual', title: '🌍 Poliglota', description: 'Escolheu um idioma', icon: <Globe className="w-4 h-4" />, unlocked: false },
  { id: 'designer', title: '🎨 Designer', description: 'Escolheu um tema', icon: <Palette className="w-4 h-4" />, unlocked: false },
  { id: 'accessible', title: '👁️ Acessível', description: 'Configurou acessibilidade', icon: <Eye className="w-4 h-4" />, unlocked: false },
  { id: 'networked', title: '🔌 Conectado', description: 'Configurou o servidor', icon: <Server className="w-4 h-4" />, unlocked: false },
  { id: 'music_master', title: '🎧 DJ', description: 'Escolheu provedor de música', icon: <Disc className="w-4 h-4" />, unlocked: false },
  { id: 'music_lover', title: '🎵 Melômano', description: 'Configurou Spotify', icon: <Music2 className="w-4 h-4" />, unlocked: false },
  { id: 'weather_aware', title: '🌤️ Meteorologista', description: 'Configurou clima', icon: <Cloud className="w-4 h-4" />, unlocked: false },
  { id: 'master', title: '🏆 Mestre', description: 'Completou o setup', icon: <Trophy className="w-4 h-4" />, unlocked: false },
];

const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export default function SetupWizard() {
  const navigate = useNavigate();
  const { theme, setTheme, weather, setWeatherConfig, language, setLanguage, isDemoMode } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [wizardData, setWizardData] = useState<{
    language: string;
    theme: ThemeColor;
    highContrast: boolean;
    fontSize: number;
    backendUrl: string;
    useDemoMode: boolean;
    musicProvider: 'spotify' | 'spicetify' | 'youtube-music' | 'local';
    spotifyClientId: string;
    spotifyClientSecret: string;
    weatherApiKey: string;
    weatherCity: string;
  }>({
    language: language || 'pt-BR',
    theme: (theme as ThemeColor) || 'blue',
    highContrast: false,
    fontSize: 100,
    backendUrl: 'https://midiaserver.local/api',
    useDemoMode: true,
    musicProvider: 'spotify',
    spotifyClientId: '',
    spotifyClientSecret: '',
    weatherApiKey: '',
    weatherCity: 'Montes Claros, MG',
  });

  // Validation states
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<'success' | 'error' | null>(null);
  const [testingWeather, setTestingWeather] = useState(false);
  const [weatherTestResult, setWeatherTestResult] = useState<'success' | 'error' | null>(null);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progressPercent = Math.round((currentStep / (steps.length - 1)) * 100);

  // Test backend connection
  const testBackendConnection = async () => {
    if (!wizardData.backendUrl) return;
    
    setTestingBackend(true);
    setBackendTestResult(null);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${wizardData.backendUrl}/status`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        setBackendTestResult('success');
        toast.success('✅ Conexão com servidor OK!');
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      setBackendTestResult('error');
      toast.error('❌ Não foi possível conectar ao servidor');
    } finally {
      setTestingBackend(false);
    }
  };

  // Test weather API
  const testWeatherAPI = async () => {
    if (!wizardData.weatherApiKey || !wizardData.weatherCity) return;
    
    setTestingWeather(true);
    setWeatherTestResult(null);
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(wizardData.weatherCity)}&appid=${wizardData.weatherApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setWeatherTestResult('success');
        toast.success(`✅ API funcionando! Clima em ${data.name}: ${Math.round(data.main.temp - 273.15)}°C`);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setWeatherTestResult('error');
      toast.error('❌ Erro na API - Verifique a chave e cidade');
    } finally {
      setTestingWeather(false);
    }
  };

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

  const skipToEnd = () => {
    setCurrentStep(steps.length - 1);
  };

  const completeSetup = () => {
    // Apply language
    setLanguage(wizardData.language as 'pt-BR' | 'en' | 'es');
    
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

    // Apply backend settings - store in localStorage
    localStorage.setItem('demo_mode', String(wizardData.useDemoMode));
    if (!wizardData.useDemoMode && wizardData.backendUrl) {
      localStorage.setItem('api_url', wizardData.backendUrl);
    }

    // Save music provider preference
    localStorage.setItem('music_provider', wizardData.musicProvider);

    // Apply Spotify settings
    if (wizardData.spotifyClientId && wizardData.spotifyClientSecret) {
      localStorage.setItem('spotify_client_id', wizardData.spotifyClientId);
      localStorage.setItem('spotify_client_secret', wizardData.spotifyClientSecret);
    }

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
            <LogoBrand size="xl" variant="metal" showTagline animate centered />
            <div className="space-y-3 max-w-md mx-auto">
              <p className="text-lg text-kiosk-text">
                O <BrandText /> é seu sistema de música inteligente.
              </p>
              <p className="text-kiosk-text/85">
                Nas próximas telas, vamos configurar idioma, visual, conexões e integrações
                para deixar tudo do seu jeito.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Volume2 className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <SettingsIllustration type="appearance" size="md" animated />
            </div>
            <p className="text-center text-kiosk-text/85">
              Escolha o idioma da interface:
            </p>
            <RadioGroup
              value={wizardData.language}
              onValueChange={(value) => setWizardData(prev => ({ ...prev, language: value }))}
              className="space-y-3"
            >
              {languages.map((lang) => (
                <Label
                  key={lang.code}
                  htmlFor={lang.code}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    wizardData.language === lang.code
                      ? 'card-option-selected-3d'
                      : 'card-option-dark-3d'
                  }`}
                >
                  <RadioGroupItem value={lang.code} id={lang.code} className="sr-only" />
                  <span className="text-3xl">{lang.flag}</span>
                  <span className="flex-1 text-kiosk-text font-medium">{lang.name}</span>
                  {wizardData.language === lang.code && (
                    <Check className="w-5 h-5 text-cyan-400" />
                  )}
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <p className="text-center text-kiosk-text/85">
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
            <p className="text-center text-kiosk-text/85">
              Ajuste para sua melhor experiência visual:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg card-option-dark-3d">
                <div>
                  <Label className="text-kiosk-text font-medium">Modo Alto Contraste</Label>
                  <p className="text-xs text-kiosk-text/85">Cores mais fortes e visíveis</p>
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
                    <p className="text-xs text-kiosk-text/85">{wizardData.fontSize}%</p>
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
                <p className="text-sm text-kiosk-text/85">Este é o tamanho que os textos terão.</p>
              </div>
            </div>
          </div>
        );

      case 'backend':
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <SettingsIllustration type="connections" size="md" animated />
            </div>
            <p className="text-center text-kiosk-text/85">
              Configure a conexão com o servidor de música:
            </p>

            <div className="space-y-4">
              {/* Connection Mode */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWizardData(prev => ({ ...prev, useDemoMode: false }))}
                  className={`p-4 rounded-lg text-left transition-all ${
                    !wizardData.useDemoMode ? 'card-option-selected-3d' : 'card-option-dark-3d'
                  }`}
                >
                  <Server className="w-6 h-6 mb-2 text-cyan-400" />
                  <p className="font-medium text-kiosk-text">Servidor Real</p>
                  <p className="text-xs text-kiosk-text/90">Conectar ao backend</p>
                </button>
                <button
                  onClick={() => setWizardData(prev => ({ ...prev, useDemoMode: true }))}
                  className={`p-4 rounded-lg text-left transition-all ${
                    wizardData.useDemoMode ? 'card-option-selected-3d' : 'card-option-dark-3d'
                  }`}
                >
                  <Sparkles className="w-6 h-6 mb-2 text-yellow-400" />
                  <p className="font-medium text-kiosk-text">Modo Demo</p>
                  <p className="text-xs text-kiosk-text/90">Usar dados simulados</p>
                </button>
              </div>

              {!wizardData.useDemoMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-lg card-option-dark-3d space-y-3"
                >
                  <Label className="text-label-yellow">URL do Servidor</Label>
                  <Input
                    placeholder="https://midiaserver.local/api"
                    value={wizardData.backendUrl}
                    onChange={(e) => {
                      setWizardData(prev => ({ ...prev, backendUrl: e.target.value }));
                      setBackendTestResult(null);
                    }}
                    className="bg-kiosk-surface/50"
                  />
                  
                  {/* Test Connection Button */}
                  <Button
                    onClick={testBackendConnection}
                    disabled={testingBackend || !wizardData.backendUrl}
                    variant="outline"
                    className="w-full button-outline-neon"
                  >
                    {testingBackend ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando conexão...
                      </>
                    ) : backendTestResult === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                        Conexão OK!
                      </>
                    ) : backendTestResult === 'error' ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2 text-red-400" />
                        Falhou - Tentar novamente
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-kiosk-text/90">
                    Endereço do servidor FastAPI que controla a reprodução
                  </p>
                </motion.div>
              )}

              {wizardData.useDemoMode && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-kiosk-text/85">
                  💡 <strong>Modo Demo:</strong> Perfeito para testar a interface. Você pode conectar ao servidor real depois nas Configurações.
                </div>
              )}
            </div>
          </div>
        );

      case 'music-provider':
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <SettingsIllustration type="integrations" size="md" animated />
            </div>
            <p className="text-center text-kiosk-text/90">
              Escolha seu serviço de música preferido:
            </p>
            
            <RadioGroup
              value={wizardData.musicProvider}
              onValueChange={(value) => setWizardData(prev => ({ ...prev, musicProvider: value as any }))}
              className="space-y-3"
            >
              {[
                { 
                  value: 'spotify', 
                  label: 'Spotify', 
                  description: 'Streaming oficial com Web API', 
                  icon: <Music className="w-6 h-6 text-[#1DB954]" />,
                  color: 'border-[#1DB954]/50'
                },
                { 
                  value: 'spicetify', 
                  label: 'Spicetify', 
                  description: 'Spotify customizado com temas', 
                  icon: <Palette className="w-6 h-6 text-purple-400" />,
                  color: 'border-purple-500/50'
                },
                { 
                  value: 'youtube-music', 
                  label: 'YouTube Music', 
                  description: 'Streaming via Google/YouTube', 
                  icon: <Youtube className="w-6 h-6 text-red-500" />,
                  color: 'border-red-500/50'
                },
                { 
                  value: 'local', 
                  label: 'Música Local', 
                  description: 'Arquivos locais via playerctl', 
                  icon: <Volume2 className="w-6 h-6 text-cyan-400" />,
                  color: 'border-cyan-500/50'
                },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`provider-${option.value}`}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    wizardData.musicProvider === option.value
                      ? `card-option-selected-3d ${option.color}`
                      : 'card-option-dark-3d'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`provider-${option.value}`} className="sr-only" />
                  <div className="flex-shrink-0">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-kiosk-text">{option.label}</p>
                    <p className="text-xs text-kiosk-text/90">{option.description}</p>
                  </div>
                  {wizardData.musicProvider === option.value && (
                    <Check className="w-5 h-5 text-cyan-400" />
                  )}
                </Label>
              ))}
            </RadioGroup>
            
            <p className="text-xs text-center text-kiosk-text/90">
              Você pode configurar outros provedores depois nas Configurações
            </p>
          </div>
        );

      case 'spotify':
        return (
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <SettingsIllustration type="integrations" size="md" animated />
            </div>
            <p className="text-center text-kiosk-text/90">
              Conecte sua conta do Spotify (opcional):
            </p>

            <div className="p-4 rounded-lg card-option-dark-3d space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Music2 className="w-5 h-5 text-green-400" />
                <Label className="text-label-yellow">Credenciais Spotify</Label>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-kiosk-text/90">Client ID</Label>
                  <Input
                    placeholder="Cole seu Client ID aqui"
                    value={wizardData.spotifyClientId}
                    onChange={(e) => setWizardData(prev => ({ ...prev, spotifyClientId: e.target.value }))}
                    className="bg-kiosk-surface/50 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-kiosk-text/90">Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="Cole seu Client Secret aqui"
                    value={wizardData.spotifyClientSecret}
                    onChange={(e) => setWizardData(prev => ({ ...prev, spotifyClientSecret: e.target.value }))}
                    className="bg-kiosk-surface/50 mt-1"
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-kiosk-background/50 text-xs text-kiosk-text/90 space-y-1">
                <p><strong>Como obter:</strong></p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Acesse developer.spotify.com</li>
                  <li>Crie um novo aplicativo</li>
                  <li>Copie Client ID e Client Secret</li>
                </ol>
              </div>
            </div>

            <p className="text-xs text-center text-kiosk-text/90">
              Você pode pular e configurar depois em Configurações → Integrações
            </p>
          </div>
        );

      case 'weather':
        return (
          <div className="space-y-6">
            <p className="text-center text-kiosk-text/90">
              Configure o widget de clima (opcional):
            </p>

            <div className="p-4 rounded-lg card-option-dark-3d space-y-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 icon-neon-blue" />
                <Label className="text-label-yellow">Widget de Clima</Label>
              </div>
              <Input
                placeholder="Chave API OpenWeatherMap"
                value={wizardData.weatherApiKey}
                onChange={(e) => {
                  setWizardData(prev => ({ ...prev, weatherApiKey: e.target.value }));
                  setWeatherTestResult(null);
                }}
                className="bg-kiosk-surface/50"
              />
              <Input
                placeholder="Cidade (ex: São Paulo, BR)"
                value={wizardData.weatherCity}
                onChange={(e) => {
                  setWizardData(prev => ({ ...prev, weatherCity: e.target.value }));
                  setWeatherTestResult(null);
                }}
                className="bg-kiosk-surface/50"
              />
              
              {/* Test Weather API Button */}
              <Button
                onClick={testWeatherAPI}
                disabled={testingWeather || !wizardData.weatherApiKey || !wizardData.weatherCity}
                variant="outline"
                className="w-full button-outline-neon"
              >
                {testingWeather ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando API...
                  </>
                ) : weatherTestResult === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                    API Funcionando!
                  </>
                ) : weatherTestResult === 'error' ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2 text-red-400" />
                    Erro - Verificar dados
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-2" />
                    Testar API de Clima
                  </>
                )}
              </Button>
              
              <p className="text-xs text-kiosk-text/90">
                Obtenha sua chave gratuita em openweathermap.org
              </p>
            </div>

            <p className="text-xs text-center text-kiosk-text/90">
              Você pode pular e configurar depois em Configurações.
            </p>
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
              <p className="text-kiosk-text/90">
                Seu <BrandText /> está pronto para uso.
              </p>
            </div>
            <div className="p-4 rounded-lg card-option-dark-3d text-left space-y-2">
              <p className="text-sm text-label-yellow">Resumo:</p>
              <ul className="text-sm text-kiosk-text/90 space-y-1">
                <li>• Idioma: {languages.find(l => l.code === wizardData.language)?.name}</li>
                <li>• Tema: {wizardData.theme === 'blue' ? 'Azul Neon' : wizardData.theme === 'green' ? 'Verde Tech' : 'Roxo Vibrante'}</li>
                <li>• Fonte: {wizardData.fontSize}%</li>
                <li>• Alto Contraste: {wizardData.highContrast ? 'Ativado' : 'Desativado'}</li>
                <li>• Servidor: {wizardData.useDemoMode ? 'Modo Demo' : wizardData.backendUrl}</li>
                <li>• Spotify: {wizardData.spotifyClientId ? 'Configurado' : 'Não configurado'}</li>
                <li>• Clima: {wizardData.weatherApiKey ? 'Configurado' : 'Não configurado'}</li>
              </ul>
            </div>
            
            {/* Achievements earned */}
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-400 mb-2">🏆 Conquistas desbloqueadas:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {achievements.filter(a => a.unlocked).map(a => (
                  <span key={a.id} className="text-xs bg-yellow-500/20 px-2 py-1 rounded-full">
                    {a.title}
                  </span>
                ))}
              </div>
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
        {/* Progress percentage */}
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs text-kiosk-text/90">Progresso</span>
          <span className="text-xs font-medium text-cyan-400">{progressPercent}%</span>
        </div>
        
        {/* Progress track */}
        <div className="h-2 bg-kiosk-surface rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-kiosk-surface text-kiosk-text/85'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-0.5 mx-1 rounded ${
                    index < currentStep ? 'bg-primary' : 'bg-kiosk-surface'
                  }`}
                  style={{ width: '20px' }}
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
              <p className="text-kiosk-text/90">{steps[currentStep].description}</p>
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
            {achievements.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                  a.unlocked 
                    ? 'bg-yellow-500/20 text-yellow-400 scale-110' 
                    /* WCAG Exception: /30 locked achievement badge, unlocked state uses yellow-400 with adequate contrast */
                    : 'bg-kiosk-surface/50 text-kiosk-text/30'
                }`}
                title={a.title}
              >
                {a.unlocked ? <Star className="w-3 h-3" /> : <span className="opacity-50">?</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep && currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={skipToEnd}
                className="text-xs text-kiosk-text/85 hover:text-kiosk-text"
              >
                <SkipForward className="w-3 h-3 mr-1" />
                Pular para o fim
              </Button>
            )}
            <Button onClick={handleNext} className="button-primary-glow-3d">
              {isLastStep ? (
                <>
                  Começar a Usar
                  <Trophy className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Achievement Toast */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-yellow-500/90 text-black px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <div>
                <p className="font-bold">{showAchievement.title}</p>
                <p className="text-sm opacity-80">{showAchievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
