import type { ReactNode } from 'react';
/** Notched pixel window — the base container for cards, sidebars, modals. */
export interface PanelProps { tone?: 'default'|'sunken'|'raised'|'story'; title?: string; accent?: string; padding?: number; children?: ReactNode; }
export declare function Panel(p: PanelProps): JSX.Element;