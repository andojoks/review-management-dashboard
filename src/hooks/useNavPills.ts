import { useEffect } from 'react';
import { placePill } from '@/ui/motion/navPill';
import type { RouteKey } from '@/router';

export function useNavPills(route: RouteKey, sub?: string, rail?: boolean, theme?: string) {
  useEffect(() => {
    placePill(
      document.querySelector<HTMLElement>('.snav__pill'),
      document.querySelector<HTMLElement>('.snav__item[aria-current="page"]'),
      { animate: document.documentElement.classList.contains('is-started'), radius: 11 },
    );
    placePill(
      document.querySelector<HTMLElement>('.tabbar__pill'),
      document.querySelector<HTMLElement>('.tabbar [aria-current="page"]'),
      { animate: document.documentElement.classList.contains('is-started'), radius: 12 },
    );
  }, [route, sub, rail, theme]);
}
