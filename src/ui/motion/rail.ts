import gsap from 'gsap';
import { placePill } from './navPill';

const anchors: [string, string][] = [
  ['.side__head .brand', '.mark'],
  ['.side__head .collapse', ''],
  ['.side__search', '.ico'],
  ['.snav__item', '.ico'],
  ['.side__me', ':scope > :first-child'],
];
const hidden = '.brand__text, .side__search > span, .side__group, .snav__label, .snav__count, .side__note, .side__me .cell__text, .side__me > .ico';

let timeline: gsap.core.Timeline | null = null;

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isRail = () => document.documentElement.classList.contains('is-rail');

export function refreshPills() {
  placePill(document.querySelector('.snav__pill') as HTMLElement, document.querySelector('.snav__item[aria-current="page"]') as HTMLElement, { animate: false, radius: 11 });
  placePill(document.querySelector('.tabbar__pill') as HTMLElement, document.querySelector('.tabbar [aria-current="page"]') as HTMLElement, { animate: false, radius: 12 });
}

/** Port of the reference rail fold/unfold timeline. */
export function setRail(on: boolean) {
  const root = document.documentElement;
  timeline?.progress(1);
  if (isRail() === on) return;
  const side = document.querySelector<HTMLElement>('.side');
  const main = document.querySelector<HTMLElement>('.main');
  const finish = () => {
    root.classList.toggle('is-rail', on);
    if (window.innerWidth >= 1280) {
      try { localStorage.setItem('raveno:rail', on ? '1' : '0'); } catch { /* storage may be blocked */ }
    }
    refreshPills();
  };
  if (reduce() || !side || !main) {
    finish();
    return;
  }

  const parts = anchors.flatMap(([selector, refSelector]) =>
    [...side.querySelectorAll<HTMLElement>(selector)].map((el) => ({
      el,
      ref: (refSelector ? el.querySelector<HTMLElement>(refSelector) : el) ?? el,
    })),
  );
  const fades = side.querySelectorAll<HTMLElement>(hidden);
  const pill = side.querySelector<HTMLElement>('.snav__pill');
  const clip = (right: number) => `inset(0 ${right}px 0 0)`;
  const wideWidth = side.offsetWidth;
  const wideLeft = main.getBoundingClientRect().left;
  root.classList.toggle('is-rail', on);
  const narrowWidth = side.offsetWidth;
  const narrowLeft = main.getBoundingClientRect().left;
  root.classList.toggle('is-rail', !on);

  const reposition = (duration: number, ease: string) => {
    const from = parts.map((part) => part.ref.getBoundingClientRect());
    finish();
    const tl = gsap.timeline();
    parts.forEach((part, index) => {
      const box = from[index];
      const now = part.ref.getBoundingClientRect();
      const dx = box.left - now.left;
      const dy = box.top - now.top;
      if (Math.abs(dx) + Math.abs(dy) < 0.5) return;
      tl.fromTo(part.el, { x: dx, y: dy }, { x: 0, y: 0, duration, ease }, 0);
      if (pill && part.el.matches('.snav__item[aria-current="page"]')) {
        tl.fromTo(pill, { x: dx, y: dy }, { x: 0, y: 0, duration, ease }, 0);
      }
    });
    return tl;
  };
  const moveMain = (from: number, to: number, duration: number, ease: string, at: number) =>
    timeline?.fromTo(main, { marginLeft: from }, { marginLeft: to, duration, ease }, at);
  const clear = () => {
    gsap.set(side, { clearProps: 'clipPath' });
    gsap.set(main, { clearProps: 'marginLeft' });
    gsap.set([...fades, ...parts.map((part) => part.el)], { clearProps: 'opacity,transform' });
    if (pill) gsap.set(pill, { clearProps: 'transform' });
    timeline = null;
    refreshPills();
  };

  if (on) {
    timeline = gsap.timeline({ onComplete: clear });
    timeline.to(fades, { opacity: 0, x: -6, duration: 0.16, ease: 'power2.in', stagger: 0.004 }, 0);
    timeline.fromTo(side, { clipPath: clip(0) }, { clipPath: clip(wideWidth - narrowWidth), duration: 0.42, ease: 'power3.inOut' }, 0.05);
    moveMain(wideLeft, narrowLeft, 0.42, 'power3.inOut', 0.05);
    timeline.add(() => {
      gsap.set(fades, { clearProps: 'opacity,transform' });
      gsap.set(side, { clipPath: clip(0) });
      timeline?.add(reposition(0.36, 'power3.out'), '>');
    });
  } else {
    main.style.marginLeft = `${wideLeft}px`;
    timeline = gsap.timeline({ onComplete: clear });
    timeline.add(reposition(0.45, 'power3.out'), 0);
    timeline.fromTo(side, { clipPath: clip(narrowWidth - wideWidth) }, { clipPath: clip(0), duration: 0.5, ease: 'expo.out' }, 0);
    moveMain(wideLeft, narrowLeft, 0.5, 'expo.out', 0);
    timeline.fromTo(fades, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out', stagger: 0.01 }, 0.12);
  }
}
