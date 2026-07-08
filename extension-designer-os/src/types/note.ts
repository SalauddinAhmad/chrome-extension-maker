import type { Entity } from "./entity";

export interface Note extends Entity {
  title: string;
  body: string;              // markdown
  pinned: boolean;
  projectId?: string;
  tags: string[];
}
