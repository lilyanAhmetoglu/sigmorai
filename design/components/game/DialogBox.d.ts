import type { ReactNode } from 'react';
/** Parchment RPG dialog for story beats and NPC guides. */
export interface DialogBoxProps { speaker?: string; portrait?: ReactNode; children?: ReactNode; onNext?: () => void; nextLabel?: string; }
export declare function DialogBox(p: DialogBoxProps): JSX.Element;