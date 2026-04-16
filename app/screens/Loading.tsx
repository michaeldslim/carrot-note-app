/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';

type LoadingProps = NativeStackScreenProps<RootStackList, 'Loading'>;

const Loading: React.FC<LoadingProps> = ({ navigation }) => {
  const auth = FIREBASE_AUTH;

  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    logo: {
      width: 88,
      height: 88,
      marginBottom: 20,
    },
    text: {
      marginTop: 14,
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
  }), [colors]);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');

        // Set up Firebase Auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // User is signed in
            if (!storedUser) {
              await AsyncStorage.setItem('user', JSON.stringify(user));
            }
            navigation.replace('List');
          } else {
            // No user is signed in
            if (storedUser) {
              await AsyncStorage.removeItem('user');
            }
            navigation.replace('Login');
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error checking auth state:', error);
        navigation.replace('Login');
      }
    };

    checkAuthState().then();
  }, [auth, navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Preparing your notes...</Text>
    </View>
  );
};

export default Loading;
