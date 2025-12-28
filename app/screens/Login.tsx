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
} from 'react-native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { IconButton } from 'react-native-paper';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { getAuthErrorMessage } from '../service/firebaseErrors';

type NoteListProps = NativeStackScreenProps<RootStackList, 'Login'>;

const Login: React.FC<NoteListProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const auth = FIREBASE_AUTH;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        navigation.replace('List');
      }
    });

    return () => unsubscribe();
  }, [auth, navigation]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.inputSpacer} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(e) => setEmail(e.trim())}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={(e) => setPassword(e.trim())}
              autoCapitalize="none"
            />
            <IconButton
              icon={showPassword ? 'eye-off' : 'eye'}
              size={20}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              email.trim() === '' ? styles.disabledButton : styles.addButton,
            ]}
            onPress={handleLogin}
            disabled={email.trim() === ''}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
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
  inputSpacer: {
    height: 50,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: '#d8d8d8',
  },
  addButton: {
    backgroundColor: '#4caf50',
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

export default Login;
