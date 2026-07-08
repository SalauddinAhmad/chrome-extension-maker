import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export function SidepanelShell({ children }: { children: ReactNode }) {
  return <AppShell variant="sidepanel">{children}</AppShell>;
}
