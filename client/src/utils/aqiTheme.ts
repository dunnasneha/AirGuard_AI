export interface AqiCardTheme {
  bg: string;
  border: string;
  badge: string;
  text: string;
  gradient: string;
}

const CATEGORY_HEADLINES: Record<string, string> = {
  Good: 'Fresh, Clean Air',
  Moderate: 'Acceptable Air Quality',
  Poor: 'Unhealthy Particulate Levels',
  'Very Poor': 'High Smog & Haze Alert',
  Severe: 'Emergency Pollution Episode',
};

const AQI_BADGE_COLORS: Record<string, string> = {
  Good: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
  Moderate: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
  Poor: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700',
  'Very Poor': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
  Severe: 'bg-red-900 text-white border-red-950 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
};

const DEFAULT_BADGE_COLOR =
  'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

const AQI_CARD_THEMES: Record<string, AqiCardTheme> = {
  Good: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-900',
    badge: 'bg-emerald-600 text-white',
    text: 'text-emerald-700 dark:text-emerald-300',
    gradient: 'from-emerald-500 to-teal-600',
  },
  Moderate: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900',
    badge: 'bg-amber-600 text-white',
    text: 'text-amber-700 dark:text-amber-300',
    gradient: 'from-amber-500 to-orange-500',
  },
  Poor: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-200 dark:border-orange-900',
    badge: 'bg-orange-600 text-white',
    text: 'text-orange-700 dark:text-orange-300',
    gradient: 'from-orange-500 to-red-500',
  },
  'Very Poor': {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-900',
    badge: 'bg-rose-600 text-white',
    text: 'text-rose-700 dark:text-rose-300',
    gradient: 'from-rose-600 to-red-700',
  },
  Severe: {
    bg: 'bg-red-100 dark:bg-red-950/60',
    border: 'border-red-300 dark:border-red-800',
    badge: 'bg-red-900 text-white',
    text: 'text-red-900 dark:text-red-300',
    gradient: 'from-red-800 to-red-950',
  },
};

const DEFAULT_CARD_THEME: AqiCardTheme = {
  bg: 'bg-slate-50 dark:bg-slate-900',
  border: 'border-slate-200 dark:border-slate-800',
  badge: 'bg-slate-600 text-white',
  text: 'text-slate-700 dark:text-slate-300',
  gradient: 'from-slate-600 to-slate-800',
};

/** Returns Tailwind badge styling classes for a given NAQI category. */
export function getAqiBadgeColor(cat?: string): string {
  return (cat && AQI_BADGE_COLORS[cat]) || DEFAULT_BADGE_COLOR;
}

/** Returns card surface, border, and gradient classes for a given NAQI category. */
export function getAqiCardTheme(cat: string): AqiCardTheme {
  return AQI_CARD_THEMES[cat] || DEFAULT_CARD_THEME;
}

/** Returns a concise human-readable headline for a given NAQI category. */
export function getAqiHeadline(cat: string): string {
  return CATEGORY_HEADLINES[cat] || 'Current Air Quality';
}
