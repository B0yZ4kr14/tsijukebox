import { Music, FolderMusic, Mic2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpotifyStore } from '@/stores';
import { Button } from '@/components/ui/button';

/**
 * Componente de estado vazio do player com CTAs claros
 * 
 * MELHORIA 2: Substitui o estado vazio genérico por uma interface
 * orientadora que guia o usuário sobre como começar a usar o sistema.
 */
export function EmptyPlayerState() {
  const { isConnected, connect } = useSpotifyStore();
  const navigate = useNavigate();

  const handleSpotifyConnect = async () => {
    if (!isConnected) {
      await connect(); // Inicia fluxo OAuth do Spotify
    } else {
      navigate('/spotify'); // Vai para biblioteca Spotify
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 min-h-[400px]">
      {/* Ilustração animada */}
      <div className="relative">
        {/* Container principal com gradiente */}
        <div
          className="
            w-32 h-32 rounded-2xl 
            bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 
            flex items-center justify-center 
            animate-pulse
            shadow-lg shadow-cyan-500/20
          "
        >
          <Music className="w-16 h-16 text-cyan-400" />
        </div>

        {/* Ondas de áudio animadas */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-1 bg-cyan-400 rounded-full animate-bounce"
              style={{
                height: `${8 + i * 4}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Texto principal */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">
          Pronto para começar?
        </h3>
        <p className="text-sm text-gray-400 max-w-xs">
          Conecte sua conta Spotify ou adicione músicas locais para começar a tocar.
        </p>
      </div>

      {/* CTAs principais */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {/* CTA Spotify - Principal */}
        <Button
          onClick={handleSpotifyConnect}
          className="
            flex-1 
            bg-[#1DB954] hover:bg-[#1ed760] 
            text-white font-medium
            flex items-center justify-center gap-2 
            py-6
            transition-all duration-200
            hover:scale-105
            shadow-lg shadow-green-500/20
          "
        >
          <SpotifyIcon className="w-5 h-5" />
          {isConnected ? 'Abrir Spotify' : 'Conectar Spotify'}
        </Button>

        {/* CTA Secundário - Arquivos Locais */}
        <Button
          variant="outline"
          onClick={() => navigate('/settings/local-music')}
          className="
            flex-1 
            border-gray-600 hover:bg-gray-800 
            flex items-center justify-center gap-2 
            py-6
            transition-all duration-200
            hover:scale-105
          "
        >
          <FolderMusic className="w-5 h-5" />
          Música Local
        </Button>
      </div>

      {/* Ações rápidas secundárias */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => navigate('/karaoke')}
          className="
            flex items-center gap-2 
            text-sm text-gray-500 
            hover:text-cyan-400 
            transition-colors duration-200
          "
        >
          <Mic2 className="w-4 h-4" />
          Modo Karaoke
        </button>
        <button
          onClick={() => navigate('/settings/integrations')}
          className="
            text-sm text-gray-500 
            hover:text-cyan-400 
            transition-colors duration-200
          "
        >
          Outras integrações →
        </button>
      </div>
    </div>
  );
}

/**
 * Ícone do Spotify (SVG inline)
 */
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
