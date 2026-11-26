import type { OpenModal } from '@/ui/data/modals';
import { MenuItem } from './MenuItem';
import { Popover } from './Popover';

export interface NewMenuProps {
  anchor: HTMLElement | null;
  onClose: () => void;
  onToast: (message: string) => void;
  openModal: OpenModal;
}

export function NewMenu({ anchor, onClose, openModal }: NewMenuProps) {
  return (
    <Popover anchor={anchor} align="end" label="New" onClose={onClose}>
      {(close) => {
        const run = (kind: 'review' | 'invitePro' | 'upload' | 'message') => {
          close();
          openModal({ kind });
        };
        return (
          <>
            <div className="menu__label">New</div>
            <MenuItem icon="send" label="Ask for a review" onClick={() => run('review')} />
            <MenuItem icon="userPlus" label="Invite a pro" onClick={() => run('invitePro')} />
            <div className="menu__sep" />
            <MenuItem icon="upload" label="Upload document" onClick={() => run('upload')} />
            <MenuItem icon="mail" label="New message" onClick={() => run('message')} />
          </>
        );
      }}
    </Popover>
  );
}
