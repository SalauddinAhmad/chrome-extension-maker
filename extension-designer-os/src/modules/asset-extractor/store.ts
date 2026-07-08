import { create } from "zustand";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { scanPageAssets } from "./logic/scan";
import { downloadAsset, downloadMany } from "./logic/download";
import type { AssetTab, ScannedAsset } from "./types";

interface AssetState {
  tab: AssetTab;
  assets: ScannedAsset[];
  selected: Set<string>;
  isScanning: boolean;
  error: string | null;
  setTab: (tab: AssetTab) => void;
  toggle: (id: string) => void;
  clearSelection: () => void;
  scan: () => Promise<void>;
  download: (asset: ScannedAsset) => Promise<void>;
  downloadSelected: () => Promise<void>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  tab: "all",
  assets: [],
  selected: new Set(),
  isScanning: false,
  error: null,

  setTab: (tab) => set({ tab, error: null }),

  toggle: (id) => {
    const next = new Set(get().selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selected: next });
  },

  clearSelection: () => set({ selected: new Set() }),

  async scan() {
    set({ isScanning: true, error: null });
    try {
      let assets: ScannedAsset[];
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const res = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: scanPageAssets,
        });
        assets = (res[0]?.result as ScannedAsset[]) ?? [];
      } else {
        assets = scanPageAssets();
      }
      set({ assets, selected: new Set() });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isScanning: false });
    }
  },

  async download(asset) {
    try {
      await downloadAsset(asset);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  async downloadSelected() {
    const { assets, selected } = get();
    const picks = assets.filter((a) => selected.has(a.id));
    if (!picks.length) return;
    try {
      await downloadMany(picks);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
