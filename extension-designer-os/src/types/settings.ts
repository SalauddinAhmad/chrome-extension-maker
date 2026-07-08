export type ThemeMode = "light" | "dark" | "system";

export interface Settings {
  id: "singleton";           // enforced single row
  theme: ThemeMode;
  favoriteModuleIds: string[];
  colorFormat: "hex" | "rgb" | "hsl" | "oklch";
  reduceMotion: boolean;
  lastSeenVersion: string;
}

export const DEFAULT_SETTINGS: Settings = {
  id: "singleton",
  theme: "system",
  favoriteModuleIds: [],
  colorFormat: "hex",
  reduceMotion: false,
  lastSeenVersion: "1.0.0",
};
