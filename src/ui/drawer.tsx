import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { Icon } from './icons';

const mobile = () => window.innerWidth <= 760;
const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const duration = (value: number) => reduce() ? 0 : value;

export function Drawer({ title, sub, onClose, children }: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-locked');
    const isMobile = mobile();
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: duration(.3) });
    gsap.fromTo(panel.current,
      isMobile ? { yPercent: 100 } : { xPercent: 104 },
      { xPercent: 0, yPercent: 0, duration: duration(.6), ease: 'expo.out', clearProps: 'transform' },
    );
    const rows = panel.current?.querySelectorAll<HTMLElement>('.drawer__body > *');
    if (rows?.length && !reduce()) {
      gsap.fromTo(rows, { opacity: 0, y: 14 }, {
        opacity: 1, y: 0, duration: .5, delay: .12, stagger: .04, ease: 'power3.out', clearProps: 'transform,opacity',
      });
    }
    panel.current?.focus({ preventScroll: true });
    return () => document.documentElement.classList.remove('is-locked');
  }, []);

  useLayoutEffect(() => {
    if (!closing) return;
    const isMobile = mobile();
    gsap.to(scrim.current, { opacity: 0, duration: duration(.25) });
    if (reduce()) {
      onClose();
      return;
    }
    gsap.to(panel.current, {
      ...(isMobile ? { yPercent: 100 } : { xPercent: 104 }),
      duration: duration(.32),
      ease: 'power3.in',
      onComplete: onClose,
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

  return <>
    <div className="scrim" ref={scrim} onClick={close} />
    <div className="drawer" ref={panel} role="dialog" aria-modal="true" tabIndex={-1} aria-label={title}>
      <div className="drawer__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        <button type="button" className="ibtn ibtn--flat ibtn--sm" aria-label="Close" onClick={close}><Icon name="close" /></button>
      </div>
      <div className="drawer__body">{children(close)}</div>
    </div>
  </>;
}
