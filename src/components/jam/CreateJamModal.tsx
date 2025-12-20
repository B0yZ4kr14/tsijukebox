import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Lock, Globe, Music, QrCode, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_PLAYLISTS } from '@/lib/constants/defaultPlaylists';
import { cn } from '@/lib/utils';

interface CreateJamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PrivacyOption = 'public' | 'private' | 'code';

export function CreateJamModal({ open, onOpenChange }: CreateJamModalProps) {
  const [jamName, setJamName] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyOption>('public');
  const [accessCode, setAccessCode] = useState('');
  const [useDefaultPlaylist, setUseDefaultPlaylist] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [jamCreated, setJamCreated] = useState(false);
  const [jamCode, setJamCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateJam = async () => {
    if (!jamName.trim()) {
      toast.error('Digite um nome para a sessão JAM');
      return;
    }

    setIsCreating(true);
    
    // Simulate JAM creation (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJamCode(generatedCode);
    setJamCreated(true);
    setIsCreating(false);
    
    toast.success('Sessão JAM criada com sucesso!', {
      icon: '🎉',
      description: `Código: ${generatedCode}`,
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(jamCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation
    setTimeout(() => {
      setJamName('');
      setPrivacy('public');
      setAccessCode('');
      setUseDefaultPlaylist(true);
      setJamCreated(false);
      setJamCode('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-500 text-zinc-900">
              <Users className="w-5 h-5" />
            </div>
            <span className="logo-tsi-silver-neon">Criar Sessão JAM</span>
          </DialogTitle>
          <DialogDescription>
            Crie uma sessão colaborativa onde todos podem adicionar músicas à fila
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!jamCreated ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 pt-4"
            >
              {/* Nome da Sessão */}
              <div className="space-y-2">
                <Label htmlFor="jam-name" className="text-foreground">Nome da Sessão</Label>
                <Input
                  id="jam-name"
                  placeholder="Ex: Festa de Sexta"
                  value={jamName}
                  onChange={(e) => setJamName(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              {/* Privacidade */}
              <div className="space-y-3">
                <Label className="text-foreground">Privacidade</Label>
                <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as PrivacyOption)}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Globe className="w-4 h-4 text-green-500" />
                      <div>
                        <span className="font-medium">Público</span>
                        <p className="text-xs text-muted-foreground">Qualquer um pode entrar</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="code" id="code" />
                    <Label htmlFor="code" className="flex items-center gap-2 cursor-pointer flex-1">
                      <QrCode className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-medium">Com Código</span>
                        <p className="text-xs text-muted-foreground">Necessário código para entrar</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Lock className="w-4 h-4 text-red-500" />
                      <div>
                        <span className="font-medium">Privado</span>
                        <p className="text-xs text-muted-foreground">Apenas convidados podem entrar</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Playlist Padrão */}
              <div className="space-y-3">
                <Label className="text-foreground">Playlist Inicial</Label>
                <button
                  type="button"
                  onClick={() => setUseDefaultPlaylist(!useDefaultPlaylist)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 transition-all text-left",
                    useDefaultPlaylist 
                      ? "border-primary bg-primary/10" 
                      : "border-border/50 bg-background/30 hover:bg-background/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{DEFAULT_PLAYLISTS.grooveInside.name}</span>
                        {useDefaultPlaylist && <Sparkles className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {DEFAULT_PLAYLISTS.grooveInside.description}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateJam}
                disabled={isCreating}
                className="w-full button-jam-silver-neon text-zinc-900 font-bold py-6"
              >
                {isCreating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                    </motion.div>
                    Criando JAM...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5 mr-2" />
                    Criar Sessão JAM
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 pt-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-zinc-900" />
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">JAM Criado!</h3>
                <p className="text-muted-foreground">Compartilhe o código com seus amigos</p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">Código da Sessão</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-widest logo-tsi-silver-neon">
                    {jamCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-8 w-8"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
