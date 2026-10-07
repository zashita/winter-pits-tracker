export interface WinteringPit {
    id: number;
    starts: [number, number];
    ends?: [number, number];
    square: number;
    description: string;
}
export declare function parseWinteringPits(url?: string): Promise<WinteringPit[]>;
