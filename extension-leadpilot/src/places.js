// LeadPilot — Google Places API (New) wrapper.
// Legal, ToS-clean. Uses X-Goog-Api-Key header. User's own key.

const BASE = "https://places.googleapis.com/v1";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.plusCode",
  "places.types",
  "places.primaryType",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.businessStatus",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.regularOpeningHours",
  "places.currentOpeningHours",
  "places.editorialSummary",
  "nextPageToken",
].join(",");

async function getApiKey() {
  const { placesApiKey } = await chrome.storage.local.get(["placesApiKey"]);
  if (!placesApiKey) throw new Error("MISSING_API_KEY");
  return placesApiKey;
}

async function callPlaces(path, body) {
  const apiKey = await getApiKey();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { msg = JSON.parse(text)?.error?.message || text; } catch {}
    throw new Error(`Places API ${res.status}: ${msg}`);
  }
  return JSON.parse(text);
}

export async function searchText({ query, region, pageToken, maxResults = 20 }) {
  const body = { textQuery: query, pageSize: Math.min(20, maxResults) };
  if (region) body.regionCode = region;
  if (pageToken) body.pageToken = pageToken;
  return callPlaces("/places:searchText", body);
}

export async function searchNearby({ lat, lng, radius = 2000, includedTypes = [], maxResults = 20 }) {
  const body = {
    maxResultCount: Math.min(20, maxResults),
    locationRestriction: {
      circle: { center: { latitude: lat, longitude: lng }, radius },
    },
  };
  if (includedTypes.length) body.includedTypes = includedTypes;
  return callPlaces("/places:searchNearby", body);
}

// Auto-paginate up to `maxResults` (Places caps at 60 total = 3 pages of 20).
export async function searchTextAll({ query, region, maxResults = 60 }) {
  const all = [];
  let token;
  for (let i = 0; i < 3 && all.length < maxResults; i++) {
    const res = await searchText({ query, region, pageToken: token, maxResults });
    (res.places || []).forEach((p) => all.push(p));
    token = res.nextPageToken;
    if (!token) break;
    // Places requires a short pause before nextPageToken becomes valid.
    await new Promise((r) => setTimeout(r, 1500));
  }
  return all.slice(0, maxResults);
}
