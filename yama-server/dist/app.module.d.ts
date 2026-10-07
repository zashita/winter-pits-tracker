import { OnModuleInit } from '@nestjs/common';
import { WinterPitService } from './winter-pit.service';
export declare class AppModule implements OnModuleInit {
    private readonly service;
    constructor(service: WinterPitService);
    onModuleInit(): Promise<void>;
}
