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

const CACHE_TTL_MS = 5 * 60 * 1000;
const aqCache = new TtlCache<AirQualityFetchResult>(CACHE_TTL_MS, 200);

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

export async function fetchAirQualityData(
  location: LocationInfo
): Promise<AirQualityFetchResult> {
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

      const hourlyList: HourlyDataPoint[] = [];
      const times: string[] = Array.isArray(data.hourly?.time) ? data.hourly.time : [];
      const pm25List: number[] = Array.isArray(data.hourly?.pm2_5) ? data.hourly.pm2_5 : [];
      const pm10List: number[] = Array.isArray(data.hourly?.pm10) ? data.hourly.pm10 : [];
      const ozoneList: number[] = Array.isArray(data.hourly?.ozone) ? data.hourly.ozone : [];

      const utcOffsetSeconds = typeof data.utc_offset_seconds === 'number' ? data.utc_offset_seconds : 0;
      const startIndex = selectHourlyStartIndex(times, utcOffsetSeconds);

      const sliceCount = Math.min(24, times.length - startIndex);
      for (let i = 0; i < sliceCount; i++) {
        const idx = startIndex + i;
        const timeStr = times[idx];
        const parsedHour = parseInt(timeStr.slice(11, 13), 10);
        const hour = Number.isNaN(parsedHour) ? new Date(timeStr).getHours() : parsedHour;
        const p25 = pm25List[idx] ?? pm2_5;
        const p10 = pm10List[idx] ?? pm10;
        const oz = ozoneList[idx] ?? ozone;
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

      const windows = computePollutionWindows(hourlyList);

      const result: AirQualityFetchResult = {
        current,
        hourly: hourlyList,
        windows,
        isDemo: false,
      };
      aqCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.warn(`Air quality API failed for ${name}, using high-fidelity fallback:`, error instanceof Error ? error.message : error);
  }

  return getFallbackAirQuality(location);
}

export function computePollutionWindows(hourly: HourlyDataPoint[]): PollutionWindows {
  if (hourly.length === 0) {
    return {
      bestOutdoorWindow: {
        startHour: 14,
        endHour: 17,
        label: '2:00 PM – 5:00 PM',
        description: 'Atmospheric mixing is highest; particulate concentrations tend to disperse slightly in late afternoon.',
      },
      peakPollutionWindow: {
        startHour: 6,
        endHour: 9,
        label: '6:00 AM – 9:30 AM',
        description: 'Morning temperature inversion traps vehicle exhaust and ground particulate near breathing level.',
      },
    };
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

  const formatH = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:00 ${ampm}`;
  };

  return {
    bestOutdoorWindow: {
      startHour: bestStart,
      endHour: bestEnd,
      label: `${formatH(bestStart)} – ${formatH(bestEnd)}`,
      description: `Lowest particulate concentration predicted (${minPoint.pm2_5} µg/m³ PM2.5, AQI ${minPoint.aqi}). Ideal for essential outdoor errands.`,
    },
    peakPollutionWindow: {
      startHour: peakStart,
      endHour: peakEnd,
      label: `${formatH(peakStart)} – ${formatH(peakEnd)}`,
      description: `Highest pollution level predicted (${maxPoint.pm2_5} µg/m³ PM2.5, AQI ${maxPoint.aqi}). Keep windows sealed and limit outdoor exertion.`,
    },
  };
}

export function getFallbackAirQuality(location: LocationInfo): AirQualityFetchResult {
  const isDelhi = location.name.toLowerCase().includes('delhi');
  const basePM25 = isDelhi ? 165 : 85;
  const basePM10 = isDelhi ? 245 : 130;
  const current = calculateCompositeAQI(basePM25, basePM10, 42, 38, 14, 1.2);

  const hourly: HourlyDataPoint[] = [];
  const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  for (const h of hours) {
    const factor = h >= 13 && h <= 17 ? 0.72 : (h >= 6 && h <= 9 ? 1.35 : (h >= 21 ? 1.2 : 0.95));
    const p25 = Math.round(basePM25 * factor);
    const p10 = Math.round(basePM10 * factor);
    const sub = calculateCompositeAQI(p25, p10, 35);
    hourly.push({
      time: `${h}:00`,
      hour: h,
      pm2_5: p25,
      pm10: p10,
      ozone: 35,
      aqi: sub.aqi,
    });
  }

  return {
    current,
    hourly,
    windows: {
      bestOutdoorWindow: {
        startHour: 14,
        endHour: 17,
        label: '2:00 PM – 5:00 PM',
        description: 'Sunlight enhances atmospheric boundary layer height, promoting natural dilution of ground-level particles.',
      },
      peakPollutionWindow: {
        startHour: 6,
        endHour: 9,
        label: '6:00 AM – 9:00 AM',
        description: 'Cool ground temperatures create thermal inversion trapping urban vehicle and heating emissions.',
      },
    },
    isDemo: true,
    demoNotice: 'Demo data — connect live APIs for current conditions.',
  };
}
