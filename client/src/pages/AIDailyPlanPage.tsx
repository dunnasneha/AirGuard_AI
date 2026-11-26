import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Car,
  Briefcase,
  Activity,
  Moon,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';
import { AIDailyPlan, EnvironmentalContext, PlanAction, UserProfile } from '../types';
import { fetchAIDailyPlan } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

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

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'Morning':
        return Sun;
      case 'Commute':
        return Car;
      case 'Work/Study':
        return Briefcase;
      case 'Outdoor activity':
        return Activity;
      case 'Evening':
        return Clock;
      case 'Night':
        return Moon;
      default:
        return Sparkles;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Challenging':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Generate CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white shadow-lg">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Google Gemini Generative AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Personalized Daily Pollution Action Plan
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Tailored specifically for your <strong>{profile.lifestyle}</strong> routine in <strong>{context.location.name}</strong>, factoring today's AQI ({context.airQuality.aqi}) and weather.
          </p>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={loading}
          className="px-6 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center justify-center space-x-2 disabled:opacity-75 self-start sm:self-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Synthesizing Plan...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>{plan ? 'Regenerate My Action Plan' : 'Generate My AI Action Plan'}</span>
            </>
          )}
        </button>
      </div>

      {/* Grounding Strip: Measured Environmental & Household Inputs */}
      <div
        aria-label="Live environmental and profile inputs used for plan generation"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
      >
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Measured Air Quality
          </span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            AQI {context.airQuality.aqi} ({context.airQuality.category})
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Particulates
          </span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            PM2.5 {context.airQuality.pm2_5} µg/m³ • {context.airQuality.dominantPollutant}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Weather & Dispersion
          </span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {context.weather.temperature}°C • Wind {context.weather.windSpeed} km/h
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Household & Commute
          </span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {profile.lifestyle} • {profile.commuteMethod}
          </span>
        </div>
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

      {/* Plan Content */}
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
            Analyzing PM2.5 concentrations, thermal inversion windows, and your {profile.commuteMethod.toLowerCase()} commute to generate high-impact, low-emission actions.
          </p>
        </div>
      ) : plan ? (
        <div className="space-y-8">
          {/* Summary & Distinction Box */}
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

          {/* Structured Actions: 6 Periods */}
          <div>
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
              Schedule & Actions (What, Why, Impact, What Next)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(plan.actions || []).map((act: PlanAction) => {
                const Icon = getTimeIcon(act.time);
                return (
                  <div
                    key={act.time}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      {/* Period Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                            {act.time}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getDifficultyBadge(
                            act.difficulty
                          )}`}
                        >
                          {act.difficulty}
                        </span>
                      </div>

                      {/* WHAT */}
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Action (What):
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                          {act.action}
                        </p>
                      </div>

                      {/* WHY */}
                      <div className="space-y-1 mt-2.5">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Why It Matters:
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {act.reason}
                        </p>
                      </div>

                      {/* IMPACT */}
                      <div className="space-y-1 mt-2.5">
                        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                          <Zap className="h-3 w-3" aria-hidden="true" />
                          <span>Pollution Impact:</span>
                        </div>
                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                          {act.impact}
                        </p>
                      </div>
                    </div>

                    {/* WHAT TO DO NEXT */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Next Step:</span>
                      <span>{act.whatNext}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Structured Guidance Blocks: Indoor, Commute, Family */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Indoor Air Quality
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(plan.indoor_guidance || []).map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Low-Emission Commute
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(plan.commute_guidance || []).map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Family & Sensitive Members
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {(plan.family_guidance || []).map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sustainability Tip & Medical Safety Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <Award className="h-4 w-4" />
                <span>Today's Sustainability Habit</span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                {plan.sustainability_tip}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span>Health & Safety Guidance</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {plan.safety_note}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="font-bold text-base text-slate-800 dark:text-white">
            Ready to Generate Your Custom Plan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click "Generate My AI Action Plan" above to create an hour-by-hour breakdown combining live air quality with your family's daily routine.
          </p>
        </div>
      )}
      </div>
    </div>
  );
};
