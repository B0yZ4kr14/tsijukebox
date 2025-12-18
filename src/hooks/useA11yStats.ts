import { useState, useEffect, useCallback, useMemo } from 'react';

export interface A11yViolation {
  id: string;
  type: 'contrast' | 'alt' | 'aria' | 'native' | 'form' | 'wcag';
  severity: 'error' | 'warning' | 'info';
  file: string;
  line?: number;
  element: string;
  message: string;
  recommendation: string;
}

export interface ContrastStats {
  totalElements: number;
  passingElements: number;
  failingElements: number;
  averageRatio: number;
  opacityDistribution: Record<string, number>;
}

export interface CoverageStats {
  total: number;
  covered: number;
  percentage: number;
}

export interface A11yStats {
  overallScore: number;
  totalElements: number;
  conformingElements: number;
  violations: A11yViolation[];
  contrastStats: ContrastStats;
  altTextCoverage: CoverageStats;
  ariaLabelCoverage: CoverageStats;
  nativeElementsCount: number;
  wcagExceptionsCount: number;
  lastScanDate: Date | null;
}

// Mock data for demonstration - in production, this would come from actual scans
const generateMockStats = (): A11yStats => {
  const violations: A11yViolation[] = [
    {
      id: '1',
      type: 'contrast',
      severity: 'warning',
      file: 'src/components/QueuePanel.tsx',
      line: 45,
      element: 'GripVertical icon',
      message: 'Opacidade /20 pode ter baixo contraste',
      recommendation: 'Adicione hover state com opacity-100 ou use WCAG Exception comment',
    },
    {
      id: '2',
      type: 'alt',
      severity: 'error',
      file: 'src/components/AlbumCard.tsx',
      line: 23,
      element: '<img>',
      message: 'Imagem sem atributo alt',
      recommendation: 'Adicione alt="" para imagens decorativas ou descrição para informativas',
    },
    {
      id: '3',
      type: 'aria',
      severity: 'warning',
      file: 'src/components/PlayerControls.tsx',
      line: 67,
      element: '<button>',
      message: 'Botão com ícone sem aria-label',
      recommendation: 'Adicione aria-label descrevendo a ação do botão',
    },
    {
      id: '4',
      type: 'native',
      severity: 'info',
      file: 'src/pages/Settings.tsx',
      line: 120,
      element: '<select>',
      message: 'Elemento nativo <select> detectado',
      recommendation: 'Considere usar Select do Shadcn para consistência visual',
    },
    {
      id: '5',
      type: 'form',
      severity: 'warning',
      file: 'src/components/settings/WeatherConfigSection.tsx',
      line: 34,
      element: '<label>',
      message: 'Elemento <label> nativo detectado',
      recommendation: 'Use Label ou FormLabel do Shadcn para estilização consistente',
    },
  ];

  const contrastStats: ContrastStats = {
    totalElements: 1245,
    passingElements: 1180,
    failingElements: 65,
    averageRatio: 7.2,
    opacityDistribution: {
      '/100': 520,
      '/90': 280,
      '/85': 190,
      '/80': 120,
      '/70': 85,
      '/60': 35,
      '/50': 15,
    },
  };

  const altTextCoverage: CoverageStats = {
    total: 89,
    covered: 82,
    percentage: 92.1,
  };

  const ariaLabelCoverage: CoverageStats = {
    total: 156,
    covered: 143,
    percentage: 91.7,
  };

  const conformingElements = 1180;
  const totalElements = 1245;
  const overallScore = Math.round((conformingElements / totalElements) * 100);

  return {
    overallScore,
    totalElements,
    conformingElements,
    violations,
    contrastStats,
    altTextCoverage,
    ariaLabelCoverage,
    nativeElementsCount: 12,
    wcagExceptionsCount: 8,
    lastScanDate: new Date(),
  };
};

export function useA11yStats() {
  const [stats, setStats] = useState<A11yStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate scan delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would call actual scanning scripts
      const newStats = generateMockStats();
      setStats(newStats);
      
      return newStats;
    } catch (err) {
      setError('Falha ao executar scan de acessibilidade');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const violationsByType = useMemo(() => {
    if (!stats) return {};
    
    return stats.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [stats]);

  const violationsBySeverity = useMemo(() => {
    if (!stats) return { error: 0, warning: 0, info: 0 };
    
    return stats.violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, { error: 0, warning: 0, info: 0 } as Record<string, number>);
  }, [stats]);

  const complianceData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { name: 'Conformes', value: stats.conformingElements, color: 'hsl(141, 70%, 45%)' },
      { name: 'Violações', value: stats.totalElements - stats.conformingElements, color: 'hsl(0, 70%, 50%)' },
    ];
  }, [stats]);

  const opacityChartData = useMemo(() => {
    if (!stats) return [];
    
    return Object.entries(stats.contrastStats.opacityDistribution)
      .map(([opacity, count]) => ({
        opacity,
        count,
        safe: parseInt(opacity.replace('/', '')) >= 80,
      }))
      .sort((a, b) => parseInt(b.opacity.replace('/', '')) - parseInt(a.opacity.replace('/', '')));
  }, [stats]);

  const coverageChartData = useMemo(() => {
    if (!stats) return [];
    
    return [
      { 
        name: 'Alt Text', 
        covered: stats.altTextCoverage.covered, 
        missing: stats.altTextCoverage.total - stats.altTextCoverage.covered,
        percentage: stats.altTextCoverage.percentage,
      },
      { 
        name: 'Aria Labels', 
        covered: stats.ariaLabelCoverage.covered, 
        missing: stats.ariaLabelCoverage.total - stats.ariaLabelCoverage.covered,
        percentage: stats.ariaLabelCoverage.percentage,
      },
    ];
  }, [stats]);

  useEffect(() => {
    // Run initial scan on mount
    runScan();
  }, [runScan]);

  return {
    stats,
    isLoading,
    error,
    runScan,
    violationsByType,
    violationsBySeverity,
    complianceData,
    opacityChartData,
    coverageChartData,
  };
}
