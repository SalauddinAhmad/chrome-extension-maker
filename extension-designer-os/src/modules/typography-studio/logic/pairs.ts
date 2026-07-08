/**
 * Curated font pairings. Small, opinionated seed set — user can add more later.
 */
export interface FontPairSeed {
  id: string;
  heading: string;
  body: string;
  mood: string;
  category: "editorial" | "modern" | "minimal" | "playful" | "brutal";
}

export const FONT_PAIRS: FontPairSeed[] = [
  { id: "syne-jakarta",   heading: "Syne",           body: "Plus Jakarta Sans", mood: "Editorial + geometric", category: "editorial" },
  { id: "playfair-inter", heading: "Playfair Display", body: "Inter",           mood: "Classic + neutral",     category: "editorial" },
  { id: "space-ibm",      heading: "Space Grotesk",  body: "IBM Plex Sans",     mood: "Techy + readable",      category: "modern" },
  { id: "manrope-manrope", heading: "Manrope",       body: "Manrope",           mood: "One family, two weights", category: "minimal" },
  { id: "fraunces-inter", heading: "Fraunces",       body: "Inter",             mood: "Warm serif + clean sans", category: "editorial" },
  { id: "dm-serif-dm-sans", heading: "DM Serif Display", body: "DM Sans",       mood: "High-contrast display",   category: "modern" },
  { id: "archivo-archivo", heading: "Archivo Black", body: "Archivo",           mood: "Brutal + confident",    category: "brutal" },
  { id: "caveat-nunito",  heading: "Caveat",         body: "Nunito",            mood: "Playful + friendly",    category: "playful" },
];

/**
 * Build a Google Fonts stylesheet URL for a list of families.
 * Loaded lazily and only when the user opens Pairs — matches "Privacy First"
 * (no fonts loaded until the user actively looks at pairings).
 */
export function buildGoogleFontsHref(families: string[]): string {
  const params = families
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;600;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
