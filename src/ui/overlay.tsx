import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { Icon, type IconName } from './icons';
import { go } from '../router';
import { clockBase, noticeTime } from './clock';

export type OverlayKind = null | 'account' | 'new' | 'notifications';
export type ThemeChoice = 'light' | 'dark' | 'system';

export type Notice = {
  id: string;
  icon: IconName;
  tone: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  href?: string;
};

export const initialNotices: Notice[] = [
  { id: 'n1', icon: 'star', tone: 'bad', title: 'New 1-star review', body: 'A review for a plumber needs a reply within 24 hours.', at: clockBase - 22 * 60_000, read: false, href: '#/reviews/inbox' },
  { id: 'n2', icon: 'chat', tone: 'info', title: 'Marcus Okafor replied', body: '“Already booked in for Thursday to touch it up.”', at: clockBase - 70 * 60_000, read: false, href: '#/inbox/t2' },
  { id: 'n3', icon: 'file', tone: 'warn', title: '3 documents to check', body: 'Insurance renewals are waiting in Verification.', at: clockBase - 3 * 3_600_000, read: false, href: '#/documents/verification' },
  { id: 'n4', icon: 'trend', tone: 'good', title: 'Weekly rating up', body: 'The average rating had its best week this year.', at: clockBase - 20 * 3_600_000, read: true, href: '#/insights' },
  { id: 'n5', icon: 'chart', tone: 'plain', title: 'October report is ready', body: 'The trust report was added to Documents › Reports.', at: clockBase - 2 * 86_400_000, read: true, href: '#/documents/library' },
];

function Popover({ anchor, align = 'start', label, className = '', onClose, children }: {
  anchor: HTMLElement | null;
  align?: 'start' | 'end';
  label: string;
  className?: string;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ left: number; top: number; origin: string } | null>(null);
  const [closing, setClosing] = useState(false);
  const close = () => setClosing(true);
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useLayoutEffect(() => {
    const target = anchor?.getBoundingClientRect();
    const box = panel.current?.getBoundingClientRect();
    if (!box) return;
    let left = target && target.width ? (align === 'end' ? target.right - box.width : target.left) : 8;
    left = Math.max(10, Math.min(left, window.innerWidth - box.width - 10));
    let top = target ? target.bottom + 8 : 10;
    let above = false;
    if (target && top + box.height > window.innerHeight - 10 && target.top - box.height - 8 > 10) {
      top = target.top - box.height - 8;
      above = true;
    }
    setPlace({
      left,
      top,
      origin: `${target ? target.left + target.width / 2 - left : box.width / 2}px ${above ? '100%' : '0%'}`,
    });
  }, [anchor, align]);

  useLayoutEffect(() => {
    if (!place || !panel.current || reduce()) return;
    gsap.fromTo(panel.current,
      { scale: 0.92, opacity: 0, y: -6, transformOrigin: place.origin },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)', clearProps: 'transform,opacity' },
    );
  }, [place !== null]);

  useLayoutEffect(() => {
    if (!closing) return;
    if (reduce()) {
      onClose();
      return;
    }
    gsap.to(panel.current, { scale: 0.96, opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: onClose });
  }, [closing]);

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !anchor?.contains(event.target as Node)) close();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', key);
    };
  }, [anchor]);

  return createPortal(
    <div
      ref={panel}
      className={`pop ${className}`}
      role="dialog"
      aria-label={label}
      style={{ left: place?.left, top: place?.top, visibility: place ? 'visible' : 'hidden' }}
    >
      {children(close)}
    </div>,
    document.body,
  );
}

function MenuItem({ icon: name, label, kbd, danger, onClick }: {
  icon: IconName;
  label: string;
  kbd?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`menu__item${danger ? ' menu__item--danger' : ''}`} onClick={onClick}>
      <Icon name={name} />
      <span>{label}</span>
      {kbd ? <span className="kbd">{kbd}</span> : null}
    </button>
  );
}

function AccountMenu({ anchor, themeChoice, setThemeChoice, onClose, onOpenShortcuts, onSignOut }: {
  anchor: HTMLElement | null;
  themeChoice: ThemeChoice;
  setThemeChoice: (theme: ThemeChoice) => void;
  onClose: () => void;
  onOpenShortcuts: () => void;
  onSignOut: () => void;
}) {
  const mark = (choice: ThemeChoice) => themeChoice === choice ? '  ✓' : '';
  return (
    <Popover anchor={anchor} align="start" label="Account" onClose={onClose}>
      {(close) => <>
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
      </>}
    </Popover>
  );
}

function NewMenu({ anchor, onClose, onToast }: {
  anchor: HTMLElement | null;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  return (
    <Popover anchor={anchor} align="end" label="New" onClose={onClose}>
      {(close) => {
        const run = (message: string) => { close(); onToast(message); };
        return <>
          <div className="menu__label">New</div>
          <MenuItem icon="send" label="Ask for a review" onClick={() => run('Review request started')} />
          <MenuItem icon="userPlus" label="Invite a pro" onClick={() => run('Pro invitation ready')} />
          <div className="menu__sep" />
          <MenuItem icon="upload" label="Upload document" onClick={() => run('Document draft created')} />
          <MenuItem icon="mail" label="New message" onClick={() => run('Message draft created')} />
        </>;
      }}
    </Popover>
  );
}

function NotificationsMenu({ anchor, notices, onMarkAll, onRead, onClose }: {
  anchor: HTMLElement | null;
  notices: Notice[];
  onMarkAll: () => void;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!list.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo([...list.current.children], { opacity: 0, y: 8 }, {
      opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.04, delay: 0.08, clearProps: 'transform,opacity',
    });
  }, []);
  return (
    <Popover anchor={anchor} align="end" label="Notifications" className="notices" onClose={onClose}>
      {(close) => <>
        <div className="notices__head">
          <b>Notifications</b>
          {notices.some((notice) => !notice.read) ? (
            <button type="button" className="linkbtn" onClick={onMarkAll}>Mark all read</button>
          ) : null}
        </div>
        <div className="notices__list" ref={list}>
          {notices.slice(0, 10).map((notice) => (
            <button
              type="button"
              key={notice.id}
              className={`notice${notice.read ? '' : ' is-unread'}`}
              onClick={() => {
                onRead(notice.id);
                close();
                if (notice.href) window.location.hash = notice.href;
              }}
            >
              <span className={`notice__ico tone--${notice.tone}`}><Icon name={notice.icon} /></span>
              <span className="notice__text">
                <b>{notice.title}</b>
                <p>{notice.body}</p>
                <small>{noticeTime(notice.at)}</small>
              </span>
            </button>
          ))}
        </div>
        <a className="notices__all" href="#/settings/notifications" onClick={close}>
          Notification settings <Icon name="arrowR" size="sm" />
        </a>
      </>}
    </Popover>
  );
}

export function Overlay({ kind, anchor, themeChoice, setThemeChoice, notices, onMarkAll, onRead, onClose, onOpenShortcuts, onSignOut, onToast }: {
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
}) {
  if (!kind) return null;
  if (kind === 'account') {
    return <AccountMenu
      anchor={anchor}
      themeChoice={themeChoice}
      setThemeChoice={setThemeChoice}
      onClose={onClose}
      onOpenShortcuts={onOpenShortcuts}
      onSignOut={onSignOut}
    />;
  }
  if (kind === 'new') return <NewMenu anchor={anchor} onClose={onClose} onToast={onToast} />;
  return <NotificationsMenu anchor={anchor} notices={notices} onMarkAll={onMarkAll} onRead={onRead} onClose={onClose} />;
}
