/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { NavigationProp } from '@react-navigation/native';
import { RootStackList } from './RootNavigator';

/** Pop the stack when possible; otherwise return to the calendar home screen. */
export function safeGoBack(
  navigation: NavigationProp<RootStackList>,
): void {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  navigation.navigate('Calendar');
}
