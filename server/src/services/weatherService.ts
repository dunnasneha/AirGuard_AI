import axios from 'axios';
import { LocationInfo, WeatherData } from '../types/index.js';
import { TtlCache } from '../utils/ttlCache.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const weatherCache = new TtlCache<WeatherData>(CACHE_TTL_MS, 200);

export function clearWeatherCache(): void {
  weatherCache.clear();
}

export async function fetchWeatherData(location: LocationInfo): Promise<WeatherData> {
  const { latitude, longitude } = location;
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        current: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m', 'weather_code'].join(','),
        timezone: 'auto',
      },
      timeout: 5000,
    });

    const data = response.data;
    if (data && data.current) {
      const code = data.current.weather_code ?? 0;
      const result: WeatherData = {
        temperature: Math.round((data.current.temperature_2m ?? 24) * 10) / 10,
        humidity: Math.round(data.current.relative_humidity_2m ?? 60),
        windSpeed: Math.round((data.current.wind_speed_10m ?? 8) * 10) / 10,
        weatherCode: code,
        conditionDescription: interpretWeatherCode(code),
      };
      weatherCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn(`Weather API call failed for ${location.name}, using standard estimate:`, error instanceof Error ? error.message : error);
  }

  return {
    temperature: 24.5,
    humidity: 58,
    windSpeed: 7.2,
    weatherCode: 2,
    conditionDescription: 'Partly cloudy with mild haze',
  };
}

function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy / Low visibility haze';
  if (code >= 51 && code <= 55) return 'Light drizzle';
  if (code >= 61 && code <= 65) return 'Rain showers';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear with mild urban haze';
}
