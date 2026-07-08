import * as Dialog from "@radix-ui/react-dialog";
import { SavePanel } from "./save-panel";
import { useVaultStore } from "../store";

export function EditDialog() {
  const editOpen = useVaultStore((s) => s.editOpen);
  const closeEdit = useVaultStore((s) => s.closeEdit);

  return (
    <Dialog.Root open={editOpen} onOpenChange={(o) => !o && closeEdit()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[92vw] max-w-[380px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-popover p-4 text-popover-foreground shadow-2xl">
          <Dialog.Title className="mb-1 text-sm font-semibold">Edit inspiration</Dialog.Title>
          <Dialog.Description className="mb-3 text-[10px] text-muted-foreground">
            Update details, tags, project, or collection.
          </Dialog.Description>
          <SavePanel />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
