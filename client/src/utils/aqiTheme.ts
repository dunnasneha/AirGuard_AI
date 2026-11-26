export interface AqiCardTheme {
  bg: string;
  border: string;
  badge: string;
  text: string;
  gradient: string;
}

export function getAqiBadgeColor(cat?: string): string {
  switch (cat) {
    case 'Good':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
    case 'Moderate':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
    case 'Poor':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700';
    case 'Very Poor':
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
    case 'Severe':
      return 'bg-red-900 text-white border-red-950 dark:bg-red-950 dark:text-red-200 dark:border-red-800';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

export function getAqiCardTheme(cat: string): AqiCardTheme {
  switch (cat) {
    case 'Good':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        border: 'border-emerald-200 dark:border-emerald-900',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-700 dark:text-emerald-300',
        gradient: 'from-emerald-500 to-teal-600',
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        border: 'border-amber-200 dark:border-amber-900',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-700 dark:text-amber-300',
        gradient: 'from-amber-500 to-orange-500',
      };
    case 'Poor':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        border: 'border-orange-200 dark:border-orange-900',
        badge: 'bg-orange-600 text-white',
        text: 'text-orange-700 dark:text-orange-300',
        gradient: 'from-orange-500 to-red-500',
      };
    case 'Very Poor':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        border: 'border-rose-200 dark:border-rose-900',
        badge: 'bg-rose-600 text-white',
        text: 'text-rose-700 dark:text-rose-300',
        gradient: 'from-rose-600 to-red-700',
      };
    case 'Severe':
      return {
        bg: 'bg-red-100 dark:bg-red-950/60',
        border: 'border-red-300 dark:border-red-800',
        badge: 'bg-red-900 text-white',
        text: 'text-red-900 dark:text-red-300',
        gradient: 'from-red-800 to-red-950',
      };
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-900',
        border: 'border-slate-200 dark:border-slate-800',
        badge: 'bg-slate-600 text-white',
        text: 'text-slate-700 dark:text-slate-300',
        gradient: 'from-slate-600 to-slate-800',
      };
  }
}
