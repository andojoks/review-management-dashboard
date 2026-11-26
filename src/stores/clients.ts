import type { Client, Pro, Review } from '@/types';
import { useBootstrap } from './shared';

export function useClients(): { clients: Client[]; pros: Pro[]; reviews: Review[] } {
  const state = useBootstrap();
  return { clients: state.clients, pros: state.pros, reviews: state.reviews };
}
