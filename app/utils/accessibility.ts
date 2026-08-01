/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { AccessibilityInfo } from 'react-native';

export const MIN_TOUCH_TARGET = 44;

export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

export async function isReduceMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}
