import type { Entity } from "./entity";

export interface Inspiration extends Entity {
  title: string;
  url: string;
  thumbnail?: string;       // data URL or blob URL
  tags: string[];
  notes?: string;
  boardId?: string;
}

export interface InspirationBoard extends Entity {
  name: string;
  description?: string;
  coverInspirationId?: string;
}
