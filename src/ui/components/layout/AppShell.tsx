import { Suspense } from 'react';
import { routePosition, type RouteKey } from '@/router';
import { pageModules } from '@/app/pages';
import { ViewTransition } from '@/ui/motion/pageTransition';
import type { ModalRequest } from '@/ui/data/modals';
import type { OpenModal } from '@/ui/data/modals';
import type { OverlayKind, ThemeChoice } from '@/ui/data/notices';
import type { Notice } from '@/ui/data/notices';
import { AllPages } from './AllPages';
import { MobileTabbar } from './MobileTabbar';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toasts, Tooltip, type ToastItem, type ToastOptions } from '@/ui/components/feedback';
import {
  Drawer,
  Finder,
  GlobalModals,
  Overlay,
  ShortcutModal,
  SignIn,
} from '@/ui/components/overlays';

export interface AppShellProps {
  route: RouteKey;
  sub?: string;
  detail?: string;
  rail: boolean;
  dark: boolean;
  themeChoice: ThemeChoice;
  signedIn: boolean;
  notices: Notice[];
  noticeUnread: number;
  inboxUnread: number;
  reviewCount: number;
  overlayKind: OverlayKind;
  overlayAnchor: HTMLElement | null;
  drawerOpen: boolean;
  finderOpen: boolean;
  shortcutsOpen: boolean;
  toasts: ToastItem[];
  modal: ModalRequest | null;
  onDismissToast: (id: number) => void;
  tip: { text: string; x: number; y: number; side: boolean } | null;
  onFinder: () => void;
  onAccount: (anchor: HTMLElement) => void;
  onMenu: () => void;
  onTheme: (anchor?: HTMLElement | null) => void;
  onRail: (next: boolean) => void;
  onNotifications: (anchor: HTMLElement) => void;
  onNew: (anchor: HTMLElement) => void;
  onCloseOverlay: () => void;
  onMarkAll: () => void;
  onRead: (id: string) => void;
  onOpenShortcuts: () => void;
  onSignOut: () => void;
  onToast: (message: string, options?: ToastOptions) => void;
  onNotice: (notice: Notice) => void;
  openModal: OpenModal;
  onCloseModal: () => void;
  onCloseDrawer: () => void;
  onCloseFinder: () => void;
  onCloseShortcuts: () => void;
  onEnter: () => void;
  setThemeChoice: (theme: ThemeChoice) => void;
}

export function AppShell({
  route,
  sub,
  detail,
  rail,
  dark,
  themeChoice,
  signedIn,
  notices,
  noticeUnread,
  inboxUnread,
  reviewCount,
  overlayKind,
  overlayAnchor,
  drawerOpen,
  finderOpen,
  shortcutsOpen,
  toasts,
  modal,
  onDismissToast,
  tip,
  onFinder,
  onAccount,
  onMenu,
  onTheme,
  onRail,
  onNotifications,
  onNew,
  onCloseOverlay,
  onMarkAll,
  onRead,
  onOpenShortcuts,
  onSignOut,
  onToast,
  onNotice,
  openModal,
  onCloseModal,
  onCloseDrawer,
  onCloseFinder,
  onCloseShortcuts,
  onEnter,
  setThemeChoice,
}: AppShellProps) {
  const Page = pageModules[route];
  const transitionKey = `${route}:${sub || ''}`;

  return (
    <div className="app">
      <Sidebar
        route={route}
        rail={rail}
        unread={inboxUnread}
        reviewCount={reviewCount}
        onFinder={onFinder}
        onAccount={onAccount}
        onRail={onRail}
      />
      <div className="main">
        <TopBar
          route={route}
          sub={sub}
          dark={dark}
          unread={noticeUnread}
          onMenu={onMenu}
          onTheme={onTheme}
          onNotifications={onNotifications}
          onNew={onNew}
        />
        <main className="content" id="main">
          <ViewTransition
            className="view"
            k={transitionKey}
            order={routePosition(route, sub)}
            onSwap={() => {
              if (document.documentElement.classList.contains('is-started')) window.scrollTo({ top: 0 });
            }}
          >
            <Suspense fallback={null}>
              <Page
                onToast={onToast}
                openModal={openModal}
                sub={sub}
                detailId={detail}
                dark={dark}
                onTheme={onTheme}
                setThemeChoice={setThemeChoice}
              />
            </Suspense>
          </ViewTransition>
        </main>
      </div>
      <MobileTabbar route={route} onMore={onMenu} />
      <Overlay
        kind={overlayKind}
        anchor={overlayAnchor}
        themeChoice={themeChoice}
        setThemeChoice={setThemeChoice}
        notices={notices}
        onMarkAll={onMarkAll}
        onRead={onRead}
        onClose={onCloseOverlay}
        onOpenShortcuts={onOpenShortcuts}
        onSignOut={onSignOut}
        openModal={openModal}
      />
      {drawerOpen ? (
        <Drawer title="Raveno" sub="Handwell review desk · every page" onClose={onCloseDrawer}>
          {(close) => (
            <AllPages
              route={route}
              sub={sub}
              dark={dark}
              notices={notices}
              inboxUnread={inboxUnread}
              reviewCount={reviewCount}
              onToast={(message) => { close(); onToast(message); }}
              onTheme={(next) => setThemeChoice(next ? 'dark' : 'light')}
            />
          )}
        </Drawer>
      ) : null}
      <Finder open={finderOpen} onClose={onCloseFinder} openModal={openModal} />
      {shortcutsOpen ? <ShortcutModal onClose={onCloseShortcuts} /> : null}
      {tip ? <Tooltip {...tip} /> : null}
      <Toasts items={toasts} onDismiss={onDismissToast} />
      {modal ? (
        <GlobalModals
          request={modal}
          onClose={onCloseModal}
          onToast={onToast}
          onNotice={onNotice}
        />
      ) : null}
      {!signedIn ? <SignIn onEnter={onEnter} /> : null}
    </div>
  );
}
