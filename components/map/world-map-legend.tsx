import type { ReactNode } from 'react';
import { WORLD_MAP_TEXT } from '@/lib/constants';
import type { RealmStatus } from '@/lib/types';
import { StatusPip } from './world-map-art';

type Props = {
  /** The current-realm tag on this map: "YOU ARE HERE" or "START HERE". */
  tag: string;
};

/** A land sample: a small square with the map's own land classes. */
function LandSample({ status, pathOnly }: { status?: string; pathOnly?: boolean }) {
  return (
    <g className="world-island" data-status={status} data-path-only={pathOnly || undefined}>
      <rect className="world-land" x="4" y="2" width="24" height="16" />
      <rect className="world-land-texture" x="4" y="2" width="24" height="16" />
      <rect className="world-coast" x="4" y="2" width="24" height="16" />
    </g>
  );
}

/** A pin's state mark, as on the map (world-map.css → .world-marker-pip). */
function Pip({ status }: { status: RealmStatus }) {
  return (
    <span className="world-marker-pip" data-legend>
      <StatusPip status={status} />
    </span>
  );
}

/** The drawn sample for each row, in the map's own classes (world-map.css), 32×20 px. */
const SAMPLES = {
  cleared: (
    <g className="world-trail" data-cleared>
      <line className="world-trail-under" x1="2" y1="10" x2="30" y2="10" />
      <line className="world-trail-line" x1="2" y1="10" x2="30" y2="10" />
    </g>
  ),
  ahead: (
    <g className="world-trail">
      <line className="world-trail-line" x1="2" y1="10" x2="30" y2="10" />
    </g>
  ),
  here: <rect className="world-legend-here" x="9" y="3" width="14" height="14" />,
  locked: <LandSample status="tier-locked" />,
  pathOnly: <LandSample pathOnly />,
} as const;

/** Rows whose sample is a pin mark (HTML, not part of the 32×20 svg). */
const PIPS: Record<string, ReactNode> = {
  realmCleared: <Pip status="cleared" />,
  inProgress: <Pip status="in-progress" />,
  open: <Pip status="open" />,
  locked: <Pip status="tier-locked" />,
};

/**
 * The map key under the world map: what the route, the tag, the pin marks,
 * the hatching and a dashed coast mean. Each row is a small drawn sample (decoration,
 * aria-hidden) and words, so nothing depends on colour alone. The samples
 * use the map's own classes and patterns, so key and map always match.
 * Styles: world-map.css.
 */
export function WorldMapLegend({ tag }: Props) {
  const { legend } = WORLD_MAP_TEXT;
  const rows: [keyof typeof SAMPLES | keyof typeof PIPS, string][] = [
    ['cleared', legend.cleared],
    ['ahead', legend.ahead],
    ['here', tag],
    ['realmCleared', legend.realmCleared],
    ['inProgress', legend.inProgress],
    ['open', legend.open],
    ['locked', legend.locked],
    ['pathOnly', legend.pathOnly],
  ];
  return (
    <ul className="world-legend" aria-label={WORLD_MAP_TEXT.legendLabel}>
      {rows.map(([sample, label]) => (
        <li key={sample} className="world-legend-row">
          <span className="world-legend-sample">
            {sample in SAMPLES && (
              <svg
                viewBox="0 0 32 20"
                shapeRendering="crispEdges"
                aria-hidden="true"
                focusable="false"
              >
                {SAMPLES[sample as keyof typeof SAMPLES]}
              </svg>
            )}
            {PIPS[sample]}
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}
