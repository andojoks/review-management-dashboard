import { MenuItem } from './MenuItem';
import { Popover } from './Popover';

export interface NewMenuProps {
  anchor: HTMLElement | null;
  onClose: () => void;
  onToast: (message: string) => void;
}

export function NewMenu({ anchor, onClose, onToast }: NewMenuProps) {
  return (
    <Popover anchor={anchor} align="end" label="New" onClose={onClose}>
      {(close) => {
        const run = (message: string) => { close(); onToast(message); };
        return (
          <>
            <div className="menu__label">New</div>
            <MenuItem icon="send" label="Ask for a review" onClick={() => run('Review request started')} />
            <MenuItem icon="userPlus" label="Invite a pro" onClick={() => run('Pro invitation ready')} />
            <div className="menu__sep" />
            <MenuItem icon="upload" label="Upload document" onClick={() => run('Document draft created')} />
            <MenuItem icon="mail" label="New message" onClick={() => run('Message draft created')} />
          </>
        );
      }}
    </Popover>
  );
}
