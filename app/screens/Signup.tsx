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

type NoteListProps = NativeStackScreenProps<RootStackList, 'Signup'>;

const Signup: React.FC<NoteListProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

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
    }
  };

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
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
            />
            <IconButton
              icon={showPassword ? 'eye-off' : 'eye'}
              size={20}
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
            />
            <IconButton
              icon={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              !email.trim() || !password.trim() || !confirmPassword.trim()
                ? styles.disabledButton
                : styles.addButton,
            ]}
            onPress={handleSignup}
            disabled={
              !email.trim() || !password.trim() || !confirmPassword.trim()
            }
          >
            <Text style={styles.buttonText}>Sign Up</Text>
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
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  passwordRuleContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  passwordRuleTitleText: {
    color: 'green',
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 2,
  },
  passwordRuleItemText: {
    color: 'green',
    fontSize: 12,
    textAlign: 'left',
    marginBottom: 0,
  },
  input: {
    height: 50,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
  },
  passwordMatchText: {
    color: 'green',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#d8d8d8',
  },
  addButton: {
    backgroundColor: '#1976d2',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 12,
    marginBottom: 40,
    alignItems: 'center',
  },
  linkText: {
    color: '#1976d2',
    fontSize: 16,
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
});

export default Signup;
