import React from 'react';
import { AlertTriangle, AlertCircle, Info, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { EnvironmentalContext } from '../types';

interface AlertBannerProps {
  context: EnvironmentalContext | null;
  onNavigateToPlan?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ context, onNavigateToPlan }) => {
  if (!context) return null;

  const { airQuality, windows, isDemo, demoNotice } = context;
  const isSevere = airQuality.category === 'Severe' || airQuality.category === 'Very Poor';
  const isPoor = airQuality.category === 'Poor';

  return (
    <div className="space-y-2 mb-6">
      {/* Demo Mode Notice if live API fell back */}
      {isDemo && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{demoNotice || 'Demo data — connect live APIs for current conditions.'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
            Demo Mode
          </span>
        </div>
      )}

      {/* Threshold-driven pollution alert */}
      {isSevere ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                Severe Winter Smog Warning in {context.location.name} (AQI {airQuality.aqi} — {airQuality.category})
              </p>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                Stagnant ground inversion is trapping high particulate concentrations. Outdoor activity may need to be postponed. Best window today: <strong>{windows.bestOutdoorWindow.label}</strong>.
              </p>
            </div>
          </div>
          {onNavigateToPlan && (
            <button
              onClick={onNavigateToPlan}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600 transition-colors shrink-0 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get AI Family Action Plan</span>
            </button>
          )}
        </div>
      ) : isPoor ? (
        <div className="bg-orange-50 border border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-200 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                Air quality is currently poor in {context.location.name} (AQI {airQuality.aqi})
              </p>
              <p className="text-xs text-orange-800 dark:text-orange-300 mt-0.5">
                Vulnerable family members should limit prolonged heavy outdoor workouts. Safer window: <strong>{windows.bestOutdoorWindow.label}</strong>.
              </p>
            </div>
          </div>
          {onNavigateToPlan && (
            <button
              onClick={onNavigateToPlan}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors shrink-0 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>View Recommendations</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Air quality in {context.location.name} is {airQuality.category} (AQI {airQuality.aqi}). Great conditions for natural ventilation and active travel.</span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Clock className="h-3.5 w-3.5" />
            <span>Best window: {windows.bestOutdoorWindow.label}</span>
          </div>
        </div>
      )}
    </div>
  );
};
