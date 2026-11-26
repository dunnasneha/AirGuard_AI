import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Briefcase, Users, Car, Home, Sparkles } from 'lucide-react';
import {
  HouseholdMembers,
  IndoorEnvironment,
  LocationInfo,
  UserProfile,
} from '../types';
import { ProfileLocationTab } from './profile/ProfileLocationTab';
import {
  ProfileCommuteTab,
  ProfileFamilyTab,
  ProfileIndoorTab,
  ProfileLifestyleTab,
} from './profile/ProfileOptionTabs';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

type ProfileTab = 'location' | 'lifestyle' | 'family' | 'commute' | 'indoor';

const PROFILE_TABS: { id: ProfileTab; label: string; icon: typeof MapPin }[] = [
  { id: 'location', label: '1. Location', icon: MapPin },
  { id: 'lifestyle', label: '2. Lifestyle', icon: Briefcase },
  { id: 'family', label: '3. Family', icon: Users },
  { id: 'commute', label: '4. Commute & Outdoor', icon: Car },
  { id: 'indoor', label: '5. Indoor Air', icon: Home },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [activeTab, setActiveTab] = useState<ProfileTab>('location');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      closeButtonRef.current?.focus();
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectCity = (location: LocationInfo) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleAdjustMember = (key: keyof HouseholdMembers, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      householdMembers: {
        ...prev.householdMembers,
        [key]: Math.max(0, prev.householdMembers[key] + delta),
      },
    }));
  };

  const handleToggleIndoor = (option: IndoorEnvironment) => {
    setFormData((prev) => {
      const exists = prev.indoorEnvironment.includes(option);
      return {
        ...prev,
        indoorEnvironment: exists
          ? prev.indoorEnvironment.filter((x) => x !== option)
          : [...prev.indoorEnvironment, option],
      };
    });
  };

  const handleSave = () => {
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="font-bold text-lg text-slate-900 dark:text-white">
                Location & Lifestyle Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize your urban pollution action plan
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close setup modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Profile configuration steps"
          className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs overflow-x-auto"
        >
          {PROFILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`profile-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`profile-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`profile-panel-${activeTab}`}
          aria-labelledby={`profile-tab-${activeTab}`}
          className="p-6 overflow-y-auto space-y-6 flex-1 text-sm"
        >
          {activeTab === 'location' && (
            <ProfileLocationTab selectedLocation={formData.location} onSelectCity={handleSelectCity} />
          )}
          {activeTab === 'lifestyle' && (
            <ProfileLifestyleTab
              selectedLifestyle={formData.lifestyle}
              onSelect={(lifestyle) => setFormData((prev) => ({ ...prev, lifestyle }))}
            />
          )}
          {activeTab === 'family' && (
            <ProfileFamilyTab
              householdMembers={formData.householdMembers}
              onAdjustMember={handleAdjustMember}
            />
          )}
          {activeTab === 'commute' && (
            <ProfileCommuteTab
              commuteMethod={formData.commuteMethod}
              outdoorActivity={formData.outdoorActivity}
              onSelectCommute={(commuteMethod) => setFormData((prev) => ({ ...prev, commuteMethod }))}
              onSelectActivity={(outdoorActivity) => setFormData((prev) => ({ ...prev, outdoorActivity }))}
            />
          )}
          {activeTab === 'indoor' && (
            <ProfileIndoorTab
              selectedIndoor={formData.indoorEnvironment}
              onToggleOption={handleToggleIndoor}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formData.location.name} • {formData.lifestyle}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save & Update Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
