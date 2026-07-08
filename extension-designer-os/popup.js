// Designer OS popup — interactions are wired up progressively per module.
(function () {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((t) => {
    t.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.remove('is-active'));
      t.classList.add('is-active');
    });
  });

  document.querySelectorAll('.toggle').forEach((tog) => {
    tog.addEventListener('click', () => {
      const on = tog.getAttribute('aria-checked') === 'true';
      tog.setAttribute('aria-checked', on ? 'false' : 'true');
    });
  });

  document.querySelectorAll('.row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.toggle')) return;
      const tool = row.dataset.tool;
      console.log('[Designer OS] open tool:', tool);
    });
  });

  document.querySelector('.clear')?.addEventListener('click', () => {
    document.querySelectorAll('.sw').forEach((s) => (s.style.opacity = '0.15'));
  });
})();
