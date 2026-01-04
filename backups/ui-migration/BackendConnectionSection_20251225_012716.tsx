import { useState } from 'react';
import { Server, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { SettingsSection } from './SettingsSection';

interface BackendConnectionSectionProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  useWebSocket: boolean;
  setUseWebSocket: (value: boolean) => void;
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  isDemoMode: boolean;
}

export function BackendConnectionSection({
  apiUrl,
  setApiUrl,
  useWebSocket,
  setUseWebSocket,
  pollingInterval,
  setPollingInterval,
  isDemoMode,
}: BackendConnectionSectionProps) {
  const [localApiUrl, setLocalApiUrl] = useState(apiUrl);

  const handleSaveApiUrl = () => {
    setApiUrl(localApiUrl);
    toast.success('URL da API salva');
  };

  const handleWebSocketToggle = (checked: boolean) => {
    setUseWebSocket(checked);
    toast.success(checked ? 'WebSocket ativado' : 'Polling ativado');
  };

  return (
    <SettingsSection
      icon={<Server className="w-5 h-5 text-kiosk-primary" />}
      title="Backend FastAPI"
      description="Configure a conexão com o servidor de reprodução local"
      delay={0.15}
      instructions={{
        title: "🖥️ O que é o Backend FastAPI?",
        steps: [
          "O backend é o 'cérebro' do sistema que controla a reprodução de música.",
          "Ele roda em um servidor local e se comunica com o Spotify via playerctl.",
          "A URL da API define onde o frontend deve buscar as informações.",
          "WebSocket permite atualizações em tempo real, polling é o método alternativo."
        ],
        tips: [
          "💡 Em produção, use a URL https://midiaserver.local/api",
          "💡 WebSocket é mais rápido que polling para atualizações",
          "💡 Ative o modo demo para testar sem o backend"
        ]
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiUrl" className="text-label-yellow font-semibold">URL da API</Label>
          <div className="flex gap-2">
            <Input
              id="apiUrl"
              value={localApiUrl}
              onChange={(e) => setLocalApiUrl(e.target.value)}
              placeholder="https://midiaserver.local/api"
              className="bg-kiosk-background border-kiosk-border text-kiosk-text"
              disabled={isDemoMode}
              data-tour="backend-url"
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
            <p className="text-xs text-settings-hint">
              Desative o modo demo para alterar a URL
            </p>
          )}
        </div>

        <Separator className="bg-kiosk-border" />

        {/* WebSocket Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-label-yellow font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 icon-neon-blue" />
              WebSocket
            </Label>
            <p className="text-xs text-settings-hint">
              Atualizações em tempo real via WebSocket
            </p>
          </div>
          <Switch
            checked={useWebSocket}
            onCheckedChange={handleWebSocketToggle}
            disabled={isDemoMode}
            className="data-[state=checked]:bg-kiosk-primary"
            data-tour="websocket-toggle"
            aria-label="Ativar conexão WebSocket"
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
            <Label className="text-label-yellow font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 icon-neon-blue" />
              Intervalo de Polling
            </Label>
            <span className="text-sm text-neon-white">
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
              aria-label="Intervalo de polling em milissegundos"
            />
            <p className="text-xs text-settings-hint">
              Menor intervalo = mais responsivo, maior uso de rede
            </p>
          </motion.div>
        )}
      </div>
    </SettingsSection>
  );
}
