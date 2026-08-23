/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
import { Note, Recurrence } from '../screens/types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const parseLocalDate = (value: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

export const toDateString = (iso: string) => iso.slice(0, 10);

export const formatDayLabel = (day: string): string => {
  const d = parseLocalDate(day);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateRangeLabel = (
  startDate?: string,
  endDate?: string,
): string => {
  if (!startDate) return '📅  Set date range (optional)';
  if (!endDate || endDate === startDate) {
    return formatDayLabel(startDate);
  }
  return `${formatDayLabel(startDate)} → ${formatDayLabel(endDate)}`;
};

/** Human-readable relative due label, e.g. "Due today", "Due in 2 days", "Overdue by 1 day". */
export const formatRelativeDue = (
  startDate?: string,
  endDate?: string,
): string | null => {
  const due = endDate ?? startDate;
  if (!due) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = parseLocalDate(due);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return overdue === 1 ? 'Overdue by 1 day' : `Overdue by ${overdue} days`;
  }
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays} days`;
};

export const recurrenceIntervalDays = (recurrence: Recurrence): number =>
  recurrence === 'biweekly' ? 14 : 7;

export const daysBetween = (startDay: string, endDay: string): number => {
  const start = parseLocalDate(startDay);
  const end = parseLocalDate(endDay);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
};

export const addDays = (day: string, count: number): string => {
  const date = parseLocalDate(day);
  date.setDate(date.getDate() + count);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayNum = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayNum}`;
};

/** Whether a note should appear on a given calendar day (YYYY-MM-DD). */
export const noteOccursOnDay = (note: Note, dayStr: string): boolean => {
  if (note.recurrence && note.startDate) {
    const anchor = toDateString(note.startDate);
    const diff = daysBetween(anchor, dayStr);
    if (diff < 0) return false;
    const interval = recurrenceIntervalDays(note.recurrence);
    return diff % interval === 0;
  }

  if (note.startDate) {
    const start = toDateString(note.startDate);
    const end = note.endDate ? toDateString(note.endDate) : start;
    return dayStr >= start && dayStr <= end;
  }

  return toDateString(note.createdAt) === dayStr;
};

/** Calendar dot keys for a note within an inclusive day range. */
export const getNoteCalendarDays = (
  note: Note,
  rangeStart: string,
  rangeEnd: string,
): string[] => {
  if (note.recurrence && note.startDate) {
    const interval = recurrenceIntervalDays(note.recurrence);
    const days: string[] = [];
    let cursor = toDateString(note.startDate);

    while (cursor < rangeStart) {
      cursor = addDays(cursor, interval);
    }

    while (cursor <= rangeEnd) {
      days.push(cursor);
      cursor = addDays(cursor, interval);
    }

    return days;
  }

  if (note.startDate) {
    const start = toDateString(note.startDate);
    const end = note.endDate ? toDateString(note.endDate) : start;
    const days: string[] = [];
    let cursor = start;

    while (cursor <= end) {
      if (cursor >= rangeStart && cursor <= rangeEnd) {
        days.push(cursor);
      }
      if (cursor >= end) break;
      cursor = addDays(cursor, 1);
    }

    return days;
  }

  const created = toDateString(note.createdAt);
  return created >= rangeStart && created <= rangeEnd ? [created] : [];
};

/** Advance a recurring note to its next occurrence after completion. */
export const advanceRecurrenceDates = (
  note: Note,
): { startDate: string; endDate: string } => {
  if (!note.recurrence || !note.startDate) {
    throw new Error('advanceRecurrenceDates requires a recurring note with startDate');
  }

  const interval = recurrenceIntervalDays(note.recurrence);
  const start = toDateString(note.startDate);
  const end = note.endDate ? toDateString(note.endDate) : start;
  const span = daysBetween(start, end);
  const nextStart = addDays(start, interval);
  const nextEnd = span > 0 ? addDays(nextStart, span) : nextStart;

  return { startDate: nextStart, endDate: nextEnd };
};

export const formatRecurrenceLabel = (recurrence?: Recurrence): string | null => {
  if (recurrence === 'weekly') return 'Repeats weekly';
  if (recurrence === 'biweekly') return 'Repeats every 2 weeks';
  return null;
};
