import type { IconName } from './ui';
import type { Snapshot } from './domain';

export type AppState = Omit<Snapshot, 'notices'> & { notices: Notice[] };

export type RouteKey =
  | 'overview' | 'insights' | 'reviews' | 'pros' | 'clients'
  | 'documents' | 'inbox' | 'settings' | 'help';

export type NoticeTone = 'bad' | 'info' | 'warn' | 'good';

export type OverlayKind = null | 'account' | 'new' | 'notifications';
export type ThemeChoice = 'light' | 'dark' | 'system';

export interface Notice {
  id: string;
  icon: IconName;
  tone: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  href?: string;
}

export interface ToastOptions {
  undo?: () => void;
  action?: { label: string; run: () => void };
  tone?: 'good' | 'bad' | 'warn' | 'info';
}

export interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

export type ModalRequest =
  | { kind: 'review'; clientId?: string }
  | { kind: 'upload' }
  | { kind: 'invitePro' }
  | { kind: 'inviteTeammate' }
  | { kind: 'message'; who?: string };

export type OpenModal = (request: ModalRequest) => void;

export interface PageProps {
  onToast: (message: string, options?: ToastOptions) => void;
  openModal?: OpenModal;
  sub?: string;
  detailId?: string;
  dark: boolean;
  onTheme: (anchor?: HTMLElement | null) => void;
  setThemeChoice?: (theme: ThemeChoice) => void;
}

export interface FeedEvent {
  stars: number;
  title: string;
  text: string;
  body: string;
  job: string;
  proId: string;
  clientId: string;
}

export interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export interface ShortcutHandlers {
  onSearch: () => void;
  onNew: () => void;
  onShortcuts: () => void;
  onEscape: () => void;
}

export interface PillGroupOptions {
  root: HTMLElement | null;
  selector?: string;
  activeClass?: string;
}
