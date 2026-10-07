"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const winter_pit_entity_1 = require("./winter-pit.entity");
const winter_pit_service_1 = require("./winter-pit.service");
const winter_pit_controller_1 = require("./winter-pit.controller");
let AppModule = class AppModule {
    constructor(service) {
        this.service = service;
    }
    async onModuleInit() {
        try {
            const { parseWinteringPits } = await Promise.resolve().then(() => require('./parser'));
            const data = await parseWinteringPits();
            await this.service.seed(data);
            console.log('Parser seed complete:', data.length, 'pits');
        }
        catch (e) {
            console.error('Parser seed error:', e);
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: '4444',
                database: 'yama_bd',
                entities: [winter_pit_entity_1.WinterPit],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([winter_pit_entity_1.WinterPit]),
        ],
        controllers: [winter_pit_controller_1.WinterPitController],
        providers: [winter_pit_service_1.WinterPitService],
    }),
    __metadata("design:paramtypes", [winter_pit_service_1.WinterPitService])
], AppModule);
//# sourceMappingURL=app.module.js.map