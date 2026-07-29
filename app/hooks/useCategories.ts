/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useEffect, useMemo, useState } from 'react';
import {
  addCategories,
  fetchCategories,
} from '../service/firebaseService';
import { showError } from '../utils/showError';

const DEFAULT_CATEGORIES = ['Home', 'Shopping'];

export interface UseCategoriesOptions {
  /** Prepends "Select an option" for picker UIs (NoteList). */
  includeSelectOption?: boolean;
  /** Re-fetch when screen gains focus. */
  isFocused?: boolean;
}

export interface UseCategoriesResult {
  categories: string[];
  /** Categories without the "Select an option" placeholder. */
  quickAddCategories: string[];
  loading: boolean;
}

export function useCategories(
  userId: string | undefined,
  options: UseCategoriesOptions = {},
): UseCategoriesResult {
  const { includeSelectOption = false, isFocused = true } = options;
  const [rawCategories, setRawCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isFocused) {
      if (!userId) {
        setRawCategories([]);
        setLoading(false);
      }
      return;
    }

    let cancelled = false;

    const loadCategories = async () => {
      setLoading(true);
      try {
        const fetched = await fetchCategories(userId);
        if (cancelled) return;

        if (!fetched || fetched.length === 0) {
          await addCategories(userId, DEFAULT_CATEGORIES);
          if (!cancelled) {
            setRawCategories(DEFAULT_CATEGORIES);
          }
        } else {
          setRawCategories(fetched);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to load categories';
          showError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCategories().then();
    return () => {
      cancelled = true;
    };
  }, [userId, isFocused]);

  const categories = useMemo(() => {
    if (includeSelectOption) {
      return ['Select an option', ...rawCategories];
    }
    return rawCategories;
  }, [includeSelectOption, rawCategories]);

  const quickAddCategories = useMemo(() => {
    if (includeSelectOption) {
      return rawCategories;
    }
    return categories;
  }, [includeSelectOption, rawCategories, categories]);

  return useMemo(
    () => ({
      categories,
      quickAddCategories,
      loading,
    }),
    [categories, quickAddCategories, loading],
  );
}
