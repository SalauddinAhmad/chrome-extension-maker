import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import { PopupShell } from "@/components/layout/popup-shell";
import { ActiveModule } from "@/components/shared/active-module";
import { CommandPalette } from "@/components/shared/command-palette";
import { Onboarding } from "@/components/shared/onboarding";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopupShell>
      <ActiveModule />
      <Onboarding />
    </PopupShell>
    <CommandPalette />
  </StrictMode>,
);
