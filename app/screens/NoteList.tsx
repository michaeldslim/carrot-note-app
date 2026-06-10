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
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fetchNotes,
  deleteNote,
  fetchCategories,
  addCategories,
} from '../service/firebaseService';
import {
  cancelDeadlineReminder,
  requestNotificationPermission,
} from '../service/notificationService';
import { Note } from './types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackList } from '../navigation/RootNavigator';
import { useIsFocused } from '@react-navigation/native';
import NoteItem from './NoteItem';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import CalendarModal from '../components/calendarModal/CalendarModal';

type NoteListProps = NativeStackScreenProps<RootStackList, 'List'>;

const NoteList = ({ navigation }: NoteListProps) => {
  const isFocused = useIsFocused();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>(['Select an option']);
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = FIREBASE_AUTH;
  const userId = auth.currentUser?.uid;
  const hasRequestedNotificationPermissionRef = useRef<boolean>(false);

  const filterNotes = useCallback(() => {
    if (selectedCategory === 'All') {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(
        notes.filter((note) => note.category === selectedCategory),
      );
    }
  }, [notes, selectedCategory]);

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      if (userId) {
        const fetchedNotes = await fetchNotes(userId);
        setNotes(fetchedNotes);
      }
      setIsLoading(false);
    };
    loadNotes().then();
  }, [userId, isFocused]);

  useEffect(() => {
    const loadCategories = async () => {
      if (userId) {
        try {
          const fetchedCategories = await fetchCategories(userId);
          if (!fetchedCategories || fetchedCategories.length === 0) {
            const initialCategories = ['Home', 'Shopping'];
            await addCategories(userId, initialCategories);
            setCategories(['Select an option', ...initialCategories]);
          } else {
            setCategories(['Select an option', ...fetchedCategories]);
          }
        } catch (error) {
          if (error instanceof Error) {
            Alert.alert('Error', `Failed to load categories: ${error.message}`);
          } else {
            Alert.alert('Error', 'An unknown error occurred');
          }
        }
      }
    };
    loadCategories().then();
  }, [userId, isFocused]);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedCategory, filterNotes]);

  useEffect(() => {
    const ensureNotificationPermission = async () => {
      if (!userId || hasRequestedNotificationPermissionRef.current) return;
      hasRequestedNotificationPermissionRef.current = true;
      await requestNotificationPermission();
    };

    ensureNotificationPermission().then();
  }, [userId]);

  const getTotalNotesByCategory = (category: string) => {
    if (category === 'All') {
      return notes.length;
    }
    return notes.filter((note) => note.category === category).length;
  };

  const confirmDelete = async (noteId: string) => {
    if (!noteId) return;
    if (userId) {
      await deleteNote(noteId);
      await cancelDeadlineReminder(noteId);
      const fetchedNotes = await fetchNotes(userId);
      setNotes(fetchedNotes);
    }
  };

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const fetchedNotes = await fetchNotes(userId);
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

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
        paddingBottom: 20,
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
      },
    });
  }, [colors]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
  }, [navigation, colors, setCalendarVisible]);

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
                      {category} ({getTotalNotesByCategory(category)})
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
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => (
                <NoteItem
                  note={item}
                  onPress={() =>
                    navigation.navigate('Detail', { noteItem: item })
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
                      No notes yet. Add events from the calendar screen.
                    </Text>
                  </View>
                )
              }
              ListFooterComponent={<View style={styles.listFooter} />}
              ListHeaderComponent={<View style={styles.listHeader} />}
              style={styles.flatList}
            />
          </View>
        </GestureHandlerRootView>
      <CalendarModal
        visible={calendarVisible}
        notes={notes}
        onClose={() => setCalendarVisible(false)}
        onNotePress={(note) => navigation.navigate('Detail', { noteItem: note })}
      />
    </SafeAreaView>
  );
};

export default NoteList;
