/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import NoteList from '../screens/NoteList';
import Loading from '../screens/Loading';
import NoteDetail from '../screens/NoteDetail';
import { Note } from '../screens/types';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import Settings from '../screens/Settings';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ui } from '../theme/ui';

export type RootStackList = {
  Loading: undefined;
  List: undefined;
  Detail: { noteItem: Note };
  Login: undefined;
  Signup: undefined;
  Logout: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackList>();

const SettingsButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>⚙ Settings</Text>
  </TouchableOpacity>
);

const RootNavigator = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: ui.colors.surface,
            },
            headerTintColor: ui.colors.textPrimary,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '700',
              color: ui.colors.textPrimary,
            },
            contentStyle: {
              backgroundColor: ui.colors.background,
            },
          }}
          initialRouteName="Loading"
        >
          <Stack.Screen
            name="Loading"
            component={Loading}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ title: 'Carrot Note Login' }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{ title: 'Carrot Note Signup', headerBackVisible: false }}
          />
          <Stack.Screen
            name="List"
            component={NoteList}
            options={({ navigation }) => ({
              title: 'Carrot Note List',
              headerBackVisible: false,
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <SettingsButton onPress={() => navigation.navigate('Settings')} />
                </View>
              ),
            })}
          />
          <Stack.Screen
            name="Detail"
            component={NoteDetail}
            options={{ title: 'Carrot Note Detail' }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ title: 'Carrot Note Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: ui.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: ui.colors.border,
    borderRadius: ui.radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: ui.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RootNavigator;
