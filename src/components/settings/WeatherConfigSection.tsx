import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Eye, EyeOff, MapPin, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { SettingsSection } from './SettingsSection';
import { useSettings } from '@/contexts/SettingsContext';
import { useWeather } from '@/hooks/useWeather';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

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

  return (
    <SettingsSection
      icon={<Cloud className="w-5 h-5 icon-neon-blue" />}
      title={t('weatherConfig.title')}
      description={t('weatherConfig.description')}
      badge={
        weather.isEnabled && testWeather ? (
          <Badge variant="outline" className="ml-2 border-cyan-400 text-cyan-400">
            <Check className="w-3 h-3 mr-1" />
            {testWeather.temperature}°C
          </Badge>
        ) : null
      }
      delay={0.15}
    >
      <div className="space-y-4">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-kiosk-bg/50 card-neon-border">
          <div className="space-y-0.5">
            <Label className="text-label-yellow">{t('weatherConfig.enableWidget')}</Label>
            <p className="text-xs text-settings-hint">
              {t('weatherConfig.enableHint')}
            </p>
          </div>
          <Switch
            checked={weather.isEnabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-cyan-500 switch-3d"
          />
        </div>

        {/* Current Weather Preview */}
        {weather.isEnabled && testWeather && (
          <motion.div
            className="p-4 rounded-lg bg-cyan-500/10 card-neon-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{testWeather.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-kiosk-text">
                    {testWeather.temperature}°C
                  </span>
                  <span className="text-kiosk-text/75">{testWeather.condition}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-kiosk-text/75">
                  <MapPin className="w-3 h-3" />
                  <span>{testWeather.location}, {testWeather.region}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refresh}
                disabled={isLoading}
                className="text-kiosk-text/50 hover:text-kiosk-text"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {/* API Key Field */}
        <div className="space-y-2">
          <Label htmlFor="weatherApiKey" className="text-label-yellow">{t('weatherConfig.apiKey')}</Label>
          <div className="relative">
            <Input
              id="weatherApiKey"
              type={showApiKey ? 'text' : 'password'}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder={t('weatherConfig.apiKeyPlaceholder')}
              className="input-3d bg-kiosk-bg border-kiosk-surface text-kiosk-text font-mono text-sm pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-kiosk-text/50 hover:text-kiosk-text"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* City Field */}
        <div className="space-y-2">
          <Label htmlFor="weatherCity" className="text-label-yellow">{t('weatherConfig.city')}</Label>
          <Input
            id="weatherCity"
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            placeholder={t('weatherConfig.cityPlaceholder')}
            className="input-3d bg-kiosk-bg border-kiosk-surface text-kiosk-text"
          />
          <p className="text-xs text-settings-hint">
            {t('weatherConfig.cityHint')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {hasChanges && (
            <Button
              onClick={handleSave}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white button-primary-3d"
            >
              {t('weatherConfig.saveConfig')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={isTesting || !localApiKey || !localCity}
            className="button-3d card-neon-border text-kiosk-text hover:bg-kiosk-surface"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t('weatherConfig.testing')}
              </>
            ) : (
              t('weatherConfig.testConnection')
            )}
          </Button>
        </div>

        {/* Help Info */}
        <div className="p-3 rounded-lg bg-kiosk-bg/50 card-neon-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 icon-neon-blue mt-0.5 flex-shrink-0" />
            <div className="text-xs text-settings-hint space-y-1">
              <p className="text-label-orange">{t('weatherConfig.helpTitle')}</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>{t('weatherConfig.helpStep1')} <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1">OpenWeatherMap <ExternalLink className="w-3 h-3" /></a></li>
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
