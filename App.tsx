/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useEffect, Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RootNavigator from './app/navigation/RootNavigator';
import { ThemeProvider } from './app/theme/ThemeContext';
import * as WebBrowser from 'expo-web-browser';
import {
  configureNotificationChannel,
  configureNotificationHandler,
} from './app/service/notificationService';

WebBrowser.maybeCompleteAuthSession();

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message ?? String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#c0392b',
  },
  errorMessage: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
});

const App: React.FC = () => {
  useEffect(() => {
    configureNotificationHandler();
    configureNotificationChannel().then();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
