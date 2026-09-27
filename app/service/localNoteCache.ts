/*
 Copyright (C) 2025 Michael Lim - Carrot Note App
 This software is free to use, modify, and share under
 the terms of the GNU General Public License v3.
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../screens/types';

const pendingNotesKey = (userId: string) => `@carrot/pendingNotes:${userId}`;
const offlineMutationsKey = (userId: string) =>
  `@carrot/offlineMutations:${userId}`;

type NoteUpdateFields = Partial<
  Pick<
    Note,
    | 'title'
    | 'note'
    | 'startDate'
    | 'endDate'
    | 'category'
    | 'recurrence'
    | 'completed'
  >
>;

export type OfflineMutation =
  | { noteId: string; type: 'update'; updates: NoteUpdateFields }
  | { noteId: string; type: 'delete' };

type LocalNotesListener = () => void;
const listeners = new Set<LocalNotesListener>();

function notifyLocalNotesChanged(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeLocalNotesChanged(
  listener: LocalNotesListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getPendingNotes(userId: string): Promise<Note[]> {
  return readJson<Note[]>(pendingNotesKey(userId), []);
}

export async function savePendingNote(userId: string, note: Note): Promise<void> {
  const pending = await getPendingNotes(userId);
  const next = pending.filter((item) => item.id !== note.id);
  next.push(note);
  await writeJson(pendingNotesKey(userId), next);
  notifyLocalNotesChanged();
}

export async function updatePendingNote(
  userId: string,
  noteId: string,
  updates: NoteUpdateFields,
): Promise<boolean> {
  const pending = await getPendingNotes(userId);
  const index = pending.findIndex((item) => item.id === noteId);
  if (index < 0) return false;

  pending[index] = { ...pending[index], ...updates };
  await writeJson(pendingNotesKey(userId), pending);
  notifyLocalNotesChanged();
  return true;
}

export async function removePendingNote(
  userId: string,
  noteId: string,
): Promise<void> {
  const pending = await getPendingNotes(userId);
  const next = pending.filter((item) => item.id !== noteId);
  if (next.length === pending.length) return;
  await writeJson(pendingNotesKey(userId), next);
  notifyLocalNotesChanged();
}

export async function isPendingNote(
  userId: string,
  noteId: string,
): Promise<boolean> {
  const pending = await getPendingNotes(userId);
  return pending.some((item) => item.id === noteId);
}

export async function getOfflineMutations(
  userId: string,
): Promise<OfflineMutation[]> {
  return readJson<OfflineMutation[]>(offlineMutationsKey(userId), []);
}

export async function queueOfflineMutation(
  userId: string,
  mutation: OfflineMutation,
): Promise<void> {
  const mutations = await getOfflineMutations(userId);
  const other = mutations.filter((item) => item.noteId !== mutation.noteId);

  if (mutation.type === 'delete') {
    await writeJson(offlineMutationsKey(userId), [...other, mutation]);
    notifyLocalNotesChanged();
    return;
  }

  const existing = mutations.find(
    (item) => item.noteId === mutation.noteId && item.type === 'update',
  );
  const mergedUpdates =
    existing?.type === 'update'
      ? { ...existing.updates, ...mutation.updates }
      : mutation.updates;

  await writeJson(offlineMutationsKey(userId), [
    ...other,
    { noteId: mutation.noteId, type: 'update', updates: mergedUpdates },
  ]);
  notifyLocalNotesChanged();
}

export async function setOfflineMutations(
  userId: string,
  mutations: OfflineMutation[],
): Promise<void> {
  await writeJson(offlineMutationsKey(userId), mutations);
  notifyLocalNotesChanged();
}

export function applyOfflineMutations(
  notes: Note[],
  mutations: OfflineMutation[],
): Note[] {
  const byId = new Map(notes.map((note) => [note.id, note]));

  for (const mutation of mutations) {
    if (mutation.type === 'delete') {
      byId.delete(mutation.noteId);
      continue;
    }

    const existing = byId.get(mutation.noteId);
    if (existing) {
      byId.set(mutation.noteId, { ...existing, ...mutation.updates });
    }
  }

  return Array.from(byId.values());
}

export function mergeRemoteAndLocalNotes(
  remote: Note[],
  pending: Note[],
): Note[] {
  const byId = new Map(remote.map((note) => [note.id, note]));
  for (const note of pending) {
    if (!byId.has(note.id)) {
      byId.set(note.id, note);
    }
  }
  return Array.from(byId.values());
}
