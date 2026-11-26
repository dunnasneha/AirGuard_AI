import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { EnvironmentalContext, ImpactSummary, UserProfile } from '../types';
import { calculateImpactSummary } from '../services/api';
import { loadLoggedActions, saveLoggedActions, loadStreakDays } from '../utils/storage';

interface ImpactPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
}

const ACTION_OPTIONS = [
  {
    id: 'public_transport',
    label: 'Took Metro / Public Transit',
    desc: 'Switched from a solo car drive to public transit (saves ~1.5 kg CO2)',
    category: 'Commute',
  },
  {
    id: 'cycling_walking',
    label: 'Bicycled or Walked Local Errand',
    desc: 'Replaced a cold engine car start for trips under 3km',
    category: 'Commute',
  },
  {
    id: 'carpool',
    label: 'Carpool with Neighbors or Colleagues',
    desc: 'Shared vehicle journey (halves per-passenger emissions)',
    category: 'Commute',
  },
  {
    id: 'work_from_home',
    label: 'Worked from Home on Smog Day',
    desc: 'Completely eliminated round-trip peak rush hour travel',
    category: 'Lifestyle',
  },
  {
    id: 'combine_errands',
    label: 'Combined Multiple Errands into 1 Trip',
    desc: 'Avoided multiple cold start engine trips across town',
    category: 'Lifestyle',
  },
  {
    id: 'indoor_purifier_timed',
    label: 'Timed HEPA Purifier to Morning Inversion',
    desc: 'Filtered indoor air during peak ground pollution spike',
    category: 'Indoor',
  },
];

export const ImpactPage: React.FC<ImpactPageProps> = ({ context, profile }) => {
  const [selectedActions, setSelectedActions] = useState<string[]>(loadLoggedActions());
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recalcImpact(selectedActions);
  }, []);

  const recalcImpact = async (actions: string[]) => {
    setLoading(true);
    try {
      const data = await calculateImpactSummary(actions, loadStreakDays());
      setSummary(data);
    } catch (err) {
      console.warn('Failed to calculate impact:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (id: string) => {
    const updated = selectedActions.includes(id)
      ? selectedActions.filter((a) => a !== id)
      : [...selectedActions, id];

    setSelectedActions(updated);
    saveLoggedActions(updated);
    recalcImpact(updated);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Your Choice → Your Impact
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Calculate estimated emission savings and personal exposure reduction from your everyday actions in <strong>{context.location.name}</strong>.
        </p>
      </div>

      {/* Impact Metric Cards */}
      {summary && (
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity ${loading ? 'opacity-70' : 'opacity-100'}`}>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-85">
              Estimated CO₂ Prevented
            </span>
            <div className="text-4xl font-black">{summary.totalCo2SavedKg} kg</div>
            <p className="text-[11px] opacity-80 pt-1">
              Based on CPCB & ICCT standard passenger vehicle emission factors
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Solo Car Trips Avoided
            </span>
            <div className="text-4xl font-black text-slate-900 dark:text-white">
              {summary.totalTripsAvoided}
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Fewer vehicles in urban street corridors lowers localized NOx
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Personal Exposure Cut
            </span>
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
              ~{summary.estimatedExposureCutPercent}%
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Estimated respiratory particulate defense achieved by your habits
            </p>
          </div>
        </div>
      )}

      {/* Select Actions Interactive Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Select Your Cleaner Choices (Active This Week)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click to toggle choices. Your impact updates in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {ACTION_OPTIONS.map((item) => {
            const isSelected = selectedActions.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleAction(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                    <span className="font-bold text-xs">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    {item.desc}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assumptions Box per requirements */}
      {summary && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2 font-bold text-slate-800 dark:text-slate-200">
            <Info className="h-4 w-4 text-emerald-600" />
            <span>Calculation Assumptions & Disclosures</span>
          </div>
          <p className="leading-relaxed">
            This estimate is based on the selected assumptions and published transportation benchmarks. These values represent mathematical models, not exact real-world lab measurements.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            {summary.assumptions.map((assump, idx) => (
              <li key={idx}>{assump}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
