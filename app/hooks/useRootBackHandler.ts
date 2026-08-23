/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * On root stack screens, swallow the Android hardware back button so React
 * Navigation does not dispatch an unhandled GO_BACK action.
 */
export function useRootBackHandler(): void {
  const navigation = useNavigation();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        return false;
      }

      return true;
    });

    return () => subscription.remove();
  }, [navigation]);
}
