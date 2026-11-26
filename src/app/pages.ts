import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { RouteKey } from '@/router';
import type { PageProps } from '@/types';

export type { PageProps } from '@/types';

function routePage(id: RouteKey, load: () => Promise<Record<string, ComponentType<PageProps>>>) {
  return lazy(() => load().then((module) => ({
    default: module[id.charAt(0).toUpperCase() + id.slice(1)],
  })));
}

export const pageModules: Record<RouteKey, LazyExoticComponent<ComponentType<PageProps>>> = {
  overview: routePage('overview', () => import('@/pages/overview')),
  insights: routePage('insights', () => import('@/pages/insights')),
  pros: routePage('pros', () => import('@/pages/pros')),
  reviews: routePage('reviews', () => import('@/pages/reviews')),
  clients: routePage('clients', () => import('@/pages/clients')),
  documents: routePage('documents', () => import('@/pages/documents')),
  inbox: routePage('inbox', () => import('@/pages/inbox')),
  settings: routePage('settings', () => import('@/pages/settings')),
  help: routePage('help', () => import('@/pages/help')),
};
