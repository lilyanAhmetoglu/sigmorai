import type {
  ACCENTS,
  AVATAR_SIZES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  CHOICE_STATES,
  LEVEL_STATUSES,
  PANEL_PADDINGS,
  PANEL_TONES,
  QUEST_STATUSES,
} from '@/lib/constants';

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];
export type PanelTone = (typeof PANEL_TONES)[number];
export type PanelPadding = (typeof PANEL_PADDINGS)[number];
export type AvatarSize = (typeof AVATAR_SIZES)[number];
export type Accent = (typeof ACCENTS)[number];
export type ChoiceState = (typeof CHOICE_STATES)[number];
export type LevelStatus = (typeof LEVEL_STATUSES)[number];
export type QuestStatus = (typeof QUEST_STATUSES)[number];

/** One "who it is for" card on the landing page (lib/constants/landing-copy.ts). */
export type Audience = {
  id: string;
  /** Tab on the card's top edge. */
  label: string;
  accent: Accent;
  title: string;
  body: string;
  points: readonly string[];
  forWho: string;
};

/** One section of the privacy page (lib/constants/legal-copy.ts). */
export type PrivacySection = {
  /** Anchor id, so a section can be linked. */
  id: string;
  heading: string;
  paragraphs?: readonly string[];
  /** A definition list: a short term, its text, and an optional outside link after it. */
  items?: readonly { term: string; text: string; link?: { label: string; href: string } }[];
};
