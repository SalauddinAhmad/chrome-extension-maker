import type { DesignReport } from "@/types";

export type InspectorTab = "analyze" | "library";

export type ReportViewTab =
  | "summary"
  | "colors"
  | "type"
  | "components"
  | "layout"
  | "effects"
  | "assets";

/**
 * Raw scan payload returned by the in-page scanner.
 * Missing report metadata (id, projectId, timestamps) which the store adds.
 */
export type ScanPayload = Omit<
  DesignReport,
  "id" | "createdAt" | "updatedAt" | "projectId" | "saved"
>;

/**
 * Backwards-compatible alias — older UI code referenced `DesignDNA`.
 * New code should prefer `DesignReport` from `@/types`.
 */
export type DesignDNA = ScanPayload;
