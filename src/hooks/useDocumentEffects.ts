import { useEffect } from 'react';
import { routeMeta, subLabel, type RouteKey } from '@/router';

export function useDocumentTitle(route: RouteKey, sub?: string) {
  useEffect(() => {
    const label = sub ? subLabel(route, sub) : undefined;
    document.title = `${label ? `${label} · ` : ''}${routeMeta[route].label} — Raveno`;
  }, [route, sub]);
}

export function useScrollState() {
  useEffect(() => {
    const onScroll = () => document.querySelector('.top')?.classList.toggle('is-stuck', window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', locked);
    return () => document.documentElement.classList.remove('is-locked');
  }, [locked]);
}
