import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Activity, RefreshCw, SlidersHorizontal, Power, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/hooks/useTranslation';
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
}

const colorClasses = {
  cyan: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/30',
    hover: 'hover:border-cyan-400/60 hover:shadow-cyan-500/40',
    icon: 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]',
  },
  amber: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30',
    hover: 'hover:border-amber-400/60 hover:shadow-amber-500/40',
    icon: 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]',
  },
  white: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-white/30',
    text: 'text-white',
    glow: 'shadow-white/20',
    hover: 'hover:border-white/50 hover:shadow-white/30',
    icon: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]',
  },
  red: {
    bg: 'bg-gradient-to-b from-slate-700 to-slate-800',
    border: 'border-red-500/40',
    text: 'text-red-400',
    glow: 'shadow-red-500/30',
    hover: 'hover:border-red-400/60 hover:shadow-red-500/40',
    icon: 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]',
  },
};

function DeckButton({ icon, label, tooltip, onClick, color, disabled }: DeckButtonProps) {
  const colors = colorClasses[color];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
              relative flex flex-col items-center justify-center gap-1.5
              w-14 h-14 rounded-xl ripple-effect
              ${colors.bg} border-2 ${colors.border}
              transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg ${colors.glow} ${colors.hover}
            `}
            whileHover={{ scale: 1.1, x: 4 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Top highlight for 3D bevel */}
            <div className="absolute inset-x-2 top-1 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
            
            {/* Icon with glow */}
            <span className={`${colors.icon} relative z-10`}>{icon}</span>
            
            {/* Label */}
            <span className={`text-[8px] font-bold ${colors.text} uppercase tracking-wider relative z-10`}>
              {label}
            </span>

            {/* Bottom shadow for 3D depth */}
            <div className="absolute inset-x-2 bottom-1 h-0.5 bg-black/60 rounded-full" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-slate-600 text-white shadow-2xl">
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
  const { t } = useTranslation();
  const { hasPermission } = useUser();
  const [showRebootDialog, setShowRebootDialog] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
      toast.success(t('commandDeck.messages.reloadSuccess'));
    } catch (error) {
      toast.error(t('commandDeck.messages.reloadError'));
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
      toast.success(t('commandDeck.messages.rebootSuccess'));
    } catch (error) {
      toast.error(t('commandDeck.messages.rebootError'));
    }
    setShowRebootDialog(false);
  };

  // Don't render if user doesn't have system control permissions
  if (!canAccessSystemControls) {
    return null;
  }

  return (
    <>
      {/* Vertical Command Deck - Left Side */}
      <motion.div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center"
        initial={{ x: -100 }}
        animate={{ x: isExpanded ? 0 : -72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Deck Container */}
        <div className="command-deck-vertical flex flex-col gap-2 p-3 rounded-r-2xl">
          {/* Admin Badge */}
          <div className="text-center mb-1">
            <span className="text-[8px] font-semibold text-label-yellow uppercase tracking-[0.2em]">
              {t('commandDeck.admin')}
            </span>
          </div>

          {/* Info Buttons (Cyan) */}
          <DeckButton
            icon={<LineChart className="w-4 h-4" />}
            label={t('commandDeck.dashboard')}
            tooltip={t('commandDeck.tooltips.dashboard')}
            onClick={handleDashboard}
            color="cyan"
            disabled={disabled}
          />
          <DeckButton
            icon={<Activity className="w-4 h-4" />}
            label={t('commandDeck.datasource')}
            tooltip={t('commandDeck.tooltips.datasource')}
            onClick={handleDatasource}
            color="cyan"
            disabled={disabled}
          />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-1" />

          {/* Action Button (Amber) */}
          <DeckButton
            icon={<RefreshCw className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />}
            label={t('commandDeck.reload')}
            tooltip={t('commandDeck.tooltips.reload')}
            onClick={handleReload}
            color="amber"
            disabled={disabled || isReloading}
          />

          {/* Setup Button (White) */}
          <DeckButton
            icon={<SlidersHorizontal className="w-4 h-4" />}
            label={t('commandDeck.setup')}
            tooltip={t('commandDeck.tooltips.setup')}
            onClick={handleSetup}
            color="white"
            disabled={disabled}
          />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent my-1" />

          {/* Critical Button (Red) */}
          <DeckButton
            icon={<Power className="w-4 h-4" />}
            label={t('commandDeck.reboot')}
            tooltip={t('commandDeck.tooltips.reboot')}
            onClick={() => setShowRebootDialog(true)}
            color="red"
            disabled={disabled}
          />
        </div>

        {/* Toggle Tab */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="command-deck-tab flex items-center justify-center w-6 h-16 rounded-r-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Reboot Confirmation Dialog */}
      <AlertDialog open={showRebootDialog} onOpenChange={setShowRebootDialog}>
        <AlertDialogContent className="bg-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Power className="w-5 h-5" />
              {t('commandDeck.rebootDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kiosk-text/75">
              {t('commandDeck.rebootDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 button-outline-neon">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReboot}
              className="bg-red-600 hover:bg-red-700 text-white button-destructive-neon"
            >
              {t('commandDeck.rebootDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}