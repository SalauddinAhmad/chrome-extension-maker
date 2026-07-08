export type TechCategory =
  | "framework"
  | "cms"
  | "ecommerce"
  | "ui"
  | "analytics"
  | "cdn"
  | "hosting"
  | "font"
  | "tag-manager";

export interface DetectedTech {
  name: string;
  category: TechCategory;
  evidence: string;
  confidence: "high" | "medium" | "low";
  url?: string;
}

export interface TechReport {
  url: string;
  title: string;
  items: DetectedTech[];
  scriptHosts: string[];
  scannedAt: number;
}
