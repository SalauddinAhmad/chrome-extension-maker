export type ResourceCategory =
  | "icons"
  | "fonts"
  | "stock"
  | "mockups"
  | "illustrations"
  | "gradients"
  | "colors"
  | "inspiration"
  | "tools";

export interface Resource {
  id: string;
  name: string;
  url: string;
  category: ResourceCategory;
  description: string;
  free: boolean;
  tags: string[];
}
