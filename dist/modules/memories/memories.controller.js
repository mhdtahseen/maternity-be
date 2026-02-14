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
exports.MemoriesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
const permissions_1 = require("../../common/constants/permissions");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const memory_dto_1 = require("./dto/memory.dto");
const memories_service_1 = require("./memories.service");
let MemoriesController = class MemoriesController {
    constructor(memoriesService) {
        this.memoriesService = memoriesService;
    }
    createUploadIntent(user, dto) {
        return this.memoriesService.createUploadIntent(user.userId, dto);
    }
    create(user, dto) {
        return this.memoriesService.create(user.userId, dto);
    }
    find(query) {
        return this.memoriesService.find(query);
    }
};
exports.MemoriesController = MemoriesController;
__decorate([
    (0, common_1.Post)('upload-intent'),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.MEMORY_WRITE),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, memory_dto_1.CreateMemoryUploadIntentDto]),
    __metadata("design:returntype", void 0)
], MemoriesController.prototype, "createUploadIntent", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.MEMORY_WRITE),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, memory_dto_1.CreateMemoryDto]),
    __metadata("design:returntype", void 0)
], MemoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(permissions_1.PERMISSIONS.MEMORY_READ),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [memory_dto_1.QueryMemoriesDto]),
    __metadata("design:returntype", void 0)
], MemoriesController.prototype, "find", null);
exports.MemoriesController = MemoriesController = __decorate([
    (0, common_1.Controller)('memories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [memories_service_1.MemoriesService])
], MemoriesController);
//# sourceMappingURL=memories.controller.js.map