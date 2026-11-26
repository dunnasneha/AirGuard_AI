import { describe, it, expect } from 'vitest';
import {
  calculateSingleActionImpact,
  computeTotalImpact,
  EMISSION_FACTORS,
} from '../services/impactService.js';

describe('Impact Calculation & Scoring Unit Tests', () => {
  it('calculates expected values across all 7 defined action IDs and unknown fallback', () => {
    const definedIds = [
      'public_transport',
      'cycling_walking',
      'carpool',
      'work_from_home',
      'combine_errands',
      'indoor_purifier_timed',
      'sealed_cooking_vent',
    ];

    for (const id of definedIds) {
      const impact = calculateSingleActionImpact(id);
      expect(impact.actionId).toBe(id);
      expect(impact.estimatedCo2SavedKg).toBeGreaterThan(0);
      expect(impact.exposureReductionPercent).toBeGreaterThan(0);
      expect(impact.explanation.length).toBeGreaterThan(10);
    }

    const unknown = calculateSingleActionImpact('custom_green_habit');
    expect(unknown.category).toBe('lifestyle');
    expect(unknown.estimatedCo2SavedKg).toBe(0.5);
    expect(unknown.tripsAvoided).toBe(1);
    expect(EMISSION_FACTORS.PETROL_CAR_SOLO).toBeGreaterThan(EMISSION_FACTORS.METRO_RAIL);
  });

  it('computes cumulative impact and respects score ceiling of 100', () => {
    const actions = [
      'public_transport',
      'cycling_walking',
      'carpool',
      'work_from_home',
      'combine_errands',
      'indoor_purifier_timed',
      'sealed_cooking_vent',
    ];
    const summary = computeTotalImpact(actions, 30);

    expect(summary.actionsCompleted).toBe(7);
    expect(summary.totalTripsAvoided).toBe(6);
    expect(summary.airWiseScore).toBe(100);
    expect(summary.estimatedExposureCutPercent).toBeLessThanOrEqual(85);
    expect(summary.assumptions.length).toBeGreaterThan(0);
  });

  it('clamps negative streaks safely and handles empty actions cleanly', () => {
    const emptySummary = computeTotalImpact([], 0);
    expect(emptySummary.actionsCompleted).toBe(0);
    expect(emptySummary.totalCo2SavedKg).toBe(0);
    expect(emptySummary.totalTripsAvoided).toBe(0);
    expect(emptySummary.airWiseScore).toBe(50);

    const negativeStreak = computeTotalImpact([], -5);
    expect(negativeStreak.airWiseScore).toBe(50);
  });
});
