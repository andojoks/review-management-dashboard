import { useEffect, useRef } from 'react';
import { go, type RouteKey } from '@/router';

export interface ShortcutHandlers {
  signedIn: boolean;
  onFinder: () => void;
  onShortcuts: () => void;
  onRailToggle: (next: boolean) => void;
  onOpenNew: () => void;
}

const goMap: Record<string, RouteKey> = {
  o: 'overview',
  i: 'insights',
  r: 'reviews',
  p: 'pros',
  c: 'clients',
  d: 'documents',
  m: 'inbox',
  s: 'settings',
};

export function useKeyboardShortcuts({
  signedIn,
  onFinder,
  onShortcuts,
  onRailToggle,
  onOpenNew,
}: ShortcutHandlers) {
  const gKeyAt = useRef(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onFinder();
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable]') || event.metaKey || event.ctrlKey || event.altKey || !signedIn) return;

      if (event.key === '/') {
        event.preventDefault();
        onFinder();
      } else if (event.key === '?') {
        event.preventDefault();
        onShortcuts();
      } else if (event.key === '[' && window.innerWidth >= 1280) {
        onRailToggle(!document.documentElement.classList.contains('is-rail'));
      } else if (event.key.toLowerCase() === 'g') {
        gKeyAt.current = performance.now();
      } else if (performance.now() - gKeyAt.current < 900) {
        const destination = goMap[event.key.toLowerCase()];
        if (destination) {
          go(destination);
          gKeyAt.current = 0;
        }
      } else if (event.key.toLowerCase() === 'n') {
        onOpenNew();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [signedIn, onFinder, onShortcuts, onRailToggle, onOpenNew]);
}
