import { Router, Request, Response } from 'express';
import { POPULAR_CITIES, searchCities } from '../services/geocodingService.js';
import { fetchAirQualityData } from '../services/airQualityService.js';
import { fetchWeatherData } from '../services/weatherService.js';
import {
  generateDailyActionPlan,
  getAirWiseChatResponse,
  getCleanerOptionComparison,
} from '../services/geminiService.js';
import { computeTotalImpact } from '../services/impactService.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import {
  sanitizeString,
  validateAndNormalizeEnvironmentalContext,
  validateAndNormalizeProfile,
  validateCoordinates,
} from '../middleware/validation.js';
import { EnvironmentalContext, LocationInfo } from '../types/index.js';

const router = Router();

// 1. Health check (Required: GET /api/health -> {"status": "ok"})
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiReady: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. City Search & Presets
router.get('/cities', async (req: Request, res: Response) => {
  const query = sanitizeString(req.query.q);
  if (!query) {
    return res.json({ cities: POPULAR_CITIES });
  }
  const results = await searchCities(query);
  res.json({ cities: results });
});

// 3. Environmental Data (Air Quality + Weather Context)
router.get('/environmental-data', validateCoordinates, async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const cityName = sanitizeString(req.query.city) || 'Selected Location';
    const country = sanitizeString(req.query.country) || '';

    const location: LocationInfo = {
      name: cityName,
      country,
      latitude: lat,
      longitude: lon,
    };

    const [aqResult, weatherResult] = await Promise.all([
      fetchAirQualityData(location),
      fetchWeatherData(location),
    ]);

    const context: EnvironmentalContext = {
      location,
      airQuality: aqResult.current,
      hourly: aqResult.hourly,
      windows: aqResult.windows,
      weather: weatherResult,
      lastUpdated: new Date().toISOString(),
      isDemo: aqResult.isDemo,
      demoNotice: aqResult.demoNotice,
    };

    res.json(context);
  } catch (err) {
    console.error('Error fetching environmental data:', err);
    res.status(500).json({
      error: "We couldn't retrieve the latest air-quality data. Please try again.",
    });
  }
});

// 4. GenAI Daily Action Plan
router.post('/ai/daily-plan', rateLimiter, async (req: Request, res: Response) => {
  try {
    const normalizedProfile = validateAndNormalizeProfile(req.body?.profile);
    const normalizedEnv = validateAndNormalizeEnvironmentalContext(req.body?.environmentalContext);

    if (!normalizedProfile || !normalizedEnv) {
      return res.status(400).json({
        error: 'Valid profile and environmentalContext (with location.name and airQuality.aqi) are required.',
      });
    }

    const plan = await generateDailyActionPlan(normalizedProfile, normalizedEnv);
    res.json(plan);
  } catch (err) {
    console.error('Error generating AI daily plan:', err);
    res.status(500).json({
      error: 'Failed to generate personalized daily plan. Please try again.',
    });
  }
});

// 5. GenAI Conversational AirWise Assistant
router.post('/ai/chat', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history = [] } = req.body || {};
    const cleanMsg = sanitizeString(message);

    if (!cleanMsg) {
      return res.status(400).json({ error: 'A message query is required.' });
    }

    const normalizedProfile = validateAndNormalizeProfile(req.body?.profile);
    const normalizedEnv = validateAndNormalizeEnvironmentalContext(req.body?.environmentalContext);

    if (!normalizedProfile || !normalizedEnv) {
      return res.status(400).json({
        error: 'Valid profile and environmentalContext (with location.name and airQuality.aqi) are required for contextual AI.',
      });
    }

    const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
    const reply = await getAirWiseChatResponse(cleanMsg, safeHistory, normalizedProfile, normalizedEnv);

    res.json({
      reply,
      contextUsed: {
        location: normalizedEnv.location.name,
        aqi: normalizedEnv.airQuality.aqi,
        category: normalizedEnv.airQuality.category,
        lifestyle: normalizedProfile.lifestyle,
      },
    });
  } catch (err) {
    console.error('Error handling AI chat request:', err);
    res.status(500).json({
      error: 'Assistant is temporarily busy. Please try asking again.',
    });
  }
});

// 6. GenAI Cleaner Option Comparator
router.post('/ai/comparator', rateLimiter, async (req: Request, res: Response) => {
  try {
    const cleanA = sanitizeString(req.body?.optionA, 200);
    const cleanB = sanitizeString(req.body?.optionB, 200);
    const normalizedProfile = validateAndNormalizeProfile(req.body?.profile);
    const normalizedEnv = validateAndNormalizeEnvironmentalContext(req.body?.environmentalContext);

    if (!cleanA || !cleanB || !normalizedProfile || !normalizedEnv) {
      return res.status(400).json({
        error: 'Valid optionA, optionB, profile, and environmentalContext are required.',
      });
    }

    const comparison = await getCleanerOptionComparison(
      cleanA,
      cleanB,
      normalizedProfile,
      normalizedEnv
    );

    res.json(comparison);
  } catch (err) {
    console.error('Error comparing options:', err);
    res.status(500).json({ error: 'Failed to compare options.' });
  }
});

// 7. Impact Calculation Endpoint
router.post('/impact/calculate', (req: Request, res: Response) => {
  try {
    const rawActions = req.body?.actions;
    const rawStreak = req.body?.streakDays;

    if (rawActions !== undefined && !Array.isArray(rawActions)) {
      return res.status(400).json({ error: 'actions must be an array of action identifiers.' });
    }

    const actions = Array.isArray(rawActions)
      ? rawActions.filter((item): item is string => typeof item === 'string').slice(0, 50)
      : [];
    const streakDays = typeof rawStreak === 'number' && Number.isFinite(rawStreak)
      ? Math.max(0, Math.min(365, Math.floor(rawStreak)))
      : 4;

    const summary = computeTotalImpact(actions, streakDays);
    res.json(summary);
  } catch (err) {
    console.error('Error calculating impact:', err);
    res.status(500).json({ error: 'Failed to calculate impact.' });
  }
});

// 8. Community Activity Endpoint (Transparently labeled per requirements)
router.get('/community/stats', (req: Request, res: Response) => {
  res.json({
    title: 'Community Air Actions',
    isDemoSample: true,
    notice: 'Demo community activity — collective urban smog reduction stats from community participants.',
    metrics: {
      cleanerChoices: 1240,
      carTripsAvoided: 680,
      indoorChecklistsCompleted: 430,
      estimatedCo2PreventedKg: 980,
      activeParticipatingHouseholds: 312,
    },
  });
});

export default router;
