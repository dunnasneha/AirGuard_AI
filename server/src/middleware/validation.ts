import { Request, Response, NextFunction } from 'express';
import { EnvironmentalContext, UserProfile } from '../types/index.js';

export function validateCoordinates(req: Request, res: Response, next: NextFunction) {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({
      error: 'Invalid coordinates provided. Latitude must be -90 to 90 and Longitude must be -180 to 180.',
    });
  }

  next();
}

export function sanitizeString(input: unknown, maxLen: number = 1000): string {
  if (typeof input !== 'string') return '';
  // Strip control characters and trim
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

function toSafeNumber(val: unknown, fallback: number): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

export function validateAndNormalizeProfile(raw: unknown): UserProfile | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const p = raw as Record<string, any>;
  const members = p.householdMembers && typeof p.householdMembers === 'object' ? p.householdMembers : {};
  const loc = p.location && typeof p.location === 'object' ? p.location : {};

  return {
    lifestyle: (sanitizeString(p.lifestyle, 60) || 'Student') as UserProfile['lifestyle'],
    householdMembers: {
      adults: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.adults, 1)))),
      children: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.children, 0)))),
      elderly: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.elderly, 0)))),
      sensitive: Math.max(0, Math.min(20, Math.floor(toSafeNumber(members.sensitive, 0)))),
    },
    commuteMethod: (sanitizeString(p.commuteMethod, 60) || 'Public transport') as UserProfile['commuteMethod'],
    outdoorActivity: (sanitizeString(p.outdoorActivity, 60) || 'Walking') as UserProfile['outdoorActivity'],
    indoorEnvironment: Array.isArray(p.indoorEnvironment)
      ? p.indoorEnvironment.map((item) => sanitizeString(item, 60)).filter(Boolean).slice(0, 10) as UserProfile['indoorEnvironment']
      : [],
    sensitivities: sanitizeString(p.sensitivities, 200) || undefined,
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
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const env = raw as Record<string, any>;
  if (!env.location || typeof env.location !== 'object' || !env.airQuality || typeof env.airQuality !== 'object') {
    return null;
  }

  const locName = sanitizeString(env.location.name, 100);
  if (!locName || typeof env.airQuality.aqi !== 'number' || !Number.isFinite(env.airQuality.aqi)) {
    return null;
  }

  const weather = env.weather && typeof env.weather === 'object' ? env.weather : {};
  const windows = env.windows && typeof env.windows === 'object' ? env.windows : {};
  const bestWin = windows.bestOutdoorWindow && typeof windows.bestOutdoorWindow === 'object' ? windows.bestOutdoorWindow : {};
  const peakWin = windows.peakPollutionWindow && typeof windows.peakPollutionWindow === 'object' ? windows.peakPollutionWindow : {};

  return {
    location: {
      name: locName,
      country: sanitizeString(env.location.country, 100) || '',
      admin1: sanitizeString(env.location.admin1, 100) || undefined,
      latitude: toSafeNumber(env.location.latitude, 0),
      longitude: toSafeNumber(env.location.longitude, 0),
    },
    airQuality: {
      aqi: Math.max(0, Math.min(500, Math.round(env.airQuality.aqi))),
      category: (sanitizeString(env.airQuality.category, 30) || 'Moderate') as EnvironmentalContext['airQuality']['category'],
      pm2_5: toSafeNumber(env.airQuality.pm2_5, 0),
      pm10: toSafeNumber(env.airQuality.pm10, 0),
      ozone: toSafeNumber(env.airQuality.ozone, 0),
      no2: toSafeNumber(env.airQuality.no2, 0),
      so2: toSafeNumber(env.airQuality.so2, 0),
      co: toSafeNumber(env.airQuality.co, 0),
      dominantPollutant: sanitizeString(env.airQuality.dominantPollutant, 30) || 'PM2.5',
      healthAdvice: sanitizeString(env.airQuality.healthAdvice, 400) || '',
    },
    hourly: Array.isArray(env.hourly) ? env.hourly.slice(0, 48) : [],
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
    lastUpdated: sanitizeString(env.lastUpdated, 60) || new Date().toISOString(),
    isDemo: Boolean(env.isDemo),
    demoNotice: env.demoNotice ? sanitizeString(env.demoNotice, 200) : undefined,
  };
}
