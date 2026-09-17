import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Timer, Unlock, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';

export const LimitModal: React.FC = () => {
  const {
    isInterceptModalOpen,
    setIsInterceptModalOpen,
    unlockSocialMinutes,
    emergencyBypassScreenTime,
    startFocusSession,
    tasks,
    screenTime,
    interceptedApp,
    resetScreenTimeDemo,
    currentTheme,
  } = useApp();

  if (!isInterceptModalOpen) return null;

  const appName = interceptedApp?.appName || 'Instagram';
  const allowance = interceptedApp ? interceptedApp.dailyAllowance + (interceptedApp.unlockedExtraMinutes || 0) : screenTime.dailyAllowance;
  const microTask = tasks.find((t) => t.isMicroTask) || tasks[0];

  const handleCompleteMicroTask = async () => {
    await unlockSocialMinutes(microTask?.id, 15);
  };

  const handleStartFocusSprint = () => {
    setIsInterceptModalOpen(false);
    startFocusSession(undefined, 20);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsInterceptModalOpen(false)}
          className="absolute inset-0 backdrop-blur-[24px]"
          style={{ backgroundColor: `${currentTheme.bgBase}D9` }}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-[345px] p-6 rounded-[20px] border shadow-2xl z-10 flex flex-col items-center text-center transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
            color: currentTheme.textPrimary,
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setIsInterceptModalOpen(false)}
            className="absolute top-4 right-4 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: currentTheme.textMuted }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Amber Shield Badge Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
          >
            <ShieldAlert className="w-6 h-6 text-amber-400 stroke-[2.2]" />
          </div>

          {/* Title */}
          <h2 className="text-[20px] font-bold" style={{ color: currentTheme.textPrimary }}>
            {appName} Limit Reached
          </h2>

          {/* Subtitle */}
          <p className="text-[13px] mt-1 leading-relaxed" style={{ color: currentTheme.textSecondary }}>
            You've reached your daily allowance of {allowance} minutes on <strong style={{ color: currentTheme.textPrimary }}>{appName}</strong>. Recalibrate before scrolling.
          </p>

          {/* Choice Architecture Cards */}
          <div className="w-full space-y-3 mt-5">
            {/* Option A (Earned Access) */}
            <button
              onClick={handleCompleteMicroTask}
              className="w-full p-3.5 rounded-xl text-left transition-all shadow-md active:scale-[0.98] cursor-pointer group"
              style={{
                backgroundColor: currentTheme.accentPrimary,
                color: '#FFFFFF',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Complete Micro-Task (+15 mins)</span>
                </div>
                <Unlock className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] mt-1 pl-6 opacity-90">
                Solve 1 rapid flashcard or summarize your notes.
              </p>
            </button>

            {/* Option B (Focus Sprint) */}
            <button
              onClick={handleStartFocusSprint}
              className="w-full p-3.5 rounded-xl border active:scale-[0.98] text-left transition-all cursor-pointer"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
              }}
            >
              <div className="flex items-center gap-2 font-bold text-xs" style={{ color: currentTheme.textPrimary }}>
                <Timer className="w-4 h-4" style={{ color: currentTheme.accentPrimary }} />
                <span>Start a 20-min Focus Sprint</span>
              </div>
              <p className="text-[11px] mt-0.5 pl-6" style={{ color: currentTheme.textSecondary }}>
                Earn focus XP and keep your streak safe.
              </p>
            </button>
          </div>

          {/* Frictionless Link: Centered link */}
          <div
            className="mt-4 pt-2 border-t w-full flex flex-col items-center gap-2"
            style={{ borderColor: currentTheme.borderBase }}
          >
            <button
              onClick={emergencyBypassScreenTime}
              className="text-[12px] hover:underline transition-colors cursor-pointer"
              style={{ color: currentTheme.textMuted }}
            >
              Emergency bypass (5 mins)
            </button>

            <button
              onClick={resetScreenTimeDemo}
              className="text-[10px] hover:underline transition-colors cursor-pointer"
              style={{ color: currentTheme.textMuted }}
            >
              (Demo: Reset app counters)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
