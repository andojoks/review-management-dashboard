import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const DAY = 24 * 60 * 60 * 1000;

export const QUERY_CACHE_KEY = 'raveno:tanstack:v1';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 30_000,
      gcTime: 7 * DAY,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      networkMode: 'always',
      retry: 1,
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

export const persistOptions = {
  persister,
  maxAge: 7 * DAY,
  buster: 'raveno-v1',
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { state: { status: string } }) => query.state.status === 'success',
    shouldDehydrateMutation: () => false,
  },
};
