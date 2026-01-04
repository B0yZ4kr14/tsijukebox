import { useState } from 'react';
import { Youtube, LogOut, Check, X, ExternalLink, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettings } from '@/contexts/SettingsContext';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { useToast } from '@/hooks';
import { YouTubeMusicSetupWizard } from './YouTubeMusicSetupWizard';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, Input } from "@/components/ui/themed"

/**
 * YouTubeMusicSection Component
 * 
 * Configuration panel for YouTube Music integration with OAuth authentication.
 * Integrated with TSiJUKEBOX Design System tokens.
 */
export function YouTubeMusicSection() {
  const { toast } = useToast();
  const { 
    youtubeMusic, 
    setYouTubeMusicCredentials,
    setYouTubeMusicTokens, 
    setYouTubeMusicUser, 
    clearYouTubeMusicAuth 
  } = useSettings();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [localCredentials, setLocalCredentials] = useState({
    clientId: youtubeMusic?.clientId || '',
    clientSecret: youtubeMusic?.clientSecret || '',
  });

  const hasCredentials = !!(youtubeMusic?.clientId && youtubeMusic?.clientSecret);

  const handleSaveCredentials = () => {
    if (!localCredentials.clientId || !localCredentials.clientSecret) {
      toast({
        title: 'Erro',
        description: 'Preencha Client ID e Client Secret',
        variant: 'destructive',
      });
      return;
    }
    setYouTubeMusicCredentials(localCredentials.clientId, localCredentials.clientSecret);
    toast({
      title: 'Credenciais salvas',
      description: 'Agora você pode conectar sua conta do YouTube Music',
    });
  };

  const handleConnect = async () => {
    if (!hasCredentials) {
      toast({
        title: 'Erro',
        description: 'Configure as credenciais primeiro',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/settings`;
      const { authUrl } = await youtubeMusicClient.getAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Falha ao iniciar autenticação';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearYouTubeMusicAuth();
    youtubeMusicClient.clearTokens();
    toast({
      title: 'Desconectado',
      description: 'YouTube Music desconectado com sucesso',
    });
  };

  const handleWizardComplete = (clientId: string, clientSecret: string) => {
    setLocalCredentials({ clientId, clientSecret });
    setYouTubeMusicCredentials(clientId, clientSecret);
    toast({
      title: 'Configuração concluída!',
      description: 'Credenciais salvas. Clique em "Conectar com Google" para autorizar.',
    });
  };

  return (
    <>
      <Card variant="glassmorphism">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            <Youtube className="w-5 h-5 text-brand-youtube drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]" />
            YouTube Music
          </h3>
        
        <div className="mt-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-brand-gold font-semibold">Status</span>
            {youtubeMusic?.isConnected ? (
              <Badge variant="success" size="md">
                <Check aria-hidden="true" className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="primary" size="md">
                <X aria-hidden="true" className="w-3 h-3 mr-1" />
                Não conectado
              </Badge>
            )}
          </div>

          {/* User Profile (when connected) */}
          {youtubeMusic?.isConnected && youtubeMusic.user && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              "bg-brand-youtube/10 backdrop-blur-sm border border-brand-youtube/30"
            )}>
              <Avatar className="h-10 w-10 ring-2 ring-brand-youtube/50">
                <AvatarImage src={youtubeMusic.user.imageUrl || undefined} />
                <AvatarFallback className="bg-brand-youtube text-white font-bold">
                  {youtubeMusic.user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-primary truncate">{youtubeMusic.user.name}</p>
                <p className="text-xs text-text-tertiary truncate">{youtubeMusic.user.email}</p>
              </div>
            </div>
          )}

          {/* Wizard button - show when not connected and no credentials */}
          {!youtubeMusic?.isConnected && !hasCredentials && (
            <Button
              onClick={() => setShowWizard(true)}
              variant="outline"
              size="lg"
              className={cn(
                "w-full",
                "border-brand-youtube/50 text-brand-youtube",
                "hover:bg-brand-youtube/10 hover:border-brand-youtube"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Configurar com Assistente Guiado
            </Button>
          )}

          {/* Credentials section - only show when not connected */}
          {!youtubeMusic?.isConnected && (
            <div className="space-y-3 pt-2 border-t border-[#333333]">
              <p className="text-xs text-text-tertiary">
                Credenciais OAuth do Google Cloud Console:
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="ytClientId" className="text-brand-gold">Client ID</Label>
                <Input
                  id="ytClientId"
                  placeholder="Seu Client ID do Google OAuth"
                  value={localCredentials.clientId}
                  onChange={(e) => setLocalCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                  variant="primary"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ytClientSecret" className="text-brand-gold">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="ytClientSecret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Seu Client Secret"
                    value={localCredentials.clientSecret}
                    onChange={(e) => setLocalCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                    variant="primary"
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-text-secondary hover:text-accent-cyan"
                    onClick={() => setShowSecret(!showSecret)}
                    aria-label={showSecret ? 'Ocultar secret' : 'Mostrar secret'}
                  >
                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              {(localCredentials.clientId !== youtubeMusic?.clientId || 
                localCredentials.clientSecret !== youtubeMusic?.clientSecret) && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleSaveCredentials}
                  className="w-full"
                >
                  Salvar Credenciais
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {youtubeMusic?.isConnected ? (
              <Button
                variant="outline"
                size="lg"
                onClick={handleDisconnect}
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting || !hasCredentials}
                size="lg"
                className={cn(
                  "flex-1",
                  "bg-brand-youtube hover:bg-brand-youtube/90 text-white font-bold",
                  "shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]",
                  "transition-all duration-normal"
                )}
              >
                <Youtube className="w-4 h-4 mr-2" />
                {isConnecting ? 'Conectando...' : 'Conectar com Google'}
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="pt-2 border-t border-[#333333]">
            <p className="text-xs text-text-tertiary">
              Conecte sua conta do YouTube Music para acessar playlists, músicas curtidas e histórico.
              <a 
                href="https://music.youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "text-accent-cyan hover:underline ml-1",
                  "inline-flex items-center gap-1 font-semibold",
                  "transition-colors duration-normal"
                )}
              >
                Abrir YouTube Music <ExternalLink aria-hidden="true" className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </Card>

      <YouTubeMusicSetupWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />
    </>
  );
}
