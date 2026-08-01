/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { requestNotificationPermission } from '../service/notificationService';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { useIsFocused } from '@react-navigation/native';
import NoteItem from './NoteItem';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import CalendarModal from '../components/calendarModal/CalendarModal';
import SchedulerFAB from '../components/fab/SchedulerFAB';
import QuickAddModal from '../components/quickAdd/QuickAddModal';
import { useNotesContext } from '../context/NotesContext';
import { useCategories } from '../hooks/useCategories';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  useNoteFilters,
  type CompletionFilter,
  type SortOption,
} from '../hooks/useNoteFilters';
import {
  CategoryChipRow,
  EmptyState,
  LoadingState,
  NoteSearchBar,
  ScreenHeaderActions,
  SegmentedControl,
  SortPickerSheet,
  type SortPickerOption,
} from '../components/ui';

type NoteListProps = NativeStackScreenProps<RootStackList, 'List'>;

const toDateString = (iso: string) => iso.slice(0, 10);
const todayStr = toDateString(new Date().toISOString());

const STATUS_OPTIONS: { key: CompletionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
];

const SORT_OPTIONS: SortPickerOption[] = [
  { key: 'newest', label: 'Newest first', description: 'Recently created' },
  { key: 'oldest', label: 'Oldest first', description: 'Earliest created' },
  { key: 'dueDate', label: 'Due date', description: 'Soonest scheduled first' },
  { key: 'category', label: 'Category', description: 'Alphabetical by category' },
];

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  dueDate: 'Due',
  category: 'Category',
};

const NoteList = ({ navigation }: NoteListProps) => {
  const isFocused = useIsFocused();
  const {
    notes,
    loading: isLoading,
    refreshing,
    refresh,
    deleteNoteOptimistic,
    toggleNoteOptimistic,
  } = useNotesContext();
  const { categories, categoryColors, quickAddCategories } = useCategories(
    FIREBASE_AUTH.currentUser?.uid,
    { includeSelectOption: true, isFocused },
  );
  const {
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
  } = useNoteFilters(notes);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const hasRequestedNotificationPermissionRef = useRef<boolean>(false);

  useEffect(() => {
    const ensureNotificationPermission = async () => {
      if (!userId || hasRequestedNotificationPermissionRef.current) return;
      hasRequestedNotificationPermissionRef.current = true;
      await requestNotificationPermission();
    };

    ensureNotificationPermission().then();
  }, [userId]);

  const confirmDelete = useCallback(
    async (noteId: string) => {
      if (!noteId) return;
      await deleteNoteOptimistic(noteId);
    },
    [deleteNoteOptimistic],
  );

  const handleToggleComplete = useCallback(
    async (noteId: string, completed: boolean) => {
      await toggleNoteOptimistic(noteId, completed);
    },
    [toggleNoteOptimistic],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setCompletionFilter('all');
    setSortOption('newest');
    setSelectedCategory('All');
  }, [setSearchQuery, setCompletionFilter, setSortOption, setSelectedCategory]);

  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();

  const styles = useMemo(() => {
    return StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: colors.background,
      },
      container: {
        flex: 1,
        marginHorizontal: 14,
      },
      listContainer: {
        flex: 1,
        marginTop: 4,
      },
      stickyFilterContainer: {
        paddingBottom: 4,
        backgroundColor: colors.background,
      },
      toolbarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: ui.spacing.xs,
        gap: 8,
      },
      statusControl: {
        flex: 1,
      },
      sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: ui.radius.pill,
        paddingVertical: 9,
        paddingHorizontal: 12,
        minHeight: 44,
        gap: 4,
      },
      sortButtonActive: {
        borderColor: colors.primary,
        backgroundColor: colors.surfaceSoft,
      },
      sortButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primaryDark,
      },
      categoryRow: {
        marginTop: ui.spacing.xs,
      },
      resultsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
        minHeight: 20,
      },
      resultsText: {
        ...ui.typography.body,
        fontSize: 13,
        color: colors.textMuted,
      },
      clearButton: {
        paddingVertical: 2,
        paddingHorizontal: 4,
      },
      clearButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primaryDark,
      },
      flatList: {
        flex: 1,
      },
      listContentContainer: {
        paddingHorizontal: 2,
        paddingVertical: 5,
        paddingBottom: 96,
      },
      listFooter: {
        height: 20,
      },
      listHeader: {
        height: 1,
      },
    });
  }, [colors]);

  const openQuickAdd = useCallback(() => setQuickAddVisible(true), []);

  const categoryChips = useMemo(
    () =>
      ['All', ...categories.slice(1)].map((category) => ({
        key: category,
        label: category,
        count: getCountByCategory(category),
        dotColor:
          category !== 'All' ? categoryColors[category] : undefined,
      })),
    [categories, getCountByCategory, categoryColors],
  );

  const headerActions = useMemo(
    () => [
      {
        key: 'add',
        onPress: openQuickAdd,
        accessibilityLabel: 'Add event',
        icon: 'plus' as const,
      },
      {
        key: 'calendar',
        onPress: () => setCalendarVisible(true),
        accessibilityLabel: 'Calendar',
        icon: 'calendar-month' as const,
      },
      {
        key: 'settings',
        onPress: () => navigation.navigate('Settings'),
        accessibilityLabel: 'Settings',
        label: '⚙ Settings',
      },
    ],
    [navigation, openQuickAdd],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ScreenHeaderActions actions={headerActions} />,
    });
  }, [navigation, headerActions]);

  const emptySubtitle = hasActiveFilters
    ? 'Try adjusting your search or filters.'
    : 'Tap + to add your first event.';

  const sortIsCustom = sortOption !== 'newest';
  const resultLabel =
    filteredNotes.length === 1
      ? '1 note'
      : `${filteredNotes.length} notes`;

  const listEntering = reduceMotion
    ? undefined
    : FadeInDown.duration(220).springify().damping(18);

  return (
    <SafeAreaView style={styles.safeArea}>
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.stickyFilterContainer}>
            <NoteSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginTop: 2 }}
            />
            <View style={styles.toolbarRow}>
              <SegmentedControl
                options={STATUS_OPTIONS}
                value={completionFilter}
                onChange={setCompletionFilter}
                style={styles.statusControl}
              />
              <TouchableOpacity
                style={[styles.sortButton, sortIsCustom && styles.sortButtonActive]}
                onPress={() => setSortSheetVisible(true)}
                accessibilityRole="button"
                accessibilityLabel={`Sort by ${SORT_LABELS[sortOption]}`}
              >
                <MaterialCommunityIcons
                  name="sort-variant"
                  size={16}
                  color={colors.primaryDark}
                />
                <Text style={styles.sortButtonText}>
                  {SORT_LABELS[sortOption]}
                </Text>
              </TouchableOpacity>
            </View>
            <CategoryChipRow
              chips={categoryChips}
              selectedKey={selectedCategory}
              onSelect={setSelectedCategory}
              style={styles.categoryRow}
            />
            <View style={styles.resultsRow}>
              <Text style={styles.resultsText}>{resultLabel}</Text>
              {hasActiveFilters ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={clearFilters}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all filters"
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={refresh} />
              }
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={
                    listEntering
                      ? listEntering.delay(Math.min(index, 8) * 25)
                      : undefined
                  }
                >
                  <NoteItem
                    note={item}
                    onPress={() =>
                      navigation.navigate('Detail', { noteId: item.id })
                    }
                    confirmDelete={confirmDelete}
                    onToggleComplete={handleToggleComplete}
                    categoryColor={
                      item.category ? categoryColors[item.category] : undefined
                    }
                  />
                </Animated.View>
              )}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                isLoading ? (
                  <LoadingState fill={false} />
                ) : (
                  <EmptyState
                    title={hasActiveFilters ? 'No matching notes' : 'No notes yet'}
                    subtitle={emptySubtitle}
                    action={
                      hasActiveFilters
                        ? {
                            label: 'Clear filters',
                            onPress: clearFilters,
                            accessibilityLabel: 'Clear filters',
                          }
                        : {
                            label: 'Add event',
                            onPress: openQuickAdd,
                            accessibilityLabel: 'Add event',
                          }
                    }
                  />
                )
              }
              ListFooterComponent={<View style={styles.listFooter} />}
              ListHeaderComponent={<View style={styles.listHeader} />}
              style={styles.flatList}
            />
          </View>
        </GestureHandlerRootView>
      <SchedulerFAB onPress={openQuickAdd} />
      <SortPickerSheet
        visible={sortSheetVisible}
        selected={sortOption}
        options={SORT_OPTIONS}
        onSelect={setSortOption}
        onClose={() => setSortSheetVisible(false)}
      />
      <QuickAddModal
        visible={quickAddVisible}
        selectedDay={todayStr}
        categories={quickAddCategories}
        userId={userId}
        onClose={() => setQuickAddVisible(false)}
        onSaved={() => {
          setQuickAddVisible(false);
        }}
        onMoreDetails={(noteId) => {
          setQuickAddVisible(false);
          navigation.navigate('Detail', { noteId, isJustCreated: true });
        }}
      />
      <CalendarModal
        visible={calendarVisible}
        notes={notes}
        categoryColors={categoryColors}
        onClose={() => setCalendarVisible(false)}
        onNotePress={(note) => navigation.navigate('Detail', { noteId: note.id })}
      />
    </SafeAreaView>
  );
};

export default NoteList;
