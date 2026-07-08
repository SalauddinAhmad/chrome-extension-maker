import { Accessibility } from "lucide-react";
import type { A11yGrade } from "@/types";

const TONE: Record<A11yGrade, string> = {
  A: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10",
  B: "text-lime-500 border-lime-500/40 bg-lime-500/10",
  C: "text-amber-500 border-amber-500/40 bg-amber-500/10",
  D: "text-orange-500 border-orange-500/40 bg-orange-500/10",
  F: "text-red-500 border-red-500/40 bg-red-500/10",
};

interface Props { score: number; grade: A11yGrade; compact?: boolean }

export function A11yScoreBadge({ score, grade, compact }: Props) {
  const tone = TONE[grade];
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>
        <Accessibility className="h-2.5 w-2.5" />
        {score} · {grade}
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${tone}`}>
      <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-current text-xl font-bold tabular-nums">
        {score}
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide opacity-70">A11y Grade</div>
        <div className="text-2xl font-bold leading-none">{grade}</div>
      </div>
    </div>
  );
}
