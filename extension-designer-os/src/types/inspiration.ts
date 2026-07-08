import type { Entity } from "./entity";

export interface Inspiration extends Entity {
  title: string;
  url: string;
  thumbnail?: string;
  tags: string[];
  notes?: string;
  boardId?: string;
  projectId?: string;
  collection?: string;
  favorite?: boolean;
}

export interface InspirationBoard extends Entity {
  name: string;
  description?: string;
  coverInspirationId?: string;
}
