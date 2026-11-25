import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';

const OUT = .18;
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reference page swap: visible cards/rows sink and fade, the outgoing view
 * slides against the navigation direction, then the new view slides back in.
 */
export function ViewTransition({ k, order, children, className = '', onSwap }: {
  k: string;
  order: number;
  children: ReactNode;
  className?: string;
  onSwap?: () => void;
}) {
  const [shown, setShown] = useState({ k, node: children });
  const latest = useRef(children);
  if (shown.k === k) latest.current = children;
  const view = useRef<HTMLDivElement>(null);
  const current = useRef({ k, node: children, onSwap });
  current.current = { k, node: children, onSwap };
  const previousOrder = useRef(order);
  const direction = useRef(1);
  const busy = useRef(false);

  useLayoutEffect(() => {
    if (shown.k === k) return;
    direction.current = order >= previousOrder.current ? 1 : -1;
    previousOrder.current = order;
    const element = view.current;
    if (!element || reduce()) {
      current.current.onSwap?.();
      setShown({ k: current.current.k, node: current.current.node });
      return;
    }
    if (busy.current) return;
    busy.current = true;

    const viewport = window.innerHeight;
    const cards = [...element.querySelectorAll<HTMLElement>('.card, .kpi, .lane')].filter((card) => {
      const box = card.getBoundingClientRect();
      return box.bottom > 0 && box.top < viewport;
    });

    gsap.to(cards, { opacity: 0, y: 8, scale: .985, duration: OUT, ease: 'power2.in', stagger: .008, overwrite: true });
    gsap.to(element.querySelectorAll('.phead, .tabs, .toolbar, .chips'), {
      opacity: 0, y: -6, duration: OUT * .8, ease: 'power1.in',
    });
    gsap.to(element, {
      x: -direction.current * 16,
      opacity: 0,
      duration: OUT + .008 * Math.max(0, cards.length - 1),
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => {
        busy.current = false;
        current.current.onSwap?.();
        setShown({ k: current.current.k, node: current.current.node });
      },
    });
  }, [k]);

  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!view.current || reduce()) return;
    gsap.set(view.current, { opacity: 1, clearProps: 'opacity' });
    gsap.fromTo(view.current, { x: direction.current * 26 }, {
      x: 0, duration: .7, ease: 'expo.out', overwrite: true, clearProps: 'transform',
    });
  }, [shown.k]);

  return <div ref={view} className={className}>{shown.k === k ? children : shown.node}</div>;
}
