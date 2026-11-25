import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

export interface PopoverProps {
  anchor: HTMLElement | null;
  align?: 'start' | 'end';
  label: string;
  className?: string;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}

export function Popover({ anchor, align = 'start', label, className = '', onClose, children }: PopoverProps) {
  const panel = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top: number; origin: string } | null>(null);
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const target = anchor?.getBoundingClientRect();
    const box = panel.current?.getBoundingClientRect();
    if (!box) return;

    let left = target && target.width ? (align === 'end' ? target.right - box.width : target.left) : 8;
    left = Math.max(10, Math.min(left, window.innerWidth - box.width - 10));
    let top = target ? target.bottom + 8 : 10;
    let above = false;
    if (target && top + box.height > window.innerHeight - 10 && target.top - box.height - 8 > 10) {
      top = target.top - box.height - 8;
      above = true;
    }
    setPlace({
      left,
      top,
      origin: `${target ? target.left + target.width / 2 - left : box.width / 2}px ${above ? '100%' : '0%'}`,
    });
  }, [anchor, align]);

  useLayoutEffect(() => {
    if (!place || !panel.current || reduce()) return;
    gsap.fromTo(
      panel.current,
      { scale: 0.92, opacity: 0, y: -6, transformOrigin: place.origin },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)', clearProps: 'transform,opacity' },
    );
    // Position is intentionally applied once when the popover first mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place !== null]);

  useLayoutEffect(() => {
    if (!closing) return;
    if (reduce()) {
      onCloseRef.current();
      return;
    }
    gsap.to(panel.current, {
      scale: 0.96,
      opacity: 0,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: () => onCloseRef.current(),
    });
  }, [closing]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !anchor?.contains(event.target as Node)) close();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', key);
    };
  }, [anchor]);

  return createPortal(
    <div
      ref={panel}
      className={`pop ${className}`}
      role="dialog"
      aria-label={label}
      style={{ left: place?.left, top: place?.top, visibility: place ? 'visible' : 'hidden' }}
    >
      {children(close)}
    </div>,
    document.body,
  );
}
