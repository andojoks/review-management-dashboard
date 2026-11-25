import { sourceSnapshot } from '@/data/source';
import type { IconName } from '@/ui/components';
import { formatMonth, formatNumber, formatRelative, initials, shortName } from './format';

const day = 86400000;
const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();
const startOfToday = new Date(baseTime).setHours(0, 0, 0, 0);

const publicReviews = sourceSnapshot.reviews.filter((review) => review.status !== 'hidden');
const unanswered = sourceSnapshot.reviews.filter((review) => review.status === 'new');
const flagged = sourceSnapshot.reviews.filter((review) => review.status === 'flagged');
const pendingChecks = sourceSnapshot.verifications.filter((item) => item.status === 'pending');

const clientById = new Map(sourceSnapshot.clients.map((client) => [client.id, client]));
const proById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));
const teamById = new Map(sourceSnapshot.team.map((member) => [member.id, member]));

const countDays = (predicate: (review: (typeof sourceSnapshot.reviews)[number]) => boolean) =>
  Array.from({ length: 14 }, (_, index) => {
    const start = startOfToday - (13 - index) * day;
    return sourceSnapshot.reviews.filter((review) => {
      const time = predicate === repliesInDay ? review.reply?.t : review.t;
      return time !== undefined && time >= start && time < start + day && predicate(review);
    }).length;
  });

const repliesInDay = (review: (typeof sourceSnapshot.reviews)[number]) => !!review.reply;
const reviewCounts = countDays(() => true);
const replyCounts = countDays(repliesInDay);
const lowCounts = countDays((review) => review.stars <= 2);
const photoCounts = countDays((review) => review.photos > 0);

const channelMeta: Record<string, { label: string; icon: IconName }> = {
  app: { label: 'Mobile app', icon: 'phone' },
  web: { label: 'Website', icon: 'globe' },
  email: { label: 'Email request', icon: 'mail' },
  sms: { label: 'Text link', icon: 'chat' },
};

const channelColors = [
  'var(--data)',
  'color-mix(in oklab, var(--data) 62%, var(--card))',
  'var(--data-2)',
  'var(--data-3)',
];

const percent = (value: number) => `${(value * 100).toFixed(0)}%`;

export interface OverviewMetric {
  id: 'reviews' | 'replies' | 'low' | 'photos';
  label: string;
  icon: IconName;
  value: number;
  delta: number;
  invert?: boolean;
  note: string;
  values: number[];
}

export interface OverviewStarMix {
  stars: number;
  count: number;
  percent: string;
}

export interface OverviewChannel {
  key: string;
  label: string;
  icon: IconName;
  count: number;
  color: string;
  percent: string;
}

export interface OverviewPro {
  id: string;
  name: string;
  trade: string;
  rating: number;
  count: number;
}

export interface OverviewReply {
  id: string;
  initials: string;
  name: string;
  pro: string;
  time: string;
  stars: number;
  tone: 'good' | 'warn' | 'bad';
  sentiment: 'Praise' | 'Mixed' | 'Complaint';
}

export interface OverviewQueueItem {
  id: string;
  title: string;
  client: string;
  pro: string;
  time: string;
  stars: number;
}

export const overviewData = {
  userName: sourceSnapshot.me.name,
  unanswered: unanswered.length,
  flagged: flagged.length,
  publicCount: publicReviews.length,
  rating: sourceSnapshot.history.avgRating[sourceSnapshot.history.avgRating.length - 1] ?? 4.44,
  previousRating: sourceSnapshot.history.avgRating[sourceSnapshot.history.avgRating.length - 2] ?? 4.34,
  heroValues: sourceSnapshot.history.avgRating,
  heroCompare: [3.98, 4.01, 3.99, 4.04, 4.06, 4.05, 4.09, 4.11, 4.1, 4.13, 4.15, 4.17],
  months: sourceSnapshot.history.months.map(formatMonth),
  monthReviews: formatNumber(sourceSnapshot.history.volume[sourceSnapshot.history.volume.length - 1] ?? 0),
  answered: percent(publicReviews.filter((review) => !!review.reply).length / (publicReviews.length || 1)),
  medianReply: sourceSnapshot.history.replyHours[sourceSnapshot.history.replyHours.length - 1] ?? 2.9,
  pendingChecks: pendingChecks.length,
  starMix: [5, 4, 3, 2, 1].map((stars) => {
    const count = publicReviews.filter((review) => review.stars === stars).length;
    return { stars, count, percent: percent(count / (publicReviews.length || 1)) };
  }) as OverviewStarMix[],
  repeatRate: percent(
    publicReviews.filter((review) => review.stars >= 4).length / (publicReviews.length || 1),
  ),
  metrics: [
    { id: 'reviews', label: 'New reviews', icon: 'star', value: reviewCounts.reduce((a, b) => a + b, 0), delta: .12, note: 'last 14 days', values: reviewCounts },
    { id: 'replies', label: 'Replies sent', icon: 'reply', value: replyCounts.reduce((a, b) => a + b, 0), delta: .18, note: 'by the team', values: replyCounts },
    { id: 'low', label: 'Low ratings', icon: 'alert', value: lowCounts.reduce((a, b) => a + b, 0), delta: -.21, invert: true, note: 'one or two stars', values: lowCounts },
    { id: 'photos', label: 'With photos', icon: 'image', value: photoCounts.reduce((a, b) => a + b, 0), delta: .07, note: 'proof of work', values: photoCounts },
  ] as OverviewMetric[],
  barLabels: Array.from({ length: 14 }, (_, index) =>
    String(new Date(startOfToday - (13 - index) * day).getDate())),
  channels: Object.keys(channelMeta).map((key, index) => ({
    key,
    label: channelMeta[key].label,
    icon: channelMeta[key].icon,
    count: publicReviews.filter((review) => review.channel === key).length,
    color: channelColors[index % channelColors.length],
    percent: percent(publicReviews.filter((review) => review.channel === key).length / (publicReviews.length || 1)),
  })) as OverviewChannel[],
  queue: unanswered.slice(0, 5).map((review) => ({
    id: review.id,
    title: review.title,
    client: clientById.get(review.client)?.name ?? 'Client',
    pro: proById.get(review.pro)?.name ?? 'Pro',
    time: formatRelative(review.t),
    stars: review.stars,
  })) as OverviewQueueItem[],
  bestPros: sourceSnapshot.pros
    .filter((pro) => pro.status === 'live')
    .map((pro) => {
      const rated = sourceSnapshot.reviews.filter((review) => review.pro === pro.id && review.status !== 'hidden');
      return {
        id: pro.id,
        name: pro.name,
        trade: pro.trade,
        rating: rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1),
        count: rated.length,
      };
    })
    .filter((pro) => pro.count >= 3)
    .sort((a, b) => b.rating - a.rating || b.count - a.count)
    .slice(0, 5) as OverviewPro[],
  latestReplies: sourceSnapshot.reviews
    .filter((review) => review.reply)
    .sort((a, b) => (b.reply?.t ?? 0) - (a.reply?.t ?? 0))
    .slice(0, 5)
    .map((review) => {
      const member = teamById.get(review.reply?.by ?? '');
      const pro = proById.get(review.pro);
      return {
        id: review.id,
        initials: initials(member?.name ?? 'Team'),
        name: shortName(member?.name ?? 'Team'),
        pro: shortName(pro?.name ?? ''),
        time: formatRelative(review.reply?.t ?? baseTime),
        stars: review.stars,
        tone: review.stars >= 4 ? 'good' : review.stars === 3 ? 'warn' : 'bad',
        sentiment: review.stars >= 4 ? 'Praise' : review.stars === 3 ? 'Mixed' : 'Complaint',
      } as OverviewReply;
    }),
};

export function formatDuration(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${Math.floor(hours)}h ${String(Math.round((hours % 1) * 60)).padStart(2, '0')}m`;
}
