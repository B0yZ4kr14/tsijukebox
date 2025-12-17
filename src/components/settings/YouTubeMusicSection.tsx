import { useState } from 'react';
import { Youtube, LogOut, Check, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettings } from '@/contexts/SettingsContext';
import { youtubeMusicClient } from '@/lib/api/youtubeMusic';
import { useToast } from '@/hooks/use-toast';

export function YouTubeMusicSection() {
  const { toast } = useToast();
  const { youtubeMusic, setYouTubeMusicTokens, setYouTubeMusicUser, clearYouTubeMusicAuth } = useSettings();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/settings`;
      const { authUrl } = await youtubeMusicClient.getAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao iniciar autenticação',
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

  return (
    <Card className="card-dark-neon-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gold-neon font-bold">
          <Youtube className="w-5 h-5 text-red-500" />
          YouTube Music
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-label-yellow font-semibold">Status</span>
          {youtubeMusic?.isConnected ? (
            <Badge variant="default" className="bg-green-600 text-white font-bold">
              <Check className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-bold">
              <X className="w-3 h-3 mr-1" />
              Não conectado
            </Badge>
          )}
        </div>

        {youtubeMusic?.isConnected && youtubeMusic.user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-kiosk-surface/70 border border-cyan-500/20">
            <Avatar className="h-10 w-10">
              <AvatarImage src={youtubeMusic.user.imageUrl || undefined} />
              <AvatarFallback className="bg-red-600 text-white font-bold">{youtubeMusic.user.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-kiosk-text truncate">{youtubeMusic.user.name}</p>
              <p className="text-xs text-kiosk-text/70 truncate">{youtubeMusic.user.email}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {youtubeMusic?.isConnected ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="button-control-extreme-3d"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Desconectar
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="button-control-extreme-3d bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <Youtube className="w-4 h-4 mr-2" />
              {isConnecting ? 'Conectando...' : 'Conectar com Google'}
            </Button>
          )}
        </div>

        <div className="pt-2 border-t border-cyan-500/20">
          <p className="text-xs text-kiosk-text/70">
            Conecte sua conta do YouTube Music para acessar playlists, músicas curtidas e histórico.
            <a 
              href="https://music.youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline ml-1 inline-flex items-center gap-1 font-semibold"
            >
              Abrir YouTube Music <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
