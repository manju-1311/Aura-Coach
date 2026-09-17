import React from 'react';
import { Home, Timer, BarChart3, Settings, Brain } from 'lucide-react';
import { useApp, TabType } from '../context/AppContext.js';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentTheme } = useApp();

  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'agent', label: 'Agent', icon: Brain },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="sticky bottom-0 w-full px-4 pb-3 pt-2 backdrop-blur-md z-30 transition-colors"
      style={{
        backgroundColor: `${currentTheme.bgSurface}E6`, // 90% opacity
        borderTop: `1px solid ${currentTheme.borderBase}`,
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                color: isActive ? currentTheme.accentPrimary : currentTheme.textMuted,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <div
                className="p-1 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive ? currentTheme.accentTint : 'transparent',
                  boxShadow: isActive ? `0 0 12px ${currentTheme.accentPrimary}4D` : 'none',
                }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
