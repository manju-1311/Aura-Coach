import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  Clock,
  TrendingUp,
  CheckCircle,
  Flame,
  Lightbulb,
  Award,
  Download,
  X,
  Check,
  Smartphone,
  Info,
  ShieldAlert,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { WeeklyAnalyticsData } from '../../types.js';
import { StreaksAndBadges } from '../StreaksAndBadges.js';

export const AnalyticsScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    triggerConfetti,
    currentTheme,
    allApps,
    totalScreenTimeMinutes,
    totalDailyAllowanceMinutes,
    simulateAppUsage,
    updateAppAllowance,
    setIsInterceptModalOpen,
    setActiveTab,
  } = useApp();

  const [timeframe, setTimeframe] = useState<'This Week' | 'Last Week' | 'Month'>('This Week');
  const [analytics, setAnalytics] = useState<WeeklyAnalyticsData | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem('aura_coach_token');
        const res = await fetch(`/api/analytics?timeframe=${encodeURIComponent(timeframe)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics);
        }
      } catch {
        // fallback
      }
    }
    loadStats();
  }, [timeframe]);

  const deepStudy = analytics?.deepStudyHours ?? (timeframe === 'Month' ? 52.8 : 14.5);
  const timeSaved = analytics?.timeSavedHours ?? (timeframe === 'Month' ? 14.0 : 3.2);
  const tasksDonePct = analytics?.plannedTasksCompletedPct ?? 82;
  const streakDays = user?.streakDays || 5;

  const dailyBars = analytics?.dailyComparison || [
    { day: 'Mon', studyHours: 2.8, socialHours: 0.7 },
    { day: 'Tue', studyHours: 3.2, socialHours: 0.6 },
    { day: 'Wed', studyHours: 1.9, socialHours: 1.1 },
    { day: 'Thu', studyHours: 3.5, socialHours: 0.5 },
    { day: 'Fri', studyHours: 2.1, socialHours: 0.8 },
    { day: 'Sat', studyHours: 1.0, socialHours: 1.4 },
    { day: 'Sun', studyHours: 2.5, socialHours: 0.6 },
  ];

  const maxHours = 4.0;

  // Filter apps
  const filteredApps = activeCategoryFilter === 'all'
    ? allApps
    : allApps.filter((a) => a.category === activeCategoryFilter);

  // Category totals
  const categoryTotals = allApps.reduce((acc: Record<string, number>, app) => {
    acc[app.category] = (acc[app.category] || 0) + app.minutesUsed;
    return acc;
  }, {});

  const handleShare = () => {
    setShowExportModal(true);
    triggerConfetti();
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(
      `🏆 Aura Coach Achievement: Level ${user?.level || 2} unlocked! Maintained a ${streakDays}-day focus streak with ${deepStudy} hrs deep study! #AuraCoach`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <div
      className="flex-1 flex flex-col px-5 pt-4 pb-16 space-y-4 overflow-y-auto transition-colors"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Bar: Title "Weekly Analytics" and export/share icon */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold" style={{ color: currentTheme.textPrimary }}>
            Weekly Analytics
          </h1>
          <p className="text-[11px]" style={{ color: currentTheme.textMuted }}>
            Study focus vs. all external apps screen time
          </p>
        </div>
        <button
          onClick={handleShare}
          className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
          style={{
            backgroundColor: currentTheme.bgElevated,
            borderColor: currentTheme.borderBase,
            color: currentTheme.accentPrimary,
          }}
          title="Share Achievement"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Timeframe Control: Segmented pill selector */}
      <div
        className="p-1 rounded-xl border flex items-center justify-between transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        {(['This Week', 'Last Week', 'Month'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            style={{
              backgroundColor: timeframe === t ? currentTheme.accentPrimary : 'transparent',
              color: timeframe === t ? '#FFFFFF' : currentTheme.textSecondary,
              boxShadow: timeframe === t ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 2 x 2 Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Deep Study Time */}
        <div
          className="p-3.5 rounded-[14px] border shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: currentTheme.textMuted }}>
            <Clock className="w-3.5 h-3.5" style={{ color: currentTheme.accentPrimary }} />
            <span>Deep Study</span>
          </div>
          <div
            className="text-[22px] font-extrabold font-mono leading-tight"
            style={{ color: currentTheme.accentPrimary }}
          >
            {deepStudy} hrs
          </div>
          <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
            +18% vs prev week
          </span>
        </div>

        {/* Card 2: Time Saved */}
        <div
          className="p-3.5 rounded-[14px] border shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: currentTheme.textMuted }}>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Time Saved</span>
          </div>
          <div className="text-[22px] font-extrabold font-mono leading-tight text-sky-400">
            +{timeSaved} hrs
          </div>
          <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
            vs social baseline
          </span>
        </div>

        {/* Card 3: Tasks Done */}
        <div
          className="p-3.5 rounded-[14px] border shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: currentTheme.textMuted }}>
            <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Tasks Done</span>
          </div>
          <div className="text-[22px] font-extrabold font-mono leading-tight text-amber-400">
            {tasksDonePct}%
          </div>
          <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
            Target: &gt;75%
          </span>
        </div>

        {/* Card 4: Focus Streak */}
        <div
          className="p-3.5 rounded-[14px] border shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: currentTheme.textMuted }}>
            <Flame className="w-3.5 h-3.5" style={{ color: currentTheme.danger }} />
            <span>Focus Streak</span>
          </div>
          <div
            className="text-[22px] font-extrabold font-mono leading-tight"
            style={{ color: currentTheme.danger }}
          >
            {streakDays} Days
          </div>
          <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
            Consistent streak
          </span>
        </div>
      </div>

      {/* Streaks & Badges: XP Gamification, Zero-Drift Achievements & Pet Health System */}
      <StreaksAndBadges onOpenFocus={() => setActiveTab('focus')} />

      {/* ======================================================== */}
      {/* NEW: ALL OTHER APPS SCREEN TIME SECTION */}
      {/* ======================================================== */}
      <div
        className="p-4 rounded-[16px] border shadow-sm space-y-4 transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" style={{ color: currentTheme.accentPrimary }} />
            <div>
              <h3 className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
                All Other Apps Used Today
              </h3>
              <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                Total: <strong style={{ color: currentTheme.textPrimary }}>{formatHoursMins(totalScreenTimeMinutes)}</strong> across {allApps.length} apps
              </p>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold"
            style={{
              backgroundColor: currentTheme.accentTint,
              color: currentTheme.accentText,
            }}
          >
            Budget: {formatHoursMins(totalDailyAllowanceMinutes)}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {['all', 'social', 'entertainment', 'communication', 'browsing', 'gaming'].map((cat) => {
            const isCatActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className="px-2.5 py-1 rounded-lg border font-medium capitalize shrink-0 cursor-pointer transition-colors"
                style={{
                  backgroundColor: isCatActive ? currentTheme.accentPrimary : currentTheme.bgElevated,
                  borderColor: isCatActive ? currentTheme.accentPrimary : currentTheme.borderBase,
                  color: isCatActive ? '#FFFFFF' : currentTheme.textSecondary,
                }}
              >
                {cat} {categoryTotals[cat] ? `(${categoryTotals[cat]}m)` : ''}
              </button>
            );
          })}
        </div>

        {/* Apps List */}
        <div className="space-y-2.5">
          {filteredApps.map((app) => {
            const effectiveLimit = app.dailyAllowance + (app.unlockedExtraMinutes || 0);
            const pct = Math.min(100, Math.round((app.minutesUsed / effectiveLimit) * 100));
            const isExceeded = app.isRestricted && app.minutesUsed >= effectiveLimit;
            const isWarning = app.isRestricted && app.minutesUsed >= effectiveLimit * 0.8 && !isExceeded;

            return (
              <div
                key={app.appName}
                className="p-3 rounded-xl border flex flex-col gap-2 transition-all"
                style={{
                  backgroundColor: currentTheme.bgElevated,
                  borderColor: isExceeded ? currentTheme.danger : currentTheme.borderBase,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: app.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
                          {app.appName}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-semibold capitalize"
                          style={{
                            backgroundColor: currentTheme.bgSurface,
                            color: currentTheme.textMuted,
                          }}
                        >
                          {app.category}
                        </span>
                        {isExceeded && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                            Intercepted
                          </span>
                        )}
                        {isWarning && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                            80% Limit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: currentTheme.textPrimary }}>
                      {app.minutesUsed}m{' '}
                      <span className="font-normal" style={{ color: currentTheme.textMuted }}>
                        / {effectiveLimit}m
                      </span>
                    </span>

                    {/* Test usage button (+5 mins) */}
                    <button
                      onClick={() => simulateAppUsage(app.appName, 5)}
                      className="px-2 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1 cursor-pointer transition-all hover:opacity-80 active:scale-95"
                      style={{
                        backgroundColor: currentTheme.bgSurface,
                        borderColor: currentTheme.borderBase,
                        color: currentTheme.accentPrimary,
                      }}
                      title={`Simulate +5m usage on ${app.appName}`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>+5m</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: currentTheme.bgSurface }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: isExceeded ? currentTheme.danger : isWarning ? currentTheme.warning : app.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical clarification note */}
        <div
          className="p-2.5 rounded-lg border flex items-start gap-2 text-[11px]"
          style={{
            backgroundColor: currentTheme.bgElevated,
            borderColor: currentTheme.borderBase,
            color: currentTheme.textMuted,
          }}
        >
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: currentTheme.accentPrimary }} />
          <span>
            Android screen time across all other apps is synced in real-time with MongoDB. Click <strong>+5m</strong> on any app to test usage and trigger the Task-to-Unlock intercept when limits are reached!
          </span>
        </div>
      </div>

      {/* Daily Balance Bar Chart Card */}
      <div
        className="p-4 rounded-[14px] border shadow-sm transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
            Daily Balance (Study vs Social)
          </h3>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: currentTheme.accentPrimary }}
              />
              <span style={{ color: currentTheme.textSecondary }}>Focus Study</span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: currentTheme.danger }}
              />
              <span style={{ color: currentTheme.textSecondary }}>Social Apps</span>
            </div>
          </div>
        </div>

        {/* Bars Container */}
        <div
          className="h-36 flex items-end justify-between gap-2 pt-3 px-1 border-b"
          style={{ borderColor: currentTheme.borderBase }}
        >
          {dailyBars.map((bar) => {
            const studyH = (bar.studyHours / maxHours) * 100;
            const socialH = (bar.socialHours / maxHours) * 100;

            return (
              <div key={bar.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  {/* Focus Study Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${studyH}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-2.5 sm:w-3 rounded-t group-hover:brightness-110 transition-all relative"
                    style={{ backgroundColor: currentTheme.accentPrimary }}
                    title={`${bar.day} Study: ${bar.studyHours}h`}
                  />
                  {/* Social Media Screen Time Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${socialH}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                    className="w-2.5 sm:w-3 rounded-t group-hover:brightness-110 transition-all relative"
                    style={{ backgroundColor: currentTheme.danger }}
                    title={`${bar.day} Social: ${bar.socialHours}h`}
                  />
                </div>
                <span className="text-[10px] mt-2 font-mono" style={{ color: currentTheme.textMuted }}>
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Growth Insight: Card */}
      <div
        className="p-3.5 rounded-[14px] border-l-4 border shadow-sm transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderLeftColor: currentTheme.accentPrimary,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-start gap-2.5">
          <Lightbulb
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: currentTheme.accentPrimary }}
          />
          <p className="text-[12px] leading-relaxed" style={{ color: currentTheme.textPrimary }}>
            {analytics?.aiGrowthInsight ||
              'Focus peaks between 9:00 AM and 12:00 PM. Taking scheduled morning breaks prevented afternoon slumps.'}
          </p>
        </div>
      </div>

      {/* Shareable Milestone Card */}
      <div
        className="p-4 rounded-[14px] border shadow-md transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 border"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
                🏆 Level {user?.level || 3} Achieved • {streakDays}-Day Focus Streak
              </h4>
              <p className="text-[10px]" style={{ color: currentTheme.accentText }}>
                Top 5% consistency in your cohort
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full mt-2 py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: currentTheme.accentPrimary }}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Export Achievement Card</span>
        </button>
      </div>

      {/* Export / Share Achievement Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl z-10 flex flex-col items-center"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textPrimary,
              }}
            >
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-3 right-3 cursor-pointer hover:opacity-80"
                style={{ color: currentTheme.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Share Card Graphic Preview */}
              <div
                className="w-full rounded-xl p-5 border text-center my-3 relative overflow-hidden"
                style={{
                  backgroundColor: currentTheme.bgElevated,
                  borderColor: currentTheme.borderBase,
                }}
              >
                <span
                  className="text-[10px] font-mono uppercase tracking-widest font-semibold"
                  style={{ color: currentTheme.accentText }}
                >
                  AURA COACH MILESTONE
                </span>
                <div
                  className="w-16 h-16 mx-auto my-3 rounded-2xl border flex items-center justify-center text-3xl shadow-inner"
                  style={{
                    backgroundColor: currentTheme.accentTint,
                    borderColor: currentTheme.accentPrimary,
                  }}
                >
                  🏆
                </div>
                <h3 className="text-base font-bold" style={{ color: currentTheme.textPrimary }}>
                  {user?.name || 'Priya Raman'}
                </h3>
                <p className="text-xs font-semibold mt-0.5" style={{ color: currentTheme.accentPrimary }}>
                  Level {user?.level || 3} Achieved • {streakDays}-Day Streak
                </p>
                <div
                  className="mt-3 pt-3 border-t flex justify-around text-center text-xs"
                  style={{ borderColor: currentTheme.borderBase }}
                >
                  <div>
                    <span
                      className="block font-mono font-bold"
                      style={{ color: currentTheme.accentPrimary }}
                    >
                      {deepStudy} hrs
                    </span>
                    <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                      Deep Work
                    </span>
                  </div>
                  <div>
                    <span className="block text-sky-400 font-mono font-bold">+{timeSaved} hrs</span>
                    <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                      Saved
                    </span>
                  </div>
                  <div>
                    <span className="block text-amber-400 font-mono font-bold">{tasksDonePct}%</span>
                    <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                      Execution
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleCopyShare}
                  className="py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: currentTheme.accentPrimary }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="py-2.5 rounded-xl border font-semibold text-xs transition-colors cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: currentTheme.bgElevated,
                    borderColor: currentTheme.borderBase,
                    color: currentTheme.textSecondary,
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
