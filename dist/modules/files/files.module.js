"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const queues_1 = require("../../common/constants/queues");
const file_object_entity_1 = require("./entities/file-object.entity");
const files_service_1 = require("./files.service");
const files_controller_1 = require("./files.controller");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const medical_document_entity_1 = require("../medical-documents/entities/medical-document.entity");
const minio_client_1 = require("../../integrations/storage/minio.client");
const clamav_adapter_1 = require("../../integrations/antivirus/clamav.adapter");
let FilesModule = class FilesModule {
};
exports.FilesModule = FilesModule;
exports.FilesModule = FilesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([file_object_entity_1.FileObject, pregnancy_profile_entity_1.PregnancyProfile, user_entity_1.User, medical_document_entity_1.MedicalDocument]),
            bullmq_1.BullModule.registerQueue({ name: queues_1.QUEUES.DOCUMENT_NORMALIZE })
        ],
        providers: [files_service_1.FilesService, minio_client_1.MinioClientService, clamav_adapter_1.ClamavAdapter],
        controllers: [files_controller_1.FilesController],
        exports: [files_service_1.FilesService, typeorm_1.TypeOrmModule]
    })
], FilesModule);
//# sourceMappingURL=files.module.js.map