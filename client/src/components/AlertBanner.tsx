import React from 'react';
import { AlertTriangle, AlertCircle, Info, Sparkles, Clock, CheckCircle2, LucideIcon } from 'lucide-react';
import { EnvironmentalContext } from '../types';

interface AlertBannerProps {
  context: EnvironmentalContext | null;
  onNavigateToPlan?: () => void;
}

interface AlertSeverityConfig {
  containerClass: string;
  icon: LucideIcon;
  iconClass: string;
  title: string;
  bodyPrefix: string;
  windowLabel: string;
  buttonClass: string;
  buttonLabel: string;
  subTextClass: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ context, onNavigateToPlan }) => {
  if (!context) return null;

  const { airQuality, windows, isDemo, demoNotice, location } = context;
  const isSevere = airQuality.category === 'Severe' || airQuality.category === 'Very Poor';
  const isPoor = airQuality.category === 'Poor';

  const alertConfig: AlertSeverityConfig | null = isSevere
    ? {
        containerClass:
          'bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200',
        icon: AlertTriangle,
        iconClass: 'h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5',
        title: `Severe Winter Smog Warning in ${location.name} (AQI ${airQuality.aqi} — ${airQuality.category})`,
        bodyPrefix:
          'Stagnant ground inversion is trapping high particulate concentrations. Outdoor activity may need to be postponed.',
        windowLabel: 'Best window today',
        buttonClass:
          'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600',
        buttonLabel: 'Get AI Family Action Plan',
        subTextClass: 'text-rose-800 dark:text-rose-300',
      }
    : isPoor
      ? {
          containerClass:
            'bg-orange-50 border border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-200',
          icon: AlertCircle,
          iconClass: 'h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5',
          title: `Air quality is currently poor in ${location.name} (AQI ${airQuality.aqi})`,
          bodyPrefix:
            'Vulnerable family members should limit prolonged heavy outdoor workouts.',
          windowLabel: 'Safer window',
          buttonClass:
            'bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600',
          buttonLabel: 'View Recommendations',
          subTextClass: 'text-orange-800 dark:text-orange-300',
        }
      : null;

  const AlertIcon = alertConfig?.icon;

  return (
    <div className="space-y-2 mb-6">
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
            <span>{demoNotice || 'Demo data — connect live APIs for current conditions.'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
            Demo Mode
          </span>
        </div>
      )}

      {alertConfig && AlertIcon ? (
        <div
          className={`${alertConfig.containerClass} px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm`}
        >
          <div className="flex items-start space-x-3">
            <AlertIcon className={alertConfig.iconClass} aria-hidden="true" />
            <div>
              <p className="font-bold text-sm">{alertConfig.title}</p>
              <p className={`text-xs ${alertConfig.subTextClass} mt-0.5`}>
                {alertConfig.bodyPrefix} {alertConfig.windowLabel}: <strong>{windows.bestOutdoorWindow.label}</strong>.
              </p>
            </div>
          </div>
          {onNavigateToPlan && (
            <button
              type="button"
              onClick={onNavigateToPlan}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold ${alertConfig.buttonClass} transition-colors shrink-0 shadow-sm`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{alertConfig.buttonLabel}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>
              Air quality in {location.name} is {airQuality.category} (AQI {airQuality.aqi}). Great conditions for natural ventilation and active travel.
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Best window: {windows.bestOutdoorWindow.label}</span>
          </div>
        </div>
      )}
    </div>
  );
};
