import type { ReactNode } from 'react';
/** Transient HUD notice: XP gained, new level unlocked, errors. */
export interface ToastProps { kind?: 'xp'|'success'|'info'|'danger'; title?: string; children?: ReactNode; }
export declare function Toast(p: ToastProps): JSX.Element;