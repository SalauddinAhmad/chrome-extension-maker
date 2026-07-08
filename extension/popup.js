// Durud Reminder v2.0 — popup logic
const DEFAULT_SETTINGS = {
  enabled: true,
  interval: 15,
  durudId: "ibrahim",
  dnd: true,
  friday: true,
  idleOnly: false,
  goal: 100,
  theme: "light",
  audioEnabled: true,
  audioChoice: "random",
  volume: 0.9,
};

const state = {
  duruds: [],
  settings: { ...DEFAULT_SETTINGS },
  currentIndex: 0,
  stats: { streak: 0, total: 0, days: {} },
  today: 0,
};

const $ = (s) => document.querySelector(s);
const toBn = (n) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

async function loadDuruds() {
  const res = await fetch(chrome.runtime.getURL("data/duruds.json"));
  state.duruds = await res.json();
}

async function loadStorage() {
  const data = await chrome.storage.local.get(["settings", "stats", "today", "todayDate"]);
  state.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  state.stats = data.stats || { streak: 0, total: 0, days: {} };
  const todayKey = new Date().toISOString().slice(0, 10);
  state.today = data.todayDate === todayKey ? data.today || 0 : 0;
  if (data.todayDate !== todayKey) {
    await chrome.storage.local.set({ today: 0, todayDate: todayKey });
  }
}

async function saveSettings() {
  await chrome.storage.local.set({ settings: state.settings });
  chrome.runtime.sendMessage({ type: "settings-updated" });
}
async function saveStats() {
  await chrome.storage.local.set({
    stats: state.stats,
    today: state.today,
    todayDate: new Date().toISOString().slice(0, 10),
  });
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
  $("#interval").value = state.settings.interval;
  $("#interval-val").textContent = `${toBn(state.settings.interval)} মিনিট`;
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
}

function renderTasbih() {
  const goal = state.settings.goal || 100;
  $("#tasbih-goal").textContent = toBn(goal);
  $("#tasbih-count").textContent = toBn(state.today);
  const pct = Math.min(state.today / goal, 1);
  const dash = 326.7;
  $("#ring-fg").style.strokeDashoffset = dash * (1 - pct);
}

function renderStats() {
  $("#stat-streak").textContent = toBn(state.stats.streak || 0);
  $("#stat-today").textContent = toBn(state.today);
  $("#stat-total").textContent = toBn(state.stats.total || 0);
  const heat = $("#heatmap");
  heat.innerHTML = "";
  const goal = state.settings.goal || 100;
  const now = new Date();
  const cells = 56; // 8 weeks * 7
  for (let i = cells - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const v = state.stats.days?.[key] || 0;
    const ratio = v / goal;
    let cls = "";
    if (ratio > 1) cls = "l4";
    else if (ratio > 0.66) cls = "l3";
    else if (ratio > 0.33) cls = "l2";
    else if (ratio > 0) cls = "l1";
    heat.innerHTML += `<div class="cell ${cls}" title="${key}: ${v}"></div>`;
  }
}

async function renderNext() {
  const alarms = await chrome.alarms.getAll();
  const a = alarms.find((x) => x.name === "durud-reminder");
  if (!a || !state.settings.enabled) {
    $("#next-time").textContent = state.settings.enabled ? "শীঘ্রই" : "বন্ধ";
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

// Interactions
function bindTabs() {
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const name = btn.dataset.tab;
      document.querySelectorAll(".tab-panel").forEach((p) => {
        p.classList.toggle("is-active", p.dataset.panel === name);
      });
      if (name === "stats") renderStats();
      if (name === "tasbih") renderTasbih();
    });
  });
}

function bindReminder() {
  $("#toggle-enabled").addEventListener("change", async (e) => {
    state.settings.enabled = e.target.checked;
    await saveSettings();
    renderNext();
  });
  $("#interval").addEventListener("input", (e) => {
    state.settings.interval = +e.target.value;
    $("#interval-val").textContent = `${toBn(+e.target.value)} মিনিট`;
  });
  $("#interval").addEventListener("change", async () => {
    await saveSettings();
    setTimeout(renderNext, 300);
  });
  $("#select-durud").addEventListener("change", async (e) => {
    state.settings.durudId = e.target.value;
    await saveSettings();
    renderDurud();
  });
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
    toast("কপি হয়েছে");
  });
  $("#toggle-audio").addEventListener("change", async (e) => {
    state.settings.audioEnabled = e.target.checked;
    await saveSettings();
    toast(e.target.checked ? "অডিও চালু" : "অডিও বন্ধ");
  });
  $("#select-audio").addEventListener("change", async (e) => {
    state.settings.audioChoice = e.target.value;
    await saveSettings();
  });
  $("#volume").addEventListener("input", (e) => {
    const v = +e.target.value;
    state.settings.volume = v / 100;
    $("#volume-val").textContent = `${toBn(v)}%`;
  });
  $("#volume").addEventListener("change", saveSettings);
  $("#btn-test-audio").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "test-audio" });
    toast("অডিও বাজানো হচ্ছে…");
  });
}

function bindTasbih() {
  const btn = $("#btn-count");
  btn.addEventListener("click", async () => {
    state.today += 1;
    state.stats.total = (state.stats.total || 0) + 1;
    const key = new Date().toISOString().slice(0, 10);
    state.stats.days = state.stats.days || {};
    state.stats.days[key] = (state.stats.days[key] || 0) + 1;
    // streak
    if (state.stats.days[key] === state.settings.goal) {
      const yKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const prevMet = (state.stats.days[yKey] || 0) >= state.settings.goal;
      state.stats.streak = prevMet ? (state.stats.streak || 0) + 1 : 1;
      toast("দৈনিক লক্ষ্য পূর্ণ! 🌿");
    }
    await saveStats();
    renderTasbih();
    btn.style.transform = "scale(0.97)";
    setTimeout(() => (btn.style.transform = ""), 90);
  });
  $("#btn-reset").addEventListener("click", async () => {
    state.today = 0;
    const key = new Date().toISOString().slice(0, 10);
    if (state.stats.days) state.stats.days[key] = 0;
    await saveStats();
    renderTasbih();
  });
  $("#btn-goal").addEventListener("click", async () => {
    const v = prompt("দৈনিক লক্ষ্য (সংখ্যা):", state.settings.goal);
    const n = parseInt(v, 10);
    if (n > 0 && n < 10000) {
      state.settings.goal = n;
      await saveSettings();
      renderTasbih();
    }
  });
}

function bindTheme() {
  const apply = () => {
    document.body.classList.toggle("dark-theme", state.settings.theme === "dark");
  };
  apply();
  $("#btn-theme").addEventListener("click", async () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    await saveSettings();
    apply();
  });
}

(async function init() {
  await loadDuruds();
  await loadStorage();
  renderDurud();
  renderSettings();
  renderTasbih();
  renderStats();
  renderNext();
  bindTabs();
  bindReminder();
  bindTasbih();
  bindTheme();
})();
