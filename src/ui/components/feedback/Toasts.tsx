import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motionDuration } from '@/ui/motion/interactions';
import { Icon } from '@/ui/components/primitives';

export interface ToastOptions {
  undo?: () => void;
  warn?: boolean;
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: number;
  message: string;
  closing?: boolean;
  close?: () => void;
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss?: (id: number) => void }) {
  const element = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!element.current) return;
    const tween = gsap.fromTo(
      element.current,
      { y: 30, opacity: 0, scale: 0.94 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: motionDuration(0.5),
        ease: 'back.out(1.8)',
        clearProps: 'transform,opacity',
      },
    );
    return () => { tween.kill(); };
  }, []);

  useLayoutEffect(() => {
    if (!toast.closing || !element.current) return;
    if (motionDuration(0.25) === 0) {
      onDismiss?.(toast.id);
      return;
    }
    const tween = gsap.to(element.current, {
      y: 16,
      opacity: 0,
      duration: motionDuration(0.25),
      ease: 'power2.in',
      onComplete: () => onDismiss?.(toast.id),
    });
    return () => { tween.kill(); };
  }, [toast.closing, toast.id, onDismiss]);

  return (
    <div className={`toast${toast.warn ? ' is-warn' : ''}`} ref={element} role="status">
      <Icon name={toast.warn ? 'alert' : 'check'} />
      <span>{toast.message}</span>
      {toast.undo ? (
        <button
          type="button"
          onClick={() => {
            toast.undo?.();
            toast.close?.();
          }}
        >
          Undo
        </button>
      ) : null}
    </div>
  );
}

export function Toasts({ items, onDismiss }: { items: ToastItem[]; onDismiss?: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
