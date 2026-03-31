/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { RootStackList } from '../navigation/RootNavigator';
import { getAuthErrorMessage } from '../service/firebaseErrors';
import { shadow, ui } from '../theme/ui';

type NoteListProps = NativeStackScreenProps<RootStackList, 'Signup'>;

const Signup: React.FC<NoteListProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const auth = FIREBASE_AUTH;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&]).{8,}$/;

  const handleEmailChange = (value: string) => {
    const trimmed = value.trim();
    setEmail(trimmed);

    const emailErrorMessage = 'Please enter a valid email address.';

    if (trimmed && !emailPattern.test(trimmed)) {
      setError(emailErrorMessage);
      return;
    }

    if (error === emailErrorMessage) {
      setError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    const trimmed = value.trim();
    setPassword(trimmed);

    // First, if confirm password exists and does not match, prefer the mismatch error
    if (confirmPassword && trimmed !== confirmPassword) {
      setError('Passwords do not match');
      setPasswordsMatch(false);
      return;
    }

    // If password is present but does not satisfy strength rules, show the strength error
    if (trimmed && !passwordPattern.test(trimmed)) {
      setError(
        'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character (@, #, $, %, &).',
      );
      setPasswordsMatch(null);
      return;
    }

    // At this point, no mismatch and strength is OK (or password is empty)
    if (
      error === 'Passwords do not match' ||
      error ===
        'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character (@, #, $, %, &).'
    ) {
      setError(null);
    }

    if (confirmPassword && trimmed === confirmPassword) {
      setPasswordsMatch(true);
    } else if (!trimmed && !confirmPassword) {
      setPasswordsMatch(null);
    } else {
      setPasswordsMatch(null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    const trimmed = value.trim();
    setConfirmPassword(trimmed);

    if (trimmed) {
      if (trimmed !== password) {
        setError('Passwords do not match');
        setPasswordsMatch(false);
      } else {
        if (error === 'Passwords do not match') {
          setError(null);
        }
        setPasswordsMatch(true);
      }
    } else {
      if (error === 'Passwords do not match') {
        setError(null);
      }
      setPasswordsMatch(null);
    }
  };

  const handleSignup = async () => {
    try {
      setIsSubmitting(true);
      const emailErrorMessage = 'Please enter a valid email address.';

      if (!emailPattern.test(email)) {
        setError(emailErrorMessage);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!passwordPattern.test(password)) {
        setError(
          'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character (@, #, $, %, &).',
        );
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        Alert.alert(
          'Email Verification',
          'A verification email has been sent. Please check your inbox.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      }

      setError(null);
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled =
    !email.trim() || !password.trim() || !confirmPassword.trim() || isSubmitting;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Start organizing your notes with clarity</Text>
          </View>
          {error &&
            (error.startsWith(
              'Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character',
            ) ? (
              <View style={styles.passwordRuleContainer}>
                <Text style={styles.passwordRuleTitleText}>Password must:</Text>
                <Text style={styles.passwordRuleItemText}>
                  • Be at least 8 characters
                </Text>
                <Text style={styles.passwordRuleItemText}>
                  • Include 1 uppercase letter
                </Text>
                <Text style={styles.passwordRuleItemText}>• Include 1 number</Text>
                <Text style={styles.passwordRuleItemText}>
                  • Include 1 special character (@, #, $, %, &)
                </Text>
              </View>
            ) : (
              <Text style={styles.errorText}>{error}</Text>
            ))}
          {!error && passwordsMatch && (
            <Text style={styles.passwordMatchText}>Passwords matched</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholderTextColor={ui.colors.textMuted}
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              placeholderTextColor={ui.colors.textMuted}
            />
            <IconButton
              icon={showPassword ? 'eye-off' : 'eye'}
              size={20}
              iconColor={ui.colors.textSecondary}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          </View>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              value={confirmPassword}
              secureTextEntry={!showConfirmPassword}
              onChangeText={handleConfirmPasswordChange}
              autoCapitalize="none"
              placeholderTextColor={ui.colors.textMuted}
            />
            <IconButton
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              iconColor={ui.colors.textSecondary}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              isDisabled ? styles.disabledButton : styles.addButton,
            ]}
            onPress={handleSignup}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Creating account...' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    marginHorizontal: 16,
    borderRadius: ui.radius.lg,
    borderWidth: 1,
    borderColor: ui.colors.border,
    padding: ui.spacing.xl,
    backgroundColor: ui.colors.surface,
    ...shadow,
  },
  title: {
    ...ui.typography.title,
    color: ui.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...ui.typography.subtitle,
    color: ui.colors.textSecondary,
    textAlign: 'center',
  },
  titleWrap: {
    marginBottom: ui.spacing.lg,
  },
  errorText: {
    color: ui.colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: ui.spacing.sm,
  },
  passwordRuleContainer: {
    marginBottom: ui.spacing.md,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#F3C8C8',
    borderRadius: ui.radius.md,
    padding: ui.spacing.md,
  },
  passwordRuleTitleText: {
    color: ui.colors.textPrimary,
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 4,
    fontWeight: '700',
  },
  passwordRuleItemText: {
    color: ui.colors.textSecondary,
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 2,
  },
  input: {
    minHeight: 52,
    borderColor: ui.colors.border,
    borderWidth: 1,
    borderRadius: ui.radius.md,
    paddingHorizontal: 16,
    marginBottom: ui.spacing.md,
    backgroundColor: ui.colors.surface,
    color: ui.colors.textPrimary,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: ui.colors.border,
    borderWidth: 1,
    borderRadius: ui.radius.md,
    backgroundColor: ui.colors.surface,
    marginBottom: ui.spacing.md,
  },
  passwordInput: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    color: ui.colors.textPrimary,
  },
  passwordMatchText: {
    color: ui.colors.success,
    fontSize: 14,
    marginBottom: ui.spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: ui.colors.disabled,
  },
  addButton: {
    backgroundColor: ui.colors.primary,
  },
  button: {
    minHeight: 52,
    borderRadius: ui.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ui.spacing.sm,
  },
  buttonText: {
    color: ui.colors.surface,
    ...ui.typography.button,
  },
  link: {
    marginTop: ui.spacing.xs,
    alignItems: 'center',
  },
  linkText: {
    color: ui.colors.primaryDark,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: ui.spacing.md,
  },
  logo: {
    width: 82,
    height: 82,
  },
});

export default Signup;
