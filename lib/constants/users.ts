/** Hero names show on the public leaderboard, so they are short and plain. */
export const HERO_NAME_MIN = 2;
export const HERO_NAME_MAX = 24;
/** Letters (any language), digits, space, dot, apostrophe, dash, underscore. */
export const HERO_NAME_PATTERN = /^[\p{L}\p{N} .'_-]+$/u;

/**
 * The case-insensitive unique index on users.hero_name. createHero matches a
 * 23505 error on this name to tell the player "name taken".
 */
export const HERO_NAME_UNIQUE_INDEX = 'users_hero_name_lower_idx';

/**
 * Names nobody may take: staff-like words and the product's own characters.
 * Compared after NFKC, lower case, with spaces and . ' _ - removed, so
 * "The_Oracle" is not caught but "Sig-morai" and "ADMIN" are.
 */
export const RESERVED_HERO_NAMES: readonly string[] = [
  'admin',
  'administrator',
  'mod',
  'moderator',
  'staff',
  'support',
  'system',
  'root',
  'official',
  'sigmorai',
  'oracle',
  'hallucinant',
  'mentor',
];

/**
 * Letters in one hero name must come from one of these groups (no mixed
 * scripts, so "pаypal" with a Cyrillic "а" fails). Japanese and Korean mix
 * Han with kana or Hangul, so those share one group. A letter outside every
 * group is refused. Digits, spaces and . ' _ - belong to no script and are free.
 */
export const HERO_NAME_SCRIPT_GROUPS: readonly RegExp[] = [
  /\p{Script=Latin}/u,
  /\p{Script=Greek}/u,
  /\p{Script=Cyrillic}/u,
  /\p{Script=Armenian}/u,
  /\p{Script=Georgian}/u,
  /\p{Script=Hebrew}/u,
  /\p{Script=Arabic}/u,
  /\p{Script=Devanagari}/u,
  /\p{Script=Bengali}/u,
  /\p{Script=Tamil}/u,
  /\p{Script=Thai}/u,
  /\p{Script=Ethiopic}/u,
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Bopomofo}]/u,
];
