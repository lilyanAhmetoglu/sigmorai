'use client';

import { useEffect } from 'react';

/**
 * On mount, centres the current level node ([aria-current="step"]) in the
 * map's sideways scroller. Sets scrollLeft on the strip only: scrollIntoView
 * would also scroll the page down when the map starts below the fold.
 */
export function ScrollToCurrent({ scrollerId }: { scrollerId: string }) {
  useEffect(() => {
    const scroller = document.getElementById(scrollerId);
    const node = scroller?.querySelector('[aria-current="step"]');
    if (!scroller || !node) return;
    const box = scroller.getBoundingClientRect();
    const target = node.getBoundingClientRect();
    const centre = target.left - box.left + target.width / 2;
    scroller.scrollLeft += centre - scroller.clientWidth / 2;
  }, [scrollerId]);
  return null;
}
