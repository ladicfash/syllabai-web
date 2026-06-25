import { useEffect, useRef, useState } from "react";

interface UseScrollRevealOptions {
  /** Pixels of offset from the bottom edge to trigger reveal earlier. */
  rootMargin?: string;
  /** Only reveal once (default true). */
  once?: boolean;
  /** If true, do not render an initial hidden state on mount — start visible. */
  initialVisible?: boolean;
}

/**
 * Subtle scroll-reveal hook.
 *
 * Adds `.reveal` (or `.reveal-${direction}`) to the returned ref while the
 * element is below the viewport, then `.reveal--in` once it enters. Respects
 * `prefers-reduced-motion` by always starting visible.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  direction: "up" | "down" | "left" | "right" | "none" = "up",
  opts: UseScrollRevealOptions = {},
) {
  const { rootMargin = "0px 0px -10% 0px", once = true, initialVisible = false } = opts;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(initialVisible);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { rootMargin, threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  const className = `reveal reveal-${direction}${visible ? " reveal--in" : ""}`;
  return { ref, className, visible } as const;
}