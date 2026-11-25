import { useEffect, useState } from 'react';
import { clockParts } from '@/ui/data/clock';

export function useClock() {
  const [clock, setClock] = useState(clockParts);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(clockParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}
