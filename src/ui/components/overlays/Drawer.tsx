import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Icon } from '@/ui/components/primitives';
import { isMobileSheet, reduceMotion, sheetDuration, useSheetDrag } from '@/ui/motion/sheet';
import { SheetGrip } from './SheetGrip';

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
  const drag = useSheetDrag(panel, close);

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-locked');
    const isMobile = isMobileSheet();
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: sheetDuration(0.3) });
    gsap.fromTo(
      panel.current,
      isMobile ? { yPercent: 100 } : { xPercent: 104 },
      { xPercent: 0, yPercent: 0, duration: sheetDuration(0.6), ease: 'expo.out', clearProps: 'transform' },
    );
    const rows = panel.current?.querySelectorAll<HTMLElement>('.drawer__body > *');
    if (rows?.length && !reduceMotion()) {
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
    const isMobile = isMobileSheet();
    gsap.to(scrim.current, { opacity: 0, duration: sheetDuration(0.25) });
    if (reduceMotion()) {
      onCloseRef.current();
      return;
    }
    gsap.to(panel.current, {
      ...(isMobile ? { yPercent: 100 } : { xPercent: 104 }),
      duration: sheetDuration(0.32),
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

  return createPortal(
    <>
      <div className="scrim" ref={scrim} onClick={close} />
      <div className="drawer" ref={panel} role="dialog" aria-modal="true" tabIndex={-1} aria-label={title}>
        <SheetGrip panel={panel} onClose={close} />
        <div className="drawer__head" {...drag}>
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
    </>,
    document.body,
  );
}
