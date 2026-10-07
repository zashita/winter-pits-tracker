import { Repository } from 'typeorm';
import { WinterPit } from './winter-pit.entity';
export declare class WinterPitService {
    private repo;
    constructor(repo: Repository<WinterPit>);
    findAll(): Promise<WinterPit[]>;
    seed(pits: any[]): Promise<WinterPit[]>;
}
