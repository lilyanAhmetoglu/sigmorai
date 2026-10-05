/** Quest summary tile: realm, title, reward, time, source doc. */
export interface QuestCardProps { realm?: string; title?: string; summary?: string; xp?: number; minutes?: number; source?: string; status?: 'open'|'done'|'locked'; color?: string; onStart?: () => void; }
export declare function QuestCard(p: QuestCardProps): JSX.Element;