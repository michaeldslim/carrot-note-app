/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { Note } from '../screens/types';
import { ThemeColors } from '../theme/themes';
import { toDateString } from './noteDates';

const MAX_DOTS_PER_DAY = 3;

type MarkedDate = {
  dots?: { color: string }[];
  marked?: boolean;
  selected?: boolean;
  selectedColor?: string;
  selectedTextColor?: string;
  today?: boolean;
};

export function buildCalendarMarkedDates(
  notes: Note[],
  options: {
    selectedDay?: string | null;
    todayStr: string;
    categoryColors: Record<string, string>;
    colors: ThemeColors;
  },
): Record<string, MarkedDate> {
  const { selectedDay, todayStr, categoryColors, colors } = options;
  const map: Record<string, MarkedDate> = {};

  const addDot = (dayKey: string, color: string) => {
    if (!map[dayKey]) map[dayKey] = { dots: [], marked: true };
    const dots = map[dayKey].dots!;
    if (dots.length < MAX_DOTS_PER_DAY && !dots.some((d) => d.color === color)) {
      dots.push({ color });
    }
  };

  notes.forEach((note) => {
    const dotColor =
      note.category && categoryColors[note.category]
        ? categoryColors[note.category]
        : colors.primary;

    if (note.startDate) {
      const start = toDateString(note.startDate);
      const end = note.endDate ? toDateString(note.endDate) : start;
      let cursor = new Date(start + 'T00:00:00');
      const endDate = new Date(end + 'T00:00:00');
      while (cursor <= endDate) {
        addDot(toDateString(cursor.toISOString()), dotColor);
        cursor.setDate(cursor.getDate() + 1);
      }
    } else {
      addDot(toDateString(note.createdAt), colors.textMuted);
    }
  });

  if (selectedDay) {
    map[selectedDay] = {
      ...(map[selectedDay] || {}),
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.surface,
    };
  }

  if (!map[todayStr]) map[todayStr] = {};
  map[todayStr] = { ...(map[todayStr] || {}), today: true };

  return map;
}
