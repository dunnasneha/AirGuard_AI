import { describe, it, expect, beforeEach } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import app from '../index.js';
import { TtlCache } from '../utils/ttlCache.js';

describe('TtlCache Bounded Caching Unit Tests', () => {
  it('stores hits, expires entries after TTL, and evicts oldest entries past maxEntries', () => {
    let now = 1000;
    const cache = new TtlCache<string>(500, 2, () => now);

    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    expect(cache.get('a')).toBe('alpha');
    expect(cache.size).toBe(2);

    // Adding a third item evicts oldest entry ('a')
    cache.set('c', 'gamma');
    expect(cache.size).toBe(2);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe('beta');
    expect(cache.get('c')).toBe('gamma');

    // Advance clock past TTL (500ms)
    now += 600;
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBeUndefined();
  });
});

describe('Express API Routes & Security Headers Integration Tests', () => {
  let server: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });

    return async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    };
  });

  const sampleProfile = {
    lifestyle: 'Student',
    householdMembers: { adults: 2, children: 0, elderly: 0, sensitive: 0 },
    commuteMethod: 'Public transport',
    outdoorActivity: 'Walking',
    indoorEnvironment: ['Natural ventilation'],
    location: { name: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867 },
  };

  const sampleEnv = {
    location: { name: 'Hyderabad', country: 'India', latitude: 17.385, longitude: 78.4867 },
    airQuality: {
      aqi: 150,
      category: 'Moderate',
      pm2_5: 75,
      pm10: 120,
      ozone: 35,
      dominantPollutant: 'PM2.5',
      healthAdvice: 'Acceptable air quality.',
    },
    weather: { temperature: 24, humidity: 55, windSpeed: 8, weatherCode: 1, conditionDescription: 'Clear' },
  };

  it('GET /api/health returns status ok and sets security headers without X-Powered-By', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');

    const body = (await res.json()) as { status: string; version: string };
    expect(body.status).toBe('ok');
    expect(body.version).toBe('1.0.0');
  });

  it('GET /api/cities returns popular presets when query is empty', async () => {
    const res = await fetch(`${baseUrl}/api/cities`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { cities: Array<{ name: string }> };
    expect(body.cities.length).toBeGreaterThan(0);
    expect(body.cities.some((c) => c.name === 'Hyderabad')).toBe(true);
  });

  it('GET /api/environmental-data rejects invalid coordinates with 400', async () => {
    const res = await fetch(`${baseUrl}/api/environmental-data?lat=199&lon=78`);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain('Invalid coordinates');
  });

  it('POST AI endpoints validate inputs and return structured responses', async () => {
    const badPlan = await fetch(`${baseUrl}/api/ai/daily-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(badPlan.status).toBe(400);

    const okPlan = await fetch(`${baseUrl}/api/ai/daily-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: sampleProfile, environmentalContext: sampleEnv }),
    });
    expect(okPlan.status).toBe(200);
    const planJson = (await okPlan.json()) as { actions: unknown[]; generatedBy: string };
    expect(planJson.actions).toHaveLength(6);
    expect(['gemini', 'rules-fallback']).toContain(planJson.generatedBy);

    const emptyChat = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ', profile: sampleProfile, environmentalContext: sampleEnv }),
    });
    expect(emptyChat.status).toBe(400);

    const okChat = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Should I keep windows open?',
        profile: sampleProfile,
        environmentalContext: sampleEnv,
      }),
    });
    expect(okChat.status).toBe(200);
    const chatJson = (await okChat.json()) as { reply: string; contextUsed: { location: string }; generatedBy: string };
    expect(chatJson.reply).toBeTruthy();
    expect(chatJson.contextUsed.location).toBe('Hyderabad');
    expect(['gemini', 'rules-fallback']).toContain(chatJson.generatedBy);

    const okComp = await fetch(`${baseUrl}/api/ai/comparator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        optionA: 'Driving Alone',
        optionB: 'Metro Transit',
        profile: sampleProfile,
        environmentalContext: sampleEnv,
      }),
    });
    expect(okComp.status).toBe(200);
    const compJson = (await okComp.json()) as { recommendation: string; generatedBy: string };
    expect(compJson.recommendation).toBeTruthy();
    expect(['gemini', 'rules-fallback']).toContain(compJson.generatedBy);
  });

  it('POST /api/impact/calculate and GET /api/community/stats return transparent outputs', async () => {
    const badImpact = await fetch(`${baseUrl}/api/impact/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions: 'invalid' }),
    });
    expect(badImpact.status).toBe(400);

    const okImpact = await fetch(`${baseUrl}/api/impact/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions: ['public_transport', 'carpool'], streakDays: 5 }),
    });
    expect(okImpact.status).toBe(200);
    const impactJson = (await okImpact.json()) as { totalTripsAvoided: number; airWiseScore: number };
    expect(impactJson.totalTripsAvoided).toBe(2);
    expect(impactJson.airWiseScore).toBeGreaterThanOrEqual(70);

    const statsRes = await fetch(`${baseUrl}/api/community/stats`);
    expect(statsRes.status).toBe(200);
    const statsJson = (await statsRes.json()) as { isDemoSample: boolean; metrics: { cleanerChoices: number } };
    expect(statsJson.isDemoSample).toBe(true);
    expect(statsJson.metrics.cleanerChoices).toBeGreaterThan(0);
  });

  it('enforces per-IP rate limiting (429) on AI routes after 40 requests', async () => {
    const payload = JSON.stringify({
      actions: [],
    });
    // Exhaust remaining quota on /api/ai/daily-plan (first 40 requests max)
    let saw429 = false;
    for (let i = 0; i < 45; i++) {
      const r = await fetch(`${baseUrl}/api/ai/daily-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (r.status === 429) {
        saw429 = true;
        const body = (await r.json()) as { error: string; retryAfterSeconds: number };
        expect(body.error).toContain('Too many requests');
        expect(body.retryAfterSeconds).toBeGreaterThan(0);
        break;
      }
    }
    expect(saw429).toBe(true);
  });
});
