import React, { useState } from 'react';
import { Target, BookOpen, Code2, Sprout, ArrowRight, Instagram, Moon, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { GoalType, ThemeType } from '../../types.js';
import { THEMES } from '../../utils/theme.js';

export const OnboardingScreen: React.FC = () => {
  const { setCurrentScreen, setActiveTab, setAppTheme, themeId, currentTheme } = useApp();
  const { user, updateProfile } = useAuth();

  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([
    'Placement Interviews',
    'Semester Exam Prep',
  ]);
  const [socialBudget, setSocialBudget] = useState<number>(45);
  const [petEnabled, setPetEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const goalOptions: { id: GoalType; label: string; icon: string }[] = [
    { id: 'Placement Interviews', label: 'Placement Interviews', icon: '🎯' },
    { id: 'Semester Exam Prep', label: 'Semester Exam Prep', icon: '📚' },
    { id: 'Learn a Technical Skill', label: 'Learn a Technical Skill', icon: '💻' },
    { id: 'Habit & Sleep Routine', label: 'Habit & Sleep Routine', icon: '🌱' },
  ];

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    await updateProfile({
      selectedGoals,
      targetMilestone: selectedGoals[0] || 'Placement Interview Prep',
      dailySocialBudgetMinutes: socialBudget,
      activeTheme: themeId,
      petCompanionEnabled: petEnabled,
    });
    setLoading(false);
    setCurrentScreen('main');
    setActiveTab('today');
  };

  return (
    <div
      className="flex-1 flex flex-col justify-between px-6 pt-7 pb-6 min-h-full overflow-y-auto transition-colors"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      <div>
        {/* Top Stepper */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="px-3 py-1 rounded-full border text-xs font-semibold"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentText,
            }}
          >
            Step 1 of 3
          </span>
          <button
            onClick={handleFinish}
            className="text-xs transition-colors font-medium cursor-pointer hover:underline"
            style={{ color: currentTheme.textMuted }}
          >
            Skip
          </button>
        </div>

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[22px] font-bold" style={{ color: currentTheme.textPrimary }}>
            Let’s calibrate your focus
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: currentTheme.textSecondary }}>
            Tailoring your AI coach to your academic milestones.
          </p>
        </div>

        {/* Goal Multi-Select Chips */}
        <div className="mb-6">
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: currentTheme.textMuted }}
          >
            Priority Academic Goals
          </label>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((g) => {
              const isSelected = selectedGoals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGoal(g.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border"
                  style={{
                    backgroundColor: isSelected ? currentTheme.accentTint : currentTheme.bgSurface,
                    borderColor: isSelected ? currentTheme.accentPrimary : currentTheme.borderBase,
                    color: isSelected ? currentTheme.accentText : currentTheme.textSecondary,
                  }}
                >
                  <span className="text-sm">{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Screen Time Budget Card */}
        <div
          className="p-4 rounded-[14px] border mb-5 shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
                Daily Social Allowance
              </span>
            </div>
            <span
              className="px-2.5 py-0.5 rounded-full border text-[11px] font-bold"
              style={{
                backgroundColor: currentTheme.accentTint,
                borderColor: currentTheme.accentPrimary,
                color: currentTheme.accentText,
              }}
            >
              {socialBudget} mins/day
            </span>
          </div>

          <div className="mb-2">
            <input
              type="range"
              min="15"
              max="90"
              step="15"
              value={socialBudget}
              onChange={(e) => setSocialBudget(Number(e.target.value))}
              className="w-full cursor-pointer h-1.5 rounded-lg"
              style={{ accentColor: currentTheme.accentPrimary }}
            />
            <div className="flex justify-between text-[10px] mt-1 font-mono" style={{ color: currentTheme.textMuted }}>
              <span>15m</span>
              <span>30m</span>
              <span className="font-bold" style={{ color: currentTheme.accentPrimary }}>45m</span>
              <span>1h</span>
              <span>1.5h+</span>
            </div>
          </div>

          <p className="text-[12px] mt-2 italic leading-relaxed" style={{ color: currentTheme.textMuted }}>
            "When time runs out, unlock extra minutes by completing micro-tasks."
          </p>
        </div>

        {/* Base Colour Theme Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label
              className="block text-xs font-semibold uppercase tracking-wider"
              style={{ color: currentTheme.textMuted }}
            >
              Choose Base Colour Theme
            </label>
            <span
              className="text-[11px] font-semibold"
              style={{ color: currentTheme.accentPrimary }}
            >
              {currentTheme.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {(Object.keys(THEMES) as ThemeType[]).map((key) => {
              const t = THEMES[key];
              const isSelected = themeId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAppTheme(key)}
                  className="p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? t.accentTint : currentTheme.bgSurface,
                    borderColor: isSelected ? t.accentPrimary : currentTheme.borderBase,
                    boxShadow: isSelected ? `0 0 10px ${t.accentPrimary}30` : 'none',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 shadow-xs"
                    style={{
                      backgroundColor: t.accentPrimary,
                      borderColor: t.borderBase,
                      color: '#FFFFFF',
                    }}
                  >
                    {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : t.emoji}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xs font-bold truncate"
                      style={{ color: isSelected ? t.accentText : currentTheme.textPrimary }}
                    >
                      {t.name}
                    </div>
                    <div className="text-[9px] truncate" style={{ color: currentTheme.textMuted }}>
                      {t.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modular Companion Switch */}
        <div
          className="p-3.5 rounded-xl border flex items-center justify-between mb-4 transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm"
              style={{
                backgroundColor: currentTheme.accentTint,
                borderColor: currentTheme.accentPrimary,
              }}
            >
              🐾
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
                Enable Digital Pet Companion
              </div>
              <div className="text-[11px]" style={{ color: currentTheme.textMuted }}>
                Grows with your daily focus sessions
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPetEnabled(!petEnabled)}
            className="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: petEnabled ? currentTheme.accentPrimary : currentTheme.borderBase,
            }}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                petEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleFinish}
          disabled={loading}
          className="w-full h-[52px] active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
          style={{ backgroundColor: currentTheme.accentPrimary }}
        >
          <span>Continue to Study Schedule</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
