import { UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'airwise_user_profile',
  ACTIONS: 'airwise_logged_actions',
  CHECKLIST: 'airwise_indoor_checklist',
  THEME: 'airwise_theme',
  STREAK: 'airwise_streak_days',
} as const;

const DEFAULT_ACTIONS = ['public_transport', 'work_from_home'];

const DEFAULT_CHECKLIST: Record<string, boolean> = {
  smoke: true,
  kitchen: true,
  dust: false,
  purifier: true,
  sensor: false,
};

export const DEFAULT_PROFILE: UserProfile = {
  lifestyle: 'Student',
  householdMembers: { adults: 2, children: 1, elderly: 0, sensitive: 0 },
  commuteMethod: 'Public transport',
  outdoorActivity: 'Walking',
  indoorEnvironment: ['Natural ventilation', 'Closed windows'],
  location: {
    name: 'Hyderabad',
    country: 'India',
    admin1: 'Telangana',
    latitude: 17.385,
    longitude: 78.4867,
  },
};

function readJsonStorage<T>(key: string, fallback: T, validate?: (val: unknown) => val is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write ${key} to localStorage:`, err);
  }
}

function isStringArray(val: unknown): val is string[] {
  return Array.isArray(val) && val.every((item) => typeof item === 'string');
}

function isBooleanRecord(val: unknown): val is Record<string, boolean> {
  return (
    Boolean(val) &&
    typeof val === 'object' &&
    !Array.isArray(val) &&
    Object.values(val as Record<string, unknown>).every((v) => typeof v === 'boolean')
  );
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile> | null;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PROFILE;

    const loc = parsed.location;
    const validLocation =
      loc &&
      typeof loc === 'object' &&
      typeof loc.name === 'string' &&
      loc.name.trim().length > 0 &&
      typeof loc.latitude === 'number' &&
      Number.isFinite(loc.latitude) &&
      typeof loc.longitude === 'number' &&
      Number.isFinite(loc.longitude)
        ? { ...DEFAULT_PROFILE.location, ...loc }
        : DEFAULT_PROFILE.location;

    const members =
      parsed.householdMembers && typeof parsed.householdMembers === 'object'
        ? { ...DEFAULT_PROFILE.householdMembers, ...parsed.householdMembers }
        : DEFAULT_PROFILE.householdMembers;

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      householdMembers: members,
      indoorEnvironment: Array.isArray(parsed.indoorEnvironment)
        ? parsed.indoorEnvironment
        : DEFAULT_PROFILE.indoorEnvironment,
      location: validLocation,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  writeJsonStorage(STORAGE_KEYS.PROFILE, profile);
}

export function loadLoggedActions(): string[] {
  return readJsonStorage(STORAGE_KEYS.ACTIONS, DEFAULT_ACTIONS, isStringArray);
}

export function saveLoggedActions(actions: string[]): void {
  writeJsonStorage(STORAGE_KEYS.ACTIONS, actions);
}

export function loadIndoorChecklist(): Record<string, boolean> {
  return readJsonStorage(STORAGE_KEYS.CHECKLIST, DEFAULT_CHECKLIST, isBooleanRecord);
}

export function saveIndoorChecklist(checklist: Record<string, boolean>): void {
  writeJsonStorage(STORAGE_KEYS.CHECKLIST, checklist);
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.warn('Failed to save theme:', err);
  }
}

export function loadStreakDays(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) return 4;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 4;
  } catch {
    return 4;
  }
}

export function saveStreakDays(days: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, String(Math.max(0, Math.floor(days))));
  } catch (err) {
    console.warn('Failed to save streak days:', err);
  }
}
