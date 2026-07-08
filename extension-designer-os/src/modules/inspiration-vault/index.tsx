import { useEffect } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { useVaultStore } from "./store";
import { SavePanel } from "./ui/save-panel";
import { VaultGrid } from "./ui/vault-grid";
import { EditDialog } from "./ui/edit-dialog";
import type { VaultTab } from "./types";

const TABS: Array<{ id: VaultTab; label: string }> = [
  { id: "save", label: "Save" },
  { id: "vault", label: "Vault" },
];

export default function InspirationVault() {
  const tab = useVaultStore((s) => s.tab);
  const setTab = useVaultStore((s) => s.setTab);
  const draft = useVaultStore((s) => s.draft);
  const capture = useVaultStore((s) => s.capture);

  useEffect(() => {
    if (tab === "save" && !draft.url && !draft.id) {
      void capture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="space-y-3 p-3">
      <header className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">
          <Bookmark className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold leading-tight">Inspiration Vault</div>
          <div className="text-[10px] text-muted-foreground">Save · tag · organize · revisit</div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-md border bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded px-2 py-1.5 text-[11px] font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "save" ? <SavePanel /> : <VaultGrid />}

      <EditDialog />
    </div>
  );
}
