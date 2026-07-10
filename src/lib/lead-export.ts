/**
 * XLSX export for LeadPilot — SheetJS.
 * Two sheets: "Leads" (flat table) and "Opportunities" (one row per opp).
 */
import * as XLSX from "xlsx";
import type { Lead } from "./lead-schema";

function flat(l: Lead) {
  const s = l.socials ?? {};
  return {
    Name: l.name,
    Category: l.category ?? "",
    City: l.city ?? "",
    Address: l.address ?? "",
    Rating: l.rating ?? "",
    Reviews: l.reviews ?? "",
    Phone: l.phone ?? "",
    Email: l.email ?? "",
    Website: l.website ?? "",
    SSL: l.ssl === undefined ? "" : l.ssl ? "Yes" : "No",
    Latitude: l.lat ?? "",
    Longitude: l.lng ?? "",
    "Plus Code": l.plusCode ?? "",
    Hours: l.hours ?? "",
    "Place ID": l.placeId ?? "",
    Facebook: s.facebook ?? "",
    Instagram: s.instagram ?? "",
    LinkedIn: s.linkedin ?? "",
    Twitter: s.twitter ?? "",
    YouTube: s.youtube ?? "",
    "Tech Stack": (l.techStack ?? []).join(", "),
    Score: l.score ?? "",
    Temperature: l.temp ?? "",
    Opportunities: (l.opps ?? []).join(" · "),
  };
}

export function exportLeadsXLSX(leads: Lead[], filename = "leadpilot-leads.xlsx") {
  const wb = XLSX.utils.book_new();

  const leadsSheet = XLSX.utils.json_to_sheet(leads.map(flat));
  leadsSheet["!cols"] = [
    { wch: 26 }, { wch: 18 }, { wch: 14 }, { wch: 34 }, { wch: 8 },
    { wch: 10 }, { wch: 20 }, { wch: 28 }, { wch: 26 }, { wch: 6 },
    { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 28 },
    { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 28 },
    { wch: 26 }, { wch: 8 }, { wch: 12 }, { wch: 44 },
  ];
  XLSX.utils.book_append_sheet(wb, leadsSheet, "Leads");

  const oppRows = leads.flatMap((l) =>
    (l.opps ?? []).map((o) => ({
      Business: l.name,
      City: l.city ?? "",
      Score: l.score ?? "",
      Temperature: l.temp ?? "",
      Opportunity: o,
      Website: l.website ?? "",
      Phone: l.phone ?? "",
      Email: l.email ?? "",
    })),
  );
  if (oppRows.length) {
    const oppSheet = XLSX.utils.json_to_sheet(oppRows);
    oppSheet["!cols"] = [
      { wch: 26 }, { wch: 14 }, { wch: 8 }, { wch: 12 },
      { wch: 30 }, { wch: 26 }, { wch: 20 }, { wch: 28 },
    ];
    XLSX.utils.book_append_sheet(wb, oppSheet, "Opportunities");
  }

  XLSX.writeFile(wb, filename);
}
