import { useCallback, useEffect, useState } from 'react';
import { isRail, refreshPills, setRail } from '@/ui/motion/rail';

export function useRail() {
  const [rail, setRailState] = useState(isRail);

  useEffect(() => {
    let width = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === width) return;
      const previous = width;
      width = window.innerWidth;
      const root = document.documentElement;

      if (width > 760 && width < 1280) root.classList.add('is-rail');
      else if (width <= 760) root.classList.remove('is-rail');
      else if (previous < 1280 && width >= 1280) {
        let saved = false;
        try {
          saved = localStorage.getItem('raveno:rail') === '1';
        } catch {
          // Storage may be blocked.
        }
        root.classList.toggle('is-rail', saved);
      }

      setRailState(isRail());
      refreshPills();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggle = useCallback((next: boolean) => {
    setRail(next);
    setRailState(next);
  }, []);

  return { rail, setRailState, toggle };
}
