// Offscreen audio player for Durud Reminder
const player = document.getElementById("player");

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.target !== "offscreen") return;
  if (msg.action === "play-audio") {
    try {
      player.src = chrome.runtime.getURL(msg.file);
      player.volume = typeof msg.volume === "number" ? msg.volume : 1;
      player.currentTime = 0;
      player.play().catch((e) => console.warn("[offscreen] play failed:", e));
    } catch (e) {
      console.warn("[offscreen] error:", e);
    }
  }
});
