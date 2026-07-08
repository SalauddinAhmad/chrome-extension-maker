import { create } from "zustand";
import { getSettings, updateSettings } from "@/storage";
import type { ThemeMode } from "@/types";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  hydrated: boolean;
  init: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
}

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function applyToDom(resolved: "light" | "dark") {
  const el = document.documentElement;
  el.classList.toggle("dark", resolved === "dark");
  el.style.colorScheme = resolved;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "system",
  resolved: "light",
  hydrated: false,
  async init() {
    const settings = await getSettings();
    const resolved = resolveMode(settings.theme);
    applyToDom(resolved);
    set({ mode: settings.theme, resolved, hydrated: true });

    // React to OS changes while in "system" mode.
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (get().mode !== "system") return;
      const r = e.matches ? "dark" : "light";
      applyToDom(r);
      set({ resolved: r });
    });
  },
  async setMode(mode) {
    await updateSettings({ theme: mode });
    const resolved = resolveMode(mode);
    applyToDom(resolved);
    set({ mode, resolved });
  },
}));
