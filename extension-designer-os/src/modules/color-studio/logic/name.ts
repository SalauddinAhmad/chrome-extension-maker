/**
 * Nearest common color name via squared Euclidean distance in sRGB.
 * Small curated dictionary — enough to label a picked color without shipping
 * a 6 MB CSS4 corpus. Extend as needed; keep entries tokenizable.
 */
import { hexToRgb, type RGB } from "./convert";

const NAMES: Array<[string, string]> = [
  ["#000000", "Black"], ["#FFFFFF", "White"], ["#808080", "Gray"],
  ["#F5F5F5", "Whitesmoke"], ["#1F2937", "Slate"], ["#0F172A", "Midnight"],
  ["#EF4444", "Red"], ["#F97316", "Orange"], ["#F59E0B", "Amber"],
  ["#EAB308", "Yellow"], ["#84CC16", "Lime"], ["#22C55E", "Green"],
  ["#10B981", "Emerald"], ["#14B8A6", "Teal"], ["#06B6D4", "Cyan"],
  ["#0EA5E9", "Sky"], ["#3B82F6", "Blue"], ["#6366F1", "Indigo"],
  ["#8B5CF6", "Violet"], ["#A855F7", "Purple"], ["#D946EF", "Fuchsia"],
  ["#EC4899", "Pink"], ["#F43F5E", "Rose"], ["#78350F", "Brown"],
  ["#FDE68A", "Cream"], ["#4F46E5", "Royal Indigo"],
];

const PARSED: Array<{ rgb: RGB; name: string }> = NAMES.map(([hex, name]) => ({
  rgb: hexToRgb(hex),
  name,
}));

export function nearestName(rgb: RGB): string {
  let best = PARSED[0];
  let bestD = Infinity;
  for (const entry of PARSED) {
    const dr = entry.rgb.r - rgb.r;
    const dg = entry.rgb.g - rgb.g;
    const db = entry.rgb.b - rgb.b;
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) { bestD = d; best = entry; }
  }
  return best.name;
}
