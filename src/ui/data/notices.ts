import type { Notice } from '@/types';
import { clockBase } from './clock';

export type { Notice, OverlayKind, ThemeChoice } from '@/types';

export const initialNotices: Notice[] = [
  { id: 'n1', icon: 'star', tone: 'bad', title: 'New 1-star review', body: 'A review for a plumber needs a reply within 24 hours.', at: clockBase - 22 * 60_000, read: false, href: '#/reviews/inbox' },
  { id: 'n2', icon: 'chat', tone: 'info', title: 'Marcus Okafor replied', body: '“Already booked in for Thursday to touch it up.”', at: clockBase - 70 * 60_000, read: false, href: '#/inbox/t2' },
  { id: 'n3', icon: 'file', tone: 'warn', title: '3 documents to check', body: 'Insurance renewals are waiting in Verification.', at: clockBase - 3 * 3_600_000, read: false, href: '#/documents/verification' },
  { id: 'n4', icon: 'trend', tone: 'good', title: 'Weekly rating up', body: 'The average rating had its best week this year.', at: clockBase - 20 * 3_600_000, read: true, href: '#/insights' },
  { id: 'n5', icon: 'chart', tone: 'plain', title: 'October report is ready', body: 'The trust report was added to Documents › Reports.', at: clockBase - 2 * 86_400_000, read: true, href: '#/documents/library' },
];
