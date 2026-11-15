import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { gsap } from "./gsap";

interface StickerHoloOptions {
  /** Maximum tilt in degrees while the pointer moves over the sticker. */
  tilt?: number;
  /** Foil strength at rest, 0 to 1. */
  idleShine?: number;
  /** Foil strength while hovered, 0 to 1. */
  hoverShine?: number;
}

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Pointer position inside the element, as 0 to 1 on each axis.
const locate = (e: ReactPointerEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    nx: clamp01((e.clientX - rect.left) / (rect.width || 1)),
    ny: clamp01((e.clientY - rect.top) / (rect.height || 1)),
  };
};

export function useStickerHolo({
  tilt = 10,
  idleShine = 0.45,
  hoverShine = 1,
}: StickerHoloOptions = {}) {
  // The element that tilts. The foil CSS variables are set on it too,
  // so every layer inside the sticker can read them.
  const tiltRef = useRef<HTMLDivElement>(null);

  // ix/iy: where the foil sits while idle.
  // px/py: where the pointer is.
  // w blends between the two (0 = idle, 1 = following the pointer).
  const state = useRef({
    ix: 25,
    iy: 35,
    px: 50,
    py: 50,
    w: 0,
    shine: idleShine,
  });

  // Push the current state into CSS variables.
  const apply = useCallback(() => {
    const el = tiltRef.current;
    if (!el) return;

    const { ix, iy, px, py, w, shine } = state.current;
    el.style.setProperty("--hx", `${ix + (px - ix) * w}%`);
    el.style.setProperty("--hy", `${iy + (py - iy) * w}%`);
    el.style.setProperty("--shine", String(shine));
  }, []);

  // Idle shimmer: the foil drifts back and forth on its own.
  useEffect(() => {
    apply();

    const idle = prefersReducedMotion()
      ? null
      : gsap.to(state.current, {
          ix: 75,
          iy: 65,
          duration: 3.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          onUpdate: apply,
        });

    return () => {
      idle?.kill();
      gsap.killTweensOf(state.current);
      if (tiltRef.current) gsap.killTweensOf(tiltRef.current);
    };
  }, [apply]);

  const onPointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (prefersReducedMotion()) return;

      // Start from the pointer so the foil doesn't sweep in from a stale spot.
      const { nx, ny } = locate(e);
      state.current.px = nx * 100;
      state.current.py = ny * 100;

      gsap.to(state.current, {
        w: 1,
        shine: hoverShine,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: apply,
      });
    },
    [apply, hoverShine]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (prefersReducedMotion()) return;

      const { nx, ny } = locate(e);

      gsap.to(state.current, {
        px: nx * 100,
        py: ny * 100,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate: apply,
      });

      if (tiltRef.current) {
        gsap.to(tiltRef.current, {
          rotateY: (nx - 0.5) * 2 * tilt,
          rotateX: -(ny - 0.5) * 2 * tilt,
          transformPerspective: 900,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    },
    [apply, tilt]
  );

  const onPointerLeave = useCallback(() => {
    gsap.to(state.current, {
      w: 0,
      shine: idleShine,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate: apply,
    });

    if (tiltRef.current) {
      gsap.to(tiltRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.9,
        ease: "elastic.out(1, 0.6)",
        overwrite: "auto",
      });
    }
  }, [apply, idleShine]);

  return {
    tiltRef,
    handlers: { onPointerEnter, onPointerMove, onPointerLeave },
  };
}