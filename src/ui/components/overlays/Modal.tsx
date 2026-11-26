import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Icon } from '@/ui/components/primitives';
import { isMobileSheet, reduceMotion, sheetDuration, useSheetDrag } from '@/ui/motion/sheet';
import { SheetGrip } from './SheetGrip';

export interface ModalProps {
  title: string;
  sub?: string;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode | ((close: () => void) => ReactNode);
  foot?: ReactNode | ((close: () => void) => ReactNode);
}

/** Source `openModal()` shell: scrim, centred card, mobile bottom sheet and GSAP entrance. */
export function Modal({ title, sub, wide = false, onClose, children, foot }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const finished = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onCloseRef.current();
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    gsap.to(scrim.current, { opacity: 0, duration: sheetDuration(0.22) });
    if (reduceMotion()) {
      finish();
      return;
    }
    if (isMobileSheet()) {
      gsap.to(panel.current, {
        yPercent: 100,
        duration: sheetDuration(0.3),
        ease: 'power3.in',
        onComplete: finish,
      });
    } else {
      gsap.to(panel.current, {
        scale: 0.94,
        opacity: 0,
        duration: sheetDuration(0.2),
        ease: 'power2.in',
        onComplete: finish,
      });
    }
    // Background tabs throttle rAF; keep a fallback so the modal always closes.
    window.setTimeout(finish, 340);
  };

  const drag = useSheetDrag(panel, close);

  useLayoutEffect(() => {
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: sheetDuration(0.3) });
    if (isMobileSheet()) {
      gsap.fromTo(panel.current,
        { yPercent: 100 },
        { yPercent: 0, duration: sheetDuration(0.55), ease: 'expo.out', clearProps: 'transform' });
    } else if (!reduceMotion()) {
      gsap.fromTo(panel.current,
        { scale: 0.86, opacity: 0 },
        { scale: 1, opacity: 1, duration: sheetDuration(0.5), ease: 'back.out(1.5)', clearProps: 'transform,opacity' });
    }
    panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <>
      <div className="scrim" ref={scrim} onClick={close} />
      <div className="modal-wrap">
        <div
          className={`modal${wide ? ' modal--wide' : ''}`}
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <SheetGrip panel={panel} onClose={close} />
          <div className="modal__head" {...drag}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2>{title}</h2>
              {sub ? <p>{sub}</p> : null}
            </div>
            <button type="button" className="ibtn ibtn--flat ibtn--sm" aria-label="Close" data-skipfocus onClick={close}>
              <Icon name="close" />
            </button>
          </div>
          <div className="modal__body">{typeof children === 'function' ? children(close) : children}</div>
          {foot ? <div className="modal__foot">{typeof foot === 'function' ? foot(close) : foot}</div> : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
