/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
/** Repeat interval for scheduled tasks. */
export type Recurrence = 'weekly' | 'biweekly';

export interface Note {
  id: string;
  title?: string;
  note: string;
  completed: boolean;
  createdAt: string;
  category?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  /** When set, the task repeats on the same weekday every 7 or 14 days from startDate. */
  recurrence?: Recurrence;
}
