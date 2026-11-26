import type { Verification } from '@/data/docsStore';
import type { Pro } from '@/data/prosStore';
import type { Review } from '@/data/reviewStore';
import type { TeamMember } from '@/data/settingsStore';
import { sourceSnapshot } from '@/data/source';
import type { IconName } from '@/ui/components';
import { formatMonth, formatNumber, formatRelative, initials, shortName } from './format';

const day = 86400000;
const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();
const startOfToday = new Date(baseTime).setHours(0, 0, 0, 0);

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
const average = (reviews: Review[]) => reviews.length
  ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
  : 0;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Source `vs()`: bucket items into the 14 days ending today. */
const countDays = (reviews: Review[], timeOf: (review: Review) => number) =>
  Array.from({ length: 14 }, (_, index) => {
    const start = startOfToday - (13 - index) * day;
    return reviews.filter((review) => {
      const time = timeOf(review);
      return time >= start && time < start + day;
    }).length;
  });

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

export interface OverviewInput {
  userName: string;
  reviews: Review[];
  pros: Pro[];
  verifications: Verification[];
  team: TeamMember[];
}

/** Source Overview view model, rebuilt from the live mutable stores. */
export function buildOverviewData({ userName, reviews, pros, verifications, team }: OverviewInput) {
  const publicReviews = reviews.filter((review) => review.status !== 'hidden');
  const unanswered = reviews.filter((review) => review.status === 'new');
  const flagged = reviews.filter((review) => review.status === 'flagged');
  const pendingChecks = verifications.filter((item) => item.status === 'pending');
  const clientById = new Map(sourceSnapshot.clients.map((client) => [client.id, client]));
  const proById = new Map(pros.map((pro) => [pro.id, pro]));
  const teamById = new Map(team.map((member) => [member.id, member]));

  const history = sourceSnapshot.history;
  const ratingValues = [...history.avgRating.slice(0, -1), +average(publicReviews).toFixed(2)];
  const rating = ratingValues[ratingValues.length - 1] ?? 0;
  const previousRating = ratingValues[ratingValues.length - 2] ?? rating;

  const reviewCounts = countDays(reviews, (review) => review.t);
  const replyCounts = countDays(reviews.filter((review) => !!review.reply), (review) => review.reply?.t ?? 0);
  const lowCounts = countDays(reviews.filter((review) => review.stars <= 2), (review) => review.t);
  const photoCounts = countDays(reviews.filter((review) => review.photos > 0), (review) => review.t);

  const starCounts = [5, 4, 3, 2, 1].map((stars) => publicReviews.filter((review) => review.stars === stars).length);
  const publicCount = publicReviews.length || 1;
  const channels = Object.keys(channelMeta).map((key, index) => {
    const count = publicReviews.filter((review) => review.channel === key).length;
    return {
      key,
      label: channelMeta[key].label,
      icon: channelMeta[key].icon,
      count,
      color: channelColors[index % channelColors.length],
      percent: percent(count / publicCount),
    } as OverviewChannel;
  });

  const metrics = [
    { id: 'reviews', label: 'New reviews', icon: 'star', value: sum(reviewCounts), delta: .12, note: 'last 14 days', values: reviewCounts },
    { id: 'replies', label: 'Replies sent', icon: 'reply', value: sum(replyCounts), delta: .18, note: 'by the team', values: replyCounts },
    { id: 'low', label: 'Low ratings', icon: 'alert', value: sum(lowCounts), delta: -.21, invert: true, note: 'one or two stars', values: lowCounts },
    { id: 'photos', label: 'With photos', icon: 'image', value: sum(photoCounts), delta: .07, note: 'proof of work', values: photoCounts },
  ] as OverviewMetric[];

  const bestPros = pros
    .filter((pro) => pro.status === 'live')
    .map((pro) => {
      const rated = reviews.filter((review) => review.pro === pro.id && review.status !== 'hidden');
      return { id: pro.id, name: pro.name, trade: pro.trade, rating: average(rated), count: rated.length };
    })
    .filter((pro) => pro.count >= 3)
    .sort((a, b) => b.rating - a.rating || b.count - a.count)
    .slice(0, 5) as OverviewPro[];

  const latestReplies = reviews
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
    });

  return {
    userName,
    unanswered: unanswered.length,
    flagged: flagged.length,
    publicCount: publicReviews.length,
    rating,
    previousRating,
    heroValues: ratingValues,
    heroCompare: [3.98, 4.01, 3.99, 4.04, 4.06, 4.05, 4.09, 4.11, 4.1, 4.13, 4.15, 4.17],
    months: history.months.map(formatMonth),
    monthReviews: formatNumber(history.volume[history.volume.length - 1] ?? 0),
    answered: percent(publicReviews.filter((review) => !!review.reply).length / publicCount),
    medianReply: history.replyHours[history.replyHours.length - 1] ?? 2.9,
    pendingChecks: pendingChecks.length,
    starMix: [5, 4, 3, 2, 1].map((stars, index) => ({
      stars,
      count: starCounts[index],
      percent: percent(starCounts[index] / publicCount),
    })) as OverviewStarMix[],
    repeatRate: percent((starCounts[0] + starCounts[1]) / publicCount),
    metrics,
    barLabels: Array.from({ length: 14 }, (_, index) =>
      String(new Date(startOfToday - (13 - index) * day).getDate())),
    channels,
    queue: unanswered.slice(0, 5).map((review) => ({
      id: review.id,
      title: review.title,
      client: clientById.get(review.client)?.name ?? 'Client',
      pro: proById.get(review.pro)?.name ?? 'Pro',
      time: formatRelative(review.t),
      stars: review.stars,
    })) as OverviewQueueItem[],
    bestPros,
    latestReplies,
  };
}

export function formatDuration(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${Math.floor(hours)}h ${String(Math.round((hours % 1) * 60)).padStart(2, '0')}m`;
}
