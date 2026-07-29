/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { useNotes, type UseNotesResult } from '../hooks/useNotes';

const NotesContext = createContext<UseNotesResult | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | undefined>(
    FIREBASE_AUTH.currentUser?.uid,
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUserId(user?.uid);
    });
    return unsubscribe;
  }, []);

  const notesState = useNotes(userId);

  return (
    <NotesContext.Provider value={notesState}>{children}</NotesContext.Provider>
  );
}

export function useNotesContext(): UseNotesResult {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within a NotesProvider');
  }
  return context;
}
