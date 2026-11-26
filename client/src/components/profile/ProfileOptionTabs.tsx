import React from 'react';
import { Check } from 'lucide-react';
import {
  CommuteMethod,
  HouseholdMembers,
  IndoorEnvironment,
  LifestyleType,
  OutdoorActivity,
  UserProfile,
} from '../../types';
import {
  COMMUTE_OPTIONS,
  HOUSEHOLD_GROUP_OPTIONS,
  INDOOR_ENVIRONMENT_OPTIONS,
  LIFESTYLE_OPTIONS,
  OUTDOOR_ACTIVITY_OPTIONS,
} from '../../constants/profileOptions';

interface ProfileLifestyleTabProps {
  selectedLifestyle: LifestyleType;
  onSelect: (lifestyle: LifestyleType) => void;
}

export const ProfileLifestyleTab: React.FC<ProfileLifestyleTabProps> = ({
  selectedLifestyle,
  onSelect,
}) => (
  <div className="space-y-4">
    <div>
      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
        Primary Daily Profile
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {LIFESTYLE_OPTIONS.map((lifestyle) => {
          const isSelected = selectedLifestyle === lifestyle;
          return (
            <button
              key={lifestyle}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(lifestyle)}
              className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <div className="font-bold">{lifestyle}</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                  Tailors commute & daily timing
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

interface ProfileFamilyTabProps {
  householdMembers: HouseholdMembers;
  onAdjustMember: (key: keyof HouseholdMembers, delta: number) => void;
}

export const ProfileFamilyTab: React.FC<ProfileFamilyTabProps> = ({
  householdMembers,
  onAdjustMember,
}) => (
  <div className="space-y-4">
    <p className="text-xs text-slate-600 dark:text-slate-400">
      Specify who lives in your household to customize targeted health safety guidance:
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {HOUSEHOLD_GROUP_OPTIONS.map((item) => (
        <div
          key={item.key}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center"
        >
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {item.label}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-2">{item.desc}</span>
          <div className="flex items-center justify-center space-x-2">
            <button
              type="button"
              aria-label={`Decrease ${item.label} count`}
              onClick={() => onAdjustMember(item.key, -1)}
              className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-300"
            >
              -
            </button>
            <span className="text-sm font-bold w-6 text-center text-slate-900 dark:text-white">
              {householdMembers[item.key]}
            </span>
            <button
              type="button"
              aria-label={`Increase ${item.label} count`}
              onClick={() => onAdjustMember(item.key, 1)}
              className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-700"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface ProfileCommuteTabProps {
  commuteMethod: CommuteMethod;
  outdoorActivity: OutdoorActivity;
  onSelectCommute: (commute: CommuteMethod) => void;
  onSelectActivity: (activity: OutdoorActivity) => void;
}

export const ProfileCommuteTab: React.FC<ProfileCommuteTabProps> = ({
  commuteMethod,
  outdoorActivity,
  onSelectCommute,
  onSelectActivity,
}) => (
  <div className="space-y-4">
    <div>
      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
        Daily Commute Method
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {COMMUTE_OPTIONS.map((commute) => {
          const isSelected = commuteMethod === commute;
          return (
            <button
              key={commute}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectCommute(commute)}
              className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200 font-bold'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              {commute}
            </button>
          );
        })}
      </div>
    </div>

    <div>
      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
        Outdoor Activities
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {OUTDOOR_ACTIVITY_OPTIONS.map((activity) => {
          const isSelected = outdoorActivity === activity;
          return (
            <button
              key={activity}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectActivity(activity)}
              className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200 font-bold'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              {activity}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

interface ProfileIndoorTabProps {
  selectedIndoor: UserProfile['indoorEnvironment'];
  onToggleOption: (option: IndoorEnvironment) => void;
}

export const ProfileIndoorTab: React.FC<ProfileIndoorTabProps> = ({
  selectedIndoor,
  onToggleOption,
}) => (
  <div className="space-y-4">
    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
      Select Your Indoor Environment Features (Select all that apply)
    </span>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {INDOOR_ENVIRONMENT_OPTIONS.map((opt) => {
        const isChecked = selectedIndoor.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            role="checkbox"
            aria-checked={isChecked}
            onClick={() => onToggleOption(opt)}
            className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
              isChecked
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{opt}</span>
            <div
              className={`w-4 h-4 rounded flex items-center justify-center border ${
                isChecked
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {isChecked && <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />}
            </div>
          </button>
        );
      })}
    </div>
    <p className="text-[11px] text-slate-500 dark:text-slate-400">
      Note: Environmental science confirms that mechanical HEPA filtration is essential during winter smog; indoor plants offer aesthetic value but cannot meaningfully replace air purifiers.
    </p>
  </div>
);
