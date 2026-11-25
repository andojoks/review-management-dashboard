import { Icon, Kbd } from '@/ui/components/primitives';

const rows: [string, string][] = [
  ['⌘ K', 'Search reviews, pros, clients'],
  ['/', 'Search'],
  ['N', 'New…'],
  ['G then O', 'Overview'],
  ['G then I', 'Insights'],
  ['G then R', 'Reviews'],
  ['G then P', 'Pros'],
  ['G then C', 'Clients'],
  ['G then D', 'Documents'],
  ['G then M', 'Inbox'],
  ['[', 'Fold the sidebar'],
  ['Esc', 'Close'],
  ['?', 'This list'],
];

export function ShortcutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-wrap" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__head">
          <h2>Keyboard shortcuts</h2>
          <button type="button" className="ibtn ibtn--flat ibtn--sm" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <div className="modal__body">
          <div className="keys">
            {rows.map(([keys, label]) => (
              <div className="row-set" key={keys}>
                <span className="row-set__text"><b>{label}</b></span>
                <Kbd>{keys}</Kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
