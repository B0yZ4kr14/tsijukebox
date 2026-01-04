// Pages Social templates (2 files)

export function generatePagesSocialContent(path: string): string | null {
  switch (path) {
    case 'src/pages/social/index.ts':
      return `// Social pages barrel export
export { default as JamSession } from './JamSession';
`;

    case 'src/pages/social/JamSession.tsx':
      return `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJam } from '@/contexts/JamContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Music, 
  Play, 
  Pause, 
  SkipForward,
  Share2,
  LogOut,
  Crown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function JamSession() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { 
    session, 
    participants, 
    queue, 
    isHost,
    isLoading,
    leaveSession,
    skipTrack,
    togglePlayback
  } = useJam();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Sessão não encontrada</p>
        <Button onClick={() => navigate('/jam')}>Voltar</Button>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleLeave = async () => {
    await leaveSession();
    navigate('/jam');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {session.name}
            {isHost && <Crown className="h-5 w-5 text-yellow-500" />}
          </h1>
          <p className="text-muted-foreground">Código: {session.code}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={handleLeave}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Now Playing */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Tocando Agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-lg" />
              <div className="flex-1">
                <p className="font-medium">Track Name</p>
                <p className="text-sm text-muted-foreground">Artist Name</p>
              </div>
              {isHost && (
                <div className="flex gap-2">
                  <Button size="icon" onClick={togglePlayback}>
                    <Play className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipTrack}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participantes ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: p.avatar_color || '#6366f1' }}
                    >
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">{p.nickname}</span>
                    {p.is_host && (
                      <Badge variant="secondary">
                        <Crown className="h-3 w-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Fila de Reprodução</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {queue.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  A fila está vazia
                </p>
              ) : (
                queue.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                    <div className="w-10 h-10 bg-muted rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.track_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                    </div>
                    <Badge variant="outline">{track.votes} votos</Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
`;

    default:
      return null;
  }
}
