import { create } from "zustand";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { useInspectorStore } from "@/modules/design-inspector/store";
import { accessibilityRepository, type A11yFilters } from "./repository";
import { scanA11y } from "./logic/scan";
import { scoreAccessibility } from "./logic/scoring";
import type { AccessibilityReport, A11yScanData } from "@/types";

export type A11yTab = "run" | "library";

interface A11yState {
  tab: A11yTab;
  current: AccessibilityReport | null;
  isScanning: boolean;
  error: string | null;

  reports: AccessibilityReport[];
  filters: A11yFilters;

  setTab: (t: A11yTab) => void;
  setFilters: (patch: Partial<A11yFilters>) => void;

  analyzePage: (opts?: { save?: boolean; projectId?: string }) => Promise<AccessibilityReport | null>;
  refreshReports: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  clearCurrent: () => void;
}

function build(
  scan: A11yScanData,
  extra?: { projectId?: string; reportId?: string },
): Omit<AccessibilityReport, "id" | "createdAt" | "updatedAt"> {
  const { scores, issues, recommendations, overall, grade } = scoreAccessibility(scan);
  return {
    projectId: extra?.projectId,
    reportId: extra?.reportId,
    url: scan.url,
    title: scan.title,
    favicon: scan.favicon,
    overall, grade, scores, issues, recommendations, scan,
  };
}

export const useAccessibilityStore = create<A11yState>((set, get) => ({
  tab: "run",
  current: null,
  isScanning: false,
  error: null,
  reports: [],
  filters: { sort: "created-desc" },

  setTab: (tab) => set({ tab, error: null }),
  setFilters: (patch) => {
    set({ filters: { ...get().filters, ...patch } });
    void get().refreshReports();
  },
  clearCurrent: () => set({ current: null }),

  async analyzePage(opts) {
    set({ isScanning: true, error: null });
    try {
      let scan: A11yScanData;
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const res = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: scanA11y,
        });
        scan = res[0]?.result as A11yScanData;
      } else {
        scan = scanA11y();
      }
      const inspectorReport = useInspectorStore.getState().current;
      const data = build(scan, {
        projectId: opts?.projectId ?? inspectorReport?.projectId,
        reportId: inspectorReport?.saved ? inspectorReport.id : undefined,
      });
      if (opts?.save !== false) {
        const saved = await accessibilityRepository.create(data);
        set({ current: saved });
        await get().refreshReports();
        return saved;
      }
      const now = Date.now();
      const preview: AccessibilityReport = {
        id: `preview-${now}`, createdAt: now, updatedAt: now, ...data,
      };
      set({ current: preview });
      return preview;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    } finally {
      set({ isScanning: false });
    }
  },

  async refreshReports() {
    const reports = await accessibilityRepository.query(get().filters);
    set({ reports });
  },

  async deleteReport(id) {
    await accessibilityRepository.remove(id);
    if (get().current?.id === id) set({ current: null });
    await get().refreshReports();
  },
}));
