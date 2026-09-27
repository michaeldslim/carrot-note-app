/*
 Copyright (C) 2025 Michael Lim - Carrot Note App
 This software is free to use, modify, and share under
 the terms of the GNU General Public License v3.
*/
import NetInfo from '@react-native-community/netinfo';

export async function isDeviceOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  if (state.isConnected !== true) {
    return false;
  }
  return state.isInternetReachable !== false;
}

const DEFAULT_WRITE_TIMEOUT_MS = 8_000;

export class NetworkTimeoutError extends Error {
  constructor() {
    super('Network request timed out');
    this.name = 'NetworkTimeoutError';
  }
}

/** Rejects if the promise does not settle within `ms` (avoids hung Firestore writes offline). */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = DEFAULT_WRITE_TIMEOUT_MS,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new NetworkTimeoutError()), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function isTimeoutError(error: unknown): boolean {
  return error instanceof NetworkTimeoutError;
}
