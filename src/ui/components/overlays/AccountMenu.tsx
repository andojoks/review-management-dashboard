import { go } from '@/router';
import type { ThemeChoice } from '@/ui/data/notices';
import { MenuItem } from './MenuItem';
import { Popover } from './Popover';

export interface AccountMenuProps {
  anchor: HTMLElement | null;
  themeChoice: ThemeChoice;
  setThemeChoice: (theme: ThemeChoice) => void;
  onClose: () => void;
  onOpenShortcuts: () => void;
  onSignOut: () => void;
}

export function AccountMenu({
  anchor,
  themeChoice,
  setThemeChoice,
  onClose,
  onOpenShortcuts,
  onSignOut,
}: AccountMenuProps) {
  const mark = (choice: ThemeChoice) => themeChoice === choice ? '  ✓' : '';

  return (
    <Popover anchor={anchor} align="start" label="Account" onClose={onClose}>
      {(close) => (
        <>
          <div className="menu__label">Odile Mensah · Trust &amp; reviews lead</div>
          <div className="menu__sep" />
          <MenuItem icon="user" label="Profile" onClick={() => { close(); go('settings/profile'); }} />
          <div className="menu__sep" />
          <MenuItem icon="sun" label={`Light${mark('light')}`} onClick={() => { setThemeChoice('light'); close(); }} />
          <MenuItem icon="moon" label={`Dark${mark('dark')}`} onClick={() => { setThemeChoice('dark'); close(); }} />
          <MenuItem icon="monitor" label={`Match system${mark('system')}`} onClick={() => { setThemeChoice('system'); close(); }} />
          <div className="menu__sep" />
          <MenuItem icon="users" label="Team" onClick={() => { close(); go('settings/team'); }} />
          <MenuItem icon="grid" label="Keyboard shortcuts" kbd="?" onClick={() => { close(); onOpenShortcuts(); }} />
          <div className="menu__sep" />
          <MenuItem icon="logout" label="Sign out" danger onClick={() => { close(); onSignOut(); }} />
        </>
      )}
    </Popover>
  );
}
