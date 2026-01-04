import { useState } from 'react';
import { Download, Copy, FileImage, FileCode, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LogoDownloadProps {
  showPreview?: boolean;
  compact?: boolean;
  className?: string;
}

const LOGO_SVG_PATH = '/logo/tsijukebox-logo.svg';

export function LogoDownload({ 
  showPreview = true, 
  compact = false,
  className 
}: LogoDownloadProps) {
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Download SVG directly
  const downloadSVG = async () => {
    try {
      const response = await fetch(LOGO_SVG_PATH);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      
      const svgText = await response.text();
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tsijukebox-logo.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Logo SVG baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading SVG:', error);
      toast.error('Erro ao baixar SVG');
    }
  };

  // Convert SVG to PNG and download
  const downloadPNG = async (size: number) => {
    setIsConverting(true);
    try {
      const response = await fetch(LOGO_SVG_PATH);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      
      const svgText = await response.text();
      
      // Calculate height maintaining aspect ratio (400x120 original)
      const aspectRatio = 120 / 400;
      const width = size;
      const height = Math.round(size * aspectRatio);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Create image from SVG
      const img = new Image();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load SVG'));
        img.src = url;
      });
      
      URL.revokeObjectURL(url);
      
      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Erro ao converter para PNG');
          return;
        }
        
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `tsijukebox-logo-${size}px.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
        
        toast.success(`Logo PNG (${size}px) baixado com sucesso!`);
      }, 'image/png');
      
    } catch (error) {
      console.error('Error converting to PNG:', error);
      toast.error('Erro ao converter para PNG');
    } finally {
      setIsConverting(false);
    }
  };

  // Copy SVG to clipboard
  const copySVG = async () => {
    try {
      const response = await fetch(LOGO_SVG_PATH);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      
      const svgText = await response.text();
      await navigator.clipboard.writeText(svgText);
      
      setCopiedSvg(true);
      toast.success('SVG copiado para a área de transferência!');
      
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch (error) {
      console.error('Error copying SVG:', error);
      toast.error('Erro ao copiar SVG');
    }
  };

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadSVG}
          className="gap-2"
        >
          <FileCode className="w-4 h-4" />
          SVG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadPNG(512)}
          disabled={isConverting}
          className="gap-2"
        >
          <FileImage className="w-4 h-4" />
          PNG 512px
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadPNG(1024)}
          disabled={isConverting}
          className="gap-2"
        >
          <FileImage className="w-4 h-4" />
          PNG 1024px
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copySVG}
          className="gap-2"
        >
          {copiedSvg ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          Copiar
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn("bg-kiosk-card border-kiosk-border", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-kiosk-text flex items-center gap-2">
              <Download className="w-5 h-5 icon-neon-blue" />
              Download da Logo
            </CardTitle>
            <CardDescription className="text-description-visible mt-1">
              Baixe a logo do TSiJUKEBOX em formato vetorial ou raster
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-kiosk-primary/50 text-kiosk-primary">
            Oficial
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preview */}
        {showPreview && (
          <div className="p-6 rounded-lg bg-[#0a0a14] border border-kiosk-border flex items-center justify-center">
            <LogoBrand size="lg" variant="metal" animate={false} />
          </div>
        )}
        
        {/* Download Options */}
        <div className="grid grid-cols-2 gap-3">
          {/* SVG Download */}
          <Button
            variant="kiosk-outline"
            onClick={downloadSVG}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <FileCode className="w-6 h-6 icon-neon-blue" />
            <span className="font-medium">Download SVG</span>
            <span className="text-xs text-description-visible">Vetorial (escalável)</span>
          </Button>
          
          {/* Copy SVG */}
          <Button
            variant="kiosk-outline"
            onClick={copySVG}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            {copiedSvg ? (
              <Check className="w-6 h-6 text-green-500" />
            ) : (
              <Copy className="w-6 h-6 icon-neon-blue" />
            )}
            <span className="font-medium">{copiedSvg ? 'Copiado!' : 'Copiar SVG'}</span>
            <span className="text-xs text-description-visible">Área de transferência</span>
          </Button>
        </div>
        
        {/* PNG Downloads */}
        <div className="space-y-2">
          <p className="text-sm text-description-visible font-medium">Formato PNG (raster)</p>
          <div className="grid grid-cols-3 gap-2">
            {[256, 512, 1024].map((size) => (
              <Button
                key={size}
                variant="outline"
                size="sm"
                onClick={() => downloadPNG(size)}
                disabled={isConverting}
                className="gap-2"
              >
                <FileImage className="w-4 h-4" />
                {size}px
              </Button>
            ))}
          </div>
        </div>
        
        {/* Info */}
        <div className="text-xs text-description-visible space-y-1 pt-2 border-t border-kiosk-border">
          <p>• SVG: Ideal para web e escalabilidade infinita</p>
          <p>• PNG: Ideal para documentos e redes sociais</p>
          <p>• Proporção original: 400 × 120 pixels</p>
        </div>
      </CardContent>
    </Card>
  );
}
