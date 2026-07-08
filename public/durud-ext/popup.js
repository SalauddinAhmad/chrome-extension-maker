// Durud Reminder v2.0 — Premium popup
const DEFAULT_SETTINGS = {
  enabled: true,
  interval: 15,
  durudId: "ibrahim",
  dnd: true,
  friday: true,
  idleOnly: false,
  audioEnabled: true,
  audioChoice: "random",
  volume: 0.9,
};

const state = {
  duruds: [],
  settings: { ...DEFAULT_SETTINGS },
  currentIndex: 0,
};

const $ = (s) => document.querySelector(s);
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

let previewAudio = null;

async function loadDuruds() {
  const res = await fetch(chrome.runtime.getURL("data/duruds.json"));
  state.duruds = await res.json();
}

async function loadStorage() {
  const data = await chrome.storage.local.get(["settings"]);
  state.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

async function saveSettings() {
  showSaving();
  await chrome.storage.local.set({ settings: state.settings });
  chrome.runtime.sendMessage({ type: "settings-updated" });
  setTimeout(hideSaving, 500);
}

function showSaving() {
  $("#save-text").textContent = "Saving…";
  $("#save-icon").classList.add("spin");
}
function hideSaving() {
  $("#save-text").textContent = "Auto-saved";
  $("#save-icon").classList.remove("spin");
}

function intervalToLabel(min) {
  if (min < 60) return `${toBn(min)} মিনিট`;
  if (min === 60) return "১ ঘণ্টা";
  if (min === 90) return "১.৫ ঘণ্টা";
  return `${toBn(min / 60)} ঘণ্টা`;
}

function renderDurud() {
  const d =
    state.duruds.find((x) => x.id === state.settings.durudId) ||
    state.duruds[0];
  state.currentIndex = state.duruds.indexOf(d);
  $("#durud-name").textContent = d.name;
  $("#durud-arabic").textContent = d.arabic;
  $("#durud-translit").textContent = d.translit;
  $("#durud-bangla").textContent = d.bangla;
  $("#durud-ref").textContent = d.reference;
}

function renderSettings() {
  $("#toggle-enabled").checked = state.settings.enabled;
  $("#interval-select").value = String(state.settings.interval);
  $("#interval-val").textContent = intervalToLabel(state.settings.interval);
  $("#toggle-dnd").checked = state.settings.dnd;
  $("#toggle-friday").checked = state.settings.friday;
  $("#toggle-idle").checked = state.settings.idleOnly;
  $("#toggle-audio").checked = state.settings.audioEnabled;
  $("#select-audio").value = String(state.settings.audioChoice ?? "random");
  const volPct = Math.round((state.settings.volume ?? 0.9) * 100);
  $("#volume").value = volPct;
  $("#volume-val").textContent = `${toBn(volPct)}%`;
  const sel = $("#select-durud");
  sel.innerHTML = state.duruds
    .map((d) => `<option value="${d.id}">${d.name}</option>`)
    .join("");
  sel.value = state.settings.durudId;
  $("#hero-status").textContent = state.settings.enabled ? "চালু" : "বন্ধ";
  $("#hero-status").classList.toggle("off", !state.settings.enabled);
}

async function renderNext() {
  const alarms = await chrome.alarms.getAll();
  const a = alarms.find((x) => x.name === "durud-reminder");
  if (!a || !state.settings.enabled) {
    $("#next-time").textContent = state.settings.enabled ? "শীঘ্রই" : "--:--";
    return;
  }
  const t = new Date(a.scheduledTime);
  const h = t.getHours() % 12 || 12;
  const m = String(t.getMinutes()).padStart(2, "0");
  const ap = t.getHours() >= 12 ? "PM" : "AM";
  $("#next-time").textContent = `${toBn(h)}:${toBn(m)} ${ap}`;
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1600);
}

function getAudioFile(choice) {
  const files = [
    "durud1.mp3","durud2.mp3","durud3.mp3","durud4.mp3","durud5.mp3",
    "durud6.mp3","durud7.mp3","durud8.mp3","durud9.mp3",
  ];
  if (choice === "random" || choice == null)
    return files[Math.floor(Math.random() * files.length)];
  const i = parseInt(choice, 10);
  return files[isNaN(i) ? 0 : Math.max(0, Math.min(8, i))];
}

function bindAll() {
  // Enable toggle
  $("#toggle-enabled").addEventListener("change", async (e) => {
    state.settings.enabled = e.target.checked;
    await saveSettings();
    renderSettings();
    setTimeout(renderNext, 300);
  });

  // Interval
  $("#interval-select").addEventListener("change", async (e) => {
    state.settings.interval = parseInt(e.target.value, 10);
    $("#interval-val").textContent = intervalToLabel(state.settings.interval);
    await saveSettings();
    setTimeout(renderNext, 300);
  });

  // Durud select
  $("#select-durud").addEventListener("change", async (e) => {
    state.settings.durudId = e.target.value;
    await saveSettings();
    renderDurud();
  });

  // Prev/Next/Copy
  $("#btn-prev").addEventListener("click", async () => {
    state.currentIndex =
      (state.currentIndex - 1 + state.duruds.length) % state.duruds.length;
    state.settings.durudId = state.duruds[state.currentIndex].id;
    await saveSettings();
    renderDurud();
    $("#select-durud").value = state.settings.durudId;
  });
  $("#btn-next").addEventListener("click", async () => {
    state.currentIndex = (state.currentIndex + 1) % state.duruds.length;
    state.settings.durudId = state.duruds[state.currentIndex].id;
    await saveSettings();
    renderDurud();
    $("#select-durud").value = state.settings.durudId;
  });
  $("#btn-copy").addEventListener("click", async () => {
    const d = state.duruds[state.currentIndex];
    await navigator.clipboard.writeText(
      `${d.arabic}\n\n${d.translit}\n\n${d.bangla}\n— ${d.reference}`,
    );
    toast("দুরুদ কপি হয়েছে");
  });

  // Audio controls
  $("#select-audio").addEventListener("change", async (e) => {
    state.settings.audioChoice = e.target.value;
    await saveSettings();
  });
  $("#toggle-audio").addEventListener("change", async (e) => {
    state.settings.audioEnabled = e.target.checked;
    await saveSettings();
    toast(e.target.checked ? "অডিও চালু" : "অডিও বন্ধ");
  });
  $("#volume").addEventListener("input", (e) => {
    const v = +e.target.value;
    state.settings.volume = v / 100;
    $("#volume-val").textContent = `${toBn(v)}%`;
    if (previewAudio) previewAudio.volume = state.settings.volume;
  });
  $("#volume").addEventListener("change", saveSettings);

  // Play preview (in popup context)
  $("#btn-play").addEventListener("click", () => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio = null;
    }
    const file = getAudioFile(state.settings.audioChoice);
    previewAudio = new Audio(chrome.runtime.getURL(`assets/audios/${file}`));
    previewAudio.volume = state.settings.volume ?? 0.9;
    previewAudio.play().catch((e) => toast("প্লে করা যায়নি"));
  });

  // Other toggles
  $("#toggle-dnd").addEventListener("change", async (e) => {
    state.settings.dnd = e.target.checked;
    await saveSettings();
  });
  $("#toggle-friday").addEventListener("change", async (e) => {
    state.settings.friday = e.target.checked;
    await saveSettings();
  });
  $("#toggle-idle").addEventListener("change", async (e) => {
    state.settings.idleOnly = e.target.checked;
    await saveSettings();
  });

  // Share
  $("#btn-share").addEventListener("click", async () => {
    await navigator.clipboard.writeText(
      "https://chromewebstore.google.com/detail/durud-reminder/bngakbdgjllamghdaidjndadpnangmaj",
    );
    toast("লিংক কপি হয়েছে");
  });
}

(async function init() {
  await loadDuruds();
  await loadStorage();
  renderDurud();
  renderSettings();
  renderNext();
  bindAll();
})();
