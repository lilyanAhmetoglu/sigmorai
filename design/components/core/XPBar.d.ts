/** Segmented pixel progress bar for XP, HP (attempts), realm completion. */
export interface XPBarProps { value?: number; max?: number; color?: string; label?: string; segments?: number; height?: number; }
export declare function XPBar(p: XPBarProps): JSX.Element;