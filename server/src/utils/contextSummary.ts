import { EnvironmentalContext, UserProfile } from '../types/index.js';

export const MEDICAL_QUERY_PATTERN =
  /\b(cure|disease|medicine|prescription|inhaler dosage|doctor|symptom|chest pain|attack|asthma)\b/i;

export interface NormalizedPromptContext {
  locationName: string;
  locationCountry: string;
  aqi: number;
  category: EnvironmentalContext['airQuality']['category'];
  dominantPollutant: string;
  pm2_5: number;
  pm10: number;
  ozone: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditionDescription: string;
  bestWindowLabel: string;
  bestWindowDescription: string;
  peakWindowLabel: string;
  peakWindowDescription: string;
  lifestyle: string;
  commuteMethod: string;
  outdoorActivity: string;
  adultsCount: number;
  childrenCount: number;
  elderlyCount: number;
  sensitiveCount: number;
  indoorSetup: string;
}

/**
 * Extracts normalized, null-safe environmental and household context fields
 * shared across Gemini prompts and deterministic rule-based fallbacks.
 */
export function extractContextSummary(
  profile: Partial<UserProfile> | undefined,
  env: Partial<EnvironmentalContext> | undefined
): NormalizedPromptContext {
  const indoorList = Array.isArray(profile?.indoorEnvironment) ? profile.indoorEnvironment : [];

  return {
    locationName: env?.location?.name || 'your city',
    locationCountry: env?.location?.country || '',
    aqi: env?.airQuality?.aqi ?? 100,
    category: env?.airQuality?.category || 'Moderate',
    dominantPollutant: env?.airQuality?.dominantPollutant || 'PM2.5',
    pm2_5: env?.airQuality?.pm2_5 ?? 45,
    pm10: env?.airQuality?.pm10 ?? 75,
    ozone: env?.airQuality?.ozone ?? 30,
    temperature: env?.weather?.temperature ?? 24,
    humidity: env?.weather?.humidity ?? 55,
    windSpeed: env?.weather?.windSpeed ?? 8,
    conditionDescription: env?.weather?.conditionDescription || 'Clear',
    bestWindowLabel: env?.windows?.bestOutdoorWindow?.label || '2:00 PM – 5:00 PM',
    bestWindowDescription: env?.windows?.bestOutdoorWindow?.description || 'Lower afternoon particulate window',
    peakWindowLabel: env?.windows?.peakPollutionWindow?.label || '6:00 AM – 9:00 AM',
    peakWindowDescription: env?.windows?.peakPollutionWindow?.description || 'Morning thermal inversion peak',
    lifestyle: profile?.lifestyle || 'Student',
    commuteMethod: profile?.commuteMethod || 'Public transport',
    outdoorActivity: profile?.outdoorActivity || 'Walking',
    adultsCount: profile?.householdMembers?.adults ?? 1,
    childrenCount: profile?.householdMembers?.children ?? 0,
    elderlyCount: profile?.householdMembers?.elderly ?? 0,
    sensitiveCount: profile?.householdMembers?.sensitive ?? 0,
    indoorSetup: indoorList.length > 0 ? indoorList.join(', ') : 'Standard ventilation',
  };
}
