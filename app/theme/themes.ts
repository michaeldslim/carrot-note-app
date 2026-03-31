/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
export type ThemeName = 'light' | 'darkGreen' | 'darkTeal';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  danger: string;
  dangerDark: string;
  success: string;
  border: string;
  disabled: string;
  overlay: string;
  shadowColor: string;
}

export const themes: Record<ThemeName, ThemeColors> = {
  light: {
    background: '#EFF8F5',
    surface: '#FFFFFF',
    surfaceSoft: '#E4F4EE',
    textPrimary: '#1A3D32',
    textSecondary: '#4A7060',
    textMuted: '#7E9E94',
    primary: '#7A9E7E',
    primaryDark: '#5E8562',
    accent: '#C4956A',
    danger: '#C9826F',
    dangerDark: '#AA614A',
    success: '#7DAB76',
    border: '#C8E8DF',
    disabled: '#B5B7A6',
    overlay: 'rgba(26, 61, 50, 0.40)',
    shadowColor: '#1A3D32',
  },
  darkGreen: {
    background: '#0E1F16',
    surface: '#172D1F',
    surfaceSoft: '#1D3828',
    textPrimary: '#DFF0E8',
    textSecondary: '#95BFA9',
    textMuted: '#5E8A74',
    primary: '#4AAF7A',
    primaryDark: '#3A9065',
    accent: '#C4956A',
    danger: '#DA8A80',
    dangerDark: '#BF6255',
    success: '#5ABF7A',
    border: '#265E3C',
    disabled: '#3D6B50',
    overlay: 'rgba(0, 8, 4, 0.70)',
    shadowColor: '#000000',
  },
  darkTeal: {
    background: '#0C1E24',
    surface: '#132D35',
    surfaceSoft: '#183844',
    textPrimary: '#D8EEF4',
    textSecondary: '#7EBFCC',
    textMuted: '#4D8A97',
    primary: '#3AAABF',
    primaryDark: '#2D8FA2',
    accent: '#C4956A',
    danger: '#DA8A80',
    dangerDark: '#BF6255',
    success: '#4CAF7A',
    border: '#1C4F60',
    disabled: '#2E677A',
    overlay: 'rgba(0, 6, 10, 0.70)',
    shadowColor: '#000000',
  },
};

export const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  darkGreen: 'Dark Green',
  darkTeal: 'Dark Teal',
};
