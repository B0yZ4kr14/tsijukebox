import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSpotifyStore } from '@/stores';

/**
 * Estados de conexão possíveis
 */
type ConnectionState = 'connected' | 'reconnecting' | 'offline';

/**
 * Props do componente
 */
interface ConnectionStatusProps {
  /** Mostra apenas em modo desenvolvedor */
  devMode?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente que exibe o status de conexão de forma discreta
 * 
 * MELHORIA 1: Substitui a mensagem técnica "Polling - WebSocket indisponível"
 * por um indicador visual discreto com cores semânticas.
 */
export function ConnectionStatus({ devMode = false, className = '' }: ConnectionStatusProps) {
  const { isConnected, checkConnection } = useSpotifyStore();
  const [connectionState, setConnectionState] = useState<ConnectionState>('offline');
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Verifica conexão periodicamente
    const checkInterval = setInterval(async () => {
      const connected = await checkConnection();
      setConnectionState(connected ? 'connected' : 'offline');
    }, 5000);

    // Verifica imediatamente
    checkConnection().then((connected) => {
      setConnectionState(connected ? 'connected' : 'offline');
    });

    return () => clearInterval(checkInterval);
  }, [checkConnection]);

  // Em produção, não mostra se não estiver em devMode
  if (!devMode && import.meta.env.PROD) {
    return null;
  }

  // Configuração visual baseada no estado
  const config = {
    connected: {
      icon: Wifi,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      label: 'Conectado',
      description: 'Sistema online e funcionando',
    },
    reconnecting: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      label: 'Reconectando',
      description: 'Tentando restabelecer conexão...',
    },
    offline: {
      icon: WifiOff,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      label: 'Offline',
      description: 'Sem conexão com o servidor',
    },
  };

  const { icon: Icon, color, bgColor, label, description } = config[connectionState];

  return (
    <div className={`relative ${className}`}>
      {/* Indicador visual discreto */}
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-md
          ${bgColor} ${color}
          transition-all duration-200
          hover:scale-105
        `}
        aria-label={`Status de conexão: ${label}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {devMode && (
          <span className="text-xs font-medium">{label}</span>
        )}
      </button>

      {/* Tooltip informativo */}
      {showTooltip && (
        <div
          className="
            absolute top-full left-0 mt-2 z-50
            px-3 py-2 rounded-lg
            bg-gray-900 border border-gray-700
            text-xs text-gray-300
            whitespace-nowrap
            shadow-xl
            animate-in fade-in slide-in-from-top-1
          "
        >
          <div className="font-semibold text-white">{label}</div>
          <div className="text-gray-400">{description}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook para log de debug em desenvolvimento
 */
export function useConnectionDebug() {
  const { isConnected, error } = useSpotifyStore();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.group('🔌 Connection Status');
      console.log('Connected:', isConnected);
      if (error) console.error('Error:', error);
      console.groupEnd();
    }
  }, [isConnected, error]);
}
