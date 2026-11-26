import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AlertBanner } from './components/AlertBanner';
import { ProfileModal } from './components/ProfileModal';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { MobileBottomNav } from './components/MobileBottomNav';

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
import { getErrorMessage } from './utils/errorMessage';

const LOAD_ERROR_MESSAGE = "We couldn't retrieve the latest air-quality data. Please try again.";

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  const fetchContext = useCallback(
    async (isRefresh: boolean, signal?: AbortSignal) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchEnvironmentalData(profile.location, signal);
        if (!signal?.aborted) {
          setContext(data);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.warn('Environmental data fetch failed:', getErrorMessage(err, 'Unknown error'));
        if (!signal?.aborted) {
          setError(LOAD_ERROR_MESSAGE);
        }
      } finally {
        if (!signal?.aborted) {
          if (isRefresh) {
            setRefreshing(false);
          } else {
            setLoading(false);
          }
        }
      }
    },
    [profile.location]
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchContext(false, controller.signal);
    return () => controller.abort();
  }, [fetchContext]);

  const handleRefresh = useCallback(() => {
    void fetchContext(true);
  }, [fetchContext]);

  const handleRetry = useCallback(() => {
    void fetchContext(false);
  }, [fetchContext]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
    if (newProfile.location.name !== profile.location.name) {
      setPlan(null);
    }
  };

  const renderActivePage = () => {
    if (currentTab === 'landing') {
      return (
        <LandingPage
          onStart={() => setCurrentTab('dashboard')}
          onExplore={() => {
            const el = document.getElementById('how-it-works');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          context={context}
        />
      );
    }

    if (!context) return null;

    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            context={context}
            profile={profile}
            onRefresh={handleRefresh}
            isRefreshing={refreshing}
            onNavigate={setCurrentTab}
          />
        );
      case 'timeline':
        return <PollutionTimelinePage context={context} />;
      case 'ai-plan':
        return (
          <AIDailyPlanPage
            context={context}
            profile={profile}
            plan={plan}
            onPlanGenerated={setPlan}
          />
        );
      case 'comparator':
        return <ComparatorPage context={context} profile={profile} />;
      case 'indoor':
        return <IndoorAirPage context={context} profile={profile} />;
      case 'family':
        return <FamilyModePage context={context} profile={profile} />;
      case 'assistant':
        return <AssistantPage context={context} profile={profile} />;
      case 'impact':
        return <ImpactPage context={context} profile={profile} />;
      case 'progress':
        return (
          <WeeklyProgressPage
            context={context}
            profile={profile}
            onNavigateToTab={setCurrentTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-emerald-600 focus:text-white focus:text-xs focus:font-bold"
      >
        Skip to main content
      </a>

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

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab !== 'landing' && (
          <AlertBanner
            context={context}
            onNavigateToPlan={() => setCurrentTab('ai-plan')}
          />
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200 text-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs font-bold underline hover:no-underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !context ? (
          <div className="py-12">
            <LoadingSkeleton count={3} />
          </div>
        ) : (
          renderActivePage()
        )}
      </main>

      <Footer onSelectTab={setCurrentTab} />

      <ProfileModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
};

export default App;
