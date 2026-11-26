import { useCallback, useMemo, useState } from 'react';
import {
  useAddNotice, useBootstrap, useSetSignedIn, useUpdateNotice,
} from '@/stores';
import type { ModalRequest, Notice, OverlayKind } from '@/types';
import { normalizeHash } from '@/router';
import { AppShell } from '@/ui/components/layout';
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
  const state = useBootstrap();
  const addNotice = useAddNotice();
  const updateNotice = useUpdateNotice();
  const setSignedIn = useSetSignedIn();
  const signedIn = state.signedIn;
  const [overlay, setOverlay] = useState<{ kind: OverlayKind; anchor: HTMLElement | null }>({ kind: null, anchor: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [finderOpen, setFinderOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const notices = state.notices;
  const [modal, setModal] = useState<ModalRequest | null>(null);
  const reviewCount = state.reviews.filter((review) => review.status === 'new').length;
  const inboxUnread = state.threads.reduce((sum, thread) => sum + thread.unread, 0);
  const { items: toastItems, push: pushToast, dismiss: dismissToast } = useToasts();
  const tip = useTooltip();

  useDocumentTitle(route, sub);
  useScrollState();
  useScrollLock(drawerOpen || finderOpen || shortcutsOpen || Boolean(modal) || !signedIn);
  useIntroAnimation();
  useNavPills(route, sub, rail, themeChoice);

  const noticeUnread = notices.filter((notice) => !notice.read).length;

  const openOverlay = useCallback((kind: OverlayKind, anchor?: HTMLElement | null) => {
    setOverlay((current) => current.kind === kind ? { kind: null, anchor: null } : { kind, anchor: anchor || null });
  }, []);
  const closeOverlay = useCallback(() => setOverlay({ kind: null, anchor: null }), []);
  const openFinder = useCallback(() => setFinderOpen(true), []);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);
  const openModal = useCallback((request: ModalRequest) => setModal(request), []);
  const closeModal = useCallback(() => setModal(null), []);
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

  const onNotice = useCallback((notice: Notice) => addNotice.mutate(notice), [addNotice]);
  useLiveFeed(onNotice);

  const markAllRead = useCallback(() => {
    notices.forEach((notice) => {
      if (!notice.read) updateNotice.mutate({ id: notice.id, patch: { read: true } });
    });
  }, [notices, updateNotice]);
  const readNotice = useCallback((id: string) => {
    updateNotice.mutate({ id, patch: { read: true } });
  }, [updateNotice]);
  const signOut = useCallback(() => {
    setSignedIn.mutate(false);
    pushToast('Welcome back, Odile');
  }, [pushToast, setSignedIn]);
  const enter = useCallback(() => setSignedIn.mutate(true), [setSignedIn]);

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
      inboxUnread={inboxUnread}
      reviewCount={reviewCount}
      overlayKind={overlay.kind}
      overlayAnchor={overlay.anchor}
      drawerOpen={drawerOpen}
      finderOpen={finderOpen}
      shortcutsOpen={shortcutsOpen}
      toasts={toastItems}
      modal={modal}
      onDismissToast={dismissToast}
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
      onNotice={onNotice}
      openModal={openModal}
      onCloseModal={closeModal}
      onCloseDrawer={() => setDrawerOpen(false)}
      onCloseFinder={() => setFinderOpen(false)}
      onCloseShortcuts={() => setShortcutsOpen(false)}
      onEnter={enter}
      setThemeChoice={setThemeChoice}
    />
  );
}
