/** Quiz answer / checkbox / radio row. state marks graded answers. */
export interface ChoiceProps { label?: string; checked?: boolean; onChange?: (v: boolean) => void; type?: 'checkbox'|'radio'; state?: 'correct'|'wrong'; }
export declare function Choice(p: ChoiceProps): JSX.Element;