/** Player avatar — uploaded photo (pixelated) or a deterministic 8×8 sprite from seed. */
export interface PixelAvatarProps { seed?: string; src?: string; size?: number; level?: number; frame?: string; }
export declare function PixelAvatar(p: PixelAvatarProps): JSX.Element;