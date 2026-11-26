import {
  AIDailyPlan,
  ChatMessage,
  ComparatorResult,
  EnvironmentalContext,
  ImpactSummary,
  LocationInfo,
  UserProfile,
} from '../types';

function resolveApiBase(): string {
  const envUrl = ((import.meta as any).env?.VITE_API_URL || '').trim();
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

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function searchCities(query: string): Promise<LocationInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/cities?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search cities');
    const data = await res.json();
    return data.cities || [];
  } catch (err) {
    console.warn('City search fallback:', err);
    return [];
  }
}

export async function fetchEnvironmentalData(location: LocationInfo): Promise<EnvironmentalContext> {
  const lat = Number.isFinite(location.latitude) ? location.latitude : 17.385;
  const lon = Number.isFinite(location.longitude) ? location.longitude : 78.4867;
  const city = location.name || 'Hyderabad';
  const country = location.country || 'India';
  const url = `${API_BASE}/environmental-data?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
      if (res.status < 500 && res.status !== 429) {
        throw new Error("We couldn't retrieve the latest air-quality data. Please try again.");
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("We couldn't retrieve the latest air-quality data. Please try again.");
}

export async function fetchAIDailyPlan(
  profile: UserProfile,
  environmentalContext: EnvironmentalContext
): Promise<AIDailyPlan> {
  const res = await fetch(`${API_BASE}/ai/daily-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, environmentalContext }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate AI action plan. Please try again.');
  }
  return await res.json();
}

export async function sendAIChatMessage(
  message: string,
  history: ChatMessage[],
  profile: UserProfile,
  environmentalContext: EnvironmentalContext
): Promise<{ reply: string; contextUsed: any }> {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, profile, environmentalContext }),
  });

  if (!res.ok) {
    throw new Error('Assistant is currently unavailable. Please try again.');
  }
  return await res.json();
}

export async function fetchOptionComparison(
  optionA: string,
  optionB: string,
  profile: UserProfile,
  environmentalContext: EnvironmentalContext
): Promise<ComparatorResult> {
  const res = await fetch(`${API_BASE}/ai/comparator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionA, optionB, profile, environmentalContext }),
  });

  if (!res.ok) {
    throw new Error('Failed to compare options.');
  }
  return await res.json();
}

export async function calculateImpactSummary(
  actions: string[],
  streakDays: number = 4
): Promise<ImpactSummary> {
  const res = await fetch(`${API_BASE}/impact/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions, streakDays }),
  });

  if (!res.ok) {
    throw new Error('Failed to calculate impact.');
  }
  return await res.json();
}

export async function fetchCommunityStats(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/community/stats`);
    if (!res.ok) throw new Error('Failed to load community stats');
    return await res.json();
  } catch {
    return {
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
  }
}
