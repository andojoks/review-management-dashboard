import { createRoot } from 'react-dom/client';
import { persistQueryClientSave } from '@tanstack/query-persist-client-core';
import App from './App';
import { ApiProvider } from '@/api/provider';
import { api } from '@/api/client';
import { persistOptions, queryClient } from '@/api/queryClient';
import { installTestBridge } from './app/testBridge';
import { startMockBackend } from './mocks/browser';
import { queryKeys } from './stores/shared';
import type { AppConfig, AppState } from './types';
import '../app.css';
import '../css/overview.css';
import '../css/reviews.css';
import '../css/pros.css';

installTestBridge();

async function bootstrap() {
  try {
    await startMockBackend();
  } catch {
    // The app still renders from the persisted TanStack cache if the worker is blocked.
  }

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.bootstrap,
      queryFn: () => api.get<AppState>('/bootstrap'),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.config,
      queryFn: () => api.get<AppConfig>('/config'),
    }),
  ]).catch(() => undefined);

  await persistQueryClientSave({ queryClient, ...persistOptions }).catch(() => undefined);

  createRoot(document.getElementById('root')!).render(
    <ApiProvider>
      <App />
    </ApiProvider>,
  );
}

void bootstrap();
