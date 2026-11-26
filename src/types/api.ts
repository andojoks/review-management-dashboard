import type { Prefs } from './domain';

export interface ApiErrorShape {
  message: string;
  code?: string;
}

export interface MutationResult<T = unknown, B = unknown> {
  data: T;
  before?: B;
  message?: string;
}

export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ReviewPatch {
  title?: string;
  text?: string;
  status?: string;
  flag?: string | null;
  reply?: { text: string; by?: string };
  helpful?: number;
}

export interface ThreadPatch {
  subject?: string;
  unread?: number;
  archived?: boolean;
  read?: boolean;
}

export interface SettingsPatch {
  name?: string;
  email?: string;
  signature?: string;
  teamName?: string;
  prefs?: Partial<Prefs>;
}

export interface ProInvite {
  name: string;
  trade: string;
  city: string;
  email: string;
  phone?: string;
  bio?: string;
  responseRate?: number;
  expiresDays?: number;
  filePrefix?: string;
}

export interface DocumentUpload {
  name: string;
  kind: string;
  folder: string;
  size: number;
  owner: string;
}

export interface MessageInput {
  text: string;
  by?: string;
  from?: 'me' | 'them';
}

export interface SessionPatch {
  signedIn: boolean;
}
