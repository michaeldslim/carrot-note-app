/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
export const ui = {
  colors: {
    background: '#F3F6FB',
    surface: '#FFFFFF',
    surfaceSoft: '#EEF4FF',
    textPrimary: '#132238',
    textSecondary: '#5D6E85',
    textMuted: '#8A99AC',
    primary: '#0F9D7A',
    primaryDark: '#0D8265',
    accent: '#F2953D',
    danger: '#E45757',
    dangerDark: '#CD3C3C',
    success: '#2F9E44',
    border: '#D9E3F0',
    disabled: '#B8C5D6',
    overlay: 'rgba(9, 22, 40, 0.45)',
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  typography: {
    title: {
      fontSize: 28,
      fontWeight: '800' as const,
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    body: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 21,
    },
    button: {
      fontSize: 15,
      fontWeight: '700' as const,
      letterSpacing: 0.2,
    },
  },
};

export const shadow = {
  shadowColor: '#10233D',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 4,
};
