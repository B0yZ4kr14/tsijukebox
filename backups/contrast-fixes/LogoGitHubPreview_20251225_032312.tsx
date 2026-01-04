import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogoGitHub } from '@/components/ui/LogoGitHub';
import { Download, Copy, Check, Eye, Moon, Sun, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';
type Background = 'dark' | 'light' | 'transparent';

const sizes: LogoSize[] = ['sm', 'md', 'lg', 'xl'];
const backgrounds: Background[] = ['dark', 'light', 'transparent'];

export default function LogoGitHubPreview() {
  const [selectedSize, setSelectedSize] = useState<LogoSize>('md');
  const [selectedBg, setSelectedBg] = useState<Background>('dark');
  const [copied, setCopied] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  const bgStyles = {
    dark: 'bg-zinc-950',
    light: 'bg-white',
    transparent: 'bg-[url("data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Crect%20fill%3D%22%23333%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3Crect%20fill%3D%22%23444%22%20x%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3Crect%20fill%3D%22%23444%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3Crect%20fill%3D%22%23333%22%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23grid)%22%20width%3D%22100%25%22%20height%3D%22100%25%22%2F%3E%3C%2Fsvg%3E")]',
  };

  const handleExportPNG = async () => {
    if (!logoRef.current) return;
    
    try {
      // Dynamic import of html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(logoRef.current, {
        backgroundColor: selectedBg === 'transparent' ? null : (selectedBg === 'dark' ? '#09090b' : '#ffffff'),
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `tsijukebox-logo-${selectedSize}-${selectedBg}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Logo exportado como PNG!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar logo');
    }
  };

  const handleCopyCode = () => {
    const code = `<LogoGitHub size="${selectedSize}" showTagline={true} showEnterprise={true} />`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-kiosk-bg p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Logo GitHub Preview</h1>
            <p className="text-muted-foreground">Visualize e exporte o logo do TSiJUKEBOX para GitHub</p>
          </div>
        </motion.div>

        {/* Main Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview Principal
              </h3>
            
            <div className="mt-4">
              {/* Background selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Fundo:</span>
                <div className="flex gap-2">
                  {backgrounds.map((bg) => (
                    <Button
                      key={bg}
                      variant={selectedBg === bg ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedBg(bg)}
                      className="gap-2"
                    >
                      {bg === 'dark' && <Moon className="w-4 h-4" />}
                      {bg === 'light' && <Sun className="w-4 h-4" />}
                      {bg === 'transparent' && '🔲'}
                      {bg.charAt(0).toUpperCase() + bg.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Tamanho:</span>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Logo Preview */}
              <div
                className={cn(
                  "flex items-center justify-center min-h-[300px] rounded-xl border border-border/50 transition-all",
                  bgStyles[selectedBg]
                )}
              >
                <div ref={logoRef} className="p-4">
                  <LogoGitHub size={selectedSize} showTagline={true} showEnterprise={true} />
                </div>
              </div>

              {/* Export Actions */}
              <div className="flex gap-3">
                <Button onClick={handleExportPNG} className="gap-2 button-jam-silver-neon text-zinc-900">
                  <Download className="w-4 h-4" />
                  Exportar PNG
                </Button>
                <Button variant="outline" onClick={handleCopyCode} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar Código'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* All Sizes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Todos os Tamanhos</h3>
            
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sizes.map((size) => (
                  <div key={size} className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {size.toUpperCase()}
                    </span>
                    <div className="bg-zinc-950 rounded-lg p-4 flex items-center justify-center min-h-[150px]">
                      <LogoGitHub size={size} showTagline={size !== 'sm'} showEnterprise={size !== 'sm'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Usage Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Como Usar</h3>
            
            <div className="mt-4">
              <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { LogoGitHub } from '@/components/ui/LogoGitHub';
import { Button, Card } from "@/components/ui/themed"

// Uso básico
<LogoGitHub />

// Com props customizadas
<LogoGitHub 
  size="lg"           // sm | md | lg | xl
  showTagline={true}  // Enterprise Kiosk Music System
  showEnterprise={true} // TSiJUKEBOX Enterprise
/>`}
              </pre>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
