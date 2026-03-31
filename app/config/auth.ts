/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/

const parseEmails = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
};

export const ADMIN_EMAILS = parseEmails(process.env.EXPO_PUBLIC_ADMIN_EMAILS);

const googleExpoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? '';
const googleAndroidClientId =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? googleExpoClientId;
const googleIosClientId =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? googleExpoClientId;
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export const GOOGLE_AUTH_CONFIG = {
  clientId: googleExpoClientId,
  androidClientId: googleAndroidClientId,
  iosClientId: googleIosClientId,
  webClientId: googleWebClientId,
};

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const isGmailAddress = (email: string | null | undefined): boolean => {
  if (!email) {
    return false;
  }

  return email.toLowerCase().endsWith('@gmail.com');
};
