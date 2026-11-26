import React from 'react';
import {
  Wind,
  Thermometer,
  Droplets,
  Gauge,
  Sparkles,
  Clock,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Sun,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { EnvironmentalContext, UserProfile } from '../types';
import { getAqiCardTheme } from '../utils/aqiTheme';

interface DashboardPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  context,
  profile,
  onRefresh,
  isRefreshing,
  onNavigate,
}) => {
  const { airQuality, weather, windows, location, lastUpdated } = context;

  const theme = getAqiCardTheme(airQuality.category);

  return (
    <div className="space-y-8">
      {/* Header with City & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {location.name} Air Quality
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
              {location.country}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
            <span>Last updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span>Profile: <strong>{profile.lifestyle}</strong></span>
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} aria-hidden="true" />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Main AQI Hero Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${theme.border} ${theme.bg} shadow-sm transition-card`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Big AQI Number & Category */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div
              className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${theme.gradient} text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-900/10 shrink-0`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">NAQI AQI</span>
              <span className="text-5xl font-black tracking-tight">{airQuality.aqi}</span>
              <span className="text-[10px] opacity-80 mt-0.5">Scale 0–500</span>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${theme.badge}`}
                >
                  {airQuality.category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Primary: {airQuality.dominantPollutant}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {airQuality.category === 'Good' && 'Fresh, Clean Air'}
                {airQuality.category === 'Moderate' && 'Acceptable Air Quality'}
                {airQuality.category === 'Poor' && 'Unhealthy Particulate Levels'}
                {airQuality.category === 'Very Poor' && 'High Smog & Haze Alert'}
                {airQuality.category === 'Severe' && 'Emergency Pollution Episode'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
                {airQuality.healthAdvice}
              </p>
            </div>
          </div>

          {/* Today's Air Snapshot Narrative */}
          <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="h-4 w-4 text-emerald-600" />
                <span>Today's Air Snapshot</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Weather: {weather.conditionDescription}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Air quality in <strong>{location.name}</strong> is currently rated <strong>{airQuality.category}</strong> with particulate concentrations at {airQuality.pm2_5} µg/m³ for PM2.5 and {airQuality.pm10} µg/m³ for PM10. Outdoor exercise should be timed thoughtfully, especially during periods of higher particulate concentration.
            </p>

            {/* Inversion Windows Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Sun className="h-3.5 w-3.5" />
                  <span>Better Outdoor Window</span>
                </div>
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 mt-1">
                  {windows.bestOutdoorWindow.label}
                </div>
                <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-0.5 line-clamp-1">
                  {windows.bestOutdoorWindow.description}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center space-x-1.5 text-rose-800 dark:text-rose-300 font-bold text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Higher Pollution Window</span>
                </div>
                <div className="text-xs font-semibold text-rose-900 dark:text-rose-100 mt-1">
                  {windows.peakPollutionWindow.label}
                </div>
                <div className="text-[10px] text-rose-700/80 dark:text-rose-400 mt-0.5 line-clamp-1">
                  {windows.peakPollutionWindow.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric & Pollutant Metric Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
          Environmental Parameters (Live Sensors)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              label: 'PM2.5 (Fine Particles)',
              val: `${airQuality.pm2_5}`,
              unit: 'µg/m³',
              desc: 'Penetrates deep into lungs',
              icon: Wind,
              status: airQuality.pm2_5 > 60 ? 'Elevated' : 'Normal',
              isElevated: airQuality.pm2_5 > 60,
            },
            {
              label: 'PM10 (Coarse Dust)',
              val: `${airQuality.pm10}`,
              unit: 'µg/m³',
              desc: 'Road & construction dust',
              icon: Wind,
              status: airQuality.pm10 > 100 ? 'Elevated' : 'Normal',
              isElevated: airQuality.pm10 > 100,
            },
            {
              label: 'Ozone (O₃)',
              val: `${airQuality.ozone}`,
              unit: 'µg/m³',
              desc: 'Photochemical smog gas',
              icon: Gauge,
              status: airQuality.ozone > 100 ? 'Elevated' : 'Normal',
              isElevated: airQuality.ozone > 100,
            },
            {
              label: 'Temperature',
              val: `${weather.temperature}`,
              unit: '°C',
              desc: 'Thermal boundary layer',
              icon: Thermometer,
              status: weather.temperature < 15 ? 'Cool Trap' : 'Normal',
              isElevated: weather.temperature < 15,
            },
            {
              label: 'Relative Humidity',
              val: `${weather.humidity}`,
              unit: '%',
              desc: 'Aerosol moisture trap',
              icon: Droplets,
              status: weather.humidity > 75 ? 'High RH' : 'Normal',
              isElevated: weather.humidity > 75,
            },
            {
              label: 'Wind Speed',
              val: `${weather.windSpeed}`,
              unit: 'km/h',
              desc: weather.windSpeed < 6 ? 'Stagnant dispersion' : 'Active ventilation',
              icon: Wind,
              status: weather.windSpeed < 6 ? 'Low Trap' : 'Normal',
              isElevated: weather.windSpeed < 6,
            },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider line-clamp-1">
                    {m.label}
                  </span>
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </div>
                <div className="flex items-baseline justify-between gap-1">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{m.val}</span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{m.unit}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      m.isElevated
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Next Steps Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            <h2 className="font-bold text-base">Generate Personalized AI Action Plan</h2>
          </div>
          <p className="text-xs text-emerald-100 max-w-xl">
            Translate today's AQI ({airQuality.aqi}) and weather conditions into a tailored routine for your {profile.lifestyle.toLowerCase()} lifestyle and family members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('ai-plan')}
          className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-xs transition-colors shrink-0 flex items-center space-x-2 shadow-md"
        >
          <span>Open AI Plan</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            tab: 'timeline',
            title: 'Hourly Pollution Trend',
            desc: 'View 24-hour smog forecast curve and safe exercise windows.',
            icon: Clock,
            badge: 'Hourly',
          },
          {
            tab: 'comparator',
            title: 'Choose Cleaner Option',
            desc: 'Compare solo car vs metro vs carpool emissions & cost.',
            icon: TrendingDown,
            badge: 'Decision Tool',
          },
          {
            tab: 'indoor',
            title: 'Indoor Air Quality Hub',
            desc: 'Window timing, HEPA filtration hacks, and cooking checklist.',
            icon: ShieldCheck,
            badge: 'Checklist',
          },
          {
            tab: 'family',
            title: 'Family Air Safety',
            desc: 'Specific protective guidelines for kids, seniors, and asthma.',
            icon: Wind,
            badge: 'Family Mode',
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.tab}
              type="button"
              onClick={() => onNavigate(c.tab)}
              className="p-5 rounded-2xl text-left bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  {c.badge}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {c.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
