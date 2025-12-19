import { HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuidedTour } from '@/components/tour/GuidedTour';
import { useSettingsTour, type SettingsTourId } from '@/hooks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SettingsSectionTourProps {
  sectionId: SettingsTourId;
  className?: string;
}

export function SettingsSectionTour({ sectionId, className }: SettingsSectionTourProps) {
  const { steps, isOpen, startTour, endTour, resetTour, isTourComplete, hasSteps } = useSettingsTour(sectionId);
  
  if (!hasSteps) return null;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={startTour}
            className={`text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 ${className}`}
          >
            {isTourComplete ? (
              <RotateCcw className="w-4 h-4 mr-1.5" />
            ) : (
              <HelpCircle className="w-4 h-4 mr-1.5" />
            )}
            <span className="text-xs font-medium">
              {isTourComplete ? 'Rever Tour' : 'Tour'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isTourComplete ? 'Assistir novamente o tour guiado' : 'Iniciar tour guiado desta seção'}</p>
        </TooltipContent>
      </Tooltip>

      <GuidedTour
        steps={steps}
        isOpen={isOpen}
        onClose={endTour}
        onComplete={endTour}
      />
    </>
  );
}
