import React from 'react';
import {
  Home,
  BarChart3,
  Sparkles,
  Wind,
  MessageSquare,
  TrendingDown,
  LucideIcon,
} from 'lucide-react';

interface MobileNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { id: 'dashboard', label: 'Air', icon: Home },
  { id: 'timeline', label: 'Timeline', icon: BarChart3 },
  { id: 'ai-plan', label: 'AI Plan', icon: Sparkles },
  { id: 'comparator', label: 'Choices', icon: TrendingDown },
  { id: 'indoor', label: 'Indoor', icon: Wind },
  { id: 'assistant', label: 'Chat', icon: MessageSquare },
];

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="h-4 w-4 mb-0.5" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
