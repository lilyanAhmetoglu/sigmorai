'use client';

import { useEffect } from 'react';

type Props = {
  /** The element to bring into view, e.g. the world map's current marker. */
  selector: string;
  /**
   * A scroll box (the world map): centre the element in it, on both axes.
   * Without one (the level map's quest path), the page scrolls only when the
   * element starts below the fold, and only as far as needed to show it.
   */
  scrollerId?: string;
};

/**
 * On mount, brings an element into view. In a scroll box it sets scrollLeft
 * and scrollTop on the box only: scrollIntoView would also scroll the page
 * down when the box starts below the fold. A box that can't scroll an axis
 * keeps 0. With no box, the page moves only when the element starts below
 * the fold, with block "nearest" (as little as needed). Instant, so
 * reduced motion needs nothing more.
 */
export function ScrollToCurrent({ scrollerId, selector }: Props) {
  useEffect(() => {
    if (!scrollerId) {
      const node = document.querySelector(selector);
      // Only when it starts below the fold: the header stays in view otherwise.
      if (node && node.getBoundingClientRect().top > window.innerHeight) {
        node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      return;
    }
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
