import { useCallback, useRef, useState } from 'react';
import type { ToastItem, ToastOptions } from '@/ui/components/feedback/Toasts';

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const close = useCallback((id: number) => {
    setItems((current) => current.map((item) => item.id === id && !item.closing ? { ...item, closing: true } : item));
  }, []);

  const push = useCallback((message: string, options: ToastOptions = {}) => {
    const id = ++nextId.current;
    setItems((current) => [
      ...current.map((item) => ({ ...item, closing: true })),
      { ...options, id, message, closing: false, close: () => close(id) },
    ]);
    const timer = window.setTimeout(() => close(id), options.duration ?? (options.undo ? 5500 : 3200));
    timers.current.set(id, timer);
  }, [close]);

  return { items, push, dismiss, close };
}
