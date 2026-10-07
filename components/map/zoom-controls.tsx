'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { PixelButton } from '@/components/pixel-button';
import { WORLD_MAP_TEXT, ZOOM_STEPS } from '@/lib/constants';
import type { ZoomStep } from '@/lib/types';

type Props = {
  /** id of the world map's scroll box. */
  boxId: string;
};

/** The box's zoom step: its data-zoom, else the overview world-map.css chose (½ or 1). */
function readZoom(boxId: string): ZoomStep | null {
  const box = document.getElementById(boxId);
  if (!box) return null;
  const z = Number(getComputedStyle(box).getPropertyValue('--world-z'));
  return ZOOM_STEPS.find((s) => s === z) ?? ZOOM_STEPS[0];
}

/**
 * Zoom in / out for the world map: sets data-zoom on the box (world-map.css
 * does the rest) and keeps the point at the box's centre at the centre. The
 * change is instant, so reduced motion needs nothing more. A button at its
 * limit is aria-disabled (it stays focusable). The step is read from the box
 * (an external store: data-zoom changes and viewport resizes), so it is null
 * on the server and during hydration, and the buttons render only after it:
 * with no JS the map keeps the CSS overview. Styles: world-map.css.
 */
export function ZoomControls({ boxId }: Props) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const box = document.getElementById(boxId);
      const observer = new MutationObserver(onChange);
      if (box) observer.observe(box, { attributes: true, attributeFilter: ['data-zoom'] });
      window.addEventListener('resize', onChange);
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', onChange);
      };
    },
    [boxId],
  );
  const zoom = useSyncExternalStore(
    subscribe,
    () => readZoom(boxId),
    () => null,
  );

  if (zoom === null) return <div className="world-zoom" />;

  const index = ZOOM_STEPS.indexOf(zoom);
  const atMin = index <= 0;
  const atMax = index >= ZOOM_STEPS.length - 1;

  function go(step: -1 | 1) {
    const box = document.getElementById(boxId);
    const next = ZOOM_STEPS[index + step];
    if (!box || next === undefined) return;
    // The centre as a share of the content, so the same spot stays centred.
    const cx = (box.scrollLeft + box.clientWidth / 2) / box.scrollWidth;
    const cy = (box.scrollTop + box.clientHeight / 2) / box.scrollHeight;
    box.dataset.zoom = String(next);
    box.scrollLeft = cx * box.scrollWidth - box.clientWidth / 2;
    box.scrollTop = cy * box.scrollHeight - box.clientHeight / 2;
  }

  return (
    <div className="world-zoom">
      <PixelButton
        variant="secondary"
        aria-label={WORLD_MAP_TEXT.zoomOut}
        aria-controls={boxId}
        aria-disabled={atMin || undefined}
        onClick={() => !atMin && go(-1)}
      >
        <span aria-hidden="true">{WORLD_MAP_TEXT.zoomOutIcon}</span>
      </PixelButton>
      <span className="world-zoom-label">{WORLD_MAP_TEXT.zoomLabel(zoom)}</span>
      <PixelButton
        variant="secondary"
        aria-label={WORLD_MAP_TEXT.zoomIn}
        aria-controls={boxId}
        aria-disabled={atMax || undefined}
        onClick={() => !atMax && go(1)}
      >
        <span aria-hidden="true">{WORLD_MAP_TEXT.zoomInIcon}</span>
      </PixelButton>
    </div>
  );
}
