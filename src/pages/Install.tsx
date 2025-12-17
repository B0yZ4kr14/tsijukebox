import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogoBrand } from '@/components/ui/LogoBrand';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  ArrowLeft,
  Share,
  MoreVertical,
  PlusSquare
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const steps = isIOS ? [
    { icon: Share, text: 'Toque no botão Compartilhar na barra do navegador' },
    { icon: PlusSquare, text: 'Role e toque em "Adicionar à Tela de Início"' },
    { icon: CheckCircle2, text: 'Toque em "Adicionar" para confirmar' },
  ] : [
    { icon: MoreVertical, text: 'Toque no menu do navegador (3 pontos)' },
    { icon: Download, text: 'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"' },
    { icon: CheckCircle2, text: 'Confirme a instalação' },
  ];

  return (
    <KioskLayout>
      <motion.div 
        className="min-h-screen flex flex-col p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-kiosk-text/70 hover:text-kiosk-text">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <LogoBrand size="sm" variant="metal" centered={false} />
          <span className="text-xl font-bold text-gold-neon">Instalar</span>
        </motion.header>

        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-8">
          {/* App Icon */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-kiosk-primary/20 to-kiosk-accent/20 flex items-center justify-center shadow-2xl shadow-kiosk-primary/20">
              <img 
                src="/pwa-192x192.png" 
                alt="TSi JUKEBOX" 
                className="w-28 h-28 rounded-2xl"
              />
            </div>
            {isInstalled && (
              <motion.div
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                <CheckCircle2 className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Status */}
          {isInstalled ? (
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold text-green-400">
                App Instalado!
              </h2>
              <p className="text-kiosk-text/70">
                O app está instalado no seu dispositivo. 
                Você pode acessá-lo pela tela inicial.
              </p>
              <Link to="/">
                <Button className="mt-4 bg-kiosk-primary hover:bg-kiosk-primary/80">
                  Abrir Player
                </Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Install Button (Android/Desktop) */}
              {deferredPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    onClick={handleInstall}
                    size="lg"
                    className="bg-kiosk-primary hover:bg-kiosk-primary/80 text-lg px-8 py-6 h-auto gap-3"
                  >
                    <Download className="w-6 h-6" />
                    Instalar Agora
                  </Button>
                </motion.div>
              )}

              {/* Manual Instructions */}
              <motion.div
                className="w-full space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-medium text-kiosk-text text-center">
                  {deferredPrompt ? 'Ou instale manualmente:' : 'Como instalar:'}
                </h3>

                <Card className="bg-kiosk-surface/50 border-kiosk-surface">
                  <CardContent className="p-4 space-y-4">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-kiosk-primary/20 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-5 h-5 text-kiosk-primary" />
                        </div>
                        <p className="text-kiosk-text/80 text-sm">{step.text}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Benefits */}
              <motion.div
                className="w-full space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-sm font-medium text-kiosk-text/50 text-center uppercase tracking-wider">
                  Benefícios
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Monitor, text: 'Tela cheia' },
                    { icon: Smartphone, text: 'Acesso rápido' },
                    { icon: Download, text: 'Funciona offline' },
                    { icon: CheckCircle2, text: 'Sem navegador' },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg bg-kiosk-surface/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                    >
                      <benefit.icon className="w-4 h-4 text-kiosk-primary" />
                      <span className="text-sm text-kiosk-text/70">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* Footer */}
        <motion.footer
          className="text-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <LogoBrand size="sm" variant="metal" animate className="opacity-60" />
        </motion.footer>
      </motion.div>
    </KioskLayout>
  );
}
