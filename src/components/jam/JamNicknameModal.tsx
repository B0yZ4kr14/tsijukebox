import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, Loader2, Users } from 'lucide-react';
import { Button, Input } from "@/components/ui/themed"

interface JamNicknameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionCode: string;
  onJoin: (nickname: string) => Promise<boolean>;
  isLoading: boolean;
}

export function JamNicknameModal({
  open,
  onOpenChange,
  sessionCode,
  onJoin,
  isLoading,
}: JamNicknameModalProps) {
  const [nickname, setNickname] = useState('');

  const handleJoin = async () => {
    if (!nickname.trim()) return;
    const success = await onJoin(nickname.trim());
    if (success) {
      setNickname('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-500 text-zinc-300">
              <Users className="w-5 h-5" />
            </div>
            <span>Entrar na Sessão JAM</span>
          </DialogTitle>
          <DialogDescription>
            Escolha um nome para os outros participantes te identificarem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Session Code Display */}
          <div className="text-center p-4 rounded-xl bg-background/50 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1">Código da Sessão</p>
            <span className="text-2xl font-mono font-bold tracking-widest logo-tsi-silver-neon">
              {sessionCode}
            </span>
          </div>

          {/* Nickname Input */}
          <div className="space-y-2">
            <Label htmlFor="nickname" className="flex items-center gap-2">
              <User aria-hidden="true" className="w-4 h-4" />
              Seu Nome
            </Label>
            <Input
              id="nickname"
              placeholder="Como você quer ser chamado?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className="bg-background/50"
              maxLength={20}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Máximo de 20 caracteres
            </p>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={!nickname.trim() || isLoading}
            className="w-full button-jam-silver-neon text-zinc-300 font-bold py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Entrar na JAM
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
