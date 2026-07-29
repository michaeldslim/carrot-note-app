/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useCallback, useMemo, useState } from 'react';
import { Note } from '../screens/types';

export type CompletionFilter = 'all' | 'active' | 'completed';

export interface UseNoteFiltersResult {
  filteredNotes: Note[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  completionFilter: CompletionFilter;
  setCompletionFilter: (filter: CompletionFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getCountByCategory: (category: string) => number;
}

export function useNoteFilters(notes: Note[]): UseNoteFiltersResult {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (selectedCategory !== 'All') {
      result = result.filter((note) => note.category === selectedCategory);
    }

    if (completionFilter === 'active') {
      result = result.filter((note) => !note.completed);
    } else if (completionFilter === 'completed') {
      result = result.filter((note) => note.completed);
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((note) => {
        const titleMatch = note.title?.toLowerCase().includes(normalizedQuery);
        const bodyMatch = note.note.toLowerCase().includes(normalizedQuery);
        return Boolean(titleMatch || bodyMatch);
      });
    }

    return result;
  }, [notes, selectedCategory, completionFilter, searchQuery]);

  const getCountByCategory = useCallback(
    (category: string) => {
      if (category === 'All') {
        return notes.length;
      }
      return notes.filter((note) => note.category === category).length;
    },
    [notes],
  );

  return useMemo(
    () => ({
      filteredNotes,
      selectedCategory,
      setSelectedCategory,
      completionFilter,
      setCompletionFilter,
      searchQuery,
      setSearchQuery,
      getCountByCategory,
    }),
    [
      filteredNotes,
      selectedCategory,
      completionFilter,
      searchQuery,
      getCountByCategory,
    ],
  );
}
