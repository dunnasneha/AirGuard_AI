import { AQICategory, CurrentPollutants } from '../types/index.js';

/**
 * Calculates AQI based on National Air Quality Index (NAQI / CPCB)
 * Breakpoints for PM2.5 (24-hr avg in µg/m³):
 * Good: 0 - 30 (AQI 0 - 50)
 * Moderate / Satisfactory: 31 - 60 (AQI 51 - 100)
 * Moderate: 61 - 90 (AQI 101 - 200)
 * Poor: 91 - 120 (AQI 201 - 300)
 * Very Poor: 121 - 250 (AQI 301 - 400)
 * Severe: > 250 (AQI 401 - 500)
 */

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
  category: AQICategory;
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50, category: 'Good' },
  { cLow: 30, cHigh: 60, iLow: 51, iHigh: 100, category: 'Good' },
  { cLow: 60, cHigh: 90, iLow: 101, iHigh: 200, category: 'Moderate' },
  { cLow: 90, cHigh: 120, iLow: 201, iHigh: 300, category: 'Poor' },
  { cLow: 120, cHigh: 250, iLow: 301, iHigh: 400, category: 'Very Poor' },
  { cLow: 250, cHigh: 500, iLow: 401, iHigh: 500, category: 'Severe' },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50, category: 'Good' },
  { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100, category: 'Good' },
  { cLow: 100, cHigh: 250, iLow: 101, iHigh: 200, category: 'Moderate' },
  { cLow: 250, cHigh: 350, iLow: 201, iHigh: 300, category: 'Poor' },
  { cLow: 350, cHigh: 430, iLow: 301, iHigh: 400, category: 'Very Poor' },
  { cLow: 430, cHigh: 600, iLow: 401, iHigh: 500, category: 'Severe' },
];

function calculateSubIndex(conc: number, breakpoints: Breakpoint[]): { aqi: number; category: AQICategory } {
  if (!Number.isFinite(conc) || conc <= 0) return { aqi: 15, category: 'Good' };

  for (const bp of breakpoints) {
    if (conc <= bp.cHigh) {
      const aqi = Math.round(
        ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (conc - bp.cLow) + bp.iLow
      );
      return { aqi, category: bp.category };
    }
  }

  // Extreme severe condition (> max breakpoint)
  const last = breakpoints[breakpoints.length - 1];
  return { aqi: 500, category: last.category };
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 100) return 'Good';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

const HEALTH_ADVICE_BY_CATEGORY: Record<AQICategory, string> = {
  Good: 'Air quality is satisfactory. Ideal conditions for outdoor physical activities and natural ventilation.',
  Moderate: 'Air quality is acceptable. Sensitive individuals with respiratory conditions should monitor prolonged heavy exertion.',
  Poor: 'Air quality is poor. Children, seniors, and individuals with breathing conditions should limit intense outdoor workouts.',
  'Very Poor': 'Air quality is very poor. Reduce prolonged outdoor exposure, reschedule high-intensity workouts, and keep indoor filtration running.',
  Severe: 'Severe pollution alert. Avoid outdoor exertion, keep windows tightly closed, run certified air purifiers, and wear N95/FFP2 masks outdoors.',
};

export function calculateCompositeAQI(
  pm2_5: number,
  pm10: number,
  ozone: number = 0,
  no2: number = 0,
  so2: number = 0,
  co: number = 0
): CurrentPollutants {
  const pm25Sub = calculateSubIndex(pm2_5, PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pm10, PM10_BREAKPOINTS);

  const isPm10Dominant = pm10Sub.aqi > pm25Sub.aqi;
  const dominantPollutant = isPm10Dominant ? 'PM10' : 'PM2.5';
  const aqi = isPm10Dominant ? pm10Sub.aqi : pm25Sub.aqi;
  const category = getAQICategory(aqi);
  const healthAdvice = HEALTH_ADVICE_BY_CATEGORY[category];

  return {
    aqi,
    category,
    pm2_5: Math.round(pm2_5 * 10) / 10,
    pm10: Math.round(pm10 * 10) / 10,
    ozone: Math.round(ozone * 10) / 10,
    no2: Math.round(no2 * 10) / 10,
    so2: Math.round(so2 * 10) / 10,
    co: Math.round(co * 10) / 10,
    dominantPollutant,
    healthAdvice,
  };
}
