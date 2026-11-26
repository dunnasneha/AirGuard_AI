import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AlertBanner } from './components/AlertBanner';
import { ProfileModal } from './components/ProfileModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PollutionTimelinePage } from './pages/PollutionTimelinePage';
import { AIDailyPlanPage } from './pages/AIDailyPlanPage';
import { ComparatorPage } from './pages/ComparatorPage';
import { IndoorAirPage } from './pages/IndoorAirPage';
import { FamilyModePage } from './pages/FamilyModePage';
import { AssistantPage } from './pages/AssistantPage';
import { ImpactPage } from './pages/ImpactPage';
import { WeeklyProgressPage } from './pages/WeeklyProgressPage';

import { AIDailyPlan, EnvironmentalContext, UserProfile } from './types';
import {
  loadTheme,
  loadUserProfile,
  saveTheme,
  saveUserProfile,
} from './utils/storage';
import { fetchEnvironmentalData } from './services/api';
import {
  Home,
  BarChart3,
  Sparkles,
  Wind,
  MessageSquare,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme());
  const [profile, setProfile] = useState<UserProfile>(loadUserProfile());
  const [context, setContext] = useState<EnvironmentalContext | null>(null);
  const [plan, setPlan] = useState<AIDailyPlan | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Load environmental data whenever profile location changes
  useEffect(() => {
    loadData();
  }, [profile.location.latitude, profile.location.longitude]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEnvironmentalData(profile.location);
      setContext(data);
    } catch (err: any) {
      console.warn('Environmental data load failed:', err);
      setError("We couldn't retrieve the latest air-quality data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchEnvironmentalData(profile.location);
      setContext(data);
    } catch (err: any) {
      console.warn('Environmental data refresh failed:', err);
      setError("We couldn't retrieve the latest air-quality data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
    // If city changed, clear previously generated plan so fresh AI plan can be synthesized
    if (newProfile.location.name !== profile.location.name) {
      setPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        location={profile.location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        aqiCategory={context?.airQuality?.category}
        aqiValue={context?.airQuality?.aqi}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alerts & Notifications */}
        {currentTab !== 'landing' && (
          <AlertBanner
            context={context}
            onNavigateToPlan={() => setCurrentTab('ai-plan')}
          />
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-bold underline hover:no-underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        {loading && !context ? (
          <div className="py-12">
            <LoadingSkeleton count={3} />
          </div>
        ) : (
          <>
            {currentTab === 'landing' && (
              <LandingPage
                onStart={() => setCurrentTab('dashboard')}
                onExplore={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                context={context}
                profile={profile}
              />
            )}

            {currentTab === 'dashboard' && context && (
              <DashboardPage
                context={context}
                profile={profile}
                onRefresh={handleRefresh}
                isRefreshing={refreshing}
                onNavigate={setCurrentTab}
              />
            )}

            {currentTab === 'timeline' && context && (
              <PollutionTimelinePage context={context} />
            )}

            {currentTab === 'ai-plan' && context && (
              <AIDailyPlanPage
                context={context}
                profile={profile}
                plan={plan}
                onPlanGenerated={setPlan}
              />
            )}

            {currentTab === 'comparator' && context && (
              <ComparatorPage context={context} profile={profile} />
            )}

            {currentTab === 'indoor' && context && (
              <IndoorAirPage context={context} profile={profile} />
            )}

            {currentTab === 'family' && context && (
              <FamilyModePage context={context} profile={profile} />
            )}

            {currentTab === 'assistant' && context && (
              <AssistantPage context={context} profile={profile} />
            )}

            {currentTab === 'impact' && context && (
              <ImpactPage context={context} profile={profile} />
            )}

            {currentTab === 'progress' && context && (
              <WeeklyProgressPage
                context={context}
                profile={profile}
                onNavigateToTab={setCurrentTab}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={setCurrentTab} />

      {/* Profile & Location Modal */}
      <ProfileModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Air', icon: Home },
          { id: 'timeline', label: 'Timeline', icon: BarChart3 },
          { id: 'ai-plan', label: 'AI Plan', icon: Sparkles },
          { id: 'comparator', label: 'Choices', icon: TrendingDown },
          { id: 'indoor', label: 'Indoor', icon: Wind },
          { id: 'assistant', label: 'Chat', icon: MessageSquare },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
