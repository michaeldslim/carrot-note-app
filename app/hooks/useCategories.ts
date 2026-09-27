/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { useEffect, useMemo, useState } from 'react';
import {
  addCategories,
  fetchCategoryRecords,
} from '../service/firebaseService';
import {
  getCachedCategoryRecords,
  saveCachedCategoryRecords,
} from '../service/localCategoryCache';
import { CategoryRecord } from '../types/category';
import { getCategoryColorForIndex } from '../utils/categoryColors';
import { showError } from '../utils/showError';
import { isOfflineError } from '../utils/networkErrors';

const DEFAULT_CATEGORIES = ['Home', 'Shopping'];

function buildDefaultCategoryRecords(): CategoryRecord[] {
  return DEFAULT_CATEGORIES.map((name, index) => ({
    name,
    color: getCategoryColorForIndex(index),
  }));
}

export interface UseCategoriesOptions {
  /** Prepends "Select an option" for picker UIs (NoteList). */
  includeSelectOption?: boolean;
  /** Re-fetch when screen gains focus. */
  isFocused?: boolean;
}

export interface UseCategoriesResult {
  categories: string[];
  categoryRecords: CategoryRecord[];
  /** Category name → color hex. */
  categoryColors: Record<string, string>;
  /** Categories without the "Select an option" placeholder. */
  quickAddCategories: string[];
  loading: boolean;
}

export function useCategories(
  userId: string | undefined,
  options: UseCategoriesOptions = {},
): UseCategoriesResult {
  const { includeSelectOption = false, isFocused = true } = options;
  const [categoryRecords, setCategoryRecords] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isFocused) {
      if (!userId) {
        setCategoryRecords([]);
        setLoading(false);
      }
      return;
    }

    let cancelled = false;

    const applyRecords = async (records: CategoryRecord[]) => {
      if (cancelled || records.length === 0) return;
      setCategoryRecords(records);
      await saveCachedCategoryRecords(userId, records);
    };

    const loadCategories = async () => {
      setLoading(true);

      const cached = await getCachedCategoryRecords(userId);
      if (!cancelled && cached.length > 0) {
        setCategoryRecords(cached);
        setLoading(false);
      }

      try {
        let fetched = await fetchCategoryRecords(userId, { silent: true });
        if (cancelled) return;

        if (fetched.length === 0) {
          await addCategories(userId, DEFAULT_CATEGORIES);
          if (!cancelled) {
            fetched = await fetchCategoryRecords(userId, { silent: true });
          }
        }

        if (fetched.length > 0) {
          await applyRecords(fetched);
        } else if (cached.length === 0) {
          await applyRecords(buildDefaultCategoryRecords());
        }
      } catch (error) {
        if (cancelled) return;

        if (cached.length === 0) {
          await applyRecords(buildDefaultCategoryRecords());
        }

        if (!isOfflineError(error)) {
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
    const names = categoryRecords.map((record) => record.name);
    if (includeSelectOption) {
      return ['Select an option', ...names];
    }
    return names;
  }, [includeSelectOption, categoryRecords]);

  const categoryColors = useMemo(
    () =>
      Object.fromEntries(
        categoryRecords.map((record) => [record.name, record.color]),
      ),
    [categoryRecords],
  );

  const quickAddCategories = useMemo(() => {
    if (includeSelectOption) {
      return categoryRecords.map((record) => record.name);
    }
    return categories;
  }, [includeSelectOption, categoryRecords, categories]);

  return useMemo(
    () => ({
      categories,
      categoryRecords,
      categoryColors,
      quickAddCategories,
      loading,
    }),
    [categories, categoryRecords, categoryColors, quickAddCategories, loading],
  );
}
