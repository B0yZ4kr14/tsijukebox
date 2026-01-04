import { usePlayerStore } from '@/stores';
import { EmptyPlayerState } from './EmptyPlayerState';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';

/**
 * Componente principal do player "Now Playing" com melhorias de UX
 * 
 * Integra a MELHORIA 2: Mostra EmptyPlayerState quando não há música tocando,
 * ou o player completo quando há uma faixa ativa.
 */
export function NowPlayingEnhanced() {
  const { currentTrack } = usePlayerStore();

  // Se não há música, mostra o Empty State
  if (!currentTrack) {
    return <EmptyPlayerState />;
  }

  // Caso contrário, mostra o player completo
  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-900/50 rounded-2xl backdrop-blur-sm">
      {/* Informações da faixa */}
      <TrackInfo track={currentTrack} />

      {/* Barra de progresso */}
      <ProgressBar />

      {/* Controles de reprodução */}
      <div className="flex items-center justify-between gap-4">
        <PlayerControls />
        <VolumeControl />
      </div>
    </div>
  );
}

/**
 * Informações da faixa atual
 */
interface TrackInfoProps {
  track: {
    name: string;
    artist: string;
    album: string;
    albumArt?: string;
  };
}

function TrackInfo({ track }: TrackInfoProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Capa do álbum */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={track.album}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <Music className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Informações de texto */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white truncate">
          {track.name}
        </h3>
        <p className="text-sm text-gray-400 truncate">
          {track.artist}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {track.album}
        </p>
      </div>
    </div>
  );
}

/**
 * Barra de progresso da música
 */
function ProgressBar() {
  const { currentTime, duration, seek } = usePlayerStore();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {/* Barra clicável */}
      <div
        className="relative h-1.5 bg-gray-700 rounded-full cursor-pointer group"
        onClick={handleSeek}
      >
        {/* Progresso */}
        <div
          className="absolute h-full bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        {/* Indicador (aparece no hover) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, marginLeft: '-6px' }}
        />
      </div>

      {/* Tempos */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

/**
 * Controles de reprodução
 */
function PlayerControls() {
  const {
    isPlaying,
    shuffle,
    repeat,
    togglePlayPause,
    toggleShuffle,
    toggleRepeat,
    previous,
    next,
  } = usePlayerStore();

  return (
    <div className="flex items-center gap-2">
      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={`p-2 rounded-lg transition ${
          shuffle
            ? 'text-cyan-400 bg-cyan-400/10'
            : 'text-gray-400 hover:text-white'
        }`}
        title={shuffle ? 'Aleatório: Ativado' : 'Aleatório: Desativado'}
      >
        <Shuffle className="w-4 h-4" />
      </button>

      {/* Anterior */}
      <button
        onClick={previous}
        className="p-2 text-gray-400 hover:text-white transition"
        title="Anterior"
      >
        <SkipBack className="w-5 h-5" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlayPause}
        className="p-3 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-full hover:scale-110 transition"
        title={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Próximo */}
      <button
        onClick={next}
        className="p-2 text-gray-400 hover:text-white transition"
        title="Próximo"
      >
        <SkipForward className="w-5 h-5" />
      </button>

      {/* Repetir */}
      <button
        onClick={toggleRepeat}
        className={`p-2 rounded-lg transition relative ${
          repeat !== 'off'
            ? 'text-cyan-400 bg-cyan-400/10'
            : 'text-gray-400 hover:text-white'
        }`}
        title={
          repeat === 'off'
            ? 'Repetição: Desligada'
            : repeat === 'track'
            ? 'Repetir: Faixa'
            : 'Repetir: Fila'
        }
      >
        <Repeat className="w-4 h-4" />
        {repeat === 'track' && (
          <span className="absolute -top-1 -right-1 text-[10px] bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            1
          </span>
        )}
      </button>
    </div>
  );
}

/**
 * Controle de volume
 */
function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();

  return (
    <div className="flex items-center gap-2">
      {/* Botão mudo */}
      <button
        onClick={toggleMute}
        className="p-2 text-gray-400 hover:text-white transition"
        title={isMuted ? 'Desmutar' : 'Silenciar'}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : volume < 50 ? (
          <Volume1 className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Slider de volume */}
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-24 accent-cyan-500"
      />

      {/* Porcentagem */}
      <span className="text-xs text-gray-400 w-8">{volume}%</span>
    </div>
  );
}
