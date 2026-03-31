/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { changePassword } from '../../service/firebaseService';
import { shadow, ui } from '../../theme/ui';

export const PasswordManager = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
      // Only clear fields after successful password change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.subtitle}>Change Password</Text>
      <Text style={styles.instructions}>
        Re-enter your current password to secure this change.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholderTextColor={ui.colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholderTextColor={ui.colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholderTextColor={ui.colors.textMuted}
      />
      <TouchableOpacity 
        style={[
          styles.button, 
          (!currentPassword || currentPassword.length < 2 || !newPassword || newPassword.length < 2 || !confirmPassword || confirmPassword.length < 2) && styles.buttonDisabled
        ]} 
        onPress={handleChangePassword}
        disabled={!currentPassword || currentPassword.length < 2 || !newPassword || newPassword.length < 2 || !confirmPassword || confirmPassword.length < 2}
      >
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    backgroundColor: ui.colors.surface,
    borderRadius: ui.radius.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: ui.colors.border,
    ...shadow,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: ui.colors.textPrimary,
  },
  instructions: {
    ...ui.typography.body,
    color: ui.colors.textSecondary,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.md,
    padding: 12,
    marginBottom: 15,
    backgroundColor: ui.colors.surface,
    color: ui.colors.textPrimary,
  },
  button: {
    backgroundColor: ui.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: ui.radius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: ui.colors.disabled,
    opacity: 0.7,
  },
  buttonText: {
    color: ui.colors.surface,
    ...ui.typography.button,
  },
});
