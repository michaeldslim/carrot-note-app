/*
 Copyright (C) 2025 Michael Lim - Carrot Note App
 This software is free to use, modify, and share under
 the terms of the GNU General Public License v3.
*/

/** True when Firestore / fetch failed because the device is offline or unreachable. */
export function isOfflineError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: string }).code;
  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'network-request-failed'
  ) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /network|offline|internet|failed to fetch|connection|timed out/i.test(
    message,
  );
}
