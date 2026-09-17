import React, { useState } from 'react';
import {
  ChevronRight,
  Sparkles,
  Palette,
  Smartphone,
  HardDrive,
  User,
  Lock,
  LogOut,
  Check,
  Bell,
  CheckCircle2,
  Sliders,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useApp } from '../../context/AppContext.js';
import { ThemeType } from '../../types.js';
import { THEMES } from '../../utils/theme.js';

export const SettingsScreen: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const {
    setCurrentScreen,
    syncStatus,
    themeId,
    currentTheme,
    setAppTheme,
    allApps,
    updateAppAllowance,
    resetScreenTimeDemo,
    simulateAppUsage,
  } = useApp();

  const [petEnabled, setPetEnabled] = useState<boolean>(user?.petCompanionEnabled ?? true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(user?.hapticFeedbackEnabled ?? true);
  const [offlineCache, setOfflineCache] = useState<boolean>(user?.offlineCacheEnabled ?? true);
  const [notifications, setNotifications] = useState<boolean>(user?.notificationsEnabled ?? true);
  const [proactivity, setProactivity] = useState<'gentle' | 'balanced' | 'high_accountability'>(
    user?.aiProactivity || 'balanced'
  );

  const [editingMilestone, setEditingMilestone] = useState(false);
  const [targetMilestone, setTargetMilestone] = useState(user?.targetMilestone || 'Placement Interview Prep');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileCollege, setProfileCollege] = useState(user?.college || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [managingAppLimits, setManagingAppLimits] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({
      name: profileName,
      college: profileCollege,
      targetMilestone,
      aiProactivity: proactivity,
      activeTheme: themeId,
      petCompanionEnabled: petEnabled,
      hapticFeedbackEnabled: hapticEnabled,
      offlineCacheEnabled: offlineCache,
      notificationsEnabled: notifications,
    });
    setShowEditProfile(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('splash');
  };

  return (
    <div
      className="flex-1 flex flex-col px-5 pt-4 pb-16 space-y-5 overflow-y-auto transition-colors"
      style={{
        backgroundColor: currentTheme.bgBase,
        color: currentTheme.textPrimary,
      }}
    >
      {/* Top Bar: Title "Settings & Preferences" */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold" style={{ color: currentTheme.textPrimary }}>
          Settings & Preferences
        </h1>
        {savedSuccess && (
          <span
            className="text-xs flex items-center gap-1 font-medium"
            style={{ color: currentTheme.accentPrimary }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Section 1: Appearance & Base Color Theme */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: currentTheme.textMuted }}
          >
            Base Colour Theme
          </h3>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: currentTheme.accentTint,
              color: currentTheme.accentText,
            }}
          >
            Active: {currentTheme.name}
          </span>
        </div>

        <div
          className="rounded-[16px] border p-3.5 shadow-sm space-y-3 transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: currentTheme.accentPrimary }} />
            <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
              Choose App Color Theme
            </span>
          </div>

          {/* Theme Tabs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(THEMES) as ThemeType[]).map((key) => {
              const t = THEMES[key];
              const isSelected = themeId === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAppTheme(key)}
                  className="flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? t.accentTint : currentTheme.bgElevated,
                    borderColor: isSelected ? t.accentPrimary : currentTheme.borderBase,
                    boxShadow: isSelected ? `0 0 12px ${t.accentPrimary}33` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Color Swatch Dot */}
                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: t.accentPrimary,
                        borderColor: t.borderBase,
                      }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <div>
                      <div
                        className="text-xs font-bold flex items-center gap-1.5"
                        style={{ color: isSelected ? t.accentText : currentTheme.textPrimary }}
                      >
                        <span>{t.emoji}</span>
                        <span>{t.name}</span>
                        {key === 'neon_purple' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50 font-bold shadow-[0_0_8px_rgba(168,85,247,0.4)]">
                            Neon Primary
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[10px] mt-0.5 leading-tight"
                        style={{ color: currentTheme.textMuted }}
                      >
                        {t.tagline}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 2: All Apps Screen Time & App Budgets */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: currentTheme.textMuted }}
          >
            All Apps Screen Time & Limits
          </h3>
          <button
            onClick={() => setManagingAppLimits(!managingAppLimits)}
            className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            style={{ color: currentTheme.accentPrimary }}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{managingAppLimits ? 'Hide Details' : 'Configure Budgets'}</span>
          </button>
        </div>

        <div
          className="rounded-[16px] border p-3.5 shadow-sm space-y-3 transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" style={{ color: currentTheme.accentPrimary }} />
              <div>
                <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                  Tracked Apps ({allApps.length})
                </span>
                <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                  Android app usage limits with Task-to-Unlock intercepts
                </p>
              </div>
            </div>
            <button
              onClick={resetScreenTimeDemo}
              className="text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 cursor-pointer"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textSecondary,
              }}
              title="Reset all demo screen time counters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick List of All Apps with Minutes & Allowance */}
          <div className="divide-y" style={{ borderColor: currentTheme.borderBase }}>
            {allApps.map((app) => {
              const effectiveLimit = app.dailyAllowance + (app.unlockedExtraMinutes || 0);
              const pct = Math.min(100, Math.round((app.minutesUsed / effectiveLimit) * 100));
              const isOver = app.isRestricted && app.minutesUsed >= effectiveLimit;

              return (
                <div key={app.appName} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: app.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold truncate" style={{ color: currentTheme.textPrimary }}>
                          {app.appName}
                        </span>
                        <span className="font-mono text-[11px]" style={{ color: currentTheme.textSecondary }}>
                          {app.minutesUsed}m / {effectiveLimit}m
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden"
                        style={{ backgroundColor: currentTheme.bgElevated }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: isOver ? currentTheme.danger : app.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget Edit or Simulate Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {managingAppLimits ? (
                      <select
                        value={app.dailyAllowance}
                        onChange={(e) => updateAppAllowance(app.appName, Number(e.target.value))}
                        className="px-1.5 py-0.5 rounded text-[11px] font-bold border"
                        style={{
                          backgroundColor: currentTheme.bgElevated,
                          borderColor: currentTheme.borderBase,
                          color: currentTheme.textPrimary,
                        }}
                      >
                        <option value="15">15m</option>
                        <option value="30">30m</option>
                        <option value="45">45m</option>
                        <option value="60">60m</option>
                        <option value="90">90m</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => simulateAppUsage(app.appName, 5)}
                        className="px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: currentTheme.bgElevated,
                          borderColor: currentTheme.borderBase,
                          color: currentTheme.textSecondary,
                        }}
                        title={`Simulate +5m usage for ${app.appName}`}
                      >
                        +5m
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: AI Coach Calibration */}
      <div className="space-y-1.5">
        <h3
          className="text-xs font-bold uppercase tracking-wider px-1"
          style={{ color: currentTheme.textMuted }}
        >
          AI Coach Calibration
        </h3>
        <div
          className="rounded-[16px] border divide-y overflow-hidden shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          {/* Row 1: Target Academic Milestone */}
          <div
            onClick={() => setEditingMilestone(!editingMilestone)}
            className="p-3.5 flex items-center justify-between cursor-pointer transition-colors hover:opacity-90"
          >
            <div>
              <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                Target Academic Milestone
              </span>
              <p className="text-[11px] font-semibold" style={{ color: currentTheme.accentPrimary }}>
                {targetMilestone}
              </p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: currentTheme.textMuted }} />
          </div>

          {editingMilestone && (
            <div
              className="p-3 space-y-2 border-t"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
              }}
            >
              <select
                value={targetMilestone}
                onChange={(e) => {
                  setTargetMilestone(e.target.value);
                  updateProfile({ targetMilestone: e.target.value });
                }}
                className="w-full p-2 rounded-lg border text-xs"
                style={{
                  backgroundColor: currentTheme.bgSurface,
                  borderColor: currentTheme.borderBase,
                  color: currentTheme.textPrimary,
                }}
              >
                <option value="Placement Interview Prep">Placement Interview Prep</option>
                <option value="Semester Exam Prep">Semester Exam Prep</option>
                <option value="Learn Full-Stack Development">Learn Full-Stack Development</option>
                <option value="Competitive Programming & Data Structures">
                  Competitive Programming & Data Structures
                </option>
              </select>
            </div>
          )}

          {/* Row 2: AI Proactivity Level */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                AI Proactivity Level
              </span>
              <p className="text-[11px]" style={{ color: currentTheme.textMuted }}>
                Frequency of dynamic coach intervention
              </p>
            </div>
            <select
              value={proactivity}
              onChange={(e) => {
                const val = e.target.value as any;
                setProactivity(val);
                updateProfile({ aiProactivity: val });
              }}
              className="px-2.5 py-1 rounded border text-xs font-medium"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
                color: currentTheme.textPrimary,
              }}
            >
              <option value="gentle">Gentle</option>
              <option value="balanced">Balanced</option>
              <option value="high_accountability">High-Accountability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Gamification & Preferences */}
      <div className="space-y-1.5">
        <h3
          className="text-xs font-bold uppercase tracking-wider px-1"
          style={{ color: currentTheme.textMuted }}
        >
          Companion & Feedback
        </h3>
        <div
          className="rounded-[16px] border divide-y overflow-hidden shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          {/* Digital Pet Companion */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                Digital Pet Companion
              </span>
              <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                Grows with daily focus sessions (2D sprite)
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !petEnabled;
                setPetEnabled(next);
                updateProfile({ petCompanionEnabled: next });
              }}
              className="w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: petEnabled ? currentTheme.accentPrimary : currentTheme.borderBase,
              }}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  petEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Feedback */}
          <div className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                Haptic Feedback on Timer
              </span>
              <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                Vibration pulse when Pomodoro finishes
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !hapticEnabled;
                setHapticEnabled(next);
                updateProfile({ hapticFeedbackEnabled: next });
              }}
              className="w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: hapticEnabled ? currentTheme.accentPrimary : currentTheme.borderBase,
              }}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  hapticEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 5: Account & Security */}
      <div className="space-y-1.5">
        <h3
          className="text-xs font-bold uppercase tracking-wider px-1"
          style={{ color: currentTheme.textMuted }}
        >
          Account & Security
        </h3>
        <div
          className="rounded-[16px] border divide-y overflow-hidden shadow-sm transition-colors"
          style={{
            backgroundColor: currentTheme.bgSurface,
            borderColor: currentTheme.borderBase,
          }}
        >
          {/* Edit Profile */}
          <div
            onClick={() => setShowEditProfile(!showEditProfile)}
            className="p-3.5 flex items-center justify-between cursor-pointer transition-colors hover:opacity-90"
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" style={{ color: currentTheme.textMuted }} />
              <div>
                <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                  Edit Profile
                </span>
                <p className="text-[10px]" style={{ color: currentTheme.textMuted }}>
                  {user?.name || 'Student'} • {user?.college || 'Engineering College'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: currentTheme.textMuted }} />
          </div>

          {showEditProfile && (
            <div
              className="p-3.5 space-y-3 border-t"
              style={{
                backgroundColor: currentTheme.bgElevated,
                borderColor: currentTheme.borderBase,
              }}
            >
              <div>
                <label className="block text-[11px] mb-1" style={{ color: currentTheme.textMuted }}>
                  Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs"
                  style={{
                    backgroundColor: currentTheme.bgSurface,
                    borderColor: currentTheme.borderBase,
                    color: currentTheme.textPrimary,
                  }}
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1" style={{ color: currentTheme.textMuted }}>
                  College Affiliation
                </label>
                <input
                  type="text"
                  value={profileCollege}
                  onChange={(e) => setProfileCollege(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border text-xs"
                  style={{
                    backgroundColor: currentTheme.bgSurface,
                    borderColor: currentTheme.borderBase,
                    color: currentTheme.textPrimary,
                  }}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full py-2 rounded-lg text-white font-bold text-xs cursor-pointer shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: currentTheme.accentPrimary }}
              >
                Save Profile
              </button>
            </div>
          )}

          {/* Change Password */}
          <div
            onClick={() => setCurrentScreen('reset_password')}
            className="p-3.5 flex items-center justify-between cursor-pointer transition-colors hover:opacity-90"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4" style={{ color: currentTheme.textMuted }} />
              <span className="text-xs font-medium" style={{ color: currentTheme.textPrimary }}>
                Change Password
              </span>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: currentTheme.textMuted }} />
          </div>
        </div>

        {/* Log Out */}
        <div className="pt-4 text-center">
          <button
            onClick={handleLogout}
            className="text-xs font-bold hover:underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
            style={{ color: currentTheme.danger }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
