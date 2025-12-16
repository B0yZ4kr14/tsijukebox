import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Activity, RefreshCw, SlidersHorizontal, Power } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { useUser } from '@/contexts/UserContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CommandDeckProps {
  disabled?: boolean;
}

interface DeckButtonProps {
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  onClick: () => void;
  color: 'cyan' | 'amber' | 'white' | 'red';
  disabled?: boolean;
  separated?: boolean;
}

const colorClasses = {
  cyan: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    hover: 'hover:border-cyan-400/50 hover:shadow-cyan-500/30',
    icon: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]',
  },
  amber: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    hover: 'hover:border-amber-400/50 hover:shadow-amber-500/30',
    icon: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
  },
  white: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-white/20',
    text: 'text-white',
    glow: 'shadow-white/10',
    hover: 'hover:border-white/40 hover:shadow-white/20',
    icon: 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]',
  },
  red: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    hover: 'hover:border-red-400/50 hover:shadow-red-500/30',
    icon: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  },
};

function DeckButton({ icon, label, tooltip, onClick, color, disabled, separated }: DeckButtonProps) {
  const colors = colorClasses[color];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
              deck-button-3d deck-button-${color}
              relative flex flex-col items-center justify-center gap-1.5
              w-20 h-16 rounded-xl
              ${colors.bg} border-2
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              ${separated ? 'ml-6' : ''}
            `}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.92, y: 2 }}
          >
            {/* Top highlight for 3D bevel */}
            <div className="absolute inset-x-2 top-1 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
            
            {/* Icon with glow */}
            <span className={`${colors.icon} relative z-10`}>{icon}</span>
            
            {/* Label */}
            <span className={`text-[10px] font-semibold ${colors.text} uppercase tracking-wider relative z-10`}>
              {label}
            </span>

            {/* Bottom shadow for 3D depth */}
            <div className="absolute inset-x-2 bottom-1 h-0.5 bg-black/60 rounded-full" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-900 border-slate-600 text-white shadow-2xl">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SystemUrls {
  dashboardUrl: string;
  datasourceUrl: string;
}

export function CommandDeck({ disabled = false }: CommandDeckProps) {
  const navigate = useNavigate();
  const { hasPermission, isAuthenticated, user } = useUser();
  const [showRebootDialog, setShowRebootDialog] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [urls, setUrls] = useState<SystemUrls>({
    dashboardUrl: 'http://localhost:3000',
    datasourceUrl: 'http://localhost:9090',
  });

  // Load URLs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('system_urls');
    if (saved) {
      try {
        setUrls(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Only show for admin users
  const canAccessSystemControls = hasPermission('canAccessSystemControls');

  const handleDashboard = () => {
    window.open(urls.dashboardUrl, '_blank');
  };

  const handleDatasource = () => {
    window.open(urls.datasourceUrl, '_blank');
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await api.reloadServices();
      toast.success('Serviços reiniciados com sucesso');
    } catch (error) {
      toast.error('Erro ao reiniciar serviços');
    } finally {
      setIsReloading(false);
    }
  };

  const handleSetup = () => {
    navigate('/settings');
  };

  const handleReboot = async () => {
    try {
      await api.rebootSystem();
      toast.success('Sistema reiniciando...');
    } catch (error) {
      toast.error('Erro ao reiniciar sistema');
    }
    setShowRebootDialog(false);
  };

  // Don't render if user doesn't have system control permissions
  if (!canAccessSystemControls) {
    return null;
  }

  return (
    <>
      {/* Command Deck Container */}
      <motion.div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
      >
        {/* Admin Badge - more compact */}
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <span className="text-[9px] font-medium text-kiosk-text/40 uppercase tracking-[0.15em]">
            Admin
          </span>
        </motion.div>

        {/* Deck Housing with extreme 3D */}
        <div className="command-deck-container-3d flex items-center gap-3 px-5 py-4 rounded-2xl">
          {/* Info Buttons (Cyan) */}
          <DeckButton
            icon={<LineChart className="w-5 h-5" />}
            label="Dashboard"
            tooltip="Abrir painel de métricas"
            onClick={handleDashboard}
            color="cyan"
            disabled={disabled}
          />
          <DeckButton
            icon={<Activity className="w-5 h-5" />}
            label="Datasource"
            tooltip="Abrir fonte de dados"
            onClick={handleDatasource}
            color="cyan"
            disabled={disabled}
          />

          {/* Action Button (Amber) */}
          <DeckButton
            icon={<RefreshCw className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />}
            label="Reload"
            tooltip="Reiniciar serviços (soft restart)"
            onClick={handleReload}
            color="amber"
            disabled={disabled || isReloading}
          />

          {/* Setup Button (White) */}
          <DeckButton
            icon={<SlidersHorizontal className="w-5 h-5" />}
            label="Setup"
            tooltip="Configurações do sistema"
            onClick={handleSetup}
            color="white"
            disabled={disabled}
          />

          {/* Critical Button (Red) - Separated */}
          <DeckButton
            icon={<Power className="w-5 h-5" />}
            label="Reboot"
            tooltip="Reiniciar sistema (reboot)"
            onClick={() => setShowRebootDialog(true)}
            color="red"
            disabled={disabled}
            separated
          />
        </div>
      </motion.div>

      {/* Reboot Confirmation Dialog */}
      <AlertDialog open={showRebootDialog} onOpenChange={setShowRebootDialog}>
        <AlertDialogContent className="bg-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Power className="w-5 h-5" />
              Confirmar Reinicialização
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kiosk-text/75">
              O sistema será reiniciado. Todas as conexões serão perdidas temporariamente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReboot}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reiniciar Sistema
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
