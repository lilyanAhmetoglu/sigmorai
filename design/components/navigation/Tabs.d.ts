/** HUD tab strip. */
export interface TabsProps { items?: string[]; value?: string; onChange?: (v: string) => void; }
export declare function Tabs(p: TabsProps): JSX.Element;