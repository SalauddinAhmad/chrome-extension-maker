import { useEffect } from "react";

/**
 * Register a single hotkey. Combo format: "mod+k", "shift+enter", "escape".
 * `mod` = ⌘ on macOS, Ctrl elsewhere.
 */
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const parts = combo.toLowerCase().split("+");
    const key = parts.at(-1)!;
    const wantMod = parts.includes("mod");
    const wantShift = parts.includes("shift");
    const wantAlt = parts.includes("alt");

    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key.toLowerCase() !== key) return;
      if (wantMod !== mod) return;
      if (wantShift !== e.shiftKey) return;
      if (wantAlt !== e.altKey) return;
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [combo, handler]);
}
