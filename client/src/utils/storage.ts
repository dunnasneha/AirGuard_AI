import { UserProfile } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'airwise_user_profile',
  ACTIONS: 'airwise_logged_actions',
  CHECKLIST: 'airwise_indoor_checklist',
  THEME: 'airwise_theme',
  STREAK: 'airwise_streak_days',
};

export const DEFAULT_PROFILE: UserProfile = {
  lifestyle: 'Student',
  householdMembers: {
    adults: 2,
    children: 1,
    elderly: 0,
    sensitive: 0,
  },
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

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile to localStorage:', err);
  }
}

export function loadLoggedActions(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    return raw ? JSON.parse(raw) : ['public_transport', 'work_from_home'];
  } catch {
    return ['public_transport', 'work_from_home'];
  }
}

export function saveLoggedActions(actions: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
  } catch (err) {
    console.warn('Failed to save actions to localStorage:', err);
  }
}

export function loadIndoorChecklist(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    return raw ? JSON.parse(raw) : {
      'smoke': true,
      'kitchen': true,
      'dust': false,
      'purifier': true,
      'sensor': false,
    };
  } catch {
    return {
      'smoke': true,
      'kitchen': true,
      'dust': false,
      'purifier': true,
      'sensor': false,
    };
  }
}

export function saveIndoorChecklist(checklist: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(checklist));
  } catch (err) {
    console.warn('Failed to save checklist:', err);
  }
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
