/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { FIRESTORE_DB } from '../../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Note } from '../screens/types';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { getAuthErrorMessage } from './firebaseErrors';
import { Alert } from 'react-native';
import { CategoryRecord } from '../types/category';
import {
  getCategoryColorForIndex,
  getCategoryColorForName,
} from '../utils/categoryColors';

const notesCollection = collection(FIRESTORE_DB, 'notes');

export function mapDocToNote(
  docSnap: QueryDocumentSnapshot<DocumentData>,
): Note {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    title: typeof data.title === 'string' ? data.title : undefined,
    note: typeof data.note === 'string' ? data.note : '',
    completed: Boolean(data.completed),
    createdAt: String(data.createdAt),
    category:
      typeof data.category === 'string' ? (data.category as string) : undefined,
    userId: typeof data.userId === 'string' ? (data.userId as string) : undefined,
    startDate: typeof data.startDate === 'string' ? data.startDate : undefined,
    endDate: typeof data.endDate === 'string' ? data.endDate : undefined,
    recurrence:
      data.recurrence === 'weekly' || data.recurrence === 'biweekly'
        ? data.recurrence
        : undefined,
  };
}

function sortNotesByCreatedAt(notes: Note[]): Note[] {
  return notes.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function subscribeToNotes(
  userId: string,
  onNext: (notes: Note[]) => void,
  onError: (error: Error) => void,
): () => void {
  const notesRef = collection(FIRESTORE_DB, 'notes');
  const q = query(notesRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const notes = querySnapshot.docs.map(mapDocToNote);
      onNext(sortNotesByCreatedAt(notes));
    },
    (error) => {
      console.error('Error subscribing to notes:', error);
      onError(error);
    },
  );
}

export const fetchNotes = async (userId: string): Promise<Note[]> => {
  try {
    const notesRef = collection(FIRESTORE_DB, 'notes');
    const q = query(notesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map(mapDocToNote);
    return sortNotesByCreatedAt(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const addNote = async (note: Omit<Note, 'id'>) => {
  const docRef = await addDoc(notesCollection, note);
  return docRef.id;
};

export const updateNote = async (
  id: string,
  updates: Partial<
    Pick<
      Note,
      'title' | 'note' | 'startDate' | 'endDate' | 'category' | 'recurrence' | 'completed'
    >
  >,
) => {
  const editDoc = doc(FIRESTORE_DB, 'notes', id);
  const payload: Record<string, any> = { ...updates };
  if ('startDate' in updates && updates.startDate === undefined) {
    payload.startDate = deleteField();
  }
  if ('endDate' in updates && updates.endDate === undefined) {
    payload.endDate = deleteField();
  }
  if ('recurrence' in updates && updates.recurrence === undefined) {
    payload.recurrence = deleteField();
  }
  await updateDoc(editDoc, payload);
};

export const toggleStatus = async (id: string, completed: boolean) => {
  const editDoc = doc(FIRESTORE_DB, 'notes', id);
  await updateDoc(editDoc, { completed });
};

export const deleteNote = async (id: string) => {
  const editDoc = doc(FIRESTORE_DB, 'notes', id);
  await deleteDoc(editDoc);
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  const user = FIREBASE_AUTH.currentUser;
  if (!user?.email) {
    throw new Error('No user is currently signed in');
  }

  try {
    // First, re-authenticate the user with their current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );

    await reauthenticateWithCredential(user, credential);

    // Then update to the new password
    await updatePassword(user, newPassword);
    return true;
  } catch (error: any) {
    // Use our custom error message handler
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const addCategories = async (
  userId: string,
  categories: string[],
): Promise<void> => {
  try {
    const categoriesCollection = collection(FIRESTORE_DB, 'categories');

    // Load existing categories for this user to prevent duplicates
    const existingQuery = query(
      categoriesCollection,
      where('userId', '==', userId),
    );
    const existingSnapshot = await getDocs(existingQuery);

    const existingCategories = new Set<string>();
    existingSnapshot.forEach((doc) => {
      existingCategories.add(String(doc.data().category));
    });

    const newCategories = categories.filter(
      (category) => !existingCategories.has(category),
    );

    if (newCategories.length === 0) {
      return;
    }

    const existingCount = existingCategories.size;
    for (let i = 0; i < newCategories.length; i++) {
      const category = newCategories[i];
      await addDoc(categoriesCollection, {
        userId,
        category,
        color: getCategoryColorForIndex(existingCount + i),
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Error', `Adding categories: ${error.message}`);
    } else {
      Alert.alert('Error', 'An unknown error occurred');
    }
  }
};

export const fetchCategoryRecords = async (
  userId: string,
): Promise<CategoryRecord[]> => {
  try {
    const categoriesCollection = collection(FIRESTORE_DB, 'categories');
    const q = query(categoriesCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const byName = new Map<string, CategoryRecord>();

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const name = String(data.category);
      const color =
        typeof data.color === 'string'
          ? data.color
          : getCategoryColorForName(name);
      byName.set(name, { name, color });
    });

    return Array.from(byName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Error', `Fetching categories: ${error.message}`);
    } else {
      Alert.alert('Error', 'An unknown error occurred');
    }
    return [];
  }
};

export const fetchCategories = async (userId: string): Promise<string[]> => {
  const records = await fetchCategoryRecords(userId);
  return records.map((record) => record.name);
};

export const updateCategory = async (
  userId: string,
  oldCategory: string,
  newCategory: string,
): Promise<void> => {
  try {
    const categoriesCollection = collection(FIRESTORE_DB, 'categories');
    const q = query(
      categoriesCollection,
      where('userId', '==', userId),
      where('category', '==', oldCategory),
    );

    const querySnapshot = await getDocs(q);
    const updates: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      updates.push(updateDoc(doc.ref, { category: newCategory }));
    });

    await Promise.all(updates);
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Error', `Updating categories: ${error.message}`);
    } else {
      Alert.alert('Error', 'An unknown error occurred');
    }
  }
};

export const deleteCategory = async (
  userId: string,
  categoryToDelete: string,
): Promise<void> => {
  try {
    const categoriesCollection = collection(FIRESTORE_DB, 'categories');
    const q = query(
      categoriesCollection,
      where('userId', '==', userId),
      where('category', '==', categoryToDelete),
    );

    const querySnapshot = await getDocs(q);
    const deletePromises: Promise<void>[] = [];

    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Error', `Deleting categories: ${error.message}`);
    } else {
      Alert.alert('Error', 'An unknown error occurred');
    }
  }
};
