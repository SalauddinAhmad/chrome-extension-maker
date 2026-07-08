import { getActiveTab, isExtension } from "@/lib/chrome";

export interface CapturedPage {
  title: string;
  url: string;
  thumbnail?: string; // data URL
}

/**
 * Capture the currently visible tab. Falls back gracefully outside the
 * extension host so the same code can be exercised in the Vite dev preview.
 */
export async function captureActivePage(): Promise<CapturedPage> {
  const tab = await getActiveTab();

  if (!isExtension || !tab) {
    return {
      title: document.title || "Untitled",
      url: typeof location !== "undefined" ? location.href : "",
    };
  }

  let thumbnail: string | undefined;
  try {
    if (tab.windowId != null && chrome.tabs?.captureVisibleTab) {
      thumbnail = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: "jpeg",
        quality: 70,
      });
    }
  } catch {
    // permission denied / restricted page — leave thumbnail undefined
  }

  return {
    title: tab.title ?? "Untitled",
    url: tab.url ?? "",
    thumbnail,
  };
}

export function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,\s]+/)
        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean),
    ),
  );
}
