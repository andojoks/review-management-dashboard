import { useSyncExternalStore } from 'react';
import { sourceSnapshot } from './source';

export type Thread = (typeof sourceSnapshot.threads)[number] & { archived?: boolean };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let threads: Thread[] = clone(sourceSnapshot.threads) as Thread[];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribeInbox = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const snapshot = () => threads;

export function useInbox() {
  return useSyncExternalStore(subscribeInbox, snapshot, snapshot);
}

/** Apply a thread mutation and return a snapshot for source-style undo. */
export function updateThreads(mutate: (draft: Thread[]) => void) {
  const before = clone(threads);
  const draft = clone(threads);
  mutate(draft);
  threads = draft;
  emit();
  return before;
}

export function restoreThreads(before: Thread[]) {
  threads = clone(before);
  emit();
}

export function resetInbox() {
  threads = clone(sourceSnapshot.threads);
  emit();
}
