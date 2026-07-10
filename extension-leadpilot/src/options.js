const $ = (id) => document.getElementById(id);

(async () => {
  const { placesApiKey } = await chrome.storage.local.get(["placesApiKey"]);
  if (placesApiKey) $("apiKey").value = placesApiKey;
})();

$("save").addEventListener("click", async () => {
  const key = $("apiKey").value.trim();
  if (!key) return status("Enter a key first.", "err");
  await chrome.storage.local.set({ placesApiKey: key });
  status("Saved.", "ok");
});

$("clear").addEventListener("click", async () => {
  await chrome.storage.local.remove(["placesApiKey"]);
  $("apiKey").value = "";
  status("Key removed.", "ok");
});

$("test").addEventListener("click", async () => {
  const key = $("apiKey").value.trim();
  if (!key) return status("Enter a key first.", "err");
  status("Testing…");
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName",
      },
      body: JSON.stringify({ textQuery: "coffee", pageSize: 1 }),
    });
    const body = await res.text();
    if (res.ok) status("Connection OK — key works.", "ok");
    else status(`Failed [${res.status}]: ${body.slice(0, 200)}`, "err");
  } catch (e) {
    status(String(e.message || e), "err");
  }
});

function status(msg, kind) {
  const el = $("status");
  el.textContent = msg;
  el.style.color = kind === "err" ? "var(--danger)" : kind === "ok" ? "var(--good)" : "var(--text-muted)";
}
