import { Headphones, Wifi, WifiOff, ListMusic } from 'lucide-react';
import { useSpotifyStore, usePlayerStore, useQueueStore } from '@/stores';
import { ConnectionStatus } from './ConnectionStatus';

/**
 * Props do componente
 */
interface StatusBarProps {
  /** Mostra métricas de sistema (CPU, RAM, Temp) */
  showSystemMetrics?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Barra de status superior com informações relevantes
 * 
 * MELHORIA 3: Substitui indicadores de sistema (CPU/RAM/Temp) por:
 * - Qualidade do áudio
 * - Status de conexão Spotify
 * - Próxima música na fila
 */
export function StatusBar({ showSystemMetrics = false, className = '' }: StatusBarProps) {
  const { isConnected: spotifyConnected } = useSpotifyStore();
  const { audioQuality } = usePlayerStore();
  const { queue } = useQueueStore();

  const nextTrack = queue[0];

  // Mapeia qualidade para exibição
  const qualityDisplay = {
    low: '128kbps',
    normal: '192kbps',
    high: '320kbps',
    lossless: 'HiFi',
  };

  return (
    <div className={`flex items-center gap-4 text-xs ${className}`}>
      {/* Qualidade do Áudio */}
      <div
        className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 transition"
        title="Qualidade do áudio"
      >
        <Headphones className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-medium">
          {qualityDisplay[audioQuality]}
        </span>
      </div>

      {/* Status de Conexão Spotify */}
      <div
        className={`flex items-center gap-1.5 transition ${
          spotifyConnected 
            ? 'text-green-400 hover:text-green-300' 
            : 'text-gray-500 hover:text-gray-400'
        }`}
        title={spotifyConnected ? 'Spotify conectado' : 'Spotify desconectado'}
      >
        {spotifyConnected ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span className="font-medium">Spotify</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span className="font-medium">Offline</span>
          </>
        )}
      </div>

      {/* Próxima na Fila */}
      <div
        className="flex items-center gap-1.5 text-gray-400 hover:text-magenta-400 transition max-w-[200px]"
        title={nextTrack ? `Próxima: ${nextTrack.name}` : 'Fila vazia'}
      >
        <ListMusic className="w-3.5 h-3.5 text-magenta-400 flex-shrink-0" />
        <span className="truncate font-medium">
          {nextTrack ? nextTrack.name : 'Fila vazia'}
        </span>
      </div>

      {/* Indicador de Conexão (discreto) */}
      <ConnectionStatus />

      {/* Métricas de Sistema (opcional) */}
      {showSystemMetrics && <SystemMetrics />}
    </div>
  );
}

/**
 * Componente de métricas de sistema (CPU, RAM, Temperatura)
 * Apenas exibido quando habilitado nas configurações
 */
function SystemMetrics() {
  // TODO: Implementar leitura real de métricas via API
  const metrics = {
    cpu: 0,
    ram: 0,
    temp: 0,
    tempMax: 0,
  };

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 border-l border-gray-700 pl-4 ml-2">
      <span title="CPU">
        CPU: {metrics.cpu}%
      </span>
      <span title="RAM">
        RAM: {metrics.ram}%
      </span>
      <span title="Temperatura">
        {metrics.temp}°C / {metrics.tempMax || '--'}°C
      </span>
    </div>
  );
}
