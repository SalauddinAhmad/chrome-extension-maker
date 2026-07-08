// Tab switching
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const name = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t === tab));
    document.querySelectorAll(".pane").forEach((p) => {
      p.classList.toggle("is-active", p.dataset.pane === name);
    });
  });
});

// Module click -> log (wire to real handlers later)
document.querySelectorAll(".mod, .quick-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.mod || btn.dataset.tool;
    console.log("[Designer OS] open:", id);
  });
});
