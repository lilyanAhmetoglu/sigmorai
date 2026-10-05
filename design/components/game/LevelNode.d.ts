/** A stop on the world map path. boss = realm finale challenge. */
export interface LevelNodeProps { index?: number|string; status?: 'locked'|'open'|'current'|'done'; color?: string; label?: string; boss?: boolean; onClick?: () => void; }
export declare function LevelNode(p: LevelNodeProps): JSX.Element;