import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Volume2, AudioWaveform, RotateCcw, Info } from 'lucide-react';
import { useVolumeNormalization, NormalizationMode } from '@/hooks/player/useVolumeNormalization';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge, Button, Card, Slider, Toggle } from "@/components/ui/themed"

const modeLabels: Record<NormalizationMode, { label: string; description: string }> = {
  soft: { label: 'Suave', description: 'Normalização leve, preserva dinâmica' },
  moderate: { label: 'Moderado', description: 'Equilíbrio entre volume e dinâmica' },
  aggressive: { label: 'Agressivo', description: 'Volume mais uniforme, menos dinâmica' },
};

export function VolumeNormalizationSection() {
  const {
    settings,
    currentLoudness,
    gainAdjustment,
    isProcessing,
    toggleEnabled,
    setMode,
    setTargetLoudness,
    setPeakLimit,
    resetToDefaults,
  } = useVolumeNormalization();

  // Calculate loudness meter percentage (0-100)
  const loudnessPercent = Math.max(0, Math.min(100, ((currentLoudness + 23) / 17) * 100));

  return (
    <Card>
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 aria-hidden="true" className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Normalização de Volume</h3>
          </div>
          <Switch checked={settings.enabled} onCheckedChange={toggleEnabled} />
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Evita variações bruscas de volume entre músicas diferentes
        </p>
      

      <div className="mt-4">
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Modo de Normalização</Label>
          <RadioGroup
            value={settings.mode}
            onValueChange={(value) => setMode(value as NormalizationMode)}
            className="grid grid-cols-3 gap-3"
            disabled={!settings.enabled}
          >
            {(Object.keys(modeLabels) as NormalizationMode[]).map((mode) => (
              <div key={mode}>
                <RadioGroupItem value={mode} id={`mode-${mode}`} className="peer sr-only" />
                <Label
                  htmlFor={`mode-${mode}`}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all
                    ${settings.mode === mode ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
                    ${!settings.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-sm font-medium">{modeLabels[mode].label}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {modeLabels[mode].description}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Target Loudness */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Loudness Alvo</Label>
            <Badge variant="outline">{settings.targetLoudness} LUFS</Badge>
          </div>
          <Slider
            value={[settings.targetLoudness]}
            onValueChange={([value]) => setTargetLoudness(value)}
            min={-23}
            max={-6}
            step={1}
            disabled={!settings.enabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-23 LUFS (Mais baixo)</span>
            <span>-6 LUFS (Mais alto)</span>
          </div>
        </div>

        {/* Peak Limit */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Limite de Pico</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Limita picos de volume para evitar distorção. 
                    Valores mais baixos são mais seguros.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Badge variant="outline">{Math.round(settings.peakLimit * 100)}%</Badge>
          </div>
          <Slider
            value={[settings.peakLimit * 100]}
            onValueChange={([value]) => setPeakLimit(value / 100)}
            min={90}
            max={100}
            step={1}
            disabled={!settings.enabled}
          />
        </div>

        {/* Real-time Monitor */}
        {settings.enabled && (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AudioWaveform className={`h-4 w-4 ${isProcessing ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium">Monitor em Tempo Real</span>
              {isProcessing && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  Ativo
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Loudness Atual</div>
                <div className="text-lg font-mono">{currentLoudness.toFixed(1)} LUFS</div>
                <Progress value={loudnessPercent} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Ajuste Aplicado</div>
                <div className={`text-lg font-mono ${gainAdjustment > 0 ? 'text-green-500' : gainAdjustment < 0 ? 'text-red-500' : ''}`}>
                  {gainAdjustment > 0 ? '+' : ''}{gainAdjustment.toFixed(1)} dB
                </div>
                <div className="text-xs text-muted-foreground">
                  {isProcessing ? 'Normalizando...' : 'Aguardando'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <p>
            💡 <strong>Dica:</strong> A normalização evita que algumas músicas toquem muito alto 
            ou baixo em relação às outras. Ideal para ambientes comerciais onde o volume 
            precisa ser consistente.
          </p>
        </div>

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
        </div>
      </div>
    </Card>
  );
}
