import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Palette,
  Type,
  Bookmark,
  Search,
  Command,
  Keyboard,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/storage";
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
      { icon: Search, label: "Type to filter tools instantly" },
      { icon: Sparkles, label: "Every module works offline" },
    ],
  },
  {
    icon: Check,
    title: "You’re ready",
    body: "Data lives locally in your browser. Export a JSON backup anytime from Settings. Let’s design something.",
    highlights: [
      { icon: Bookmark, label: "Nothing leaves your device" },
      { icon: Command, label: "Backup & restore in Settings" },
      { icon: Sparkles, label: "Have fun ✨" },
    ],
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    getSettings().then((s) => {
      if (!s.onboarded) setOpen(true);
    });
  }, []);

  async function finish() {
    await updateSettings({ onboarded: true });
    setOpen(false);
  }

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const last = step === STEPS.length - 1;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="mx-4 w-full max-w-[340px] rounded-xl border bg-card p-5 shadow-lg"
        >
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {s.body}
          </p>

          <ul className="mt-4 space-y-2">
            {s.highlights.map((h) => {
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

          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
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
              {!last && (
                <button
                  onClick={finish}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Skip
                </button>
              )}
              <Button
                size="sm"
                onClick={() => (last ? finish() : setStep(step + 1))}
                className="h-7 gap-1 text-xs"
              >
                {last ? "Get started" : "Next"}
                {last ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
