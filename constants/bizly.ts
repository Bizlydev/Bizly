export const bizlyBrand = {
  name: 'Bizly',
  colors: {
    navy: '#152A4A',
    primary: '#4678D5',
    primaryPressed: '#315FAF',
    backgroundLight: '#F4F6FA',
    surfaceLight: '#FFFFFF',
    textLight: '#152A4A',
    textMutedLight: '#718096',
    borderLight: '#E3E9F2',
    backgroundDark: '#0B1120',
    surfaceDark: '#151F32',
    textDark: '#F4F7FC',
    textMutedDark: '#A8B4C8',
    borderDark: '#2A3850',
    success: '#24A47A',
    warning: '#E7A23B',
    danger: '#D9534F',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 },
} as const;

export type BizlyLocale = 'fa' | 'en' | 'ar';
export type BizlyThemeMode = 'light' | 'dark';
