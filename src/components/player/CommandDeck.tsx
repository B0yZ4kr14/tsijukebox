import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Activity, RefreshCw, SlidersHorizontal, Power, ChevronRight, HelpCircle, Music, Youtube, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { useUser } from '@/contexts/UserContext';
import { useTranslation, useRipple, useSoundEffects } from '@/hooks/common';
import { RippleContainer } from '@/components/ui/RippleContainer';
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
  color: 'cyan' | 'amber' | 'white' | 'red' | 'green';
  disabled?: boolean;
}

const colorClasses = {
  cyan: {
    bg: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
    border: 'border-cyan-400/60',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_20px_hsl(185_100%_50%/0.35)]',
    hover: 'hover:border-cyan-300/90 hover:shadow-[0_0_35px_hsl(185_100%_50%/0.55)]',
    icon: 'text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]',
    pulseClass: 'deck-button-cyan deck-button-3d-ultra',
  },
  amber: {
    bg: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
    border: 'border-amber-400/60',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_20px_hsl(30_100%_50%/0.35)]',
    hover: 'hover:border-amber-300/90 hover:shadow-[0_0_35px_hsl(30_100%_50%/0.55)]',
    icon: 'text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]',
    pulseClass: 'deck-button-amber deck-button-3d-ultra',
  },
  white: {
    bg: 'bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800',
    border: 'border-white/50',
    text: 'text-white',
    glow: 'shadow-[0_0_18px_hsl(0_0%_100%/0.25)]',
    hover: 'hover:border-white/70 hover:shadow-[0_0_30px_hsl(0_0%_100%/0.4)]',
    icon: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]',
    pulseClass: 'deck-button-white deck-button-3d-ultra',
  },
  red: {
    bg: 'bg-gradient-to-b from-red-900/70 via-slate-800 to-slate-900',
    border: 'border-red-400/60',
    text: 'text-red-300',
    glow: 'shadow-[0_0_20px_hsl(0_100%_50%/0.35)]',
    hover: 'hover:border-red-300/90 hover:shadow-[0_0_35px_hsl(0_100%_50%/0.55)]',
    icon: 'text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.9)]',
    pulseClass: 'deck-button-red deck-button-3d-ultra',
  },
  green: {
    bg: 'bg-gradient-to-b from-green-900/70 via-slate-800 to-slate-900',
    border: 'border-green-400/60',
    text: 'text-green-300',
    glow: 'shadow-[0_0_20px_hsl(141_70%_50%/0.35)]',
    hover: 'hover:border-green-300/90 hover:shadow-[0_0_35px_hsl(141_70%_50%/0.55)]',
    icon: 'text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.9)]',
    pulseClass: 'deck-button-green deck-button-3d-ultra',
  },
};

// Cascade animation variants
const containerVariants = {
  hidden: { 
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren"
    }
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const buttonVariants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  }
};

function DeckButton({ icon, label, tooltip, onClick, color, disabled }: DeckButtonProps) {
  const colors = colorClasses[color];
  const { ripples, createRipple } = useRipple();
  const { playSound } = useSoundEffects();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    createRipple(e);
    playSound('click');
    onClick();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={handleClick}
            disabled={disabled}
            className={`
              relative flex flex-col items-center justify-center gap-1
              w-14 h-14 rounded-xl overflow-hidden
              ${colors.bg} border ${colors.border}
              ${colors.pulseClass}
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${colors.glow} ${colors.hover}
            `}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <RippleContainer ripples={ripples} color={color} />
            
            {/* Top highlight */}
            <div className="absolute inset-x-1 top-0.5 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-10" />
            
            {/* Icon */}
            <span className={`${colors.icon} relative z-10`}>{icon}</span>
            
            {/* Label */}
            <span className={`text-[7px] font-bold ${colors.text} uppercase tracking-wider relative z-10`}>
              {label}
            </span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-slate-900 border-cyan-500/50 text-cyan-100 shadow-xl">
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
  const { playSound } = useSoundEffects();
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
      {/* Mini Rail - Positioned bottom-left, above VoiceControl */}
      <div className="fixed bottom-24 left-0 z-40 flex items-end">
        {/* Mini Rail Toggle */}
        <motion.button
          onClick={() => {
            const newState = !isExpanded;
            setIsExpanded(newState);
            playSound(newState ? 'open' : 'close');
          }}
          className="command-deck-mini-rail"
          aria-label={isExpanded ? t('commandDeck.collapse') : t('commandDeck.expand')}
          aria-expanded={isExpanded}
          initial={{ x: -28 }}
          animate={{ x: 0 }}
          whileHover={{ width: 32 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="flex flex-col items-center gap-1 py-2 px-1">
            <Menu aria-hidden="true" className={`w-4 h-4 text-cyan-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
            <span className="text-[7px] text-cyan-300/80 uppercase tracking-wider font-medium writing-mode-vertical">
              {isExpanded ? '×' : '≡'}
            </span>
          </div>
        </motion.button>

        {/* Expanded Menu - Horizontal bar */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="command-deck-expanded-bar ml-1"
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            >
              <motion.div 
                className="flex flex-wrap gap-1.5 p-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Row 1: Info Buttons */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<LineChart className="w-4 h-4" />}
                    label={t('commandDeck.dashboard')}
                    tooltip={t('commandDeck.tooltips.dashboard')}
                    onClick={handleDashboard}
                    color="cyan"
                    disabled={disabled}
                  />
                </motion.div>
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Activity className="w-4 h-4" />}
                    label={t('commandDeck.datasource')}
                    tooltip={t('commandDeck.tooltips.datasource')}
                    onClick={handleDatasource}
                    color="cyan"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Action Button */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<RefreshCw aria-hidden="true" className={`w-4 h-4 ${isReloading ? 'animate-spin' : ''}`} />}
                    label={t('commandDeck.reload')}
                    tooltip={t('commandDeck.tooltips.reload')}
                    onClick={handleReload}
                    color="amber"
                    disabled={disabled || isReloading}
                  />
                </motion.div>

                {/* Setup */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<SlidersHorizontal className="w-4 h-4" />}
                    label={t('commandDeck.setup')}
                    tooltip={t('commandDeck.tooltips.setup')}
                    onClick={handleSetup}
                    color="white"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Help */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<HelpCircle className="w-4 h-4" />}
                    label={t('commandDeck.help')}
                    tooltip={t('commandDeck.tooltips.help')}
                    onClick={() => navigate('/help')}
                    color="white"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Divider vertical */}
                <motion.div 
                  variants={buttonVariants}
                  className="w-px h-14 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent mx-1"
                />

                {/* Spotify */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Music className="w-4 h-4" />}
                    label="SPOTIFY"
                    tooltip={t('commandDeck.tooltips.spotify')}
                    onClick={() => navigate('/spotify')}
                    color="green"
                    disabled={disabled}
                  />
                </motion.div>

                {/* YouTube */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Youtube className="w-4 h-4" />}
                    label="YOUTUBE"
                    tooltip={t('commandDeck.tooltips.youtube')}
                    onClick={() => navigate('/youtube-music')}
                    color="red"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Divider */}
                <motion.div 
                  variants={buttonVariants}
                  className="w-px h-14 bg-gradient-to-b from-transparent via-red-500/40 to-transparent mx-1"
                />

                {/* Reboot */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Power className="w-4 h-4" />}
                    label={t('commandDeck.reboot')}
                    tooltip={t('commandDeck.tooltips.reboot')}
                    onClick={() => setShowRebootDialog(true)}
                    color="red"
                    disabled={disabled}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reboot Confirmation Dialog */}
      <AlertDialog open={showRebootDialog} onOpenChange={setShowRebootDialog}>
        <AlertDialogContent className="bg-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Power className="w-5 h-5" />
              {t('commandDeck.rebootDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-kiosk-text/90">
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
