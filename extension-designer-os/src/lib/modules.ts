import {
  Palette,
  Type,
  Search,
  Bookmark,
  Image as ImageIcon,
  Layers,
  StickyNote,
  Cpu,
  Camera,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "color-studio"
  | "typography-studio"
  | "design-inspector"
  | "inspiration-vault"
  | "asset-extractor"
  | "resource-hub"
  | "notes"
  | "tech-stack"
  | "screenshot";

export type ModulePhase = 1 | 2 | 3 | 4 | 5 | 6;

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  phase: ModulePhase;
  status: "scaffolded" | "in-progress" | "ready";
}

export const MODULES: ModuleMeta[] = [
  { id: "dashboard", name: "Dashboard", tagline: "Home · activity · favorites", icon: LayoutDashboard, phase: 1, status: "scaffolded" },
  { id: "color-studio", name: "Color Studio", tagline: "Pick · palette · gradient", icon: Palette, phase: 2, status: "ready" },
  { id: "typography-studio", name: "Typography", tagline: "Detect · pair · scale", icon: Type, phase: 2, status: "scaffolded" },
  { id: "inspiration-vault", name: "Inspiration Vault", tagline: "Save · tag · moodboard", icon: Bookmark, phase: 3, status: "scaffolded" },
  { id: "notes", name: "Notes", tagline: "Ideas · briefs · todos", icon: StickyNote, phase: 3, status: "scaffolded" },
  { id: "asset-extractor", name: "Asset Extractor", tagline: "Images · SVG · icons", icon: ImageIcon, phase: 4, status: "scaffolded" },
  { id: "screenshot", name: "Screenshot Studio", tagline: "Capture · crop · mockup", icon: Camera, phase: 4, status: "scaffolded" },
  { id: "design-inspector", name: "Design Inspector", tagline: "Full design DNA", icon: Search, phase: 5, status: "scaffolded" },
  { id: "tech-stack", name: "Tech Stack", tagline: "Framework · CMS · CDN", icon: Cpu, phase: 5, status: "scaffolded" },
  { id: "resource-hub", name: "Resource Hub", tagline: "Icons · fonts · mockups", icon: Layers, phase: 6, status: "scaffolded" },
];

export const MODULES_BY_ID = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
) as Record<ModuleId, ModuleMeta>;
