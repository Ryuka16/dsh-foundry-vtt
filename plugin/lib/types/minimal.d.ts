export interface MinimalHelpers {
    makeTool: (name: string, desc: string, props: Record<string, unknown>, required: string[], execute: (args: Record<string, unknown>) => Promise<unknown>) => {
        name: string;
    };
    callRelay: (method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, opts?: Record<string, unknown>) => Promise<unknown>;
    asObject: (v: unknown) => Record<string, unknown>;
    normalizeDocIds: (doc: unknown) => {
        doc: unknown;
        renamed: string[];
    };
    targetingQuery: (args: Record<string, unknown>) => Record<string, unknown>;
}
type Reg = (t: {
    name: string;
}) => void;
export declare function registerMinimalTools(h: MinimalHelpers, reg: Reg): void;
export {};
