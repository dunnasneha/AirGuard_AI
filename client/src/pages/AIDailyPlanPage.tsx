import React, { useState } from 'react';
import { Sparkles, ShieldAlert, AlertCircle, RefreshCw, Award } from 'lucide-react';
import { AIDailyPlan, EnvironmentalContext, PlanAction, UserProfile } from '../types';
import { fetchAIDailyPlan } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';
import { GuidanceListCard, PlanActionCard } from '../components/plan/PlanActionCard';

interface AIDailyPlanPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
  plan: AIDailyPlan | null;
  onPlanGenerated: (plan: AIDailyPlan) => void;
}

export const AIDailyPlanPage: React.FC<AIDailyPlanPageProps> = ({
  context,
  profile,
  plan,
  onPlanGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const generated = await fetchAIDailyPlan(profile, context);
      onPlanGenerated(generated);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to generate plan. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const groundingItems = [
    {
      label: 'Measured Air Quality',
      value: `AQI ${context.airQuality.aqi} (${context.airQuality.category})`,
    },
    {
      label: 'Particulates',
      value: `PM2.5 ${context.airQuality.pm2_5} µg/m³ • ${context.airQuality.dominantPollutant}`,
    },
    {
      label: 'Weather & Dispersion',
      value: `${context.weather.temperature}°C • Wind ${context.weather.windSpeed} km/h`,
    },
    {
      label: 'Household & Commute',
      value: `${profile.lifestyle} • ${profile.commuteMethod}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Google Gemini Generative AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized Daily Pollution Action Plan
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Tailored specifically for your <strong>{profile.lifestyle}</strong> routine in{' '}
            <strong>{context.location.name}</strong>, factoring today's AQI ({context.airQuality.aqi}) and weather.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGeneratePlan}
          disabled={loading}
          className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center justify-center space-x-2 disabled:opacity-75 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" aria-hidden="true" />
              <span>Synthesizing Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              <span>{plan ? 'Regenerate My Action Plan' : 'Generate My AI Action Plan'}</span>
            </>
          )}
        </button>
      </div>

      <div
        aria-label="Live environmental and profile inputs used for plan generation"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
      >
        {groundingItems.map((item) => (
          <div
            key={item.label}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {item.label}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200 text-xs flex items-center space-x-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div aria-live="polite">
        {loading ? (
          <div
            role="status"
            className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
          >
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <h2 className="font-bold text-base text-slate-800 dark:text-white">
              Connecting Environmental Context with Gemini...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Analyzing PM2.5 concentrations, thermal inversion windows, and your{' '}
              {profile.commuteMethod.toLowerCase()} commute to generate high-impact, low-emission actions.
            </p>
          </div>
        ) : plan ? (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>Today's AirWise Plan Overview</span>
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Model: {plan.generatedBy === 'gemini' ? 'Google Gemini' : 'Adaptive Rule Engine'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(plan.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {plan.summary}
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Meteorological Context:</strong> {plan.air_quality_explanation}
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                Schedule & Actions (What, Why, Impact, What Next)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(plan.actions || []).map((act: PlanAction) => (
                  <PlanActionCard key={act.time} actionItem={act} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GuidanceListCard title="Indoor Air Quality" items={plan.indoor_guidance || []} accentColor="emerald" />
              <GuidanceListCard title="Low-Emission Commute" items={plan.commute_guidance || []} accentColor="teal" />
              <GuidanceListCard
                title="Family & Sensitive Members"
                items={plan.family_guidance || []}
                accentColor="emerald"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  <span>Today's Sustainability Habit</span>
                </div>
                <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                  {plan.sustainability_tip}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <ShieldAlert className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <span>Health & Safety Guidance</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {plan.safety_note}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="font-bold text-base text-slate-800 dark:text-white">
              Ready to Generate Your Custom Plan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Click "Generate My AI Action Plan" above to create an hour-by-hour breakdown combining live air quality
              with your family's daily routine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
