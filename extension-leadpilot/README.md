# LeadPilot AI — Chrome Extension

Premium, **ToS-clean** alternative to Google Maps DOM scrapers (Leads Sniper, etc).
Runs on the official **Google Places API (New)** — no scraping, no CAPTCHA bypass, no
license server.

## Features

- **Legal Places search** (Text + Nearby, up to 60 leads/query via auto-pagination)
- **Live 0-100 Lead Score** with temperature signals: Hot / Warm / Cold
- **Opportunity flags**: no website, no SSL, no phone, few reviews, premium price tier, high-LTV vertical
- **Contact harvesting** (email regex + FB/IG/LinkedIn/X/YouTube/TikTok patterns)
- **Multi-format export**:
  - **XLSX** — full flat sheet + auto-generated *Opportunities* pivot sheet
  - **CSV** — pivot-ready
  - **JSON** — raw, developer-friendly
- **Side Panel + Popup**, dark Linear-style UI
- **100% local** — data never leaves your browser, key stored in `chrome.storage.local`

## Install (unpacked)

1. Download / unzip this folder.
2. Open `chrome://extensions` → toggle **Developer mode** (top-right).
3. Click **Load unpacked** → select the `extension-leadpilot/` folder.
4. Pin the LeadPilot icon → click it → open **Options** → paste your **Google Places API (New)** key.

## Get an API key

1. https://console.cloud.google.com/google/maps-apis/credentials
2. Create a project (or reuse one) → enable **Places API (New)**.
3. Create a Key. Optionally restrict it to Places API and to your IP.
4. Paste it in LeadPilot Options → **Test connection** → **Save**.

Google gives $200/month free credit — this typically covers thousands of Places
searches per month at zero cost.

## Legal / ToS

LeadPilot only calls Google's official Places API (New) with your own key.
It does **not** scrape google.com/maps, does not touch DOM, and does not
bypass any protection. You are the API caller; Google's Places API TOS apply
to you directly.

## License

MIT.
