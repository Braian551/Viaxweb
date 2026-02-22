(function () {
  const root = document.documentElement;
  const storageKey = 'viax.theme';

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);

    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
    }
  }

  const saved = localStorage.getItem(storageKey);
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved || (preferredDark ? 'dark' : 'light'));

  window.toggleViaxTheme = function () {
    const current = root.getAttribute('data-theme') || 'light';
    apply(current === 'dark' ? 'light' : 'dark');
  };
})();
