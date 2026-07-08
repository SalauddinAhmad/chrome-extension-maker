import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import { SidepanelShell } from "@/components/layout/sidepanel-shell";
import { ActiveModule } from "@/components/shared/active-module";
import { CommandPalette } from "@/components/shared/command-palette";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SidepanelShell>
      <ActiveModule />
    </SidepanelShell>
    <CommandPalette />
  </StrictMode>,
);
