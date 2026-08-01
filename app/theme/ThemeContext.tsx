/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeName,
  ThemePreference,
  ThemeColors,
  themes,
  resolveTheme,
} from './themes';

const THEME_STORAGE_KEY = 'app_theme';

interface ThemeContextValue {
  /** Stored user preference (may be `system`). */
  themePreference: ThemePreference;
  /** Resolved palette name used for rendering. */
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themePreference: 'light',
  themeName: 'light',
  colors: themes.light,
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (
        stored === 'light' ||
        stored === 'darkGreen' ||
        stored === 'darkTeal' ||
        stored === 'system'
      ) {
        setThemePreference(stored);
      }
    });
  }, []);

  const themeName = useMemo(
    () => resolveTheme(themePreference, systemScheme),
    [themePreference, systemScheme],
  );

  const setTheme = async (preference: ThemePreference) => {
    setThemePreference(preference);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        themeName,
        colors: themes[themeName],
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
