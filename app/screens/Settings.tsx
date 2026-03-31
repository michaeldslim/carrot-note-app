/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { CategoryManager } from '../components/categoryManager';
import { PasswordManager } from '../components/passwordManager';
import Logout from './Logout';
import { ui } from '../theme/ui';
import { FIREBASE_AUTH } from '../../firebaseConfig';

const Settings = () => {
  const isGoogleUser =
    FIREBASE_AUTH.currentUser?.providerData?.some(
      (provider) => provider.providerId === 'google.com',
    ) ?? false;

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
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Settings</Text>
              <Text style={styles.pageSubtitle}>Manage your account and preferences</Text>
            </View>
            {!isGoogleUser ? <PasswordManager /> : null}
            <Text style={styles.sectionTitle}>Categories</Text>
            <CategoryManager />
          </ScrollView>
          <Logout />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: ui.colors.background,
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
  pageHeader: {
    marginBottom: 8,
  },
  pageTitle: {
    ...ui.typography.title,
    color: ui.colors.textPrimary,
    fontSize: 30,
  },
  pageSubtitle: {
    ...ui.typography.subtitle,
    color: ui.colors.textSecondary,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 8,
    color: ui.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default Settings;
