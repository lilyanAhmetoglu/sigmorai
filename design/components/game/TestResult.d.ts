/** One test case row in the challenge runner. */
export interface TestResultProps { name?: string; status?: 'pass'|'fail'|'pending'|'running'; detail?: string; }
export declare function TestResult(p: TestResultProps): JSX.Element;