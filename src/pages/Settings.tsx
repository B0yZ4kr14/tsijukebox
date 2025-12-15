import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Wifi, Clock, Server, TestTube, Zap } from 'lucide-react';
import { KioskLayout } from '@/components/layout/KioskLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

export default function Settings() {
  const {
    isDemoMode,
    setDemoMode,
    apiUrl,
    setApiUrl,
    useWebSocket,
    setUseWebSocket,
    pollingInterval,
    setPollingInterval,
  } = useSettings();

  const [localApiUrl, setLocalApiUrl] = useState(apiUrl);

  const handleSaveApiUrl = () => {
    setApiUrl(localApiUrl);
    toast.success('URL da API salva');
  };

  const handleDemoModeToggle = (checked: boolean) => {
    setDemoMode(checked);
    toast.success(checked ? 'Modo demo ativado' : 'Modo demo desativado');
  };

  const handleWebSocketToggle = (checked: boolean) => {
    setUseWebSocket(checked);
    toast.success(checked ? 'WebSocket ativado' : 'Polling ativado');
  };

  return (
    <KioskLayout>
      <motion.div
        className="min-h-screen bg-kiosk-background p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.header
          className="flex items-center gap-4 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Link to="/">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-kiosk-surface hover:bg-kiosk-surface/80"
            >
              <ArrowLeft className="w-6 h-6 text-kiosk-text" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-kiosk-text">Configurações</h1>
            <p className="text-kiosk-text/60 text-sm">Ajustes do sistema TSi JUKEBOX</p>
          </div>
        </motion.header>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Demo Mode */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-kiosk-surface border-kiosk-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-kiosk-text">
                  <TestTube className="w-5 h-5 text-kiosk-primary" />
                  Modo Demonstração
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Ativa dados simulados para testar a interface sem o backend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-kiosk-text">Demo Mode</Label>
                    <p className="text-xs text-kiosk-text/50">
                      {isDemoMode ? 'Usando dados mockados' : 'Conectando ao backend real'}
                    </p>
                  </div>
                  <Switch
                    checked={isDemoMode}
                    onCheckedChange={handleDemoModeToggle}
                    className="data-[state=checked]:bg-kiosk-primary"
                  />
                </div>

                {isDemoMode && (
                  <motion.div
                    className="mt-4 p-3 rounded-lg bg-kiosk-primary/10 border border-kiosk-primary/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-sm text-kiosk-primary">
                      ✓ Modo demo ativo - todas as animações e gestos funcionam com dados simulados
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Connection Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-kiosk-surface border-kiosk-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-kiosk-text">
                  <Server className="w-5 h-5 text-kiosk-primary" />
                  Conexão com Backend
                </CardTitle>
                <CardDescription className="text-kiosk-text/60">
                  Configure a URL da API FastAPI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiUrl" className="text-kiosk-text">URL da API</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiUrl"
                      value={localApiUrl}
                      onChange={(e) => setLocalApiUrl(e.target.value)}
                      placeholder="https://midiaserver.local/api"
                      className="bg-kiosk-background border-kiosk-border text-kiosk-text"
                      disabled={isDemoMode}
                    />
                    <Button
                      onClick={handleSaveApiUrl}
                      disabled={isDemoMode || localApiUrl === apiUrl}
                      className="bg-kiosk-primary hover:bg-kiosk-primary/90"
                    >
                      Salvar
                    </Button>
                  </div>
                  {isDemoMode && (
                    <p className="text-xs text-kiosk-text/50">
                      Desative o modo demo para alterar a URL
                    </p>
                  )}
                </div>

                <Separator className="bg-kiosk-border" />

                {/* WebSocket Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-kiosk-text flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      WebSocket
                    </Label>
                    <p className="text-xs text-kiosk-text/50">
                      Atualizações em tempo real via WebSocket
                    </p>
                  </div>
                  <Switch
                    checked={useWebSocket}
                    onCheckedChange={handleWebSocketToggle}
                    disabled={isDemoMode}
                    className="data-[state=checked]:bg-kiosk-primary"
                  />
                </div>

                {/* Polling Interval */}
                {!useWebSocket && !isDemoMode && (
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-kiosk-text flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Intervalo de Polling
                      </Label>
                      <span className="text-sm text-kiosk-text/70">
                        {pollingInterval / 1000}s
                      </span>
                    </div>
                    <Slider
                      value={[pollingInterval]}
                      onValueChange={([value]) => setPollingInterval(value)}
                      min={500}
                      max={5000}
                      step={500}
                      className="w-full"
                    />
                    <p className="text-xs text-kiosk-text/50">
                      Menor intervalo = mais responsivo, maior uso de rede
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-kiosk-surface border-kiosk-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-kiosk-text">
                  <Monitor className="w-5 h-5 text-kiosk-primary" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Versão</span>
                  <span className="text-kiosk-text">TSi JUKEBOX Enterprise v4.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Modo</span>
                  <span className="text-kiosk-text">
                    {isDemoMode ? 'Demonstração' : 'Produção'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">Conexão</span>
                  <span className="text-kiosk-text">
                    {isDemoMode ? 'N/A' : useWebSocket ? 'WebSocket' : `Polling (${pollingInterval / 1000}s)`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kiosk-text/60">API</span>
                  <span className="text-kiosk-text font-mono text-xs truncate max-w-[200px]">
                    {isDemoMode ? 'Mock Data' : apiUrl}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="flex gap-3 justify-center pt-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem('tsi_jukebox_settings');
                window.location.reload();
              }}
              className="border-kiosk-border text-kiosk-text hover:bg-kiosk-surface"
            >
              Restaurar Padrões
            </Button>
            <Link to="/">
              <Button className="bg-kiosk-primary hover:bg-kiosk-primary/90">
                Voltar ao Player
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </KioskLayout>
  );
}
