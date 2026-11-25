import { useEffect, useState } from 'react';

export interface TooltipState {
  text: string;
  x: number;
  y: number;
  side: boolean;
}

export function useTooltip() {
  const [tip, setTip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const onPointer = (event: Event) => {
      const target = (event.target as HTMLElement | null)?.closest?.('.side [data-tip], .top [data-tip]') as HTMLElement | null;
      if (!target || window.innerWidth <= 760) return;
      const box = target.getBoundingClientRect();
      const side = !!target.closest('.side');
      setTip({
        text: target.dataset.tip || '',
        x: side ? box.right + 12 : box.left + box.width / 2,
        y: side ? box.top + box.height / 2 : box.bottom + 10,
        side,
      });
    };
    const clear = () => setTip(null);

    document.addEventListener('pointerover', onPointer);
    document.addEventListener('focusin', onPointer);
    document.addEventListener('pointerout', clear);
    document.addEventListener('focusout', clear);
    return () => {
      document.removeEventListener('pointerover', onPointer);
      document.removeEventListener('focusin', onPointer);
      document.removeEventListener('pointerout', clear);
      document.removeEventListener('focusout', clear);
    };
  }, []);

  return tip;
}
