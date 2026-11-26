import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { Icon } from '@/ui/components/primitives';

export interface ConfirmDialogProps {
  title: string;
  body: string;
  ok?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Source `confirm()` modal: scrim, centred card and cancel/confirm foot. */
export function ConfirmDialog({
  title,
  body,
  ok = 'Confirm',
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
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
    // The source closes on the tween callback; keep a timer as a fallback for
    // background tabs where requestAnimationFrame can be throttled.
    window.setTimeout(finish, 240);
  };

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const element = panel.current;
    gsap.fromTo(
      element,
      { opacity: 0, y: 18, scale: .96 },
      { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.8)', clearProps: 'transform,opacity' },
    );
    const timer = window.setTimeout(() => {
      if (!closing.current && element) gsap.set(element, { clearProps: 'transform,opacity' });
    }, 520);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <>
      <div className="scrim" onClick={close} />
      <div className="modal-wrap">
        <div
          className="modal"
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="modal__head">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2>{title}</h2>
            </div>
            <button type="button" className="ibtn ibtn--flat ibtn--sm" aria-label="Close" onClick={close} data-skipfocus>
              <Icon name="close" />
            </button>
          </div>
          <div className="modal__body">
            <p className="muted" style={{ fontSize: 'var(--fs-base)' }}>{body}</p>
          </div>
          <div className="modal__foot">
            <button type="button" className="btn" onClick={close}>Cancel</button>
            <button
              type="button"
              className={`btn ${danger ? 'btn--dark' : 'btn--primary'}`}
              data-autofocus
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              {ok}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
