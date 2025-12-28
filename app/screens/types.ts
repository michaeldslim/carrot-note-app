/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/
export interface Note {
  id: string;
  title?: string;
  note: string;
  completed: boolean;
  createdAt: string;
  category?: string;
  userId?: string;
}
