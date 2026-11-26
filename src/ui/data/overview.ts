import type {
  OverviewChannel, OverviewInput, OverviewMetric, OverviewPro,
  OverviewQueueItem, OverviewReply, OverviewStarMix,
} from '@/types';
import { formatMonth, formatNumber, formatRelative, initials, shortName } from './format';

export type {
  OverviewChannel, OverviewInput, OverviewMetric, OverviewPro,
  OverviewQueueItem, OverviewReply, OverviewStarMix,
} from '@/types';

const day = 86400000;
const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();
const startOfToday = new Date(baseTime).setHours(0, 0, 0, 0);

const percent = (value: number) => `${(value * 100).toFixed(0)}%`;
const average = (reviews: { stars: number }[]) => reviews.length
  ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
  : 0;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Source `vs()`: bucket items into the 14 days ending today. */
const countDays = (reviews: { t: number; reply?: { t: number } }[], timeOf: (review: { t: number; reply?: { t: number } }) => number) =>
  Array.from({ length: 14 }, (_, index) => {
    const start = startOfToday - (13 - index) * day;
    return reviews.filter((review) => {
      const time = timeOf(review);
      return time >= start && time < start + day;
    }).length;
  });

/** Source Overview view model, rebuilt entirely from API data and runtime config. */
export function buildOverviewData({
  userName, reviews, pros, verifications, team, clients, history, config,
}: OverviewInput) {
  const publicReviews = reviews.filter((review) => review.status !== 'hidden');
  const unanswered = reviews.filter((review) => review.status === 'new');
  const flagged = reviews.filter((review) => review.status === 'flagged');
  const pendingChecks = verifications.filter((item) => item.status === 'pending');
  const clientById = new Map(clients.map((client) => [client.id, client]));
  const proById = new Map(pros.map((pro) => [pro.id, pro]));
  const teamById = new Map(team.map((member) => [member.id, member]));

  const ratingValues = [...history.avgRating.slice(0, -1), +average(publicReviews).toFixed(2)];
  const rating = ratingValues[ratingValues.length - 1] ?? 0;
  const previousRating = ratingValues[ratingValues.length - 2] ?? rating;

  const reviewCounts = countDays(reviews, (review) => review.t);
  const replyCounts = countDays(reviews.filter((review) => !!review.reply), (review) => review.reply?.t ?? 0);
  const lowCounts = countDays(reviews.filter((review) => review.stars <= 2), (review) => review.t);
  const photoCounts = countDays(reviews.filter((review) => review.photos > 0), (review) => review.t);
  const countsByKind: Record<string, number[]> = {
    reviews: reviewCounts, replies: replyCounts, low: lowCounts, photos: photoCounts,
  };

  const starCounts = config.starMix.map((stars) =>
    publicReviews.filter((review) => review.stars === stars).length);
  const publicCount = publicReviews.length || 1;
  const channels = Object.keys(config.channels).map((key, index) => {
    const count = publicReviews.filter((review) => review.channel === key).length;
    return {
      key,
      label: config.channels[key].label,
      icon: config.channels[key].icon,
      count,
      color: config.channelColors[index % config.channelColors.length],
      percent: percent(count / publicCount),
    } as OverviewChannel;
  });

  const metrics = config.metrics.map((metric) => ({
    ...metric,
    value: sum(countsByKind[metric.id] ?? []),
    values: countsByKind[metric.id] ?? [],
  })) as OverviewMetric[];

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
    heroCompare: config.heroCompare,
    months: history.months.map(formatMonth),
    monthReviews: formatNumber(history.volume[history.volume.length - 1] ?? 0),
    answered: percent(publicReviews.filter((review) => !!review.reply).length / publicCount),
    medianReply: history.replyHours[history.replyHours.length - 1] ?? 2.9,
    pendingChecks: pendingChecks.length,
    starMix: config.starMix.map((stars, index) => ({
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
