import { useLayoutEffect, useEffect, useRef, type RefObject } from 'react';
import { placePill } from '@/ui/motion/navPill';

export interface PillGroupOptions {
  radius?: number;
  line?: boolean;
  scroll?: boolean;
}

/**
 * Shared source pill placement for tabs, segmented controls and page tabs.
 * The same clipped `placePill` primitive used by the sidebar and tabbar drives
 * every group; resize and font loading reposition without animation.
 */
export function usePillGroup(
  rootRef: RefObject<HTMLElement | null>,
  pillRef: RefObject<HTMLElement | null>,
  targetSelector: string,
  active: string,
  { radius = 13, line = false, scroll = false }: PillGroupOptions = {},
) {
  const first = useRef(true);

  const place = (animate: boolean) => {
    const root = rootRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(targetSelector);
    placePill(pillRef.current, target, { animate, radius, line });
    if (scroll) target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  };

  useLayoutEffect(() => {
    place(!first.current);
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reposition = () => place(false);
    const observer = new ResizeObserver(reposition);
    observer.observe(root);
    Array.from(root.children).forEach((child) => observer.observe(child));
    document.fonts?.ready.then(reposition);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
