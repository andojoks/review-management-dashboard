import { useSyncExternalStore } from 'react';
import {
  getDocs, restoreDocs, updateDocs, useDocs, type DocsState,
} from './docsStore';
import { sourceSnapshot } from './source';

export type Pro = (typeof sourceSnapshot.pros)[number];
export type Mutation = { message: string; warn?: boolean; undo?: () => void };

const progressSteps = ['Applied', 'ID checked', 'Insured', 'Licence', 'Live'];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let pros: Pro[] = sourceSnapshot.pros.map((pro) => ({ ...pro }));
const listeners = new Set<() => void>();

export const subscribePros = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const snapshot = () => pros;
const emit = () => listeners.forEach((listener) => listener());

/** Pros share the authoritative document store with the Verification tab. */
export function useProsState() {
  const docs = useDocs();
  const currentPros = useSyncExternalStore(subscribePros, snapshot, snapshot);
  return { pros: currentPros, verifications: docs.verifications };
}

interface FullState {
  pros: Pro[];
  docs: DocsState;
}

const capture = (): FullState => ({
  pros: clone(pros),
  docs: clone(getDocs()),
});

const restore = (before: FullState) => {
  pros = clone(before.pros);
  restoreDocs(before.docs);
  emit();
};

/** Source `Be()`: approve the next document and move the pro one lane forward. */
export function advancePro(id: string): Mutation | null {
  const pro = pros.find((item) => item.id === id);
  if (!pro || pro.status !== 'onboarding') return null;
  const nextStep = pro.step + 1;
  const live = nextStep >= 4;

  pros = pros.map((item) => item.id === id
    ? { ...item, step: nextStep, status: live ? 'live' : item.status }
    : item);
  updateDocs((draft) => {
    const firstPending = draft.verifications.find((item) => item.pro === id && item.status === 'pending');
    if (firstPending) firstPending.status = 'approved';
  });
  emit();
  return {
    message: live ? `${pro.name} is live on Handwell` : `${pro.name} → ${progressSteps[nextStep]}`,
  };
}

/** Source `Ve()`: pause or resume bookings. */
export function togglePro(id: string): Mutation | null {
  const pro = pros.find((item) => item.id === id);
  if (!pro || pro.status === 'onboarding') return null;
  const before = capture();
  const nextStatus = pro.status === 'paused' ? 'live' : 'paused';
  pros = pros.map((item) => item.id === id ? { ...item, status: nextStatus } : item);
  emit();
  return {
    message: nextStatus === 'paused' ? `${pro.name} paused — no new bookings` : `${pro.name} is taking bookings again`,
    undo: () => restore(before),
  };
}

/** Source `He()`: approve/reject a verification, advancing onboarding when relevant. */
export function decideVerification(id: string, approved: boolean): Mutation | null {
  const verification = getDocs().verifications.find((item) => item.id === id);
  if (!verification) return null;
  const pro = pros.find((item) => item.id === verification.pro);
  const firstPending = getDocs().verifications.find((item) => item.pro === verification.pro && item.status === 'pending');

  if (approved && pro?.status === 'onboarding' && firstPending?.id === id) {
    return advancePro(pro.id);
  }

  const before = capture();
  updateDocs((draft) => {
    const target = draft.verifications.find((item) => item.id === id);
    if (target) target.status = approved ? 'approved' : 'rejected';
  });
  emit();
  return {
    message: `${verification.kind} for ${pro?.name ?? 'the pro'} ${approved ? 'approved' : 'sent back'}`,
    warn: !approved,
    undo: () => restore(before),
  };
}

export function addPro(pro: Pro) {
  pros = [...pros, pro];
  emit();
}

export function resetPros() {
  pros = sourceSnapshot.pros.map((pro) => ({ ...pro }));
  emit();
}
