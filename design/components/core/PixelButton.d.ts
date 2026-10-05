import type { ReactNode } from 'react';
/** Chunky beveled pixel button with notched outline. Presses down 2px.
 * @startingPoint section="Core" subtitle="Primary game button" viewport="700x220" */
export interface PixelButtonProps { variant?: 'primary'|'xp'|'success'|'secondary'|'danger'|'ghost'; size?: 'sm'|'md'|'lg'; disabled?: boolean; full?: boolean; icon?: ReactNode; children?: ReactNode; onClick?: () => void; }
export declare function PixelButton(p: PixelButtonProps): JSX.Element;