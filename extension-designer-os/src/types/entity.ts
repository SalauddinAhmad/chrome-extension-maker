/**
 * Base fields on every stored entity.
 * Timestamps are epoch milliseconds for cheap Dexie sorting.
 */
export interface Entity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export type ID = string;
