import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Mic, MicOff, Volume2, SkipForward, Play, Pause, RotateCcw, AlertCircle, CheckCircle2,
  Search, Settings, Plus, Trash2, Gauge, Timer, History, GraduationCap, ChevronDown
} from 'lucide-react';
import { useVoiceControl, VoiceLanguage } from '@/hooks/player/useVoiceControl';
import { useVoiceCommandHistory } from '@/hooks/player/useVoiceCommandHistory';
import { AddCustomCommandModal } from './AddCustomCommandModal';
import { VoiceCommandHistory } from './VoiceCommandHistory';
import { VoiceTrainingMode } from './VoiceTrainingMode';
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
    resetSettings,
    addCustomCommand,
    removeCustomCommand,
    toggleCustomCommand
  } = useVoiceControl();

  const { history } = useVoiceCommandHistory();

  const [testingMic, setTestingMic] = useState(false);
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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
    <>
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
              data-testid="voice-control-enabled"
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

            {/* Sensitivity Settings */}
            <div className="space-y-4 pt-4 border-t border-kiosk-border">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-kiosk-primary" />
                <Label className="text-kiosk-text font-medium">Sensibilidade</Label>
              </div>
              
              {/* Confidence Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Threshold de Confiança
                  </Label>
                  <span className="text-sm text-kiosk-primary font-medium">
                    {Math.round(settings.minConfidenceThreshold * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.minConfidenceThreshold * 100]}
                  onValueChange={([v]) => updateSettings({ minConfidenceThreshold: v / 100 })}
                  min={50}
                  max={95}
                  step={5}
                  className="[&>span:first-child]:bg-kiosk-border [&>span:first-child>span]:bg-kiosk-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Comandos com confiança abaixo deste valor serão ignorados
                </p>
              </div>

              {/* Silence Timeout */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label className="text-sm text-muted-foreground">
                      Timeout de Silêncio
                    </Label>
                  </div>
                  <span className="text-sm text-kiosk-primary font-medium">
                    {(settings.silenceTimeout / 1000).toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[settings.silenceTimeout]}
                  onValueChange={([v]) => updateSettings({ silenceTimeout: v })}
                  min={1000}
                  max={5000}
                  step={500}
                  className="[&>span:first-child]:bg-kiosk-border [&>span:first-child>span]:bg-kiosk-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Tempo de silêncio antes de parar automaticamente
                </p>
              </div>

              {/* Noise Reduction */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-kiosk-text">Redução de Ruído</Label>
                  <p className="text-xs text-muted-foreground">
                    Filtrar ruído ambiente (quando suportado)
                  </p>
                </div>
                <Switch
                  checked={settings.noiseReduction}
                  onCheckedChange={(noiseReduction) => updateSettings({ noiseReduction })}
                  className="data-[state=checked]:bg-kiosk-primary"
                />
              </div>

              {/* Auto Stop After Command */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-kiosk-text">Parar Após Comando</Label>
                  <p className="text-xs text-muted-foreground">
                    Para de escutar ao reconhecer um comando
                  </p>
                </div>
                <Switch
                  checked={settings.autoStopAfterCommand}
                  onCheckedChange={(autoStopAfterCommand) => updateSettings({ autoStopAfterCommand })}
                  className="data-[state=checked]:bg-kiosk-primary"
                />
              </div>
            </div>

            {/* Voice Search */}
            <div className="space-y-4 pt-4 border-t border-kiosk-border">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-kiosk-primary" />
                <Label className="text-kiosk-text font-medium">Busca por Voz</Label>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Diga um destes comandos seguido do que deseja buscar:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-kiosk-primary/10 text-kiosk-primary border-kiosk-primary/20">
                    "buscar [artista/música]"
                  </Badge>
                  <Badge variant="secondary" className="bg-kiosk-primary/10 text-kiosk-primary border-kiosk-primary/20">
                    "tocar música [nome]"
                  </Badge>
                  <Badge variant="secondary" className="bg-kiosk-primary/10 text-kiosk-primary border-kiosk-primary/20">
                    "procurar [termo]"
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Exemplo: "buscar Beatles" ou "tocar música Bohemian Rhapsody"
                </p>
              </div>
            </div>

            {/* Custom Commands */}
            <div className="space-y-4 pt-4 border-t border-kiosk-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-kiosk-primary" />
                  <Label className="text-kiosk-text font-medium">Comandos Personalizados</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCommand(true)}
                  className="border-kiosk-border"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {settings.customCommands.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-kiosk-background/30 rounded-lg border border-kiosk-border border-dashed">
                  Nenhum comando personalizado configurado
                </p>
              ) : (
                <div className="space-y-2">
                  {settings.customCommands.map((cmd) => (
                    <div 
                      key={cmd.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-kiosk-background/50 border border-kiosk-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kiosk-text">{cmd.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Padrões: {cmd.patterns.join(', ')}
                        </p>
                        <p className="text-xs text-kiosk-primary mt-0.5">
                          Ação: {cmd.action}{cmd.customAction ? ` (${cmd.customAction})` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Switch
                          checked={cmd.enabled}
                          onCheckedChange={(enabled) => toggleCustomCommand(cmd.id, enabled)}
                          className="data-[state=checked]:bg-kiosk-primary"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomCommand(cmd.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Voice Training */}
            <div className="space-y-3 pt-4 border-t border-kiosk-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-kiosk-primary" />
                  <Label className="text-kiosk-text font-medium">Modo de Treinamento</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTraining(true)}
                  className="border-kiosk-border"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Grave suas próprias variações de comandos para melhorar o reconhecimento
              </p>
            </div>

            {/* Command History */}
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="pt-4 border-t border-kiosk-border">
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-kiosk-background/30 rounded-lg px-2 transition-colors">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-kiosk-primary" />
                  <Label className="text-kiosk-text font-medium cursor-pointer">Histórico de Comandos</Label>
                  <Badge variant="secondary" className="text-xs">{history.length}</Badge>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <VoiceCommandHistory />
              </CollapsibleContent>
            </Collapsible>

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

      <AddCustomCommandModal
        isOpen={showAddCommand}
        onClose={() => setShowAddCommand(false)}
        onAdd={addCustomCommand}
      />

      <VoiceTrainingMode
        isOpen={showTraining}
        onClose={() => setShowTraining(false)}
        onCommandCreated={addCustomCommand}
      />
    </>
  );
}
