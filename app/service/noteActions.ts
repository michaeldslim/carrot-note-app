/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  addNote,
  updateNote,
  toggleStatus,
  deleteNote,
} from './firebaseService';
import {
  cancelDeadlineReminder,
  upsertDeadlineReminder,
} from './notificationService';
import { Note } from '../screens/types';
import { advanceRecurrenceDates } from '../utils/noteDates';
import { showError } from '../utils/showError';

type NoteReminderFields = Pick<Note, 'id' | 'title' | 'note' | 'endDate'>;

export async function createNote(
  note: Omit<Note, 'id'>,
): Promise<string | null> {
  try {
    const newId = await addNote(note);
    await upsertDeadlineReminder({
      id: newId,
      title: note.title,
      note: note.note,
      endDate: note.endDate,
    });
    return newId;
  } catch (error) {
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
  try {
    await updateNote(id, updates);
    await upsertDeadlineReminder(reminderFields);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update note';
    showError(message);
    return false;
  }
}

export async function deleteNoteWithReminder(noteId: string): Promise<boolean> {
  try {
    await deleteNote(noteId);
    await cancelDeadlineReminder(noteId);
    return true;
  } catch (error) {
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
  try {
    if (completed && note?.recurrence && note.startDate) {
      const { startDate, endDate } = advanceRecurrenceDates(note);
      await updateNote(noteId, {
        startDate,
        endDate,
        completed: false,
      });
      await upsertDeadlineReminder({
        id: noteId,
        title: note.title,
        note: note.note,
        endDate,
      });
      return true;
    }

    await toggleStatus(noteId, completed);
    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update status';
    showError(message);
    return false;
  }
}
