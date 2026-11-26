import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import { LocationInfo } from '../../types';
import { searchCities } from '../../services/api';
import { PRESET_CITIES } from '../../constants/profileOptions';

interface ProfileLocationTabProps {
  selectedLocation: LocationInfo;
  onSelectCity: (city: LocationInfo) => void;
}

export const ProfileLocationTab: React.FC<ProfileLocationTabProps> = ({
  selectedLocation,
  onSelectCity,
}) => {
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = citySearchQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchFeedback(null);
    try {
      const results = await searchCities(trimmed);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchFeedback(`No matching cities found for "${trimmed}". Try another city name.`);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Select Your City
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {PRESET_CITIES.map((city) => {
            const isSelected = selectedLocation.name.toLowerCase() === city.name.toLowerCase();
            return (
              <button
                key={city.name}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectCity(city)}
                className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-500 dark:text-emerald-200 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{city.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>

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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchFeedback && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{searchFeedback}</p>
        )}

        {searchResults.length > 0 && (
          <div className="mt-3 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {searchResults.map((city) => (
              <button
                key={`${city.name}-${city.latitude}-${city.longitude}`}
                type="button"
                onClick={() => onSelectCity(city)}
                className="w-full p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {city.name}, {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Select</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
        Currently selected: <strong>{selectedLocation.name}{selectedLocation.country ? `, ${selectedLocation.country}` : ''}</strong>
      </div>
    </div>
  );
};
