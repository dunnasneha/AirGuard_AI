import { describe, it, expect } from 'vitest';
import { calculateCompositeAQI, getAQICategory } from '../utils/aqiCalculator.js';

describe('AQI Calculator & Classification Unit Tests', () => {
  it('correctly maps AQI values to official categories', () => {
    expect(getAQICategory(30)).toBe('Good');
    expect(getAQICategory(75)).toBe('Good');
    expect(getAQICategory(110)).toBe('Moderate');
    expect(getAQICategory(150)).toBe('Moderate');
    expect(getAQICategory(180)).toBe('Moderate');
    expect(getAQICategory(210)).toBe('Poor');
    expect(getAQICategory(250)).toBe('Poor');
    expect(getAQICategory(310)).toBe('Very Poor');
    expect(getAQICategory(350)).toBe('Very Poor');
    expect(getAQICategory(420)).toBe('Severe');
    expect(getAQICategory(499)).toBe('Severe');
  });

  it('calculates composite AQI with dominant PM2.5', () => {
    // PM2.5 = 110 µg/m³ (Poor), PM10 = 80 µg/m³ (Good)
    const result = calculateCompositeAQI(110, 80, 20);
    expect(result.dominantPollutant).toBe('PM2.5');
    expect(result.category).toBe('Poor');
    expect(result.pm2_5).toBe(110);
    expect(result.aqi).toBeGreaterThanOrEqual(201);
    expect(result.healthAdvice).toContain('limit intense outdoor');
  });

  it('calculates composite AQI with dominant PM10', () => {
    // PM2.5 = 20 µg/m³ (Good), PM10 = 380 µg/m³ (Very Poor)
    const result = calculateCompositeAQI(20, 380, 25);
    expect(result.dominantPollutant).toBe('PM10');
    expect(result.category).toBe('Very Poor');
    expect(result.pm10).toBe(380);
    expect(result.aqi).toBeGreaterThanOrEqual(301);
  });

  it('handles zero or clean baseline concentrations gracefully', () => {
    const result = calculateCompositeAQI(0, 0, 0);
    expect(result.category).toBe('Good');
    expect(result.aqi).toBeLessThanOrEqual(50);
  });

  it('handles extreme winter smog levels (> 250 µg/m³ PM2.5)', () => {
    const result = calculateCompositeAQI(320, 480, 50);
    expect(result.category).toBe('Severe');
    expect(result.aqi).toBeGreaterThanOrEqual(401);
    expect(result.healthAdvice).toContain('Severe pollution alert');
  });
});
