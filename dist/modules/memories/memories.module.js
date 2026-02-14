"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoriesModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const queues_1 = require("../../common/constants/queues");
const memory_entity_1 = require("./entities/memory.entity");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const memories_service_1 = require("./memories.service");
const memories_controller_1 = require("./memories.controller");
const minio_client_1 = require("../../integrations/storage/minio.client");
let MemoriesModule = class MemoriesModule {
};
exports.MemoriesModule = MemoriesModule;
exports.MemoriesModule = MemoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([memory_entity_1.Memory, pregnancy_profile_entity_1.PregnancyProfile, user_entity_1.User]),
            bullmq_1.BullModule.registerQueue({ name: queues_1.QUEUES.TIMELINE_BUILD })
        ],
        providers: [memories_service_1.MemoriesService, minio_client_1.MinioClientService],
        controllers: [memories_controller_1.MemoriesController],
        exports: [memories_service_1.MemoriesService, typeorm_1.TypeOrmModule]
    })
], MemoriesModule);
//# sourceMappingURL=memories.module.js.map