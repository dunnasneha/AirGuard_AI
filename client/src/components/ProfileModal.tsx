import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Briefcase,
  Users,
  Car,
  Home,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  CommuteMethod,
  IndoorEnvironment,
  LifestyleType,
  LocationInfo,
  OutdoorActivity,
  UserProfile,
} from '../types';
import { searchCities } from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const INDIAN_CITIES: LocationInfo[] = [
  { name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.385, longitude: 78.4867 },
  { name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.209 },
  { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.076, longitude: 72.8777 },
  { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', country: 'India', admin1: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
];

const LIFESTYLES: LifestyleType[] = [
  'Student',
  'Office worker',
  'Remote worker',
  'Outdoor worker',
  'Senior citizen',
  'Parent/family',
  'Fitness enthusiast',
];

const COMMUTES: CommuteMethod[] = [
  'Walking',
  'Bicycle',
  'Public transport',
  'Two-wheeler',
  'Car',
  'Work from home',
];

const ACTIVITIES: OutdoorActivity[] = [
  'Walking',
  'Running',
  'Cycling',
  'Sports',
  'None',
];

const INDOOR_OPTIONS: IndoorEnvironment[] = [
  'Air purifier',
  'Natural ventilation',
  'AC',
  'Closed windows',
  'Indoor plants',
  'No purifier',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'location' | 'lifestyle' | 'family' | 'commute' | 'indoor'>('location');

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setSearchResults([]);
      setCitySearchQuery('');
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

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchCities(citySearchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCity = (city: LocationInfo) => {
    setFormData((prev) => ({ ...prev, location: city }));
  };

  const toggleIndoorOption = (option: IndoorEnvironment) => {
    setFormData((prev) => {
      const current = prev.indoorEnvironment;
      if (current.includes(option)) {
        return { ...prev, indoorEnvironment: current.filter((x) => x !== option) };
      } else {
        return { ...prev, indoorEnvironment: [...current, option] };
      }
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
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
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close setup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs overflow-x-auto">
          {[
            { id: 'location', label: '1. Location', icon: MapPin },
            { id: 'lifestyle', label: '2. Lifestyle', icon: Briefcase },
            { id: 'family', label: '3. Family', icon: Users },
            { id: 'commute', label: '4. Commute & Outdoor', icon: Car },
            { id: 'indoor', label: '5. Indoor Air', icon: Home },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Tab 1: Location */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Your City
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {INDIAN_CITIES.map((city) => {
                    const isSelected = formData.location.name.toLowerCase() === city.name.toLowerCase();
                    return (
                      <button
                        key={city.name}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => selectCity(city)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{city.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search city */}
              <div className="pt-2">
                <label
                  htmlFor="city-global-search"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Or Search Any City Globally
                </label>
                <form onSubmit={handleCitySearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="city-global-search"
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder="e.g. Lucknow, Varanasi, London..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {searchResults.map((city) => (
                      <button
                        key={`${city.name}-${city.latitude}`}
                        onClick={() => selectCity(city)}
                        className="w-full p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {city.name}, {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                        </span>
                        <span className="text-[10px] text-slate-400">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
                Currently selected: <strong>{formData.location.name}, {formData.location.country}</strong>
              </div>
            </div>
          )}

          {/* Tab 2: Lifestyle */}
          {activeTab === 'lifestyle' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Primary Daily Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {LIFESTYLES.map((lifestyle) => {
                    const isSelected = formData.lifestyle === lifestyle;
                    return (
                      <button
                        key={lifestyle}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setFormData((prev) => ({ ...prev, lifestyle }))}
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
                        {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Family */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Specify who lives in your household to customize targeted health safety guidance:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'adults', label: 'Adults', desc: 'Standard resilience' },
                  { key: 'children', label: 'Children', desc: 'Higher breathing rate' },
                  { key: 'elderly', label: 'Elderly (65+)', desc: 'Cardiovascular care' },
                  { key: 'sensitive', label: 'Asthma / Sensitive', desc: 'Respiratory conditions' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-center"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block mb-2">{item.desc}</span>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.label} count`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            householdMembers: {
                              ...prev.householdMembers,
                              [item.key]: Math.max(0, prev.householdMembers[item.key as keyof typeof prev.householdMembers] - 1),
                            },
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-300"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-slate-900 dark:text-white">
                        {formData.householdMembers[item.key as keyof typeof formData.householdMembers]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.label} count`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            householdMembers: {
                              ...prev.householdMembers,
                              [item.key]: prev.householdMembers[item.key as keyof typeof prev.householdMembers] + 1,
                            },
                          }))
                        }
                        className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center hover:bg-emerald-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Commute & Outdoor */}
          {activeTab === 'commute' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Daily Commute Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMUTES.map((c) => {
                    const isSelected = formData.commuteMethod === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setFormData((prev) => ({ ...prev, commuteMethod: c }))}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200 font-bold'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Outdoor Activities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACTIVITIES.map((act) => {
                    const isSelected = formData.outdoorActivity === act;
                    return (
                      <button
                        key={act}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setFormData((prev) => ({ ...prev, outdoorActivity: act }))}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-500 dark:text-emerald-200 font-bold'
                            : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {act}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Indoor Air */}
          {activeTab === 'indoor' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Your Indoor Environment Features (Select all that apply)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INDOOR_OPTIONS.map((opt) => {
                  const isChecked = formData.indoorEnvironment.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleIndoorOption(opt)}
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
                        {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Note: Environmental science confirms that mechanical HEPA filtration is essential during winter smog; indoor plants offer aesthetic value but cannot meaningfully replace air purifiers.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formData.location.name} • {formData.lifestyle}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Save & Update Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
