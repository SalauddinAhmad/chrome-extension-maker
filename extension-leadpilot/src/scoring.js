// LeadPilot — Live Lead Score (0-100) + Temperature engine.
// Pure functions; no I/O. Runs on any Place shape we produce in places.js.

export function scoreLead(lead) {
  const signals = [];
  let score = 50;

  // Rating & review depth
  if (typeof lead.rating === "number") {
    if (lead.rating >= 4.5) { score += 8; signals.push({ k: "quality", v: "High rating" }); }
    else if (lead.rating >= 4.0) { score += 4; }
    else if (lead.rating < 3.5 && lead.rating > 0) { score -= 6; signals.push({ k: "risk", v: "Low rating" }); }
  }
  const reviews = lead.userRatingCount || 0;
  if (reviews >= 500) { score += 6; signals.push({ k: "reach", v: "500+ reviews" }); }
  else if (reviews >= 100) score += 3;
  else if (reviews < 10) { score -= 4; signals.push({ k: "gap", v: "Few reviews" }); }

  // Website & digital presence — opportunity signals
  if (!lead.websiteUri) { score += 12; signals.push({ k: "opp", v: "No website" }); }
  if (lead.websiteUri && !/^https:/i.test(lead.websiteUri)) {
    score += 6; signals.push({ k: "opp", v: "No SSL (http://)" });
  }
  if (!lead.internationalPhoneNumber && !lead.nationalPhoneNumber) {
    score -= 4; signals.push({ k: "gap", v: "No phone listed" });
  }

  // Business activity
  if (lead.businessStatus && lead.businessStatus !== "OPERATIONAL") {
    score -= 20; signals.push({ k: "risk", v: lead.businessStatus });
  }
  if (lead.currentOpeningHours?.openNow === true) { score += 2; }

  // Category-based upsell hint
  const cats = (lead.types || []).join(" ");
  if (/restaurant|cafe|bakery|bar|food/.test(cats) && !lead.websiteUri) {
    signals.push({ k: "opp", v: "Restaurant w/o site — high CVR" });
    score += 4;
  }
  if (/dentist|lawyer|doctor|clinic|salon|spa/.test(cats)) {
    signals.push({ k: "opp", v: "High-LTV vertical" });
    score += 3;
  }

  // Price level (ability to pay)
  const price = lead.priceLevel;
  if (price === "PRICE_LEVEL_EXPENSIVE" || price === "PRICE_LEVEL_VERY_EXPENSIVE") {
    score += 4; signals.push({ k: "budget", v: "Premium price tier" });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let temperature = "cold";
  if (score >= 75) temperature = "hot";
  else if (score >= 55) temperature = "warm";

  return { score, temperature, signals };
}

export function tempClass(t) {
  return t === "hot" ? "score-hot" : t === "warm" ? "score-warm" : "score-cold";
}
