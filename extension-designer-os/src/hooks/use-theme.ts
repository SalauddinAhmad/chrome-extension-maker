import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function useTheme() {
  const state = useThemeStore();
  useEffect(() => {
    if (!state.hydrated) void state.init();
  }, [state]);
  return state;
}
