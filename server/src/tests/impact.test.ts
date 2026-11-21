import { describe, it, expect } from 'vitest';
import {
  calculateSingleActionImpact,
  computeTotalImpact,
  EMISSION_FACTORS,
} from '../services/impactService.js';

describe('Impact Calculation & Scoring Unit Tests', () => {
  it('correctly calculates single action emission savings for public transit', () => {
    const impact = calculateSingleActionImpact('public_transport');
    expect(impact.category).toBe('commute');
    expect(impact.tripsAvoided).toBe(1);
    expect(impact.estimatedCo2SavedKg).toBeGreaterThan(1.0);
    expect(impact.explanation.toLowerCase()).toContain('car');
  });

  it('correctly calculates work-from-home emission impact', () => {
    const impact = calculateSingleActionImpact('work_from_home');
    expect(impact.tripsAvoided).toBe(2);
    expect(impact.exposureReductionPercent).toBeGreaterThanOrEqual(50);
  });

  it('computes cumulative impact and scores properly', () => {
    const actions = ['public_transport', 'work_from_home', 'indoor_purifier_timed'];
    const summary = computeTotalImpact(actions, 5);

    expect(summary.actionsCompleted).toBe(3);
    expect(summary.totalTripsAvoided).toBe(3);
    expect(summary.totalCo2SavedKg).toBeGreaterThan(3.0);
    expect(summary.streakDays).toBe(5);
    expect(summary.airWiseScore).toBeGreaterThanOrEqual(75);
    expect(summary.assumptions.length).toBeGreaterThan(0);
  });

  it('handles empty actions list without crashing', () => {
    const summary = computeTotalImpact([], 0);
    expect(summary.actionsCompleted).toBe(0);
    expect(summary.totalCo2SavedKg).toBe(0);
    expect(summary.totalTripsAvoided).toBe(0);
    expect(summary.airWiseScore).toBe(50); // Baseline score
  });
});
