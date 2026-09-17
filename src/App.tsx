import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AppProvider, useApp } from './context/AppContext.js';
import { AndroidFrame } from './components/AndroidFrame.js';
import { BottomNav } from './components/BottomNav.js';
import { LimitModal } from './components/screens/LimitModal.js';
import { FocusDriftToastOverlay } from './components/FocusDriftToastOverlay.js';

// Screen Components
import { SplashScreen } from './components/screens/SplashScreen.js';
import { SignUpScreen } from './components/screens/SignUpScreen.js';
import { LogInScreen } from './components/screens/LogInScreen.js';
import { ResetPasswordScreen } from './components/screens/ResetPasswordScreen.js';
import { OnboardingScreen } from './components/screens/OnboardingScreen.js';
import { HomeScreen } from './components/screens/HomeScreen.js';
import { FocusTimerScreen } from './components/screens/FocusTimerScreen.js';
import { AIAgentScreen } from './components/screens/AIAgentScreen.js';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen.js';
import { SettingsScreen } from './components/screens/SettingsScreen.js';

const AppNavigator: React.FC = () => {
  const { currentScreen, activeTab, currentTheme } = useApp();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0D0221] text-purple-300">
        <div className="w-10 h-10 border-3 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-3 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        <span className="text-xs font-mono text-purple-200 tracking-wide">Syncing Aura Coach...</span>
      </div>
    );
  }

  // Auth / Onboarding Screens
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'signup') {
    return <SignUpScreen />;
  }

  if (currentScreen === 'login') {
    return <LogInScreen />;
  }

  if (currentScreen === 'reset_password') {
    return <ResetPasswordScreen />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen />;
  }

  // Main App with Bottom Navigation
  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden transition-colors"
      style={{ backgroundColor: currentTheme.bgBase }}
    >
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'today' && <HomeScreen />}
        {activeTab === 'focus' && <FocusTimerScreen />}
        {activeTab === 'agent' && <AIAgentScreen />}
        {activeTab === 'stats' && <AnalyticsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </div>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AndroidFrame>
          <AppNavigator />
          <LimitModal />
          <FocusDriftToastOverlay />
        </AndroidFrame>
      </AppProvider>
    </AuthProvider>
  );
}
