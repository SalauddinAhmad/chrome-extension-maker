import { create } from "zustand";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { detectTechStack } from "./logic/detect";
import type { TechReport } from "./types";

interface TechState {
  report: TechReport | null;
  isScanning: boolean;
  error: string | null;
  scan: () => Promise<void>;
}

export const useTechStore = create<TechState>((set) => ({
  report: null,
  isScanning: false,
  error: null,

  async scan() {
    set({ isScanning: true, error: null });
    try {
      let report: TechReport;
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const res = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: detectTechStack,
        });
        report = res[0]?.result as TechReport;
      } else {
        report = detectTechStack();
      }
      set({ report });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isScanning: false });
    }
  },
}));
