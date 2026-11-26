import type { IconName } from '@/ui/components';

export const fileSize = (kilobytes: number) =>
  kilobytes >= 1000 ? `${(kilobytes / 1000).toFixed(1)} MB` : `${kilobytes} KB`;

export const documentKindIcons: Record<string, IconName> = {
  pdf: 'file',
  sheet: 'sheet',
  image: 'image',
  doc: 'note',
};
