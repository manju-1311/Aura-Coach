import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Zap,
  AlertCircle,
  Clock,
  ShieldCheck,
  Shield,
  Flame,
  Play,
  RotateCcw,
  Sliders,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { useAuth } from '../context/AuthContext.js';
import { CompanionSprite } from './CompanionSprite.js';

export const PetStatus: React.FC = () => {
  const { user } = useAuth();
  const {
    petStatus,
    triggerPetDrift,
    recordSocialAbstinence,
    setSocialAbstinenceGoal,
    petThePet,
    cheerUpPetWithFocus,
    startFocusSession,
    streaksAndBadges,
    setActiveTab,
  } = useApp();

  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const isEnabled = user?.petCompanionEnabled ?? true;

  const handlePetAura = () => {
    petThePet();
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1200);
  };

  const handleQuickSprint = () => {
    cheerUpPetWithFocus();
    startFocusSession(undefined, 5);
  };

  const isGoalAchieved =
    petStatus.socialAbstinenceMinutes >= petStatus.socialAbstinenceGoalMinutes &&
    !petStatus.hasRecentDrift;

  // Determine effective display mood
  const currentMood = petStatus.hasRecentDrift
    ? 'needy'
    : isGoalAchieved
    ? 'happy'
    : petStatus.mood;

  // Motivation tier styling
  const motivationColor =
    petStatus.energy >= 70
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : petStatus.energy >= 40
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  const motivationLabel =
    petStatus.energy >= 70
      ? 'High Motivation'
      : petStatus.energy >= 40
      ? 'Moderate Motivation'
      : 'Needs Attention';

  const goalOptions = [15, 30, 45, 60];

  return (
    <div
      id="pet-status-card"
      className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-5 mb-5 backdrop-blur-md"
    >
      {/* Background ambient radial glow depending on mood */}
      <div
        className={`pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full blur-3xl transition-colors duration-700 ${
          currentMood === 'needy'
            ? 'bg-amber-500/15'
            : currentMood === 'happy'
            ? 'bg-emerald-500/15'
            : 'bg-emerald-600/10'
        }`}
      />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
                {isEnabled ? 'Aura Companion Status' : 'Mindful Focus Meter'}
              </h2>
              <span
                id="pet-motivation-badge"
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${motivationColor}`}
              >
                {motivationLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Reflects focus discipline &amp; social media abstinence
            </p>
          </div>
        </div>

        {/* Goal period toggle button */}
        <button
          id="btn-pet-goal-settings"
          onClick={() => setIsGoalSelectorOpen(!isGoalSelectorOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors"
          title="Adjust social detox goal target"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Goal: {petStatus.socialAbstinenceGoalMinutes}m</span>
        </button>
      </div>

      {/* Goal configuration bar (expandable) */}
      <AnimatePresence>
        {isGoalSelectorOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4 pb-3 border-b border-slate-800"
          >
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Target Social Detox Window:
              </span>
              <div className="flex items-center gap-1.5">
                {goalOptions.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setSocialAbstinenceGoal(mins);
                      setIsGoalSelectorOpen(false);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                      petStatus.socialAbstinenceGoalMinutes === mins
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Sprite visual on left + Metrics on right */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Pet Visual Display */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 relative">
          {/* Floating Hearts Animation when petted */}
          <AnimatePresence>
            {showHearts && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -28, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 z-20"
              >
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <Sparkles className="w-4 h-4 text-amber-300" />
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              </motion.div>
            )}
          </AnimatePresence>

          <div
            onClick={handlePetAura}
            className="cursor-pointer group flex flex-col items-center justify-center"
            title="Click to encourage Aura"
          >
            <CompanionSprite state={currentMood} size="lg" showLabel={false} />
            <span
              className={`text-xs font-medium mt-2 px-2.5 py-0.5 rounded-full transition-colors ${
                currentMood === 'needy'
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  : currentMood === 'happy'
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-slate-300 bg-slate-800/60 border border-slate-700/40'
              }`}
            >
              {currentMood === 'needy'
                ? '🥺 Seeking Attention'
                : currentMood === 'happy'
                ? '✨ Joyful & Thriving'
                : '📖 Mindful & Calm'}
            </span>
          </div>

          {/* Quick Pet button */}
          <button
            id="btn-pet-encourage"
            onClick={handlePetAura}
            className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700/70 transition-colors"
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Pet &amp; Encourage</span>
          </button>
        </div>

        {/* Meters & Social Media Tracker */}
        <div className="sm:col-span-7 flex flex-col justify-center space-y-3.5">
          {/* Energy & Motivation Progress */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Motivation &amp; Energy
              </span>
              <span className="font-semibold text-slate-200">
                {petStatus.energy}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-all duration-500 ${
                  petStatus.energy >= 70
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : petStatus.energy >= 40
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${petStatus.energy}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* Social Media Abstinence Streak */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                Off Social Media Streak
              </span>
              <span className="font-semibold text-slate-200">
                {petStatus.socialAbstinenceMinutes}m / {petStatus.socialAbstinenceGoalMinutes}m
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalAchieved
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-r from-slate-600 to-teal-400'
                }`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    (petStatus.socialAbstinenceMinutes /
                      petStatus.socialAbstinenceGoalMinutes) *
                      100
                  )}%`,
                }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* Status Message Prompt Banner */}
          {currentMood === 'needy' ? (
            <div
              id="pet-needy-banner"
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">
                  Aura needs your attention!
                </p>
                <p className="text-amber-200/80 mt-0.5 text-[11px] leading-relaxed">
                  {petStatus.lastDriftReason || 'A focus drift was detected.'} Start a 5-min sprint or pet Aura to restore energy.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    id="btn-recover-focus-sprint"
                    onClick={handleQuickSprint}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-semibold text-[11px] hover:bg-amber-400 transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Quick 5m Sprint</span>
                  </button>
                  <button
                    onClick={handlePetAura}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-medium transition-colors"
                  >
                    <Heart className="w-3 h-3 text-rose-400" />
                    <span>Encourage Aura</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isGoalAchieved ? (
            <div
              id="pet-happy-banner"
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-emerald-300">
                  Target Met! Aura is Happy &amp; Proud
                </p>
                <p className="text-emerald-200/80 mt-0.5 text-[11px] leading-relaxed">
                  You stayed off social media for {petStatus.socialAbstinenceMinutes} minutes (Target: {petStatus.socialAbstinenceGoalMinutes}m). Your pet's energy is peaked!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-slate-300">
                  Detox in progress
                </p>
                <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                  Stay off social media for {Math.max(0, petStatus.socialAbstinenceGoalMinutes - petStatus.socialAbstinenceMinutes)} more minutes to make Aura ecstatic!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Streaks & Badges Quick Synergy Bar */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
          </span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <span>{streaksAndBadges.cleanFocusStreak} Clean Focus Streak</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                +{Math.min((streaksAndBadges.cleanFocusStreak + 1) * 30, 250)} XP
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Zero-drift sessions grant bonus XP and maintain 100% pet health
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('stats')}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Award className="w-3 h-3 text-purple-300" />
          <span>
            {streaksAndBadges.badges.filter((b) => b.unlocked).length}/{streaksAndBadges.badges.length} Badges
          </span>
        </button>
      </div>

      {/* Interactive Demonstration & Discipline Controls Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Reacts live to social intercepts &amp; focus sessions</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Test staying off social */}
          <button
            id="btn-pet-add-detox-time"
            onClick={() => recordSocialAbstinence(15)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
            title="Log 15 minutes of staying off social media"
          >
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>+15m Off Social</span>
          </button>

          {/* Test drift */}
          <button
            id="btn-pet-simulate-drift"
            onClick={() => triggerPetDrift('Distraction drift test: opened social media')}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
            title="Simulate drift to test pet needing attention"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Simulate Drift</span>
          </button>
        </div>
      </div>
    </div>
  );
};
