import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORAGE_KEYS } from '@/lib/constants';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function GuidedTour({ steps, isOpen, onClose, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const updateTargetPosition = useCallback(() => {
    if (!isOpen || currentStep >= steps.length) return;
    
    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      setTargetRect(target.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep, steps]);

  useEffect(() => {
    updateTargetPosition();
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEYS.TOUR_COMPLETE, 'true');
    setCurrentStep(0);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEYS.TOUR_COMPLETE, 'true');
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 20;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (step.position) {
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Dark overlay with cutout for target */}
        <div className="tour-overlay" />
        
        {/* Spotlight on target */}
        {targetRect && (
          <motion.div
            className="tour-spotlight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          className="tour-tooltip"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={getTooltipPosition()}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-kiosk-text/50 hover:text-kiosk-text transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-label-yellow">{step.title}</h3>
            </div>
            <p className="text-sm text-kiosk-text/80 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-cyan-400 w-4'
                    : index < currentStep
                    ? 'bg-cyan-400/50'
                    : 'bg-kiosk-text/30'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-kiosk-text/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-kiosk-text/70 hover:text-kiosk-text button-ghost-visible"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <span className="text-xs text-kiosk-text/50">
              {currentStep + 1} / {steps.length}
            </span>

            <Button
              size="sm"
              onClick={handleNext}
              className="button-primary-glow-3d"
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useTourSteps(): TourStep[] {
  return [
    {
      target: '.logo-container-3d, .logo-container-ultra',
      title: 'Bem-vindo!',
      description: 'Este é seu sistema de música inteligente. Vamos fazer um tour rápido pelas principais funcionalidades.',
      position: 'bottom',
    },
    {
      target: '.command-deck-vertical',
      title: 'Painel de Controle',
      description: 'Aqui você encontra atalhos para Dashboard, configurações e controles do sistema. Clique na aba para expandir.',
      position: 'right',
    },
    {
      target: '.player-controls, [class*="PlayerControls"]',
      title: 'Controles do Player',
      description: 'Use estes botões para tocar, pausar, avançar e retroceder músicas. Você também pode usar gestos de deslize!',
      position: 'top',
    },
    {
      target: '.volume-slider, [class*="VolumeSlider"]',
      title: 'Controle de Volume',
      description: 'Ajuste o volume da música deslizando a barra. Você também pode usar as setas do teclado.',
      position: 'top',
    },
    {
      target: '[class*="WeatherWidget"]',
      title: 'Widget de Clima',
      description: 'Veja a temperatura e condições do tempo da sua cidade. Configure nas configurações.',
      position: 'bottom',
    },
    {
      target: '[class*="SpotifyPanel"], [class*="spotify"]',
      title: 'Integração Spotify',
      description: 'Conecte sua conta Spotify para acessar suas playlists, músicas curtidas e descobrir novas músicas.',
      position: 'left',
    },
  ];
}

export function isTourComplete(): boolean {
  return localStorage.getItem(STORAGE_KEYS.TOUR_COMPLETE) === 'true';
}

export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEYS.TOUR_COMPLETE);
}
