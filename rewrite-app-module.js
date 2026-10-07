const fs = require('fs');
fs.writeFileSync('yama-server/src/app.module.ts', `import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinterPit } from './winter-pit.entity';
import { WinterPitService } from './winter-pit.service';
import { WinterPitController } from './winter-pit.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '4444',
      database: 'yama_bd',
      entities: [WinterPit],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([WinterPit]),
  ],
  controllers: [WinterPitController],
  providers: [WinterPitService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly service: WinterPitService) {}
  async onModuleInit() {
    try {
      const { parseWinteringPits } = await import('./parser');
      const data = await parseWinteringPits();
      await this.service.seed(data);
      console.log('Parser seed complete:', data.length, 'pits');
    } catch (e) {
      console.error('Parser seed error:', e);
    }
  }
}
`);
