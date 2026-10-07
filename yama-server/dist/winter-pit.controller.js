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
exports.WinterPitController = void 0;
const common_1 = require("@nestjs/common");
const winter_pit_service_1 = require("./winter-pit.service");
const parser_1 = require("./parser");
let WinterPitController = class WinterPitController {
    constructor(service) {
        this.service = service;
    }
    async getPits() {
        return this.service.findAll();
    }
    async seed() {
        const data = await (0, parser_1.parseWinteringPits)();
        return this.service.seed(data);
    }
};
exports.WinterPitController = WinterPitController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WinterPitController.prototype, "getPits", null);
__decorate([
    (0, common_1.Post)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WinterPitController.prototype, "seed", null);
exports.WinterPitController = WinterPitController = __decorate([
    (0, common_1.Controller)('pits'),
    __metadata("design:paramtypes", [winter_pit_service_1.WinterPitService])
], WinterPitController);
//# sourceMappingURL=winter-pit.controller.js.map