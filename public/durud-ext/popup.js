// Durud Reminder v2.1 — Premium popup (preview)
const DEFAULT_SETTINGS = {
  enabled: true,
  interval: 10,
  durudId: "small-blessing",
  dnd: true,
  dndStart: "23:00",
  dndEnd: "06:00",
  
  idleOnly: false,
  audioEnabled: true,
  audioChoice: "random",
  volume: 0.9,
  theme: "light",
  onboarded: false,
  sections: { reminder: true, audio: true, advanced: false },
};

const state = {
  duruds: [],
  settings: { ...DEFAULT_SETTINGS },
  currentIndex: 0,
  todayCount: 0,
  todayDate: "",
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

let previewAudio = null;
let bleepCtx = null;
let countdownTimer = null;
let nextReminderAt = null;

async function loadDuruds() {
  try {
    const res = await fetch(chrome.runtime.getURL("data/duruds.json"));
    state.duruds = await res.json();
  } catch { state.duruds = []; }
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

async function loadStorage() {
  const data = await chrome.storage.local.get(["settings", "todayCount", "todayDate"]);
  state.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  state.settings.sections = { ...DEFAULT_SETTINGS.sections, ...(data.settings?.sections || {}) };
  const tk = todayKey();
  state.todayDate = data.todayDate || tk;
  state.todayCount = state.todayDate === tk ? (data.todayCount || 0) : 0;
  if (state.todayDate !== tk) {
    state.todayDate = tk;
    await chrome.storage.local.set({ todayCount: 0, todayDate: tk });
  }
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
  $("#save-icon").classList.remove("pop");
}
function hideSaving() {
  $("#save-text").textContent = "Auto-saved";
  $("#save-icon").classList.remove("spin");
  // trigger checkmark pop
  const el = $("#save-icon");
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

function intervalToLabel(min) {
  if (min < 60) return `${toBn(min)} মিনিট`;
  if (min === 60) return "১ ঘণ্টা";
  if (min === 90) return "১.৫ ঘণ্টা";
  return `${toBn(min / 60)} ঘণ্টা`;
}

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.settings.theme);
  const icon = $("#theme-icon");
  if (!icon) return;
  if (state.settings.theme === "dark") {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    icon.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  }
}

/* ---------- Sections ---------- */
function applySections() {
  $$(".section").forEach((sec) => {
    const key = sec.dataset.section;
    const open = state.settings.sections[key] !== false;
    sec.dataset.open = open ? "true" : "false";
    const head = sec.querySelector(".section-head");
    if (head) head.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

/* ---------- Interval chips ---------- */
const CHIP_VALS = [5, 10, 15, 30, 60];
function applyChips() {
  const isPreset = CHIP_VALS.includes(state.settings.interval);
  $$("#interval-chips .chip").forEach((c) => {
    const v = c.dataset.val;
    if (v === "custom") {
      c.classList.toggle("chip-active", !isPreset);
    } else {
      c.classList.toggle("chip-active", parseInt(v, 10) === state.settings.interval);
    }
  });
  const wrap = $("#interval-custom-wrap");
  if (wrap) {
    wrap.hidden = isPreset;
    const sel = $("#interval-select");
    if (sel) sel.value = String(state.settings.interval);
  }
}

function applyJumuahBadge() {}

/* ---------- Today count ---------- */
function renderTodayCount() {
  $("#today-count").textContent = toBn(state.todayCount);
  const goal = 100;
  const pct = Math.min(100, Math.round((state.todayCount / goal) * 100));
  $("#today-bar").style.width = `${pct}%`;
}

async function bumpTodayCount() {
  const tk = todayKey();
  if (state.todayDate !== tk) {
    state.todayDate = tk;
    state.todayCount = 0;
  }
  state.todayCount += 1;
  await chrome.storage.local.set({ todayCount: state.todayCount, todayDate: state.todayDate });
  renderTodayCount();
}

/* ---------- Settings render ---------- */
function renderSettings() {
  $("#toggle-enabled").checked = state.settings.enabled;
  $("#interval-val").textContent = intervalToLabel(state.settings.interval);
  $("#toggle-dnd").checked = state.settings.dnd;
  $("#dnd-times").hidden = !state.settings.dnd;
  $("#dnd-start").value = state.settings.dndStart;
  $("#dnd-end").value = state.settings.dndEnd;
  updateDndSub();
  
  $("#toggle-idle").checked = state.settings.idleOnly;
  $("#select-audio").value = String(state.settings.audioChoice ?? "random");
  const volPct = Math.round((state.settings.volume ?? 0.9) * 100);
  $("#volume").value = volPct;
  $("#volume-val").textContent = `${toBn(volPct)}%`;
  const st = $("#hero-status");
  st.textContent = state.settings.enabled ? "চালু" : "বন্ধ";
  st.classList.toggle("off", !state.settings.enabled);
  const hero = $("#hero");
  hero.classList.toggle("on", state.settings.enabled);
  hero.classList.toggle("off", !state.settings.enabled);
  applyChips();
}

function updateDndSub() {
  const fmt = (t) => {
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}`;
  };
  $("#dnd-sub").textContent = `${fmt(state.settings.dndStart)} – ${fmt(state.settings.dndEnd)}`;
}

/* ---------- Next reminder + live countdown ---------- */
async function computeNext() {
  if (!state.settings.enabled) { nextReminderAt = null; return; }
  let scheduled = null;
  try {
    const alarms = await chrome.alarms.getAll();
    const a = alarms && alarms.find((x) => x.name === "durud-reminder");
    if (a) scheduled = a.scheduledTime;
  } catch {}
  nextReminderAt = scheduled
    ? scheduled
    : Date.now() + (state.settings.interval || 10) * 60000;
}
function renderCountdown() {
  if (!state.settings.enabled || !nextReminderAt) {
    $("#next-time").textContent = "--:--";
    $("#hero-countdown").textContent = "রিমাইন্ডার বন্ধ";
    return;
  }
  const t = new Date(nextReminderAt);
  const h = t.getHours() % 12 || 12;
  const m = String(t.getMinutes()).padStart(2, "0");
  const ap = t.getHours() >= 12 ? "PM" : "AM";
  $("#next-time").textContent = `${toBn(h)}:${toBn(m)} ${ap}`;

  const diff = Math.max(0, nextReminderAt - Date.now());
  const totalSec = Math.floor(diff / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  let txt;
  if (mm >= 1) txt = `আর ${toBn(mm)} মিনিট ${toBn(String(ss).padStart(2, "0"))} সেকেন্ড`;
  else txt = `আর ${toBn(ss)} সেকেন্ড`;
  $("#hero-countdown").textContent = txt;

  if (diff <= 0) {
    // auto-advance in preview
    nextReminderAt = Date.now() + (state.settings.interval || 10) * 60000;
  }
}
function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(renderCountdown, 1000);
  renderCountdown();
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

/* ---------- Volume bleep ---------- */
function playBleep(vol) {
  try {
    if (!bleepCtx) bleepCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = bleepCtx.createOscillator();
    const g = bleepCtx.createGain();
    o.type = "sine";
    o.frequency.value = 660;
    g.gain.value = Math.max(0.01, vol * 0.15);
    o.connect(g).connect(bleepCtx.destination);
    o.start();
    o.stop(bleepCtx.currentTime + 0.06);
  } catch {}
}

/* ---------- Onboarding ---------- */
function showOnboarding() {
  $("#onboarding").hidden = false;
}
function hideOnboarding() {
  $("#onboarding").hidden = true;
}

/* ---------- Bind ---------- */
function bindAll() {
  // Theme
  $("#btn-theme").addEventListener("click", async () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    applyTheme();
    await saveSettings();
  });

  // Section accordion
  $$(".section-head").forEach((h) => {
    h.addEventListener("click", async () => {
      const sec = h.closest(".section");
      const key = sec.dataset.section;
      const isOpen = sec.dataset.open === "true";
      sec.dataset.open = isOpen ? "false" : "true";
      h.setAttribute("aria-expanded", isOpen ? "false" : "true");
      state.settings.sections[key] = !isOpen;
      await saveSettings();
    });
  });

  // Enable toggle
  $("#toggle-enabled").addEventListener("change", async (e) => {
    state.settings.enabled = e.target.checked;
    await saveSettings();
    renderSettings();
    await computeNext();
    renderCountdown();
  });

  // Interval chips
  $$("#interval-chips .chip").forEach((c) => {
    c.addEventListener("click", async () => {
      const v = c.dataset.val;
      if (v === "custom") {
        $("#interval-custom-wrap").hidden = false;
        applyChips();
        $("#interval-custom-wrap").hidden = false;
        $$("#interval-chips .chip").forEach((x) =>
          x.classList.toggle("chip-active", x.dataset.val === "custom")
        );
        return;
      }
      state.settings.interval = parseInt(v, 10);
      $("#interval-val").textContent = intervalToLabel(state.settings.interval);
      applyChips();
      await saveSettings();
      await computeNext();
      renderCountdown();
    });
  });
  $("#interval-select").addEventListener("change", async (e) => {
    state.settings.interval = parseInt(e.target.value, 10);
    $("#interval-val").textContent = intervalToLabel(state.settings.interval);
    applyChips();
    await saveSettings();
    await computeNext();
    renderCountdown();
  });

  // Audio
  $("#select-audio").addEventListener("change", async (e) => {
    state.settings.audioChoice = e.target.value;
    await saveSettings();
  });
  let bleepThrottle = 0;
  $("#volume").addEventListener("input", (e) => {
    const v = +e.target.value;
    state.settings.volume = v / 100;
    $("#volume-val").textContent = `${toBn(v)}%`;
    if (previewAudio) previewAudio.volume = state.settings.volume;
    const now = Date.now();
    if (now - bleepThrottle > 120) {
      bleepThrottle = now;
      playBleep(state.settings.volume);
    }
  });
  $("#volume").addEventListener("change", saveSettings);

  $("#btn-play").addEventListener("click", () => {
    if (previewAudio) { previewAudio.pause(); previewAudio = null; }
    const file = getAudioFile(state.settings.audioChoice);
    previewAudio = new Audio(chrome.runtime.getURL(`assets/audios/${file}`));
    previewAudio.volume = state.settings.volume ?? 0.9;
    previewAudio.play().then(() => bumpTodayCount()).catch(() => toast("প্লে করা যায়নি"));
  });

  $("#btn-play-now").addEventListener("click", () => {
    $("#btn-play").click();
    toast("দুরুদ বাজছে");
  });

  // DND
  $("#toggle-dnd").addEventListener("change", async (e) => {
    state.settings.dnd = e.target.checked;
    $("#dnd-times").hidden = !state.settings.dnd;
    await saveSettings();
  });
  $("#dnd-start").addEventListener("change", async (e) => {
    state.settings.dndStart = e.target.value;
    updateDndSub();
    await saveSettings();
  });
  $("#dnd-end").addEventListener("change", async (e) => {
    state.settings.dndEnd = e.target.value;
    updateDndSub();
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

  // Onboarding
  $("#onb-next").addEventListener("click", () => {
    $("#onb-step-1").hidden = true;
    $("#onb-step-2").hidden = false;
  });
  $("#onb-start").addEventListener("click", () => {
    hideOnboarding();
    state.settings.onboarded = true;
    saveSettings();
  });
}

(async function init() {
  await loadDuruds();
  await loadStorage();
  applyTheme();
  applySections();
  applyJumuahBadge();
  renderSettings();
  renderTodayCount();
  await computeNext();
  startCountdown();
  bindAll();
  if (!state.settings.onboarded) showOnboarding();
})();
