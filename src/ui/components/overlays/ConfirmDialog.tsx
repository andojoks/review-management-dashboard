import { Modal } from './Modal';

export interface ConfirmDialogProps {
  title: string;
  body: string;
  ok?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Source `confirm()` modal: scrim, bottom sheet on phones, cancel/confirm foot. */
export function ConfirmDialog({
  title,
  body,
  ok = 'Confirm',
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      foot={(close) => (
        <>
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
        </>
      )}
    >
      <p className="muted" style={{ fontSize: 'var(--fs-base)' }}>{body}</p>
    </Modal>
  );
}
