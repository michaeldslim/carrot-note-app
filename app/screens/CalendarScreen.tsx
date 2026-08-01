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
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { useTheme } from '../theme/ThemeContext';
import { RootStackList } from '../navigation/RootNavigator';
import NoteItem from './NoteItem';
import SchedulerFAB from '../components/fab/SchedulerFAB';
import QuickAddModal from '../components/quickAdd/QuickAddModal';
import { useNotesContext } from '../context/NotesContext';
import { useCategories } from '../hooks/useCategories';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { buildCalendarMarkedDates } from '../utils/calendarMarks';
import { toDateString } from '../utils/noteDates';
import { MIN_TOUCH_TARGET } from '../utils/accessibility';
import {
  EmptyState,
  LoadingState,
  ScreenHeaderActions,
} from '../components/ui';

type CalendarScreenProps = NativeStackScreenProps<RootStackList, 'Calendar'>;

const todayStr = toDateString(new Date().toISOString());

const CalendarScreen = ({ navigation }: CalendarScreenProps) => {
  const { colors, themeName } = useTheme();
  const isFocused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const userId = FIREBASE_AUTH.currentUser?.uid;
  const { notes, loading: isLoading, deleteNoteOptimistic } = useNotesContext();
  const { quickAddCategories, categoryColors } = useCategories(userId, {
    isFocused,
  });

  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  const headerActions = useMemo(
    () => [
      {
        key: 'list',
        onPress: () => navigation.navigate('List'),
        accessibilityLabel: 'List view',
        icon: 'format-list-bulleted' as const,
      },
      {
        key: 'settings',
        onPress: () => navigation.navigate('Settings'),
        accessibilityLabel: 'Settings',
        label: '⚙ Settings',
      },
    ],
    [navigation],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <ScreenHeaderActions actions={headerActions} />,
    });
  }, [navigation, headerActions]);

  const markedDates = useMemo(
    () =>
      buildCalendarMarkedDates(notes, {
        selectedDay,
        todayStr,
        categoryColors,
        colors,
      }),
    [notes, selectedDay, categoryColors, colors],
  );

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
      await deleteNoteOptimistic(noteId);
    },
    [deleteNoteOptimistic],
  );

  const formattedDay = useMemo(() => {
    const d = new Date(selectedDay + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDay]);

  const isTodaySelected = selectedDay === todayStr;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        calendarWrapper: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        todayRow: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: 16,
          paddingBottom: 6,
        },
        todayButton: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          minHeight: MIN_TOUCH_TARGET,
          justifyContent: 'center',
          borderRadius: 999,
          backgroundColor: colors.surfaceSoft,
          borderWidth: 1,
          borderColor: colors.primary,
        },
        todayButtonText: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.primaryDark,
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
        divider: {
          height: 1,
          backgroundColor: colors.border,
          marginHorizontal: 16,
          marginBottom: 4,
        },
      }),
    [colors],
  );

  const listEntering = reduceMotion
    ? undefined
    : FadeInDown.duration(220).springify().damping(18);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.calendarWrapper}>
        {!isTodaySelected ? (
          <View style={styles.todayRow}>
            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => setSelectedDay(todayStr)}
              accessibilityRole="button"
              accessibilityLabel="Jump to today"
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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

      {isLoading ? (
        <LoadingState />
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
                confirmDelete={handleDelete}
                categoryColor={
                  item.category ? categoryColors[item.category] : undefined
                }
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              variant="plain"
              icon="calendar-blank-outline"
              subtitle={
                'Nothing scheduled here yet.\nTap + to add your first event.'
              }
            />
          }
        />
      )}

      <SchedulerFAB onPress={() => setQuickAddVisible(true)} />

      <QuickAddModal
        visible={quickAddVisible}
        selectedDay={selectedDay}
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
    </SafeAreaView>
  );
};

export default CalendarScreen;
