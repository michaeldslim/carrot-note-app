/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { Note } from '../screens/types';
import { ThemeColors } from '../theme/themes';
import { addDays, getNoteCalendarDays, toDateString } from './noteDates';

const MAX_DOTS_PER_DAY = 3;
/** Expand recurring marks ±6 months from today for calendar dots. */
const MARK_RANGE_DAYS = 183;

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
  const rangeStart = addDays(todayStr, -MARK_RANGE_DAYS);
  const rangeEnd = addDays(todayStr, MARK_RANGE_DAYS);

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

    getNoteCalendarDays(note, rangeStart, rangeEnd).forEach((dayKey) => {
      addDot(dayKey, dotColor);
    });
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
