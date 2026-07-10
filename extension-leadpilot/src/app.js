// LeadPilot — main UI controller (shared by popup + sidepanel).
import { searchTextAll } from "./places.js";
import { scoreLead, tempClass } from "./scoring.js";
import { harvestContacts } from "./harvest.js";
import { exportXlsx, exportCsv, exportJson } from "./export.js";

const els = {};
const state = {
  leads: [],
  loading: false,
  filter: "all", // all|hot|warm|cold
  query: "",
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cache([
    "search", "region", "runBtn", "results", "empty",
    "statTotal", "statHot", "statWarm", "statCold",
    "filterAll", "filterHot", "filterWarm", "filterCold",
    "exportXlsx", "exportCsv", "exportJson",
    "status", "openOptions", "clearBtn",
    "tabFind", "tabResults", "panelFind", "panelResults",
  ]);

  // Restore last session
  const cached = await chrome.storage.local.get(["lastLeads", "lastQuery", "lastRegion"]);
  if (cached.lastLeads?.length) {
    state.leads = cached.lastLeads;
    state.query = cached.lastQuery || "";
    render();
    activateTab("results");
  }
  if (cached.lastQuery) els.search.value = cached.lastQuery;
  if (cached.lastRegion) els.region.value = cached.lastRegion;

  els.runBtn.addEventListener("click", runSearch);
  els.search.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });
  els.exportXlsx.addEventListener("click", () => exportXlsx(filtered(), state.query));
  els.exportCsv.addEventListener("click", () => exportCsv(filtered(), state.query));
  els.exportJson.addEventListener("click", () => exportJson(filtered(), state.query));
  els.clearBtn.addEventListener("click", clearAll);
  els.openOptions.addEventListener("click", (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
  [["filterAll","all"],["filterHot","hot"],["filterWarm","warm"],["filterCold","cold"]].forEach(([id, k]) => {
    els[id].addEventListener("click", () => { state.filter = k; render(); highlightFilter(); });
  });
  els.tabFind.addEventListener("click", () => activateTab("find"));
  els.tabResults.addEventListener("click", () => activateTab("results"));

  // Warn if key missing
  const { placesApiKey } = await chrome.storage.local.get(["placesApiKey"]);
  if (!placesApiKey) {
    setStatus("No Google Places API key set. Open Options to add one.", "err");
  } else {
    setStatus("Ready.", "ok");
  }
  highlightFilter();
}

function cache(ids) { ids.forEach((id) => (els[id] = document.getElementById(id))); }

function activateTab(name) {
  const isFind = name === "find";
  els.tabFind.classList.toggle("active", isFind);
  els.tabResults.classList.toggle("active", !isFind);
  els.panelFind.classList.toggle("active", isFind);
  els.panelResults.classList.toggle("active", !isFind);
}

function highlightFilter() {
  [["filterAll","all"],["filterHot","hot"],["filterWarm","warm"],["filterCold","cold"]].forEach(([id, k]) => {
    els[id].classList.toggle("btn-primary", state.filter === k);
    els[id].classList.toggle("btn-ghost", state.filter !== k);
  });
}

async function runSearch() {
  const q = els.search.value.trim();
  if (!q) { setStatus("Type a search — e.g. 'dentists in Dhaka'.", "err"); return; }
  if (state.loading) return;
  state.loading = true;
  els.runBtn.disabled = true;
  els.runBtn.innerHTML = '<span class="spinner"></span> Searching…';
  setStatus("Calling Google Places API (New)…");
  try {
    const region = (els.region.value || "").trim().toLowerCase().slice(0, 2) || undefined;
    const raw = await searchTextAll({ query: q, region, maxResults: 60 });
    const enriched = raw.map((p) => {
      const contacts = harvestContacts(
        [p.editorialSummary?.text, p.websiteUri].filter(Boolean).join(" ")
      );
      const scored = scoreLead(p);
      return { ...p, _contacts: contacts, _score: scored };
    });
    enriched.sort((a, b) => (b._score.score || 0) - (a._score.score || 0));
    state.leads = enriched;
    state.query = q;
    await chrome.storage.local.set({ lastLeads: enriched, lastQuery: q, lastRegion: region || "" });
    setStatus(`Found ${enriched.length} leads.`, "ok");
    render();
    activateTab("results");
  } catch (err) {
    console.error(err);
    if (String(err.message).includes("MISSING_API_KEY")) {
      setStatus("Set your Google Places API key in Options.", "err");
    } else {
      setStatus(String(err.message), "err");
    }
  } finally {
    state.loading = false;
    els.runBtn.disabled = false;
    els.runBtn.innerHTML = "Find Leads";
  }
}

function filtered() {
  if (state.filter === "all") return state.leads;
  return state.leads.filter((l) => l._score?.temperature === state.filter);
}

function render() {
  const leads = filtered();
  const counts = {
    total: state.leads.length,
    hot: state.leads.filter((l) => l._score?.temperature === "hot").length,
    warm: state.leads.filter((l) => l._score?.temperature === "warm").length,
    cold: state.leads.filter((l) => l._score?.temperature === "cold").length,
  };
  els.statTotal.textContent = counts.total;
  els.statHot.textContent = counts.hot;
  els.statWarm.textContent = counts.warm;
  els.statCold.textContent = counts.cold;

  if (!leads.length) {
    els.results.innerHTML = "";
    els.empty.style.display = "block";
    els.empty.innerHTML = state.leads.length
      ? `<h3>No ${state.filter} leads</h3><p>Try another filter or run a new search.</p>`
      : `<h3>No leads yet</h3><p>Run a search on the Find tab to get started.</p>`;
    return;
  }
  els.empty.style.display = "none";
  els.results.innerHTML = leads.map(renderLead).join("");
  els.results.querySelectorAll("[data-open]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: a.dataset.open });
    });
  });
}

function renderLead(l) {
  const s = l._score || { score: 0, temperature: "cold", signals: [] };
  const cls = tempClass(s.temperature);
  const phone = l.internationalPhoneNumber || l.nationalPhoneNumber || "";
  const email = (l._contacts?.emails || [])[0] || "";
  const opps = (s.signals || []).filter((x) => x.k === "opp").map((x) => x.v).slice(0, 2).join(" · ");
  return `
    <div class="lead">
      <div>
        <div class="lead-title">${esc(l.displayName?.text || "Untitled")}</div>
        <div class="lead-meta">
          <span>${esc(l.primaryType || (l.types || [])[0] || "—")}</span>
          ${l.rating ? `<span class="dot">★ ${l.rating} · ${l.userRatingCount || 0}</span>` : ""}
          ${phone ? `<span class="dot">${esc(phone)}</span>` : ""}
          ${l.websiteUri ? `<span class="dot"><a href="#" data-open="${esc(l.websiteUri)}">${esc(hostOf(l.websiteUri))}</a></span>` : `<span class="dot" style="color:var(--warm)">no website</span>`}
        </div>
        ${l.formattedAddress ? `<div class="lead-meta" style="margin-top:2px">${esc(l.formattedAddress)}</div>` : ""}
        ${opps ? `<div class="lead-meta" style="margin-top:4px;color:var(--accent-2)">opps · ${esc(opps)}</div>` : ""}
        ${email ? `<div class="lead-meta">${esc(email)}</div>` : ""}
      </div>
      <div class="lead-actions">
        <span class="score-pill ${cls}"><span class="temp-dot"></span>${s.score}</span>
        ${l.googleMapsUri ? `<button class="btn btn-sm btn-ghost" data-open="${esc(l.googleMapsUri)}">Maps</button>` : ""}
      </div>
    </div>
  `;
}

async function clearAll() {
  state.leads = []; state.query = "";
  await chrome.storage.local.remove(["lastLeads", "lastQuery"]);
  render();
  setStatus("Cleared.");
}

function setStatus(msg, kind) {
  els.status.textContent = msg;
  els.status.className = kind === "ok" ? "status-ok" : kind === "err" ? "status-err" : "";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function hostOf(u) { try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; } }
