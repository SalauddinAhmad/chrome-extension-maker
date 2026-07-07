// Durud Reminder v2.0 — service worker
const ALARM = "durud-reminder";
const DEFAULTS = {
  enabled: true,
  interval: 15,
  durudId: "ibrahim",
  dnd: true,
  friday: true,
  idleOnly: false,
  goal: 100,
};

async function getSettings() {
  const { settings } = await chrome.storage.local.get("settings");
  return { ...DEFAULTS, ...(settings || {}) };
}

async function getDuruds() {
  const res = await fetch(chrome.runtime.getURL("data/duruds.json"));
  return res.json();
}

async function scheduleAlarm() {
  const s = await getSettings();
  await chrome.alarms.clear(ALARM);
  if (!s.enabled) return;
  let mins = s.interval;
  // Friday special mode: more frequent
  const day = new Date().getDay(); // 5 = Friday
  if (s.friday && day === 5) mins = Math.max(5, Math.round(mins / 2));
  chrome.alarms.create(ALARM, { delayInMinutes: mins, periodInMinutes: mins });
}

function inDndWindow() {
  const h = new Date().getHours();
  return h >= 23 || h < 6;
}

async function isIdle() {
  return new Promise((resolve) => {
    chrome.idle.queryState(60, (s) => resolve(s !== "active"));
  });
}

async function fireReminder() {
  const s = await getSettings();
  if (!s.enabled) return;
  if (s.dnd && inDndWindow()) return;
  if (s.idleOnly && (await isIdle())) return;

  const duruds = await getDuruds();
  const d = duruds.find((x) => x.id === s.durudId) || duruds[0];

  chrome.notifications.create(
    `durud-${Date.now()}`,
    {
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon.png"),
      title: `🌿 ${d.name}`,
      message: `${d.translit}\n\n${d.bangla}`,
      priority: 1,
      silent: false,
    },
    () => void chrome.runtime.lastError,
  );
}

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get("settings");
  if (!settings) await chrome.storage.local.set({ settings: DEFAULTS });
  scheduleAlarm();
});

chrome.runtime.onStartup.addListener(scheduleAlarm);

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === ALARM) fireReminder();
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "settings-updated") scheduleAlarm();
});

chrome.notifications.onClicked.addListener((id) => {
  chrome.notifications.clear(id);
});
