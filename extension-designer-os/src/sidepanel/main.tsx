import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { SidepanelShell } from "@/components/layout/sidepanel-shell";
import { ActiveModule } from "@/components/shared/active-module";
import { CommandPalette } from "@/components/shared/command-palette";

const Onboarding = lazy(() =>
  import("@/components/shared/onboarding").then((m) => ({ default: m.Onboarding })),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SidepanelShell>
      <ActiveModule />
      <Suspense fallback={null}>
        <Onboarding />
      </Suspense>
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
