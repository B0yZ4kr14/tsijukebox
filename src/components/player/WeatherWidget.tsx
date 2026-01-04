import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, MapPin, Droplets, Wind, RefreshCw, AlertCircle, ChevronDown, Thermometer, Settings } from 'lucide-react';
import { useWeather, useWeatherForecast } from '@/hooks/system';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatedWeatherIcon } from '@/components/weather/AnimatedWeatherIcon';
import { WeatherForecastChart } from './WeatherForecastChart';

export function WeatherWidget() {
  const navigate = useNavigate();
  const { weather: weatherSettings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { weather, isLoading, error, refresh } = useWeather({
    city: weatherSettings.city,
    apiKey: weatherSettings.apiKey,
  });

  const { forecast } = useWeatherForecast({
    city: weatherSettings.city,
    apiKey: weatherSettings.apiKey,
  });

  // Show unconfigured state instead of hiding
  if (!weatherSettings.isEnabled || !weatherSettings.apiKey || !weatherSettings.city) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl weather-widget-3d cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Cloud className="w-5 h-5 text-kiosk-text/85" />
              <span className="text-xs text-kiosk-text/80 font-medium">--°C</span>
              <Settings aria-hidden="true" className="w-3 h-3 text-kiosk-text/80" />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-kiosk-surface border-kiosk-surface/50">
            <p className="text-sm text-kiosk-text">Configure o clima nas configurações</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg badge-3d bg-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-destructive font-medium">Erro</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isLoading && !weather) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg badge-3d">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw aria-hidden="true" className="w-4 h-4 text-kiosk-text/85" />
        </motion.div>
        <span className="text-xs text-kiosk-text/90 font-medium">Carregando...</span>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer",
                "weather-widget-3d"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {/* Animated Weather Icon */}
              <AnimatedWeatherIcon aria-hidden="true" conditionCode={weather.conditionCode} size="sm" />

              {/* Temperature & Location */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-kiosk-text">
                    {weather.temperature}°C
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-kiosk-text/90">
                  <MapPin className="w-3 h-3" />
                  <span className="font-medium">{weather.location}</span>
                </div>
              </div>

              {/* Expand indicator */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown aria-hidden="true" className="w-4 h-4 text-kiosk-text/85" />
              </motion.div>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-kiosk-surface border-kiosk-surface/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AnimatedWeatherIcon aria-hidden="true" conditionCode={weather.conditionCode} size="md" />
                <div>
                  <p className="font-semibold text-kiosk-text">{weather.condition}</p>
                  <p className="text-xs text-kiosk-text/90">
                    Sensação: {weather.feelsLike}°C
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-kiosk-text/80">
                <div className="flex items-center gap-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="font-medium">{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium">{weather.windSpeed} km/h</span>
                </div>
              </div>

              <div className="text-xs text-kiosk-text/85 pt-1 border-t border-kiosk-surface">
                {weather.location}, {weather.region} - {weather.country}
                <br />
                Atualizado: {weather.updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Expanded Forecast Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="bg-kiosk-surface/95 backdrop-blur-xl rounded-xl p-4 card-settings-3d min-w-[320px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-kiosk-text flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-kiosk-primary" />
                  Previsão 5 Dias
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    refresh();
                  }}
                  className="p-1.5 rounded-lg hover:bg-kiosk-surface transition-colors"
                >
                  <RefreshCw aria-hidden="true" className="w-4 h-4 text-kiosk-text/85" />
                </button>
              </div>
              
              <WeatherForecastChart forecast={forecast} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
