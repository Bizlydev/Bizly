export const darkColors = {
  background: '#0B1120',
  surface: '#141B2E',
  surfaceLight: '#1C2438',
  primary: '#2F6FED',
  primaryLight: '#6D8CFA',
  accent: '#7C3AED',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  border: '#2A3348',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const lightColors = {
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceLight: '#F0F2F8',
  primary: '#2F6FED',
  primaryLight: '#6D8CFA',
  accent: '#7C3AED',
  text: '#0B1120',
  textSecondary: '#6B7280',
  border: '#E2E5EE',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
};

export const gradients = {
  primary: ['#2F6FED', '#7C3AED'] as const,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontSize: 16, fontWeight: '500' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
};

export type ThemeColors = typeof darkColors;
