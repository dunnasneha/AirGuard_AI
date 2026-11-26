import React from 'react';
import { Wind, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC<{ onSelectTab: (tab: string) => void }> = ({ onSelectTab }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Wind className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">AirWise AI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breathe smarter. Live cleaner. Empowering families and communities during severe winter smog and urban pollution.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Navigation
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button type="button" onClick={() => onSelectTab('dashboard')} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Dashboard
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('ai-plan')} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  AI Action Plan
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('indoor')} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Indoor Air Quality Hub
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('family')} className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Family Air Safety
                </button>
              </li>
            </ul>
          </div>

          {/* Environmental Data Sources */}
          <div>
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Data & AI Sources
            </h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a
                  href="https://open-meteo.com/en/docs/air-quality-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <span>Open-Meteo Air Quality API</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com/en/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <span>Open-Meteo Weather Model</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>Google Gemini AI (Backend Endpoint)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span>CPCB / NAQI Standard Breakpoints</span>
              </li>
            </ul>
          </div>

          {/* Medical Disclaimer Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
              <ShieldAlert className="h-4 w-4" />
              <span>Medical Disclaimer</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              AirWise AI provides general environmental guidance and decision support; it is not medical advice. Individuals with respiratory or cardiac conditions should always adhere to official public health alerts and consult medical professionals.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} AirWise AI. Built for Hack2Skill PromptWars Challenge 6.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Designed for urban families navigating winter smog</span>
            <Heart className="h-3 w-3 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
