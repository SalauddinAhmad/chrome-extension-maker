import { create } from "zustand";
import { getActiveTab, isExtension } from "@/lib/chrome";
import { scanDesignDNA } from "./logic/dna";
import { designInspectorRepository, type ReportFilters } from "./repository";
import {
  saveAssetsFromReport,
  saveColorsFromReport,
  saveFontsFromReport,
} from "./logic/integration";
import type { DesignReport } from "@/types";
import type { InspectorTab, ReportViewTab, ScanPayload } from "./types";

interface InspectorState {
  // navigation
  tab: InspectorTab;
  viewTab: ReportViewTab;

  // live scan (unsaved)
  current: DesignReport | null;
  isScanning: boolean;
  error: string | null;

  // library
  reports: DesignReport[];
  filters: ReportFilters;
  activeReportId: string | null;
  detailOpen: boolean;

  // integration status
  isSaving: boolean;

  // actions
  setTab: (t: InspectorTab) => void;
  setViewTab: (v: ReportViewTab) => void;
  setFilters: (patch: Partial<ReportFilters>) => void;

  analyzePage: () => Promise<void>;
  saveReport: (opts?: { projectId?: string }) => Promise<DesignReport | null>;
  loadReport: (id: string) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  refreshReports: () => Promise<void>;
  searchReports: (query: string) => Promise<void>;
  openDetail: (id: string | null) => void;

  saveColorsToStudio: (report: DesignReport) => Promise<number>;
  saveFontsToStudio: (report: DesignReport) => Promise<number>;
  saveAssetsToLibrary: (report: DesignReport) => Promise<number>;
}

function toReport(payload: ScanPayload): DesignReport {
  const now = Date.now();
  return {
    id: `preview-${now}`,
    createdAt: now,
    updatedAt: now,
    saved: false,
    ...payload,
  };
}

export const useInspectorStore = create<InspectorState>((set, get) => ({
  tab: "analyze",
  viewTab: "summary",
  current: null,
  isScanning: false,
  error: null,
  reports: [],
  filters: { sort: "created-desc" },
  activeReportId: null,
  detailOpen: false,
  isSaving: false,

  setTab: (tab) => set({ tab, error: null }),
  setViewTab: (viewTab) => set({ viewTab }),
  setFilters: (patch) => {
    set({ filters: { ...get().filters, ...patch } });
    void get().refreshReports();
  },

  async analyzePage() {
    set({ isScanning: true, error: null });
    try {
      let payload: ScanPayload;
      if (isExtension && chrome.scripting?.executeScript) {
        const tab = await getActiveTab();
        if (!tab?.id) throw new Error("No active tab.");
        const res = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: scanDesignDNA,
        });
        payload = res[0]?.result as ScanPayload;
      } else {
        payload = scanDesignDNA();
      }
      set({ current: toReport(payload), viewTab: "summary" });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isScanning: false });
    }
  },

  async saveReport(opts) {
    const cur = get().current;
    if (!cur) return null;
    set({ isSaving: true });
    try {
      const { id: _id, createdAt: _c, updatedAt: _u, saved: _s, ...rest } = cur;
      void _id; void _c; void _u; void _s;
      const saved = await designInspectorRepository.create({
        ...rest,
        projectId: opts?.projectId ?? cur.projectId,
        saved: true,
      });
      set({ current: saved });
      await get().refreshReports();
      return saved;
    } finally {
      set({ isSaving: false });
    }
  },

  async loadReport(id) {
    const r = await designInspectorRepository.getById(id);
    if (r) set({ current: r, tab: "analyze", viewTab: "summary" });
  },

  async deleteReport(id) {
    await designInspectorRepository.remove(id);
    const cur = get().current;
    if (cur?.id === id) set({ current: null });
    await get().refreshReports();
  },

  async refreshReports() {
    const reports = await designInspectorRepository.query(get().filters);
    set({ reports });
  },

  async searchReports(query) {
    get().setFilters({ search: query });
  },

  openDetail: (id) => set({ activeReportId: id, detailOpen: !!id }),

  async saveColorsToStudio(report) {
    return saveColorsFromReport(report);
  },
  async saveFontsToStudio(report) {
    return saveFontsFromReport(report);
  },
  async saveAssetsToLibrary(report) {
    return saveAssetsFromReport(report);
  },
}));
