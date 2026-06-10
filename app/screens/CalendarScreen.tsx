/*
 Copyright (C) 2025 Michael Lim - Carrot Note App
 This software is free to use, modify, and share under
 the terms of the GNU General Public License v3.
*/
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import {
  fetchNotes,
  deleteNote,
  fetchCategories,
  addCategories,
} from '../service/firebaseService';
import { cancelDeadlineReminder } from '../service/notificationService';
import { useTheme } from '../theme/ThemeContext';
import { ui } from '../theme/ui';
import { Note } from './types';
import { RootStackList } from '../navigation/RootNavigator';
import NoteItem from './NoteItem';
import SchedulerFAB from '../components/fab/SchedulerFAB';
import QuickAddModal from '../components/quickAdd/QuickAddModal';

type CalendarScreenProps = NativeStackScreenProps<RootStackList, 'Calendar'>;

const toDateString = (iso: string) => iso.slice(0, 10);
const todayStr = toDateString(new Date().toISOString());

const CalendarScreen = ({ navigation }: CalendarScreenProps) => {
  const { colors, themeName } = useTheme();
  const isFocused = useIsFocused();
  const auth = FIREBASE_AUTH;
  const userId = auth.currentUser?.uid;

  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [isLoading, setIsLoading] = useState(true);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const fetched = await fetchNotes(userId);
    setNotes(fetched);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (isFocused) loadNotes();
  }, [isFocused, loadNotes]);

  useEffect(() => {
    const loadCategories = async () => {
      if (!userId) return;
      try {
        const fetched = await fetchCategories(userId);
        if (!fetched || fetched.length === 0) {
          const initial = ['Home', 'Shopping'];
          await addCategories(userId, initial);
          setCategories(initial);
        } else {
          setCategories(fetched);
        }
      } catch {}
    };
    loadCategories();
  }, [userId, isFocused]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('List')}
            style={headerBtnStyle(colors)}
            accessibilityLabel="List view"
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={16}
              color={colors.primaryDark}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={headerBtnStyle(colors)}
            accessibilityLabel="Settings"
          >
            <Text style={{ color: colors.primaryDark, fontSize: 13, fontWeight: '700' }}>
              ⚙ Settings
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, colors]);

  // Build marked dates for the calendar
  const markedDates = useMemo(() => {
    const map: Record<string, any> = {};

    notes.forEach((note) => {
      const start = note.startDate
        ? toDateString(note.startDate)
        : toDateString(note.createdAt);
      const end = note.endDate ? toDateString(note.endDate) : start;

      let cursor = new Date(start + 'T00:00:00');
      const endDate = new Date(end + 'T00:00:00');
      while (cursor <= endDate) {
        const key = toDateString(cursor.toISOString());
        if (!map[key]) map[key] = { dots: [], marked: true };
        if (map[key].dots.length < 3) {
          map[key].dots.push({ color: colors.primary });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    // Highlight selected day
    map[selectedDay] = {
      ...(map[selectedDay] || {}),
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.surface,
    };

    // Highlight today
    if (!map[todayStr]) map[todayStr] = {};
    map[todayStr] = { ...(map[todayStr] || {}), today: true };

    return map;
  }, [notes, selectedDay, colors]);

  // Filter notes/events for the selected day
  const agendaNotes = useMemo(() => {
    return notes.filter((note) => {
      if (note.startDate) {
        const start = toDateString(note.startDate);
        const end = note.endDate ? toDateString(note.endDate) : start;
        return selectedDay >= start && selectedDay <= end;
      }
      return toDateString(note.createdAt) === selectedDay;
    });
  }, [notes, selectedDay]);

  const handleDelete = useCallback(
    async (noteId: string) => {
      if (!userId) return;
      await deleteNote(noteId);
      await cancelDeadlineReminder(noteId);
      const fetched = await fetchNotes(userId);
      setNotes(fetched);
    },
    [userId],
  );

  const formattedDay = useMemo(() => {
    const d = new Date(selectedDay + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDay]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        calendarWrapper: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        agendaHeader: {
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 6,
        },
        agendaTitle: {
          fontSize: 15,
          fontWeight: '700',
          color: colors.textPrimary,
        },
        agendaSubtitle: {
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 2,
        },
        listContent: {
          paddingHorizontal: 14,
          paddingBottom: 110,
        },
        emptyContainer: {
          alignItems: 'center',
          paddingTop: 40,
          paddingHorizontal: 24,
        },
        emptyIcon: {
          marginBottom: 10,
        },
        emptyText: {
          fontSize: 14,
          color: colors.textMuted,
          textAlign: 'center',
          lineHeight: 20,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        divider: {
          height: 1,
          backgroundColor: colors.border,
          marginHorizontal: 16,
          marginBottom: 4,
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen calendar at the top */}
      <View style={styles.calendarWrapper}>
        <Calendar
          key={themeName}
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={(day) => setSelectedDay(day.dateString)}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#F4A0AA',
            todayTextColor: colors.primaryDark,
            dayTextColor: colors.textPrimary,
            textDisabledColor: colors.textMuted,
            dotColor: colors.primary,
            selectedDotColor: '#F4A0AA',
            arrowColor: colors.primary,
            monthTextColor: colors.textPrimary,
            indicatorColor: colors.primary,
          }}
        />
      </View>

      {/* Agenda panel for selected day */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={agendaNotes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.agendaHeader}>
                <Text style={styles.agendaTitle}>{formattedDay}</Text>
                <Text style={styles.agendaSubtitle}>
                  {agendaNotes.length === 0
                    ? 'No events — tap + to add one'
                    : `${agendaNotes.length} event${agendaNotes.length === 1 ? '' : 's'}`}
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          }
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onPress={() => navigation.navigate('Detail', { noteItem: item })}
              confirmDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={48}
                color={colors.textMuted}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>
                Nothing scheduled here yet.{'\n'}Tap + to add your first event.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB — opens quick-add modal */}
      <SchedulerFAB onPress={() => setQuickAddVisible(true)} />

      <QuickAddModal
        visible={quickAddVisible}
        selectedDay={selectedDay}
        categories={categories}
        userId={userId}
        onClose={() => setQuickAddVisible(false)}
        onSaved={() => {
          setQuickAddVisible(false);
          loadNotes();
        }}
        onMoreDetails={(note) => {
          setQuickAddVisible(false);
          navigation.navigate('Detail', { noteItem: note });
        }}
      />
    </SafeAreaView>
  );
};

const headerBtnStyle = (colors: any) => ({
  paddingHorizontal: 10,
  paddingVertical: 7,
  backgroundColor: colors.surfaceSoft,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 99,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
});

export default CalendarScreen;
