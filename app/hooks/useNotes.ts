/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useCallback, useEffect, useMemo, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { fetchNotes, subscribeToNotes } from '../service/firebaseService';
import {
  deleteNoteWithReminder,
  toggleNoteStatus,
} from '../service/noteActions';
import { syncPendingNotes } from '../service/noteSync';
import {
  applyOfflineMutations,
  getOfflineMutations,
  getPendingNotes,
  mergeRemoteAndLocalNotes,
  subscribeLocalNotesChanged,
  type OfflineMutation,
} from '../service/localNoteCache';
import { Note } from '../screens/types';
import { showError } from '../utils/showError';
import { advanceRecurrenceDates } from '../utils/noteDates';
import { isOfflineError } from '../utils/networkErrors';

export interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  reloadLocalCache: () => Promise<void>;
  getNoteById: (noteId: string) => Note | undefined;
  deleteNoteOptimistic: (noteId: string) => Promise<boolean>;
  toggleNoteOptimistic: (noteId: string, completed: boolean) => Promise<boolean>;
}

function sortNotesByCreatedAt(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function buildMergedNotes(
  remote: Note[],
  pending: Note[],
  mutations: OfflineMutation[],
): Note[] {
  const merged = mergeRemoteAndLocalNotes(remote, pending);
  return sortNotesByCreatedAt(applyOfflineMutations(merged, mutations));
}

export function useNotes(userId: string | undefined): UseNotesResult {
  const [remoteNotes, setRemoteNotes] = useState<Note[]>([]);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [offlineMutations, setOfflineMutations] = useState<OfflineMutation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const notes = useMemo(
    () => buildMergedNotes(remoteNotes, pendingNotes, offlineMutations),
    [remoteNotes, pendingNotes, offlineMutations],
  );

  const reloadLocalState = useCallback(async () => {
    if (!userId) {
      setPendingNotes([]);
      setOfflineMutations([]);
      setLoading(false);
      return;
    }

    const [pending, mutations] = await Promise.all([
      getPendingNotes(userId),
      getOfflineMutations(userId),
    ]);
    setPendingNotes(pending);
    setOfflineMutations(mutations);
    // Local cache is enough to render; do not wait on Firestore when offline.
    setLoading(false);
  }, [userId]);

  const runSync = useCallback(async () => {
    if (!userId) return;
    await syncPendingNotes(userId);
    await reloadLocalState();
  }, [userId, reloadLocalState]);

  useEffect(() => {
    reloadLocalState().then();
  }, [reloadLocalState]);

  useEffect(() => {
    return subscribeLocalNotesChanged(() => {
      reloadLocalState().then();
    });
  }, [reloadLocalState]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      if (online) {
        runSync().then();
      }
    });

    return unsubscribe;
  }, [userId, runSync]);

  useEffect(() => {
    if (!userId) {
      setRemoteNotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    NetInfo.fetch().then((state) => {
      if (cancelled) return;
      const online =
        state.isConnected === true && state.isInternetReachable !== false;
      if (!online) {
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToNotes(
      userId,
      (nextNotes) => {
        setRemoteNotes(nextNotes);
        setLoading(false);
        setError(null);
        runSync().then();
      },
      (snapshotError) => {
        setLoading(false);
        if (isOfflineError(snapshotError)) {
          setError(null);
          return;
        }
        setError(snapshotError.message);
        showError(snapshotError.message, 'Sync error');
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId, runSync]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    setRefreshing(true);
    try {
      await runSync();
      const fetchedNotes = await fetchNotes(userId);
      setRemoteNotes(fetchedNotes);
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to refresh notes';
      if (!isOfflineError(refreshError)) {
        setError(message);
        showError(message);
      }
    } finally {
      setRefreshing(false);
    }
  }, [userId, runSync]);

  const getNoteById = useCallback(
    (noteId: string) => notes.find((note) => note.id === noteId),
    [notes],
  );

  const deleteNoteOptimistic = useCallback(
    async (noteId: string): Promise<boolean> => {
      const previousRemote = remoteNotes;
      const previousPending = pendingNotes;
      const previousMutations = offlineMutations;

      setRemoteNotes((current) => current.filter((note) => note.id !== noteId));
      setPendingNotes((current) => current.filter((note) => note.id !== noteId));
      setOfflineMutations((current) =>
        current.filter((mutation) => mutation.noteId !== noteId),
      );

      const success = await deleteNoteWithReminder(noteId);
      if (!success) {
        setRemoteNotes(previousRemote);
        setPendingNotes(previousPending);
        setOfflineMutations(previousMutations);
      }
      return success;
    },
    [remoteNotes, pendingNotes, offlineMutations],
  );

  const toggleNoteOptimistic = useCallback(
    async (noteId: string, completed: boolean): Promise<boolean> => {
      const note = notes.find((item) => item.id === noteId);
      const previousRemote = remoteNotes;
      const previousPending = pendingNotes;
      const previousMutations = offlineMutations;

      if (completed && note?.recurrence && note.startDate) {
        const { startDate, endDate } = advanceRecurrenceDates(note);
        const applyRecurrence = (list: Note[]) =>
          list.map((item) =>
            item.id === noteId
              ? { ...item, startDate, endDate, completed: false }
              : item,
          );

        setRemoteNotes(applyRecurrence);
        setPendingNotes(applyRecurrence);

        const success = await toggleNoteStatus(noteId, completed, note);
        if (!success) {
          setRemoteNotes(previousRemote);
          setPendingNotes(previousPending);
          setOfflineMutations(previousMutations);
        }
        return success;
      }

      const applyCompleted = (list: Note[]) =>
        list.map((item) =>
          item.id === noteId ? { ...item, completed } : item,
        );

      setRemoteNotes(applyCompleted);
      setPendingNotes(applyCompleted);

      const success = await toggleNoteStatus(noteId, completed, note);
      if (!success) {
        setRemoteNotes(previousRemote);
        setPendingNotes(previousPending);
        setOfflineMutations(previousMutations);
      }
      return success;
    },
    [notes, remoteNotes, pendingNotes, offlineMutations],
  );

  return useMemo(
    () => ({
      notes,
      loading,
      error,
      refreshing,
      refresh,
      reloadLocalCache: reloadLocalState,
      getNoteById,
      deleteNoteOptimistic,
      toggleNoteOptimistic,
    }),
    [
      notes,
      loading,
      error,
      refreshing,
      refresh,
      reloadLocalState,
      getNoteById,
      deleteNoteOptimistic,
      toggleNoteOptimistic,
    ],
  );
}
