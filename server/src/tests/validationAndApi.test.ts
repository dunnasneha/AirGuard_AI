import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateAndNormalizeEnvironmentalContext,
  validateAndNormalizeProfile,
} from '../middleware/validation.js';
import {
  generateDailyActionPlan,
  getAirWiseChatResponse,
  getCleanerOptionComparison,
} from '../services/geminiService.js';

describe('Validation & AI Service Resilience Tests', () => {
  it('sanitizes control characters and trims strings safely', () => {
    expect(sanitizeString('  Hyderabad\x00\x1F  ')).toBe('Hyderabad');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(12345)).toBe('');
  });

  it('rejects empty or missing environmentalContext objects', () => {
    expect(validateAndNormalizeEnvironmentalContext(null)).toBeNull();
    expect(validateAndNormalizeEnvironmentalContext({})).toBeNull();
    expect(validateAndNormalizeEnvironmentalContext({ location: { name: 'Delhi' } })).toBeNull();
  });

  it('normalizes partial profile and environmentalContext safely', () => {
    const profile = validateAndNormalizeProfile({ lifestyle: 'Office worker' });
    const env = validateAndNormalizeEnvironmentalContext({
      location: { name: 'Hyderabad' },
      airQuality: { aqi: 145 },
    });

    expect(profile).not.toBeNull();
    expect(profile?.householdMembers.adults).toBe(1);
    expect(profile?.indoorEnvironment).toEqual([]);

    expect(env).not.toBeNull();
    expect(env?.location.name).toBe('Hyderabad');
    expect(env?.airQuality.aqi).toBe(145);
    expect(env?.windows.bestOutdoorWindow.label).toBeTruthy();
  });

  it('never throws TypeError on partial context in AI services', async () => {
    const partialProfile = {} as any;
    const partialEnv = {} as any;

    const plan = await generateDailyActionPlan(partialProfile, partialEnv);
    expect(plan.summary).toBeTruthy();
    expect(plan.actions.length).toBe(6);

    const chat = await getAirWiseChatResponse('Can I go for a run?', [], partialProfile, partialEnv);
    expect(chat).toContain('Outdoor Activity Guidance');

    const comp = await getCleanerOptionComparison('Car', 'Metro', partialProfile, partialEnv);
    expect(comp.recommendation).toContain('Metro');
  });
});
