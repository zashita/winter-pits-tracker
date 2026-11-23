import { Controller, Get } from '@nestjs/common';
import { WinterPitService } from './winter-pit.service';

@Controller('pits')
export class WinterPitController {
  constructor(private readonly service: WinterPitService) {}

  @Get()
  async getPits() {
    return this.service.findAll();
  }

}
