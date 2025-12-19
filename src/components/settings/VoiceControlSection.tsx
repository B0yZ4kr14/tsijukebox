import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, SkipForward, Play, Pause, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useVoiceControl, VoiceLanguage } from '@/hooks/player/useVoiceControl';
import { motion, AnimatePresence } from 'framer-motion';

const languageOptions: { value: VoiceLanguage; label: string; flag: string }[] = [
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'es-ES', label: 'Español', flag: '🇪🇸' }
];

const availableCommands = [
  { command: 'play / tocar', icon: Play, description: 'Iniciar reprodução' },
  { command: 'pause / pausar', icon: Pause, description: 'Pausar reprodução' },
  { command: 'próxima / next', icon: SkipForward, description: 'Próxima faixa' },
  { command: 'anterior / previous', icon: SkipForward, description: 'Faixa anterior', rotate: true },
  { command: 'volume up / aumentar', icon: Volume2, description: 'Aumentar volume' },
  { command: 'volume down / diminuir', icon: Volume2, description: 'Diminuir volume' },
];

export function VoiceControlSection() {
  const {
    settings,
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    updateSettings,
    resetSettings
  } = useVoiceControl();

  const [testingMic, setTestingMic] = useState(false);

  const handleMicTest = () => {
    if (!isSupported) return;
    
    setTestingMic(true);
    startListening();
    
    setTimeout(() => {
      stopListening();
      setTestingMic(false);
    }, 5000);
  };

  return (
    <Card className="bg-kiosk-surface border-kiosk-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-kiosk-primary" />
            <CardTitle className="text-kiosk-text">Controle por Voz</CardTitle>
            {!isSupported && (
              <Badge variant="destructive" className="text-xs">
                Não Suportado
              </Badge>
            )}
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
            disabled={!isSupported}
            className="data-[state=checked]:bg-kiosk-primary"
          />
        </div>
        <CardDescription className="text-muted-foreground">
          Controle a reprodução usando comandos de voz
        </CardDescription>
      </CardHeader>

      {settings.enabled && isSupported && (
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-kiosk-text">Idioma</Label>
            <Select
              value={settings.language}
              onValueChange={(value) => updateSettings({ language: value as VoiceLanguage })}
            >
              <SelectTrigger className="bg-kiosk-background border-kiosk-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wake Word */}
          <div className="space-y-2">
            <Label className="text-kiosk-text">Palavra de Ativação (opcional)</Label>
            <Input
              value={settings.wakeWord}
              onChange={(e) => updateSettings({ wakeWord: e.target.value })}
              placeholder="Ex: jukebox"
              className="bg-kiosk-background border-kiosk-border text-kiosk-text"
            />
            <p className="text-xs text-muted-foreground">
              Diga esta palavra antes do comando para ativá-lo
            </p>
          </div>

          {/* Continuous Listening */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-kiosk-text">Escuta Contínua</Label>
              <p className="text-xs text-muted-foreground">
                Mantém o microfone sempre ativo
              </p>
            </div>
            <Switch
              checked={settings.continuousListening}
              onCheckedChange={(continuousListening) => updateSettings({ continuousListening })}
              className="data-[state=checked]:bg-kiosk-primary"
            />
          </div>

          {/* Microphone Test */}
          <div className="rounded-lg bg-kiosk-background/50 border border-kiosk-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-kiosk-text">Teste de Microfone</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMicTest}
                disabled={testingMic}
                className="border-kiosk-border"
              >
                {testingMic ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Mic className="h-4 w-4 mr-2 text-red-500" />
                    </motion.div>
                    Ouvindo...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Testar
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {testingMic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-kiosk-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-kiosk-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  
                  {transcript && (
                    <p className="text-sm text-kiosk-text bg-kiosk-surface p-2 rounded">
                      "{transcript}"
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!testingMic && !error && transcript && (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Microfone funcionando corretamente
              </div>
            )}
          </div>

          {/* Available Commands */}
          <div className="space-y-3">
            <Label className="text-kiosk-text">Comandos Disponíveis</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableCommands.map((cmd) => (
                <div
                  key={cmd.command}
                  className="flex items-center gap-2 p-2 rounded-lg bg-kiosk-background/50 border border-kiosk-border"
                >
                  <cmd.icon className={`h-4 w-4 text-kiosk-primary ${cmd.rotate ? 'rotate-180' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-kiosk-text truncate">
                      {cmd.command}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {cmd.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="border-kiosk-border text-muted-foreground hover:text-kiosk-text"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restaurar Padrões
            </Button>
          </div>
        </CardContent>
      )}

      {!isSupported && (
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <MicOff className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-500">
                Navegador não suportado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                O reconhecimento de voz requer Chrome, Edge ou Safari recentes.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
