import { useCallback, useRef, useState } from 'react';
import type { ToastItem } from '@/ui/components/feedback/Toasts';

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const push = useCallback((message: string) => {
    const id = ++nextId.current;
    setItems((current) => [...current, { id, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3200);
  }, []);

  return { items, push };
}
