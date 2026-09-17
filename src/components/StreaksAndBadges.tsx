import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Shield,
  Award,
  Zap,
  Sparkles,
  Heart,
  Crown,
  Lock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Smartphone,
  Play,
  ArrowRight,
  Gift,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { useAuth } from '../context/AuthContext.js';
import { CompanionSprite } from './CompanionSprite.js';
import { FocusBadge } from '../types.js';

interface StreaksAndBadgesProps {
  compact?: boolean;
  onOpenFocus?: () => void;
}

export const StreaksAndBadges: React.FC<StreaksAndBadgesProps> = ({
  compact = false,
  onOpenFocus,
}) => {
  const { user } = useAuth();
  const {
    streaksAndBadges,
    petStatus,
    currentTheme,
    startFocusSession,
    simulateZeroDriftCompletion,
    zeroDriftCelebration,
    closeZeroDriftCelebration,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'zero_drift' | 'streak' | 'pet_health'>('all');
  const [selectedBadge, setSelectedBadge] = useState<FocusBadge | null>(null);

  const cleanStreak = streaksAndBadges.cleanFocusStreak;
  const userXp = user?.xp || 0;
  const userLevel = user?.level || 1;
  const xpInCurrentLevel = userXp % 300;
  const xpRequiredForNext = 300;
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNext) * 100));

  const filteredBadges = streaksAndBadges.badges.filter((b) => {
    if (selectedFilter === 'all') return true;
    return b.category === selectedFilter;
  });

  const unlockedCount = streaksAndBadges.badges.filter((b) => b.unlocked).length;
  const totalBadges = streaksAndBadges.badges.length;

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return {
          bg: 'bg-cyan-950/40',
          border: 'border-cyan-400/40',
          text: 'text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
          glow: 'shadow-[0_0_12px_rgba(34,211,238,0.25)]',
        };
      case 'gold':
        return {
          bg: 'bg-amber-950/30',
          border: 'border-amber-400/40',
          text: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
        };
      case 'silver':
        return {
          bg: 'bg-slate-800/40',
          border: 'border-slate-500/40',
          text: 'text-slate-200',
          badge: 'bg-slate-700/50 text-slate-200 border-slate-500/30',
          glow: 'shadow-[0_0_8px_rgba(148,163,184,0.15)]',
        };
      default: // bronze
        return {
          bg: 'bg-orange-950/30',
          border: 'border-orange-500/30',
          text: 'text-orange-300',
          badge: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
          glow: '',
        };
    }
  };

  const getBadgeIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'shield':
        return <Shield className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'heart':
        return <Heart className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'smartphone':
        return <Smartphone className={className} />;
      case 'clock':
        return <Clock className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  return (
    <div
      id="streaks-and-badges-container"
      className="w-full rounded-2xl border p-4 sm:p-5 space-y-4 transition-all"
      style={{
        backgroundColor: currentTheme.bgSurface,
        borderColor: currentTheme.borderBase,
      }}
    >
      {/* Top Banner: Clean Focus Streak & Level XP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Zero-Drift Focus Streak
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                {cleanStreak} Clean {cleanStreak === 1 ? 'Sprint' : 'Sprints'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Earn +{Math.min((cleanStreak + 1) * 30, 250)} bonus XP for your next distraction-free sprint.
            </p>
          </div>
        </div>

        {/* Level & XP Gauge */}
        <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
          <div className="flex flex-col items-end text-right">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Level {userLevel} Scholar
            </span>
            <span className="text-[10px] text-slate-400">
              {userXp} Total XP ({xpInCurrentLevel}/{xpRequiredForNext} XP to Lvl {userLevel + 1})
            </span>
            {/* XP Bar */}
            <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pet Health & Vitality Synergy Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/30 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <CompanionSprite state={petStatus.mood} size="sm" />
            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                petStatus.energy >= 70 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-200">
                Aura's Health Status:
              </h4>
              <span
                className={`text-xs font-bold ${
                  petStatus.energy >= 70
                    ? 'text-emerald-400'
                    : petStatus.energy >= 40
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {petStatus.energy}% Vitality ({petStatus.mood === 'happy' ? 'Thriving & Happy' : 'Needs Focus Attention'})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Every zero-drift focus session restores Aura to 100% health and awards streak bonus XP!
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 shrink-0">
          <Heart className="w-3.5 h-3.5 fill-emerald-400" />
          <span>Health Linked</span>
        </div>
      </div>

      {/* Badges Filter Tabs & Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Focus Badges & Trophies ({unlockedCount}/{totalBadges} Unlocked)
            </h4>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            {(['all', 'zero_drift', 'streak', 'pet_health'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer capitalize ${
                  selectedFilter === tab
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all'
                  ? 'All'
                  : tab === 'zero_drift'
                  ? 'Zero-Drift'
                  : tab === 'streak'
                  ? 'Streaks'
                  : 'Pet Care'}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredBadges.map((badge) => {
            const style = getTierColors(badge.tier);
            const isCompleted = badge.unlocked;
            const progressPct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedBadge(badge)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  style.bg
                } ${style.border} ${style.glow} ${
                  isCompleted ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? `${style.badge}`
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        getBadgeIcon(badge.icon, 'w-4 h-4')
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="text-xs font-bold text-white leading-tight">
                          {badge.name}
                        </h5>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${style.badge}`}>
                          {badge.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-amber-300" />
                    +{badge.xpReward} XP
                  </span>
                </div>

                {/* Pet benefit callout */}
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-medium flex items-center gap-1 truncate max-w-[80%]">
                    <span>🌿</span>
                    <span className="truncate">{badge.petBenefit}</span>
                  </span>

                  {isCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5 shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono text-[10px] shrink-0">
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  )}
                </div>

                {/* Progress bar if incomplete */}
                {!isCompleted && (
                  <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden mt-1.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action Footer: Start Zero-Drift Sprint & Simulate Demo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-teal-400" />
          <span>Zero-Drift rule: No tab switching & no opening restricted apps.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick simulation button for tests & teacher review */}
          <button
            id="btn-simulate-zero-drift-session"
            onClick={() => simulateZeroDriftCompletion()}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Complete a zero-drift sprint to test XP and pet health rewards"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Clean Sprint</span>
          </button>

          <button
            id="btn-start-zero-drift-session"
            onClick={() => {
              if (onOpenFocus) {
                onOpenFocus();
              } else {
                startFocusSession(undefined, 25);
              }
            }}
            className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: currentTheme.accentPrimary }}
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Clean Sprint</span>
          </button>
        </div>
      </div>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl z-10 space-y-4"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textPrimary,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xl">
                  {getBadgeIcon(selectedBadge.icon, 'w-6 h-6')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{selectedBadge.name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border bg-purple-500/20 text-purple-200 border-purple-400/30">
                      {selectedBadge.tier}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-400">
                    +{selectedBadge.xpReward} XP Reward
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedBadge.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span>🌿</span> Pet Health & Motivation Benefit
                </span>
                <p className="text-xs text-slate-200 leading-snug">
                  {selectedBadge.petBenefit}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Progress:</span>
                <span className="font-bold text-white">
                  {selectedBadge.progress} / {selectedBadge.maxProgress}{' '}
                  {selectedBadge.unlocked ? '(Completed)' : ''}
                </span>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90"
                style={{ backgroundColor: currentTheme.accentPrimary }}
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zero-Drift Victory Celebration Modal */}
      <AnimatePresence>
        {zeroDriftCelebration && zeroDriftCelebration.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeZeroDriftCelebration}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl z-10 space-y-4 text-center"
              style={{
                backgroundColor: currentTheme.bgSurface,
                borderColor: '#10B981',
                color: currentTheme.textPrimary,
              }}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-bounce">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {zeroDriftCelebration.isZeroDrift ? 'Zero-Drift Sprint Victory! 🏆' : 'Sprint Completed!'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {zeroDriftCelebration.isZeroDrift
                    ? 'No tab switches, no distraction drift. Aura is 100% healthy and joyful!'
                    : 'Good effort! Complete your next session without tab switching to reclaim clean streak bonuses.'}
                </p>
              </div>

              {/* XP Rewards Grid */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Base Focus XP</span>
                  <span className="font-bold text-white">+{zeroDriftCelebration.baseXp} XP</span>
                </div>
                {zeroDriftCelebration.streakBonusXp > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-medium flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      Clean Streak Multiplier
                    </span>
                    <span className="font-bold text-amber-300">+{zeroDriftCelebration.streakBonusXp} XP</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-black text-emerald-400">
                  <span>Total XP Earned</span>
                  <span>+{zeroDriftCelebration.totalXpEarned} XP</span>
                </div>
              </div>

              {/* Pet Health Notification */}
              {zeroDriftCelebration.petHealthRestored && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-left">
                  <CompanionSprite state="happy" size="sm" />
                  <div>
                    <h5 className="text-[11px] font-bold text-emerald-300">Aura Restored to 100% Health! 🌿</h5>
                    <p className="text-[10px] text-slate-300">
                      Your zero-drift focus protected Aura and maxed out motivation.
                    </p>
                  </div>
                </div>
              )}

              {/* Unlocked Badges alert */}
              {zeroDriftCelebration.newBadges && zeroDriftCelebration.newBadges.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-left space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-400" />
                    New Badge Unlocked!
                  </span>
                  {zeroDriftCelebration.newBadges.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{b.name}</span>
                      <span className="text-amber-300 font-mono">+{b.xpReward} XP</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Level Up Notification */}
              {zeroDriftCelebration.leveledUp && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
                  <span>Leveled Up to Level {zeroDriftCelebration.currentLevel}!</span>
                </div>
              )}

              <button
                id="btn-claim-zero-drift-reward"
                onClick={closeZeroDriftCelebration}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: currentTheme.accentPrimary }}
              >
                <span>Claim XP & Keep Growing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
