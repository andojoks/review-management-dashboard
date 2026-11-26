import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { AppState, MessageInput, Thread, ThreadPatch } from '@/types';
import { queryKeys, useBootstrap } from './shared';

export function useThreads(): Thread[] {
  return useBootstrap().threads;
}

export function usePatchThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ThreadPatch }) =>
      api.patch<{ data: Thread; before: AppState }>(`/threads/${id}`, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MessageInput }) =>
      api.post<{ data: Thread; before: AppState }>(`/threads/${id}/messages`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useAddThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (thread: Thread) => api.post<{ data: Thread; before: AppState }>('/threads', thread),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}
