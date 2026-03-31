/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { CategoryManager } from '../components/categoryManager';
import { PasswordManager } from '../components/passwordManager';
import Logout from './Logout';
import { ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import { ThemeName, THEME_LABELS } from '../theme/themes';
import { FIREBASE_AUTH } from '../../firebaseConfig';

const Settings = () => {
  const { colors, themeName, setTheme } = useTheme();
  const themeNames: ThemeName[] = ['light', 'darkGreen', 'darkTeal'];
  const isGoogleUser =
    FIREBASE_AUTH.currentUser?.providerData?.some(
      (provider) => provider.providerId === 'google.com',
    ) ?? false;

  const styles = useMemo(() => StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    themeCard: {
      paddingVertical: 18,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderRadius: ui.radius.lg,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 14,
      color: colors.textPrimary,
    },
    themeRow: {
      flexDirection: 'row',
      gap: 10,
    },
    themeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: ui.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: colors.surfaceSoft,
    },
    themeButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
    },
    themeButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    themeButtonTextActive: {
      color: colors.primaryDark,
    },
  }), [colors]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.themeCard}>
              <Text style={styles.themeTitle}>Theme</Text>
              <View style={styles.themeRow}>
                {themeNames.map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.themeButton, themeName === name && styles.themeButtonActive]}
                    onPress={() => setTheme(name)}
                  >
                    <Text style={[styles.themeButtonText, themeName === name && styles.themeButtonTextActive]}>
                      {THEME_LABELS[name]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {!isGoogleUser ? <PasswordManager /> : null}
            <CategoryManager />
          </ScrollView>
          <Logout />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Settings;
