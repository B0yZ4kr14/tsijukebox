import { useState, useEffect, useCallback } from 'react';

export interface WeatherData {
  location: string;
  region: string;
  country: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  icon: string;
  humidity: number;
  windSpeed: number;
  updatedAt: Date;
}

interface UseWeatherOptions {
  city: string;
  apiKey: string;
  refreshInterval?: number; // in milliseconds
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const CACHE_KEY = 'tsi_jukebox_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getWeatherIcon(conditionCode: number, isDay: boolean): string {
  // OpenWeatherMap condition codes
  if (conditionCode >= 200 && conditionCode < 300) return '⛈️'; // Thunderstorm
  if (conditionCode >= 300 && conditionCode < 400) return '🌧️'; // Drizzle
  if (conditionCode >= 500 && conditionCode < 600) return '🌧️'; // Rain
  if (conditionCode >= 600 && conditionCode < 700) return '❄️'; // Snow
  if (conditionCode >= 700 && conditionCode < 800) return '🌫️'; // Atmosphere (fog, mist)
  if (conditionCode === 800) return isDay ? '☀️' : '🌙'; // Clear
  if (conditionCode > 800) return isDay ? '⛅' : '☁️'; // Clouds
  return '🌡️';
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

export function useWeather({ city, apiKey, refreshInterval = 30 * 60 * 1000 }: UseWeatherOptions): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    // Try to load from cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return { ...data, updatedAt: new Date(data.updatedAt) };
        }
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city || !apiKey) {
      setError('Cidade ou API Key não configurada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key inválida');
        }
        if (response.status === 404) {
          throw new Error('Cidade não encontrada');
        }
        throw new Error('Erro ao buscar clima');
      }

      const data = await response.json();
      const isDay = data.dt > data.sys.sunrise && data.dt < data.sys.sunset;

      const weatherData: WeatherData = {
        location: data.name,
        region: data.sys.country === 'BR' ? 'MG' : '',
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: translateCondition(data.weather[0].description),
        conditionCode: data.weather[0].id,
        icon: getWeatherIcon(data.weather[0].id, isDay),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        updatedAt: new Date(),
      };

      setWeather(weatherData);

      // Cache the result
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: weatherData,
        timestamp: Date.now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [city, apiKey]);

  // Initial fetch
  useEffect(() => {
    if (city && apiKey) {
      fetchWeather();
    }
  }, [city, apiKey, fetchWeather]);

  // Auto-refresh
  useEffect(() => {
    if (!city || !apiKey || refreshInterval <= 0) return;

    const interval = setInterval(fetchWeather, refreshInterval);
    return () => clearInterval(interval);
  }, [city, apiKey, refreshInterval, fetchWeather]);

  return {
    weather,
    isLoading,
    error,
    refresh: fetchWeather,
  };
}
