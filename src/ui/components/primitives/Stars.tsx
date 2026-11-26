import { useId, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motionEnabled } from '@/ui/motion/interactions';

export interface StarsProps {
  value?: number;
  size?: number;
  pop?: boolean;
  label?: string;
}

const starPath = 'M12 2.8l2.75 5.6 6.15.9-4.45 4.35 1.05 6.12L12 16.87l-5.5 2.9 1.05-6.12L3.1 9.3l6.15-.9z';

export function Stars({ value = 5, size = 14, pop = false, label }: StarsProps) {
  const id = useId().replace(/:/g, '');
  const element = useRef<HTMLSpanElement>(null);
  const accessibleLabel = label ?? `${value.toFixed(1)} out of 5 stars`;

  useLayoutEffect(() => {
    if (pop && element.current && motionEnabled()) {
      // Source `Lc()`: stars pop in with a slight rotation, then clear transforms.
      gsap.fromTo(Array.from(element.current.children), {
        scale: .3, opacity: 0, rotation: -40,
      }, {
        scale: 1, opacity: 1, rotation: 0,
        duration: .55, ease: 'back.out(2.6)', stagger: .06, delay: .1,
        clearProps: 'transform,opacity',
      });
    }
  }, [pop, value]);

  return (
    <span className="stars" ref={element} role="img" aria-label={accessibleLabel}>
      {[0, 1, 2, 3, 4].map((index) => {
        const clipId = `${id}_s${index}`;
        const ratio = Math.max(0, Math.min(1, value - index));
        return (
          <svg key={index} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={ratio * 24} height="24" />
              </clipPath>
            </defs>
            <path className="stars__off" d={starPath} />
            {ratio > 0 ? <path className="stars__on" d={starPath} clipPath={`url(#${clipId})`} /> : null}
          </svg>
        );
      })}
    </span>
  );
}
