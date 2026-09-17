import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext.js';
import {
  TaskItem,
  AICoachAdvice,
  ScreenTimeRecord,
  SyncEnvelope,
  ThemeType,
  ThemeConfig,
  AppUsageItem,
  PetStatusState,
  FocusBadge,
  StreaksAndBadgesData,
  ZeroDriftCelebration,
} from '../types.js';
import { INITIAL_BADGES } from '../data/badges.js';
import { audioSynth } from '../components/AudioSynth.js';
import { getTheme, applyThemeVariables, THEMES } from '../utils/theme.js';

export type TabType = 'today' | 'focus' | 'agent' | 'stats' | 'settings';
export type ScreenView = 'splash' | 'signup' | 'login' | 'reset_password' | 'onboarding' | 'main';
export type SyncStatus = 'synced' | 'syncing' | 'offline';

interface AppContextType {
  currentScreen: ScreenView;
  setCurrentScreen: (screen: ScreenView) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Theme
  themeId: ThemeType;
  currentTheme: ThemeConfig;
  setAppTheme: (themeId: ThemeType) => Promise<void>;

  // Real-time Sync state
  syncStatus: SyncStatus;
  lastSyncTime: string | null;

  // Tasks
  tasks: TaskItem[];
  isLoadingTasks: boolean;
  addTask: (title: string, tag: string, durationMinutes: number, priority?: 'low'|'medium'|'high', isMicroTask?: boolean) => Promise<void>;
  updateTaskStatus: (taskId: string, status: 'active' | 'queued' | 'completed') => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  generateAISchedule: () => Promise<void>;

  // Screen Time (All Apps + Primary Target)
  allApps: AppUsageItem[];
  totalScreenTimeMinutes: number;
  totalDailyAllowanceMinutes: number;
  interceptedApp: AppUsageItem | null;
  screenTime: {
    minutesUsed: number;
    dailyAllowance: number;
    unlockedExtraMinutes: number;
    minutesRemaining: number;
    isLimitReached: boolean;
  };
  isInterceptModalOpen: boolean;
  setIsInterceptModalOpen: (open: boolean) => void;
  simulateScreenTimeUse: (minutes: number) => Promise<void>;
  simulateAppUsage: (appName: string, minutes?: number) => Promise<void>;
  unlockSocialMinutes: (taskId?: string, bonusMinutes?: number) => Promise<void>;
  unlockAppScreenTime: (appName?: string, taskId?: string, bonusMinutes?: number) => Promise<void>;
  emergencyBypassScreenTime: () => Promise<void>;
  updateAppAllowance: (appName: string, dailyAllowance: number) => Promise<void>;
  resetScreenTimeDemo: () => Promise<void>;

  // Focus Pomodoro Session
  focusSession: {
    isActive: boolean;
    isPaused: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    activeTask: TaskItem | null;
    soundscape: 'Rain' | 'Forest' | 'Stream' | 'Off';
  };
  startFocusSession: (task?: TaskItem, durationMinutes?: number) => void;
  toggleTimerPause: () => void;
  takeBreather: (minutes?: number) => void;
  completeFocusSession: () => Promise<void>;
  setSoundscape: (sound: 'Rain' | 'Forest' | 'Stream' | 'Off') => void;
  resetFocusTimer: () => void;

  // AI Coach advice
  aiAdvice: AICoachAdvice | null;
  isLoadingAdvice: boolean;
  refreshAdvice: () => Promise<void>;

  // On-Screen Toast Notification Overlay during Focus Session
  driftToast: {
    isOpen: boolean;
    triggerReason: 'tab_switch' | 'social_attempt' | 'idle_drift' | 'manual_test';
    socialAppName?: string;
    distractionsResistedCount: number;
  };
  triggerDriftToast: (reason?: 'tab_switch' | 'social_attempt' | 'idle_drift' | 'manual_test', socialAppName?: string) => void;
  dismissDriftToast: (resisted?: boolean) => void;

  // Offline queue
  offlineQueueCount: number;
  triggerConfetti: () => void;

  // Pet Status & Motivation Level
  petStatus: PetStatusState;
  triggerPetDrift: (reason?: string) => void;
  recordSocialAbstinence: (minutes: number) => void;
  setSocialAbstinenceGoal: (goalMinutes: number) => void;
  petThePet: () => void;
  cheerUpPetWithFocus: () => void;
  clearPetDrift: () => void;

  // Streaks, Badges & Zero-Drift XP Motivation System
  streaksAndBadges: StreaksAndBadgesData;
  sessionDriftDetected: boolean;
  zeroDriftCelebration: ZeroDriftCelebration | null;
  closeZeroDriftCelebration: () => void;
  claimBadgeReward: (badgeId: string) => void;
  simulateZeroDriftCompletion: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated, refreshUser, updateProfile } = useAuth();

  // Screen navigation state
  const [currentScreen, setCurrentScreen] = useState<ScreenView>(() => {
    if (localStorage.getItem('aura_coach_token')) {
      return 'main';
    }
    return 'splash';
  });

  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Theme state: defaults to 'neon_purple' (Deep Purple, White & Neon Glow)
  const [themeId, setThemeId] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('aura_coach_theme') as ThemeType;
    if (saved && (saved as string) !== 'midnight' && THEMES[saved]) return saved;
    // Always default and reset to neon_purple for consistent Purple, White & Neon palette
    localStorage.setItem('aura_coach_theme', 'neon_purple');
    return 'neon_purple';
  });

  const currentTheme = getTheme(themeId);

  // Apply theme variables to document body whenever theme changes
  useEffect(() => {
    applyThemeVariables(currentTheme);
  }, [currentTheme]);

  // Sync theme with user profile if user updates
  useEffect(() => {
    if (user?.activeTheme && user.activeTheme !== themeId && THEMES[user.activeTheme]) {
      setThemeId(user.activeTheme);
      localStorage.setItem('aura_coach_theme', user.activeTheme);
    }
  }, [user?.activeTheme]);

  const setAppTheme = async (newThemeId: ThemeType) => {
    setThemeId(newThemeId);
    localStorage.setItem('aura_coach_theme', newThemeId);
    applyThemeVariables(getTheme(newThemeId));
    if (isAuthenticated) {
      await updateProfile({ activeTheme: newThemeId });
    }
  };

  // On-screen Toast Notification Overlay for Focus Session Social Distractions
  const [driftToast, setDriftToast] = useState<{
    isOpen: boolean;
    triggerReason: 'tab_switch' | 'social_attempt' | 'idle_drift' | 'manual_test';
    socialAppName?: string;
    distractionsResistedCount: number;
  }>({
    isOpen: false,
    triggerReason: 'manual_test',
    socialAppName: undefined,
    distractionsResistedCount: 3,
  });

  // Trigger confetti utility
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Pet Status & Motivation State
  const [petStatus, setPetStatus] = useState<PetStatusState>(() => {
    try {
      const saved = localStorage.getItem('aura_pet_status');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      energy: 88,
      motivationLevel: 'high',
      mood: 'happy',
      socialAbstinenceMinutes: 45,
      socialAbstinenceGoalMinutes: 30,
      hasRecentDrift: false,
      driftCountToday: 0,
      lastDriftReason: undefined,
      lastPetAt: undefined,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('aura_pet_status', JSON.stringify(petStatus));
    } catch {}
  }, [petStatus]);

  const triggerPetDrift = useCallback((reason = 'Focus drift detected') => {
    setPetStatus((prev) => ({
      ...prev,
      energy: Math.max(18, Math.min(prev.energy - 35, 32)),
      motivationLevel: 'low',
      mood: 'needy',
      hasRecentDrift: true,
      lastDriftReason: reason,
      driftCountToday: prev.driftCountToday + 1,
    }));
  }, []);

  const recordSocialAbstinence = useCallback((minutes: number) => {
    setPetStatus((prev) => {
      const nextMinutes = Math.max(0, prev.socialAbstinenceMinutes + minutes);
      const isGoalMet = nextMinutes >= prev.socialAbstinenceGoalMinutes;
      const nextEnergy = Math.min(100, Math.max(prev.energy + (isGoalMet ? 25 : 12), 40));
      const nextMood = isGoalMet ? 'happy' : nextEnergy >= 60 ? 'happy' : prev.mood;
      return {
        ...prev,
        socialAbstinenceMinutes: nextMinutes,
        hasRecentDrift: isGoalMet ? false : prev.hasRecentDrift,
        energy: nextEnergy,
        motivationLevel: nextEnergy >= 70 ? 'high' : nextEnergy >= 40 ? 'moderate' : 'low',
        mood: nextMood,
      };
    });
  }, []);

  const setSocialAbstinenceGoal = useCallback((goalMinutes: number) => {
    setPetStatus((prev) => {
      const isGoalMet = prev.socialAbstinenceMinutes >= goalMinutes;
      const nextMood = isGoalMet && !prev.hasRecentDrift ? 'happy' : prev.mood;
      return {
        ...prev,
        socialAbstinenceGoalMinutes: goalMinutes,
        mood: nextMood,
        energy: isGoalMet && prev.energy < 75 ? 85 : prev.energy,
        motivationLevel: isGoalMet ? 'high' : prev.motivationLevel,
      };
    });
  }, []);

  const petThePet = useCallback(() => {
    audioSynth.playCompletionChime();
    setPetStatus((prev) => {
      const nextEnergy = Math.min(100, prev.energy + 15);
      return {
        ...prev,
        energy: nextEnergy,
        hasRecentDrift: false,
        motivationLevel: nextEnergy >= 60 ? 'high' : 'moderate',
        mood: nextEnergy >= 45 ? 'happy' : prev.mood,
        lastPetAt: new Date().toISOString(),
      };
    });
  }, []);

  const cheerUpPetWithFocus = useCallback(() => {
    audioSynth.playCompletionChime();
    triggerConfetti();
    setPetStatus((prev) => ({
      ...prev,
      hasRecentDrift: false,
      energy: 95,
      motivationLevel: 'high',
      mood: 'happy',
    }));
  }, [triggerConfetti]);

  const clearPetDrift = useCallback(() => {
    setPetStatus((prev) => ({
      ...prev,
      hasRecentDrift: false,
      energy: Math.max(65, prev.energy),
      motivationLevel: 'high',
      mood: 'happy',
    }));
  }, []);

  const triggerDriftToast = (
    reason: 'tab_switch' | 'social_attempt' | 'idle_drift' | 'manual_test' = 'manual_test',
    socialAppName?: string
  ) => {
    setSessionDriftDetected(true);
    setDriftToast((prev) => ({
      ...prev,
      isOpen: true,
      triggerReason: reason,
      socialAppName: socialAppName || prev.socialAppName,
    }));
    triggerPetDrift(
      reason === 'tab_switch'
        ? 'Tab switch away from study workspace'
        : reason === 'social_attempt'
        ? `Attempted to open ${socialAppName || 'social media'}`
        : 'Focus distraction drift'
    );
  };

  const dismissDriftToast = (resisted = true) => {
    setDriftToast((prev) => ({
      ...prev,
      isOpen: false,
      distractionsResistedCount: resisted
        ? prev.distractionsResistedCount + 1
        : prev.distractionsResistedCount,
    }));
    if (resisted) {
      audioSynth.playCompletionChime();
      setPetStatus((prev) => {
        const nextEnergy = Math.min(100, prev.energy + 20);
        return {
          ...prev,
          energy: nextEnergy,
          hasRecentDrift: false,
          mood: 'happy',
          motivationLevel: nextEnergy >= 60 ? 'high' : 'moderate',
        };
      });
    }
  };

  // Streaks & Badges: Experience Points (XP) & Zero-Drift Health Tracker
  const [sessionDriftDetected, setSessionDriftDetected] = useState(false);

  const [streaksAndBadges, setStreaksAndBadges] = useState<StreaksAndBadgesData>(() => {
    try {
      const saved = localStorage.getItem('aura_streaks_and_badges');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          cleanFocusStreak: parsed.cleanFocusStreak ?? 2,
          longestCleanStreak: parsed.longestCleanStreak ?? 4,
          totalZeroDriftSessions: parsed.totalZeroDriftSessions ?? 6,
          totalZeroDriftMinutes: parsed.totalZeroDriftMinutes ?? 150,
          lastSessionDriftFree: parsed.lastSessionDriftFree ?? true,
          lastXpAwarded: parsed.lastXpAwarded ?? 150,
          badges: Array.isArray(parsed.badges) && parsed.badges.length > 0 ? parsed.badges : INITIAL_BADGES,
        };
      }
    } catch {}
    return {
      cleanFocusStreak: 2,
      longestCleanStreak: 4,
      totalZeroDriftSessions: 6,
      totalZeroDriftMinutes: 150,
      lastSessionDriftFree: true,
      lastXpAwarded: 150,
      badges: INITIAL_BADGES,
    };
  });

  // Save streaks and badges to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_streaks_and_badges', JSON.stringify(streaksAndBadges));
    } catch {}
  }, [streaksAndBadges]);

  const [zeroDriftCelebration, setZeroDriftCelebration] = useState<ZeroDriftCelebration | null>(null);

  const closeZeroDriftCelebration = useCallback(() => {
    setZeroDriftCelebration(null);
  }, []);

  const claimBadgeReward = useCallback((badgeId: string) => {
    setStreaksAndBadges((prev) => {
      const badge = prev.badges.find((b) => b.id === badgeId);
      if (!badge) return prev;
      return {
        ...prev,
        badges: prev.badges.map((b) => (b.id === badgeId ? { ...b, unlocked: true } : b)),
      };
    });
  }, []);

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // All Apps Screen Time state
  const [allApps, setAllApps] = useState<AppUsageItem[]>([
    {
      id: 'app_ig',
      appName: 'Instagram',
      category: 'social',
      iconType: 'instagram',
      color: '#E1306C',
      minutesUsed: 25,
      dailyAllowance: 45,
      unlockedExtraMinutes: 0,
      isRestricted: true,
      isLimitReached: false,
    },
    {
      id: 'app_yt',
      appName: 'YouTube',
      category: 'entertainment',
      iconType: 'youtube',
      color: '#EF4444',
      minutesUsed: 42,
      dailyAllowance: 60,
      unlockedExtraMinutes: 0,
      isRestricted: true,
      isLimitReached: false,
    },
    {
      id: 'app_tiktok',
      appName: 'TikTok / Reels',
      category: 'entertainment',
      iconType: 'video',
      color: '#00F2FE',
      minutesUsed: 28,
      dailyAllowance: 30,
      unlockedExtraMinutes: 0,
      isRestricted: true,
      isLimitReached: false,
    },
    {
      id: 'app_whatsapp',
      appName: 'WhatsApp',
      category: 'communication',
      iconType: 'message-circle',
      color: '#25D366',
      minutesUsed: 18,
      dailyAllowance: 40,
      unlockedExtraMinutes: 0,
      isRestricted: false,
      isLimitReached: false,
    },
    {
      id: 'app_x',
      appName: 'X (Twitter)',
      category: 'social',
      iconType: 'twitter',
      color: '#38BDF8',
      minutesUsed: 20,
      dailyAllowance: 30,
      unlockedExtraMinutes: 0,
      isRestricted: true,
      isLimitReached: false,
    },
    {
      id: 'app_chrome',
      appName: 'Chrome Browser',
      category: 'browsing',
      iconType: 'globe',
      color: '#F59E0B',
      minutesUsed: 34,
      dailyAllowance: 45,
      unlockedExtraMinutes: 0,
      isRestricted: false,
      isLimitReached: false,
    },
    {
      id: 'app_gaming',
      appName: 'Mobile Gaming',
      category: 'gaming',
      iconType: 'gamepad-2',
      color: '#8B5CF6',
      minutesUsed: 15,
      dailyAllowance: 30,
      unlockedExtraMinutes: 0,
      isRestricted: true,
      isLimitReached: false,
    },
    {
      id: 'app_reddit',
      appName: 'Reddit',
      category: 'social',
      iconType: 'message-square',
      color: '#FF4500',
      minutesUsed: 12,
      dailyAllowance: 25,
      unlockedExtraMinutes: 0,
      isRestricted: true,
      isLimitReached: false,
    },
  ]);

  const [interceptedApp, setInterceptedApp] = useState<AppUsageItem | null>(null);

  // Primary screen time state (for backwards compatibility and quick cards)
  const [screenTime, setScreenTime] = useState({
    minutesUsed: 25,
    dailyAllowance: 45,
    unlockedExtraMinutes: 0,
    minutesRemaining: 20,
    isLimitReached: false,
  });

  const [isInterceptModalOpen, setIsInterceptModalOpen] = useState(false);

  // Total screen time metrics across all apps
  const totalScreenTimeMinutes = allApps.reduce((acc, app) => acc + app.minutesUsed, 0);
  const totalDailyAllowanceMinutes = allApps.reduce((acc, app) => acc + (app.dailyAllowance + (app.unlockedExtraMinutes || 0)), 0);

  // Focus Session state
  const [focusSession, setFocusSession] = useState<{
    isActive: boolean;
    isPaused: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    activeTask: TaskItem | null;
    soundscape: 'Rain' | 'Forest' | 'Stream' | 'Off';
  }>({
    isActive: false,
    isPaused: false,
    remainingSeconds: 21 * 60 + 45, // 21:45 matching Figma Frame 07
    totalSeconds: 25 * 60,
    activeTask: null,
    soundscape: 'Off',
  });

  // AI Coach state
  const [aiAdvice, setAiAdvice] = useState<AICoachAdvice | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // Offline action queue
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const q = localStorage.getItem('aura_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial tasks and screen time data
  const fetchData = useCallback(async () => {
    if (!token) return;
    setSyncStatus('syncing');
    try {
      const [tasksRes, stRes, adviceRes] = await Promise.all([
        fetch('/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/screentime', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/coach/suggestion', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data.tasks || []);
        const activeT = data.tasks.find((t: TaskItem) => t.status === 'active');
        if (activeT) {
          setFocusSession((prev) => ({
            ...prev,
            activeTask: prev.activeTask || activeT,
          }));
        }
      }

      if (stRes.ok) {
        const stData = await stRes.json();
        if (stData.apps && Array.isArray(stData.apps)) {
          setAllApps(stData.apps);
        }
        setScreenTime({
          minutesUsed: stData.record?.minutesUsed ?? 25,
          dailyAllowance: stData.effectiveAllowance ?? 45,
          unlockedExtraMinutes: stData.record?.unlockedExtraMinutes ?? 0,
          minutesRemaining: stData.minutesRemaining ?? 20,
          isLimitReached: stData.isLimitReached ?? false,
        });
        if (stData.interceptedApp) {
          setInterceptedApp(stData.interceptedApp);
        }
      }

      if (adviceRes.ok) {
        const advData = await adviceRes.json();
        setAiAdvice(advData.advice);
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Network issue while fetching data; running with local cache:', err);
      setSyncStatus('offline');
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Real-time Server-Sent Events (SSE) setup
  useEffect(() => {
    if (!token) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/sync/stream?token=${encodeURIComponent(token)}`);

      eventSource.onmessage = (event) => {
        try {
          const envelope: SyncEnvelope = JSON.parse(event.data);
          if (envelope.type === 'task_update') {
            fetchData();
          } else if (envelope.type === 'screen_time_update') {
            fetchData();
          } else if (envelope.type === 'profile_update') {
            refreshUser();
          }
          setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } catch {
          // ignore keep-alive
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // fallback
    }

    return () => {
      eventSource?.close();
    };
  }, [token, fetchData, refreshUser]);

  // Pomodoro countdown timer loop
  useEffect(() => {
    if (focusSession.isActive && !focusSession.isPaused) {
      timerRef.current = setInterval(() => {
        setFocusSession((prev) => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(timerRef.current!);
            audioSynth.playCompletionChime();
            triggerConfetti();
            return {
              ...prev,
              remainingSeconds: 0,
              isActive: false,
              isPaused: false,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [focusSession.isActive, focusSession.isPaused, triggerConfetti]);

  // Active drift detector: Detects when user drifts away from their study session (switches tab or leaves window)
  useEffect(() => {
    if (!focusSession.isActive || focusSession.isPaused) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User drifted away to another tab (e.g. YouTube, Twitter, Instagram web)
        setSessionDriftDetected(true);
        sessionStorage.setItem('aura_focus_drift_detected', 'true');
      } else {
        const hadDrift = sessionStorage.getItem('aura_focus_drift_detected');
        if (hadDrift === 'true') {
          sessionStorage.removeItem('aura_focus_drift_detected');
          triggerDriftToast('tab_switch');
        }
      }
    };

    const handleWindowBlur = () => {
      setSessionDriftDetected(true);
      sessionStorage.setItem('aura_focus_drift_detected', 'true');
    };

    const handleWindowFocus = () => {
      const hadDrift = sessionStorage.getItem('aura_focus_drift_detected');
      if (hadDrift === 'true') {
        sessionStorage.removeItem('aura_focus_drift_detected');
        triggerDriftToast('tab_switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [focusSession.isActive, focusSession.isPaused]);

  // Task actions
  const addTask = async (
    title: string,
    tag: string,
    durationMinutes: number,
    priority: 'low' | 'medium' | 'high' = 'medium',
    isMicroTask = false
  ) => {
    if (!token) return;
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, tag, durationMinutes, priority, isMicroTask }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [...prev, data.task]);
        setSyncStatus('synced');
      }
    } catch {
      const offlineTask: TaskItem = {
        id: `offline_${Date.now()}`,
        userId: user?.id || 'guest',
        title,
        tag,
        durationMinutes,
        status: tasks.length === 0 ? 'active' : 'queued',
        priority,
        isMicroTask,
        order: tasks.length + 1,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, offlineTask]);
      const nextQueue = [...offlineQueue, { type: 'create_task', task: offlineTask }];
      setOfflineQueue(nextQueue);
      localStorage.setItem('aura_offline_queue', JSON.stringify(nextQueue));
      setSyncStatus('offline');
    }
  };

  const updateTaskStatus = async (taskId: string, status: 'active' | 'queued' | 'completed') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : t))
    );

    if (status === 'completed') {
      triggerConfetti();
      audioSynth.playCompletionChime();
      setPetStatus((prev) => ({
        ...prev,
        hasRecentDrift: false,
        energy: Math.min(100, prev.energy + 15),
        mood: 'happy',
        motivationLevel: 'high',
      }));
    }

    if (!token) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        refreshUser();
      }
    } catch {
      const nextQueue = [...offlineQueue, { type: 'complete_task', taskId }];
      setOfflineQueue(nextQueue);
      localStorage.setItem('aura_offline_queue', JSON.stringify(nextQueue));
      setSyncStatus('offline');
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (!token) return;
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // offline
    }
  };

  const generateAISchedule = async () => {
    if (!token) return;
    setIsLoadingTasks(true);
    try {
      const milestone = user?.targetMilestone || 'Placement Interview Prep';
      const promptTasks = [
        { title: `Master ${milestone.split(' ')[0]} Core Concepts`, tag: 'Core Placement', duration: 45, isMicro: false },
        { title: 'Solve 2 High-Yield Algorithmic Patterns', tag: 'Placement', duration: 30, isMicro: false },
        { title: 'Review 5 System Design Flashcards', tag: 'Micro-Task', duration: 10, isMicro: true },
      ];

      for (const pt of promptTasks) {
        await addTask(pt.title, pt.tag, pt.duration, 'high', pt.isMicro);
      }
      await refreshAdvice();
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Screen Time Actions for ANY App
  const simulateAppUsage = async (appName: string, minutes = 5) => {
    // If an active focus timer sprint is running, intercept social media drift immediately!
    if (focusSession.isActive && !focusSession.isPaused) {
      triggerDriftToast('social_attempt', appName);
      return;
    }

    // Optimistic local update
    setAllApps((prev) =>
      prev.map((app) => {
        if (app.appName === appName) {
          const nextUsed = app.minutesUsed + minutes;
          const limit = app.dailyAllowance + (app.unlockedExtraMinutes || 0);
          const reached = app.isRestricted && nextUsed >= limit;
          if (reached) {
            setInterceptedApp({ ...app, minutesUsed: nextUsed, isLimitReached: true });
            setIsInterceptModalOpen(true);
          }
          return {
            ...app,
            minutesUsed: nextUsed,
            isLimitReached: reached,
          };
        }
        return app;
      })
    );

    if (appName === 'Instagram') {
      setScreenTime((prev) => {
        const nextUsed = prev.minutesUsed + minutes;
        const reached = nextUsed >= prev.dailyAllowance;
        return {
          ...prev,
          minutesUsed: nextUsed,
          minutesRemaining: Math.max(0, prev.dailyAllowance - nextUsed),
          isLimitReached: reached,
        };
      });
    }

    if (!token) return;
    try {
      const res = await fetch('/api/screentime/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appName, minutes }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // offline
    }
  };

  const simulateScreenTimeUse = async (minutes: number) => {
    await simulateAppUsage('Instagram', minutes);
  };

  const unlockAppScreenTime = async (appName?: string, taskId?: string, bonusMinutes = 15) => {
    // Optimistic update
    setAllApps((prev) =>
      prev.map((app) => {
        if (!appName || app.appName === appName) {
          const nextAllowance = app.dailyAllowance + bonusMinutes;
          const nextUnlocked = (app.unlockedExtraMinutes || 0) + bonusMinutes;
          return {
            ...app,
            dailyAllowance: nextAllowance,
            unlockedExtraMinutes: nextUnlocked,
            isLimitReached: false,
          };
        }
        return app;
      })
    );

    setScreenTime((prev) => ({
      ...prev,
      dailyAllowance: prev.dailyAllowance + bonusMinutes,
      unlockedExtraMinutes: prev.unlockedExtraMinutes + bonusMinutes,
      minutesRemaining: prev.minutesRemaining + bonusMinutes,
      isLimitReached: false,
    }));

    setIsInterceptModalOpen(false);
    triggerConfetti();
    audioSynth.playCompletionChime();

    if (!token) return;
    try {
      await fetch('/api/screentime/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appName, taskId, bonusMinutes }),
      });
      fetchData();
    } catch {
      // offline
    }
  };

  const unlockSocialMinutes = async (taskId?: string, bonusMinutes = 15) => {
    await unlockAppScreenTime(interceptedApp?.appName || 'Instagram', taskId, bonusMinutes);
  };

  const emergencyBypassScreenTime = async () => {
    const target = interceptedApp?.appName || 'Instagram';
    setAllApps((prev) =>
      prev.map((app) =>
        app.appName === target
          ? { ...app, dailyAllowance: app.dailyAllowance + 5, isLimitReached: false }
          : app
      )
    );
    setScreenTime((prev) => ({
      ...prev,
      dailyAllowance: prev.dailyAllowance + 5,
      minutesRemaining: 5,
      isLimitReached: false,
    }));
    setIsInterceptModalOpen(false);

    if (!token) return;
    try {
      await fetch('/api/screentime/bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appName: target }),
      });
      fetchData();
    } catch {
      // offline
    }
  };

  const updateAppAllowance = async (appName: string, dailyAllowance: number) => {
    setAllApps((prev) =>
      prev.map((app) =>
        app.appName === appName ? { ...app, dailyAllowance } : app
      )
    );
    if (!token) return;
    try {
      await fetch('/api/screentime/allowance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ appName, dailyAllowance }),
      });
    } catch {
      // offline
    }
  };

  const resetScreenTimeDemo = async () => {
    if (!token) {
      setAllApps((prev) =>
        prev.map((app) => ({
          ...app,
          minutesUsed: Math.max(5, Math.floor(app.dailyAllowance * 0.4)),
          unlockedExtraMinutes: 0,
          isLimitReached: false,
        }))
      );
      setScreenTime({
        minutesUsed: 20,
        dailyAllowance: 45,
        unlockedExtraMinutes: 0,
        minutesRemaining: 25,
        isLimitReached: false,
      });
      setIsInterceptModalOpen(false);
      return;
    }

    try {
      const res = await fetch('/api/screentime/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
        setIsInterceptModalOpen(false);
      }
    } catch {
      // offline
    }
  };

  // Focus Timer actions
  const startFocusSession = (task?: TaskItem, durationMinutes = 25) => {
    setSessionDriftDetected(false);
    const selectedTask = task || tasks.find((t) => t.status === 'active') || tasks[0] || null;
    setFocusSession({
      isActive: true,
      isPaused: false,
      remainingSeconds: durationMinutes * 60,
      totalSeconds: durationMinutes * 60,
      activeTask: selectedTask,
      soundscape: 'Off',
    });
    setActiveTab('focus');
  };

  const toggleTimerPause = () => {
    setFocusSession((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const takeBreather = (minutes = 5) => {
    audioSynth.stop();
    setFocusSession((prev) => ({
      ...prev,
      isActive: true,
      isPaused: false,
      remainingSeconds: minutes * 60,
      totalSeconds: minutes * 60,
      soundscape: 'Off',
    }));
  };

  const completeFocusSession = async () => {
    const sessionDurationMinutes = Math.max(
      1,
      Math.round((focusSession.totalSeconds - focusSession.remainingSeconds) / 60)
    ) || Math.round(focusSession.totalSeconds / 60) || 25;

    // Check if session was completed without any drift
    const isZeroDrift = !sessionDriftDetected && !petStatus.hasRecentDrift;

    // Streak & XP Calculation:
    // Base XP: 120 XP for zero-drift; 40 XP if drifted
    // Streak multiplier bonus: +30 XP per streak level (max +250 XP bonus)
    const currentCleanStreak = streaksAndBadges.cleanFocusStreak;
    const nextCleanStreak = isZeroDrift ? currentCleanStreak + 1 : 0;
    const baseXp = isZeroDrift ? 120 : 40;
    const streakBonusXp = isZeroDrift ? Math.min(nextCleanStreak * 30, 250) : 0;
    const totalSessionXp = baseXp + streakBonusXp;

    // Mark task completed if one was active
    if (focusSession.activeTask) {
      await updateTaskStatus(focusSession.activeTask.id, 'completed');
    }

    // Motivate Pet Health Status:
    // Zero-drift restores Aura's health & energy to 100% peak vitality with happy mood
    // Drift maintains reduced health to motivate attention
    setPetStatus((prev) => {
      const nextEnergy = isZeroDrift ? 100 : Math.max(prev.energy, 60);
      return {
        ...prev,
        hasRecentDrift: false,
        energy: nextEnergy,
        motivationLevel: isZeroDrift ? 'high' : 'moderate',
        mood: 'happy',
        socialAbstinenceMinutes: prev.socialAbstinenceMinutes + sessionDurationMinutes,
      };
    });

    // Evaluate badges progression & unlock rewards
    const newUnlockedBadges: FocusBadge[] = [];
    let badgeBonusXp = 0;

    const nextBadges = streaksAndBadges.badges.map((b) => {
      let progress = b.progress;
      let unlocked = b.unlocked;

      if (isZeroDrift) {
        if (b.id === 'badge_zero_drift_novice') {
          progress = Math.min(b.maxProgress, progress + 1);
        } else if (b.id === 'badge_focus_spark') {
          progress = Math.min(b.maxProgress, nextCleanStreak);
        } else if (b.id === 'badge_iron_will') {
          progress = Math.min(b.maxProgress, nextCleanStreak);
        } else if (b.id === 'badge_streak_legend') {
          progress = Math.min(b.maxProgress, nextCleanStreak);
        } else if (b.id === 'badge_zen_master') {
          progress = Math.min(b.maxProgress, streaksAndBadges.totalZeroDriftSessions + 1);
        } else if (b.id === 'badge_auras_guardian') {
          progress = Math.min(b.maxProgress, progress + 1);
        } else if (b.id === 'badge_detox_titan') {
          progress = Math.min(b.maxProgress, progress + sessionDurationMinutes);
        } else if (b.id === 'badge_flawless_marathon' && sessionDurationMinutes >= 25) {
          progress = Math.min(b.maxProgress, progress + sessionDurationMinutes);
        }
      }

      if (!unlocked && progress >= b.maxProgress) {
        unlocked = true;
        badgeBonusXp += b.xpReward;
        newUnlockedBadges.push({
          ...b,
          unlocked: true,
          progress,
          unlockedAt: new Date().toISOString(),
        });
      }

      return {
        ...b,
        progress,
        unlocked,
        unlockedAt: unlocked && !b.unlocked ? new Date().toISOString() : b.unlockedAt,
      };
    });

    const grandTotalXp = totalSessionXp + badgeBonusXp;

    // Update user profile XP and check Level progression (300 XP per level)
    const prevUserXp = user?.xp || 0;
    const prevUserLevel = user?.level || 1;
    const newUserXp = prevUserXp + grandTotalXp;
    const newUserLevel = Math.max(1, Math.floor(newUserXp / 300) + 1);
    const leveledUp = newUserLevel > prevUserLevel;

    if (isAuthenticated) {
      await updateProfile({
        xp: newUserXp,
        level: newUserLevel,
        streakDays: isZeroDrift ? Math.max(user?.streakDays || 1, nextCleanStreak) : user?.streakDays || 1,
      });
    }

    // Update Streaks & Badges state
    setStreaksAndBadges({
      cleanFocusStreak: nextCleanStreak,
      longestCleanStreak: Math.max(streaksAndBadges.longestCleanStreak, nextCleanStreak),
      totalZeroDriftSessions: isZeroDrift
        ? streaksAndBadges.totalZeroDriftSessions + 1
        : streaksAndBadges.totalZeroDriftSessions,
      totalZeroDriftMinutes: isZeroDrift
        ? streaksAndBadges.totalZeroDriftMinutes + sessionDurationMinutes
        : streaksAndBadges.totalZeroDriftMinutes,
      lastSessionDriftFree: isZeroDrift,
      lastXpAwarded: grandTotalXp,
      badges: nextBadges,
    });

    // Audio & visual celebrations
    audioSynth.playCompletionChime();
    triggerConfetti();

    // Trigger celebration dialog for immediate feedback
    setZeroDriftCelebration({
      isOpen: true,
      isZeroDrift,
      baseXp,
      streakBonusXp,
      totalXpEarned: grandTotalXp,
      cleanStreak: nextCleanStreak,
      newBadges: newUnlockedBadges,
      petHealthRestored: isZeroDrift,
      previousLevel: prevUserLevel,
      currentLevel: newUserLevel,
      leveledUp,
    });

    if (token) {
      try {
        await fetch('/api/focus/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            taskId: focusSession.activeTask?.id,
            taskTitle: focusSession.activeTask?.title || 'Focus Sprint',
            durationMinutes: sessionDurationMinutes,
            soundscapeUsed: focusSession.soundscape,
            driftFree: isZeroDrift,
            cleanStreak: nextCleanStreak,
          }),
        });
        refreshUser();
      } catch {
        // offline
      }
    }

    // Reset session timer and drift detection flag
    setSessionDriftDetected(false);
    setFocusSession((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingSeconds: 25 * 60,
    }));
  };

  const simulateZeroDriftCompletion = async () => {
    setSessionDriftDetected(false);
    await completeFocusSession();
  };

  const setSoundscape = (sound: 'Rain' | 'Forest' | 'Stream' | 'Off') => {
    setFocusSession((prev) => ({ ...prev, soundscape: sound }));
    if (sound === 'Off') {
      audioSynth.stop();
    } else {
      audioSynth.play(sound);
    }
  };

  const resetFocusTimer = () => {
    audioSynth.stop();
    setFocusSession((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingSeconds: 25 * 60,
      soundscape: 'Off',
    }));
  };

  const refreshAdvice = async () => {
    if (!token) return;
    setIsLoadingAdvice(true);
    try {
      const res = await fetch('/api/coach/suggestion', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data.advice);
      }
    } catch {
      // offline
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        themeId,
        currentTheme,
        setAppTheme,
        syncStatus,
        lastSyncTime,
        tasks,
        isLoadingTasks,
        addTask,
        updateTaskStatus,
        deleteTask,
        generateAISchedule,
        allApps,
        totalScreenTimeMinutes,
        totalDailyAllowanceMinutes,
        interceptedApp,
        screenTime,
        isInterceptModalOpen,
        setIsInterceptModalOpen,
        simulateScreenTimeUse,
        simulateAppUsage,
        unlockSocialMinutes,
        unlockAppScreenTime,
        emergencyBypassScreenTime,
        updateAppAllowance,
        resetScreenTimeDemo,
        focusSession,
        startFocusSession,
        toggleTimerPause,
        takeBreather,
        completeFocusSession,
        setSoundscape,
        resetFocusTimer,
        aiAdvice,
        isLoadingAdvice,
        refreshAdvice,
        driftToast,
        triggerDriftToast,
        dismissDriftToast,
        offlineQueueCount: offlineQueue.length,
        triggerConfetti,
        petStatus,
        triggerPetDrift,
        recordSocialAbstinence,
        setSocialAbstinenceGoal,
        petThePet,
        cheerUpPetWithFocus,
        clearPetDrift,
        streaksAndBadges,
        sessionDriftDetected,
        zeroDriftCelebration,
        closeZeroDriftCelebration,
        claimBadgeReward,
        simulateZeroDriftCompletion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
