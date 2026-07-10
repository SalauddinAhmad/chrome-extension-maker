// LeadPilot — contact harvesting patterns (email + socials).
// Pure regex; use on any text blob (place description, website markdown).

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const OBFUSCATED_RE = /\b([A-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|\s+at\s+)\s*([A-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\s+dot\s+)\s*([A-Z]{2,})\b/gi;

const SOCIALS = {
  facebook: /https?:\/\/(?:www\.)?(?:facebook|fb)\.com\/[A-Za-z0-9_.\-\/]+/gi,
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9_.\-]+/gi,
  linkedin: /https?:\/\/(?:www\.)?linkedin\.com\/(?:in|company)\/[A-Za-z0-9_.\-\/]+/gi,
  twitter: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_.\-]+/gi,
  youtube: /https?:\/\/(?:www\.)?youtube\.com\/(?:c\/|channel\/|user\/|@)?[A-Za-z0-9_.\-]+/gi,
  tiktok: /https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9_.\-]+/gi,
};

const BLOCKED_EMAIL = /(sentry|wixpress|example\.com|@2x|noreply|no-reply)/i;

export function harvestContacts(text = "") {
  if (!text || typeof text !== "string") return { emails: [], socials: {} };

  const emails = new Set();
  (text.match(EMAIL_RE) || []).forEach((e) => {
    if (!BLOCKED_EMAIL.test(e)) emails.add(e.toLowerCase());
  });
  let m;
  while ((m = OBFUSCATED_RE.exec(text)) !== null) {
    emails.add(`${m[1]}@${m[2]}.${m[3]}`.toLowerCase());
  }

  const socials = {};
  for (const [k, re] of Object.entries(SOCIALS)) {
    const found = Array.from(new Set(text.match(re) || []));
    if (found.length) socials[k] = found[0];
  }
  return { emails: Array.from(emails), socials };
}
