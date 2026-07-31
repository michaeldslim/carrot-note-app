/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useCallback, useMemo, useState } from 'react';
import { Note } from '../screens/types';

export type CompletionFilter = 'all' | 'active' | 'completed';
export type SortOption = 'newest' | 'oldest' | 'dueDate' | 'category';

export interface UseNoteFiltersResult {
  filteredNotes: Note[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  completionFilter: CompletionFilter;
  setCompletionFilter: (filter: CompletionFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  getCountByCategory: (category: string) => number;
  hasActiveFilters: boolean;
}

function compareDueDate(a: Note, b: Note): number {
  const aDate = a.startDate ?? a.endDate;
  const bDate = b.startDate ?? b.endDate;

  if (!aDate && !bDate) return 0;
  if (!aDate) return 1;
  if (!bDate) return -1;
  return aDate.localeCompare(bDate);
}

function sortNotes(notes: Note[], sortOption: SortOption): Note[] {
  const sorted = [...notes];

  switch (sortOption) {
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case 'dueDate':
      return sorted.sort(compareDueDate);
    case 'category':
      return sorted.sort((a, b) => {
        const aCategory = a.category ?? '';
        const bCategory = b.category ?? '';
        if (!aCategory && !bCategory) return 0;
        if (!aCategory) return 1;
        if (!bCategory) return -1;
        return aCategory.localeCompare(bCategory);
      });
    default:
      return sorted;
  }
}

export function useNoteFilters(notes: Note[]): UseNoteFiltersResult {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

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

    return sortNotes(result, sortOption);
  }, [notes, selectedCategory, completionFilter, searchQuery, sortOption]);

  const hasActiveFilters = useMemo(
    () =>
      selectedCategory !== 'All' ||
      completionFilter !== 'all' ||
      searchQuery.trim().length > 0 ||
      sortOption !== 'newest',
    [selectedCategory, completionFilter, searchQuery, sortOption],
  );

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
      sortOption,
      setSortOption,
      getCountByCategory,
      hasActiveFilters,
    }),
    [
      filteredNotes,
      selectedCategory,
      completionFilter,
      searchQuery,
      sortOption,
      getCountByCategory,
      hasActiveFilters,
    ],
  );
}
