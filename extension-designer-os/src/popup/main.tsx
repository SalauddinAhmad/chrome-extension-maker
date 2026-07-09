import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "@/styles/globals.css";
import { PopupShell } from "@/components/layout/popup-shell";
import { ActiveModule } from "@/components/shared/active-module";
import { CommandPalette } from "@/components/shared/command-palette";

// Lazy-loaded — only pulled in for first-run users, keeping the popup
// critical-path chunk small.
const Onboarding = lazy(() =>
  import("@/components/shared/onboarding").then((m) => ({ default: m.Onboarding })),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopupShell>
      <ActiveModule />
      <Suspense fallback={null}>
        <Onboarding />
      </Suspense>
    </PopupShell>
    <CommandPalette />
    <Toaster
      position="bottom-center"
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
