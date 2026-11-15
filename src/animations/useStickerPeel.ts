import { useCallback, useEffect, useRef } from "react";
import { gsap } from "./gsap";

interface StickerPeelOptions {
  /** Idle lift, as a fraction of the sticker's shorter side. */
  rest?: number;
  /** Peel amount on hover/click, as a fraction of the shorter side. */
  peeled?: number;
}

export function useStickerPeel({
  rest = 0.13,
  peeled = 0.71,
}: StickerPeelOptions = {}) {
  // The sticker face (image plus foil layers). It is clipped as one piece.
  const baseRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const flapImgRef = useRef<HTMLImageElement>(null);

  const state = useRef({ p: rest });
  const tweenRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const isPeeled = useRef(false);

  // Draw the current peel state: clip the base, fold the flap.
  const render = useCallback(() => {
    const base = baseRef.current;
    const flap = flapRef.current;
    const flapImg = flapImgRef.current;
    if (!base || !flap || !flapImg) return;

    const w = base.offsetWidth;
    const h = base.offsetHeight;
    if (!w || !h) return;

    // d = how far the fold has travelled in from the bottom-right corner.
    const d = state.current.p * Math.min(w, h);

    // Base: everything except the peeled corner triangle.
    base.style.clipPath = `polygon(0px 0px, ${w}px 0px, ${w}px ${h - d}px, ${
      w - d
    }px ${h}px, 0px ${h}px)`;

    // Flap: only the corner triangle of the image...
    flapImg.style.clipPath = `polygon(${w}px ${h}px, ${w}px ${
      h - d
    }px, ${w - d}px ${h}px)`;

    // ...reflected across the fold line x + y = w + h - d.
    const c = w + h - d;
    flap.style.transform = `matrix(0, -1, -1, 0, ${c}, ${c})`;
  }, []);

  const peelTo = useCallback(
    (target: number, duration: number, ease: string) => {
      tweenRef.current?.kill();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      tweenRef.current = gsap.to(state.current, {
        p: target,
        duration: reduceMotion ? 0 : duration,
        ease,
        onUpdate: render,
      });
    },
    [render]
  );

  const onMouseEnter = useCallback(
    () => peelTo(peeled, 0.7, "power3.out"),
    [peelTo, peeled]
  );

  const onMouseLeave = useCallback(() => {
    isPeeled.current = false;
    peelTo(rest, 0.8, "power2.inOut");
  }, [peelTo, rest]);

  // Click toggle so it also works on touch screens.
  const onClick = useCallback(() => {
    isPeeled.current = !isPeeled.current;
    if (isPeeled.current) {
      peelTo(peeled, 0.7, "power3.out");
    } else {
      peelTo(rest, 0.8, "power2.inOut");
    }
  }, [peelTo, peeled, rest]);

  // Keep the clip/fold in sync with the sticker's rendered size.
  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    render();

    const observer = new ResizeObserver(render);
    observer.observe(base);

    return () => {
      observer.disconnect();
      tweenRef.current?.kill();
    };
  }, [render]);

  return {
    baseRef,
    flapRef,
    flapImgRef,
    render,
    handlers: { onMouseEnter, onMouseLeave, onClick },
  };
}