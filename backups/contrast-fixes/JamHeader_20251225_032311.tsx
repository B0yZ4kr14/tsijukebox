import { motion } from 'framer-motion';
import { Users, Copy, Check, LogOut, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/themed";
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface JamHeaderProps {
  sessionName: string;
  sessionCode: string;
  participantCount: number;
  isHost: boolean;
  onLeave: () => void;
  onShare: () => void;
}

export function JamHeader({
  sessionName,
  sessionCode,
  participantCount,
  isHost,
  onLeave,
  onShare,
}: JamHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Session Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-500">
              <Users className="w-5 h-5 text-zinc-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-foreground">{sessionName}</h1>
                {isHost && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary font-medium">
                    Host
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="font-mono font-bold tracking-wider">{sessionCode}</span>
                  {copied ? (
                    <Check aria-hidden="true" className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy aria-hidden="true" className="w-3 h-3" />
                  )}
                </button>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {participantCount}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Convidar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeave}
              className={cn(
                "gap-2 text-destructive hover:text-destructive hover:bg-destructive/10",
                isHost && "text-amber-500 hover:text-amber-500 hover:bg-amber-500/10"
              )}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{isHost ? 'Encerrar' : 'Sair'}</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
