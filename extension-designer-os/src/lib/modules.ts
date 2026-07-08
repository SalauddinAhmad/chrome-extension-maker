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
  Settings as SettingsIcon,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "projects"
  | "color-studio"
  | "typography-studio"
  | "design-inspector"
  | "inspiration-vault"
  | "asset-extractor"
  | "resource-hub"
  | "notes"
  | "tech-stack"
  | "screenshot"
  | "settings";

export type ModulePhase = 1 | 2 | 3 | 4 | 5 | 6;
export type ModuleGroup = "dashboard" | "workspace" | "tools" | "library" | "utilities";

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  phase: ModulePhase;
  status: "scaffolded" | "in-progress" | "ready";
  group: ModuleGroup;
}

export const MODULES: ModuleMeta[] = [
  { id: "dashboard", name: "Home", tagline: "Workspace overview", icon: LayoutDashboard, phase: 1, status: "ready", group: "dashboard" },
  { id: "projects", name: "Projects", tagline: "Organize by client · brief", icon: FolderKanban, phase: 1, status: "ready", group: "workspace" },
  { id: "color-studio", name: "Color Studio", tagline: "Pick · palette · gradient", icon: Palette, phase: 2, status: "ready", group: "tools" },
  { id: "typography-studio", name: "Typography", tagline: "Detect · pair · scale", icon: Type, phase: 2, status: "ready", group: "tools" },
  { id: "design-inspector", name: "Design Inspector", tagline: "Full design DNA", icon: Search, phase: 5, status: "ready", group: "tools" },
  { id: "screenshot", name: "Screenshot Studio", tagline: "Capture · crop · mockup", icon: Camera, phase: 4, status: "ready", group: "tools" },
  { id: "inspiration-vault", name: "Inspiration Vault", tagline: "Save · tag · moodboard", icon: Bookmark, phase: 3, status: "ready", group: "library" },
  { id: "asset-extractor", name: "Asset Manager", tagline: "Images · SVG · icons", icon: ImageIcon, phase: 4, status: "ready", group: "library" },
  { id: "notes", name: "Notes", tagline: "Ideas · briefs · todos", icon: StickyNote, phase: 3, status: "ready", group: "library" },
  { id: "resource-hub", name: "Resource Hub", tagline: "Icons · fonts · mockups", icon: Layers, phase: 6, status: "ready", group: "library" },
  { id: "tech-stack", name: "Tech Stack", tagline: "Framework · CMS · CDN", icon: Cpu, phase: 5, status: "ready", group: "utilities" },
  { id: "settings", name: "Settings", tagline: "Theme · data · backup", icon: SettingsIcon, phase: 6, status: "ready", group: "utilities" },
];

export const MODULES_BY_ID = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
) as Record<ModuleId, ModuleMeta>;

export const MODULE_GROUPS: Array<{ id: ModuleGroup; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "workspace", label: "Workspace" },
  { id: "tools", label: "Tools" },
  { id: "library", label: "Library" },
  { id: "utilities", label: "Utilities" },
];
