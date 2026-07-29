/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchNotes, subscribeToNotes } from '../service/firebaseService';
import {
  deleteNoteWithReminder,
  toggleNoteStatus,
} from '../service/noteActions';
import { Note } from '../screens/types';
import { showError } from '../utils/showError';

export interface UseNotesResult {
  notes: Note[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  getNoteById: (noteId: string) => Note | undefined;
  deleteNoteOptimistic: (noteId: string) => Promise<boolean>;
  toggleNoteOptimistic: (noteId: string, completed: boolean) => Promise<boolean>;
}

export function useNotes(userId: string | undefined): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotes(
      userId,
      (nextNotes) => {
        setNotes(nextNotes);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
        showError(snapshotError.message, 'Sync error');
      },
    );

    return unsubscribe;
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    setRefreshing(true);
    try {
      const fetchedNotes = await fetchNotes(userId);
      setNotes(fetchedNotes);
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : 'Failed to refresh notes';
      setError(message);
      showError(message);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  const getNoteById = useCallback(
    (noteId: string) => notes.find((note) => note.id === noteId),
    [notes],
  );

  const deleteNoteOptimistic = useCallback(
    async (noteId: string): Promise<boolean> => {
      const previousNotes = notes;
      setNotes((current) => current.filter((note) => note.id !== noteId));

      const success = await deleteNoteWithReminder(noteId);
      if (!success) {
        setNotes(previousNotes);
      }
      return success;
    },
    [notes],
  );

  const toggleNoteOptimistic = useCallback(
    async (noteId: string, completed: boolean): Promise<boolean> => {
      const previousNotes = notes;
      setNotes((current) =>
        current.map((note) =>
          note.id === noteId ? { ...note, completed } : note,
        ),
      );

      const success = await toggleNoteStatus(noteId, completed);
      if (!success) {
        setNotes(previousNotes);
      }
      return success;
    },
    [notes],
  );

  return useMemo(
    () => ({
      notes,
      loading,
      error,
      refreshing,
      refresh,
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
      getNoteById,
      deleteNoteOptimistic,
      toggleNoteOptimistic,
    ],
  );
}
