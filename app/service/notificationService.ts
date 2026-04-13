/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type DeadlineNote = {
  id: string;
  title?: string;
  note: string;
  endDate?: string;
};

const NOTIFICATION_MAP_KEY = 'carrot_note_deadline_notifications';
const ANDROID_DEADLINE_CHANNEL_ID = 'deadline-reminders';

let isHandlerConfigured = false;

const readNotificationMap = async (): Promise<Record<string, string>> => {
  const raw = await AsyncStorage.getItem(NOTIFICATION_MAP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
};

const writeNotificationMap = async (map: Record<string, string>) => {
  await AsyncStorage.setItem(NOTIFICATION_MAP_KEY, JSON.stringify(map));
};

const getScheduleDate = (endDate?: string): Date | null => {
  if (!endDate) return null;
  const value = endDate.trim();
  if (!value) return null;

  // DateRangePicker stores dates as YYYY-MM-DD.
  // For date-only reminders: try 9:00 AM local first, then 6:00 PM local if 9:00 AM already passed.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    const nineAm = new Date(y, m - 1, d, 9, 0, 0, 0);
    const sixPm = new Date(y, m - 1, d, 18, 0, 0, 0);
    const now = Date.now();

    if (nineAm.getTime() > now) return nineAm;
    if (sixPm.getTime() > now) return sixPm;
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getTime() <= Date.now()) return null;

  return date;
};

const getReminderText = (note: DeadlineNote) => {
  const label = note.title?.trim() || note.note.trim() || 'Untitled note';
  return `"${label}" is due today.`;
};

export const configureNotificationHandler = () => {
  if (isHandlerConfigured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  isHandlerConfigured = true;
};

export const configureNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(ANDROID_DEADLINE_CHANNEL_ID, {
    name: 'Deadline reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F87171',
  });
};

export const requestNotificationPermission = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const cancelDeadlineReminder = async (noteId: string) => {
  if (!noteId) return;

  const map = await readNotificationMap();
  const existingNotificationId = map[noteId];
  if (!existingNotificationId) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(existingNotificationId);
  } catch {
    // Ignore stale notification IDs and still clean persisted mapping.
  }

  delete map[noteId];
  await writeNotificationMap(map);
};

export const upsertDeadlineReminder = async (note: DeadlineNote) => {
  await cancelDeadlineReminder(note.id);

  const triggerDate = getScheduleDate(note.endDate);
  if (!triggerDate) return null;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Carrot Note Reminder',
      body: getReminderText(note),
      sound: true,
      ...(Platform.OS === 'android'
        ? { channelId: ANDROID_DEADLINE_CHANNEL_ID }
        : {}),
    },
    trigger: triggerDate,
  });

  const map = await readNotificationMap();
  map[note.id] = notificationId;
  await writeNotificationMap(map);

  return notificationId;
};
