/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Note } from '../../screens/types';
import { ui } from '../../theme/ui';
import { useTheme } from '../../theme/ThemeContext';
import { buildCalendarMarkedDates } from '../../utils/calendarMarks';
import { noteOccursOnDay, toDateString } from '../../utils/noteDates';
import { MIN_TOUCH_TARGET } from '../../utils/accessibility';

interface CalendarModalProps {
  visible: boolean;
  notes: Note[];
  onClose: () => void;
  onNotePress: (note: Note) => void;
  onAddEvent?: (day: string) => void;
  categoryColors?: Record<string, string>;
}

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  notes,
  onClose,
  onNotePress,
  onAddEvent,
  categoryColors = {},
}) => {
  const { colors, themeName } = useTheme();
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const todayStr = toDateString(new Date().toISOString());

  const markedDates = useMemo(
    () =>
      buildCalendarMarkedDates(notes, {
        selectedDay,
        todayStr,
        categoryColors,
        colors,
      }),
    [notes, selectedDay, categoryColors, colors, todayStr],
  );

  const notesOnSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    return notes.filter((note) => noteOccursOnDay(note, selectedDay));
  }, [notes, selectedDay]);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: ui.radius.lg,
      borderTopRightRadius: ui.radius.lg,
      maxHeight: '92%',
      paddingBottom: 32,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    closeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: colors.surfaceSoft,
      borderRadius: ui.radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    closeText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    dayListHeader: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    dayListTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    noteRow: {
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: ui.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    noteRowTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    noteRowMeta: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    emptyDay: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    emptyDayText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    addEventBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      minHeight: MIN_TOUCH_TARGET,
      justifyContent: 'center',
      borderRadius: ui.radius.pill,
      backgroundColor: colors.primary,
    },
    addEventBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.surface,
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
  }), [colors]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>📅 Calendar</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close calendar"
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            {selectedDay && selectedDay !== todayStr ? (
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
              onDayPress={(day: { dateString: string }) => setSelectedDay(day.dateString)}
              onDayLongPress={(day: { dateString: string }) => {
                setSelectedDay(day.dateString);
                onAddEvent?.(day.dateString);
              }}
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
            {selectedDay && (
              <ScrollView>
                <View style={styles.dayListHeader}>
                  <Text style={styles.dayListTitle}>Notes on {selectedDay}</Text>
                  {onAddEvent ? (
                    <TouchableOpacity
                      style={styles.addEventBtn}
                      onPress={() => onAddEvent(selectedDay)}
                      accessibilityRole="button"
                      accessibilityLabel="Add event for selected day"
                    >
                      <Text style={styles.addEventBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {notesOnSelectedDay.length === 0 ? (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>No notes for this day.</Text>
                    {onAddEvent ? (
                      <TouchableOpacity
                        style={[styles.addEventBtn, { alignSelf: 'flex-start', marginTop: 10 }]}
                        onPress={() => onAddEvent(selectedDay)}
                        accessibilityRole="button"
                        accessibilityLabel="Add event for selected day"
                      >
                        <Text style={styles.addEventBtnText}>Add event</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : (
                  notesOnSelectedDay.map((note) => (
                    <TouchableOpacity
                      key={note.id}
                      style={styles.noteRow}
                      onPress={() => { onClose(); onNotePress(note); }}
                    >
                      <Text style={styles.noteRowTitle}>
                        {note.title || note.note}
                      </Text>
                      {note.startDate && (
                        <Text style={styles.noteRowMeta}>
                          {note.startDate.slice(0, 10)}{note.endDate ? ` → ${note.endDate.slice(0, 10)}` : ''}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CalendarModal;
