export type RouteKey = 'overview' | 'insights' | 'reviews' | 'pros' | 'clients' | 'documents' | 'inbox' | 'settings' | 'help';

/** Source route order, used by the page transition direction. */
export const routeOrder: RouteKey[] = ['overview', 'insights', 'pros', 'reviews', 'clients', 'documents', 'inbox', 'settings', 'help'];

export const navGroups: { label: string; items: RouteKey[] }[] = [
  { label: 'Desk', items: ['overview', 'insights', 'reviews', 'pros', 'clients', 'documents'] },
  { label: 'Support', items: ['inbox', 'settings', 'help'] },
];

export const routeMeta: Record<RouteKey, { label: string; section: 'Desk' | 'Support'; count?: number }> = {
  overview: { label: 'Overview', section: 'Desk' }, insights: { label: 'Insights', section: 'Desk' },
  reviews: { label: 'Reviews', section: 'Desk', count: 16 }, pros: { label: 'Pros', section: 'Desk' },
  clients: { label: 'Clients', section: 'Desk' }, documents: { label: 'Documents', section: 'Desk', count: 15 },
  inbox: { label: 'Inbox', section: 'Support', count: 4 }, settings: { label: 'Settings', section: 'Support' }, help: { label: 'Help', section: 'Support' },
};

/** Source sub-navigation labels and order. */
export const subMap: Record<string, { id: string; label: string }[]> = {
  insights: [{ id: 'ratings', label: 'Ratings' }, { id: 'volume', label: 'Volume' }, { id: 'response', label: 'Response' }],
  pros: [{ id: 'directory', label: 'Directory' }, { id: 'onboarding', label: 'Onboarding' }],
  reviews: [{ id: 'inbox', label: 'To reply' }, { id: 'flagged', label: 'Flagged' }, { id: 'published', label: 'Answered' }],
  documents: [{ id: 'library', label: 'Library' }, { id: 'verification', label: 'Verification' }],
  settings: [
    { id: 'profile', label: 'Profile' }, { id: 'team', label: 'Team' }, { id: 'rules', label: 'Review rules' },
    { id: 'notifications', label: 'Notifications' }, { id: 'data', label: 'Data' },
  ],
};

export function subLabel(route: RouteKey, sub?: string) {
  return sub ? subMap[route]?.find((item) => item.id === sub)?.label : undefined;
}

export function routePosition(route: RouteKey, sub?: string) {
  const subIndex = subMap[route]?.findIndex((item) => item.id === sub) ?? -1;
  return routeOrder.indexOf(route) * 10 + Math.max(0, subIndex);
}

export function normalizeHash(hash = window.location.hash): { route: RouteKey; sub?: string; detail?: string } {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map((part) => {
    try { return decodeURIComponent(part); } catch { return part; }
  });
  const route = (routeOrder.includes(parts[0] as RouteKey) ? parts[0] : 'overview') as RouteKey;
  const subs = subMap[route];
  let sub: string | undefined;
  let params = parts.slice(1);
  if (subs) {
    const requested = subs.find((item) => item.id === parts[1]);
    sub = requested ? parts[1] : subs[0].id;
    if (requested) params = parts.slice(2);
  }
  return { route, sub, detail: params[0] };
}

export function go(path: string) {
  const next = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
  if (window.location.hash !== next) window.location.hash = next;
}
