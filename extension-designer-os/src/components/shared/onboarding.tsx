import { useEffect, useState } from "react";
import {
  Sparkles,
  Palette,
  Type,
  Bookmark,
  Command,
  Keyboard,
  ArrowRight,
  Check,
  Rocket,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/storage";
import { seedSampleProject } from "@/modules/settings/logic/sample-project";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Designer OS",
    body: "Your all-in-one browser toolkit for designers — inspect, capture, save, and organize everything you see on the web.",
    highlights: [
      { icon: Palette, label: "Colors, gradients & palettes" },
      { icon: Type, label: "Fonts & type-scale" },
      { icon: Bookmark, label: "Inspiration vault" },
    ],
  },
  {
    icon: Command,
    title: "10 modules, one shell",
    body: "Switch between tools from the top grid, or open the Command Palette to jump anywhere in a keystroke.",
    highlights: [
      { icon: Keyboard, label: "⌘K / Ctrl+K — Command Palette" },
      { icon: Sparkles, label: "Every module works offline" },
      { icon: Check, label: "Data stays on this device" },
    ],
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);
  const isFinal = step === STEPS.length;

  useEffect(() => {
    getSettings().then((s) => {
      if (!s.onboarded) setOpen(true);
      if (s.sampleSeeded) setSeedDone(true);
    });
  }, []);

  async function finish() {
    await updateSettings({ onboarded: true });
    setOpen(false);
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedSampleProject();
      await updateSettings({ sampleSeeded: true });
      setSeedDone(true);
    } finally {
      setSeeding(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-[340px] rounded-xl border bg-card p-5 shadow-lg animate-in zoom-in-95 duration-150">
        {!isFinal ? (
          <IntroStep step={STEPS[step]} />
        ) : (
          <WizardStep
            seeding={seeding}
            seedDone={seedDone}
            onSeed={handleSeed}
          />
        )}

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {[...STEPS, "wizard"].map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isFinal && (
              <button
                onClick={finish}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Skip
              </button>
            )}
            <Button
              size="sm"
              onClick={() => (isFinal ? finish() : setStep(step + 1))}
              className="h-7 gap-1 text-xs"
            >
              {isFinal ? "Get started" : "Next"}
              {isFinal ? (
                <Check className="h-3 w-3" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type IntroStepData = (typeof STEPS)[number];

function IntroStep({ step }: { step: IntroStepData }) {
  const Icon = step.icon;
  return (
    <>
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h2 id="onboarding-title" className="text-base font-semibold tracking-tight">
        {step.title}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {step.body}
      </p>
      <ul className="mt-4 space-y-2">
        {step.highlights.map((h) => {
          const HIcon = h.icon;
          return (
            <li
              key={h.label}
              className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs"
            >
              <HIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground">{h.label}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function WizardStep({
  seeding,
  seedDone,
  onSeed,
}: {
  seeding: boolean;
  seedDone: boolean;
  onSeed: () => void;
}) {
  return (
    <>
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="h-5 w-5" />
      </div>
      <h2 id="onboarding-title" className="text-base font-semibold tracking-tight">
        Try it with sample data
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Load a demo project with a color, font, inspiration, and asset — or start from a
        blank canvas.
      </p>
      <div className="mt-4 space-y-2">
        <Button
          size="sm"
          variant={seedDone ? "outline" : "default"}
          disabled={seeding || seedDone}
          onClick={onSeed}
          className="h-8 w-full gap-1.5 text-xs"
        >
          {seeding ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating sample project…
            </>
          ) : seedDone ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Sample project ready
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Load sample project
            </>
          )}
        </Button>
        <p className="text-[10px] leading-snug text-muted-foreground">
          Tip: your Getting Started checklist on the Home tab tracks the next 7 steps
          — Create Project → Save Inspiration → Save Asset → Save Color → Save Font →
          Run Inspection → Run Audit.
        </p>
      </div>
    </>
  );
}
