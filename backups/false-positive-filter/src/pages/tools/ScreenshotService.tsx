import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Camera, Download, CheckCircle2, XCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { useScreenshotCapture } from '@/hooks/useScreenshotCapture';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button, Card } from "@/components/ui/themed"

// Páginas principais para captura
const PAGES_TO_CAPTURE = [
  { path: '/', name: 'home', label: 'Página Inicial (Player)' },
  { path: '/setup', name: 'setup-wizard', label: 'Setup Wizard' },
  { path: '/brand', name: 'brand-guidelines', label: 'Brand Guidelines' },
  { path: '/dashboard', name: 'dashboard', label: 'Dashboard' },
  { path: '/spotify', name: 'spotify-browser', label: 'Spotify Browser' },
  { path: '/showcase', name: 'components-showcase', label: 'Components Showcase' },
  { path: '/health', name: 'health-dashboard', label: 'Health Dashboard' },
  { path: '/admin', name: 'admin-panel', label: 'Admin Panel' },
];

interface CaptureStatus {
  page: string;
  status: 'pending' | 'capturing' | 'success' | 'error';
  url?: string;
  error?: string;
}

export default function ScreenshotService() {
  const navigate = useNavigate();
  const { downloadScreenshot, isCapturing } = useScreenshotCapture();
  const [captureStatuses, setCaptureStatuses] = useState<CaptureStatus[]>(
    PAGES_TO_CAPTURE.map(p => ({ page: p.name, status: 'pending' }))
  );
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  const progress = captureStatuses.filter(s => s.status !== 'pending').length / PAGES_TO_CAPTURE.length * 100;

  const captureCurrentPage = useCallback(async () => {
    const result = await downloadScreenshot(
      document.querySelector('#root') as HTMLElement,
      'current-page',
      { scale: 1, backgroundColor: '#0a0a0f' }
    );

    if (result.success) {
      toast.success('Screenshot salvo!', {
        description: `Arquivo: ${result.filename}`,
      });
    } else {
      toast.error('Erro ao capturar', {
        description: result.error,
      });
    }
  }, [downloadScreenshot]);

  const startBatchCapture = useCallback(async () => {
    setIsRunning(true);
    
    toast.info('Iniciando captura em lote', {
      description: 'Navegue manualmente para cada página e clique em "Capturar Esta Página"',
    });

    // Reset statuses
    setCaptureStatuses(PAGES_TO_CAPTURE.map(p => ({ page: p.name, status: 'pending' })));
    setCurrentIndex(0);
  }, []);

  const captureAndAdvance = useCallback(async () => {
    if (currentIndex < 0 || currentIndex >= PAGES_TO_CAPTURE.length) return;

    const current = PAGES_TO_CAPTURE[currentIndex];
    
    // Update status to capturing
    setCaptureStatuses(prev => prev.map((s, i) => 
      i === currentIndex ? { ...s, status: 'capturing' } : s
    ));

    const result = await downloadScreenshot(
      document.querySelector('#root') as HTMLElement,
      current.name,
      { scale: 1, backgroundColor: '#0a0a0f' }
    );

    // Update status
    setCaptureStatuses(prev => prev.map((s, i) => 
      i === currentIndex 
        ? { 
            ...s, 
            status: result.success ? 'success' : 'error',
            url: result.url,
            error: result.error,
          } 
        : s
    ));

    if (result.success) {
      toast.success(`Capturado: ${current.label}`);
    } else {
      toast.error(`Erro: ${current.label}`, { description: result.error });
    }

    // Advance to next
    if (currentIndex < PAGES_TO_CAPTURE.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const next = PAGES_TO_CAPTURE[currentIndex + 1];
      toast.info('Próxima página', {
        description: `Navegue para: ${next.label} (${next.path})`,
      });
    } else {
      setIsRunning(false);
      toast.success('Captura em lote concluída!', {
        description: 'Todos os screenshots foram salvos na pasta de downloads.',
      });
    }
  }, [currentIndex, downloadScreenshot]);

  const getStatusIcon = (status: CaptureStatus['status']) => {
    switch (status) {
      case 'pending': return <div className="w-4 h-4 rounded-full bg-muted" />;
      case 'capturing': return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <KioskLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gold-neon flex items-center gap-3">
              <Camera className="w-8 h-8" />
              Screenshot Service
            </h1>
            <p className="text-muted-foreground mt-1">
              Capture screenshots das páginas principais para documentação
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>

        {/* Quick Capture */}
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <ImageIcon className="w-5 h-5" />
              Captura Rápida
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Capture um screenshot da página atual
            </p>
          
          <div className="mt-4">
            <Button 
              onClick={captureCurrentPage} 
              disabled={isCapturing}
              className="gap-2"
            >
              {isCapturing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Capturar Esta Página
            </Button>
          </div>
        </Card>

        {/* Batch Capture */}
        <Card>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              <Download className="w-5 h-5" />
              Captura em Lote
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              Capture screenshots de todas as páginas principais
            </p>
          
          <div className="mt-4">
            {/* Progress */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Page List */}
            <div className="space-y-2">
              {PAGES_TO_CAPTURE.map((page, index) => (
                <div 
                  key={page.path}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    currentIndex === index ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(captureStatuses[index].status)}
                    <div>
                      <div className="font-medium">{page.label}</div>
                      <div className="text-sm text-muted-foreground">{page.path}</div>
                    </div>
                  </div>
                  {currentIndex === index && isRunning && (
                    <Button size="sm" onClick={captureAndAdvance} disabled={isCapturing}>
                      {isCapturing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Capturar'
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {!isRunning ? (
                <Button onClick={startBatchCapture} className="gap-2">
                  <Camera className="w-4 h-4" />
                  Iniciar Captura em Lote
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setIsRunning(false)}>
                  Cancelar
                </Button>
              )}
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
              <p className="font-medium">📋 Instruções:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Clique em "Iniciar Captura em Lote"</li>
                <li>Navegue para cada página indicada</li>
                <li>Clique em "Capturar" para salvar o screenshot</li>
                <li>Repita até concluir todas as páginas</li>
                <li>Os arquivos serão salvos na pasta de downloads</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </KioskLayout>
  );
}
