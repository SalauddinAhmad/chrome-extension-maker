import type { Entity } from "./entity";

export interface Project extends Entity {
  name: string;
  clientName?: string;
  description?: string;
  color?: string;            // accent hex
  coverImage?: string;       // data URL or remote URL
  archived: boolean;
}

export interface ProjectStats {
  inspirations: number;
  assets: number;
  colors: number;
  fonts: number;
  notes: number;
  total: number;
}
