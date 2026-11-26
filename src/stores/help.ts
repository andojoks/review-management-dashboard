import { useConfig } from './shared';

export function useHelpData() {
  const config = useConfig();
  return config.help;
}
