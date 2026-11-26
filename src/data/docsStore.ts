import { useSyncExternalStore } from 'react';
import { sourceSnapshot } from './source';

export type Doc = (typeof sourceSnapshot.docs)[number];
export type Verification = (typeof sourceSnapshot.verifications)[number];

export interface DocsState {
  docs: Doc[];
  verifications: Verification[];
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const initial = (): DocsState => clone({
  docs: sourceSnapshot.docs,
  verifications: sourceSnapshot.verifications,
});

let state = initial();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribeDocs = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const snapshot = () => state;

export function useDocs() {
  return useSyncExternalStore(subscribeDocs, snapshot, snapshot);
}

export function getDocs() {
  return state;
}

/** Apply a document mutation and return a full snapshot for source-style undo. */
export function updateDocs(mutate: (draft: DocsState) => void) {
  const before = clone(state);
  const draft = clone(state);
  mutate(draft);
  state = draft;
  emit();
  return before;
}

export function restoreDocs(before: DocsState) {
  state = clone(before);
  emit();
}

export function resetDocs() {
  state = initial();
  emit();
}
