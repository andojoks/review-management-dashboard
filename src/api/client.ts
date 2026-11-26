import type { ApiErrorShape, ApiMethod, MutationResult } from '@/types';

const BASE = '/api';

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(method: ApiMethod, path: string, payload?: unknown): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: payload === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as Partial<ApiErrorShape>;
    throw new ApiError(error.message ?? `Request failed (${response.status})`, response.status, error.code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, payload?: unknown) => request<T>('POST', path, payload),
  patch: <T>(path: string, payload?: unknown) => request<T>('PATCH', path, payload),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export type ApiMutation<T = unknown, B = unknown> = MutationResult<T, B>;
