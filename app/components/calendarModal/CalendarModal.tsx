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

interface CalendarModalProps {
  visible: boolean;
  notes: Note[];
  onClose: () => void;
  onNotePress: (note: Note) => void;
}

const toDateString = (iso: string) => iso.slice(0, 10);

const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  notes,
  onClose,
  onNotePress,
}) => {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

  const markedDates = useMemo(() => {
    const map: Record<string, any> = {};
    const today = toDateString(new Date().toISOString());

    notes.forEach((note) => {
      if (!note.startDate) return;
      const start = toDateString(note.startDate);
      const end = note.endDate ? toDateString(note.endDate) : start;

      // Mark each day in the range
      let cursor = new Date(start);
      const endDate = new Date(end);
      while (cursor <= endDate) {
        const key = toDateString(cursor.toISOString());
        if (!map[key]) {
          map[key] = { dots: [], marked: true };
        }
        if (map[key].dots.length < 3) {
          map[key].dots.push({ color: colors.primary });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    // Also mark notes that have no date range but were created on a day
    notes.forEach((note) => {
      if (note.startDate) return;
      const key = toDateString(note.createdAt);
      if (!map[key]) {
        map[key] = { dots: [], marked: true };
      }
      if (map[key].dots.length < 3) {
        map[key].dots.push({ color: colors.textMuted });
      }
    });

    if (selectedDay) {
      map[selectedDay] = {
        ...(map[selectedDay] || {}),
        selected: true,
        selectedColor: colors.primary,
      };
    }

    // Highlight today
    if (!map[today]) map[today] = {};
    map[today] = {
      ...(map[today] || {}),
      today: true,
    };

    return map;
  }, [notes, selectedDay, colors]);

  const notesOnSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    return notes.filter((note) => {
      if (note.startDate) {
        const start = toDateString(note.startDate);
        const end = note.endDate ? toDateString(note.endDate) : start;
        return selectedDay >= start && selectedDay <= end;
      }
      return toDateString(note.createdAt) === selectedDay;
    });
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
  }), [colors]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>📅 Calendar</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedDay(day.dateString)}
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
                </View>
                {notesOnSelectedDay.length === 0 ? (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>No notes for this day.</Text>
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
