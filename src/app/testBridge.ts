/**
 * Small deterministic hook for visual-regression work. The source demo exposes
 * `window.__app.start()` under `?record`; the modular port mirrors that API so
 * both origins can be driven with the same harness.
 */
export function installTestBridge() {
  if (!/[?&]record\b/.test(window.location.search)) return;

  Object.defineProperty(window, '__app', {
    configurable: true,
    value: {
      start: () => document.documentElement.classList.add('is-started'),
    },
  });
}
