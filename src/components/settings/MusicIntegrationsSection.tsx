import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Radio, ExternalLink, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SettingsSection } from './SettingsSection';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

type MusicProvider = 'spotify' | 'youtube-music' | 'spicetify' | 'local';

interface ProviderConfig {
  id: MusicProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isConnected: boolean;
  configPath: string;
}

export function MusicIntegrationsSection() {
  const navigate = useNavigate();
  const { spotify, youtubeMusic, spicetify } = useSettings();
  
  const [defaultProvider, setDefaultProvider] = useState<MusicProvider>('spotify');
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [fallbackProvider, setFallbackProvider] = useState<MusicProvider>('local');

  const providers: ProviderConfig[] = [
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Streaming via Spotify Web API + playerctl',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      ),
      color: '#1DB954',
      isConnected: spotify.isConnected,
      configPath: '/settings?section=integrations',
    },
    {
      id: 'youtube-music',
      name: 'YouTube Music',
      description: 'Streaming via YouTube Music API',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
      ),
      color: '#FF0000',
      isConnected: youtubeMusic.isConnected,
      configPath: '/settings?section=integrations',
    },
    {
      id: 'spicetify',
      name: 'Spicetify',
      description: 'Controle local do Spotify desktop via Spicetify',
      icon: <Radio className="w-6 h-6" />,
      color: '#1ED760',
      isConnected: spicetify.isInstalled || false,
      configPath: '/settings?section=integrations',
    },
    {
      id: 'local',
      name: 'Biblioteca Local',
      description: 'Arquivos de áudio armazenados localmente',
      icon: <Music className="w-6 h-6" />,
      color: '#6366F1',
      isConnected: true, // Local is always "available"
      configPath: '/admin/library',
    },
  ];

  const getProviderById = (id: MusicProvider) => providers.find(p => p.id === id);

  return (
    <SettingsSection
      icon={<Music className="w-5 h-5 text-kiosk-primary" />}
      title="Integrações de Música"
      description="Gerencie provedores de streaming e playback"
    >
      <div className="space-y-6">
        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all border-2",
                  provider.isConnected
                    ? "border-opacity-50 bg-opacity-10"
                    : "border-kiosk-border bg-kiosk-surface/50 opacity-70"
                )}
                style={{
                  borderColor: provider.isConnected ? provider.color : undefined,
                  backgroundColor: provider.isConnected ? `${provider.color}10` : undefined,
                }}
                onClick={() => navigate(provider.configPath)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${provider.color}20`, color: provider.color }}
                    >
                      {provider.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-kiosk-text">{provider.name}</h3>
                        {provider.isConnected && (
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: provider.color, color: provider.color }}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Conectado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-kiosk-text/60">{provider.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-kiosk-text/30" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Default Provider Selection */}
        <div className="space-y-3 p-4 rounded-lg bg-kiosk-surface/50 border border-kiosk-border">
          <Label className="text-label-yellow">Provedor Padrão</Label>
          <p className="text-sm text-kiosk-text/60 mb-3">
            Selecione o provedor principal para reprodução de música
          </p>
          <RadioGroup
            value={defaultProvider}
            onValueChange={(value) => setDefaultProvider(value as MusicProvider)}
            className="grid grid-cols-2 gap-3"
          >
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={provider.id}
                  id={`provider-${provider.id}`}
                  disabled={!provider.isConnected && provider.id !== 'local'}
                  className="border-kiosk-border"
                />
                <Label
                  htmlFor={`provider-${provider.id}`}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    !provider.isConnected && provider.id !== 'local' && "opacity-50"
                  )}
                >
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: provider.color }}
                  />
                  {provider.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Fallback Configuration */}
        <div className="space-y-4 p-4 rounded-lg bg-kiosk-surface/50 border border-kiosk-border">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-label-yellow">Fallback Automático</Label>
              <p className="text-sm text-kiosk-text/60">
                Muda automaticamente para outro provedor se o principal falhar
              </p>
            </div>
            <Switch
              checked={fallbackEnabled}
              onCheckedChange={setFallbackEnabled}
              className="data-[state=checked]:bg-kiosk-primary"
            />
          </div>

          {fallbackEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label className="text-kiosk-text/80">Provedor de Fallback</Label>
              <Select value={fallbackProvider} onValueChange={(v) => setFallbackProvider(v as MusicProvider)}>
                <SelectTrigger className="bg-kiosk-background border-kiosk-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-kiosk-surface border-kiosk-border">
                  {providers
                    .filter(p => p.id !== defaultProvider)
                    .map((provider) => (
                      <SelectItem
                        key={provider.id}
                        value={provider.id}
                        disabled={!provider.isConnected && provider.id !== 'local'}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: provider.color }}
                          />
                          {provider.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-kiosk-primary/10 border border-kiosk-primary/20">
          <AlertCircle className="w-5 h-5 text-kiosk-primary mt-0.5 flex-shrink-0" />
          <div className="text-sm text-kiosk-text/80">
            <p className="font-medium text-kiosk-primary mb-1">Dica</p>
            <p>
              Configure cada provedor individualmente clicando nos cards acima. 
              O provedor padrão será usado para playback principal.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/spotify')}
            className="gap-2"
            style={{ borderColor: '#1DB954', color: '#1DB954' }}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Spotify Browser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/youtube-music')}
            className="gap-2"
            style={{ borderColor: '#FF0000', color: '#FF0000' }}
          >
            <ExternalLink className="w-4 h-4" />
            Abrir YouTube Music
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
