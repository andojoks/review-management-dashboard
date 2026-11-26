import { useSyncExternalStore } from 'react';
import { sourceSnapshot } from './source';

export type TeamMember = (typeof sourceSnapshot.team)[number];
export type Prefs = (typeof sourceSnapshot.prefs);
export type Me = (typeof sourceSnapshot.me);

export interface SettingsState {
  me: Me;
  team: TeamMember[];
  prefs: Prefs;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const initial = (): SettingsState => clone({
  me: sourceSnapshot.me,
  team: sourceSnapshot.team,
  prefs: sourceSnapshot.prefs,
});

let settings = initial();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribeSettings = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const snapshot = () => settings;

export function useSettings() {
  return useSyncExternalStore(subscribeSettings, snapshot, snapshot);
}

export function getSettings() {
  return settings;
}

/** Source store `u()`: mutate a mutable draft, then notify subscribers. */
export function updateSettings(mutate: (draft: SettingsState) => void) {
  const draft = clone(settings);
  mutate(draft);
  settings = draft;
  emit();
}

export function resetSettings() {
  settings = initial();
  emit();
}
