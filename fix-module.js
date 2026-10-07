const fs = require('fs');
let c = fs.readFileSync('yama-server/src/app.module.ts', 'utf8');
c = c.replace("import { Module } from '@nestjs/common';", "import { Module, OnModuleInit } from '@nestjs/common';");
const inject = `export class AppModule implements OnModuleInit { constructor(private readonly service: WinterPitService) {} async onModuleInit() { try { const { parseWinteringPits } = await import('./parser'); const data = await parseWinteringPits(); await this.service.seed(data); console.log('Parser seed complete:', data.length, 'pits'); } catch (e) { console.error('Parser seed error:', e); } } }`;
c = c.replace('export class AppModule {}', inject);
fs.writeFileSync('yama-server/src/app.module.ts', c);
