// Durud Reminder v2.0 — Premium popup (preview) with bilingual (bn/en) support
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
  lang: null, // null = auto-detect on first run
  sections: { reminder: true, audio: true, advanced: false },
};

const state = {
  duruds: [],
  hadiths: [],
  settings: { ...DEFAULT_SETTINGS },
  currentIndex: 0,
  todayCount: 0,
  todayDate: "",
  currentHadithIdx: 0,
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

/* ---------- i18n ---------- */
const I18N = {
  bn: {
    brandSub: "নবীজি ﷺ-এর উপর দুরুদ",
    onb1Title: "আসসালামু আলাইকুম 🌿",
    onb1Body: "Durud Reminder আপনাকে নিয়মিত নবীজি ﷺ-এর উপর দুরুদ পড়ার কথা মনে করিয়ে দেবে। ১০ মিনিট পর পর একটি মৃদু অডিও বাজবে।",
    onb2Title: "আপনি প্রস্তুত!",
    onb2Body: "যেকোনো সময় ইন্টারভাল, অডিও বা রাতের সাইলেন্স কাস্টমাইজ করতে পারবেন।",
    next: "পরবর্তী →",
    start: "শুরু করুন",
    nextReminder: "পরবর্তী রিমাইন্ডার",
    on: "চালু",
    off: "বন্ধ",
    playNow: "এখনই বাজান",
    todayRead: "আজ পড়েছেন",
    times: "বার",
    reminder: "রিমাইন্ডার",
    interval: "ইন্টারভাল",
    custom: "অন্য",
    audio: "অডিও",
    durudAudio: "দুরুদ (অডিও)",
    volume: "ভলিউম",
    advanced: "অ্যাডভান্সড",
    nightSilence: "রাতে সাইলেন্স",
    startLbl: "শুরু",
    endLbl: "শেষ",
    onlyActive: "শুধু সক্রিয় থাকলে",
    onlyActiveSub: "Idle অবস্থায় রিমাইন্ডার বন্ধ",
    randomAudio: "র‍্যান্ডম (৯টি থেকে)",
    durud1: "দুরুদ ১", durud2: "দুরুদ ২", durud3: "দুরুদ ৩",
    durud4: "দুরুদ ৪", durud5: "দুরুদ ৫", durud6: "দুরুদ ৬",
    durud7: "দুরুদ ৭", durud8: "দুরুদ ৮", durud9: "দুরুদ ৯",
    every5: "প্রতি ৫ মিনিট", every10: "প্রতি ১০ মিনিট", every15: "প্রতি ১৫ মিনিট",
    every20: "প্রতি ২০ মিনিট", every30: "প্রতি ৩০ মিনিট", every45: "প্রতি ৪৫ মিনিট",
    every60: "প্রতি ১ ঘণ্টা", every90: "প্রতি ১.৫ ঘণ্টা", every120: "প্রতি ২ ঘণ্টা",
    minutes: "মিনিট",
    hour: "ঘণ্টা",
    hours: "ঘণ্টা",
    inMinSec: (m, s) => `আর ${toBn(m)} মিনিট ${toBn(String(s).padStart(2, "0"))} সেকেন্ড`,
    inSec: (s) => `আর ${toBn(s)} সেকেন্ড`,
    reminderOff: "রিমাইন্ডার বন্ধ",
    savedText: "Auto-saved",
    savingText: "Saving…",
    linkCopied: "লিংক কপি হয়েছে",
    playing: "দুরুদ বাজছে",
    playFailed: "প্লে করা যায়নি",
    dawn: "ভোর",
  },
  en: {
    brandSub: "Durud upon the Prophet ﷺ",
    onb1Title: "As-salamu alaykum 🌿",
    onb1Body: "Durud Reminder gently reminds you to send blessings upon the Prophet ﷺ regularly. A soft audio will play every 10 minutes.",
    onb2Title: "You're ready!",
    onb2Body: "You can customize the interval, audio, or night silence anytime.",
    next: "Next →",
    start: "Get started",
    nextReminder: "Next reminder",
    on: "On",
    off: "Off",
    playNow: "Play now",
    todayRead: "Today",
    times: "times",
    reminder: "Reminder",
    interval: "Interval",
    custom: "Custom",
    audio: "Audio",
    durudAudio: "Durud (audio)",
    volume: "Volume",
    advanced: "Advanced",
    nightSilence: "Night silence",
    startLbl: "Start",
    endLbl: "End",
    onlyActive: "Only when active",
    onlyActiveSub: "Pause reminders when idle",
    randomAudio: "Random (from 9)",
    durud1: "Durud 1", durud2: "Durud 2", durud3: "Durud 3",
    durud4: "Durud 4", durud5: "Durud 5", durud6: "Durud 6",
    durud7: "Durud 7", durud8: "Durud 8", durud9: "Durud 9",
    every5: "Every 5 min", every10: "Every 10 min", every15: "Every 15 min",
    every20: "Every 20 min", every30: "Every 30 min", every45: "Every 45 min",
    every60: "Every 1 hour", every90: "Every 1.5 hours", every120: "Every 2 hours",
    minutes: "min",
    hour: "hour",
    hours: "hours",
    inMinSec: (m, s) => `in ${m}m ${String(s).padStart(2, "0")}s`,
    inSec: (s) => `in ${s}s`,
    reminderOff: "Reminders paused",
    savedText: "Auto-saved",
    savingText: "Saving…",
    linkCopied: "Link copied",
    playing: "Playing durud",
    playFailed: "Playback failed",
    dawn: "",
  },
};

function currentLang() {
  return state.settings.lang === "en" ? "en" : "bn";
}
function t(key) {
  const l = currentLang();
  return I18N[l][key] ?? I18N.bn[key] ?? key;
}
function fmtNum(n) {
  return currentLang() === "bn" ? toBn(n) : String(n);
}
function detectBrowserLang() {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("bn") ? "bn" : "en";
}

function applyI18n() {
  const l = currentLang();
  document.documentElement.setAttribute("lang", l);
  document.documentElement.setAttribute("data-lang", l);
  // text nodes
  $$("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (I18N[l][key] != null) el.textContent = I18N[l][key];
  });
  // option text
  $$("[data-i18n-opt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-opt");
    if (I18N[l][key] != null) el.textContent = I18N[l][key];
  });
  // numeric labels (chips)
  $$("[data-i18n-num]").forEach((el) => {
    const n = parseInt(el.getAttribute("data-i18n-num"), 10);
    el.textContent = fmtNum(n);
  });
  // language toggle active state
  $$(".lang-opt").forEach((el) => {
    el.classList.toggle("active", el.dataset.lang === l);
  });
}

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

async function loadHadiths() {
  try {
    const res = await fetch(chrome.runtime.getURL("data/hadiths.json"));
    state.hadiths = await res.json();
  } catch { state.hadiths = []; }
}

function renderHadith() {
  if (!state.hadiths || !state.hadiths.length) return;
  const h = state.hadiths[state.currentHadithIdx];
  const l = currentLang();
  const text = l === "en" ? (h.en || h.hadis || "") : (h.hadis || h.bn || "");
  const ref = l === "en" ? (h.refEn || h.ref || `Hadith #${h.id}`) : (h.ref || `হাদিস #${h.id}`);
  const textEl = document.getElementById("hadith-text");
  const refEl = document.getElementById("hadith-ref");
  if (textEl) textEl.innerHTML = `<em>"${text}"</em>`;
  if (refEl) refEl.textContent = `— ${ref}`;
}

function pickHadith() {
  if (!state.hadiths || !state.hadiths.length) return;
  state.currentHadithIdx = Math.floor(Math.random() * state.hadiths.length);
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

async function loadStorage() {
  const data = await chrome.storage.local.get(["settings", "todayCount", "todayDate"]);
  state.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  state.settings.sections = { ...DEFAULT_SETTINGS.sections, ...(data.settings?.sections || {}) };
  if (!state.settings.lang) state.settings.lang = detectBrowserLang();
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
  $("#save-text").textContent = t("savingText");
  $("#save-icon").classList.add("spin");
  $("#save-icon").classList.remove("pop");
}
function hideSaving() {
  $("#save-text").textContent = t("savedText");
  $("#save-icon").classList.remove("spin");
  const el = $("#save-icon");
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
}

function intervalToLabel(min) {
  const l = currentLang();
  if (min < 60) return `${fmtNum(min)} ${I18N[l].minutes}`;
  if (min === 60) return l === "bn" ? "১ ঘণ্টা" : "1 hour";
  if (min === 90) return l === "bn" ? "১.৫ ঘণ্টা" : "1.5 hours";
  return `${fmtNum(min / 60)} ${I18N[l].hours}`;
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
    if (v === "custom") c.classList.toggle("chip-active", !isPreset);
    else c.classList.toggle("chip-active", parseInt(v, 10) === state.settings.interval);
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
  $("#today-count").textContent = fmtNum(state.todayCount);
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
  $("#volume-val").textContent = `${fmtNum(volPct)}%`;
  const st = $("#hero-status");
  st.textContent = state.settings.enabled ? t("on") : t("off");
  st.classList.toggle("off", !state.settings.enabled);
  const hero = $("#hero");
  hero.classList.toggle("on", state.settings.enabled);
  hero.classList.toggle("off", !state.settings.enabled);
  applyChips();
}

function updateDndSub() {
  const l = currentLang();
  const fmt = (time) => {
    const [h, m] = time.split(":").map((x) => parseInt(x, 10));
    if (l === "bn") return `${toBn(h)}:${toBn(String(m).padStart(2, "0"))}`;
    // 12-hour format for English
    const ap = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
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
  nextReminderAt = scheduled ? scheduled : Date.now() + (state.settings.interval || 10) * 60000;
}

function renderCountdown() {
  if (!state.settings.enabled || !nextReminderAt) {
    $("#next-time").textContent = "--:--";
    $("#hero-countdown").textContent = t("reminderOff");
    return;
  }
  const time = new Date(nextReminderAt);
  const h = time.getHours() % 12 || 12;
  const m = String(time.getMinutes()).padStart(2, "0");
  const ap = time.getHours() >= 12 ? "PM" : "AM";
  $("#next-time").textContent = `${fmtNum(h)}:${fmtNum(m)} ${ap}`;

  const diff = Math.max(0, nextReminderAt - Date.now());
  const totalSec = Math.floor(diff / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  const line = mm >= 1 ? I18N[currentLang()].inMinSec(mm, ss) : I18N[currentLang()].inSec(ss);
  $("#hero-countdown").textContent = line;

  if (diff <= 0) nextReminderAt = Date.now() + (state.settings.interval || 10) * 60000;
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
function showOnboarding() { $("#onboarding").hidden = false; }
function hideOnboarding() { $("#onboarding").hidden = true; }

/* ---------- Language switching ---------- */
async function setLanguage(lang) {
  if (lang !== "bn" && lang !== "en") return;
  if (state.settings.lang === lang) return;
  state.settings.lang = lang;
  applyI18n();
  renderSettings();
  renderCountdown();
  renderTodayCount();
  renderHadith();
  await saveSettings();
}

/* ---------- Bind ---------- */
function bindAll() {
  $("#btn-theme").addEventListener("click", async () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    applyTheme();
    await saveSettings();
  });

  // Language toggle
  $$(".lang-opt").forEach((el) => {
    el.addEventListener("click", () => setLanguage(el.dataset.lang));
  });

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

  $("#toggle-enabled").addEventListener("change", async (e) => {
    state.settings.enabled = e.target.checked;
    await saveSettings();
    renderSettings();
    await computeNext();
    renderCountdown();
  });

  $$("#interval-chips .chip").forEach((c) => {
    c.addEventListener("click", async () => {
      const v = c.dataset.val;
      if (v === "custom") {
        $("#interval-custom-wrap").hidden = false;
        applyChips();
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

  $("#select-audio").addEventListener("change", async (e) => {
    state.settings.audioChoice = e.target.value;
    await saveSettings();
  });
  let bleepThrottle = 0;
  $("#volume").addEventListener("input", (e) => {
    const v = +e.target.value;
    state.settings.volume = v / 100;
    $("#volume-val").textContent = `${fmtNum(v)}%`;
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
    previewAudio.play().then(() => bumpTodayCount()).catch(() => toast(t("playFailed")));
  });

  $("#btn-play-now").addEventListener("click", () => {
    $("#btn-play").click();
    toast(t("playing"));
  });

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

  $("#btn-share").addEventListener("click", async () => {
    await navigator.clipboard.writeText(
      "https://chromewebstore.google.com/detail/durud-reminder/bngakbdgjllamghdaidjndadpnangmaj",
    );
    toast(t("linkCopied"));
  });

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
  await loadHadiths();
  await loadStorage();
  applyTheme();
  applyI18n();
  applySections();
  applyJumuahBadge();
  pickHadith();
  renderSettings();
  renderTodayCount();
  renderHadith();
  await computeNext();
  startCountdown();
  bindAll();
  if (!state.settings.onboarded) showOnboarding();
})();
