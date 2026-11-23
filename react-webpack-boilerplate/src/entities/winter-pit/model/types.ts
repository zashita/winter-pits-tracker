export interface WinterPit {
    id: number;
    starts: [number, number];
    ends?: [number, number];
    /** [start bank A, start bank B, end bank B, end bank A] */
    shape?: [[number, number], [number, number], [number, number], [number, number]];
    square: number;
    description: string;
    region?: string;
}
