import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import { PopupShell } from "@/components/layout/popup-shell";
import { ActiveModule } from "@/components/shared/active-module";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PopupShell>
      <ActiveModule />
    </PopupShell>
  </StrictMode>,
);
