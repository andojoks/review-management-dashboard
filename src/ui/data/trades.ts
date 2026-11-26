import type { IconName } from '@/ui/components';

/** Source `Ro()`: trade labels and their icon names. */
export const trades: Record<string, { label: string; icon: IconName; jobs: string }> = {
  electric: { label: 'Electrician', icon: 'bolt', jobs: 'Kitchen rewiring' },
  carpentry: { label: 'Carpenter', icon: 'chair', jobs: 'Built-in wardrobe' },
  plumbing: { label: 'Plumber', icon: 'drop', jobs: 'Boiler service' },
  painting: { label: 'Painter', icon: 'pen', jobs: 'Hallway repaint' },
  tiling: { label: 'Tiler', icon: 'grid', jobs: 'Shower retile' },
  roofing: { label: 'Roofer', icon: 'home', jobs: 'Slipped slates' },
  garden: { label: 'Gardener', icon: 'leaf', jobs: 'Hedge reshape' },
  locks: { label: 'Locksmith', icon: 'key', jobs: 'Lock change' },
};

export const tradeLabel = (trade: string) => trades[trade]?.label ?? trade;
