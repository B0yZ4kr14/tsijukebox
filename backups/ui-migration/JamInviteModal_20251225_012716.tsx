import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, QrCode, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface JamInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionCode: string;
  sessionName: string;
}

export function JamInviteModal({ open, onOpenChange, sessionCode, sessionName }: JamInviteModalProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const jamLink = `${window.location.origin}/jam/${sessionCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied('code');
    toast.success('Código copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(jamLink);
    setCopied('link');
    toast.success('Link copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JAM: ${sessionName}`,
          text: `Entre na minha sessão JAM! Código: ${sessionCode}`,
          url: jamLink,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Convidar para JAM
          </DialogTitle>
          <DialogDescription>
            Compartilhe o código ou link para seus amigos entrarem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Session Code */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Código da Sessão</p>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 p-4 rounded-xl bg-background/50 border border-border/50"
            >
              <span className="text-4xl font-mono font-bold tracking-[0.3em] logo-tsi-silver-neon">
                {sessionCode}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCode}
                className="h-10 w-10"
              >
                {copied === 'code' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Share Options */}
          <div className="space-y-3">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full justify-start gap-3 h-12"
            >
              <Link2 className="w-5 h-5" />
              <div className="text-left flex-1">
                <p className="font-medium">Copiar Link</p>
                <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                  {jamLink}
                </p>
              </div>
              {copied === 'link' && <Check className="w-4 h-4 text-green-500" />}
            </Button>

            {navigator.share && (
              <Button
                onClick={handleShare}
                className="w-full justify-start gap-3 h-12 button-jam-silver-neon text-zinc-900"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Compartilhar</span>
              </Button>
            )}
          </div>

          {/* QR Code Placeholder */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-xl bg-white p-2">
              <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                <QrCode className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              QR Code (em breve)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
