export type ThemeMode = "light" | "dark" | "system";

/** IDs for the 7-step Getting Started checklist. */
export type ChecklistStep =
  | "create-project"
  | "save-inspiration"
  | "save-asset"
  | "save-color"
  | "save-font"
  | "run-inspection"
  | "run-audit";

export const CHECKLIST_STEPS: ChecklistStep[] = [
  "create-project",
  "save-inspiration",
  "save-asset",
  "save-color",
  "save-font",
  "run-inspection",
  "run-audit",
];

export interface Settings {
  id: "singleton";           // enforced single row
  theme: ThemeMode;
  favoriteModuleIds: string[];
  colorFormat: "hex" | "rgb" | "hsl" | "oklch";
  reduceMotion: boolean;
  lastSeenVersion: string;
  onboarded: boolean;
  /** User dismissed the Getting Started card. Auto-hidden when all steps complete. */
  checklistDismissed: boolean;
  /** Sample "Getting Started" project was seeded. Prevents reseeding. */
  sampleSeeded: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  id: "singleton",
  theme: "system",
  favoriteModuleIds: [],
  colorFormat: "hex",
  reduceMotion: false,
  lastSeenVersion: "1.0.0",
  onboarded: false,
  checklistDismissed: false,
  sampleSeeded: false,
};
