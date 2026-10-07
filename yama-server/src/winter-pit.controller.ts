import { Controller, Get, Post } from '@nestjs/common';
import { WinterPitService } from './winter-pit.service';
import { parseWinteringPits } from './parser';

@Controller('pits')
export class WinterPitController {
  constructor(private readonly service: WinterPitService) {}

  @Get()
  async getPits() {
    return this.service.findAll();
  }

  @Post('seed')
  async seed() {
    const data = await parseWinteringPits();
    return this.service.seed(data);
  }
}
