import { gsap } from 'gsap';

type Insets = { l: number; r: number; t: number; b: number };

const same = (a: Insets, b: Insets) =>
  Math.abs(a.l - b.l) < 1 && Math.abs(a.r - b.r) < 1 && Math.abs(a.t - b.t) < 1 && Math.abs(a.b - b.b) < 1;

/**
 * The reference uses one clipped element for the whole nav. Moving between
 * items expands the trailing edge first and contracts the leading edge last,
 * which is what gives the pill its directional slide.
 */
export function placePill(
  pill: HTMLElement | null,
  target: HTMLElement | null | undefined,
  { animate = true, radius = 13, line = false }: { animate?: boolean; radius?: number; line?: boolean } = {},
) {
  if (!pill) return;
  const nav = pill.parentElement;
  if (!nav) return;

  if (!target || !target.offsetWidth) {
    gsap.set(pill, { opacity: 0 });
    return;
  }

  const style = getComputedStyle(nav);
  const width = /auto|scroll/.test(style.overflowX) && nav.scrollWidth > nav.clientWidth ? nav.scrollWidth : nav.offsetWidth;
  const height = /auto|scroll/.test(style.overflowY) && nav.scrollHeight > nav.clientHeight ? nav.scrollHeight : nav.offsetHeight;

  const next: Insets = line
    ? { l: target.offsetLeft, r: width - (target.offsetLeft + target.offsetWidth), t: 0, b: 0 }
    : {
        l: target.offsetLeft,
        r: width - (target.offsetLeft + target.offsetWidth),
        t: target.offsetTop,
        b: height - (target.offsetTop + target.offsetHeight),
      };

  if (width === nav.offsetWidth) pill.style.removeProperty('width');
  else pill.style.width = `${width}px`;
  if (line || height === nav.offsetHeight) pill.style.removeProperty('height');
  else pill.style.height = `${height}px`;

  const clip = (insets: Insets) =>
    `inset(${insets.t}px ${insets.r}px ${insets.b}px ${insets.l}px round ${radius}px)`;
  const previous = (pill as HTMLElement & { __e?: Insets }).__e;

  const stateTween = (pill as HTMLElement & { __st?: gsap.core.Tween }).__st;
  if (!animate && previous && same(previous, next) && stateTween && gsap.isTweening(stateTween)) return;

  (pill as HTMLElement & { __e?: Insets }).__e = next;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!animate || reduce || !previous || Number(gsap.getProperty(pill, 'opacity')) === 0) {
    gsap.killTweensOf((pill as HTMLElement & { __st?: object }).__st ?? {});
    (pill as HTMLElement & { __st?: Insets }).__st = { ...next };
    gsap.set(pill, { clipPath: clip(next), opacity: 1 });
    return;
  }

  const state = (pill as HTMLElement & { __st?: Insets }).__st ?? { ...previous };
  (pill as HTMLElement & { __st?: Insets }).__st = state;
  gsap.killTweensOf(state);

  const vertical = Math.abs(next.t - previous.t) > Math.abs(next.l - previous.l);
  const forward = vertical ? next.t > previous.t : next.l > previous.l;
  const [lead, trail]: (keyof Insets)[] = vertical
    ? forward ? ['b', 't'] : ['t', 'b']
    : forward ? ['r', 'l'] : ['l', 'r'];
  const cross: (keyof Insets)[] = vertical ? ['l', 'r'] : ['t', 'b'];
  const update = () => gsap.set(pill, { clipPath: clip(state) });

  gsap.to(state, { [lead]: next[lead], duration: .36, ease: 'power3.out', onUpdate: update });
  gsap.to(state, { [trail]: next[trail], duration: .55, ease: 'power3.inOut', onUpdate: update });
  gsap.to(state, { [cross[0]]: next[cross[0]], [cross[1]]: next[cross[1]], duration: .45, ease: 'power3.inOut', onUpdate: update });
}
