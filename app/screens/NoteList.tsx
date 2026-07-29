/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  TextStyle,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useNoteFilters } from '../hooks/useNoteFilters';

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
      buttonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
      } as TextStyle,
      filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 4,
      },
      filterButton: {
        borderRadius: ui.radius.pill,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginRight: 6,
      },
      filterButtonSelected: {
        backgroundColor: colors.surfaceSoft,
        borderColor: colors.primary,
      },
      filterButtonTextSelected: {
        color: colors.primaryDark,
      },
      categoryContainer: {
        flexDirection: 'row',
      },
      helperText: {
        ...ui.typography.body,
        color: colors.textMuted,
        marginTop: 2,
        marginBottom: ui.spacing.xs,
      },
      emptyState: {
        backgroundColor: colors.surface,
        borderRadius: ui.radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: ui.spacing.xl,
        alignItems: 'center',
        marginTop: 10,
      },
      emptyStateTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
      },
      emptyStateText: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 14,
      },
      emptyStateButton: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: ui.radius.pill,
        backgroundColor: colors.primary,
      },
      emptyStateButtonText: {
        color: colors.surface,
        fontSize: 14,
        fontWeight: '700',
      },
    });
  }, [colors]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setQuickAddVisible(true)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 7,
              backgroundColor: colors.surfaceSoft,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 99,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessibilityLabel="Add event"
          >
            <MaterialCommunityIcons name="plus" size={18} color={colors.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 7,
              backgroundColor: colors.surfaceSoft,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 99,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons name="calendar-month" size={16} color={colors.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              backgroundColor: colors.surfaceSoft,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 99,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.primaryDark, fontSize: 13, fontWeight: '700' }}>⚙ Settings</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, colors]);

  const openQuickAdd = useCallback(() => setQuickAddVisible(true), []);

  return (
    <SafeAreaView style={styles.safeArea}>
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.stickyFilterContainer}>
            <Text style={styles.helperText}>
              Tip: swipe left on completed notes to delete quickly.
            </Text>
            <View style={styles.filterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {['All', ...categories.slice(1)].map((category, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.filterButton,
                      selectedCategory === category &&
                        styles.filterButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        selectedCategory === category &&
                          styles.filterButtonTextSelected,
                      ]}
                    >
                      {category} ({getCountByCategory(category)})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
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
                  <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateTitle}>No notes yet</Text>
                    <Text style={styles.emptyStateText}>
                      Tap + to add your first event.
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyStateButton}
                      onPress={openQuickAdd}
                      accessibilityLabel="Add event"
                    >
                      <Text style={styles.emptyStateButtonText}>Add event</Text>
                    </TouchableOpacity>
                  </View>
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
