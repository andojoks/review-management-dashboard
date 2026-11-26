import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { appConfig } from '@/data/config';
import type { AppConfig, AppState, Notice } from '@/types';

export const queryKeys = {
  bootstrap: ['bootstrap'] as const,
  config: ['config'] as const,
  state: ['state'] as const,
  reviews: ['reviews'] as const,
  pros: ['pros'] as const,
  documents: ['documents'] as const,
  threads: ['threads'] as const,
  settings: ['settings'] as const,
  clients: ['clients'] as const,
  notices: ['notices'] as const,
  overview: ['overview'] as const,
  insights: ['insights'] as const,
  help: ['help'] as const,
};

const emptyState = (): AppState => ({
  v: 1,
  signedIn: true,
  team: [], pros: [], clients: [], reviews: [], docs: [], verifications: [], threads: [],
  notices: [],
  history: { months: [], volume: [], lastYear: [], avgRating: [], replyHours: [] },
  prefs: {
    autoPublish: true, profanity: true, alertStars: 2, digest: false,
    mentions: true, newReview: true, docs: true, sla: 24, signature: '',
  },
  me: {
    id: '', name: '', role: '', hue: 0, email: '', online: false, replies: 0, avgHours: 0,
  },
});

/** The bootstrap query is the single client-side data store for all pages. */
export function useBootstrap() {
  const query = useQuery({
    queryKey: queryKeys.bootstrap,
    queryFn: () => api.get<AppState>('/bootstrap'),
  });
  return query.data ?? emptyState();
}

export function useConfig(): AppConfig {
  const query = useQuery({
    queryKey: queryKeys.config,
    queryFn: () => api.get<AppConfig>('/config'),
  });
  return query.data ?? appConfig;
}

export function useNotices() {
  const state = useBootstrap();
  return state.notices;
}

export function useRestoreState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (state: AppState) => api.post('/state/restore', { state }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useAddNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notice: Notice) => api.post('/notices', notice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Notice> }) =>
      api.patch(`/notices/${id}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useSetSignedIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (signedIn: boolean) => api.patch('/session', { signedIn }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useResetDemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/demo/reset'),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
