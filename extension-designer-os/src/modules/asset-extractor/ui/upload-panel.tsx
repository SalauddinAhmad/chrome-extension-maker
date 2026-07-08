import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from "../library-store";
import { ACCEPTED_UPLOAD_MIMES, MAX_UPLOAD_BYTES } from "../logic/validation";
import { cn } from "@/lib/cn";

export function UploadPanel() {
  const uploadFiles = useLibraryStore((s) => s.uploadFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handle(files: FileList | File[] | null) {
    if (!files) return;
    setUploading(true);
    try { await uploadFiles(files); }
    finally { setUploading(false); }
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          void handle(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-muted",
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <div className="text-[11px] font-medium">Drop files here or</div>
        <Button
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-1.5"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Choose files
        </Button>
        <div className="text-[10px] text-muted-foreground">
          PNG, JPG, WebP, SVG, GIF, PDF, MP4 · max {MAX_UPLOAD_BYTES / (1024 * 1024)} MB
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD_MIMES.join(",")}
          className="hidden"
          onChange={(e) => {
            void handle(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
      </div>
    </div>
  );
}
