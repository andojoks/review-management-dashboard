import { sourceSnapshot } from './data/source';
import type { DocumentItem, Person, Review } from './pages/types';

const baseTime = new Date(2026, 10, 9, 10, 24, 0).getTime();

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const tradeLabel: Record<string, string> = {
  electric: 'Electrician',
  carpentry: 'Carpenter',
  plumbing: 'Plumber',
  painting: 'Painter',
  tiling: 'Tiler',
  roofing: 'Roofer',
  garden: 'Gardener',
  locks: 'Locksmith',
};

const relativeAge = (time: number) => {
  const minutes = Math.max(0, Math.round((baseTime - time) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const proById = new Map(sourceSnapshot.pros.map((pro) => [pro.id, pro]));
const clientById = new Map(sourceSnapshot.clients.map((client) => [client.id, client]));
const teamById = new Map(sourceSnapshot.team.map((member) => [member.id, member]));

export const team = sourceSnapshot.team;
export const threads = sourceSnapshot.threads;
export const notices = sourceSnapshot.notices;
export const history = sourceSnapshot.history;
export const preferences = sourceSnapshot.prefs;
export const currentUser = sourceSnapshot.me;

export const reviews: Review[] = sourceSnapshot.reviews.slice(0, 16).map((review) => {
  const client = clientById.get(review.client);
  const pro = proById.get(review.pro);
  return {
    id: review.id,
    initials: initials(client?.name ?? 'Raveno'),
    title: review.title,
    author: client?.name ?? 'Raveno client',
    pro: pro?.name ?? 'Handwell pro',
    age: relativeAge(review.t),
    rating: review.stars,
    tone: review.stars >= 4 ? 'Praise' : review.stars === 3 ? 'Mixed' : 'Concern',
  };
});

export const pros: Person[] = sourceSnapshot.pros.map((pro) => {
  const rated = sourceSnapshot.reviews.filter((review) => review.pro === pro.id);
  const average = rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1);
  return {
    id: pro.id,
    initials: initials(pro.name),
    name: pro.name,
    role: tradeLabel[pro.trade] ?? pro.trade,
    reviews: rated.length,
    rating: Number(average.toFixed(2)),
    detail: `${pro.city} · ${pro.status}`,
  };
});

export const clients: Person[] = sourceSnapshot.clients.map((client) => {
  const rated = sourceSnapshot.reviews.filter((review) => review.client === client.id);
  const average = rated.reduce((sum, review) => sum + review.stars, 0) / (rated.length || 1);
  return {
    id: client.id,
    initials: initials(client.name),
    name: client.name,
    role: client.status,
    reviews: rated.length,
    rating: Number(average.toFixed(2)),
    detail: `${client.city} · ${client.email}`,
  };
});

export const documents: DocumentItem[] = sourceSnapshot.docs.map((doc) => ({
  id: doc.id,
  name: doc.name,
  type: doc.folder,
  owner: teamById.get(doc.owner)?.name ?? 'Trust team',
  date: relativeAge(doc.updated),
  status: doc.starred ? 'Needs check' : 'Approved',
}));

export const metricTiles = [
  { label: 'New reviews', value: '43', delta: '↑ 12%', helper: 'last 14 days', icon: 'star', tone: 'dark' },
  { label: 'Replies sent', value: '26', delta: '↑ 18%', helper: 'by the team', icon: 'reply', tone: 'light' },
  { label: 'Low ratings', value: '5', delta: '↓ 21%', helper: 'one or two stars', icon: 'alert', tone: 'light' },
  { label: 'With photos', value: '14', delta: '↑ 7.0%', helper: 'proof of work', icon: 'image', tone: 'light' },
] as const;

export const tradeLabels = tradeLabel;
