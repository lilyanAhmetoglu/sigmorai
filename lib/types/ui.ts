import type {
  ACCENTS,
  AVATAR_SIZES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  PANEL_PADDINGS,
  PANEL_TONES,
} from '@/lib/constants';

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type PanelTone = (typeof PANEL_TONES)[number];
export type PanelPadding = (typeof PANEL_PADDINGS)[number];
export type AvatarSize = (typeof AVATAR_SIZES)[number];
export type Accent = (typeof ACCENTS)[number];
