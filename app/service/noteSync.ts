/*
 Copyright (C) 2025 Michael Lim - Carrot Note App
 This software is free to use, modify, and share under
 the terms of the GNU General Public License v3.
*/
import {
  getPendingNotes,
  removePendingNote,
  getOfflineMutations,
  setOfflineMutations,
  type OfflineMutation,
} from './localNoteCache';
import {
  setNote,
  updateNote,
  deleteNote,
} from './firebaseService';
import { upsertDeadlineReminder } from './notificationService';
import { isOfflineError } from '../utils/networkErrors';
import { isDeviceOnline, withTimeout } from '../utils/networkStatus';
import { Note } from '../screens/types';

async function syncPendingCreates(userId: string): Promise<boolean> {
  const pending = await getPendingNotes(userId);
  let hitOffline = false;

  for (const note of pending) {
    try {
      await withTimeout(setNote(note.id, noteForWrite(note)));
      await removePendingNote(userId, note.id);
      await upsertDeadlineReminder({
        id: note.id,
        title: note.title,
        note: note.note,
        endDate: note.endDate,
      });
    } catch (error) {
      if (isOfflineError(error)) {
        hitOffline = true;
        break;
      }
      console.error('Failed to sync pending note:', note.id, error);
    }
  }

  return !hitOffline;
}

async function syncOfflineMutation(
  mutation: OfflineMutation,
): Promise<void> {
  if (mutation.type === 'delete') {
    await withTimeout(deleteNote(mutation.noteId));
    return;
  }

  await withTimeout(updateNote(mutation.noteId, mutation.updates));
}

async function syncPendingMutations(userId: string): Promise<boolean> {
  const mutations = await getOfflineMutations(userId);
  if (mutations.length === 0) return true;

  for (let index = 0; index < mutations.length; index++) {
    const mutation = mutations[index];
    try {
      await syncOfflineMutation(mutation);
    } catch (error) {
      if (isOfflineError(error)) {
        await setOfflineMutations(userId, mutations.slice(index));
        return false;
      }
      console.error('Failed to sync offline mutation:', mutation, error);
    }
  }

  await setOfflineMutations(userId, []);
  return true;
}

function noteForWrite(note: Note): Omit<Note, 'id'> {
  const { id: _id, ...rest } = note;
  return rest;
}

/** Push locally queued notes and edits to Firestore when connectivity is available. */
export async function syncPendingNotes(userId: string): Promise<void> {
  if (!(await isDeviceOnline())) {
    return;
  }
  const createsOk = await syncPendingCreates(userId);
  if (!createsOk) return;
  await syncPendingMutations(userId);
}
