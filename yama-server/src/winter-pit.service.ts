import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WinterPit } from './winter-pit.entity';

@Injectable()
export class WinterPitService {
  constructor(
    @InjectRepository(WinterPit)
    private repo: Repository<WinterPit>,
  ) {}

  async findAll(): Promise<WinterPit[]> {
    return this.repo.find();
  }

  async seed(pits: any[]): Promise<WinterPit[]> {
    await this.repo.clear();
    const entities = pits.map(p => {
      const entity = new WinterPit();
      entity.starts = [p.starts[0], p.starts[1]];
      entity.ends = p.ends ? [p.ends[0], p.ends[1]] : null;
      entity.square = p.square;
      entity.description = p.description || '';
      return entity;
    });
    return this.repo.save(entities);
  }
}
