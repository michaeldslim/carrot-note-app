/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { IconButton } from 'react-native-paper';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { getAuthErrorMessage } from '../service/firebaseErrors';
import { shadow, ui } from '../theme/ui';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { GOOGLE_AUTH_CONFIG, isGmailAddress } from '../config/auth';

WebBrowser.maybeCompleteAuthSession();

type NoteListProps = NativeStackScreenProps<RootStackList, 'Login'>;

const Login: React.FC<NoteListProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState<boolean>(false);

  const auth = FIREBASE_AUTH;
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  const proxyClientId = GOOGLE_AUTH_CONFIG.webClientId || GOOGLE_AUTH_CONFIG.clientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: isExpoGo ? proxyClientId || undefined : undefined,
    androidClientId: (isExpoGo ? proxyClientId : GOOGLE_AUTH_CONFIG.androidClientId) || undefined,
    iosClientId: GOOGLE_AUTH_CONFIG.iosClientId || undefined,
    webClientId: GOOGLE_AUTH_CONFIG.webClientId || undefined,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.replace('List');
      }
    });

    return () => unsubscribe();
  }, [auth, navigation]);

  useEffect(() => {
    const loginWithGoogle = async () => {
      if (!response) {
        return;
      }

      if (response.type !== 'success') {
        if (response.type === 'error') {
          setError('Google login failed. Please try again.');
        }
        setIsGoogleSubmitting(false);
        return;
      }

      let shouldStopSubmitting = true;

      try {
        const idToken = response.params?.id_token;

        if (!idToken) {
          setError('Google login failed: missing token.');
          return;
        }

        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);

        if (!isGmailAddress(userCredential.user.email)) {
          await auth.signOut();
          setError('Only Gmail accounts are allowed for Google login.');
          return;
        }

        setError(null);
        shouldStopSubmitting = false;
      } catch (googleError: any) {
        setError(getAuthErrorMessage(googleError?.code));
      } finally {
        if (shouldStopSubmitting) {
          setIsGoogleSubmitting(false);
        }
      }
    };

    loginWithGoogle().then();
  }, [auth, response]);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      await signInWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (error: any) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      setError('Google login is unavailable. Check your OAuth client IDs.');
      return;
    }

    setError(null);
    setIsGoogleSubmitting(true);
    await promptAsync();
  };

  const isDisabled =
    !email.trim() || !password.trim() || isSubmitting || isGoogleSubmitting;
  const isGoogleDisabled = !request || isSubmitting || isGoogleSubmitting;

  if (isGoogleSubmitting) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={ui.colors.primary} />
        <Text style={styles.loadingOverlayText}>Signing you in with Google...</Text>
      </View>
    );
  }

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in and keep your notes in sync</Text>
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.button,
              styles.googlePrimaryButton,
              isGoogleDisabled && styles.disabledButton,
            ]}
            onPress={handleGoogleLogin}
            disabled={isGoogleDisabled}
          >
            <Text style={styles.googlePrimaryButtonText}>
              {isGoogleSubmitting ? 'Connecting Google...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.googleHint}>Gmail accounts only</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or use email and password</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualSection}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(e) => setEmail(e.trim())}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={ui.colors.textMuted}
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={(e) => setPassword(e.trim())}
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
          <TouchableOpacity
            style={[
              styles.button,
              styles.manualButton,
              isDisabled && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={isDisabled}
          >
            <Text style={styles.manualButtonText}>
              {isSubmitting ? 'Signing in...' : 'Sign in with Email'}
            </Text>
          </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.linkText}>Don't have an account? Signup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: ui.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ui.spacing.lg,
  },
  loadingOverlayText: {
    marginTop: ui.spacing.md,
    color: ui.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: ui.colors.background,
  },
  googlePrimaryButtonText: {
    color: ui.colors.surface,
    ...ui.typography.button,
    fontSize: 14,
  },
  googleHint: {
    marginTop: -4,
    marginBottom: ui.spacing.md,
    textAlign: 'center',
    color: ui.colors.textMuted,
    fontSize: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ui.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: ui.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: ui.colors.textMuted,
    fontSize: 12,
  },
  manualSection: {
    marginBottom: ui.spacing.xs,
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
  disabledButton: {
    opacity: 0.6,
  },
  googlePrimaryButton: {
    backgroundColor: ui.colors.primary,
  },
  manualButton: {
    backgroundColor: ui.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: ui.colors.border,
  },
  button: {
    minHeight: 52,
    borderRadius: ui.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ui.spacing.sm,
  },
  manualButtonText: {
    color: ui.colors.textPrimary,
    ...ui.typography.button,
    fontSize: 14,
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

export default Login;
