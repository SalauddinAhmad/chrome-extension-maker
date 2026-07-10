// LeadPilot — multi-format export: XLSX (SheetJS), CSV, JSON.
// Uses global XLSX (loaded via <script src="src/xlsx.full.min.js">).

function flatten(leads) {
  return leads.map((l) => ({
    Name: l.displayName?.text || "",
    Category: l.primaryType || (l.types || [])[0] || "",
    Types: (l.types || []).join(", "),
    Rating: l.rating || "",
    Reviews: l.userRatingCount || 0,
    Price: l.priceLevel || "",
    Status: l.businessStatus || "",
    Phone: l.internationalPhoneNumber || l.nationalPhoneNumber || "",
    Email: (l._contacts?.emails || []).join("; "),
    Website: l.websiteUri || "",
    SSL: l.websiteUri ? (/^https:/i.test(l.websiteUri) ? "yes" : "no") : "",
    Address: l.formattedAddress || "",
    Latitude: l.location?.latitude || "",
    Longitude: l.location?.longitude || "",
    PlusCode: l.plusCode?.globalCode || "",
    Facebook: l._contacts?.socials?.facebook || "",
    Instagram: l._contacts?.socials?.instagram || "",
    LinkedIn: l._contacts?.socials?.linkedin || "",
    Twitter: l._contacts?.socials?.twitter || "",
    YouTube: l._contacts?.socials?.youtube || "",
    TikTok: l._contacts?.socials?.tiktok || "",
    Score: l._score?.score ?? "",
    Temperature: l._score?.temperature ?? "",
    Opportunities: (l._score?.signals || []).filter((s) => s.k === "opp").map((s) => s.v).join(" | "),
    Risks: (l._score?.signals || []).filter((s) => s.k === "risk").map((s) => s.v).join(" | "),
    GoogleMapsUrl: l.googleMapsUri || "",
    PlaceId: l.id || "",
  }));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function exportXlsx(leads, query = "leads") {
  const rows = flatten(leads);
  const ws = XLSX.utils.json_to_sheet(rows);
  // Auto column widths
  const cols = Object.keys(rows[0] || {}).map((k) => ({
    wch: Math.min(40, Math.max(k.length + 2, ...rows.map((r) => String(r[k] || "").length))),
  }));
  ws["!cols"] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  // Opportunities pivot sheet
  const opps = [];
  leads.forEach((l) => {
    (l._score?.signals || []).forEach((s) => {
      if (s.k === "opp") {
        opps.push({
          Name: l.displayName?.text || "",
          Category: l.primaryType || "",
          Score: l._score?.score,
          Temperature: l._score?.temperature,
          Opportunity: s.v,
          Phone: l.internationalPhoneNumber || l.nationalPhoneNumber || "",
          Website: l.websiteUri || "",
        });
      }
    });
  });
  if (opps.length) {
    const wsO = XLSX.utils.json_to_sheet(opps);
    XLSX.utils.book_append_sheet(wb, wsO, "Opportunities");
  }

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(new Blob([out], { type: "application/octet-stream" }), `leadpilot-${slug(query)}-${today()}.xlsx`);
}

export function exportCsv(leads, query = "leads") {
  const rows = flatten(leads);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(",")),
  ].join("\n");
  download(new Blob([csv], { type: "text/csv;charset=utf-8" }), `leadpilot-${slug(query)}-${today()}.csv`);
}

export function exportJson(leads, query = "leads") {
  download(
    new Blob([JSON.stringify(leads, null, 2)], { type: "application/json" }),
    `leadpilot-${slug(query)}-${today()}.json`
  );
}

function csvCell(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "leads";
}
