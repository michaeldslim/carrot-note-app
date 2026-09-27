/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  setNote,
  updateNote,
  toggleStatus,
  deleteNote,
  newNoteDocumentId,
} from './firebaseService';
import {
  cancelDeadlineReminder,
  upsertDeadlineReminder,
} from './notificationService';
import { Note } from '../screens/types';
import { advanceRecurrenceDates } from '../utils/noteDates';
import { showError } from '../utils/showError';
import { isOfflineError } from '../utils/networkErrors';
import {
  isDeviceOnline,
  isTimeoutError,
  withTimeout,
} from '../utils/networkStatus';
import {
  savePendingNote,
  updatePendingNote,
  removePendingNote,
  isPendingNote,
  queueOfflineMutation,
} from './localNoteCache';
import { FIREBASE_AUTH } from '../../firebaseConfig';

type NoteReminderFields = Pick<Note, 'id' | 'title' | 'note' | 'endDate'>;

function currentUserId(): string | undefined {
  return FIREBASE_AUTH.currentUser?.uid;
}

function isRetriableNetworkFailure(error: unknown): boolean {
  return isOfflineError(error) || isTimeoutError(error);
}

export async function createNote(
  note: Omit<Note, 'id'>,
): Promise<string | null> {
  const userId = note.userId ?? currentUserId();
  if (!userId) {
    showError('You must be signed in to save a note');
    return null;
  }

  const noteId = newNoteDocumentId();
  const localNote: Note = { ...note, id: noteId, userId };

  await savePendingNote(userId, localNote);

  const scheduleReminder = () =>
    upsertDeadlineReminder({
      id: noteId,
      title: note.title,
      note: note.note,
      endDate: note.endDate,
    });

  if (!(await isDeviceOnline())) {
    await scheduleReminder();
    return noteId;
  }

  try {
    await withTimeout(setNote(noteId, { ...note, userId }));
    await removePendingNote(userId, noteId);
    await scheduleReminder();
    return noteId;
  } catch (error) {
    if (isRetriableNetworkFailure(error)) {
      await scheduleReminder();
      return noteId;
    }

    await removePendingNote(userId, noteId);
    const message =
      error instanceof Error ? error.message : 'Failed to create note';
    showError(message);
    return null;
  }
}

export async function updateNoteWithReminder(
  id: string,
  updates: Partial<
    Pick<
      Note,
      'title' | 'note' | 'startDate' | 'endDate' | 'category' | 'recurrence' | 'completed'
    >
  >,
  reminderFields: NoteReminderFields,
): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) {
    showError('You must be signed in to update a note');
    return false;
  }

  if (await isPendingNote(userId, id)) {
    const updated = await updatePendingNote(userId, id, updates);
    if (!updated) return false;
    await upsertDeadlineReminder(reminderFields);
    return true;
  }

  if (!(await isDeviceOnline())) {
    await queueOfflineMutation(userId, { noteId: id, type: 'update', updates });
    await upsertDeadlineReminder(reminderFields);
    return true;
  }

  try {
    await withTimeout(updateNote(id, updates));
    await upsertDeadlineReminder(reminderFields);
    return true;
  } catch (error) {
    if (isRetriableNetworkFailure(error)) {
      await queueOfflineMutation(userId, { noteId: id, type: 'update', updates });
      await upsertDeadlineReminder(reminderFields);
      return true;
    }
    const message =
      error instanceof Error ? error.message : 'Failed to update note';
    showError(message);
    return false;
  }
}

export async function deleteNoteWithReminder(noteId: string): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) {
    showError('You must be signed in to delete a note');
    return false;
  }

  if (await isPendingNote(userId, noteId)) {
    await removePendingNote(userId, noteId);
    await cancelDeadlineReminder(noteId);
    return true;
  }

  if (!(await isDeviceOnline())) {
    await queueOfflineMutation(userId, { noteId, type: 'delete' });
    await cancelDeadlineReminder(noteId);
    return true;
  }

  try {
    await withTimeout(deleteNote(noteId));
    await cancelDeadlineReminder(noteId);
    return true;
  } catch (error) {
    if (isRetriableNetworkFailure(error)) {
      await queueOfflineMutation(userId, { noteId, type: 'delete' });
      await cancelDeadlineReminder(noteId);
      return true;
    }
    const message =
      error instanceof Error ? error.message : 'Failed to delete note';
    showError(message);
    return false;
  }
}

export async function toggleNoteStatus(
  noteId: string,
  completed: boolean,
  note?: Note,
): Promise<boolean> {
  const userId = currentUserId();
  if (!userId) {
    showError('You must be signed in to update a note');
    return false;
  }

  try {
    if (completed && note?.recurrence && note.startDate) {
      const { startDate, endDate } = advanceRecurrenceDates(note);
      const updates = {
        startDate,
        endDate,
        completed: false as const,
      };

      if (await isPendingNote(userId, noteId)) {
        await updatePendingNote(userId, noteId, updates);
      } else if (!(await isDeviceOnline())) {
        await queueOfflineMutation(userId, {
          noteId,
          type: 'update',
          updates,
        });
      } else {
        try {
          await withTimeout(updateNote(noteId, updates));
        } catch (error) {
          if (!isRetriableNetworkFailure(error)) throw error;
          await queueOfflineMutation(userId, {
            noteId,
            type: 'update',
            updates,
          });
        }
      }

      await upsertDeadlineReminder({
        id: noteId,
        title: note.title,
        note: note.note,
        endDate,
      });
      return true;
    }

    if (await isPendingNote(userId, noteId)) {
      await updatePendingNote(userId, noteId, { completed });
      return true;
    }

    if (!(await isDeviceOnline())) {
      await queueOfflineMutation(userId, {
        noteId,
        type: 'update',
        updates: { completed },
      });
    } else {
      try {
        await withTimeout(toggleStatus(noteId, completed));
      } catch (error) {
        if (!isRetriableNetworkFailure(error)) throw error;
        await queueOfflineMutation(userId, {
          noteId,
          type: 'update',
          updates: { completed },
        });
      }
    }
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update status';
    showError(message);
    return false;
  }
}
