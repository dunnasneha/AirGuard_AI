import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ComparatorResult, EnvironmentalContext, UserProfile } from '../types';
import { fetchOptionComparison } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

interface ComparatorPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
}

const COMPARISON_PRESETS = [
  { id: 'car_vs_public', label: 'Car vs Public Transport', optA: 'Driving Alone (Petrol Car)', optB: 'Electrified Public Transit (Metro / Bus)' },
  { id: 'car_vs_walking', label: 'Car vs Walking', optA: 'Short Car Drive (< 2km)', optB: 'Walking on Neighborhood Sidewalks' },
  { id: 'car_vs_cycling', label: 'Car vs Cycling', optA: 'Personal Vehicle Commute', optB: 'Cycling for Urban Commute' },
  { id: 'solo_vs_carpool', label: 'Solo Ride vs Carpool', optA: 'Single Occupancy Driving', optB: 'Carpooling with 3 Coworkers' },
  { id: 'delivery_vs_combined', label: 'Express Delivery vs Combined Trip', optA: 'Separate On-Demand Delivery Trips', optB: 'Single Consolidated Trip' },
  { id: 'individual_vs_transit', label: 'Ride Hailing vs Metro', optA: 'Solo Cab / Auto Ride', optB: 'Metro Transit System' },
];

export const ComparatorPage: React.FC<ComparatorPageProps> = ({ context, profile }) => {
  const [selectedPreset, setSelectedPreset] = useState(COMPARISON_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparatorResult | null>(null);

  useEffect(() => {
    loadComparison(selectedPreset.optA, selectedPreset.optB);
  }, [selectedPreset, context.location.name, context.airQuality.aqi]);

  const loadComparison = async (optA: string, optB: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOptionComparison(optA, optB, profile, context);
      setResult(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load option comparison. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Choose the Cleaner Option
          </h1>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Side-by-side comparison of urban transit and lifestyle choices grounded in live conditions for <strong>{context.location.name}</strong>.
        </p>
      </div>

      {/* Live Environmental & Profile Grounding Bar */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 dark:text-emerald-200">
        <span>
          Grounded in: <strong>AQI {context.airQuality.aqi} ({context.airQuality.category})</strong> • PM2.5 <strong>{context.airQuality.pm2_5} µg/m³</strong> • Wind <strong>{context.weather.windSpeed} km/h</strong>
        </span>
        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
          Profile: {profile.lifestyle} ({profile.commuteMethod})
        </span>
      </div>

      {/* Preset Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs" role="group" aria-label="Comparison scenarios">
        {COMPARISON_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={selectedPreset.id === preset.id}
            onClick={() => setSelectedPreset(preset)}
            className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all border ${
              selectedPreset.id === preset.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200 text-xs flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadComparison(selectedPreset.optA, selectedPreset.optB)}
            className="font-bold underline hover:no-underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      <div aria-live="polite">
        {loading ? (
          <div
            role="status"
            className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
          >
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Evaluating emissions and practicality...</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Side by side cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A (Conventional) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Conventional Choice
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    {result.optionA.relativeEmission}
                  </span>
                </div>

                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {result.optionA.title}
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Convenience:</span>
                    <span className="text-slate-700 dark:text-slate-300">{result.optionA.convenience}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Cost Indication:</span>
                    <span className="text-slate-700 dark:text-slate-300">{result.optionA.costIndication}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Environmental Footprint:</span>
                    <span className="text-rose-700 dark:text-rose-400">{result.optionA.environmentalBenefit}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Practicality:</span>
                    <span className="text-slate-700 dark:text-slate-300">{result.optionA.practicality}</span>
                  </div>
                </div>
              </div>

              {/* Option B (Cleaner) */}
              <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-md space-y-4 relative">
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-600 text-white shadow-sm flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Recommended</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Cleaner Alternative
                  </span>
                </div>

                <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {result.optionB.title}
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Convenience:</span>
                    <span className="text-slate-700 dark:text-slate-300">{result.optionB.convenience}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Cost Indication:</span>
                    <span className="text-slate-700 dark:text-slate-300">{result.optionB.costIndication}</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Environmental Benefit:</span>
                    <span className="text-emerald-900 dark:text-emerald-200 font-semibold">{result.optionB.environmentalBenefit}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Practicality:</span>
                    <span className="text-slate-700 dark:text-slate-300">{result.optionB.practicality}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GenAI Explanation: Why this choice matters */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Why This Choice Matters Today</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Model: {result.generatedBy === 'gemini' ? 'Google Gemini' : 'Adaptive Rule Engine'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                {result.recommendation}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {result.whyItMatters}
              </p>
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 border-t border-slate-100 dark:border-slate-800">
                <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Assumptions: {result.assumptions}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
