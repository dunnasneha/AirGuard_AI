import React, { useState, useEffect } from 'react';
import {
  Award,
  Flame,
  TrendingUp,
  Users,
} from 'lucide-react';
import { EnvironmentalContext, ImpactSummary, UserProfile } from '../types';
import { calculateImpactSummary, fetchCommunityStats } from '../services/api';
import { loadLoggedActions, loadIndoorChecklist, loadStreakDays } from '../utils/storage';

interface WeeklyProgressPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
  onNavigateToTab: (tab: string) => void;
}

export const WeeklyProgressPage: React.FC<WeeklyProgressPageProps> = ({
  context,
  profile,
  onNavigateToTab,
}) => {
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [community, setCommunity] = useState<any>(null);

  useEffect(() => {
    const actions = loadLoggedActions();
    const streak = loadStreakDays();
    calculateImpactSummary(actions, streak).then(setImpact).catch(() => {});
    fetchCommunityStats().then(setCommunity).catch(() => {});
  }, []);

  const checklist = loadIndoorChecklist();
  const completedChecklist = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Weekly AirWise Progress
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Gamified score based strictly on your logged choices, routines, and indoor defense habits.
        </p>
      </div>

      {/* Main Score Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 text-center md:text-left flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Circular / Badge score */}
            <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center border border-white/30 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Your Score</span>
              <span className="text-4xl font-black">{impact?.airWiseScore ?? 50}</span>
              <span className="text-[10px] opacity-80">out of 100</span>
            </div>
            <div>
              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-1">
                <Flame className="h-3.5 w-3.5 text-amber-300" />
                <span>{impact?.streakDays ?? loadStreakDays()}-Day Habit Streak</span>
              </div>
              <h2 className="text-xl font-bold">Excellent AirWise Citizen</h2>
              <p className="text-xs text-emerald-100 mt-1">
                Your actions contributed to reducing localized urban smog in {context.location.name}.
              </p>
            </div>
          </div>

          {/* Sub metrics */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] uppercase font-semibold text-emerald-100 block">Cleaner Choices</span>
              <span className="text-2xl font-bold">{impact?.actionsCompleted ?? 0}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <span className="text-[10px] uppercase font-semibold text-emerald-100 block">Avoided Trips</span>
              <span className="text-2xl font-bold">{impact?.totalTripsAvoided ?? 0}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-semibold text-emerald-100 block">Indoor Checklist</span>
              <span className="text-2xl font-bold">{completedChecklist}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* How to Improve Your Score */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span>How to Improve Your AirWise Score This Week</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              action: 'Choose Public Transit Once',
              pts: '+7 pts',
              desc: 'Replace one round-trip solo car ride with metro or bus.',
              tab: 'comparator',
            },
            {
              action: 'Complete Daily Indoor Checklist',
              pts: '+5 pts',
              desc: 'Verify kitchen venting, dust control, and sealed windows.',
              tab: 'indoor',
            },
            {
              action: 'Exercise in Better Outdoor Window',
              pts: '+5 pts',
              desc: `Shift physical activity to ${context.windows.bestOutdoorWindow.label}.`,
              tab: 'timeline',
            },
            {
              action: 'Combine Multiple Errand Trips',
              pts: '+6 pts',
              desc: 'Consolidate multiple cold engine trips into a single run.',
              tab: 'impact',
            },
          ].map((item) => (
            <div
              key={item.action}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {item.action}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    {item.pts}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button
                onClick={() => onNavigateToTab(item.tab)}
                className="text-xs text-emerald-600 font-bold hover:underline shrink-0 ml-3"
              >
                Go →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community View (Transparently labeled per requirements) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Community Air Actions
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Demo Community Activity
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Collective action by urban households in your region choosing cleaner transit and indoor defense.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Cleaner Commute Choices</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {community?.metrics?.cleanerChoices?.toLocaleString() || '1,240'}
            </div>
            <p className="text-[10px] text-slate-500">Metro, bus, cycling & carpool sessions</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Solo Car Trips Avoided</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {community?.metrics?.carTripsAvoided?.toLocaleString() || '680'}
            </div>
            <p className="text-[10px] text-slate-500">Directly reducing street canyon idle</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Indoor Checklists Completed</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {community?.metrics?.indoorChecklistsCompleted?.toLocaleString() || '430'}
            </div>
            <p className="text-[10px] text-slate-500">Certified safe indoor family zones</p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          Notice: Community numbers reflect sample anonymous activity benchmarks to encourage collective neighborhood smog reduction.
        </p>
      </div>
    </div>
  );
};
