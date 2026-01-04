import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Play, Pause, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Search, Settings } from 'lucide-react';
import type { CustomVoiceCommand } from '@/hooks/player/useVoiceControl';
import { Badge, Button, Input } from "@/components/ui/themed"

interface AddCustomCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (command: Omit<CustomVoiceCommand, 'id'>) => void;
}

const actionOptions = [
  { value: 'play', label: 'Play', icon: Play },
  { value: 'pause', label: 'Pause', icon: Pause },
  { value: 'next', label: 'Próxima', icon: SkipForward },
  { value: 'previous', label: 'Anterior', icon: SkipForward },
  { value: 'shuffle', label: 'Aleatório', icon: Shuffle },
  { value: 'repeat', label: 'Repetir', icon: Repeat },
  { value: 'volume', label: 'Volume', icon: Volume2 },
  { value: 'mute', label: 'Mudo', icon: VolumeX },
  { value: 'search', label: 'Buscar', icon: Search },
  { value: 'custom', label: 'Evento Customizado', icon: Settings },
] as const;

export function AddCustomCommandModal({ isOpen, onClose, onAdd }: AddCustomCommandModalProps) {
  const [name, setName] = useState('');
  const [patterns, setPatterns] = useState<string[]>([]);
  const [patternInput, setPatternInput] = useState('');
  const [action, setAction] = useState<CustomVoiceCommand['action']>('play');
  const [customAction, setCustomAction] = useState('');

  const handleAddPattern = () => {
    const trimmed = patternInput.trim();
    if (trimmed && !patterns.includes(trimmed)) {
      setPatterns([...patterns, trimmed]);
      setPatternInput('');
    }
  };

  const handleRemovePattern = (index: number) => {
    setPatterns(patterns.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (name && patterns.length > 0) {
      onAdd({
        name,
        patterns,
        action,
        customAction: action === 'custom' ? customAction : undefined,
        enabled: true
      });
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setName('');
    setPatterns([]);
    setPatternInput('');
    setAction('play');
    setCustomAction('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const isValid = name.trim() && patterns.length > 0 && (action !== 'custom' || customAction.trim());

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-kiosk-surface border-kiosk-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-kiosk-text">Adicionar Comando Personalizado</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crie um novo comando de voz com padrões de reconhecimento personalizados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Command Name */}
          <div className="space-y-2">
            <Label className="text-kiosk-text">Nome do Comando</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Meus Favoritos"
              className="bg-kiosk-background border-kiosk-border text-kiosk-text"
            />
          </div>
          
          {/* Patterns */}
          <div className="space-y-2">
            <Label className="text-kiosk-text">Padrões de Reconhecimento</Label>
            <div className="flex gap-2">
              <Input
                value={patternInput}
                onChange={(e) => setPatternInput(e.target.value)}
                placeholder="Ex: meus favoritos"
                className="bg-kiosk-background border-kiosk-border text-kiosk-text flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPattern();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddPattern}
                variant="outline"
                size="xs"
                className="border-kiosk-border" aria-label="Adicionar">
                <Plus aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Adicione palavras ou frases que ativarão este comando
            </p>
            
            {patterns.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {patterns.map((p, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="gap-1 bg-kiosk-primary/20 text-kiosk-primary border-kiosk-primary/30"
                  >
                    {p}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                      onClick={() => handleRemovePattern(i)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Action */}
          <div className="space-y-2">
            <Label className="text-kiosk-text">Ação</Label>
            <Select value={action} onValueChange={(v) => setAction(v as CustomVoiceCommand['action'])}>
              <SelectTrigger className="bg-kiosk-background border-kiosk-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <opt.icon className={`h-4 w-4 ${opt.value === 'previous' ? 'rotate-180' : ''}`} />
                      <span>{opt.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Action Event Name */}
          {action === 'custom' && (
            <div className="space-y-2">
              <Label className="text-kiosk-text">Nome do Evento</Label>
              <Input
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                placeholder="Ex: open-favorites"
                className="bg-kiosk-background border-kiosk-border text-kiosk-text"
              />
              <p className="text-xs text-muted-foreground">
                Nome do evento customizado que será disparado
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-kiosk-border"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid}
            className="bg-kiosk-primary hover:bg-kiosk-primary/90"
          >
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
