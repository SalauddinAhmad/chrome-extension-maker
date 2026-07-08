import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { SidepanelShell } from "@/components/layout/sidepanel-shell";
import { ActiveModule } from "@/components/shared/active-module";
import { CommandPalette } from "@/components/shared/command-palette";
import { Onboarding } from "@/components/shared/onboarding";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SidepanelShell>
      <ActiveModule />
      <Onboarding />
    </SidepanelShell>
    <CommandPalette />
    <Toaster
      position="bottom-right"
      theme="system"
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border border-border shadow-md text-xs",
        },
      }}
    />
  </StrictMode>,
);
