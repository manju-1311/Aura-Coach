import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Database, Wifi, ShieldAlert, Palette, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { useAuth } from '../context/AuthContext.js';
import { THEMES } from '../utils/theme.js';
import { ThemeType } from '../types.js';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [currentTime, setCurrentTime] = useState('9:41');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const {
    syncStatus,
    lastSyncTime,
    setIsInterceptModalOpen,
    setCurrentScreen,
    currentScreen,
    setActiveTab,
    themeId,
    currentTheme,
    setAppTheme,
  } = useApp();
  const { user } = useAuth();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start selection:bg-purple-500/30 transition-colors duration-300"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Testing & Device Bar */}
      <header
        className="w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-50 shadow-md transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderBottom: `1px solid ${currentTheme.borderBase}`,
        }}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold tracking-wide"
            style={{
              backgroundColor: currentTheme.accentTint,
              border: `1px solid ${currentTheme.accentPrimary}40`,
              color: currentTheme.accentText,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentTheme.accentPrimary }}
            />
            AURA COACH • ANDROID APP
          </div>

          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: currentTheme.bgElevated,
              borderColor: currentTheme.borderBase,
              color: currentTheme.textSecondary,
            }}
          >
            <Database className="w-3.5 h-3.5" style={{ color: currentTheme.accentPrimary }} />
            <span>
              MongoDB: <strong style={{ color: currentTheme.textPrimary }}>Connected & Synced</strong>
            </span>
          </div>

          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: currentTheme.bgElevated,
              borderColor: currentTheme.borderBase,
              color: currentTheme.textSecondary,
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'syncing' ? 'bg-amber-400 animate-spin' : 'bg-rose-400'
              }`}
            />
            <span className="capitalize">{syncStatus}</span>
            {lastSyncTime && (
              <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                ({lastSyncTime})
              </span>
            )}
          </div>
        </div>

        {/* Quick Screen Tester & Theme Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Switcher Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer transition-all shadow-xs"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: isThemeMenuOpen ? currentTheme.accentPrimary : currentTheme.borderBase,
                color: currentTheme.textPrimary,
              }}
              title="Change base color theme"
            >
              <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.accentPrimary }} />
              <span>Theme: {currentTheme.name}</span>
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-56 rounded-xl border p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  backgroundColor: currentTheme.bgSurface,
                  borderColor: currentTheme.borderBase,
                }}
              >
                <div
                  className="text-[11px] font-semibold px-2 py-1 uppercase tracking-wider"
                  style={{ color: currentTheme.textMuted }}
                >
                  Select Base Color Theme
                </div>
                <div className="space-y-1 mt-1">
                  {(Object.keys(THEMES) as ThemeType[]).map((key) => {
                    const t = THEMES[key];
                    const isSelected = themeId === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setAppTheme(key);
                          setIsThemeMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isSelected ? t.accentTint : 'transparent',
                          color: isSelected ? t.accentText : currentTheme.textPrimary,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border"
                            style={{ backgroundColor: t.accentPrimary, borderColor: t.borderBase }}
                          />
                          <span>
                            {t.emoji} {t.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" style={{ color: t.accentPrimary }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Trigger Screen Time Intercept Modal */}
          <button
            onClick={() => setIsInterceptModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer font-medium"
            title="Preview Screen 8: Task-to-Unlock Intercept Modal"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test Limit Intercept</span>
          </button>

          {/* Quick Screen Jump Menu */}
          <div
            className="hidden lg:flex items-center gap-1 text-[11px] p-1 rounded-lg border"
            style={{
              backgroundColor: currentTheme.bgElevated,
              borderColor: currentTheme.borderBase,
            }}
          >
            <button
              onClick={() => setCurrentScreen('splash')}
              className="px-2 py-0.5 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: currentScreen === 'splash' ? currentTheme.accentPrimary : 'transparent',
                color: currentScreen === 'splash' ? '#FFFFFF' : currentTheme.textSecondary,
              }}
            >
              Splash
            </button>
            <button
              onClick={() => setCurrentScreen('onboarding')}
              className="px-2 py-0.5 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: currentScreen === 'onboarding' ? currentTheme.accentPrimary : 'transparent',
                color: currentScreen === 'onboarding' ? '#FFFFFF' : currentTheme.textSecondary,
              }}
            >
              Onboard
            </button>
            <button
              onClick={() => {
                setCurrentScreen('main');
                setActiveTab('today');
              }}
              className="px-2 py-0.5 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: currentScreen === 'main' && currentTheme ? currentTheme.accentPrimary : 'transparent',
                color: currentScreen === 'main' ? '#FFFFFF' : currentTheme.textSecondary,
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentScreen('main');
                setActiveTab('focus');
              }}
              className="px-2 py-0.5 rounded cursor-pointer transition-colors"
              style={{ color: currentTheme.textSecondary }}
            >
              Focus ⏱️
            </button>
            <button
              onClick={() => {
                setCurrentScreen('main');
                setActiveTab('stats');
              }}
              className="px-2 py-0.5 rounded cursor-pointer transition-colors"
              style={{ color: currentTheme.textSecondary }}
            >
              Stats 📊
            </button>
          </div>

          {/* Device Frame Viewport Toggle */}
          <div
            className="flex items-center rounded-lg p-0.5 border"
            style={{
              backgroundColor: currentTheme.bgElevated,
              borderColor: currentTheme.borderBase,
            }}
          >
            <button
              onClick={() => setIsPhoneFrame(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer"
              style={{
                backgroundColor: isPhoneFrame ? currentTheme.accentPrimary : 'transparent',
                color: isPhoneFrame ? '#FFFFFF' : currentTheme.textSecondary,
              }}
              title="Android Phone Mockup (393 × 852 px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Android Frame</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(false)}
              className="flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer"
              style={{
                backgroundColor: !isPhoneFrame ? currentTheme.accentPrimary : 'transparent',
                color: !isPhoneFrame ? '#FFFFFF' : currentTheme.textSecondary,
              }}
              title="Responsive Fluid Fullscreen View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Full View</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-x-hidden">
        {isPhoneFrame ? (
          /* Realistic Android Phone Chassis (393 x 852 px Figma standard) */
          <div
            className="relative w-full max-w-[393px] h-[852px] rounded-[44px] shadow-2xl flex flex-col overflow-hidden transition-colors"
            style={{
              backgroundColor: currentTheme.bgBase,
              border: `10px solid ${currentTheme.isLight ? '#E2E8F0' : '#260D52'}`,
              boxShadow: currentTheme.isLight
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                : '0 0 35px rgba(168, 85, 247, 0.35), 0 25px 50px -12px rgba(0, 0, 0, 0.85)',
            }}
          >
            {/* Top Camera Punch Hole & Android Status Bar */}
            <div
              className="relative w-full h-11 px-6 flex items-center justify-between text-xs font-medium select-none z-40 shrink-0 transition-colors"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderBottom: `1px solid ${currentTheme.borderBase}`,
              }}
            >
              {/* Clock */}
              <span
                className="tracking-tight text-[13px] font-semibold"
                style={{ color: currentTheme.textPrimary }}
              >
                {currentTime}
              </span>

              {/* Center Punch-hole Camera */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-2.5 w-4 h-4 rounded-full border-2 shadow-inner flex items-center justify-center"
                style={{
                  backgroundColor: '#000000',
                  borderColor: currentTheme.borderBase,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#111827]" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] tracking-wider font-bold"
                  style={{ color: currentTheme.textMuted }}
                >
                  5G
                </span>
                <Wifi className="w-3.5 h-3.5" style={{ color: currentTheme.textSecondary }} />
                <div className="flex items-center gap-0.5">
                  <div
                    className="w-5 h-2.5 rounded-[3px] border p-[1px] flex items-center"
                    style={{ borderColor: currentTheme.textMuted }}
                  >
                    <div
                      className="h-full w-[85%] rounded-[1.5px]"
                      style={{ backgroundColor: currentTheme.accentPrimary }}
                    />
                  </div>
                  <div
                    className="w-[1.5px] h-1 rounded-r-xs"
                    style={{ backgroundColor: currentTheme.textMuted }}
                  />
                </div>
              </div>
            </div>

            {/* Screen View Area */}
            <div
              className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none relative flex flex-col transition-colors"
              style={{ backgroundColor: currentTheme.bgBase }}
            >
              {children}
            </div>

            {/* Android Bottom Gesture Navigation Bar */}
            <div
              className="w-full h-5 flex items-center justify-center shrink-0 z-40 select-none transition-colors"
              style={{ backgroundColor: currentTheme.bgSurface }}
            >
              <div
                className="w-32 h-1 rounded-full"
                style={{ backgroundColor: `${currentTheme.textMuted}60` }}
              />
            </div>
          </div>
        ) : (
          /* Fullscreen Responsive Layout */
          <div
            className="w-full max-w-4xl min-h-[852px] rounded-2xl border shadow-xl overflow-hidden flex flex-col my-4 transition-colors"
            style={{
              backgroundColor: currentTheme.bgBase,
              borderColor: currentTheme.borderBase,
            }}
          >
            <div className="flex-1 w-full flex flex-col">{children}</div>
          </div>
        )}
      </main>
    </div>
  );
};
