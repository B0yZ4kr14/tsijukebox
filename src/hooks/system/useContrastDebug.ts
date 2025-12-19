import { useState, useEffect, useCallback } from 'react';
import {
  calculateContrastRatio,
  getEffectiveBackgroundColor,
  isLargeText,
  meetsWCAGAA,
  isLightColor,
  getContrastSeverity,
} from '@/lib/contrastUtils';

export interface ContrastIssue {
  id: string;
  element: HTMLElement;
  type: 'low-contrast-text' | 'light-background' | 'invisible-text' | 'dark-text-on-dark';
  severity: 'warning' | 'error';
  details: string;
  ratio?: number;
  foregroundColor?: string;
  backgroundColor?: string;
  suggestion?: string;
}

const STORAGE_KEY = 'tsi-contrast-debug-enabled';

// Seletores de elementos a ignorar
const IGNORE_SELECTORS = [
  '[data-contrast-debug-panel]',
  '.debug-contrast-panel',
  'script',
  'style',
  'noscript',
  'svg',
  'path',
  'circle',
  'rect',
  'iframe',
];

export function useContrastDebug() {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [issues, setIssues] = useState<ContrastIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentIssueIndex, setCurrentIssueIndex] = useState(0);

  // Persistir estado
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isEnabled));
  }, [isEnabled]);

  // Função para escanear o DOM
  const scanForIssues = useCallback(() => {
    if (!isEnabled) {
      setIssues([]);
      return;
    }

    setIsScanning(true);
    const foundIssues: ContrastIssue[] = [];
    let issueId = 0;

    // Selecionar todos os elementos de texto
    const textElements = document.querySelectorAll(
      'p, span, h1, h2, h3, h4, h5, h6, label, a, button, li, td, th, div, input, textarea, select'
    );

    textElements.forEach((el) => {
      const element = el as HTMLElement;
      
      // Ignorar elementos específicos
      if (IGNORE_SELECTORS.some(sel => element.matches(sel) || element.closest(sel))) {
        return;
      }

      // Ignorar elementos ocultos
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return;
      }

      // Verificar se tem texto direto
      const hasDirectText = Array.from(element.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      );
      
      if (!hasDirectText && !['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
        return;
      }

      const foregroundColor = style.color;
      const backgroundColor = getEffectiveBackgroundColor(element);
      const ratio = calculateContrastRatio(foregroundColor, backgroundColor);

      if (ratio === null) return;

      const isLarge = isLargeText(element);
      const severity = getContrastSeverity(ratio, isLarge);

      // Detectar problemas específicos
      if (severity !== 'ok') {
        // Problema: texto escuro em fundo escuro
        if (!isLightColor(foregroundColor) && !isLightColor(backgroundColor)) {
          foundIssues.push({
            id: `issue-${issueId++}`,
            element,
            type: 'dark-text-on-dark',
            severity,
            details: `Texto escuro em fundo escuro. Ratio: ${ratio.toFixed(2)}:1`,
            ratio,
            foregroundColor,
            backgroundColor,
            suggestion: 'Usar text-label-yellow ou text-kiosk-text',
          });
        } else {
          foundIssues.push({
            id: `issue-${issueId++}`,
            element,
            type: 'low-contrast-text',
            severity,
            details: `Contraste insuficiente. Ratio: ${ratio.toFixed(2)}:1 (mínimo: ${isLarge ? '3' : '4.5'}:1)`,
            ratio,
            foregroundColor,
            backgroundColor,
            suggestion: isLightColor(backgroundColor) 
              ? 'Usar texto mais escuro ou fundo mais escuro' 
              : 'Usar text-label-yellow ou text-kiosk-text',
          });
        }
      }
    });

    // Detectar fundos claros em contexto escuro (Cards brancos)
    const cardElements = document.querySelectorAll('.bg-white, .bg-background, .bg-card, [class*="bg-slate-"]');
    cardElements.forEach((el) => {
      const element = el as HTMLElement;
      
      if (IGNORE_SELECTORS.some(sel => element.matches(sel) || element.closest(sel))) {
        return;
      }

      const style = window.getComputedStyle(element);
      if (style.display === 'none') return;

      const bgColor = style.backgroundColor;
      if (isLightColor(bgColor)) {
        // Verificar se está em contexto escuro (ancestral escuro)
        const parentBg = element.parentElement 
          ? getEffectiveBackgroundColor(element.parentElement) 
          : 'rgb(0,0,0)';
        
        if (!isLightColor(parentBg)) {
          foundIssues.push({
            id: `issue-${issueId++}`,
            element,
            type: 'light-background',
            severity: 'warning',
            details: 'Card/elemento com fundo claro em contexto escuro',
            backgroundColor: bgColor,
            suggestion: 'Usar bg-kiosk-surface ou card-option-dark-3d',
          });
        }
      }
    });

    setIssues(foundIssues);
    setIsScanning(false);
    setCurrentIssueIndex(0);

    // Log em desenvolvimento
    if (import.meta.env.DEV && foundIssues.length > 0) {
      console.log(`[Contrast Debug] Encontrados ${foundIssues.length} problemas de contraste`);
    }
  }, [isEnabled]);

  // Escanear quando habilitado
  useEffect(() => {
    if (isEnabled) {
      // Aguardar renderização completa
      const timer = setTimeout(scanForIssues, 500);
      return () => clearTimeout(timer);
    } else {
      // Limpar classes de debug
      document.querySelectorAll('.debug-contrast-error, .debug-light-background, .debug-dark-text').forEach(el => {
        el.classList.remove('debug-contrast-error', 'debug-light-background', 'debug-dark-text');
      });
      setIssues([]);
    }
  }, [isEnabled, scanForIssues]);

  // Adicionar/remover atributo de debug no body
  useEffect(() => {
    if (isEnabled) {
      document.body.setAttribute('data-contrast-debug', 'true');
    } else {
      document.body.removeAttribute('data-contrast-debug');
    }
  }, [isEnabled]);

  // Navegar para próximo problema
  const nextIssue = useCallback(() => {
    if (issues.length === 0) return;
    const newIndex = (currentIssueIndex + 1) % issues.length;
    setCurrentIssueIndex(newIndex);
    issues[newIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [issues, currentIssueIndex]);

  // Navegar para problema anterior
  const prevIssue = useCallback(() => {
    if (issues.length === 0) return;
    const newIndex = currentIssueIndex === 0 ? issues.length - 1 : currentIssueIndex - 1;
    setCurrentIssueIndex(newIndex);
    issues[newIndex].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [issues, currentIssueIndex]);

  // Atalho de teclado Ctrl+Shift+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsEnabled(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isEnabled,
    setIsEnabled,
    issues,
    isScanning,
    scanForIssues,
    currentIssueIndex,
    currentIssue: issues[currentIssueIndex] || null,
    nextIssue,
    prevIssue,
    errorCount: issues.filter(i => i.severity === 'error').length,
    warningCount: issues.filter(i => i.severity === 'warning').length,
  };
}
