import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, MicOff, CheckCircle2, XCircle, Edit3, GraduationCap,
  Play, Pause, SkipForward, Volume2, Shuffle, Search, ArrowRight
} from 'lucide-react';
import { useVoiceTraining } from '@/hooks/player/useVoiceTraining';
import { useVoiceControl, CustomVoiceCommand } from '@/hooks/player/useVoiceControl';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge, Button, Input } from "@/components/ui/themed"

interface VoiceTrainingModeProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandCreated?: (command: CustomVoiceCommand) => void;
}

const TRAINABLE_COMMANDS = [
  { action: 'play', label: 'Play / Tocar', icon: Play, example: 'começar, iniciar, reproduzir' },
  { action: 'pause', label: 'Pause / Pausar', icon: Pause, example: 'parar, espera, pausa' },
  { action: 'next', label: 'Próxima', icon: SkipForward, example: 'pular, avançar, seguinte' },
  { action: 'previous', label: 'Anterior', icon: SkipForward, example: 'voltar, última, anterior', rotate: true },
  { action: 'volumeUp', label: 'Volume +', icon: Volume2, example: 'mais alto, aumentar som' },
  { action: 'volumeDown', label: 'Volume -', icon: Volume2, example: 'mais baixo, diminuir som' },
  { action: 'shuffle', label: 'Aleatório', icon: Shuffle, example: 'misturar, embaralhar' },
  { action: 'search', label: 'Buscar', icon: Search, example: 'procurar, encontrar, pesquisar' },
];

export function VoiceTrainingMode({ isOpen, onClose, onCommandCreated }: VoiceTrainingModeProps) {
  const { 
    session, 
    currentSampleIndex, 
    startSession, 
    recordSample, 
    reviewSample, 
    completeSession, 
    cancelSession 
  } = useVoiceTraining();
  
  const { isListening, transcript, confidence, startListening, stopListening, isSupported } = useVoiceControl();
  
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  const selectedCommand = TRAINABLE_COMMANDS.find(c => c.action === selectedAction);

  // Handle recording
  const handleStartRecording = useCallback(() => {
    if (!isSupported) {
      toast.error('Reconhecimento de voz não suportado');
      return;
    }
    setIsRecordingActive(true);
    startListening();
  }, [isSupported, startListening]);

  const handleStopRecording = useCallback(() => {
    stopListening();
    setIsRecordingActive(false);
    
    if (transcript && confidence > 0.3) {
      recordSample(transcript, confidence);
      toast.success(`Amostra "${transcript}" gravada!`);
    } else if (transcript) {
      toast.warning('Confiança muito baixa, tente novamente');
    }
  }, [stopListening, transcript, confidence, recordSample]);

  // Auto-stop after recording
  useEffect(() => {
    if (isRecordingActive && !isListening && transcript) {
      handleStopRecording();
    }
  }, [isListening, isRecordingActive, transcript, handleStopRecording]);

  const handleStartSession = () => {
    if (!selectedAction || !selectedCommand) return;
    startSession(selectedAction, selectedCommand.label);
  };

  const handleReviewSample = (sampleId: string, approved: boolean) => {
    if (editingSampleId === sampleId && editedTranscript) {
      reviewSample(sampleId, approved, editedTranscript);
    } else {
      reviewSample(sampleId, approved);
    }
    setEditingSampleId(null);
    setEditedTranscript('');
  };

  const handleComplete = () => {
    const command = completeSession();
    if (command) {
      onCommandCreated?.(command);
      toast.success('Treinamento concluído! Novo comando criado.');
      onClose();
    } else {
      toast.error('Nenhuma amostra aprovada para criar comando');
    }
  };

  const handleClose = () => {
    if (session) {
      cancelSession();
    }
    onClose();
  };

  const progress = session ? (currentSampleIndex / session.requiredSamples) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-kiosk-surface border-kiosk-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-kiosk-primary" />
            <DialogTitle className="text-kiosk-text">Modo de Treinamento</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Ensine o sistema a reconhecer suas formas de dizer comandos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Command */}
            {!session && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Label className="text-kiosk-text">Qual comando você quer treinar?</Label>
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="bg-kiosk-background border-kiosk-border">
                    <SelectValue placeholder="Selecione um comando" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINABLE_COMMANDS.map((cmd) => (
                      <SelectItem key={cmd.action} value={cmd.action}>
                        <div className="flex items-center gap-2">
                          <cmd.icon className={`h-4 w-4 ${cmd.rotate ? 'rotate-180' : ''}`} />
                          <span>{cmd.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCommand && (
                  <div className="bg-kiosk-background/50 rounded-lg p-3 border border-kiosk-border">
                    <p className="text-sm text-muted-foreground">
                      Exemplos de variações:
                    </p>
                    <p className="text-sm text-kiosk-text mt-1">
                      {selectedCommand.example}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Recording */}
            {session?.status === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    Amostra {currentSampleIndex + 1} de {session.requiredSamples}
                  </Badge>
                  <p className="text-sm text-kiosk-text">
                    Diga "<span className="font-semibold text-kiosk-primary">{session.targetCommand}</span>" de uma forma diferente
                  </p>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="flex flex-col items-center gap-4 py-4">
                  <motion.button
                    onClick={isRecordingActive ? handleStopRecording : handleStartRecording}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${isRecordingActive 
                        ? 'bg-red-500 hover:bg-red-600 scale-110' 
                        : 'bg-kiosk-primary hover:bg-kiosk-primary/80'
                      }
                    `}
                    animate={isRecordingActive ? { scale: [1.1, 1.15, 1.1] } : {}}
                    transition={{ duration: 0.5, repeat: isRecordingActive ? Infinity : 0 }}
                  >
                    {isRecordingActive ? (
                      <MicOff className="h-8 w-8 text-white" />
                    ) : (
                      <Mic className="h-8 w-8 text-white" />
                    )}
                  </motion.button>
                  
                  <p className="text-sm text-muted-foreground">
                    {isRecordingActive ? 'Ouvindo... Clique para parar' : 'Clique para gravar'}
                  </p>

                  {transcript && isRecordingActive && (
                    <div className="text-center">
                      <p className="text-sm text-kiosk-text">"{transcript}"</p>
                      <p className="text-xs text-muted-foreground">
                        Confiança: {Math.round(confidence * 100)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Recorded samples preview */}
                {session.samples.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Amostras gravadas:</Label>
                    <div className="flex flex-wrap gap-2">
                      {session.samples.map((sample) => (
                        <Badge key={sample.id} variant="outline" className="text-xs">
                          "{sample.transcript}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Review */}
            {session?.status === 'reviewing' && (
              <motion.div
                key="reviewing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2 bg-green-500/10 text-green-500">
                    Revisão
                  </Badge>
                  <p className="text-sm text-kiosk-text">
                    Revise as transcrições e aprove as corretas
                  </p>
                </div>

                <div className="space-y-3">
                  {session.samples.map((sample) => (
                    <div 
                      key={sample.id}
                      className={`
                        p-3 rounded-lg border transition-colors
                        ${sample.reviewed 
                          ? sample.approved 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                          : 'bg-kiosk-background/50 border-kiosk-border'
                        }
                      `}
                    >
                      {editingSampleId === sample.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editedTranscript}
                            onChange={(e) => setEditedTranscript(e.target.value)}
                            className="flex-1 h-8 text-sm"
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleReviewSample(sample.id, true)}
                          >
                            Salvar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-kiosk-text">"{sample.transcript}"</p>
                            <p className="text-xs text-muted-foreground">
                              Confiança: {Math.round(sample.confidence * 100)}%
                            </p>
                          </div>
                          
                          {!sample.reviewed && (
                            <div className="flex gap-1">
                              <Button
                                size="xs"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingSampleId(sample.id);
                                  setEditedTranscript(sample.transcript);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                onClick={() => handleReviewSample(sample.id, true)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="xs"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => handleReviewSample(sample.id, false)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {sample.reviewed && (
                            <Badge variant={sample.approved ? 'default' : 'destructive'} className="text-xs">
                              {sample.approved ? 'Aprovado' : 'Rejeitado'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Complete */}
            {session?.status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <p className="text-lg font-medium text-kiosk-text">Treinamento Concluído!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Novos padrões adicionados ao comando "{session.targetCommand}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="border-kiosk-border">
            Cancelar
          </Button>
          
          {!session && (
            <Button 
              onClick={handleStartSession}
              disabled={!selectedAction}
              className="bg-kiosk-primary hover:bg-kiosk-primary/80"
            >
              Iniciar Treinamento
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {session?.status === 'reviewing' && (
            <Button 
              onClick={handleComplete}
              disabled={!session.samples.some(s => s.reviewed && s.approved)}
              className="bg-kiosk-primary hover:bg-kiosk-primary/80"
            >
              Salvar Treinamento
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
