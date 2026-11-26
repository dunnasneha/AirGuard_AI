import { Request, Response, NextFunction } from 'express';
import { ChatMessage, EnvironmentalContext, UserProfile } from '../types/index.js';

export function validateCoordinates(req: Request, res: Response, next: NextFunction): void {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    res.status(400).json({
      error: 'Invalid coordinates provided. Latitude must be -90 to 90 and Longitude must be -180 to 180.',
    });
    return;
  }

  next();
}

export function sanitizeString(input: unknown, maxLen: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

function toSafeNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

export function validateAndNormalizeProfile(raw: unknown): UserProfile | null {
  if (!isPlainObject(raw)) {
    return null;
  }

  const members = isPlainObject(raw.householdMembers) ? raw.householdMembers : {};
  const loc = isPlainObject(raw.location) ? raw.location : {};

  return {
    lifestyle: (sanitizeString(raw.lifestyle, 60) || 'Student') as UserProfile['lifestyle'],
    householdMembers: {
      adults: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.adults, 1)))),
      children: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.children, 0)))),
      elderly: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.elderly, 0)))),
      sensitive: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.sensitive, 0)))),
    },
    commuteMethod: (sanitizeString(raw.commuteMethod, 60) || 'Public transport') as UserProfile['commuteMethod'],
    outdoorActivity: (sanitizeString(raw.outdoorActivity, 60) || 'Walking') as UserProfile['outdoorActivity'],
    indoorEnvironment: Array.isArray(raw.indoorEnvironment)
      ? raw.indoorEnvironment
          .map((item) => sanitizeString(item, 60))
          .filter(Boolean)
          .slice(0, 10) as UserProfile['indoorEnvironment']
      : [],
    sensitivities: sanitizeString(raw.sensitivities, 200) || undefined,
    location: {
      name: sanitizeString(loc.name, 100) || 'Selected Location',
      country: sanitizeString(loc.country, 100) || '',
      admin1: sanitizeString(loc.admin1, 100) || undefined,
      latitude: toSafeNumber(loc.latitude, 0),
      longitude: toSafeNumber(loc.longitude, 0),
    },
  };
}

export function validateAndNormalizeEnvironmentalContext(raw: unknown): EnvironmentalContext | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.location) || !isPlainObject(raw.airQuality)) {
    return null;
  }

  const locName = sanitizeString(raw.location.name, 100);
  if (!locName || typeof raw.airQuality.aqi !== 'number' || !Number.isFinite(raw.airQuality.aqi)) {
    return null;
  }

  const weather = isPlainObject(raw.weather) ? raw.weather : {};
  const windows = isPlainObject(raw.windows) ? raw.windows : {};
  const bestWin = isPlainObject(windows.bestOutdoorWindow) ? windows.bestOutdoorWindow : {};
  const peakWin = isPlainObject(windows.peakPollutionWindow) ? windows.peakPollutionWindow : {};

  return {
    location: {
      name: locName,
      country: sanitizeString(raw.location.country, 100) || '',
      admin1: sanitizeString(raw.location.admin1, 100) || undefined,
      latitude: toSafeNumber(raw.location.latitude, 0),
      longitude: toSafeNumber(raw.location.longitude, 0),
    },
    airQuality: {
      aqi: Math.max(0, Math.min(500, Math.round(raw.airQuality.aqi))),
      category: (sanitizeString(raw.airQuality.category, 30) || 'Moderate') as EnvironmentalContext['airQuality']['category'],
      pm2_5: toSafeNumber(raw.airQuality.pm2_5, 0),
      pm10: toSafeNumber(raw.airQuality.pm10, 0),
      ozone: toSafeNumber(raw.airQuality.ozone, 0),
      no2: toSafeNumber(raw.airQuality.no2, 0),
      so2: toSafeNumber(raw.airQuality.so2, 0),
      co: toSafeNumber(raw.airQuality.co, 0),
      dominantPollutant: sanitizeString(raw.airQuality.dominantPollutant, 30) || 'PM2.5',
      healthAdvice: sanitizeString(raw.airQuality.healthAdvice, 400) || '',
    },
    hourly: Array.isArray(raw.hourly) ? (raw.hourly.slice(0, 48) as EnvironmentalContext['hourly']) : [],
    windows: {
      bestOutdoorWindow: {
        startHour: toSafeNumber(bestWin.startHour, 14),
        endHour: toSafeNumber(bestWin.endHour, 17),
        label: sanitizeString(bestWin.label, 60) || '2:00 PM – 5:00 PM',
        description: sanitizeString(bestWin.description, 300) || 'Lower afternoon particulate window.',
      },
      peakPollutionWindow: {
        startHour: toSafeNumber(peakWin.startHour, 6),
        endHour: toSafeNumber(peakWin.endHour, 9),
        label: sanitizeString(peakWin.label, 60) || '6:00 AM – 9:00 AM',
        description: sanitizeString(peakWin.description, 300) || 'Morning thermal inversion peak.',
      },
    },
    weather: {
      temperature: toSafeNumber(weather.temperature, 24),
      humidity: toSafeNumber(weather.humidity, 55),
      windSpeed: toSafeNumber(weather.windSpeed, 8),
      weatherCode: toSafeNumber(weather.weatherCode, 0),
      conditionDescription: sanitizeString(weather.conditionDescription, 120) || 'Clear',
    },
    lastUpdated: sanitizeString(raw.lastUpdated, 60) || new Date().toISOString(),
    isDemo: Boolean(raw.isDemo),
    demoNotice: raw.demoNotice ? sanitizeString(raw.demoNotice, 200) : undefined,
  };
}

export function validateAndSanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .slice(-10)
    .filter((item): item is Record<string, unknown> => isPlainObject(item))
    .map((item, idx) => {
      const sender = item.sender === 'user' ? 'user' : 'assistant';
      const content = sanitizeString(item.content, 1000);
      return {
        id: sanitizeString(item.id, 60) || `hist-${idx}`,
        sender,
        content,
        timestamp: sanitizeString(item.timestamp, 60) || '',
      } as ChatMessage;
    })
    .filter((msg) => msg.content.length > 0);
}
