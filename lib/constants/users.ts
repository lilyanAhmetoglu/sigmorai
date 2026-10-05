/** Hero names show on the public leaderboard, so they are short and plain. */
export const HERO_NAME_MIN = 2;
export const HERO_NAME_MAX = 24;
/** Letters (any language), digits, space, dot, apostrophe, dash, underscore. */
export const HERO_NAME_PATTERN = /^[\p{L}\p{N} .'_-]+$/u;
