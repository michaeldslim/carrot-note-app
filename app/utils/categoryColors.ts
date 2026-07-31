/*
 Copyright (C) 2025 Michael Lim - Carrot Note App 
 This software is free to use, modify, and share under 
 the terms of the GNU General Public License v3.
*/

/** Palette aligned with app theme accents — used when no color is stored. */
export const CATEGORY_COLOR_PALETTE = [
  '#7A9E7E',
  '#C4956A',
  '#6B9AC4',
  '#B87AA8',
  '#C9826F',
  '#7DAB76',
  '#9B8EC4',
] as const;

export function getCategoryColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLOR_PALETTE[Math.abs(hash) % CATEGORY_COLOR_PALETTE.length];
}

export function getCategoryColorForIndex(index: number): string {
  return CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length];
}
