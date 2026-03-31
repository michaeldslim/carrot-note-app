/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, ThemeColors, themes } from './themes';

const THEME_STORAGE_KEY = 'app_theme';

interface ThemeContextValue {
  themeName: ThemeName;
  colors: ThemeColors;
  setTheme: (name: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'light',
  colors: themes.light,
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored && stored in themes) {
        setThemeName(stored as ThemeName);
      }
    });
  }, []);

  const setTheme = async (name: ThemeName) => {
    setThemeName(name);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, colors: themes[themeName], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
