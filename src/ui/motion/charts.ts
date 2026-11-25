import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { motionEnabled, query } from './interactions';

/** Source `l()`: nice axis ticks, e.g. `[0, .25, .5, .75, 1]`. */
export function niceTicks(max: number, ticks = 4) {
  const rough = max / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(rough || 1));
  const step = [1, 2, 2.5, 5, 10].map((value) => value * magnitude).find((value) => value >= rough) ?? rough;
  return Array.from({ length: ticks + 1 }, (_, index) => index * step);
}

/** Source `d()`: Catmull-Rom to cubic Bézier path used by the area chart. */
export function smoothPath(points: Array<[number, number]>) {
  if (!points.length) return '';
  let path = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index++) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    path += ` C${(current[0] + (next[0] - previous[0]) / 6).toFixed(1)},${(current[1] + (next[1] - previous[1]) / 6).toFixed(1)}`;
    path += ` ${(next[0] - (after[0] - current[0]) / 6).toFixed(1)},${(next[1] - (after[1] - current[1]) / 6).toFixed(1)}`;
    path += ` ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
  }
  return path;
}

type RootRef<T extends HTMLElement = HTMLElement> = RefObject<T | null>;

interface PreviousBars {
  values: number[];
  ghost: number[];
  top: number;
}

/** Source bar mount/update GSAP timeline, including reshaped-data interpolation. */
export function useBarsMotion(rootRef: RootRef, values: number[], ghost: number[] | undefined, top: number) {
  const first = useRef(true);
  const previous = useRef<PreviousBars | null>(null);
  const valueKey = values.join(',');
  const ghostKey = (ghost ?? []).join(',');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const bars = query(root, '.bars__bar');
    const ghosts = query(root, '.bars__ghost');
    const ghostValues = ghost ?? [];
    const before = previous.current;

    const ratioFor = (source: number[], index: number, length: number) => source.length
      ? (source[Math.min(source.length - 1, Math.floor((index + .5) * source.length / length))] ?? 0) / (before?.top || top)
      : 0;

    const setStatic = () => {
      bars.forEach((element, index) => {
        element.style.transform = `scaleY(${(values[index] ?? 0) / top})`;
      });
      ghosts.forEach((element, index) => {
        element.style.transform = `scaleY(${(ghostValues[index] ?? 0) / top})`;
      });
    };

    if (!motionEnabled()) {
      setStatic();
      first.current = false;
      previous.current = { values: values.slice(), ghost: ghostValues.slice(), top };
      return;
    }

    const reshaped = !!before && before.values.length !== values.length;
    bars.forEach((element, index) => {
      const to = (values[index] ?? 0) / top;
      if (first.current) {
        gsap.fromTo(element, { scaleY: 0 }, { scaleY: to, duration: 1, delay: .15 + index * .04, ease: 'expo.out' });
      } else if (reshaped && before) {
        gsap.fromTo(element, { scaleY: ratioFor(before.values, index, values.length) }, {
          scaleY: to,
          duration: .8,
          delay: index * (.25 / values.length),
          ease: 'expo.inOut',
        });
      } else {
        gsap.to(element, { scaleY: to, duration: .75, delay: index * .02, ease: 'expo.inOut' });
      }
    });

    ghosts.forEach((element, index) => {
      const to = (ghostValues[index] ?? 0) / top;
      if (first.current) {
        gsap.fromTo(element, { scaleY: 0 }, { scaleY: to, duration: 1.1, delay: .05 + index * .04, ease: 'expo.out' });
      } else if (reshaped && before) {
        gsap.fromTo(element, { scaleY: ratioFor(before.ghost, index, values.length) }, {
          scaleY: to,
          duration: .8,
          ease: 'expo.inOut',
        });
      } else {
        gsap.to(element, { scaleY: to, duration: .75, ease: 'expo.inOut' });
      }
    });

    first.current = false;
    previous.current = { values: values.slice(), ghost: ghostValues.slice(), top };
    return () => {
      gsap.killTweensOf(bars);
      gsap.killTweensOf(ghosts);
    };
    // Source keys the effect off joined values, not array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey, ghostKey, top]);
}

export interface AreaMotionRefs {
  svg: RefObject<SVGSVGElement | null>;
  fill: RefObject<SVGPathElement | null>;
  line: RefObject<SVGPathElement | null>;
  compare: RefObject<SVGPathElement | null>;
}

interface AreaState {
  values: number[];
  compare: number[];
  top: number;
  base: number;
}

/** Source area-chart draw, path morph and ResizeObserver redraw. */
export function useAreaMotion(
  refs: AreaMotionRefs,
  values: number[],
  compare: number[] | undefined,
  top: number,
  base: number,
  width: number,
  height: number,
) {
  const state = useRef<AreaState | null>(null);
  const initial = useRef(true);

  const render = useCallback(() => {
    const current = state.current;
    if (!current) return;
    const project = (value: number) =>
      (value - current.base) / (current.top - current.base || 1) * (height - 12 - 26);
    const points = current.values.map((value, index) => [
      index / Math.max(1, current.values.length - 1) * width,
      height - 26 - project(value),
    ] as [number, number]);
    const path = smoothPath(points);
    refs.line.current?.setAttribute('d', path);
    refs.fill.current?.setAttribute('d', `${path} L${width},${height - 26} L0,${height - 26} Z`);
    if (current.compare.length && refs.compare.current) {
      const comparison = current.compare.map((value, index) => [
        index / Math.max(1, current.compare.length - 1) * width,
        height - 26 - project(value),
      ] as [number, number]);
      refs.compare.current.setAttribute('d', smoothPath(comparison));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, width]);

  useLayoutEffect(() => {
    const next: AreaState = {
      values: values.slice(),
      compare: (compare ?? []).slice(),
      top,
      base,
    };
    const before = state.current;

    if (!motionEnabled()) {
      state.current = next;
      initial.current = false;
      render();
      return;
    }

    if (!before || before.values.length !== values.length) {
      state.current = next;
      render();
      if (initial.current && refs.line.current) {
        const length = refs.line.current.getTotalLength();
        gsap.fromTo(refs.line.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        }, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.inOut',
          clearProps: 'strokeDasharray,strokeDashoffset',
        });
        gsap.fromTo(refs.fill.current, { opacity: 0 }, {
          opacity: 1,
          duration: .9,
          delay: .3,
          clearProps: 'opacity',
        });
        if (refs.compare.current) {
          gsap.fromTo(refs.compare.current, { opacity: 0 }, {
            opacity: 1,
            duration: .6,
            delay: .6,
            clearProps: 'opacity',
          });
        }
      }
      initial.current = false;
      return;
    }

    const progress = { k: 0 };
    gsap.to(progress, {
      k: 1,
      duration: .9,
      ease: 'expo.inOut',
      onUpdate: () => {
        state.current = {
          values: next.values.map((value, index) => (before.values[index] ?? value) + (value - (before.values[index] ?? value)) * progress.k),
          compare: next.compare.map((value, index) => (before.compare[index] ?? value) + (value - (before.compare[index] ?? value)) * progress.k),
          top: before.top + (next.top - before.top) * progress.k,
          base: before.base + (next.base - before.base) * progress.k,
        };
        render();
      },
      onComplete: () => {
        state.current = next;
        render();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.join(','), (compare ?? []).join(','), top, base]);

  useEffect(() => {
    if (state.current) render();
  }, [render]);

  return render;
}

/** Source heat-map staggered scale/opacity entrance. */
export function useHeatMotion(rootRef: RootRef, rows: unknown[], cols: unknown[]) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !motionEnabled()) return;
    const cells = query(root, '.heat__cell i');
    const animation = gsap.fromTo(cells, {
      scale: 0,
      opacity: 0,
    }, {
      scale: 1,
      opacity: 1,
      duration: .6,
      ease: 'back.out(2.2)',
      clearProps: 'transform,opacity',
      stagger: { each: .012, grid: [rows.length, cols.length], from: 'start' },
    });
    return () => { animation.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Source split-bar scaleX stagger. */
export function useSplitMotion(rootRef: RootRef, valueKey: string) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const segments = query(root, '.split__seg i');
    if (!motionEnabled()) {
      segments.forEach((element) => { element.style.transform = 'scaleX(1)'; });
      return;
    }
    const animation = gsap.fromTo(segments, { scaleX: 0 }, {
      scaleX: 1,
      duration: .8,
      ease: 'expo.out',
      stagger: .09,
      delay: .25,
      clearProps: 'transform',
    });
    return () => { animation.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueKey]);
}

/** Source sparkline stroke-dash reveal. */
export function useSparkMotion(lineRef: RefObject<SVGPathElement | null>, path: string) {
  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line || !motionEnabled()) return;
    const length = line.getTotalLength();
    const animation = gsap.fromTo(line, {
      strokeDasharray: length,
      strokeDashoffset: length,
    }, {
      strokeDashoffset: 0,
      duration: 1.2,
      delay: .3,
      ease: 'power2.inOut',
      clearProps: 'strokeDasharray,strokeDashoffset',
    });
    return () => { animation.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
}

/** Source ring dashoffset reveal. */
export function useRingMotion(arcRef: RefObject<SVGCircleElement | null>, value: number, circumference: number) {
  useLayoutEffect(() => {
    const arc = arcRef.current;
    if (!arc) return;
    const target = Math.max(0, Math.min(1, value));
    const offset = () => String(circumference * (1 - target));
    if (!motionEnabled()) {
      arc.setAttribute('stroke-dashoffset', offset());
      return;
    }
    const state = { v: 0 };
    const animation = gsap.to(state, {
      v: target,
      duration: 1.1,
      ease: 'expo.out',
      delay: .2,
      onUpdate: () => arc.setAttribute('stroke-dashoffset', String(circumference * (1 - state.v))),
      onComplete: () => arc.setAttribute('stroke-dashoffset', offset()),
    });
    return () => { animation.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, circumference]);
}
