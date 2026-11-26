import {
  AIDailyPlan,
  ChatMessage,
  ChatResponse,
  CommunityStats,
  ComparatorResult,
  EnvironmentalContext,
  ImpactSummary,
  LocationInfo,
  UserProfile,
} from '../types';

export const DEFAULT_COMMUNITY_STATS: CommunityStats = {
  title: 'Community Air Actions',
  isDemoSample: true,
  notice: 'Demo community activity — collective urban smog reduction stats from community participants.',
  metrics: {
    cleanerChoices: 1240,
    carTripsAvoided: 680,
    indoorChecklistsCompleted: 430,
    estimatedCo2PreventedKg: 980,
  },
};

function resolveApiBase(): string {
  const envUrl = (import.meta.env?.VITE_API_URL || '').trim();
  if (!envUrl) return '/api';
  if (/^https?:\/\/(localhost|127\.0\.0\.1):5000(\/|$)/i.test(envUrl)) {
    return '/api';
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(envUrl)
  ) {
    return '/api';
  }
  return envUrl.replace(/\/+$/, '');
}

const API_BASE = resolveApiBase();

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    if (typeof body?.error === 'string' && body.error.trim().length > 0) {
      return body.error;
    }
  } catch {
    // Non-JSON response body
  }
  return fallback;
}

async function postJson<T>(endpoint: string, payload: unknown, defaultError: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, defaultError));
  }
  return (await res.json()) as T;
}

/** Checks backend API liveness via `/api/health`. */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/** Searches global urban locations matching a query string. */
export async function searchCities(query: string): Promise<LocationInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/cities?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search cities');
    const data = (await res.json()) as { cities?: LocationInfo[] };
    return data.cities || [];
  } catch (err) {
    console.warn('City search fallback:', err);
    return [];
  }
}

/** Fetches live AQI, weather, and hourly pollution windows for a location with single transient retry. */
export async function fetchEnvironmentalData(
  location: LocationInfo,
  signal?: AbortSignal
): Promise<EnvironmentalContext> {
  const lat = Number.isFinite(location.latitude) ? location.latitude : 17.385;
  const lon = Number.isFinite(location.longitude) ? location.longitude : 78.4867;
  const city = location.name || 'Hyderabad';
  const country = location.country || 'India';
  const url = `${API_BASE}/environmental-data?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal?.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }
    try {
      const res = await fetch(url, signal ? { signal } : undefined);
      if (res.ok) {
        return (await res.json()) as EnvironmentalContext;
      }
      if (res.status < 500 && res.status !== 429) {
        throw new Error("We couldn't retrieve the latest air-quality data. Please try again.");
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      lastError = err;
    }
    if (attempt === 0 && !signal?.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("We couldn't retrieve the latest air-quality data. Please try again.");
}

/** Generates a personalized daily action plan using profile and live environmental context. */
export function fetchAIDailyPlan(
  profile: UserProfile,
  environmentalContext: EnvironmentalContext
): Promise<AIDailyPlan> {
  return postJson<AIDailyPlan>(
    '/ai/daily-plan',
    { profile, environmentalContext },
    'Failed to generate AI action plan. Please try again.'
  );
}

/** Sends a multi-turn user message to the contextual AirWise Assistant. */
export function sendAIChatMessage(
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  environmentalContext: EnvironmentalContext
): Promise<ChatResponse> {
  return postJson<ChatResponse>(
    '/ai/chat',
    { message, history, profile, environmentalContext },
    'Assistant is currently unavailable. Please try again.'
  );
}

/** Compares two urban commute or lifestyle options with emissions and practicality context. */
export function fetchOptionComparison(
  optionA: string,
  optionB: string,
  profile: UserProfile,
  environmentalContext: EnvironmentalContext
): Promise<ComparatorResult> {
  return postJson<ComparatorResult>(
    '/ai/comparator',
    { optionA, optionB, profile, environmentalContext },
    'Failed to compare options.'
  );
}

/** Computes estimated personal CO2 reduction and sustainability streak summary. */
export function calculateImpactSummary(
  actions: string[],
  streakDays: number = 4
): Promise<ImpactSummary> {
  return postJson<ImpactSummary>(
    '/impact/calculate',
    { actions, streakDays },
    'Failed to calculate impact.'
  );
}

/** Retrieves community action benchmark statistics with safe demo fallback. */
export async function fetchCommunityStats(): Promise<CommunityStats> {
  try {
    const res = await fetch(`${API_BASE}/community/stats`);
    if (!res.ok) throw new Error('Failed to load community stats');
    return (await res.json()) as CommunityStats;
  } catch {
    return DEFAULT_COMMUNITY_STATS;
  }
}
