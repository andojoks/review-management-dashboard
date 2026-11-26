import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { AppState, Pro, ProInvite } from '@/types';
import { queryKeys, useBootstrap } from './shared';

export interface ProMutation {
  message: string;
  warn?: boolean;
  before?: AppState;
}

export function useProsState() {
  const state = useBootstrap();
  return { pros: state.pros, verifications: state.verifications };
}

function useProMutation(path: (id: string) => string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: ProMutation; before: AppState }>(path(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export const useAdvancePro = () => useProMutation((id) => `/pros/${id}/advance`);
export const useTogglePro = () => useProMutation((id) => `/pros/${id}/toggle`);

export function useDecideVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      api.post<{ data: ProMutation; before: AppState }>(`/verifications/${id}/decide`, { approved }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useAddPro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pro: Pro) => api.post<{ data: Pro; before: AppState }>('/pros', pro),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useInvitePro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProInvite) => api.post<{ data: Pro; before: AppState }>('/settings/pros', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}
