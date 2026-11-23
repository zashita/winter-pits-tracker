import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinterPit } from './winter-pit.entity';
import { WinterPitService } from './winter-pit.service';
import { WinterPitController } from './winter-pit.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'yama-bd',
          }),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
      entities: [WinterPit],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
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
      if ((await this.service.count()) === 0) {
        const data = await parseWinteringPits();
        await this.service.seed(data);
        console.log('Parser seed complete:', data.length, 'pits');
      } else {
        console.log('Parser seed skipped: database already contains pits');
      }
    } catch (e) {
      console.error('Parser seed error:', e);
    }
  }
}
