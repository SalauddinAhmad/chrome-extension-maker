import type { Entity } from "./entity";

export interface Project extends Entity {
  name: string;
  clientName?: string;
  description?: string;
  color?: string;            // accent hex
  archived: boolean;
}
