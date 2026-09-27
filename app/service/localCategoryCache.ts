/*
 Copyright (C) 2025 Michael Lim - Carrot Note App
 This software is free to use, modify, and share under
 the terms of the GNU General Public License v3.
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryRecord } from '../types/category';

const cacheKey = (userId: string) => `@carrot/categoryRecords:${userId}`;

export async function getCachedCategoryRecords(
  userId: string,
): Promise<CategoryRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CategoryRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (record) =>
        record &&
        typeof record.name === 'string' &&
        typeof record.color === 'string',
    );
  } catch {
    return [];
  }
}

export async function saveCachedCategoryRecords(
  userId: string,
  records: CategoryRecord[],
): Promise<void> {
  await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(records));
}
