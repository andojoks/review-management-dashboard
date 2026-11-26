import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import gsap from 'gsap';

export const isMobileSheet = () => window.innerWidth <= 760;

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const sheetDuration = (value: number) => reduceMotion() ? 0 : value;

/** Source-style bottom-sheet drag: follow the finger, close on a flick or a long pull. */
export function useSheetDrag(panel: RefObject<HTMLElement | null>, onClose: () => void) {
  let startY = 0;
  let startTime = 0;
  let dragging = false;

  const settle = () => {
    if (!panel.current) return;
    gsap.to(panel.current, {
      y: 0,
      duration: sheetDuration(0.5),
      ease: 'back.out(1.6)',
      clearProps: 'transform',
    });
  };

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (!isMobileSheet() || reduceMotion()) return;
      const target = event.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea')) return;
      dragging = true;
      startY = event.clientY;
      startTime = performance.now();
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      if (!dragging || !panel.current) return;
      const delta = Math.max(0, event.clientY - startY);
      gsap.set(panel.current, { y: delta < 0 ? delta * 0.2 : delta });
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      if (!dragging || !panel.current) return;
      dragging = false;
      const delta = event.clientY - startY;
      const velocity = delta / Math.max(1, performance.now() - startTime);
      if (delta > panel.current.offsetHeight / 3 || (delta > 40 && velocity > 0.6)) onClose();
      else settle();
    },
    onPointerCancel() {
      dragging = false;
      settle();
    },
  };
}
