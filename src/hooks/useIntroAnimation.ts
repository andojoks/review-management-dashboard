import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { enableLift } from '@/ui/motion/interactions';

export function useIntroAnimation() {
  const started = useRef(false);

  useLayoutEffect(() => {
    if (started.current) return;
    started.current = true;

    const recordMode = /[?&]record\b/.test(window.location.search);
    if (recordMode || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('is-started');
      return;
    }

    const mobile = window.innerWidth <= 760;
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.add('is-started');
        enableLift();
      },
    });

    if (!mobile) {
      tl.fromTo('.side', { x: -30, opacity: 0 }, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'expo.out',
        clearProps: 'transform,opacity',
      }, 0);
      tl.fromTo('.side__head > *, .side__search, .side__group, .snav__item, .side__foot > *', { opacity: 0, x: -10 }, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.025,
        clearProps: 'transform,opacity',
      }, 0.1);
      tl.fromTo('.snav__pill', { scaleX: 0.3, opacity: 0 }, {
        scaleX: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'back.out(2)',
        transformOrigin: '0 50%',
        clearProps: 'transform',
      }, 0.45);
    }

    tl.fromTo('.top__in > *', { y: -12, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'expo.out',
      stagger: 0.05,
      clearProps: 'transform,opacity',
    }, 0.15);

    if (mobile) tl.fromTo('.tabbar', { y: 90 }, { y: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform' }, 0.2);
  }, []);
}
