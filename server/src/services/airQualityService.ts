import axios from 'axios';
import {
  CurrentPollutants,
  HourlyDataPoint,
  LocationInfo,
  PollutionWindows,
} from '../types/index.js';
import { calculateCompositeAQI } from '../utils/aqiCalculator.js';
import { TtlCache } from '../utils/ttlCache.js';

export interface AirQualityFetchResult {
  current: CurrentPollutants;
  hourly: HourlyDataPoint[];
  windows: PollutionWindows;
  isDemo: boolean;
  demoNotice?: string;
}

interface RawHourlyPayload {
  time?: unknown;
  pm2_5?: unknown;
  pm10?: unknown;
  ozone?: unknown;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const aqCache = new TtlCache<AirQualityFetchResult>(CACHE_TTL_MS, 200);

const DEFAULT_POLLUTION_WINDOWS: PollutionWindows = {
  bestOutdoorWindow: {
    startHour: 14,
    endHour: 17,
    label: '2:00 PM – 5:00 PM',
    description:
      'Atmospheric mixing is highest; particulate concentrations tend to disperse slightly in late afternoon.',
  },
  peakPollutionWindow: {
    startHour: 6,
    endHour: 9,
    label: '6:00 AM – 9:30 AM',
    description:
      'Morning temperature inversion traps vehicle exhaust and ground particulate near breathing level.',
  },
};

export function clearAirQualityCache(): void {
  aqCache.clear();
}

export function selectHourlyStartIndex(
  times: string[],
  utcOffsetSeconds: number = 0,
  nowMs: number = Date.now()
): number {
  if (!Array.isArray(times) || times.length === 0) return 0;
  const safeOffset = Number.isFinite(utcOffsetSeconds) ? utcOffsetSeconds : 0;
  const currentLocalIsoHour = new Date(nowMs + safeOffset * 1000).toISOString().slice(0, 13);
  const idx = times.findIndex((t) => typeof t === 'string' && t.startsWith(currentLocalIsoHour));
  return idx === -1 ? 0 : idx;
}

function formatHourLabel(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hr = hour % 12 === 0 ? 12 : hour % 12;
  return `${hr}:00 ${ampm}`;
}

function buildHourlySeries(
  hourlyPayload: RawHourlyPayload | undefined,
  utcOffsetSeconds: number,
  fallbackCurrent: Pick<CurrentPollutants, 'pm2_5' | 'pm10' | 'ozone'>
): HourlyDataPoint[] {
  const times: string[] = Array.isArray(hourlyPayload?.time) ? hourlyPayload.time : [];
  const pm25List: number[] = Array.isArray(hourlyPayload?.pm2_5) ? hourlyPayload.pm2_5 : [];
  const pm10List: number[] = Array.isArray(hourlyPayload?.pm10) ? hourlyPayload.pm10 : [];
  const ozoneList: number[] = Array.isArray(hourlyPayload?.ozone) ? hourlyPayload.ozone : [];

  const startIndex = selectHourlyStartIndex(times, utcOffsetSeconds);
  const sliceCount = Math.min(24, times.length - startIndex);
  const hourlyList: HourlyDataPoint[] = [];

  for (let i = 0; i < sliceCount; i++) {
    const idx = startIndex + i;
    const timeStr = times[idx];
    const parsedHour = parseInt(timeStr.slice(11, 13), 10);
    const hour = Number.isNaN(parsedHour) ? new Date(timeStr).getHours() : parsedHour;
    const p25 = pm25List[idx] ?? fallbackCurrent.pm2_5;
    const p10 = pm10List[idx] ?? fallbackCurrent.pm10;
    const oz = ozoneList[idx] ?? fallbackCurrent.ozone;
    const sub = calculateCompositeAQI(p25, p10, oz);

    hourlyList.push({
      time: `${hour}:00`,
      hour,
      pm2_5: Math.round(p25 * 10) / 10,
      pm10: Math.round(p10 * 10) / 10,
      ozone: Math.round(oz * 10) / 10,
      aqi: sub.aqi,
    });
  }

  return hourlyList;
}

/**
 * Fetches current and 24-hour Open-Meteo air quality data for a coordinate pair,
 * backed by a bounded 5-minute TTL cache and deterministic fallback estimates.
 */
export async function fetchAirQualityData(location: LocationInfo): Promise<AirQualityFetchResult> {
  const { latitude, longitude, name } = location;
  const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = aqCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = process.env.AIR_QUALITY_API_URL || 'https://air-quality-api.open-meteo.com/v1/air-quality';
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        current: [
          'european_aqi',
          'us_aqi',
          'pm10',
          'pm2_5',
          'ozone',
          'nitrogen_dioxide',
          'sulphur_dioxide',
          'carbon_monoxide',
        ].join(','),
        hourly: ['pm10', 'pm2_5', 'ozone', 'us_aqi'].join(','),
        forecast_days: 2,
        timezone: 'auto',
      },
      timeout: 6000,
    });

    const data = response.data;
    if (data && data.current) {
      const pm2_5 = data.current.pm2_5 ?? 45;
      const pm10 = data.current.pm10 ?? 75;
      const ozone = data.current.ozone ?? 30;
      const no2 = data.current.nitrogen_dioxide ?? 20;
      const so2 = data.current.sulphur_dioxide ?? 10;
      const co = (data.current.carbon_monoxide ?? 300) / 1000;

      const current = calculateCompositeAQI(pm2_5, pm10, ozone, no2, so2, co);
      const utcOffsetSeconds = typeof data.utc_offset_seconds === 'number' ? data.utc_offset_seconds : 0;
      const hourly = buildHourlySeries(data.hourly, utcOffsetSeconds, { pm2_5, pm10, ozone });
      const windows = computePollutionWindows(hourly);

      const result: AirQualityFetchResult = { current, hourly, windows, isDemo: false };
      aqCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn(
      `Air quality API failed for ${name}, using high-fidelity fallback:`,
      error instanceof Error ? error.message : error
    );
  }

  return getFallbackAirQuality(location);
}

/**
 * Identifies the lowest-pollution outdoor window and peak thermal-inversion window
 * across the 24-hour hourly forecast.
 */
export function computePollutionWindows(hourly: HourlyDataPoint[]): PollutionWindows {
  if (hourly.length === 0) {
    return DEFAULT_POLLUTION_WINDOWS;
  }

  let minPoint = hourly[0];
  let maxPoint = hourly[0];

  for (const pt of hourly) {
    if (pt.aqi < minPoint.aqi) minPoint = pt;
    if (pt.aqi > maxPoint.aqi) maxPoint = pt;
  }

  const bestStart = minPoint.hour;
  const bestEnd = (bestStart + 3) % 24;
  const peakStart = maxPoint.hour;
  const peakEnd = (peakStart + 3) % 24;

  return {
    bestOutdoorWindow: {
      startHour: bestStart,
      endHour: bestEnd,
      label: `${formatHourLabel(bestStart)} – ${formatHourLabel(bestEnd)}`,
      description: `Lowest particulate concentration predicted (${minPoint.pm2_5} µg/m³ PM2.5, AQI ${minPoint.aqi}). Ideal for essential outdoor errands.`,
    },
    peakPollutionWindow: {
      startHour: peakStart,
      endHour: peakEnd,
      label: `${formatHourLabel(peakStart)} – ${formatHourLabel(peakEnd)}`,
      description: `Highest pollution level predicted (${maxPoint.pm2_5} µg/m³ PM2.5, AQI ${maxPoint.aqi}). Keep windows sealed and limit outdoor exertion.`,
    },
  };
}

export function getFallbackAirQuality(location: LocationInfo): AirQualityFetchResult {
  const isDelhi = location.name.toLowerCase().includes('delhi');
  const basePM25 = isDelhi ? 165 : 85;
  const basePM10 = isDelhi ? 245 : 130;
  const current = calculateCompositeAQI(basePM25, basePM10, 42, 38, 14, 1.2);

  const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  const hourly: HourlyDataPoint[] = hours.map((h) => {
    const factor = h >= 13 && h <= 17 ? 0.72 : h >= 6 && h <= 9 ? 1.35 : h >= 21 ? 1.2 : 0.95;
    const p25 = Math.round(basePM25 * factor);
    const p10 = Math.round(basePM10 * factor);
    const sub = calculateCompositeAQI(p25, p10, 35);
    return { time: `${h}:00`, hour: h, pm2_5: p25, pm10: p10, ozone: 35, aqi: sub.aqi };
  });

  return {
    current,
    hourly,
    windows: DEFAULT_POLLUTION_WINDOWS,
    isDemo: true,
    demoNotice: 'Demo data — connect live APIs for current conditions.',
  };
}
