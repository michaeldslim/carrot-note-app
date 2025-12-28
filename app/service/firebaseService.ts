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
import { Todo } from '../screens/types';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { getAuthErrorMessage } from './firebaseErrors';
import { Alert } from 'react-native';

const todosCollection = collection(FIRESTORE_DB, 'todos');

export const fetchTodos = async (userId: string): Promise<Todo[]> => {
  try {
    const todosRef = collection(FIRESTORE_DB, 'todos');
    const q = query(todosRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const todos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Todo[];

    // Sort by createdAt in descending order (newest first)
    return todos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const addTodo = async (todo: Omit<Todo, 'id'>) => {
  await addDoc(todosCollection, todo);
};

export const updateTodo = async (
  id: string,
  updates: Partial<Pick<Todo, 'title' | 'todo'>>,
) => {
  const editDoc = doc(FIRESTORE_DB, 'todos', id);
  await updateDoc(editDoc, updates);
};

export const toggleStatus = async (id: string, completed: boolean) => {
  const editDoc = doc(FIRESTORE_DB, 'todos', id);
  await updateDoc(editDoc, { completed });
};

export const deleteTodo = async (id: string) => {
  const editDoc = doc(FIRESTORE_DB, 'todos', id);
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
