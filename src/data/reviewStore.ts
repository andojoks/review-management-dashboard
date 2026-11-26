import { useSyncExternalStore } from 'react';
import { sourceSnapshot } from './source';

export type Review = (typeof sourceSnapshot.reviews)[number];

const clone = (review: Review): Review => JSON.parse(JSON.stringify(review)) as Review;

let reviews: Review[] = sourceSnapshot.reviews.map((review) => ({ ...review }));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const subscribeReviews = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const snapshot = () => reviews;

export function useReviews() {
  return useSyncExternalStore(subscribeReviews, snapshot, snapshot);
}

/** Apply a source-style mutation and return a snapshot for undo. */
export function updateReview(id: string, update: (review: Review) => void) {
  const before = clone(reviews.find((review) => review.id === id) ?? reviews[0]);
  reviews = reviews.map((review) => {
    if (review.id !== id) return review;
    const next = clone(review);
    update(next);
    return next;
  });
  emit();
  return before;
}

export function replaceReview(before: Review) {
  if (!before) return;
  reviews = reviews.map((review) => review.id === before.id ? clone(before) : review);
  emit();
}

export function addReview(review: Review) {
  reviews = [review, ...reviews];
  emit();
}

export function resetReviews() {
  reviews = sourceSnapshot.reviews.map((review) => ({ ...review }));
  emit();
}
