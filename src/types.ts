export type GoalType = 
  | 'Placement Interviews'
  | 'Semester Exam Prep'
  | 'Learn a Technical Skill'
  | 'Habit & Sleep Routine';

export type ThemeType = 'neon_purple' | 'cyberpunk' | 'sunset' | 'nature' | 'light';

export type PetMood = 'happy' | 'needy' | 'reading' | 'sleeping';

export interface PetStatusState {
  energy: number; // 0 to 100
  motivationLevel: 'high' | 'moderate' | 'low';
  mood: PetMood;
  socialAbstinenceMinutes: number; // minutes off social media
  socialAbstinenceGoalMinutes: number; // target period (e.g. 15, 30, 45, 60)
  hasRecentDrift: boolean;
  driftCountToday: number;
  lastDriftReason?: string;
  lastPetAt?: string;
}

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  emoji: string;
  tagline: string;
  // Color tokens
  bgBase: string;       // main app canvas
  bgSurface: string;    // cards
  bgElevated: string;   // active items, dropdowns
  bgInput: string;      // form inputs
  borderBase: string;   // card borders
  borderFocus: string;  // focused borders
  textPrimary: string;  // titles
  textSecondary: string;// subtitles
  textMuted: string;    // labels
  accentPrimary: string;// primary buttons & rings
  accentHover: string;  // button hover
  accentGradient: string; // hero elements
  accentTint: string;   // tag background
  accentText: string;   // tag text
  danger: string;       // alert/intercept
  warning: string;      // limits
  isLight?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college?: string;
  avatar?: string;
  streakDays: number;
  level: number;
  xp: number;
  targetMilestone: string;
  selectedGoals: GoalType[];
  dailySocialBudgetMinutes: number; // e.g. 45
  socialTimeUsedMinutes: number;    // e.g. 20
  aiProactivity: 'gentle' | 'balanced' | 'high_accountability';
  activeTheme: ThemeType;
  petCompanionEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  offlineCacheEnabled: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'active' | 'queued' | 'completed';

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  tag: string; // e.g. "Core Placement", "Semester", "Technical"
  durationMinutes: number; // e.g. 45
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  isMicroTask?: boolean; // Micro-tasks can unlock social time
  completedAt?: string;
  createdAt: string;
  order: number;
}

export interface FocusSessionLog {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  completed: boolean;
  soundscapeUsed?: string;
  timestamp: string;
}

export type AppCategory = 'social' | 'entertainment' | 'communication' | 'productivity' | 'gaming' | 'browsing';

export interface AppUsageItem {
  id: string;
  appName: string;
  category: AppCategory;
  iconType: string;
  color: string;
  minutesUsed: number;
  dailyAllowance: number;
  unlockedExtraMinutes: number;
  isRestricted: boolean;
  isLimitReached: boolean;
  lastUsedAt?: string;
}

export interface ScreenTimeRecord {
  id: string;
  userId: string;
  appName: string; // e.g. "Instagram"
  category?: string;
  minutesUsed: number;
  dailyAllowance: number;
  unlockedExtraMinutes: number;
  lastUpdated: string;
}

export interface DailyStat {
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  date: string;
  studyHours: number;
  socialHours: number;
}

export interface WeeklyAnalyticsData {
  timeframe: 'This Week' | 'Last Week' | 'Month';
  deepStudyHours: number;
  timeSavedHours: number;
  plannedTasksCompletedPct: number;
  consistentStreakDays: number;
  dailyComparison: DailyStat[];
  aiGrowthInsight: string;
  milestoneTitle: string;
  milestoneSubtitle: string;
}

export interface AICoachAdvice {
  headline: string;
  body: string;
  actionableStep?: string;
  energyLevel: 'high' | 'medium' | 'low';
  generatedAt: string;
}

export type AgentOutputMode = 'mock_test' | 'summary' | 'flashcards' | 'custom';

export interface AgentMockQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topicTag?: string;
}

export interface AgentMockTestResult {
  title: string;
  durationMinutesEstimate: number;
  questions: AgentMockQuestion[];
  instructions?: string;
}

export interface AgentFlashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  mnemonicOrKeyFact?: string;
}

export interface AgentSummaryResult {
  title: string;
  executiveSummary: string;
  coreConcepts: {
    name: string;
    description: string;
    exampleOrFormula?: string;
  }[];
  pitfallsToAvoid?: string[];
  vivaOrInterviewQuestions?: string[];
  takeawayChecklist?: string[];
}

export interface AgentSuggestedTask {
  title: string;
  durationMinutes: number;
  tag: string;
  isMicroTask: boolean;
}

export interface AgentExecutionResponse {
  sessionId: string;
  userId?: string;
  mode: AgentOutputMode;
  userPrompt: string;
  sourceNoteSnippet?: string;
  fileName?: string;
  agentThoughtPlan: string;
  mockTest?: AgentMockTestResult;
  summary?: AgentSummaryResult;
  flashcards?: {
    deckTitle: string;
    cards: AgentFlashcard[];
  };
  customOutput?: string;
  suggestedTasks: AgentSuggestedTask[];
  createdAt: string;
}

export interface SyncEnvelope {
  type: 'initial' | 'task_update' | 'profile_update' | 'screen_time_update' | 'focus_session_logged' | 'app_usage_update';
  timestamp: string;
  data: any;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory = 'zero_drift' | 'pet_health' | 'streak' | 'deep_work';

export interface FocusBadge {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  petBenefit: string;
}

export interface StreaksAndBadgesData {
  cleanFocusStreak: number;
  longestCleanStreak: number;
  totalZeroDriftSessions: number;
  totalZeroDriftMinutes: number;
  lastSessionDriftFree?: boolean;
  lastXpAwarded?: number;
  badges: FocusBadge[];
}

export interface ZeroDriftCelebration {
  isOpen: boolean;
  isZeroDrift: boolean;
  baseXp: number;
  streakBonusXp: number;
  totalXpEarned: number;
  cleanStreak: number;
  newBadges: FocusBadge[];
  petHealthRestored: boolean;
  previousLevel: number;
  currentLevel: number;
  leveledUp: boolean;
}

