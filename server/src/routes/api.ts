import { Router, Request, Response } from 'express';
import { POPULAR_CITIES, searchCities } from '../services/geocodingService.js';
import { fetchAirQualityData } from '../services/airQualityService.js';
import { fetchWeatherData } from '../services/weatherService.js';
import {
  generateDailyActionPlan,
  getAirWiseChatWithSource,
  getCleanerOptionComparison,
} from '../services/geminiService.js';
import { COMMUNITY_DEMO_STATS, computeTotalImpact } from '../services/impactService.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import {
  sanitizeString,
  validateAndNormalizeEnvironmentalContext,
  validateAndNormalizeProfile,
  validateAndSanitizeHistory,
  validateCoordinates,
} from '../middleware/validation.js';
import { EnvironmentalContext, LocationInfo } from '../types/index.js';

const router = Router();

function sendError(res: Response, status: number, error: string) {
  return res.status(status).json({ error });
}

// 1. Health check (Required: GET /api/health -> {"status": "ok"})
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiReady: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. City Search & Presets
router.get('/cities', async (req: Request, res: Response) => {
  try {
    const query = sanitizeString(req.query.q, 100);
    if (!query) {
      return res.json({ cities: POPULAR_CITIES });
    }
    const results = await searchCities(query);
    return res.json({ cities: results });
  } catch (err) {
    console.error('Error searching cities:', err instanceof Error ? err.message : err);
    return sendError(res, 500, 'Failed to search cities.');
  }
});

// 3. Environmental Data (Air Quality + Weather Context)
router.get('/environmental-data', validateCoordinates, async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const cityName = sanitizeString(req.query.city, 100) || 'Selected Location';
    const country = sanitizeString(req.query.country, 100) || '';

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

    return res.json(context);
  } catch (err) {
    console.error('Error fetching environmental data:', err instanceof Error ? err.message : err);
    return sendError(res, 500, "We couldn't retrieve the latest air-quality data. Please try again.");
  }
});

// 4. GenAI Daily Action Plan
router.post('/ai/daily-plan', rateLimiter, async (req: Request, res: Response) => {
  try {
    const normalizedProfile = validateAndNormalizeProfile(req.body?.profile);
    const normalizedEnv = validateAndNormalizeEnvironmentalContext(req.body?.environmentalContext);

    if (!normalizedProfile || !normalizedEnv) {
      return sendError(
        res,
        400,
        'Valid profile and environmentalContext (with location.name and airQuality.aqi) are required.'
      );
    }

    const plan = await generateDailyActionPlan(normalizedProfile, normalizedEnv);
    return res.json(plan);
  } catch (err) {
    console.error('Error generating AI daily plan:', err instanceof Error ? err.message : err);
    return sendError(res, 500, 'Failed to generate personalized daily plan. Please try again.');
  }
});

// 5. GenAI Conversational AirWise Assistant
router.post('/ai/chat', rateLimiter, async (req: Request, res: Response) => {
  try {
    const cleanMsg = sanitizeString(req.body?.message, 1000);

    if (!cleanMsg) {
      return sendError(res, 400, 'A message query is required.');
    }

    const normalizedProfile = validateAndNormalizeProfile(req.body?.profile);
    const normalizedEnv = validateAndNormalizeEnvironmentalContext(req.body?.environmentalContext);

    if (!normalizedProfile || !normalizedEnv) {
      return sendError(
        res,
        400,
        'Valid profile and environmentalContext (with location.name and airQuality.aqi) are required for contextual AI.'
      );
    }

    const safeHistory = validateAndSanitizeHistory(req.body?.history);
    const { reply, generatedBy } = await getAirWiseChatWithSource(
      cleanMsg,
      safeHistory,
      normalizedProfile,
      normalizedEnv
    );

    return res.json({
      reply,
      generatedBy,
      contextUsed: {
        location: normalizedEnv.location.name,
        aqi: normalizedEnv.airQuality.aqi,
        category: normalizedEnv.airQuality.category,
        lifestyle: normalizedProfile.lifestyle,
      },
    });
  } catch (err) {
    console.error('Error handling AI chat request:', err instanceof Error ? err.message : err);
    return sendError(res, 500, 'Assistant is temporarily busy. Please try asking again.');
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
      return sendError(
        res,
        400,
        'Valid optionA, optionB, profile, and environmentalContext are required.'
      );
    }

    const comparison = await getCleanerOptionComparison(
      cleanA,
      cleanB,
      normalizedProfile,
      normalizedEnv
    );

    return res.json(comparison);
  } catch (err) {
    console.error('Error comparing options:', err instanceof Error ? err.message : err);
    return sendError(res, 500, 'Failed to compare options.');
  }
});

// 7. Impact Calculation Endpoint
router.post('/impact/calculate', (req: Request, res: Response) => {
  try {
    const rawActions = req.body?.actions;
    const rawStreak = req.body?.streakDays;

    if (rawActions !== undefined && !Array.isArray(rawActions)) {
      return sendError(res, 400, 'actions must be an array of action identifiers.');
    }

    const actions = Array.isArray(rawActions)
      ? rawActions.filter((item): item is string => typeof item === 'string').slice(0, 50)
      : [];
    const streakDays =
      typeof rawStreak === 'number' && Number.isFinite(rawStreak)
        ? Math.max(0, Math.min(365, Math.floor(rawStreak)))
        : 4;

    const summary = computeTotalImpact(actions, streakDays);
    return res.json(summary);
  } catch (err) {
    console.error('Error calculating impact:', err instanceof Error ? err.message : err);
    return sendError(res, 500, 'Failed to calculate impact.');
  }
});

// 8. Community Activity Endpoint (Transparently labeled)
router.get('/community/stats', (_req: Request, res: Response) => {
  res.json(COMMUNITY_DEMO_STATS);
});

export default router;
