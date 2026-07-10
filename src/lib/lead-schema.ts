/**
 * LeadPilot canonical Lead schema.
 *
 * Field set is intentionally aligned with what a Google-Maps-scale
 * extractor (e.g. Leads Sniper's Maps DOM harvest) captures per business,
 * but sourced legally via Google Places API (New) + Firecrawl website
 * enrichment. Every field is optional except id/name so partial extracts
 * (Places-only, Places+enrich, imported CSV) all round-trip cleanly.
 *
 * Source mapping (when wired to real APIs):
 *   name, category, rating, reviews, address, phone,
 *   website, lat, lng, placeId, plusCode, hours, priceLevel
 *     ← Places API (New) `places.get` / `places:searchText` FieldMask
 *
 *   email, socials.{facebook,instagram,linkedin,twitter,youtube},
 *   ssl, techStack, hasContactForm
 *     ← Firecrawl `/scrape` on `website` → regex + link harvest
 *
 *   score, temp, opps
 *     ← LeadPilot scoring engine (derived, not scraped)
 */

export type LeadTemperature = "hot" | "warm" | "cold";

export type LeadSocials = {
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  youtube?: string | null;
};

export type Lead = {
  /* identity */
  id: string;
  name: string;

  /* Places API core */
  category?: string;
  city?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  phone?: string | null;
  website?: string | null;
  lat?: number | null;
  lng?: number | null;
  placeId?: string | null;
  plusCode?: string | null;
  hours?: string | null;
  priceLevel?: number | null;

  /* Firecrawl website enrichment */
  email?: string | null;
  socials?: LeadSocials;
  ssl?: boolean;
  techStack?: string[];

  /* LeadPilot derived */
  score?: number;
  temp?: LeadTemperature;
  opps?: string[];
};

/**
 * Email harvesting regex — mirrors what Leads Sniper's content script
 * runs on discovered websites, applied server-side to Firecrawl markdown
 * instead of DOM-scraping in the browser.
 */
export const EMAIL_REGEX =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

export const SOCIAL_PATTERNS: Record<keyof LeadSocials, RegExp> = {
  facebook: /https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9._-]+/i,
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._-]+/i,
  linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[A-Za-z0-9._-]+/i,
  twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9._-]+/i,
  youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:@|c\/|channel\/|user\/)[A-Za-z0-9._-]+/i,
};

/** Extract emails + socials from arbitrary text (Firecrawl markdown/HTML). */
export function harvestContacts(text: string): {
  emails: string[];
  socials: LeadSocials;
} {
  const emails = Array.from(new Set(text.match(EMAIL_REGEX) ?? []))
    .filter((e) => !/\.(png|jpg|jpeg|svg|gif|webp)$/i.test(e))
    .filter((e) => !/@(sentry|wixpress|example|test)\./i.test(e));

  const socials: LeadSocials = {};
  for (const key of Object.keys(SOCIAL_PATTERNS) as Array<keyof LeadSocials>) {
    const m = text.match(SOCIAL_PATTERNS[key]);
    if (m) socials[key] = m[0];
  }
  return { emails, socials };
}
