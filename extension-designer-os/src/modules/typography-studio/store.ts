import { create } from "zustand";
import { fontsRepo } from "@/storage";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { useProjectStore } from "@/stores/project-store";
import { detectFontsInPage, classifyFamily } from "./logic/detect";
import type { DetectedFont, TypeTab } from "./types";


interface TypeState {
  tab: TypeTab;
  detected: DetectedFont[];
  isScanning: boolean;
  error: string | null;
  setTab: (tab: TypeTab) => void;
  scan: () => Promise<void>;
  saveDetected: (font: DetectedFont) => Promise<void>;
  removeFont: (id: string) => Promise<void>;
}

export const useTypeStore = create<TypeState>((set) => ({
  tab: "detect",
  detected: [],
  isScanning: false,
  error: null,

  setTab: (tab) => set({ tab, error: null }),

  async scan() {
    set({ isScanning: true, error: null });
    try {
      // Extension host: run inside the active tab.
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: detectFontsInPage,
        });
        set({ detected: (results[0]?.result as DetectedFont[]) ?? [] });
      } else {
        // Dev preview fallback: scan the current document.
        set({ detected: detectFontsInPage() });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isScanning: false });
    }
  },

  async saveDetected(font) {
    const source = classifyFamily(font.family);
    const projectId = useProjectStore.getState().activeProjectId ?? undefined;
    await fontsRepo.create({
      family: font.family,
      weights: font.weights,
      styles: ["normal"],
      source: source === "system" ? "system" : "custom",
      projectId,
    });
  },


  async removeFont(id) {
    await fontsRepo.remove(id);
  },
}));
