import { create } from "zustand";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { scanDesignDNA } from "./logic/dna";
import type { DesignDNA, InspectorTab } from "./types";

interface InspectorState {
  tab: InspectorTab;
  dna: DesignDNA | null;
  isScanning: boolean;
  error: string | null;
  setTab: (t: InspectorTab) => void;
  scan: () => Promise<void>;
}

export const useInspectorStore = create<InspectorState>((set) => ({
  tab: "colors",
  dna: null,
  isScanning: false,
  error: null,

  setTab: (tab) => set({ tab, error: null }),

  async scan() {
    set({ isScanning: true, error: null });
    try {
      let dna: DesignDNA;
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const res = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: scanDesignDNA,
        });
        dna = res[0]?.result as DesignDNA;
      } else {
        dna = scanDesignDNA();
      }
      set({ dna });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isScanning: false });
    }
  },
}));
