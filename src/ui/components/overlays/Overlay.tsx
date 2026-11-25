import type { Notice, OverlayKind, ThemeChoice } from '@/ui/data/notices';
import { AccountMenu } from './AccountMenu';
import { NewMenu } from './NewMenu';
import { NotificationsMenu } from './NotificationsMenu';

export interface OverlayProps {
  kind: OverlayKind;
  anchor: HTMLElement | null;
  themeChoice: ThemeChoice;
  setThemeChoice: (theme: ThemeChoice) => void;
  notices: Notice[];
  onMarkAll: () => void;
  onRead: (id: string) => void;
  onClose: () => void;
  onOpenShortcuts: () => void;
  onSignOut: () => void;
  onToast: (message: string) => void;
}

export function Overlay({
  kind,
  anchor,
  themeChoice,
  setThemeChoice,
  notices,
  onMarkAll,
  onRead,
  onClose,
  onOpenShortcuts,
  onSignOut,
  onToast,
}: OverlayProps) {
  if (!kind) return null;
  if (kind === 'account') {
    return (
      <AccountMenu
        anchor={anchor}
        themeChoice={themeChoice}
        setThemeChoice={setThemeChoice}
        onClose={onClose}
        onOpenShortcuts={onOpenShortcuts}
        onSignOut={onSignOut}
      />
    );
  }
  if (kind === 'new') return <NewMenu anchor={anchor} onClose={onClose} onToast={onToast} />;
  return (
    <NotificationsMenu
      anchor={anchor}
      notices={notices}
      onMarkAll={onMarkAll}
      onRead={onRead}
      onClose={onClose}
    />
  );
}
