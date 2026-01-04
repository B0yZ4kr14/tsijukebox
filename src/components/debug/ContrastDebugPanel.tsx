import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from "@/components/ui/themed";
import { useContrastDebug, ContrastIssue } from '@/hooks';

export function ContrastDebugPanel() {
  const {
    isEnabled,
    setIsEnabled,
    issues,
    isScanning,
    scanForIssues,
    currentIssueIndex,
    currentIssue,
    nextIssue,
    prevIssue,
    errorCount,
    warningCount,
  } = useContrastDebug();

  // Destacar elemento atual
  useEffect(() => {
    // Remover destaque anterior
    document.querySelectorAll('.debug-highlight-current').forEach(el => {
      el.classList.remove('debug-highlight-current');
    });

    // Adicionar destaque ao elemento atual
    if (currentIssue?.element) {
      currentIssue.element.classList.add('debug-highlight-current');
    }

    return () => {
      document.querySelectorAll('.debug-highlight-current').forEach(el => {
        el.classList.remove('debug-highlight-current');
      });
    };
  }, [currentIssue]);

  if (!isEnabled) return null;

  const getTypeLabel = (type: ContrastIssue['type']) => {
    switch (type) {
      case 'low-contrast-text': return 'Baixo Contraste';
      case 'light-background': return 'Fundo Claro';
      case 'invisible-text': return 'Texto Invisível';
      case 'dark-text-on-dark': return 'Texto Escuro';
      default: return type;
    }
  };

  const getTypeIcon = (severity: 'warning' | 'error') => {
    return severity === 'error' 
      ? <XCircle className="w-4 h-4 text-red-500" />
      : <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <AnimatePresence>
      <motion.div
        data-contrast-debug-panel
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="debug-contrast-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400">Debug Contraste</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-red-500/20"
            onClick={() => setIsEnabled(false)}
          >
            <X aria-hidden="true" className="w-4 h-4 text-red-400" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/30">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs font-medium text-red-400">{errorCount} erros</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-500/20 border border-yellow-500/30">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-400">{warningCount} avisos</span>
          </div>
        </div>

        {/* Scanning indicator */}
        {isScanning && (
          <div className="flex items-center gap-2 text-xs text-kiosk-text/85 mb-3">
            <RefreshCw aria-hidden="true" className="w-3 h-3 animate-spin" />
            <span>Escaneando...</span>
          </div>
        )}

        {/* Current Issue */}
        {currentIssue && (
          <div className="mb-3 p-2 rounded bg-[hsl(220_25%_15%)] border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              {getTypeIcon(currentIssue.severity)}
              <span className="text-xs font-medium text-kiosk-text">
                {getTypeLabel(currentIssue.type)}
              </span>
              <span className="text-xs text-kiosk-text/85 ml-auto">
                {currentIssueIndex + 1}/{issues.length}
              </span>
            </div>
            
            <p className="text-xs text-kiosk-text/85 mb-2">
              {currentIssue.details}
            </p>

            {currentIssue.ratio && (
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="text-kiosk-text/85">Ratio:</span>
                <span className={
                  currentIssue.ratio < 3 ? 'text-red-400' : 
                  currentIssue.ratio < 4.5 ? 'text-yellow-400' : 'text-green-400'
                }>
                  {currentIssue.ratio.toFixed(2)}:1
                </span>
              </div>
            )}

            {currentIssue.suggestion && (
              <div className="text-xs p-1.5 rounded bg-green-500/10 border border-green-500/20">
                <span className="text-green-400">💡 {currentIssue.suggestion}</span>
              </div>
            )}

            {/* Element info */}
            <div className="mt-2 text-[10px] text-kiosk-text/85 font-mono truncate">
              &lt;{currentIssue.element.tagName.toLowerCase()}
              {currentIssue.element.className && ` class="${currentIssue.element.className.slice(0, 50)}..."`}
              &gt;
            </div>
          </div>
        )}

        {/* No issues */}
        {issues.length === 0 && !isScanning && (
          <div className="text-center py-4 text-xs text-green-400">
            ✅ Nenhum problema de contraste detectado
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs button-outline-neon"
            onClick={prevIssue}
            disabled={issues.length === 0}
          >
            <ChevronLeft aria-hidden="true" className="w-3 h-3 mr-1" />
            Anterior
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={scanForIssues}
            title="Re-escanear"
          >
            <RefreshCw aria-hidden="true" className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs button-outline-neon"
            onClick={nextIssue}
            disabled={issues.length === 0}
          >
            Próximo
            <ChevronRight aria-hidden="true" className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* Shortcut hint */}
        <p className="text-[10px] text-kiosk-text/85 text-center mt-2">
          Atalho: <kbd className="px-1 py-0.5 rounded bg-[hsl(220_25%_20%)] text-cyan-400">Ctrl+Shift+C</kbd>
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
