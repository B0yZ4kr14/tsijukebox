import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Activity, RefreshCw, SlidersHorizontal, Power, ChevronRight, ChevronLeft, HelpCircle, Music, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRipple } from '@/hooks/useRipple';
import { useSoundEffects } from '@/hooks/useSoundEffects';
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
      staggerChildren: 0.1,
      delayChildren: 0.15,
    }
  }
};

const buttonVariants = {
  hidden: { 
    opacity: 0, 
    x: -25,
    scale: 0.7,
    rotateZ: -8,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    rotateZ: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 22,
      mass: 0.8
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
              relative flex flex-col items-center justify-center gap-1.5
              w-[72px] h-[72px] rounded-2xl overflow-hidden
              ${colors.bg} border-2 ${colors.border}
              ${colors.pulseClass}
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${colors.glow} ${colors.hover}
            `}
            whileHover={{ y: -6, scale: 1.08 }}
            whileTap={{ y: 2, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          >
            <RippleContainer ripples={ripples} color={color} />
            
            {/* Top highlight */}
            <div className="absolute inset-x-2 top-1 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full z-10" />
            
            {/* Left highlight */}
            <div className="absolute left-1 inset-y-2 w-0.5 bg-gradient-to-b from-white/30 via-white/10 to-transparent rounded-full z-10" />
            
            {/* Icon */}
            <span className={`${colors.icon} relative z-10`}>{icon}</span>
            
            {/* Label */}
            <span className={`text-[9px] font-bold ${colors.text} uppercase tracking-wider relative z-10`}>
              {label}
            </span>

            {/* Bottom shadow */}
            <div className="absolute inset-x-2 bottom-1 h-1 bg-gradient-to-r from-transparent via-black/60 to-transparent rounded-full z-10" />
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
      {/* Fixed container */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
        {/* Circular Toggle Button - Always visible */}
        <motion.button
          onClick={() => {
            const newState = !isExpanded;
            setIsExpanded(newState);
            playSound(newState ? 'open' : 'close');
          }}
          className="command-deck-toggle-circular"
          aria-label={isExpanded ? t('commandDeck.collapse') : t('commandDeck.expand')}
          aria-expanded={isExpanded}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: isExpanded ? 180 : 0,
            x: isExpanded ? 6 : 0
          }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5 text-cyan-300" />
          ) : (
            <ChevronRight className="w-5 h-5 text-cyan-300" />
          )}
        </motion.button>

        {/* Main Container - Slides in/out completely */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="command-deck-vertical-ultra ml-2"
              initial={{ x: -220, opacity: 0, scale: 0.85, rotateY: -20 }}
              animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ x: -220, opacity: 0, scale: 0.85, rotateY: -20 }}
              transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.9 }}
            >
              {/* Buttons with cascade animation */}
              <motion.div 
                className="flex flex-col gap-2 p-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Info Buttons (Cyan) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<LineChart className="w-5 h-5" />}
                    label={t('commandDeck.dashboard')}
                    tooltip={t('commandDeck.tooltips.dashboard')}
                    onClick={handleDashboard}
                    color="cyan"
                    disabled={disabled}
                  />
                </motion.div>
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Activity className="w-5 h-5" />}
                    label={t('commandDeck.datasource')}
                    tooltip={t('commandDeck.tooltips.datasource')}
                    onClick={handleDatasource}
                    color="cyan"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Divider */}
                <motion.div variants={buttonVariants}>
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                </motion.div>

                {/* Action Button (Amber) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<RefreshCw className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />}
                    label={t('commandDeck.reload')}
                    tooltip={t('commandDeck.tooltips.reload')}
                    onClick={handleReload}
                    color="amber"
                    disabled={disabled || isReloading}
                  />
                </motion.div>

                {/* Setup Button (White) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<SlidersHorizontal className="w-5 h-5" />}
                    label={t('commandDeck.setup')}
                    tooltip={t('commandDeck.tooltips.setup')}
                    onClick={handleSetup}
                    color="white"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Help Button (White) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<HelpCircle className="w-5 h-5" />}
                    label={t('commandDeck.help')}
                    tooltip={t('commandDeck.tooltips.help')}
                    onClick={() => navigate('/help')}
                    color="white"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Music Provider Divider */}
                <motion.div variants={buttonVariants}>
                  <div className="h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
                </motion.div>

                {/* Spotify Button (Green) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Music className="w-5 h-5" />}
                    label="SPOTIFY"
                    tooltip={t('commandDeck.tooltips.spotify')}
                    onClick={() => navigate('/spotify')}
                    color="green"
                    disabled={disabled}
                  />
                </motion.div>

                {/* YouTube Music Button (Red) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Youtube className="w-5 h-5" />}
                    label="YOUTUBE"
                    tooltip={t('commandDeck.tooltips.youtube')}
                    onClick={() => navigate('/youtube-music')}
                    color="red"
                    disabled={disabled}
                  />
                </motion.div>

                {/* Divider */}
                <motion.div variants={buttonVariants}>
                  <div className="h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                </motion.div>

                {/* Critical Button (Red) */}
                <motion.div variants={buttonVariants}>
                  <DeckButton
                    icon={<Power className="w-5 h-5" />}
                    label={t('commandDeck.reboot')}
                    tooltip={t('commandDeck.tooltips.reboot')}
                    onClick={() => setShowRebootDialog(true)}
                    color="red"
                    disabled={disabled}
                  />
                </motion.div>
              </motion.div>
              
              {/* Reflection effect */}
              <div className="command-deck-reflection" />
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