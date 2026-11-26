import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { AppState, SettingsPatch, SettingsState, TeamMember } from '@/types';
import { queryKeys, useBootstrap } from './shared';

export function useSettings(): SettingsState {
  const state = useBootstrap();
  return { me: state.me, team: state.team, prefs: state.prefs };
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: SettingsPatch) =>
      api.patch<{ data: SettingsState; before: AppState }>('/settings', patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (member: TeamMember) => api.post<{ data: TeamMember; before: AppState }>('/settings/team', member),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
  });
}
