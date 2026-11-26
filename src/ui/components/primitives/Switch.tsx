import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { motionDuration } from '@/ui/motion/interactions';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  const knob = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.to(knob.current, {
      x: checked ? 18 : 0,
      duration: motionDuration(.45),
      ease: 'back.out(2.2)',
    });
  }, [checked]);

  return (
    <button
      type="button"
      className="switch"
      aria-label={label}
      aria-checked={checked}
      role="switch"
      onClick={() => onChange(!checked)}
    >
      <i ref={knob} />
    </button>
  );
}
