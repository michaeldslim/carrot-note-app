/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/

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
