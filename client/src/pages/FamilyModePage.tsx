import React, { useState } from 'react';
import {
  Users,
  Baby,
  User,
  Heart,
  ShieldAlert,
  Activity,
  Home,
  Car,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { EnvironmentalContext, UserProfile } from '../types';

interface FamilyModePageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
}

type FamilyMemberKey = 'child' | 'adult' | 'elderly' | 'sensitive';

export const FamilyModePage: React.FC<FamilyModePageProps> = ({ context, profile }) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMemberKey>('child');

  const memberTabs = [
    { id: 'child', label: 'Children (0–12)', count: profile.householdMembers.children, icon: Baby },
    { id: 'adult', label: 'Adults (18–60)', count: profile.householdMembers.adults, icon: User },
    { id: 'elderly', label: 'Seniors (65+)', count: profile.householdMembers.elderly, icon: Heart },
    { id: 'sensitive', label: 'Sensitive / Asthma', count: profile.householdMembers.sensitive, icon: ShieldAlert },
  ];

  const getGuidance = (key: FamilyMemberKey) => {
    const isSevere = context.airQuality.category === 'Severe' || context.airQuality.category === 'Very Poor';
    const isPoor = context.airQuality.category === 'Poor';

    switch (key) {
      case 'child':
        return {
          title: 'Child Respiratory Protection Protocol',
          whySpecial: 'Children inhale more air per pound of body weight than adults, and their developing lungs are more vulnerable to alveolar particulate deposition.',
          todayRecommendation: isSevere
            ? 'Transition all outdoor school physical activities to indoor rooms. Avoid early morning bus stops without an appropriately fitted pediatric N95 mask.'
            : isPoor
            ? 'Limit high-intensity outdoor playground runs to 30 minutes in the afternoon window (2:00 PM – 5:00 PM).'
            : 'Safe for normal outdoor school sports and park play.',
          outdoor: 'Reschedule morning outdoor soccer/running to afternoons when the inversion layer breaks.',
          indoor: 'Run bedroom air purifier continuously on medium/high during nap times and overnight sleep.',
          commute: 'If traveling by school bus or two-wheeler, ensure a tight-fitting KN95/N95 respirator covers both nose and mouth.',
        };
      case 'adult':
        return {
          title: 'Working Adult & Commuter Protocol',
          whySpecial: 'Adults experience highest cumulative roadside exposure during morning and evening rush hour gridlock.',
          todayRecommendation: isSevere
            ? 'Opt for work-from-home if feasible. If traveling, switch car AC to internal recirculation or take the metro.'
            : 'Use public transit or carpooling to reduce localized street-level exhaust in your neighborhood.',
          outdoor: `Time jogs or gym workouts to ${context.windows.bestOutdoorWindow.label}. Avoid strenuous cardio along heavy traffic corridors.`,
          indoor: 'Keep workspace air filtered and open windows only during the warmer afternoon mixing window.',
          commute: 'Avoid idling engine at traffic bottlenecks; take electrified metro or bus rapid transit.',
        };
      case 'elderly':
        return {
          title: 'Senior Citizen Cardiovascular Care',
          whySpecial: 'Fine particulate matter (PM2.5) causes systemic inflammation that can precipitate hypertension and cardiovascular events in older adults.',
          todayRecommendation: isSevere
            ? 'Avoid outdoor morning walks completely. Early morning winter smog is most hazardous to arterial health. Walk indoors inside filtered living areas.'
            : isPoor
            ? 'Postpone daily neighborhood walks until after 2:30 PM when ambient temperatures rise and smog disperses.'
            : 'Afternoon walks are acceptable. Keep well hydrated.',
          outdoor: 'Do not walk along roads before 10:00 AM. Ground inversion keeps heavy diesel soot at ground level.',
          indoor: 'Ensure bedroom HEPA purifier is placed away from drafts and near the bedside.',
          commute: 'Minimize public transit during crowded rush hours; prefer private travel in recirculated-air vehicles.',
        };
      case 'sensitive':
        return {
          title: 'Sensitive & Respiratory Care Protocol',
          whySpecial: 'Individuals with asthma, bronchitis, COPD, or allergic rhinitis experience bronchial hyper-reactivity at PM2.5 > 50 µg/m³.',
          todayRecommendation: isSevere
            ? 'Strictly stay indoors with certified HEPA filtration running. Ensure quick-relief prescribed inhalers are accessible and check peak expiratory flow if monitored.'
            : 'Pre-treat airways before essential outdoor movement as advised by your physician. Wear an N95 mask outdoors.',
          outdoor: 'Avoid outdoor exercise completely when AQI exceeds 200. Substitute with gentle indoor stretching.',
          indoor: 'Maintain clean indoor air (< 20 µg/m³ PM2.5). Avoid all kitchen frying fumes, scents, and aerosol sprays.',
          commute: 'Travel only in closed, air-conditioned transit with recirculation turned on.',
        };
    }
  };

  const guidance = getGuidance(selectedMember);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Family Air Safety
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Targeted protection protocols tailored to vulnerable family members in <strong>{context.location.name}</strong>.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {memberTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedMember === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedMember(tab.id as FamilyMemberKey)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200 shadow-md shadow-emerald-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {tab.count} in home
                </span>
              </div>
              <div className="font-bold text-xs">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* Main Guidance Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Targeted Air Guidance</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {guidance.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {guidance.whySpecial}
          </p>
        </div>

        {/* Today's Recommendation Banner */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>Today's Family Recommendation</span>
          </div>
          <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 leading-relaxed">
            {guidance.todayRecommendation}
          </p>
        </div>

        {/* 3 Pillars: Outdoor, Indoor, Commute */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Outdoor Recommendation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {guidance.outdoor}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <Home className="h-4 w-4 text-teal-600" />
              <span>Indoor Recommendation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {guidance.indoor}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <Car className="h-4 w-4 text-emerald-600" />
              <span>Commute Recommendation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {guidance.commute}
            </p>
          </div>
        </div>

        {/* Medical disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Important Health Notice:</strong> This assistant provides environmental air exposure mitigation guidance and does not replace medical consultation. Individuals with chronic asthma, cardiac conditions, or persistent respiratory symptoms should strictly consult their healthcare provider and adhere to official health authority alerts.
          </div>
        </div>
      </div>
    </div>
  );
};
