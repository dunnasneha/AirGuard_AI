import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock, Sun, AlertTriangle } from 'lucide-react';
import { EnvironmentalContext } from '../types';

interface PollutionTimelinePageProps {
  context: EnvironmentalContext;
}

interface ChartPoint {
  time: string;
  hour: number;
  aqi: number;
  pm2_5: number;
  pm10: number;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload: ChartPoint }>;
}

export const PollutionTimelinePage: React.FC<PollutionTimelinePageProps> = ({ context }) => {
  const { hourly, windows, location } = context;

  const chartData: ChartPoint[] = hourly.map((item) => ({
    time: item.time,
    hour: item.hour,
    aqi: item.aqi,
    pm2_5: item.pm2_5,
    pm10: item.pm10,
  }));

  const CustomTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1">Time: {label}</p>
          <p className="text-emerald-400">AQI: <strong>{data.aqi}</strong></p>
          <p className="text-slate-300">PM2.5: {data.pm2_5} µg/m³</p>
          <p className="text-slate-400">PM10: {data.pm10} µg/m³</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            24-Hour Pollution Timeline
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real-time and projected particulate curves for <strong>{location.name}</strong> to help schedule workouts, errands, and ventilation.
        </p>
      </div>

      {/* Windows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Better Outdoor Window */}
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Sun className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Better Outdoor Window</span>
          </div>
          <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
            {windows.bestOutdoorWindow.label}
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            {windows.bestOutdoorWindow.description}
          </p>
          <div className="pt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
            <span>Recommended for: Essential errands, dog walking, active transit.</span>
          </div>
        </div>

        {/* Peak Pollution Window */}
        <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <span>Higher Pollution Window</span>
          </div>
          <div className="text-2xl font-black text-rose-900 dark:text-rose-100">
            {windows.peakPollutionWindow.label}
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
            {windows.peakPollutionWindow.description}
          </p>
          <div className="pt-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 flex items-center space-x-1">
            <span>Action: Keep windows sealed, run purifiers, postpone high-intensity cardio.</span>
          </div>
        </div>
      </div>

      {/* Hourly Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Hourly PM2.5 & AQI Dynamics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Captures thermal inversion dips during afternoon solar heating
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>AQI Trend</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-full bg-teal-400 inline-block" />
              <span>PM2.5 (µg/m³)</span>
            </span>
          </div>
        </div>

        <div
          className="h-72 w-full pt-4"
          role="img"
          aria-label={`24-hour AQI and PM2.5 trend chart for ${location.name}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#aqiGradient)"
                name="AQI"
              />
              <Area
                type="monotone"
                dataKey="pm2_5"
                stroke="#14b8a6"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#pmGradient)"
                name="PM2.5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Screen-reader accessible data table for the hourly trend chart */}
        <table className="sr-only">
          <caption>Hourly AQI, PM2.5, and PM10 breakdown for {location.name}</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">AQI</th>
              <th scope="col">PM2.5 (µg/m³)</th>
              <th scope="col">PM10 (µg/m³)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((pt) => (
              <tr key={pt.time}>
                <td>{pt.time}</td>
                <td>{pt.aqi}</td>
                <td>{pt.pm2_5}</td>
                <td>{pt.pm10}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diurnal Periods Summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Diurnal Periods Summary (Morning, Afternoon, Evening, Night)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            {
              period: 'Morning (6am - 12pm)',
              desc: 'High particulate concentration due to ground inversion and rush hour exhaust.',
              risk: 'High Exposure',
              color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
            },
            {
              period: 'Afternoon (12pm - 5pm)',
              desc: 'Best mixing layer height. Solar thermal heating helps dilute ground-level smog.',
              risk: 'Optimal Window',
              color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
            },
            {
              period: 'Evening (5pm - 9pm)',
              desc: 'Evening commute traffic combined with dropping ambient temperature increases roadside PM.',
              risk: 'Moderate Exposure',
              color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
            },
            {
              period: 'Night (9pm - 6am)',
              desc: 'Calm winds and cooling surface reconstruct thermal inversion trap overnight.',
              risk: 'Seal Windows',
              color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40',
            },
          ].map((p) => (
            <div key={p.period} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${p.color}`}>
                {p.risk}
              </span>
              <div className="font-bold text-slate-900 dark:text-white">{p.period}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
