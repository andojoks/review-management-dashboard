import { useLayoutEffect, useRef } from 'react';
import { counter, motionEnabled } from '@/ui/motion/interactions';

export interface CounterProps {
  value: number;
  format: (value: number) => string;
  className?: string;
  duration?: number;
  delay?: number;
}

/** Source `vc()`: the animated numeric spans used on KPIs and hero stats. */
export function Counter({ value, format, className = '', duration = 1.2, delay = 0 }: CounterProps) {
  const element = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!motionEnabled()) {
      if (element.current) element.current.textContent = format(value);
      return;
    }
    counter(element.current, value, format, { duration, delay });
  }, [value, format, duration, delay]);

  return <span ref={element} className={className}>{format(0)}</span>;
}
