import { useCallback, useLayoutEffect, useRef, type DependencyList, type RefObject } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const recordMode = () => /[?&]record\b/.test(window.location.search);
export const motionEnabled = () => !reducedMotion() && !recordMode();
/** Source `X()` helper: reduced motion collapses every GSAP duration to zero. */
export const motionDuration = (value: number) => reducedMotion() ? 0 : value;

export const query = (root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector));

export interface RevealOptions {
  y?: number;
  stagger?: number;
  delay?: number;
}

/** Source `so()`: cards, tiles and other blocks rise into place. */
export function reveal(elements: Element[], { y = 26, stagger = .06, delay = 0 }: RevealOptions = {}) {
  if (!elements.length) return gsap.timeline();
  return gsap.timeline({ delay: motionDuration(delay) }).fromTo(elements, {
    opacity: 0,
    y,
    scale: .985,
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: motionDuration(.8),
    ease: 'expo.out',
    stagger: motionDuration(stagger),
    clearProps: 'transform,opacity',
  });
}

/** Source `co()`: rows and small details follow the cards in. */
export function rise(elements: Element[], { x = 0, y = 12, stagger = .04, delay = 0 }: {
  x?: number;
  y?: number;
  stagger?: number;
  delay?: number;
} = {}) {
  if (!elements.length) return gsap.timeline();
  return gsap.fromTo(elements, {
    opacity: 0,
    x,
    y,
  }, {
    opacity: 1,
    x: 0,
    y: 0,
    duration: motionDuration(.55),
    ease: 'power3.out',
    stagger: motionDuration(stagger),
    delay: motionDuration(delay),
    clearProps: 'transform,opacity',
  });
}

/** Source `lo()`: small badges, discs and icons pop into place. */
export function popIn(elements: Element | Element[], { from = .6, delay = 0, stagger = .05 }: {
  from?: number;
  delay?: number;
  stagger?: number;
} = {}) {
  if (reducedMotion()) return;
  gsap.fromTo(elements, {
    scale: from,
    opacity: 0,
  }, {
    scale: 1,
    opacity: 1,
    duration: .6,
    ease: 'back.out(3)',
    delay,
    stagger,
    overwrite: 'auto',
    clearProps: 'transform,opacity',
  });
}

/** Source `xo()`: horizontal meter bars grow to their CSS `--f` value. */
export function growX(elements: Element[], { delay = 0, stagger = .04 }: RevealOptions = {}) {
  elements.forEach((element, index) => {
    const factor = parseFloat(getComputedStyle(element).getPropertyValue('--f')) || 0;
    gsap.fromTo(element, { scaleX: 0 }, {
      scaleX: factor,
      duration: motionDuration(.95),
      delay: motionDuration(delay + index * stagger),
      ease: 'expo.out',
      clearProps: 'transform',
    });
  });
}

/** Source `oo()`: split a heading and reveal it character by character. */
export function splitTitle(element: HTMLElement | null, delay = 0) {
  if (!element) return gsap.timeline();
  const text = element.dataset.text ?? element.textContent ?? '';
  let characters = query(element, '.ch');

  if (element.dataset.split !== text) {
    element.setAttribute('aria-label', text);
    element.textContent = '';
    const words = text.trim().split(' ');
    words.forEach((word, wordIndex) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      wordEl.setAttribute('aria-hidden', 'true');
      for (const character of word) {
        const charEl = document.createElement('span');
        charEl.className = 'ch';
        charEl.textContent = character;
        wordEl.appendChild(charEl);
      }
      element.appendChild(wordEl);
      if (wordIndex < words.length - 1) element.appendChild(document.createTextNode(' '));
    });
    element.dataset.split = text;
    characters = query(element, '.ch');
  }

  return gsap.fromTo(characters, {
    yPercent: 115,
    rotation: 6,
  }, {
    yPercent: 0,
    rotation: 0,
    duration: motionDuration(.85),
    ease: 'power4.out',
    stagger: motionDuration(.022),
    delay: motionDuration(delay),
    clearProps: 'transform',
  });
}

/** Source `po()`: icon buttons bounce their SVG on click. */
export function iconPop(element: HTMLElement | null) {
  if (!element || reducedMotion()) return;
  const target = element.querySelector('svg') ?? element;
  gsap.fromTo(target, { scale: .7 }, {
    scale: 1,
    duration: .55,
    ease: 'back.out(3)',
    overwrite: true,
  });
}

/** Source `mo()`: chips shake sideways when toggled. */
export function chipShake(element: HTMLElement | null) {
  if (!element || reducedMotion()) return;
  gsap.fromTo(element, { x: 0 }, {
    keyframes: { x: [0, -8, 7, -5, 3, 0] },
    duration: .42,
    ease: 'power2.out',
    clearProps: 'transform',
  });
}

interface CounterState {
  v: number;
}

const counters = new WeakMap<HTMLElement, CounterState>();

/** Source `fo()`: animated numeric counters used on KPIs and hero stats. */
export function counter(element: HTMLElement | null, value: number, format: (value: number) => string, {
  duration = 1.2, delay = 0, from,
}: { duration?: number; delay?: number; from?: number } = {}) {
  if (!element) return;
  let state = counters.get(element);
  if (!state) {
    state = { v: from ?? 0 };
    counters.set(element, state);
  }
  if (from !== undefined) state.v = from;
  gsap.killTweensOf(state);
  if (reducedMotion() || !duration || state.v === value) {
    state.v = value;
    element.textContent = format(value);
    return;
  }
  element.textContent = format(state.v);
  gsap.to(state, {
    v: value,
    duration,
    delay,
    ease: 'power3.out',
    onUpdate: () => { element.textContent = format(state!.v); },
    onComplete: () => { element.textContent = format(value); },
  });
}

/** Source `Nc()`: meter fill animation. */
export function meter(element: HTMLElement | null, value: number, max: number) {
  if (!element) return;
  gsap.to(element, {
    scaleX: Math.max(0, Math.min(1, value / (max || 1))),
    duration: motionDuration(1),
    ease: 'expo.out',
    delay: motionDuration(.15),
  });
}

const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let liftEnabled = false;
/** The source enables card-lift only after the intro timeline completes. */
export const enableLift = () => { liftEnabled = true; };

type Cleanup = () => void;
const magneticCleanups = new WeakMap<Element, Cleanup>();
const liftCleanups = new WeakMap<Element, Cleanup>();

/** Source `ho()`: magnetic buttons follow the pointer with `power3.out`. */
export function bindMagnetics(root: ParentNode): Cleanup {
  if (!finePointer()) return () => undefined;
  const cleanups: Cleanup[] = [];
  query(root, '.magnetic').forEach((element) => {
    if (magneticCleanups.has(element)) return;
    const moveX = gsap.quickTo(element, 'x', { duration: .5, ease: 'power3.out' });
    const moveY = gsap.quickTo(element, 'y', { duration: .5, ease: 'power3.out' });
    const onMove = (event: PointerEvent) => {
      if (reducedMotion()) return;
      const box = element.getBoundingClientRect();
      moveX((event.clientX - box.left - box.width / 2) * .2);
      moveY((event.clientY - box.top - box.height / 2) * .28);
    };
    const onLeave = () => { moveX(0); moveY(0); };
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    magneticCleanups.set(element, () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      magneticCleanups.delete(element);
    });
    cleanups.push(magneticCleanups.get(element)!);
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

/** Source `_o()`: `[data-lift]` cards float up four pixels on hover. */
export function bindLifts(root: ParentNode): Cleanup {
  if (!finePointer()) return () => undefined;
  const cleanups: Cleanup[] = [];
  query(root, '[data-lift]').forEach((element) => {
    if (liftCleanups.has(element)) return;
    const onEnter = () => {
      if (liftEnabled && !reducedMotion()) {
        gsap.to(element, { y: -4, duration: .45, ease: 'power3.out', overwrite: 'auto' });
      }
    };
    const onLeave = () => {
      if (liftEnabled && !reducedMotion()) {
        gsap.to(element, { y: 0, duration: .5, ease: 'power3.out', overwrite: 'auto', clearProps: 'transform' });
      }
    };
    element.addEventListener('pointerenter', onEnter);
    element.addEventListener('pointerleave', onLeave);
    liftCleanups.set(element, () => {
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointerleave', onLeave);
      liftCleanups.delete(element);
    });
    cleanups.push(liftCleanups.get(element)!);
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}

/**
 * Shared page-entry hook. Pages pass a selector-based animation recipe; the
 * hook supplies the GSAP context, magnetic buttons and lift effects so pages
 * never reimplement the source motion system themselves.
 */
export function usePageMotion(
  rootRef: RefObject<HTMLElement | null>,
  build: (root: HTMLElement) => void,
  deps: DependencyList,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !motionEnabled()) return;
    const context = gsap.context(() => build(root), root);
    const releaseMagnetic = bindMagnetics(root);
    const releaseLift = bindLifts(root);
    return () => {
      releaseMagnetic();
      releaseLift();
      context.revert();
    };
    // The recipe is intentionally supplied by each page; dependencies control reruns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export interface FlipOptions {
  duration?: number;
  enterDuration?: number;
  leaveDuration?: number;
  enterScale?: number;
  enterX?: number;
  leave?: boolean;
  leaveScale?: number;
  zIndex?: number;
}

/**
 * Shared FLIP helper for filter-driven lists and grids. Call the returned
 * `capture` before changing state; the hook plays the source-style layout
 * transition once the new DOM has rendered.
 */
export function useFlip<T extends HTMLElement>(
  rootRef: RefObject<T | null>,
  selector: string,
  deps: DependencyList,
  { duration = .5, enterDuration = .4, leaveDuration = .2, enterScale = .92, enterX, leave = true, leaveScale = 1, zIndex }: FlipOptions = {},
) {
  const state = useRef<Flip.FlipState | null>(null);

  const capture = useCallback(() => {
    const root = rootRef.current;
    if (!root || !motionEnabled()) return;
    state.current = Flip.getState(query(root, selector));
  }, [rootRef, selector]);

  useLayoutEffect(() => {
    const previous = state.current;
    state.current = null;
    const root = rootRef.current;
    if (!previous || !root || !motionEnabled()) return;
    const animation = Flip.from(previous, {
      targets: query(root, selector),
      duration: motionDuration(duration),
      ease: 'power3.inOut',
      absolute: false,
      ...(zIndex === undefined ? {} : { zIndex }),
      onEnter: (elements) => gsap.fromTo(elements,
        enterX === undefined ? { opacity: 0, scale: enterScale } : { opacity: 0, x: enterX },
        {
          opacity: 1,
          ...(enterX === undefined ? { scale: 1 } : { x: 0 }),
          duration: motionDuration(enterDuration),
        }),
      ...(leave ? {
        onLeave: (elements: Element[]) => gsap.to(elements, {
          opacity: 0,
          scale: leaveScale,
          duration: motionDuration(leaveDuration),
        }),
      } : {}),
    });
    return () => { animation.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return capture;
}
