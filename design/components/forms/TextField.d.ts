/** Sunken pixel text input; Spark ring on focus, Glitch ring on error. */
export interface TextFieldProps { label?: string; type?: string; value?: string; onChange?: (v: string) => void; placeholder?: string; error?: string; hint?: string; }
export declare function TextField(p: TextFieldProps): JSX.Element;