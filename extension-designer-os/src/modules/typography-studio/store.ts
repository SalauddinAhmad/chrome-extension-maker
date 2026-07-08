import { create } from "zustand";
import { typographyRepository } from "./repository";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { useProjectStore } from "@/stores/project-store";
import { detectFontsInPage, classifyFamily } from "./logic/detect";
import { inspectHierarchyInPage } from "./logic/inspect";
import type { DetectedFont, InspectedStyle, TypeTab } from "./types";
import type { FontCategory } from "@/types";

interface TypeState {
  tab: TypeTab;
  detected: DetectedFont[];
  inspected: InspectedStyle[];
  isScanning: boolean;
  isInspecting: boolean;
  error: string | null;

  setTab: (tab: TypeTab) => void;
  scan: () => Promise<void>;
  inspect: () => Promise<void>;
  saveDetected: (font: DetectedFont) => Promise<void>;
  removeFont: (id: string) => Promise<void>;
}

/** Heuristic FontCategory from a family name. */
export function inferCategory(family: string): FontCategory {
  const f = family.toLowerCase();
  if (/(mono|code|courier|consolas|menlo)/.test(f)) return "monospace";
  if (/(serif|garamond|georgia|times|playfair|fraunces|lora|merriweather)/.test(f)) return "serif";
  if (/(script|dancing|pacifico|lobster|great vibes|allura)/.test(f)) return "script";
  if (/(hand|caveat|kalam|indie|shadows|patrick)/.test(f)) return "handwriting";
  if (/(display|black|bold|impact|bebas|anton|oswald|archivo black)/.test(f)) return "display";
  return "sans-serif";
}

export const useTypeStore = create<TypeState>((set) => ({
  tab: "detect",
  detected: [],
  inspected: [],
  isScanning: false,
  isInspecting: false,
  error: null,

  setTab: (tab) => set({ tab, error: null }),

  async scan() {
    set({ isScanning: true, error: null });
    try {
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: detectFontsInPage,
        });
        set({ detected: (results[0]?.result as DetectedFont[]) ?? [] });
      } else {
        set({ detected: detectFontsInPage() });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isScanning: false });
    }
  },

  async inspect() {
    set({ isInspecting: true, error: null });
    try {
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: inspectHierarchyInPage,
        });
        set({ inspected: (results[0]?.result as InspectedStyle[]) ?? [] });
      } else {
        set({ inspected: inspectHierarchyInPage() });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isInspecting: false });
    }
  },

  async saveDetected(font) {
    const rawSource = classifyFamily(font.family);
    const projectId = useProjectStore.getState().activeProjectId ?? undefined;
    await typographyRepository.createFont({
      family: font.family,
      weights: font.weights,
      styles: ["normal"],
      category: inferCategory(font.family),
      source: rawSource === "system" ? "system" : "website",
      projectId,
    });
  },

  async removeFont(id) {
    await typographyRepository.deleteFont(id);
  },
}));
