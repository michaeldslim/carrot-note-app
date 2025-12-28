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
  query,
  where,
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

const notesCollection = collection(FIRESTORE_DB, 'notes');

export const fetchNotes = async (userId: string): Promise<Note[]> => {
  try {
    const notesRef = collection(FIRESTORE_DB, 'notes');
    const q = query(notesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notes: Note[] = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data() as any;

      return {
        id: docSnap.id,
        title: typeof data.title === 'string' ? data.title : undefined,
        note: typeof data.note === 'string' ? data.note : '',
        completed: Boolean(data.completed),
        createdAt: String(data.createdAt),
        category:
          typeof data.category === 'string' ? (data.category as string) : undefined,
        userId: typeof data.userId === 'string' ? (data.userId as string) : undefined,
      };
    });

    // Sort by createdAt in descending order (newest first)
    return notes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
};

export const addNote = async (note: Omit<Note, 'id'>) => {
  await addDoc(notesCollection, note);
};

export const updateNote = async (
  id: string,
  updates: Partial<Pick<Note, 'title' | 'note'>>,
) => {
  const editDoc = doc(FIRESTORE_DB, 'notes', id);
  await updateDoc(editDoc, updates);
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

    for (const category of newCategories) {
      await addDoc(categoriesCollection, { userId, category });
    }
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Error', `Adding categories: ${error.message}`);
    } else {
      Alert.alert('Error', 'An unknown error occurred');
    }
  }
};

export const fetchCategories = async (userId: string): Promise<string[]> => {
  try {
    const categoriesCollection = collection(FIRESTORE_DB, 'categories');
    const q = query(categoriesCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const categories: string[] = [];
    querySnapshot.forEach((doc) => {
      categories.push(doc.data().category);
    });

    // Ensure categories are unique before returning
    const uniqueCategories = Array.from(new Set(categories));

    return uniqueCategories.sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (error instanceof Error) {
      Alert.alert('Error', `Fetching categories: ${error.message}`);
    } else {
      Alert.alert('Error', 'An unknown error occurred');
    }
    return [];
  }
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
