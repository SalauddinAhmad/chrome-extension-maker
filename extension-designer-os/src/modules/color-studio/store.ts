import { create } from "zustand";
import { toast } from "sonner";
import { hexToRgb, rgbToHsl, normalizeHex } from "./logic";
import { colorRepository } from "./repository";
import { useProjectStore } from "@/stores/project-store";
import type { ColorSource } from "@/types";
import type { NewColorInput, StudioTab } from "./types";
import { nearestName } from "./logic/name";

interface ColorStudioState {
  tab: StudioTab;
  currentHex: string;             // always normalized "#RRGGBB"
  isPicking: boolean;
  error: string | null;
  setTab: (tab: StudioTab) => void;
  setCurrent: (hex: string) => void;
  pickFromPage: () => Promise<void>;
  saveCurrent: (source?: ColorSource) => Promise<void>;
  removeColor: (id: string) => Promise<void>;
}

export const useColorStudioStore = create<ColorStudioState>((set, get) => ({
  tab: "picker",
  currentHex: "#4F46E5",
  isPicking: false,
  error: null,

  setTab: (tab) => set({ tab, error: null }),

  setCurrent: (raw) => {
    try {
      set({ currentHex: normalizeHex(raw), error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  async pickFromPage() {
    const Ctor = (window as unknown as {
      EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> };
    }).EyeDropper;
    if (!Ctor) {
      set({ error: "EyeDropper API not supported in this browser." });
      return;
    }
    set({ isPicking: true, error: null });
    try {
      const result = await new Ctor().open();
      set({ currentHex: normalizeHex(result.sRGBHex) });
    } catch {
      // user cancelled — silent
    } finally {
      set({ isPicking: false });
    }
  },

  async saveCurrent(source = "picker") {
    try {
      const hex = get().currentHex;
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb);
      const projectId = useProjectStore.getState().activeProjectId ?? undefined;
      const input: NewColorInput & { projectId?: string; source: ColorSource; tags: string[] } = {
        hex,
        rgb,
        hsl,
        name: nearestName(rgb),
        source,
        tags: [],
        projectId,
      };
      await colorRepository.create(input);
      toast.success(`Saved ${hex}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  },

  async removeColor(id) {
    try {
      await colorRepository.remove(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  },
}));
