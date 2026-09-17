import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, Sparkles, Clock, ArrowRight, Instagram, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const FocusDriftToastOverlay: React.FC = () => {
  const {
    focusSession,
    currentTheme,
    driftToast,
    dismissDriftToast,
    startFocusSession,
  } = useApp();

  const [dismissProgress, setDismissProgress] = useState(100);

  // Remaining time format
  const remainingMins = Math.floor(focusSession.remainingSeconds / 60);
  const remainingSecs = focusSession.remainingSeconds % 60;
  const timeFormatted = `${remainingMins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;

  // Auto-progress bar while open (pauses on hover)
  useEffect(() => {
    if (!driftToast.isOpen) {
      setDismissProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setDismissProgress((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          dismissDriftToast(true);
          return 0;
        }
        return prev - 1.25; // ~8 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [driftToast.isOpen, dismissDriftToast]);

  const getReasonDetails = () => {
    switch (driftToast.triggerReason) {
      case 'tab_switch':
        return {
          title: 'Drift Detected: Stay Off Social Media!',
          subtitle: 'You switched away from your study sprint. Instagram, YouTube and other distraction tabs are locked!',
          badge: 'TAB SWITCH DETECTED',
        };
      case 'social_attempt':
        return {
          title: `Blocked: ${driftToast.socialAppName || 'Social Media'} is Locked!`,
          subtitle: 'Your active Focus Timer forbids opening social media apps until this study sprint finishes.',
          badge: 'APP INTERCEPTED',
        };
      case 'idle_drift':
        return {
          title: 'Attention Drift: Re-Center Your Focus!',
          subtitle: 'You paused studying. Close secondary apps and return to your placement notes.',
          badge: 'ATTENTION DRIFT',
        };
      case 'manual_test':
      default:
        return {
          title: 'Stay Off Social Media & Distractions!',
          subtitle: 'Focus sprint in progress: Instagram, TikTok & YouTube are locked. Protect your daily streak!',
          badge: 'ACTIVE FOCUS SPRINT',
        };
    }
  };

  const reasonInfo = getReasonDetails();

  return (
    <AnimatePresence>
      {driftToast.isOpen && (
        <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-[370px] pointer-events-auto rounded-[20px] p-4 text-white overflow-hidden relative shadow-2xl"
            style={{
              backgroundColor: '#190838', // Deep Cosmic Purple
              border: '2px solid #A855F7', // Electric Neon Purple
              boxShadow: '0 0 25px rgba(168, 85, 247, 0.6), 0 10px 40px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Top Glowing Ambient Pulse Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 animate-pulse" />

            {/* Header with Alert Badge and Close Button */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-400/50 text-[10px] font-mono font-bold text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
                <span>{reasonInfo.badge}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Remaining study time pill */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#260D52] border border-[#4C1D95] text-[11px] font-mono text-purple-200">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>{timeFormatted}</span>
                </div>

                <button
                  onClick={() => dismissDriftToast(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors cursor-pointer"
                  title="Close overlay"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="flex items-start gap-3 my-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-800 border border-fuchsia-400/60 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <ShieldAlert className="w-6 h-6 text-white stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-white tracking-tight leading-snug drop-shadow-sm">
                  {reasonInfo.title}
                </h3>
                <p className="text-[12px] text-purple-200/90 leading-relaxed mt-1">
                  {reasonInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Social Media Lock Icons Banner */}
            <div className="my-2.5 px-3 py-1.5 rounded-xl bg-[#260D52] border border-purple-800/80 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-purple-200">
                <span className="font-semibold text-white">Blocked:</span>
                <span className="line-through text-purple-400 opacity-80">Instagram</span>
                <span className="line-through text-purple-400 opacity-80">TikTok</span>
                <span className="line-through text-purple-400 opacity-80">YouTube</span>
              </div>
              <span className="text-[10px] text-fuchsia-300 font-bold">🔒 LOCKED</span>
            </div>

            {/* Streak & Distractions Resisted Badge */}
            <div className="flex items-center justify-between text-[11px] mb-3 px-1 text-purple-300 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Distractions Resisted Today:</span>
              </span>
              <span className="font-bold text-white bg-purple-600/40 px-2 py-0.5 rounded-full border border-purple-500/50">
                {driftToast.distractionsResistedCount} Resisted (+{driftToast.distractionsResistedCount * 30} XP)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  // Add 5 min lockdown
                  startFocusSession(focusSession.activeTask || undefined, Math.round(focusSession.totalSeconds / 60) + 5);
                  dismissDriftToast(true);
                }}
                className="h-9 px-2 rounded-xl bg-[#260D52] hover:bg-[#341170] border border-[#4C1D95] text-purple-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>+5m Lockdown</span>
              </button>

              <button
                onClick={() => dismissDriftToast(true)}
                className="h-9 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all cursor-pointer active:scale-[0.98]"
              >
                <span>Back to Studying</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Auto dismiss countdown progress line */}
            <div className="w-full bg-[#13052E] h-1 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 transition-all duration-100 ease-linear"
                style={{ width: `${dismissProgress}%` }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
