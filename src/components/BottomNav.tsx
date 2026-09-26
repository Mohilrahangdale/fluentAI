import React from 'react';
import { Home, Mic, BarChart3, User as UserIcon } from 'lucide-react';

export type NavTab = 'home' | 'practice' | 'progress' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'practice' as NavTab, label: 'Practice', icon: Mic, highlight: true },
    { id: 'progress' as NavTab, label: 'Progress', icon: BarChart3 },
    { id: 'profile' as NavTab, label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}-btn`}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center py-1 -mt-3 group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1 tracking-tight ${
                    isActive ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}-btn`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-emerald-600 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
