import React from 'react';
import {
  Wind,
  MapPin,
  Sparkles,
  Home,
  Users,
  TrendingDown,
  MessageSquare,
  Award,
  Sun,
  Moon,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { LocationInfo } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  location: LocationInfo;
  onOpenLocationModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  aqiCategory?: string;
  aqiValue?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  location,
  onOpenLocationModal,
  theme,
  onToggleTheme,
  aqiCategory,
  aqiValue,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'timeline', label: 'Air Quality', icon: BarChart3 },
    { id: 'ai-plan', label: 'AI Plan', icon: Sparkles, badge: 'GenAI' },
    { id: 'indoor', label: 'Indoor Air', icon: Wind },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'impact', label: 'Impact', icon: TrendingDown },
    { id: 'assistant', label: 'Assistant', icon: MessageSquare },
    { id: 'progress', label: 'Progress', icon: Award },
  ];

  const getAqiBadgeColor = (cat?: string) => {
    switch (cat) {
      case 'Good':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
      case 'Poor':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700';
      case 'Very Poor':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
      case 'Severe':
        return 'bg-red-900 text-white border-red-950 dark:bg-red-950 dark:text-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectTab('landing')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
              aria-label="AirWise AI Home"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Wind className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                  AirWise AI
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight -mt-0.5">
                  Breathe smarter. Live cleaner.
                </p>
              </div>
            </button>

            {/* City Selector Pill */}
            <button
              onClick={onOpenLocationModal}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Change location and family profile"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{location.name}</span>
              {aqiValue !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${getAqiBadgeColor(
                    aqiCategory
                  )}`}
                >
                  AQI {aqiValue}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-600 text-white dark:bg-emerald-500">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenLocationModal}
              className="sm:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Change city"
            >
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-xl">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
            <button
              onClick={() => {
                onOpenLocationModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
            >
              <span className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>{location.name}, {location.country}</span>
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold underline">Change</span>
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isActive ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
