/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { Alert } from 'react-native';

export function showError(message: string, title = 'Error'): void {
  Alert.alert(title, message);
}
