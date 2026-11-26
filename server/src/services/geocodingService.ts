import axios from 'axios';
import { LocationInfo } from '../types/index.js';
import { TtlCache } from '../utils/ttlCache.js';

interface GeocodingApiItem {
  name?: unknown;
  country?: unknown;
  admin1?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

const geocodingCache = new TtlCache<LocationInfo[]>(15 * 60 * 1000, 200);

export function clearGeocodingCache(): void {
  geocodingCache.clear();
}

export const POPULAR_CITIES: LocationInfo[] = [
  { name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', country: 'India', admin1: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060 },
];

export async function searchCities(query: string): Promise<LocationInfo[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return POPULAR_CITIES;

  const localMatches = POPULAR_CITIES.filter(
    (c) => c.name.toLowerCase().includes(trimmed) || c.country.toLowerCase().includes(trimmed)
  );

  if (localMatches.length > 0 && localMatches[0].name.toLowerCase() === trimmed) {
    return localMatches;
  }

  const cached = geocodingCache.get(trimmed);
  if (cached) {
    return cached;
  }

  try {
    const geocodingUrl = process.env.GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search';
    const response = await axios.get(geocodingUrl, {
      params: {
        name: trimmed,
        count: 6,
        language: 'en',
        format: 'json',
      },
      timeout: 4000,
    });

    if (response.data && Array.isArray(response.data.results)) {
      const results: LocationInfo[] = (response.data.results as GeocodingApiItem[])
        .filter(
          (item) =>
            typeof item.name === 'string' &&
            typeof item.latitude === 'number' &&
            Number.isFinite(item.latitude) &&
            typeof item.longitude === 'number' &&
            Number.isFinite(item.longitude)
        )
        .map((item) => ({
          name: item.name as string,
          country: typeof item.country === 'string' ? item.country : '',
          admin1: typeof item.admin1 === 'string' ? item.admin1 : '',
          latitude: item.latitude as number,
          longitude: item.longitude as number,
        }));

      if (results.length > 0) {
        geocodingCache.set(trimmed, results);
        return results;
      }
      return localMatches;
    }
  } catch (error) {
    console.warn('Geocoding API search failed, returning local match fallback:', error instanceof Error ? error.message : error);
  }

  return localMatches.length > 0 ? localMatches : [POPULAR_CITIES[0]];
}
