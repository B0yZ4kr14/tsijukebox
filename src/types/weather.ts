/**
 * Weather Types
 * 
 * Types for weather data and forecasts
 */

/**
 * Weather condition types
 */
export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'sleet'
  | 'fog'
  | 'haze'
  | 'windy';

/**
 * Wind direction
 */
export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

/**
 * Temperature unit
 */
export type TemperatureUnit = 'celsius' | 'fahrenheit';

/**
 * Current weather data
 */
export interface CurrentWeather {
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: WindDirection;
  visibility: number;
  pressure: number;
  uvIndex: number;
  dewPoint: number;
  cloudCover: number;
  updatedAt: string;
}

/**
 * Hourly forecast entry
 */
export interface HourlyForecast {
  time: string;
  condition: WeatherCondition;
  temperature: number;
  feelsLike: number;
  precipProbability: number;
  windSpeed: number;
}

/**
 * Daily forecast entry
 */
export interface DailyForecast {
  date: string;
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  precipProbability: number;
  humidity: number;
  windSpeed: number;
  sunrise: string;
  sunset: string;
}

/**
 * Weather alert
 */
export interface WeatherAlert {
  id: string;
  type: 'warning' | 'watch' | 'advisory';
  event: string;
  headline: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  start: string;
  end: string;
}

/**
 * Location data for weather
 */
export interface WeatherLocation {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Complete weather data
 */
export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
}

/**
 * Weather API response
 */
export interface WeatherApiResponse {
  success: boolean;
  data: WeatherData | null;
  error: string | null;
  cachedAt: string | null;
}

/**
 * Get weather icon based on condition
 */
export function getWeatherIcon(condition: WeatherCondition): string {
  const iconMap: Record<WeatherCondition, string> = {
    'clear': 'sun',
    'partly-cloudy': 'cloud-sun',
    'cloudy': 'cloud',
    'overcast': 'clouds',
    'rain': 'cloud-rain',
    'drizzle': 'cloud-drizzle',
    'thunderstorm': 'cloud-lightning',
    'snow': 'snowflake',
    'sleet': 'cloud-hail',
    'fog': 'cloud-fog',
    'haze': 'haze',
    'windy': 'wind',
  };
  return iconMap[condition] || 'cloud';
}

/**
 * Type guard for WeatherData
 */
export function isWeatherData(value: unknown): value is WeatherData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'location' in value &&
    'current' in value
  );
}
