import { create } from "zustand";
import { getActiveTab, isExtension, downloadFile } from "@/lib/chrome";
import type { Shot, ShotFormat } from "./types";

function safeName(title: string, format: ShotFormat) {
  const base = title.replace(/[\\/:*?"<>|]+/g, "-").trim().slice(0, 60) || "screenshot";
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${base}-${ts}.${format}`;
}

async function measure(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

interface ScreenshotState {
  format: ShotFormat;
  quality: number;               // 0.1–1 (jpeg only)
  isCapturing: boolean;
  shot: Shot | null;
  error: string | null;
  setFormat: (f: ShotFormat) => void;
  setQuality: (q: number) => void;
  capture: () => Promise<void>;
  download: () => Promise<void>;
  copy: () => Promise<void>;
  clear: () => void;
}

export const useScreenshotStore = create<ScreenshotState>((set, get) => ({
  format: "png",
  quality: 0.92,
  isCapturing: false,
  shot: null,
  error: null,

  setFormat: (format) => set({ format }),
  setQuality: (quality) => set({ quality }),
  clear: () => set({ shot: null, error: null }),

  async capture() {
    set({ isCapturing: true, error: null });
    try {
      const tab = await getActiveTab();
      let dataUrl: string;

      if (isExtension && chrome.tabs?.captureVisibleTab && tab?.windowId != null) {
        dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: get().format,
          quality: Math.round(get().quality * 100),
        });
      } else {
        // Dev preview fallback — synthesize a 1x1 placeholder so UI can be
        // exercised outside the extension host.
        dataUrl =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      }

      const { width, height } = await measure(dataUrl);
      set({
        shot: {
          dataUrl,
          format: get().format,
          width,
          height,
          pageTitle: tab?.title ?? document.title ?? "Untitled",
          pageUrl: tab?.url ?? (typeof location !== "undefined" ? location.href : ""),
          createdAt: Date.now(),
        },
      });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ isCapturing: false });
    }
  },

  async download() {
    const shot = get().shot;
    if (!shot) return;
    await downloadFile(shot.dataUrl, safeName(shot.pageTitle, shot.format));
  },

  async copy() {
    const shot = get().shot;
    if (!shot) return;
    try {
      const res = await fetch(shot.dataUrl);
      const blob = await res.blob();
      // ClipboardItem only accepts png for images in Chrome.
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
