import { useState, useEffect, useCallback } from 'react';

export interface ForecastDay {
  date: Date;
  dayName: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  conditionCode: number;
  icon: string;
  humidity: number;
  precipitation: number;
}

interface UseWeatherForecastOptions {
  city: string;
  apiKey: string;
}

interface UseWeatherForecastReturn {
  forecast: ForecastDay[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const FORECAST_CACHE_KEY = 'tsi_jukebox_weather_forecast_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getWeatherIcon(conditionCode: number): string {
  if (conditionCode >= 200 && conditionCode < 300) return '⛈️';
  if (conditionCode >= 300 && conditionCode < 400) return '🌧️';
  if (conditionCode >= 500 && conditionCode < 600) return '🌧️';
  if (conditionCode >= 600 && conditionCode < 700) return '❄️';
  if (conditionCode >= 700 && conditionCode < 800) return '🌫️';
  if (conditionCode === 800) return '☀️';
  if (conditionCode > 800 && conditionCode < 803) return '⛅';
  if (conditionCode >= 803) return '☁️';
  return '🌡️';
}

function getDayName(date: Date, language: string = 'pt-BR'): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return language === 'pt-BR' ? 'Hoje' : language === 'es' ? 'Hoy' : 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return language === 'pt-BR' ? 'Amanhã' : language === 'es' ? 'Mañana' : 'Tomorrow';
  }
  
  return date.toLocaleDateString(language, { weekday: 'short' });
}

function translateCondition(condition: string): string {
  const translations: Record<string, string> = {
    'clear sky': 'Céu Limpo',
    'few clouds': 'Poucas Nuvens',
    'scattered clouds': 'Nuvens Dispersas',
    'broken clouds': 'Nublado',
    'overcast clouds': 'Encoberto',
    'shower rain': 'Chuva',
    'rain': 'Chuva',
    'light rain': 'Chuva Leve',
    'moderate rain': 'Chuva Moderada',
    'heavy rain': 'Chuva Forte',
    'thunderstorm': 'Tempestade',
    'snow': 'Neve',
    'mist': 'Névoa',
    'fog': 'Neblina',
    'haze': 'Neblina',
  };
  return translations[condition.toLowerCase()] || condition;
}

export function useWeatherForecast({ city, apiKey }: UseWeatherForecastOptions): UseWeatherForecastReturn {
  const [forecast, setForecast] = useState<ForecastDay[]>(() => {
    try {
      const cached = localStorage.getItem(FORECAST_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data.map((d: ForecastDay) => ({ ...d, date: new Date(d.date) }));
        }
      }
    } catch {
      // Ignore cache errors
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    if (!city || !apiKey) {
      setError('Cidade ou API Key não configurada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`
      );

      if (!response.ok) {
        if (response.status === 401) throw new Error('API Key inválida');
        if (response.status === 404) throw new Error('Cidade não encontrada');
        throw new Error('Erro ao buscar previsão');
      }

      const data = await response.json();
      
      // Group by day and get min/max temps
      const dailyMap = new Map<string, {
        temps: number[];
        conditions: { code: number; desc: string }[];
        humidity: number[];
        precipitation: number[];
        date: Date;
      }>();

      data.list.forEach((item: {
        dt: number;
        main: { temp: number; humidity: number };
        weather: { id: number; description: string }[];
        pop?: number;
      }) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            temps: [],
            conditions: [],
            humidity: [],
            precipitation: [],
            date,
          });
        }
        
        const dayData = dailyMap.get(dateKey)!;
        dayData.temps.push(item.main.temp);
        dayData.conditions.push({ code: item.weather[0].id, desc: item.weather[0].description });
        dayData.humidity.push(item.main.humidity);
        dayData.precipitation.push((item.pop || 0) * 100);
      });

      // Convert to array and limit to 5 days
      const forecastData: ForecastDay[] = Array.from(dailyMap.entries())
        .slice(0, 5)
        .map(([_, dayData]) => {
          // Get most common condition
          const conditionCounts = new Map<number, number>();
          dayData.conditions.forEach(c => {
            conditionCounts.set(c.code, (conditionCounts.get(c.code) || 0) + 1);
          });
          let maxCount = 0;
          let dominantCondition = dayData.conditions[0];
          conditionCounts.forEach((count, code) => {
            if (count > maxCount) {
              maxCount = count;
              dominantCondition = dayData.conditions.find(c => c.code === code)!;
            }
          });

          return {
            date: dayData.date,
            dayName: getDayName(dayData.date),
            tempMin: Math.round(Math.min(...dayData.temps)),
            tempMax: Math.round(Math.max(...dayData.temps)),
            condition: translateCondition(dominantCondition.desc),
            conditionCode: dominantCondition.code,
            icon: getWeatherIcon(dominantCondition.code),
            humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
            precipitation: Math.round(Math.max(...dayData.precipitation)),
          };
        });

      setForecast(forecastData);

      // Cache the result
      localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify({
        data: forecastData,
        timestamp: Date.now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [city, apiKey]);

  useEffect(() => {
    if (city && apiKey) {
      fetchForecast();
    }
  }, [city, apiKey, fetchForecast]);

  return {
    forecast,
    isLoading,
    error,
    refresh: fetchForecast,
  };
}
