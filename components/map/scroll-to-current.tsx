'use client';

import { useEffect } from 'react';

type Props = {
  scrollerId: string;
  /** The element to centre. Default: the level map's current node. */
  selector?: string;
};

/**
 * On mount, centres an element (by default the current level node,
 * [aria-current="step"]) in a scroll box, on both axes. Sets scrollLeft and
 * scrollTop on the box only: scrollIntoView would also scroll the page down
 * when the box starts below the fold. A box that can't scroll an axis keeps 0.
 */
export function ScrollToCurrent({ scrollerId, selector = '[aria-current="step"]' }: Props) {
  useEffect(() => {
    const scroller = document.getElementById(scrollerId);
    const node = scroller?.querySelector(selector);
    if (!scroller || !node) return;
    const box = scroller.getBoundingClientRect();
    const target = node.getBoundingClientRect();
    scroller.scrollLeft += target.left - box.left + target.width / 2 - scroller.clientWidth / 2;
    scroller.scrollTop += target.top - box.top + target.height / 2 - scroller.clientHeight / 2;
  }, [scrollerId, selector]);
  return null;
}
