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
} from 'react-native';
import React, { useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useNoteFilters } from '../hooks/useNoteFilters';
import {
  CategoryChipRow,
  EmptyState,
  LoadingState,
  ScreenHeaderActions,
} from '../components/ui';

type NoteListProps = NativeStackScreenProps<RootStackList, 'List'>;

const toDateString = (iso: string) => iso.slice(0, 10);
const todayStr = toDateString(new Date().toISOString());

const NoteList = ({ navigation }: NoteListProps) => {
  const isFocused = useIsFocused();
  const {
    notes,
    loading: isLoading,
    refreshing,
    refresh,
    deleteNoteOptimistic,
  } = useNotesContext();
  const { categories, quickAddCategories } = useCategories(
    FIREBASE_AUTH.currentUser?.uid,
    { includeSelectOption: true, isFocused },
  );
  const {
    filteredNotes,
    selectedCategory,
    setSelectedCategory,
    getCountByCategory,
  } = useNoteFilters(notes);
  const [calendarVisible, setCalendarVisible] = React.useState(false);
  const [quickAddVisible, setQuickAddVisible] = React.useState(false);
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

  const { colors } = useTheme();

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
      helperText: {
        ...ui.typography.body,
        color: colors.textMuted,
        marginTop: 2,
        marginBottom: ui.spacing.xs,
      },
    });
  }, [colors]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ScreenHeaderActions actions={headerActions} />,
    });
  }, [navigation, headerActions]);

  const openQuickAdd = useCallback(() => setQuickAddVisible(true), []);

  const categoryChips = useMemo(
    () =>
      ['All', ...categories.slice(1)].map((category) => ({
        key: category,
        label: category,
        count: getCountByCategory(category),
      })),
    [categories, getCountByCategory],
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

  return (
    <SafeAreaView style={styles.safeArea}>
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.stickyFilterContainer}>
            <Text style={styles.helperText}>
              Tip: swipe left on completed notes to delete quickly.
            </Text>
            <CategoryChipRow
              chips={categoryChips}
              selectedKey={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </View>
          <View style={styles.listContainer}>
            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={refresh} />
              }
              renderItem={({ item }) => (
                <NoteItem
                  note={item}
                  onPress={() =>
                    navigation.navigate('Detail', { noteId: item.id })
                  }
                  confirmDelete={confirmDelete}
                />
              )}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                isLoading ? (
                  <LoadingState fill={false} />
                ) : (
                  <EmptyState
                    title="No notes yet"
                    subtitle="Tap + to add your first event."
                    action={{
                      label: 'Add event',
                      onPress: openQuickAdd,
                      accessibilityLabel: 'Add event',
                    }}
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
        onClose={() => setCalendarVisible(false)}
        onNotePress={(note) => navigation.navigate('Detail', { noteId: note.id })}
      />
    </SafeAreaView>
  );
};

export default NoteList;
