import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';

export interface TooltipProps {
  text: string;
  x: number;
  y: number;
  side: boolean;
}

export function Tooltip({ text, x, y, side }: TooltipProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const sideRef = useRef(side);
  sideRef.current = side;

  useLayoutEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: sideRef.current ? -4 : 0, y: sideRef.current ? 0 : -4 },
      { opacity: 1, x: 0, y: 0, duration: 0.25, ease: 'power3.out' },
    );
  }, [text]);

  const style = { left: x, top: y, translate: side ? '0 -50%' : '-50% 0' } as CSSProperties;
  return <span ref={ref} className="tip" style={style}>{text}</span>;
}
