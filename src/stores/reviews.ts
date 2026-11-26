import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Review, ReviewPatch } from '@/types';
import { queryKeys, useBootstrap, useRestoreState } from './shared';

export function useReviews(): Review[] {
  return useBootstrap().reviews;
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ReviewPatch }) =>
      api.patch<{ data: Review; before: Review }>(`/reviews/${id}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useAddReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: Review) => api.post<{ data: Review }>('/reviews', review),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export const useRestoreReview = useRestoreState;
