import { useCallback, useEffect, useState } from 'react';
import type { ThemeChoice } from '@/ui/data/notices';

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
    try {
      localStorage.setItem('raveno:theme', JSON.stringify(choice));
    } catch {
      // Storage may be blocked.
    }
  }, [choice, dark]);

  const toggle = useCallback(() => setChoice((current) => resolvedTheme(current) === 'dark' ? 'light' : 'dark'), []);

  return { choice, setChoice, dark, toggle };
}
