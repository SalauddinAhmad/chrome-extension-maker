const toBn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);

async function main() {
  const res = await fetch(chrome.runtime.getURL("data/duruds.json"));
  const duruds = await res.json();
  const { settings } = await chrome.storage.local.get("settings");
  const theme = settings?.theme || "light";
  if (theme === "dark") document.body.classList.add("dark-theme");

  const d = duruds[Math.floor(Math.random() * duruds.length)];
  document.getElementById("nt-name").textContent = d.name;
  document.getElementById("nt-arabic").textContent = d.arabic;
  document.getElementById("nt-translit").textContent = d.translit;
  document.getElementById("nt-bangla").textContent = d.bangla;
  document.getElementById("nt-ref").textContent = d.reference;

  const now = new Date();
  const bnMonths = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const bnDays = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ];
  document.getElementById("nt-date").textContent =
    `${bnDays[now.getDay()]} · ${toBn(now.getDate())} ${bnMonths[now.getMonth()]} ${toBn(now.getFullYear())}`;
}
main();
