// Durud Reminder v2.0 — service worker
const ALARM = "durud-reminder";
const AUDIO_FILES = [
  "assets/audios/durud1.mp3",
  "assets/audios/durud2.mp3",
  "assets/audios/durud3.mp3",
  "assets/audios/durud4.mp3",
  "assets/audios/durud5.mp3",
  "assets/audios/durud6.mp3",
  "assets/audios/durud7.mp3",
  "assets/audios/durud8.mp3",
  "assets/audios/durud9.mp3",
];
const DEFAULTS = {
  enabled: true,
  interval: 15,
  durudId: "short",
  dnd: true,
  friday: true,
  idleOnly: false,
  goal: 100,
  audioEnabled: true,
  audioChoice: "random", // "random" or index 0-8
  volume: 0.9,
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
  const day = new Date().getDay();
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

async function ensureOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "Play Durud reminder audio",
  });
}

async function playAudio(s) {
  try {
    let file;
    if (s.audioChoice === "random" || s.audioChoice == null) {
      file = AUDIO_FILES[Math.floor(Math.random() * AUDIO_FILES.length)];
    } else {
      const i = parseInt(s.audioChoice, 10);
      file = AUDIO_FILES[isNaN(i) ? 0 : Math.max(0, Math.min(8, i))];
    }
    await ensureOffscreen();
    // small delay so the offscreen doc is ready
    await new Promise((r) => setTimeout(r, 300));
    chrome.runtime.sendMessage({
      target: "offscreen",
      action: "play-audio",
      file,
      volume: s.volume ?? 0.9,
    });
  } catch (e) {
    console.warn("[background] audio error:", e);
  }
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

  if (s.audioEnabled) await playAudio(s);
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
  if (msg?.type === "test-audio") {
    (async () => {
      const s = await getSettings();
      await playAudio(s);
    })();
  }
});

chrome.notifications.onClicked.addListener((id) => {
  chrome.notifications.clear(id);
});
