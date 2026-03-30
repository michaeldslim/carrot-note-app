/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { ui } from '../theme/ui';

type NoteLogoutProps = NativeStackNavigationProp<RootStackList, 'List'>;

const Logout: React.FC = () => {
  const navigation = useNavigation<NoteLogoutProps>();
  const auth = FIREBASE_AUTH;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('user');
      navigation.navigate('Login');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', `Logout failed: ${error.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={styles.button}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    marginHorizontal: 14,
    marginBottom: 18,
    paddingVertical: 14,
    backgroundColor: ui.colors.danger,
    borderRadius: ui.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: ui.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default Logout;
