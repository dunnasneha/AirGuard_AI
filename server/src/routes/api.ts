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
import { sanitizeString, validateCoordinates } from '../middleware/validation.js';
import { EnvironmentalContext, LocationInfo, UserProfile } from '../types/index.js';

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
    const { profile, environmentalContext } = req.body;

    if (!profile || !environmentalContext) {
      return res.status(400).json({ error: 'Profile and environmental context are required.' });
    }

    const plan = await generateDailyActionPlan(profile as UserProfile, environmentalContext as EnvironmentalContext);
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
    const { message, history = [], profile, environmentalContext } = req.body;
    const cleanMsg = sanitizeString(message);

    if (!cleanMsg) {
      return res.status(400).json({ error: 'A message query is required.' });
    }

    if (!environmentalContext || !profile) {
      return res.status(400).json({ error: 'Profile and environmental context are required for contextual AI.' });
    }

    const reply = await getAirWiseChatResponse(cleanMsg, history, profile, environmentalContext);

    res.json({
      reply,
      contextUsed: {
        location: environmentalContext.location.name,
        aqi: environmentalContext.airQuality.aqi,
        category: environmentalContext.airQuality.category,
        lifestyle: profile.lifestyle,
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
    const { optionA, optionB, profile, environmentalContext } = req.body;

    if (!optionA || !optionB || !profile || !environmentalContext) {
      return res.status(400).json({ error: 'Both options, profile, and environmental context are required.' });
    }

    const comparison = await getCleanerOptionComparison(
      sanitizeString(optionA),
      sanitizeString(optionB),
      profile,
      environmentalContext
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
    const { actions = [], streakDays = 4 } = req.body;
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
