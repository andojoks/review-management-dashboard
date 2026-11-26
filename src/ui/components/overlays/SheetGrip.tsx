import type { RefObject } from 'react';
import { useSheetDrag } from '@/ui/motion/sheet';

export function SheetGrip({ panel, onClose }: {
  panel: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  return (
    <div className="sheet__grip" aria-hidden="true" {...useSheetDrag(panel, onClose)}>
      <i />
    </div>
  );
}
