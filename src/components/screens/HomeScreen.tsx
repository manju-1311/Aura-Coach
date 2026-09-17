import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Flame,
  Star,
  Play,
  CheckCircle2,
  Clock,
  Plus,
  Smartphone,
  RefreshCw,
  MoreVertical,
  Check,
  ShieldAlert,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { TaskItem } from '../../types.js';
import { PetStatus } from '../PetStatus.js';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    updateTaskStatus,
    addTask,
    startFocusSession,
    screenTime,
    allApps,
    totalScreenTimeMinutes,
    totalDailyAllowanceMinutes,
    simulateAppUsage,
    simulateScreenTimeUse,
    setIsInterceptModalOpen,
    aiAdvice,
    isLoadingAdvice,
    refreshAdvice,
    generateAISchedule,
    isLoadingTasks,
    currentTheme,
    setActiveTab,
  } = useApp();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMicroTask, setIsMicroTask] = useState(false);

  const activeTask = tasks.find((t) => t.status === 'active');
  const queuedTasks = tasks.filter((t) => t.status === 'queued');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(
      newTaskTitle.trim(),
      isMicroTask ? 'Micro-Task' : 'Core Focus',
      Number(newTaskDuration) || 30,
      'medium',
      isMicroTask
    );
    setNewTaskTitle('');
    setShowAddForm(false);
    setIsMicroTask(false);
  };

  const displayName = user?.name ? user.name.split(' ')[0] : 'Priya';

  return (
    <div
      className="flex-1 flex flex-col px-5 pt-4 pb-16 space-y-4 overflow-y-auto transition-colors"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Bar: Avatar, Greeting, Streak badge, Level pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full p-[1.5px] shadow-sm shrink-0"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.accentPrimary}, ${currentTheme.accentSecondary})`,
            }}
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${displayName}`}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
              style={{ backgroundColor: currentTheme.bgSurface }}
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-xs" style={{ color: currentTheme.textMuted }}>
              Good morning,
            </span>
            <h2 className="text-sm font-bold leading-tight" style={{ color: currentTheme.textPrimary }}>
              {displayName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
              color: '#F59E0B',
            }}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{user?.streakDays || 5} Days</span>
          </div>

          {/* Level Pill */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentText,
            }}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Level {user?.level || 3}</span>
          </div>
        </div>
      </div>

      {/* Pet Status Component: Motivation & Energy level, Social detox discipline & Drift reactivity */}
      <PetStatus />

      {/* Macro Goal Anchor Card */}
      <div
        className="p-4 rounded-[14px] border shadow-sm transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎯</span>
            <h3 className="text-[13px] font-semibold" style={{ color: currentTheme.textPrimary }}>
              {user?.targetMilestone || 'Placement Interview Prep'}
            </h3>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentText,
            }}
          >
            68% Complete
          </span>
        </div>

        {/* Linear progress bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden mb-2"
          style={{ backgroundColor: currentTheme.bgElevated }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: '68%',
              backgroundColor: currentTheme.accentPrimary,
            }}
          />
        </div>

        {/* Footnote */}
        <p className="text-[11px] flex items-center justify-between" style={{ color: currentTheme.textMuted }}>
          <span>Next milestone: Mock Technical Coding Round</span>
          <span className="font-semibold" style={{ color: currentTheme.accentText }}>
            in 5 days
          </span>
        </p>
      </div>

      {/* AI Coach Dynamic Banner */}
      <div
        className="p-3.5 rounded-[14px] border shadow-sm relative overflow-hidden transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.accentPrimary }} />
            <span
              className="text-[12px] font-bold tracking-wide uppercase"
              style={{ color: currentTheme.accentText }}
            >
              ✨ AI Coach Suggestion
            </span>
          </div>
          <button
            onClick={() => refreshAdvice()}
            disabled={isLoadingAdvice}
            className="p-1 rounded-md transition-colors cursor-pointer hover:opacity-80"
            style={{ color: currentTheme.textMuted }}
            title="Refresh Coach Advice"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdvice ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {typeof aiAdvice === 'object' && aiAdvice !== null ? (
          <div className="space-y-1">
            {aiAdvice.headline && (
              <h4 className="text-xs font-bold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                {aiAdvice.headline}
              </h4>
            )}
            <p className="text-xs leading-relaxed" style={{ color: currentTheme.textSecondary }}>
              {aiAdvice.body}
            </p>
            {aiAdvice.actionableStep && (
              <div
                className="mt-1.5 pt-1.5 border-t flex items-center gap-1.5 text-[11px] font-semibold"
                style={{
                  borderColor: currentTheme.borderBase,
                  color: currentTheme.accentPrimary,
                }}
              >
                <span>💡 Action:</span>
                <span className="font-normal" style={{ color: currentTheme.textSecondary }}>
                  {aiAdvice.actionableStep}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs leading-relaxed" style={{ color: currentTheme.textSecondary }}>
            {typeof aiAdvice === 'string'
              ? aiAdvice
              : 'Focus peaks between 9:00 AM and 12:00 PM. Tackle high-priority milestones early for peak cognitive retention.'}
          </p>
        )}
      </div>

      {/* Agentic AI Study Assistant Launcher Card */}
      <div
        onClick={() => setActiveTab('agent')}
        className="p-3.5 rounded-[14px] border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.accentPrimary,
          boxShadow: `0 0 16px ${currentTheme.accentPrimary}33`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
            style={{
              backgroundColor: currentTheme.accentTint,
              borderColor: currentTheme.accentPrimary,
              color: currentTheme.accentPrimary,
            }}
          >
            <Brain className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight" style={{ color: currentTheme.textPrimary }}>
                Aura Study Agent
              </span>
              <span
                className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: currentTheme.accentTint,
                  color: currentTheme.accentText,
                }}
              >
                Agentic
              </span>
            </div>
            <p className="text-[11px] truncate" style={{ color: currentTheme.textMuted }}>
              Upload notes/PDFs for mock tests, summaries & active recall
            </p>
          </div>
        </div>

        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: currentTheme.bgElevated,
            borderColor: currentTheme.borderBase,
            color: currentTheme.accentPrimary,
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Section Header: Today's Focus Queue + Auto-Schedule AI Button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.textMuted }}>
            Today's Focus Queue
          </h3>
        </div>
        <button
          onClick={generateAISchedule}
          disabled={isLoadingTasks}
          className="text-xs font-semibold flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80"
          style={{ color: currentTheme.accentPrimary }}
        >
          <Sparkles className="w-3 h-3" />
          <span>{isLoadingTasks ? 'Regenerating...' : 'Auto-Schedule AI'}</span>
        </button>
      </div>

      {/* Task Stack Container */}
      <div className="space-y-2.5">
        {/* Active Task (Card 1) */}
        {activeTask ? (
          <motion.div
            layout
            className="p-4 rounded-[14px] border-2 flex items-center justify-between gap-3 shadow-md relative overflow-hidden"
            style={{
              backgroundColor: currentTheme.bgSurface,
              borderColor: currentTheme.accentPrimary,
            }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => updateTaskStatus(activeTask.id, 'completed')}
                className="w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0"
                style={{
                  borderColor: currentTheme.accentPrimary,
                  backgroundColor: currentTheme.accentTint,
                }}
                title="Mark completed"
              >
                <Check className="w-3.5 h-3.5" style={{ color: currentTheme.accentPrimary }} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: currentTheme.accentTint,
                      color: currentTheme.accentText,
                    }}
                  >
                    {activeTask.tag}
                  </span>
                  <span
                    className="text-[11px] flex items-center gap-1 font-mono"
                    style={{ color: currentTheme.textMuted }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{activeTask.durationMinutes} min</span>
                  </span>
                </div>
                <h4 className="text-[13px] font-bold truncate" style={{ color: currentTheme.textPrimary }}>
                  {activeTask.title}
                </h4>
              </div>
            </div>

            <button
              onClick={() => startFocusSession(activeTask, activeTask.durationMinutes)}
              className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 active:scale-95 hover:opacity-90"
              style={{ backgroundColor: currentTheme.accentPrimary }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
          </motion.div>
        ) : null}

        {/* Queued Tasks */}
        {queuedTasks.map((t) => (
          <motion.div
            key={t.id}
            layout
            className="p-3 rounded-[12px] border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: currentTheme.bgSurface,
              borderColor: currentTheme.borderBase,
            }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => updateTaskStatus(t.id, 'completed')}
                className="w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 hover:border-emerald-500"
                style={{
                  borderColor: currentTheme.borderBase,
                  backgroundColor: currentTheme.bgElevated,
                }}
              >
                <Check className="w-3.5 h-3.5 opacity-0 hover:opacity-100" style={{ color: currentTheme.accentPrimary }} />
              </button>

              <div className="min-w-0">
                <h4 className="text-xs font-semibold truncate" style={{ color: currentTheme.textPrimary }}>
                  {t.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                    [{t.tag}]
                  </span>
                  <span className="text-[10px] flex items-center gap-0.5 font-mono" style={{ color: currentTheme.textMuted }}>
                    <Clock className="w-2.5 h-2.5" />
                    {t.durationMinutes} min
                  </span>
                  {t.isMicroTask && (
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] border font-semibold"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        borderColor: 'rgba(245, 158, 11, 0.3)',
                        color: '#F59E0B',
                      }}
                    >
                      Unlocks +15m Apps
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => startFocusSession(t, t.durationMinutes)}
              className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-80"
              style={{ color: currentTheme.accentPrimary }}
              title="Focus on this task"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}

        {/* Completed Tasks Accordion */}
        {completedTasks.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-medium" style={{ color: currentTheme.textMuted }}>
              Completed ({completedTasks.length})
            </span>
            <div className="space-y-1.5 mt-1 opacity-75">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="px-3 py-2 rounded-lg border flex items-center justify-between text-xs"
                  style={{
                    backgroundColor: currentTheme.bgElevated,
                    borderColor: currentTheme.borderBase,
                    color: currentTheme.textMuted,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: currentTheme.accentPrimary }} />
                    <span className="line-through">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono">{t.durationMinutes}m</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick-Add Field */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-[12px] border border-dashed text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            style={{
              borderColor: currentTheme.borderBase,
              backgroundColor: currentTheme.bgSurface,
              color: currentTheme.textMuted,
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add a quick task...</span>
          </button>
        ) : (
          <form
            onSubmit={handleQuickAdd}
            className="p-3 rounded-xl border space-y-2"
            style={{
              backgroundColor: currentTheme.bgSurface,
              borderColor: currentTheme.borderBase,
            }}
          >
            <input
              type="text"
              required
              autoFocus
              placeholder="Task name (e.g. Solve 2 LeetCode problems)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border text-xs outline-none"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textPrimary,
              }}
            />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  className="px-2 py-1 rounded border text-xs"
                  style={{
                    backgroundColor: currentTheme.bgElevated,
                    borderColor: currentTheme.borderBase,
                    color: currentTheme.textPrimary,
                  }}
                >
                  <option value="15">15 min</option>
                  <option value="25">25 min (Pomodoro)</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                </select>

                <label className="flex items-center gap-1 text-[11px] cursor-pointer" style={{ color: currentTheme.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={isMicroTask}
                    onChange={(e) => setIsMicroTask(e.target.checked)}
                    className="rounded cursor-pointer"
                  />
                  <span>Micro-Task (Unlocks Social)</span>
                </label>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 text-xs cursor-pointer"
                  style={{ color: currentTheme.textMuted }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded text-white font-semibold text-xs cursor-pointer"
                  style={{ backgroundColor: currentTheme.accentPrimary }}
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ======================================================== */}
      {/* ALL APPS SCREEN TIME WIDGET */}
      {/* ======================================================== */}
      <div
        className="p-4 rounded-[14px] border shadow-sm space-y-3 transition-colors"
        style={{
          backgroundColor: currentTheme.bgSurface,
          borderColor: currentTheme.borderBase,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" style={{ color: currentTheme.accentPrimary }} />
            <span className="text-xs font-semibold" style={{ color: currentTheme.textPrimary }}>
              All Apps Screen Time: {totalScreenTimeMinutes}m / {totalDailyAllowanceMinutes}m
            </span>
          </div>

          <button
            onClick={() => setActiveTab('stats')}
            className="text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer hover:underline"
            style={{ color: currentTheme.accentPrimary }}
          >
            <span>Breakdown</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-app mini distribution bar */}
        <div
          className="w-full h-2.5 rounded-full overflow-hidden flex"
          style={{ backgroundColor: currentTheme.bgElevated }}
        >
          {allApps.map((app) => {
            const widthPct = totalScreenTimeMinutes > 0 ? (app.minutesUsed / totalScreenTimeMinutes) * 100 : 0;
            if (widthPct === 0) return null;
            return (
              <div
                key={app.appName}
                title={`${app.appName}: ${app.minutesUsed}m`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: app.color,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all"
              />
            );
          })}
        </div>

        {/* Mini App Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {allApps.slice(0, 4).map((app) => (
            <div
              key={app.appName}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md border shrink-0"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: app.color }} />
              <span className="font-semibold" style={{ color: currentTheme.textPrimary }}>
                {app.appName}:
              </span>
              <span className="font-mono" style={{ color: currentTheme.textSecondary }}>
                {app.minutesUsed}m
              </span>
            </div>
          ))}
        </div>

        {/* Interactive Intercept Demonstration controls */}
        <div
          className="flex items-center justify-between pt-2 border-t text-[11px]"
          style={{ borderColor: currentTheme.borderBase }}
        >
          <span style={{ color: currentTheme.textMuted }}>Task-to-Unlock Simulation:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => simulateAppUsage('Instagram', 5)}
              className="px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textSecondary,
              }}
              title="Simulate 5 min Instagram usage"
            >
              +5m Insta
            </button>
            <button
              onClick={() => simulateAppUsage('YouTube', 5)}
              className="px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textSecondary,
              }}
              title="Simulate 5 min YouTube usage"
            >
              +5m YT
            </button>
            <button
              onClick={() => setIsInterceptModalOpen(true)}
              className="px-2 py-0.5 rounded border font-semibold cursor-pointer flex items-center gap-1 hover:opacity-80"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.3)',
                color: '#F59E0B',
              }}
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Trigger Modal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
