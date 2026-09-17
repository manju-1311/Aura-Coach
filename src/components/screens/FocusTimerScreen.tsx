import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Coffee,
  CheckCircle2,
  CloudRain,
  Trees,
  Waves,
  Sparkles,
  ShieldAlert,
  Flame,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { CompanionSprite } from '../CompanionSprite.js';

export const FocusTimerScreen: React.FC = () => {
  const {
    focusSession,
    toggleTimerPause,
    takeBreather,
    completeFocusSession,
    setSoundscape,
    setActiveTab,
    startFocusSession,
    currentTheme,
    triggerDriftToast,
    streaksAndBadges,
    sessionDriftDetected,
  } = useApp();

  const [showAudioMenu, setShowAudioMenu] = useState(false);

  const { remainingSeconds, totalSeconds, isPaused, isActive, activeTask, soundscape } = focusSession;

  // Formatting minutes and seconds
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG circular progress calculation for 260 x 260 px ring
  const size = 260;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const soundscapeOptions: { id: 'Rain' | 'Forest' | 'Stream' | 'Off'; label: string; icon: any }[] = [
    { id: 'Off', label: 'Mute', icon: VolumeX },
    { id: 'Rain', label: 'Rain', icon: CloudRain },
    { id: 'Forest', label: 'Forest', icon: Trees },
    { id: 'Stream', label: 'Stream', icon: Waves },
  ];

  return (
    <div
      className="flex-1 flex flex-col justify-between items-center px-6 pt-4 pb-16 min-h-full transition-colors"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Bar: Minimize button, header pill Focus Session, ambient audio toggle */}
      <div className="w-full flex items-center justify-between relative z-20">
        <button
          onClick={() => setActiveTab('today')}
          className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
            color: currentTheme.textMuted,
          }}
          title="Minimize Focus Session"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Header Pill */}
        <div
          className="px-3.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          style={{
            backgroundColor: currentTheme.accentTint,
            borderColor: currentTheme.accentPrimary,
            color: currentTheme.accentText,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: currentTheme.accentPrimary }}
          />
          <span>Focus Session ({Math.round(totalSeconds / 60)} min)</span>
        </div>

        {/* Ambient Audio Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setShowAudioMenu(!showAudioMenu)}
            className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer"
            style={{
              backgroundColor: soundscape !== 'Off' ? currentTheme.accentTint : currentTheme.bgSurface,
              borderColor: soundscape !== 'Off' ? currentTheme.accentPrimary : currentTheme.borderBase,
              color: soundscape !== 'Off' ? currentTheme.accentText : currentTheme.textMuted,
            }}
            title="Ambient Soundscape Synth"
          >
            {soundscape !== 'Off' ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Soundscape Dropdown Menu */}
          {showAudioMenu && (
            <div
              className="absolute right-0 top-10 w-36 border rounded-xl p-1.5 shadow-xl z-50 space-y-1"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
              }}
            >
              {soundscapeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSel = soundscape === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSoundscape(opt.id);
                      setShowAudioMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isSel ? currentTheme.accentPrimary : 'transparent',
                      color: isSel ? '#FFFFFF' : currentTheme.textSecondary,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Context */}
      <div className="text-center my-3 max-w-[320px]">
        <span
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: currentTheme.textMuted }}
        >
          CURRENT TASK
        </span>
        <h2 className="text-[16px] font-bold truncate mt-0.5" style={{ color: currentTheme.textPrimary }}>
          {activeTask?.title || 'Review Dynamic Programming Trees'}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentText,
            }}
          >
            🎯 {activeTask?.tag || 'Placement Prep'}
          </span>
        </div>
      </div>

      {/* Center Countdown Progress Ring (260 x 260 px) */}
      <div className="relative w-[260px] h-[260px] flex items-center justify-center my-auto">
        <svg className="w-full h-full -rotate-90">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={currentTheme.bgElevated}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={currentTheme.accentPrimary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center Contents */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-[48px] sm:text-[54px] font-bold font-mono tracking-tight drop-shadow-md select-none"
            style={{ color: currentTheme.textPrimary }}
          >
            {timeFormatted}
          </span>

          {/* Modular Companion Area */}
          <div className="mt-1 pointer-events-auto">
            <CompanionSprite state={isPaused ? 'sleeping' : 'reading'} size="md" />
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <div className="w-full space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {/* Secondary button */}
          <button
            onClick={() => takeBreather(5)}
            className="h-12 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: currentTheme.bgSurface,
              borderColor: currentTheme.borderBase,
              color: currentTheme.textSecondary,
            }}
          >
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>5-min Breather</span>
          </button>

          {/* Primary button */}
          <button
            onClick={() => {
              if (!isActive) {
                startFocusSession(activeTask || undefined, 25);
              } else {
                toggleTimerPause();
              }
            }}
            className="h-12 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-[0.98] hover:opacity-90"
            style={{ backgroundColor: currentTheme.accentPrimary }}
          >
            {isPaused || !isActive ? (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Resume Timer</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Timer</span>
              </>
            )}
          </button>
        </div>

        {/* Zero-Drift & Streak Status Card */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {sessionDriftDetected ? (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <span className="font-semibold text-slate-200">
              {sessionDriftDetected
                ? 'Drift Flagged: Standard 40 XP'
                : `Zero-Drift: +${120 + Math.min((streaksAndBadges.cleanFocusStreak + 1) * 30, 250)} XP`}
            </span>
          </div>
          <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
            <Flame className="w-3 h-3 fill-amber-300" />
            Clean Streak: {streaksAndBadges.cleanFocusStreak}
          </span>
        </div>

        {/* Complete Session Button */}
        <button
          onClick={completeFocusSession}
          className="w-full h-11 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-90 shadow-md"
          style={{
            backgroundColor: sessionDriftDetected ? currentTheme.bgElevated : '#10B981',
            borderColor: sessionDriftDetected ? currentTheme.borderBase : '#059669',
            color: sessionDriftDetected ? currentTheme.accentPrimary : '#FFFFFF',
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {sessionDriftDetected
              ? 'Complete Sprint (+40 XP)'
              : `Complete Clean Sprint (+${120 + Math.min((streaksAndBadges.cleanFocusStreak + 1) * 30, 250)} XP & Max Pet Health)`}
          </span>
        </button>

        {/* On-Screen Social Media Drift Alert Tester & Shield Banner */}
        <div
          className="p-3 rounded-xl border flex flex-col gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)]"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: '#A855F7',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-[11px] font-bold text-white tracking-wide">
                Social Media Drift Shield Active
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 font-mono">
              Auto-Armed
            </span>
          </div>

          <p className="text-[11px] text-purple-200/80 leading-tight">
            If you switch browser tabs or try opening Instagram, TikTok, or YouTube during this session, the on-screen toast overlay intercepts and pulls you back.
          </p>

          <button
            onClick={() => triggerDriftToast('manual_test')}
            className="w-full h-8 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.5)] cursor-pointer active:scale-[0.98] transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test On-Screen Social Drift Overlay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
