import type { IconName } from '@/ui/components/primitives';
import type { RouteKey } from '@/router';

export const routeIcon: Record<RouteKey, IconName> = {
  overview: 'grid',
  insights: 'chart',
  reviews: 'star',
  pros: 'wrench',
  clients: 'users',
  documents: 'file',
  inbox: 'inbox',
  settings: 'gear',
  help: 'help',
};

export const quickRoutes: RouteKey[] = ['overview', 'reviews', 'pros', 'inbox'];
