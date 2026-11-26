import { Kbd } from '@/ui/components/primitives';
import { Modal } from './Modal';

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
    <Modal title="Keyboard shortcuts" onClose={onClose}>
      <div className="keys">
        {rows.map(([keys, label]) => (
          <div className="row-set" key={keys}>
            <span className="row-set__text"><b>{label}</b></span>
            <Kbd>{keys}</Kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
