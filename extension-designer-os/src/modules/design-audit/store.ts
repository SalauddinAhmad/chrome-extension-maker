import { create } from "zustand";
import { designInspectorRepository } from "@/modules/design-inspector/repository";
import { useInspectorStore } from "@/modules/design-inspector/store";
import { accessibilityRepository } from "@/modules/accessibility/repository";
import { designAuditRepository, type AuditFilters } from "./repository";
import { auditReport } from "./logic/scoring";
import type { DesignAudit, DesignReport } from "@/types";

export type AuditTab = "run" | "library";

interface AuditState {
  tab: AuditTab;
  current: DesignAudit | null;
  isRunning: boolean;
  error: string | null;

  audits: DesignAudit[];
  filters: AuditFilters;
  activeAuditId: string | null;

  setTab: (t: AuditTab) => void;
  setFilters: (patch: Partial<AuditFilters>) => void;
  openAudit: (id: string | null) => void;

  runFromReport: (report: DesignReport, opts?: { save?: boolean }) => Promise<DesignAudit>;
  runFromCurrentInspector: (opts?: { save?: boolean }) => Promise<DesignAudit | null>;
  runFromReportId: (reportId: string, opts?: { save?: boolean }) => Promise<DesignAudit | null>;
  refreshAudits: () => Promise<void>;
  deleteAudit: (id: string) => Promise<void>;
}

async function buildAudit(report: DesignReport): Promise<Omit<DesignAudit, "id" | "createdAt" | "updatedAt">> {
  // Consume the latest Accessibility Center report for this design report,
  // when available, instead of re-running heuristic contrast checks.
  const a11y = report.id && !report.id.startsWith("preview-")
    ? await accessibilityRepository.latestForReport(report.id)
    : undefined;
  const { scores, issues, recommendations, overall, grade } = auditReport(report, {
    accessibility: a11y ? { score: a11y.overall, notes: `From Accessibility Center · grade ${a11y.grade}` } : undefined,
  });
  return {
    projectId: report.projectId,
    reportId: report.id,
    url: report.url,
    title: report.title,
    favicon: report.favicon,
    overall,
    grade,
    scores,
    issues,
    recommendations,
  };
}

export const useAuditStore = create<AuditState>((set, get) => ({
  tab: "run",
  current: null,
  isRunning: false,
  error: null,
  audits: [],
  filters: { sort: "created-desc" },
  activeAuditId: null,

  setTab: (tab) => set({ tab, error: null }),
  setFilters: (patch) => {
    set({ filters: { ...get().filters, ...patch } });
    void get().refreshAudits();
  },
  openAudit: (id) => set({ activeAuditId: id }),

  async runFromReport(report, opts) {
    set({ isRunning: true, error: null });
    try {
      const data = await buildAudit(report);
      if (opts?.save !== false) {
        const saved = await designAuditRepository.create(data);
        set({ current: saved });
        await get().refreshAudits();
        return saved;
      }
      const now = Date.now();
      const preview: DesignAudit = {
        id: `preview-${now}`, createdAt: now, updatedAt: now, ...data,
      };
      set({ current: preview });
      return preview;
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ isRunning: false });
    }
  },

  async runFromCurrentInspector(opts) {
    const cur = useInspectorStore.getState().current;
    if (!cur) {
      set({ error: "No design report available. Scan a page in Design Inspector first." });
      return null;
    }
    return get().runFromReport(cur, opts);
  },

  async runFromReportId(reportId, opts) {
    const report = await designInspectorRepository.getById(reportId);
    if (!report) {
      set({ error: "Report not found." });
      return null;
    }
    return get().runFromReport(report, opts);
  },

  async refreshAudits() {
    const audits = await designAuditRepository.query(get().filters);
    set({ audits });
  },

  async deleteAudit(id) {
    await designAuditRepository.remove(id);
    if (get().current?.id === id) set({ current: null });
    await get().refreshAudits();
  },
}));
