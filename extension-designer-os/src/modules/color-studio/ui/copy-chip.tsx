import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface CopyChipProps {
  label: string;
  value: string;
  className?: string;
}

export function CopyChip({ label, value, className }: CopyChipProps) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 900);
  };
  return (
    <button
      onClick={handle}
      className={cn(
        "group flex w-full items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5 text-left transition-colors hover:bg-accent",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="truncate font-mono text-[11px] font-medium">{value}</div>
      </div>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}
