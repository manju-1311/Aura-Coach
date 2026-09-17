import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types.js';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, college?: string) => Promise<{ success: boolean; error?: string }>;
  ssoLogin: (provider: 'google' | 'apple') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'aura_coach_token';
const USER_KEY = 'aura_coach_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate or restore user profile on mount
  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          } else {
            // Token expired or invalid
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        } catch {
          // If offline, retain cached user
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (email: string, password: string, rememberMe = true) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setToken(data.token);
      setUser(data.user);
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error or server unavailable' };
    }
  };

  const signup = async (name: string, email: string, password: string, college?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, college }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error or server unavailable' };
    }
  };

  const ssoLogin = async (provider: 'google' | 'apple') => {
    try {
      const res = await fetch('/api/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: 'SSO request failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!token) return false;
    try {
      // Optimistic local update
      if (user) {
        const next = { ...user, ...updates };
        setUser(next);
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      }
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
    } catch {
      // offline
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        ssoLogin,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
