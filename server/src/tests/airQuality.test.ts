import { describe, it, expect } from 'vitest';
import { calculateCompositeAQI, getAQICategory } from '../utils/aqiCalculator.js';
import { computePollutionWindows, selectHourlyStartIndex } from '../services/airQualityService.js';

describe('AQI Calculator & Classification Unit Tests', () => {
  it('correctly maps AQI values to official categories across exact boundaries', () => {
    expect(getAQICategory(0)).toBe('Good');
    expect(getAQICategory(30)).toBe('Good');
    expect(getAQICategory(100)).toBe('Good');
    expect(getAQICategory(101)).toBe('Moderate');
    expect(getAQICategory(200)).toBe('Moderate');
    expect(getAQICategory(201)).toBe('Poor');
    expect(getAQICategory(300)).toBe('Poor');
    expect(getAQICategory(301)).toBe('Very Poor');
    expect(getAQICategory(400)).toBe('Very Poor');
    expect(getAQICategory(401)).toBe('Severe');
    expect(getAQICategory(500)).toBe('Severe');
  });

  it('validates exact PM2.5 breakpoint concentrations (30, 60, 90, 120, 250, 500)', () => {
    expect(calculateCompositeAQI(30, 0).aqi).toBe(50);
    expect(calculateCompositeAQI(60, 0).aqi).toBe(100);
    expect(calculateCompositeAQI(90, 0).aqi).toBe(200);
    expect(calculateCompositeAQI(120, 0).aqi).toBe(300);
    expect(calculateCompositeAQI(250, 0).aqi).toBe(400);
    expect(calculateCompositeAQI(500, 0).aqi).toBe(500);
    expect(calculateCompositeAQI(750, 0).aqi).toBe(500);
    expect(calculateCompositeAQI(750, 0).category).toBe('Severe');
  });

  it('handles NaN, negative, and Infinity pollutant values safely without crashing', () => {
    const nanResult = calculateCompositeAQI(Number.NaN, Number.NaN, Number.NaN);
    expect(nanResult.aqi).toBe(15);
    expect(nanResult.category).toBe('Good');

    const negResult = calculateCompositeAQI(-10, -25, 0);
    expect(negResult.aqi).toBe(15);
    expect(negResult.category).toBe('Good');

    const infResult = calculateCompositeAQI(Number.POSITIVE_INFINITY, 0, 10);
    expect(infResult.aqi).toBe(15);
    expect(infResult.category).toBe('Good');

    const infWithPm10 = calculateCompositeAQI(Number.POSITIVE_INFINITY, 40, 10);
    expect(infWithPm10.aqi).toBe(40);
    expect(infWithPm10.dominantPollutant).toBe('PM10');
  });

  it('calculates composite AQI with dominant PM2.5 and PM10 including decimal PM10 breakpoints', () => {
    const pm25Dom = calculateCompositeAQI(110, 80, 20);
    expect(pm25Dom.dominantPollutant).toBe('PM2.5');
    expect(pm25Dom.category).toBe('Poor');
    expect(pm25Dom.pm2_5).toBe(110);
    expect(pm25Dom.aqi).toBeGreaterThanOrEqual(201);
    expect(pm25Dom.healthAdvice).toContain('limit intense outdoor');

    const pm10Dom = calculateCompositeAQI(20, 380, 25);
    expect(pm10Dom.dominantPollutant).toBe('PM10');
    expect(pm10Dom.category).toBe('Very Poor');
    expect(pm10Dom.pm10).toBe(380);
    expect(pm10Dom.aqi).toBeGreaterThanOrEqual(301);

    const pm10Decimal = calculateCompositeAQI(15, 100.5, 20);
    expect(pm10Decimal.dominantPollutant).toBe('PM10');
    expect(pm10Decimal.category).toBe('Moderate');
    expect(pm10Decimal.aqi).toBeGreaterThanOrEqual(101);
  });

  it('handles zero clean baseline and extreme smog levels (> 250 µg/m³ PM2.5)', () => {
    const zeroResult = calculateCompositeAQI(0, 0, 0);
    expect(zeroResult.category).toBe('Good');
    expect(zeroResult.aqi).toBeLessThanOrEqual(50);

    const severeResult = calculateCompositeAQI(320, 480, 50);
    expect(severeResult.category).toBe('Severe');
    expect(severeResult.aqi).toBeGreaterThanOrEqual(401);
    expect(severeResult.healthAdvice).toContain('Severe pollution alert');
  });

  it('handles decimal PM2.5 concentrations between integer breakpoints', () => {
    const midGood = calculateCompositeAQI(30.4, 50.2, 20);
    expect(midGood.category).toBe('Good');
    expect(midGood.aqi).toBeGreaterThanOrEqual(50);
    expect(midGood.aqi).toBeLessThanOrEqual(55);

    const highPoor = calculateCompositeAQI(120.5, 100.5, 25);
    expect(highPoor.category).toBe('Very Poor');
    expect(highPoor.aqi).toBeGreaterThanOrEqual(301);
  });
});

describe('Hourly Window & Timezone Selection Tests', () => {
  it('selects correct hourly start index for IST (+5:30), EST (-5:00), and midnight day rollover', () => {
    const times = [
      '2026-11-26T22:00',
      '2026-11-26T23:00',
      '2026-11-27T00:00',
      '2026-11-27T01:00',
    ];
    // 2026-11-26T18:30:00Z + 19800s (+5:30 IST) = 2026-11-27T00:00
    const istMidnightUtc = Date.UTC(2026, 10, 26, 18, 30, 0);
    expect(selectHourlyStartIndex(times, 19800, istMidnightUtc)).toBe(2);

    // 2026-11-27T03:00:00Z - 18000s (-5:00 EST) = 2026-11-26T22:00
    const estLateUtc = Date.UTC(2026, 10, 27, 3, 0, 0);
    expect(selectHourlyStartIndex(times, -18000, estLateUtc)).toBe(0);

    // Empty or unmatched timestamp falls back cleanly to 0
    expect(selectHourlyStartIndex([], 0, istMidnightUtc)).toBe(0);
    expect(selectHourlyStartIndex(['2026-01-01T00:00'], 0, istMidnightUtc)).toBe(0);
  });

  it('computes lowest and peak pollution windows from hourly series', () => {
    const windows = computePollutionWindows([
      { time: '6:00', hour: 6, pm2_5: 140, pm10: 210, ozone: 25, aqi: 315 },
      { time: '14:00', hour: 14, pm2_5: 42, pm10: 70, ozone: 35, aqi: 70 },
      { time: '22:00', hour: 22, pm2_5: 110, pm10: 170, ozone: 20, aqi: 267 },
    ]);

    expect(windows.bestOutdoorWindow.startHour).toBe(14);
    expect(windows.bestOutdoorWindow.endHour).toBe(17);
    expect(windows.bestOutdoorWindow.label).toBe('2:00 PM – 5:00 PM');
    expect(windows.peakPollutionWindow.startHour).toBe(6);
    expect(windows.peakPollutionWindow.endHour).toBe(9);
    expect(windows.peakPollutionWindow.label).toBe('6:00 AM – 9:00 AM');
  });
});
