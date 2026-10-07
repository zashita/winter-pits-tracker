import { WinterPitService } from './winter-pit.service';
export declare class WinterPitController {
    private readonly service;
    constructor(service: WinterPitService);
    getPits(): Promise<import("./winter-pit.entity").WinterPit[]>;
    seed(): Promise<import("./winter-pit.entity").WinterPit[]>;
}
