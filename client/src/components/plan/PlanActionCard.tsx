import React from 'react';
import {
  Activity,
  Briefcase,
  Car,
  CheckCircle2,
  Clock,
  Moon,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { PlanAction } from '../../types';

const TIME_ICON_MAP: Record<string, typeof Sparkles> = {
  Morning: Sun,
  Commute: Car,
  'Work/Study': Briefcase,
  'Outdoor activity': Activity,
  Evening: Clock,
  Night: Moon,
};

const DIFFICULTY_BADGE_MAP: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Challenging: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

interface PlanActionCardProps {
  actionItem: PlanAction;
}

export const PlanActionCard: React.FC<PlanActionCardProps> = ({ actionItem }) => {
  const Icon = TIME_ICON_MAP[actionItem.time] || Sparkles;
  const badgeClass =
    DIFFICULTY_BADGE_MAP[actionItem.difficulty] ||
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              {actionItem.time}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {actionItem.difficulty}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Action (What):
          </div>
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
            {actionItem.action}
          </p>
        </div>

        <div className="space-y-1 mt-2.5">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Why It Matters:
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {actionItem.reason}
          </p>
        </div>

        <div className="space-y-1 mt-2.5">
          <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
            <Zap className="h-3 w-3" aria-hidden="true" />
            <span>Pollution Impact:</span>
          </div>
          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            {actionItem.impact}
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
        <span className="font-bold text-slate-700 dark:text-slate-300">Next Step:</span>
        <span>{actionItem.whatNext}</span>
      </div>
    </div>
  );
};

interface GuidanceListCardProps {
  title: string;
  items: string[];
  accentColor?: 'emerald' | 'teal';
}

export const GuidanceListCard: React.FC<GuidanceListCardProps> = ({
  title,
  items,
  accentColor = 'emerald',
}) => {
  const iconColor = accentColor === 'teal' ? 'text-teal-500' : 'text-emerald-500';
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
        {title}
      </h3>
      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start space-x-2">
            <CheckCircle2 className={`h-3.5 w-3.5 ${iconColor} shrink-0 mt-0.5`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
