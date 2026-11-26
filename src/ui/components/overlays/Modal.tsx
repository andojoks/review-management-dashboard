import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Icon } from '@/ui/components/primitives';

export interface ModalProps {
  title: string;
  sub?: string;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode | ((close: () => void) => ReactNode);
  foot?: ReactNode | ((close: () => void) => ReactNode);
}

/** Source `openModal()` shell: scrim, centred card and GSAP pop-in. */
export function Modal({ title, sub, wide = false, onClose, children, foot }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    gsap.to(panel.current, { opacity: 0, y: 12, duration: .2, ease: 'power2.in', onComplete: finish });
    window.setTimeout(finish, 240);
  };

  useLayoutEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(panel.current,
        { opacity: 0, y: 18, scale: .96 },
        { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.8)', clearProps: 'transform,opacity' });
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
      <div className="scrim" onClick={close} />
      <div className="modal-wrap">
        <div
          className={`modal${wide ? ' modal--wide' : ''}`}
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal__head">
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
