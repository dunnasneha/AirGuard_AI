import React from 'react';
import {
  Wind,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  ArrowRight,
  Sun,
  Activity,
  CheckCircle,
  Users,
  Compass,
  Zap,
} from 'lucide-react';
import { EnvironmentalContext, UserProfile } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onExplore: () => void;
  context: EnvironmentalContext | null;
  profile: UserProfile;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onExplore,
  context,
  profile,
}) => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-12 sm:pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl -z-10 rounded-full pointer-events-none" />

        {/* Tagline badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>GenAI Urban Pollution Decision Support</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Know Your Air.{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
            Protect Your Day.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AirWise AI combines air-quality data, weather conditions and GenAI to help your family make smarter everyday decisions during urban pollution and winter smog.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 text-base transition-all group"
          >
            <span>Check My Air</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
          >
            Explore How It Works
          </button>
        </div>

        {/* Live snapshot banner preview */}
        {context && (
          <div className="mt-12 p-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xl max-w-2xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                  {context.airQuality.aqi}
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Live Conditions in {context.location.name}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{context.airQuality.category} Air Quality</span>
                    <span className="text-xs font-normal text-slate-400">
                      • PM2.5: {context.airQuality.pm2_5} µg/m³
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onStart}
                className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-xl text-xs font-bold transition-colors"
              >
                Open Full Dashboard →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Intelligent Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            How AirWise AI Protects Your Household
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm">
            Not just a static number. A complete decision-support system that translates meteorological data into daily action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Ingest Real-Time Data',
              desc: 'Pulls hourly PM2.5, PM10, ozone, wind speed, and thermal inversion data from Open-Meteo environmental models without guessing.',
              icon: Wind,
            },
            {
              step: '02',
              title: 'Contextualize to Your Lifestyle',
              desc: 'Considers whether you are a student, commuter, parent, or senior citizen, accounting for household vulnerabilities and commute choices.',
              icon: Users,
            },
            {
              step: '03',
              title: 'GenAI Action Plan & Impact',
              desc: 'Gemini synthesizes a personalized schedule: optimal outdoor workout window, timed ventilation, cleaner transit options, and calculated CO2 savings.',
              icon: Sparkles,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="text-5xl font-black text-slate-100 dark:text-slate-800/80 absolute top-4 right-6 pointer-events-none">
                  {item.step}
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Comprehensive Platform
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Tailored Tools for Every Part of Your Day
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Hourly Pollution Windows',
              desc: 'Identifies the precise afternoon window when sunlight dilutes ground smog, and warns against morning thermal inversion.',
              icon: Sun,
            },
            {
              title: 'GenAI Personalized Plan',
              desc: 'Structured morning, commute, work, outdoor, and evening recommendations with clear WHAT, WHY, and IMPACT answers.',
              icon: Sparkles,
            },
            {
              title: 'Low-Emission Comparator',
              desc: 'Compare solo driving vs metro vs cycling on emissions, cost, and time before heading out the door.',
              icon: TrendingDown,
            },
            {
              title: 'Indoor Air Quality Hacks',
              desc: 'Actionable ventilation rules, cooking exhaust protocols, filter maintenance, and interactive checklist.',
              icon: ShieldCheck,
            },
            {
              title: 'Dedicated Family Mode',
              desc: 'Age-appropriate guidance for children (higher breathing rate), seniors (cardiovascular care), and asthma sensitivities.',
              icon: Users,
            },
            {
              title: 'Transparent Impact & Score',
              desc: 'Track estimated CO2 reduced, trips avoided, and build your weekly AirWise streak score based on real actions.',
              icon: Zap,
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{feat.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Air Quality Matters Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Science & Winter Smog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Winter Smog Requires Smarter Daily Habits
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              During Indian winter months, calm winds and cold nocturnal ground temperatures create a ceiling known as a <strong>thermal inversion</strong>. Instead of dispersing upward, vehicle exhaust, construction dust, and biomass burning are trapped near street level.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  <strong>PM2.5 particles</strong> penetrate deep into alveoli and bloodstream; timing activity saves lung exposure.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  <strong>Choosing transit</strong> eliminates high-concentration tailpipe exhaust in neighborhood street canyons.
                </span>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={onStart}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                Setup My Household Profile →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
