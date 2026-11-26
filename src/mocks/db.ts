import type { Notice, Snapshot } from '@/types';
import { sourceSnapshot } from '@/data/source';
import { initialNotices } from '@/ui/data/notices';

const STORAGE_KEY = 'raveno:mock-db:v1';
const isRecord = /[?&]record\b/.test(window.location.search);
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export interface MockDb extends Omit<Snapshot, 'notices'> {
  notices: Notice[];
}

function baseline(): MockDb {
  return {
    ...clone(sourceSnapshot),
    notices: clone(initialNotices),
  } as MockDb;
}

function load(): MockDb {
  if (isRecord) return baseline();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseline();
    const parsed = JSON.parse(raw) as MockDb;
    if (parsed?.v === sourceSnapshot.v && Array.isArray(parsed.reviews)) return parsed;
  } catch {
    // Corrupt or blocked storage falls back to the pristine demo snapshot.
  }
  return baseline();
}

let db = load();

function persist() {
  if (isRecord) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage is optional; the in-memory backend still works.
  }
}

export function getDb(): MockDb {
  return db;
}

export function setDb(next: MockDb) {
  db = clone(next);
  persist();
}

/** Apply a mutation atomically and return a full snapshot for source-style undo. */
export function mutateDb<T>(mutate: (draft: MockDb) => T): { result: T; before: MockDb } {
  const before = clone(db);
  const draft = clone(db);
  const result = mutate(draft);
  db = draft;
  persist();
  return { result, before };
}

export function resetDb() {
  db = baseline();
  persist();
}
