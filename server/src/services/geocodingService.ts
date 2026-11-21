import axios from 'axios';
import { LocationInfo } from '../types/index.js';

export const POPULAR_CITIES: LocationInfo[] = [
  { name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', country: 'India', admin1: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { name: 'London', country: 'United Kingdom', admin1: 'England', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', admin1: 'New York', latitude: 40.7128, longitude: -74.0060 }
];

export async function searchCities(query: string): Promise<LocationInfo[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return POPULAR_CITIES;

  // Check matching predefined cities first
  const localMatches = POPULAR_CITIES.filter(
    (c) => c.name.toLowerCase().includes(trimmed) || c.country.toLowerCase().includes(trimmed)
  );

  if (localMatches.length > 0 && localMatches[0].name.toLowerCase() === trimmed) {
    return localMatches;
  }

  try {
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: trimmed,
        count: 6,
        language: 'en',
        format: 'json',
      },
      timeout: 4000,
    });

    if (response.data && Array.isArray(response.data.results)) {
      const results: LocationInfo[] = response.data.results.map((item: any) => ({
        name: item.name,
        country: item.country || '',
        admin1: item.admin1 || '',
        latitude: item.latitude,
        longitude: item.longitude,
      }));
      return results.length > 0 ? results : localMatches;
    }
  } catch (error) {
    console.warn('Geocoding API search failed, returning local match fallback:', error instanceof Error ? error.message : error);
  }

  return localMatches.length > 0 ? localMatches : [POPULAR_CITIES[0]];
}
