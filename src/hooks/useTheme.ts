import { useCallback, useEffect, useState } from 'react';
import type { ThemeChoice } from '@/ui/data/notices';
import { recordMode, reducedMotion } from '@/ui/motion/interactions';

function initialTheme(): ThemeChoice {
  try {
    const value = JSON.parse(localStorage.getItem('raveno:theme') || '"light"');
    return value === 'dark' || value === 'light' || value === 'system' ? value : 'light';
  } catch {
    return 'light';
  }
}

export function resolvedTheme(choice: ThemeChoice) {
  return choice === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : choice;
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(initialTheme);
  const dark = resolvedTheme(choice) === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e0f11' : '#f2f3f5');
  }, [dark]);

  /**
   * Source `xt()`: persist the choice, then reveal the new theme with a
   * circular clip-path View Transition anchored at the clicked toggle.
   */
  const setThemeChoice = useCallback((next: ThemeChoice, anchor?: HTMLElement | null) => {
    if (!recordMode()) {
      try {
        localStorage.setItem('raveno:theme', JSON.stringify(next));
      } catch {
        // Storage may be blocked.
      }
    }
    const value = resolvedTheme(next);
    const root = document.documentElement;
    const commit = () => {
      root.dataset.theme = value;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#0e0f11' : '#f2f3f5');
      setChoice(next);
    };

    if (root.dataset.theme === value) {
      commit();
      return;
    }

    const start = document.startViewTransition;
    if (!start || reducedMotion()) {
      commit();
      return;
    }

    const rect = anchor?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    start.call(document, commit).ready.then(() => {
      root.animate({
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      }, {
        duration: 450,
        easing: 'cubic-bezier(.65,0,.35,1)',
        pseudoElement: '::view-transition-new(root)',
      });
    }).catch(() => {
      // A skipped transition still leaves the committed theme in place.
    });
  }, []);

  const toggle = useCallback((anchor?: HTMLElement | null) => {
    setThemeChoice(resolvedTheme(choice) === 'dark' ? 'light' : 'dark', anchor);
  }, [choice, setThemeChoice]);

  return { choice, setChoice: setThemeChoice, dark, toggle };
}
