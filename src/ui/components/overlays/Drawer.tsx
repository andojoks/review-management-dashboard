import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { Icon } from '@/ui/components/primitives';

const mobile = () => window.innerWidth <= 760;
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = (value: number) => reduce() ? 0 : value;

export interface DrawerProps {
  title: string;
  sub?: string;
  foot?: (close: () => void) => ReactNode;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}

export function Drawer({ title, sub, foot, onClose, children }: DrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-locked');
    const isMobile = mobile();
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: duration(0.3) });
    gsap.fromTo(
      panel.current,
      isMobile ? { yPercent: 100 } : { xPercent: 104 },
      { xPercent: 0, yPercent: 0, duration: duration(0.6), ease: 'expo.out', clearProps: 'transform' },
    );
    const rows = panel.current?.querySelectorAll<HTMLElement>('.drawer__body > *');
    if (rows?.length && !reduce()) {
      gsap.fromTo(rows, { opacity: 0, y: 14 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: 0.12,
        stagger: 0.04,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }
    panel.current?.focus({ preventScroll: true });
    return () => document.documentElement.classList.remove('is-locked');
  }, []);

  useLayoutEffect(() => {
    if (!closing) return;
    const isMobile = mobile();
    gsap.to(scrim.current, { opacity: 0, duration: duration(0.25) });
    if (reduce()) {
      onCloseRef.current();
      return;
    }
    gsap.to(panel.current, {
      ...(isMobile ? { yPercent: 100 } : { xPercent: 104 }),
      duration: duration(0.32),
      ease: 'power3.in',
      onComplete: () => onCloseRef.current(),
    });
  }, [closing]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  return (
    <>
      <div className="scrim" ref={scrim} onClick={close} />
      <div className="drawer" ref={panel} role="dialog" aria-modal="true" tabIndex={-1} aria-label={title}>
        <div className="drawer__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{title}</h2>
            {sub ? <p>{sub}</p> : null}
          </div>
          <button type="button" className="ibtn ibtn--flat ibtn--sm" aria-label="Close" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        <div className="drawer__body">{children(close)}</div>
        {foot ? <div className="drawer__foot">{foot(close)}</div> : null}
      </div>
    </>
  );
}
