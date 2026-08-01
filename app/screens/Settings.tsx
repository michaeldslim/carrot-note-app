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
import * as Application from 'expo-application';
import { CategoryManager } from '../components/categoryManager';
import { PasswordManager } from '../components/passwordManager';
import Logout from './Logout';
import { ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import { ThemePreference, THEME_LABELS } from '../theme/themes';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { MIN_TOUCH_TARGET } from '../utils/accessibility';

const Settings = () => {
  const { colors, themePreference, setTheme } = useTheme();
  const themeNames: ThemePreference[] = [
    'system',
    'light',
    'darkGreen',
    'darkTeal',
  ];
  const isGoogleUser =
    FIREBASE_AUTH.currentUser?.providerData?.some(
      (provider) => provider.providerId === 'google.com',
    ) ?? false;

  const versionLabel = useMemo(() => {
    const version = Application.nativeApplicationVersion ?? '—';
    return `v${version}`;
  }, []);

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
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    themeButton: {
      width: '47%',
      minHeight: MIN_TOUCH_TARGET,
      paddingVertical: 12,
      borderRadius: ui.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
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
    footer: {
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    versionText: {
      fontSize: 12,
      color: colors.textMuted,
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
              <View style={styles.themeGrid}>
                {themeNames.map((name) => {
                  const isActive = themePreference === name;
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[
                        styles.themeButton,
                        isActive && styles.themeButtonActive,
                      ]}
                      onPress={() => setTheme(name)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`${THEME_LABELS[name]} theme`}
                    >
                      <Text
                        style={[
                          styles.themeButtonText,
                          isActive && styles.themeButtonTextActive,
                        ]}
                      >
                        {THEME_LABELS[name]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {!isGoogleUser ? <PasswordManager /> : null}
            <CategoryManager />
          </ScrollView>
          <View style={styles.footer}>
            <Text style={styles.versionText}>Carrot Note {versionLabel}</Text>
          </View>
          <Logout />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Settings;
