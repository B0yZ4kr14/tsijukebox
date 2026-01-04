import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Eye, EyeOff, MapPin, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SettingsSection } from './SettingsSection';
import { useSettings } from '@/contexts/SettingsContext';
import { useWeather, useTranslation } from '@/hooks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge, Button, Input, Toggle } from "@/components/ui/themed"

/**
 * WeatherConfigSection Component
 * 
 * Configuration panel for OpenWeatherMap integration.
 * Integrated with TSiJUKEBOX Design System tokens.
 */
export function WeatherConfigSection() {
  const { t } = useTranslation();
  const { weather, setWeatherConfig } = useSettings();
  const [localApiKey, setLocalApiKey] = useState(weather.apiKey);
  const [localCity, setLocalCity] = useState(weather.city || 'Montes Claros, MG');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const { weather: testWeather, isLoading, error, refresh } = useWeather({
    city: weather.city,
    apiKey: weather.apiKey,
  });

  const hasChanges = localApiKey !== weather.apiKey || localCity !== weather.city;

  const handleSave = () => {
    if (!localApiKey.trim()) {
      toast.error(t('weatherConfig.apiKeyRequired'));
      return;
    }
    if (!localCity.trim()) {
      toast.error(t('weatherConfig.cityRequired'));
      return;
    }

    setWeatherConfig({
      apiKey: localApiKey.trim(),
      city: localCity.trim(),
      isEnabled: true,
    });
    toast.success(t('weatherConfig.configSaved'));
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(localCity)}&appid=${localApiKey}&units=metric`
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error(t('weatherConfig.invalidApiKey'));
        } else if (response.status === 404) {
          toast.error(t('weatherConfig.cityNotFound'));
        } else {
          toast.error(t('weatherConfig.connectionError'));
        }
        return;
      }

      const data = await response.json();
      toast.success(t('weatherConfig.testSuccess').replace('{city}', data.name).replace('{temp}', Math.round(data.main.temp).toString()));
    } catch (err) {
      toast.error(t('weatherConfig.testError'));
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggle = (enabled: boolean) => {
    setWeatherConfig({
      ...weather,
      isEnabled: enabled,
    });
    toast.success(enabled ? t('weatherConfig.widgetEnabled') : t('weatherConfig.widgetDisabled'));
  };

  const instructions = {
    title: "🌤️ Como funciona o Widget de Clima?",
    steps: [
      "O widget mostra a temperatura e condições do tempo na sua cidade em tempo real.",
      "Ele usa o serviço OpenWeatherMap, que é gratuito para uso básico (1000 consultas/dia).",
      "Você precisa criar uma conta gratuita e obter uma 'chave de API' (é como uma senha de acesso).",
      "A cidade pode ser digitada como 'São Paulo, BR' ou 'Montes Claros, MG, Brazil'."
    ],
    tips: [
      "💡 O widget atualiza automaticamente a cada 30 minutos",
      "💡 Use o botão 'Testar' para verificar se está funcionando",
      "💡 Se der erro 401, a chave de API está incorreta"
    ],
    warning: "⚠️ A chave de API é pessoal - não compartilhe com ninguém!"
  };

  return (
    <SettingsSection
      icon={<Cloud className="w-5 h-5 text-accent-cyan drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />}
      title={t('weatherConfig.title')}
      description={t('weatherConfig.description')}
      instructions={instructions}
      badge={
        weather.isEnabled && testWeather ? (
          <Badge variant="primary" size="sm" className="ml-2">
            <Check aria-hidden="true" className="w-3 h-3 mr-1" />
            {testWeather.temperature}°C
          </Badge>
        ) : null
      }
      delay={0.15}
    >
      <div className="space-y-4">
        {/* Enable Toggle */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg",
          "bg-bg-tertiary/50 backdrop-blur-sm border border-[#333333]",
          "transition-all duration-normal"
        )}>
          <div className="space-y-0.5 flex-1">
            <Label className="text-brand-gold font-medium">{t('weatherConfig.enableWidget')}</Label>
            <p className="text-xs text-text-tertiary">
              {t('weatherConfig.enableHint')}
            </p>
          </div>
          <Switch
            checked={weather.isEnabled}
            onCheckedChange={handleToggle}
            aria-label="Habilitar widget de clima"
          />
        </div>

        {/* Current Weather Preview */}
        {weather.isEnabled && testWeather && (
          <motion.div
            className={cn(
              "p-4 rounded-lg",
              "bg-accent-cyan/10 backdrop-blur-sm border border-accent-cyan/30",
              "shadow-glow-cyan"
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{testWeather.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-text-primary">
                    {testWeather.temperature}°C
                  </span>
                  <span className="text-text-secondary">{testWeather.condition}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-text-tertiary">
                  <MapPin className="w-3 h-3" />
                  <span>{testWeather.location}, {testWeather.region}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={refresh}
                disabled={isLoading}
                className="text-text-secondary hover:text-accent-cyan" aria-label="Atualizar">
                <RefreshCw className={cn(
                  "w-4 h-4 transition-transform duration-normal",
                  isLoading && "animate-spin"
                )} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <div className={cn(
            "p-3 rounded-lg flex items-center gap-2",
            "bg-state-error/10 border border-state-error/30"
          )}>
            <AlertCircle className="w-4 h-4 text-state-error shrink-0" />
            <span role="alert" className="text-sm text-state-error">{error}</span>
          </div>
        )}

        {/* API Key Field */}
        <div className="space-y-2">
          <Label htmlFor="weatherApiKey" className="text-brand-gold">{t('weatherConfig.apiKey')}</Label>
          <div className="relative">
            <Input
              id="weatherApiKey"
              type={showApiKey ? 'text' : 'password'}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder={t('weatherConfig.apiKeyPlaceholder')}
              variant="primary"
              className="font-mono text-sm pr-10"
              data-tour="weather-api-key"
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="absolute right-0 top-0 h-full px-3 text-text-secondary hover:text-accent-cyan"
              onClick={() => setShowApiKey(!showApiKey)}
              aria-label={showApiKey ? 'Ocultar chave de API' : 'Mostrar chave de API'}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* City Field */}
        <div className="space-y-2">
          <Label htmlFor="weatherCity" className="text-brand-gold">{t('weatherConfig.city')}</Label>
          <Input
            id="weatherCity"
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            placeholder={t('weatherConfig.cityPlaceholder')}
            variant="primary"
            data-tour="weather-city"
          />
          <p className="text-xs text-text-tertiary">
            {t('weatherConfig.cityHint')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              onClick={handleSave}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              {t('weatherConfig.saveConfig')}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={handleTest}
            disabled={isTesting || !localApiKey || !localCity}
            className={cn(!hasChanges && "flex-1")}
          >
            {isTesting ? (
              <>
                <RefreshCw aria-hidden="true" className="w-4 h-4 mr-2 animate-spin" />
                {t('weatherConfig.testing')}
              </>
            ) : (
              t('weatherConfig.testConnection')
            )}
          </Button>
        </div>

        {/* Help Info */}
        <div className={cn(
          "p-4 rounded-lg",
          "bg-bg-tertiary/50 backdrop-blur-sm border border-[#333333]"
        )}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-accent-cyan mt-0.5 shrink-0 drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]" />
            <div className="text-xs text-text-tertiary space-y-2">
              <p className="text-brand-gold font-medium">{t('weatherConfig.helpTitle')}</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>
                  {t('weatherConfig.helpStep1')}{' '}
                  <a 
                    href="https://openweathermap.org/api" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent-cyan hover:underline inline-flex items-center gap-1 transition-colors duration-normal"
                  >
                    OpenWeatherMap <ExternalLink aria-hidden="true" className="w-3 h-3" />
                  </a>
                </li>
                <li>{t('weatherConfig.helpStep2')}</li>
                <li>{t('weatherConfig.helpStep3')}</li>
                <li>{t('weatherConfig.helpStep4')}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
