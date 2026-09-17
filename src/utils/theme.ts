import { ThemeType, ThemeConfig } from '../types.js';

export const THEMES: Record<ThemeType, ThemeConfig> = {
  neon_purple: {
    id: 'neon_purple',
    name: 'Neon Purple & White',
    emoji: '🔮',
    tagline: 'Cosmic Purple, Crisp White & Electric Neon Glow',
    bgBase: '#0D0221',
    bgSurface: '#190838',
    bgElevated: '#260D52',
    bgInput: '#13052E',
    borderBase: '#4C1D95',
    borderFocus: '#C084FC',
    textPrimary: '#FFFFFF',
    textSecondary: '#F3E8FF',
    textMuted: '#C084FC',
    accentPrimary: '#A855F7', // Neon Purple
    accentHover: '#9333EA',
    accentGradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    accentTint: 'rgba(168, 85, 247, 0.25)',
    accentText: '#F0ABFC',
    danger: '#FF0055',
    warning: '#FFE600',
    isLight: false,
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Teal',
    emoji: '⚡',
    tagline: 'Electric Cyan & Neo Deep Dark',
    bgBase: '#050D14',
    bgSurface: '#0B1B26',
    bgElevated: '#11293A',
    bgInput: '#07141E',
    borderBase: '#183D54',
    borderFocus: '#06B6D4',
    textPrimary: '#F8FAFC',
    textSecondary: '#93C5FD',
    textMuted: '#475569',
    accentPrimary: '#06B6D4', // Cyan 500
    accentHover: '#0891B2',
    accentGradient: 'from-cyan-600 via-teal-500 to-emerald-400',
    accentTint: 'rgba(6, 182, 212, 0.15)',
    accentText: '#67E8F9',
    danger: '#F43F5E',
    warning: '#FBBF24',
    isLight: false,
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Obsidian',
    emoji: '🔥',
    tagline: 'Warm Charcoal & Sunset Ember',
    bgBase: '#120E0B',
    bgSurface: '#1E1712',
    bgElevated: '#2A2019',
    bgInput: '#17120E',
    borderBase: '#3C2E24',
    borderFocus: '#F59E0B',
    textPrimary: '#FFFBEB',
    textSecondary: '#D97706',
    textMuted: '#78716C',
    accentPrimary: '#F59E0B', // Amber 500
    accentHover: '#D97706',
    accentGradient: 'from-amber-500 via-orange-500 to-rose-500',
    accentTint: 'rgba(245, 158, 11, 0.15)',
    accentText: '#FCD34D',
    danger: '#EF4444',
    warning: '#F59E0B',
    isLight: false,
  },
  nature: {
    id: 'nature',
    name: 'Forest Zen',
    emoji: '🌿',
    tagline: 'Restorative Deep Evergreen & Emerald',
    bgBase: '#08120B',
    bgSurface: '#0F2115',
    bgElevated: '#163120',
    bgInput: '#0B1A10',
    borderBase: '#20462E',
    borderFocus: '#10B981',
    textPrimary: '#F0FDF4',
    textSecondary: '#86EFAC',
    textMuted: '#52796F',
    accentPrimary: '#10B981', // Emerald 500
    accentHover: '#059669',
    accentGradient: 'from-emerald-600 via-emerald-500 to-teal-400',
    accentTint: 'rgba(16, 185, 129, 0.15)',
    accentText: '#6EE7B7',
    danger: '#F43F5E',
    warning: '#FBBF24',
    isLight: false,
  },
  light: {
    id: 'light',
    name: 'Titanium Light',
    emoji: '☀️',
    tagline: 'Crisp High-Contrast Neutral Daylight',
    bgBase: '#F1F5F9',
    bgSurface: '#FFFFFF',
    bgElevated: '#E2E8F0',
    bgInput: '#F8FAFC',
    borderBase: '#CBD5E1',
    borderFocus: '#4F46E5',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    accentPrimary: '#4F46E5', // Indigo 600
    accentHover: '#4338CA',
    accentGradient: 'from-indigo-600 via-blue-600 to-sky-500',
    accentTint: 'rgba(79, 70, 229, 0.10)',
    accentText: '#4F46E5',
    danger: '#E11D48',
    warning: '#D97706',
    isLight: true,
  },
};

export function getTheme(themeId?: string): ThemeConfig {
  if (themeId && (THEMES as Record<string, ThemeConfig>)[themeId]) {
    return (THEMES as Record<string, ThemeConfig>)[themeId];
  }
  return THEMES.neon_purple; // Default base color theme (Purple, White & Neon)
}

export function applyThemeVariables(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-bg-base', theme.bgBase);
  root.style.setProperty('--color-bg-surface', theme.bgSurface);
  root.style.setProperty('--color-bg-elevated', theme.bgElevated);
  root.style.setProperty('--color-bg-input', theme.bgInput);
  root.style.setProperty('--color-border-base', theme.borderBase);
  root.style.setProperty('--color-border-focus', theme.borderFocus);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-text-muted', theme.textMuted);
  root.style.setProperty('--color-accent-primary', theme.accentPrimary);
  root.style.setProperty('--color-accent-hover', theme.accentHover);
  root.style.setProperty('--color-accent-tint', theme.accentTint);
  root.style.setProperty('--color-accent-text', theme.accentText);
  root.style.setProperty('--color-danger', theme.danger);
  root.style.setProperty('--color-warning', theme.warning);

  document.body.style.backgroundColor = theme.bgBase;
  document.body.style.color = theme.textPrimary;
}
