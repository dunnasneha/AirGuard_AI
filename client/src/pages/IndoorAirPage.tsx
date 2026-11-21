import React, { useState } from 'react';
import {
  Wind,
  ShieldCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  Flame,
  UtensilsCrossed,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';
import { EnvironmentalContext, UserProfile } from '../types';
import { loadIndoorChecklist, saveIndoorChecklist } from '../utils/storage';

interface IndoorAirPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
  onChecklistUpdated?: () => void;
}

export const IndoorAirPage: React.FC<IndoorAirPageProps> = ({
  context,
  profile,
  onChecklistUpdated,
}) => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(loadIndoorChecklist());

  const toggleCheck = (key: string) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    saveIndoorChecklist(updated);
    if (onChecklistUpdated) onChecklistUpdated();
  };

  const isHighOutdoor = context.airQuality.category === 'Severe' || context.airQuality.category === 'Very Poor' || context.airQuality.category === 'Poor';

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Wind className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Indoor Air Quality Hub
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Practical indoor defense hacks tailored to outdoor smog in <strong>{context.location.name}</strong> (AQI {context.airQuality.aqi} — {context.airQuality.category}).
        </p>
      </div>

      {/* Ventilation Rule Banner */}
      <div
        className={`p-6 rounded-3xl border ${
          isHighOutdoor
            ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800'
            : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
        } space-y-2`}
      >
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>Dynamic Ventilation Directive</span>
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          {isHighOutdoor
            ? 'Limit Window Opening — Prioritize Mechanical HEPA Filtration'
            : 'Good Conditions for Fresh Air Cross-Ventilation'}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isHighOutdoor
            ? `Outdoor PM2.5 is currently elevated (${context.airQuality.pm2_5} µg/m³). Keep perimeter windows and balconies closed during morning inversion (${context.windows.peakPollutionWindow.label}). If fresh air exchange is needed, open windows briefly only between ${context.windows.bestOutdoorWindow.label}.`
            : `Outdoor particulate levels are low. Open windows for 20-30 minutes during midday to flush out carbon dioxide and indoor VOCs.`}
        </p>
      </div>

      {/* Practical Hacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cooking Ventilation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Cooking Smoke Isolation
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Oil frying and tadka seasoning generate ultrafine PM2.5 spikes up to 400 µg/m³ inside the home. Always operate the kitchen chimney / exhaust fan on high and close interior kitchen doors.
          </p>
        </div>

        {/* Avoid Combustion */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Avoid Unnecessary Combustion
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Eliminate indoor incense sticks (agarbatti), mosquito coils, scented paraffin candles, and unvented heaters. These directly release benzene, formaldehyde, and respirable black carbon.
          </p>
        </div>

        {/* Dust Control */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Wet Mopping & Dust Trap
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Dry sweeping with brooms kicks settled toxic heavy metal particles back into the breathing zone. Use a damp microfiber mop and place rubber door seals at entry doorways.
          </p>
        </div>
      </div>

      {/* Houseplant scientific truth note */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-200">Scientific Clarification on Houseplants:</strong> While indoor plants (like snake plants and areca palms) enhance humidity and aesthetic well-being, peer-reviewed atmospheric studies demonstrate that houseplants alone cannot meaningfully filter fine particulate matter (PM2.5) during severe urban smog episodes. Certified True HEPA (H13) filtration remains essential.
        </div>
      </div>

      {/* Interactive Quick Indoor Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Quick Indoor Safety Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check off daily habits to protect your indoor breathing zone and boost your AirWise Score.
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
            {completedCount} of {totalCount} Completed
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'smoke',
              label: 'Avoided indoor smoke, incense, and mosquito coils today',
              desc: 'Prevents direct emission of fine soot and volatile organic compounds inside living rooms.',
            },
            {
              key: 'kitchen',
              label: 'Used kitchen exhaust / range hood and closed interior doors during cooking',
              desc: 'Intercepts hot oil droplets and combustion aerosol before it circulates.',
            },
            {
              key: 'dust',
              label: 'Cleaned surfaces using a damp microfiber cloth instead of dry sweeping',
              desc: 'Traps fine particulate matter rather than kicking it back into the breathing line.',
            },
            {
              key: 'purifier',
              label: 'Inspected air purifier filter & ensured pre-filter is clean of lint',
              desc: 'Ensures optimal Clean Air Delivery Rate (CADR) and lower electricity draw.',
            },
            {
              key: 'sensor',
              label: 'Checked bedroom doorway draft seals and window latches',
              desc: 'Stops nocturnal cold smog drafts from penetrating sleeping quarters.',
            },
          ].map((item) => {
            const isChecked = checklist[item.key] || false;
            return (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start space-x-3.5 ${
                  isChecked
                    ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <span
                    className={`text-xs font-bold block ${
                      isChecked
                        ? 'text-slate-900 dark:text-white line-through opacity-80'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
