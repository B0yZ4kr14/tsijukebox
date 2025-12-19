import { useState, useEffect } from 'react';
import { Eye, Type, Zap, Monitor, Check, X, Volume2, VolumeX, Sparkles, Bug, Download } from 'lucide-react';
import { SettingsSection } from './SettingsSection';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';
import { useContrastDebug } from '@/hooks';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  reducedMotion: boolean;
}

const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
  fontSize: 100,
  reducedMotion: false,
};

const STORAGE_KEY = 'tsi_jukebox_accessibility';

export function AccessibilitySection() {
  const { 
    soundEnabled, setSoundEnabled, 
    animationsEnabled, setAnimationsEnabled 
  } = useSettings();
  
  const { isEnabled: contrastDebugEnabled, setIsEnabled: setContrastDebugEnabled } = useContrastDebug();

  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultAccessibility;
    } catch {
      return defaultAccessibility;
    }
  });

  const [previewSettings, setPreviewSettings] = useState<AccessibilitySettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const changed = 
      previewSettings.highContrast !== settings.highContrast ||
      previewSettings.fontSize !== settings.fontSize ||
      previewSettings.reducedMotion !== settings.reducedMotion;
    setHasChanges(changed);
  }, [previewSettings, settings]);

  // Apply settings to document
  useEffect(() => {
    document.documentElement.setAttribute('data-high-contrast', String(settings.highContrast));
    document.documentElement.setAttribute('data-reduced-motion', String(settings.reducedMotion));
    document.documentElement.style.fontSize = `${settings.fontSize}%`;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updatePreview = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setPreviewSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyChanges = () => {
    setSettings(previewSettings);
    toast.success('Configurações de acessibilidade aplicadas!');
  };

  const cancelChanges = () => {
    setPreviewSettings(settings);
    toast.info('Alterações descartadas');
  };

  const resetToDefaults = () => {
    setPreviewSettings(defaultAccessibility);
    setSettings(defaultAccessibility);
    setSoundEnabled(true);
    setAnimationsEnabled(true);
    toast.success('Configurações de acessibilidade restauradas');
  };

  const instructions = {
    title: "👁️ O que são Configurações de Acessibilidade?",
    steps: [
      "Acessibilidade são ajustes que tornam o sistema mais fácil de usar para todos.",
      "Modo Alto Contraste: Aumenta a visibilidade usando cores mais fortes e fundos mais escuros.",
      "Tamanho da Fonte: Torna os textos maiores ou menores conforme sua necessidade.",
      "Reduzir Animações: Desliga movimentos e efeitos para quem prefere uma tela mais calma.",
      "Sons de Feedback: Emite sons sutis ao clicar em botões e interagir.",
      "Efeitos Visuais: Exibe ondas de ripple e efeitos neon nos botões."
    ],
    tips: [
      "💡 O Modo Alto Contraste é ideal para ambientes muito iluminados",
      "💡 Aumente a fonte se você usa o Jukebox de longe",
      "💡 Reduza animações se você sente desconforto com movimentos na tela",
      "💡 Desative sons se preferir uma experiência silenciosa"
    ]
  };

  return (
    <SettingsSection
      icon={<Eye className="w-5 h-5 icon-neon-blue" />}
      title="Acessibilidade"
      description="Ajustes visuais para melhor experiência"
      instructions={instructions}
      delay={0.15}
    >
      <div className="space-y-6" data-tour="accessibility-settings">
        {/* Real-time Preview Panel */}
        <div className="card-option-dark-3d rounded-lg p-4 space-y-3">
          <h4 className="text-label-yellow flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Prévia das Mudanças
          </h4>
          
          <div 
            className="p-4 rounded-lg border-2 transition-all duration-300"
            style={{
              fontSize: `${previewSettings.fontSize}%`,
              backgroundColor: previewSettings.highContrast ? 'hsl(0 0% 0%)' : 'hsl(var(--kiosk-bg))',
              borderColor: previewSettings.highContrast ? 'hsl(0 0% 100%)' : 'hsl(var(--border))',
              color: previewSettings.highContrast ? 'hsl(0 0% 100%)' : 'hsl(var(--kiosk-text))',
            }}
          >
            <p className="text-lg font-bold mb-2">Título de Exemplo</p>
            <p className="text-base mb-1">Texto normal de parágrafo demonstrativo.</p>
            <p className="text-sm opacity-70">Texto secundário menor para detalhes.</p>
            <div className="mt-3 flex gap-2">
              <button 
                className="px-3 py-1.5 rounded text-sm font-medium transition-all"
                style={{
                  backgroundColor: previewSettings.highContrast ? 'hsl(0 0% 100%)' : 'hsl(var(--primary))',
                  color: previewSettings.highContrast ? 'hsl(0 0% 0%)' : 'hsl(var(--primary-foreground))',
                }}
              >
                Botão Primário
              </button>
              <button 
                className="px-3 py-1.5 rounded text-sm font-medium border transition-all"
                style={{
                  borderColor: previewSettings.highContrast ? 'hsl(0 0% 100%)' : 'hsl(var(--border))',
                  color: previewSettings.highContrast ? 'hsl(0 0% 100%)' : 'inherit',
                }}
              >
                Botão Secundário
              </button>
            </div>
          </div>

          {hasChanges && (
            <div className="flex gap-2 pt-2">
              <Button onClick={applyChanges} className="flex-1 button-primary-glow-3d">
                <Check className="w-4 h-4 mr-2" />
                Aplicar Mudanças
              </Button>
              <Button onClick={cancelChanges} variant="kiosk-outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* High Contrast Mode */}
        <div className="card-option-dark-3d rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 icon-neon-blue" />
              <div>
                <Label className="text-label-yellow font-medium">Modo Alto Contraste</Label>
                <p className="text-xs text-settings-hint mt-0.5">
                  Cores mais intensas e bordas mais visíveis
                </p>
              </div>
            </div>
            <Switch
              checked={previewSettings.highContrast}
              onCheckedChange={(checked) => updatePreview('highContrast', checked)}
              variant="neon"
            />
          </div>
        </div>

        {/* Font Size */}
        <div className="card-option-dark-3d rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 icon-neon-blue" />
            <div className="flex-1">
              <Label className="text-label-yellow font-medium">Tamanho da Fonte</Label>
              <p className="text-xs text-settings-hint mt-0.5">
                Ajuste o tamanho do texto: {previewSettings.fontSize}%
              </p>
            </div>
            <span className="text-lg font-mono text-label-yellow min-w-[4rem] text-right">
              {previewSettings.fontSize}%
            </span>
          </div>
          <Slider
            value={[previewSettings.fontSize]}
            onValueChange={([value]) => updatePreview('fontSize', value)}
            min={80}
            max={150}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-settings-hint">
            <span>Pequeno (80%)</span>
            <span>Normal (100%)</span>
            <span>Grande (150%)</span>
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="card-option-dark-3d rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 icon-neon-blue" />
              <div>
                <Label className="text-label-yellow font-medium">Reduzir Animações</Label>
                <p className="text-xs text-settings-hint mt-0.5">
                  Desativa movimentos e transições
                </p>
              </div>
            </div>
            <Switch
              checked={previewSettings.reducedMotion}
              onCheckedChange={(checked) => updatePreview('reducedMotion', checked)}
              variant="neon"
            />
          </div>
        </div>

        {/* Sound Feedback */}
        <div className="card-option-dark-3d rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 icon-neon-blue" />
              ) : (
                /* WCAG Exception: Disabled state icon at /80 for visual distinction */
                <VolumeX className="w-5 h-5 text-kiosk-text/80" />
              )}
              <div>
                <Label className="text-label-yellow font-medium">Sons de Feedback</Label>
                <p className="text-xs text-settings-hint mt-0.5">
                  Sons sutis ao clicar em botões e interagir
                </p>
              </div>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              variant="neon"
            />
          </div>
        </div>

        {/* Visual Effects */}
        <div className="card-option-dark-3d rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* WCAG Exception: Disabled state icon at /80 for visual distinction */}
              <Sparkles className={`w-5 h-5 ${animationsEnabled ? 'icon-neon-blue' : 'text-kiosk-text/80'}`} />
              <div>
                <Label className="text-label-yellow font-medium">Efeitos Visuais</Label>
                <p className="text-xs text-settings-hint mt-0.5">
                  Ripples, partículas e efeitos neon nos botões
                </p>
              </div>
            </div>
            <Switch
              checked={animationsEnabled}
              onCheckedChange={setAnimationsEnabled}
              variant="neon"
            />
          </div>
        </div>

        {/* Contrast Debug Mode - Dev/Admin only */}
        {import.meta.env.DEV && (
          <div className="card-option-dark-3d rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bug className="w-5 h-5 text-purple-400" />
                <div>
                  <Label className="text-purple-400 font-medium">Modo Debug de Contraste</Label>
                  <p className="text-xs text-settings-hint mt-0.5">
                    Detecta problemas de contraste WCAG (Ctrl+Shift+C)
                  </p>
                </div>
              </div>
              <Switch
                checked={contrastDebugEnabled}
                onCheckedChange={setContrastDebugEnabled}
                variant="neon"
              />
            </div>
          </div>
        )}

        {/* Export Accessibility Report */}
        {import.meta.env.DEV && contrastDebugEnabled && (
          <Button
            variant="kiosk-outline"
            onClick={() => {
              const report = {
                timestamp: new Date().toISOString(),
                settings: {
                  highContrast: settings.highContrast,
                  fontSize: settings.fontSize,
                  reducedMotion: settings.reducedMotion,
                  soundEnabled,
                  animationsEnabled,
                },
                contrastDebugEnabled,
              };
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast.success('Relatório de acessibilidade exportado!');
            }}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório de Acessibilidade
          </Button>
        )}

        {/* Reset Button */}
        <Button
          variant="kiosk-outline"
          onClick={resetToDefaults}
          className="w-full text-label-yellow ripple-effect"
        >
          Restaurar Padrões
        </Button>
      </div>
    </SettingsSection>
  );
}
