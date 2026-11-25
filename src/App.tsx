import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeHash } from '@/router';
import { AppShell } from '@/ui/components/layout';
import { initialNotices, type Notice, type OverlayKind } from '@/ui/data/notices';
import { useDocumentTitle, useScrollLock, useScrollState } from '@/hooks/useDocumentEffects';
import { useHash } from '@/hooks/useHash';
import { useIntroAnimation } from '@/hooks/useIntroAnimation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useLiveFeed } from '@/hooks/useLiveFeed';
import { useNavPills } from '@/hooks/useNavPills';
import { useRail } from '@/hooks/useRail';
import { useTheme } from '@/hooks/useTheme';
import { useToasts } from '@/hooks/useToasts';
import { useTooltip } from '@/hooks/useTooltip';

export default function App() {
  const hash = useHash();
  const { route, sub, detail } = useMemo(() => normalizeHash(hash), [hash]);
  const { choice: themeChoice, setChoice: setThemeChoice, dark, toggle: toggleTheme } = useTheme();
  const { rail, toggle: toggleRail } = useRail();
  const [signedIn, setSignedIn] = useState(true);
  const [overlay, setOverlay] = useState<{ kind: OverlayKind; anchor: HTMLElement | null }>({ kind: null, anchor: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [reviewCount, setReviewCount] = useState(16);
  const { items: toastItems, push: pushToast } = useToasts();
  const tip = useTooltip();

  useDocumentTitle(route, sub);
  useScrollState();
  useScrollLock(drawerOpen || finderOpen || shortcutsOpen || !signedIn);
  useIntroAnimation();
  useNavPills(route, sub, rail, themeChoice);

  const noticeUnread = notices.filter((notice) => !notice.read).length;

  useEffect(() => {
    const canonical = `#/${route}${sub ? `/${sub}` : ''}${detail ? `/${detail}` : ''}`;
    if (hash !== canonical) window.location.hash = canonical;
  }, [hash, route, sub, detail]);

  const openOverlay = useCallback((kind: OverlayKind, anchor?: HTMLElement | null) => {
    setOverlay((current) => current.kind === kind ? { kind: null, anchor: null } : { kind, anchor: anchor || null });
  }, []);
  const closeOverlay = useCallback(() => setOverlay({ kind: null, anchor: null }), []);
  const openFinder = useCallback(() => setFinderOpen(true), []);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);
  const openNew = useCallback(() => {
    const anchor = document.querySelector<HTMLElement>('.top__new');
    if (anchor?.offsetParent) openOverlay('new', anchor);
  }, [openOverlay]);

  useKeyboardShortcuts({
    signedIn,
    onFinder: openFinder,
    onShortcuts: openShortcuts,
    onRailToggle: toggleRail,
    onOpenNew: openNew,
  });

  const onReview = useCallback((update: (count: number) => number) => setReviewCount(update), []);
  const onNotice = useCallback((notice: Notice) => setNotices((items) => [notice, ...items]), []);
  useLiveFeed(onReview, onNotice);

  const markAllRead = useCallback(() => {
    setNotices((items) => items.map((notice) => ({ ...notice, read: true })));
  }, []);
  const readNotice = useCallback((id: string) => {
    setNotices((items) => items.map((notice) => notice.id === id ? { ...notice, read: true } : notice));
  }, []);
  const signOut = useCallback(() => {
    setSignedIn(false);
    pushToast('Welcome back, Odile');
  }, [pushToast]);
  const enter = useCallback(() => setSignedIn(true), []);

  return (
    <AppShell
      route={route}
      sub={sub}
      detail={detail}
      rail={rail}
      dark={dark}
      themeChoice={themeChoice}
      signedIn={signedIn}
      notices={notices}
      noticeUnread={noticeUnread}
      inboxUnread={4}
      reviewCount={reviewCount}
      overlayKind={overlay.kind}
      overlayAnchor={overlay.anchor}
      drawerOpen={drawerOpen}
      finderOpen={finderOpen}
      shortcutsOpen={shortcutsOpen}
      toasts={toastItems}
      tip={tip}
      onFinder={openFinder}
      onAccount={(anchor) => openOverlay('account', anchor)}
      onMenu={() => setDrawerOpen(true)}
      onTheme={toggleTheme}
      onRail={toggleRail}
      onNotifications={(anchor) => openOverlay('notifications', anchor)}
      onNew={(anchor) => openOverlay('new', anchor)}
      onCloseOverlay={closeOverlay}
      onMarkAll={markAllRead}
      onRead={readNotice}
      onOpenShortcuts={openShortcuts}
      onSignOut={signOut}
      onToast={pushToast}
      onCloseDrawer={() => setDrawerOpen(false)}
      onCloseFinder={() => setFinderOpen(false)}
      onCloseShortcuts={() => setShortcutsOpen(false)}
      onEnter={enter}
      setThemeChoice={setThemeChoice}
    />
  );
}
