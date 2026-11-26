import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { AppState, Doc, DocumentUpload } from '@/types';
import { queryKeys, useBootstrap } from './shared';

export function useDocs() {
  const state = useBootstrap();
  return { docs: state.docs, verifications: state.verifications };
}

export function useDeleteDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ ok: true; before: AppState }>(`/documents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useStarDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Doc; before: AppState }>(`/documents/${id}/star`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useUploadDoc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DocumentUpload) => api.post<{ data: Doc; before: AppState }>('/documents/upload', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}
