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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinterPitService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const winter_pit_entity_1 = require("./winter-pit.entity");
let WinterPitService = class WinterPitService {
    constructor(repo) {
        this.repo = repo;
    }
    async findAll() {
        return this.repo.find();
    }
    async seed(pits) {
        await this.repo.clear();
        const entities = pits.map(p => {
            const entity = new winter_pit_entity_1.WinterPit();
            entity.starts = [p.starts[0], p.starts[1]];
            entity.ends = p.ends ? [p.ends[0], p.ends[1]] : null;
            entity.square = p.square;
            entity.description = p.description || '';
            return entity;
        });
        return this.repo.save(entities);
    }
};
exports.WinterPitService = WinterPitService;
exports.WinterPitService = WinterPitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(winter_pit_entity_1.WinterPit)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WinterPitService);
//# sourceMappingURL=winter-pit.service.js.map