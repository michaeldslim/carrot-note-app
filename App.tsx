/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React from 'react';
import RootNavigator from './app/navigation/RootNavigator';
import { ThemeProvider } from './app/theme/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
};

export default App;
