import type { ReactNode } from 'react';
/** Tiny HUD label chip. */
export interface BadgeProps { kind?: 'xp'|'success'|'info'|'danger'|'math'|'neutral'|'new'; children?: ReactNode; }
export declare function Badge(p: BadgeProps): JSX.Element;