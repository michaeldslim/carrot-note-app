/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Note } from './types';
import { IconButton, Checkbox } from 'react-native-paper';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { getShadow, ui } from '../theme/ui';
import { useTheme } from '../theme/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { announceForAccessibility } from '../utils/accessibility';
import { formatDateRangeLabel, formatRelativeDue, formatRecurrenceLabel } from '../utils/noteDates';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = -65;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const parseLocalDate = (value: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

interface NoteItemProps {
  note: Note;
  onPress: () => void;
  confirmDelete: (noteId: string) => void;
  onToggleComplete?: (noteId: string, completed: boolean) => void;
  categoryColor?: string;
}

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  onPress,
  confirmDelete,
  onToggleComplete,
  categoryColor,
}) => {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue<number | 'auto'>('auto');
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
    rowContainer: {
      width: '100%',
      marginBottom: 6,
      marginTop: 2,
    },
    container: {
      flex: 1,
      width: '100%',
      position: 'relative',
    },
    swipeableContent: {
      flex: 1,
      width: '100%',
    },
    innerContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: ui.radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 14,
      minHeight: 65,
      ...getShadow(colors.shadowColor),
    },
    checkbox: {
      marginRight: 2,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
    },
    categoryDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
      flexShrink: 0,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
    },
    noteText: {
      flex: 1,
      fontSize: 16,
      textAlignVertical: 'center',
      paddingVertical: 2,
      color: colors.textPrimary,
    },
    completed: {
      textDecorationLine: 'line-through',
      color: colors.textMuted,
      fontWeight: '400',
    },
    notCompleted: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    deleteContainer: {
      width: Math.abs(SWIPE_THRESHOLD),
      position: 'absolute',
      right: 0,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    deleteButton: {
      marginTop: 5,
      width: Math.abs(SWIPE_THRESHOLD),
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    oldNote: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceSoft,
    },
    expiredNote: {
      borderColor: colors.danger,
      backgroundColor: colors.surfaceSoft,
    },
    dateLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    expiredLabel: {
      fontSize: 11,
      color: colors.danger,
      fontWeight: '700',
      marginTop: 2,
    },
  }), [colors]);

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onChange((event) => {
      if (!note.completed) {
        translateX.value = 0;
        return;
      }

      if (event.translationX <= 0) {
        translateX.value = Math.max(event.translationX, SWIPE_THRESHOLD);
      } else if (!isSwipeOpen) {
        translateX.value = 0;
      }
    })
    .onEnd(() => {
      if (!note.completed) {
        translateX.value = 0;
        return;
      }

      if (translateX.value < SWIPE_THRESHOLD / 2) {
        translateX.value = withSpring(SWIPE_THRESHOLD);
        runOnJS(setIsSwipeOpen)(true);
      } else {
        translateX.value = withSpring(0);
        runOnJS(setIsSwipeOpen)(false);
      }
    });

  const handleDelete = () => {
    hapticMedium().then();
    announceForAccessibility('Note deleted');
    translateX.value = withSpring(-SCREEN_WIDTH);
    itemHeight.value = withSpring(0);
    setIsSwipeOpen(false);
    confirmDelete(note.id);
  };

  const handleToggleComplete = () => {
    if (!onToggleComplete) return;
    hapticLight().then();
    const nextCompleted = !note.completed;
    announceForAccessibility(
      nextCompleted ? 'Note marked complete' : 'Note marked incomplete',
    );
    onToggleComplete(note.id, nextCompleted);
  };

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
    ],
  }));

  const rIconContainerStyle = useAnimatedStyle(() => {
    const isFullyOpen = translateX.value <= SWIPE_THRESHOLD;
    return {
      opacity: isFullyOpen ? 1 : 0,
      transform: [{ translateX: isFullyOpen ? 0 : 100 }],
      pointerEvents: isFullyOpen ? 'auto' : 'none',
      backgroundColor: colors.background,
    };
  });

  const rTaskContainerStyle = useAnimatedStyle(() => {
    return {
      height: itemHeight.value,
    };
  });

  const isExpired = (): boolean => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (note.endDate) {
        const end = parseLocalDate(note.endDate);
        end.setHours(0, 0, 0, 0);
        return today > end;
      }
      const createdDate = new Date(note.createdAt);
      const daysDifference = (today.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      return daysDifference > 3;
    } catch {
      return false;
    }
  };

  const expired = isExpired();

  const displayTitle =
    note.title && note.title.trim().length > 0 ? note.title : note.note;

  const dateLabel = note.startDate
    ? formatDateRangeLabel(note.startDate, note.endDate)
    : null;
  const relativeDue = formatRelativeDue(note.startDate, note.endDate);
  const recurrenceLabel = formatRecurrenceLabel(note.recurrence);

  return (
    <Animated.View style={[styles.rowContainer, rTaskContainerStyle]}>
      <View style={styles.container}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.swipeableContent, rStyle]}>
            <View
              style={[
                styles.innerContainer,
                expired && note.endDate ? styles.expiredNote : expired ? styles.oldNote : null,
              ]}
            >
              <View
                style={styles.checkbox}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: note.completed }}
                accessibilityLabel={
                  note.completed ? 'Mark note incomplete' : 'Mark note complete'
                }
              >
                <Checkbox
                  status={note.completed ? 'checked' : 'unchecked'}
                  onPress={handleToggleComplete}
                  color={colors.primary}
                  uncheckedColor={colors.textMuted}
                />
              </View>
              <Pressable
                style={styles.content}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`Open note: ${displayTitle}`}
              >
                {categoryColor ? (
                  <View
                    style={[styles.categoryDot, { backgroundColor: categoryColor }]}
                    accessibilityLabel={`Category: ${note.category}`}
                  />
                ) : null}
                <View style={styles.textBlock}>
                  <Text
                    style={[
                      styles.noteText,
                      note.completed ? styles.completed : styles.notCompleted,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {displayTitle}
                  </Text>
                  {(dateLabel || recurrenceLabel) && (
                    <Text style={expired && note.endDate ? styles.expiredLabel : styles.dateLabel}>
                      {expired && note.endDate ? '⚠ Expired · ' : ''}
                      {relativeDue ? `${relativeDue} · ` : ''}
                      {dateLabel}
                      {recurrenceLabel ? `${dateLabel ? ' · ' : ''}${recurrenceLabel}` : ''}
                    </Text>
                  )}
                </View>
              </Pressable>
            </View>
          </Animated.View>
        </GestureDetector>
        <Animated.View style={[styles.deleteContainer, rIconContainerStyle]}>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Delete note"
          >
            <IconButton
              icon="trash-can"
              size={36}
              iconColor={colors.dangerDark}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default NoteItem;
