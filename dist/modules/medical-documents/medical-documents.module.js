"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalDocumentsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const typeorm_1 = require("@nestjs/typeorm");
const queues_1 = require("../../common/constants/queues");
const medical_document_entity_1 = require("./entities/medical-document.entity");
const medicine_entity_1 = require("./entities/medicine.entity");
const medical_event_entity_1 = require("./entities/medical-event.entity");
const file_object_entity_1 = require("../files/entities/file-object.entity");
const pregnancy_profile_entity_1 = require("../pregnancy-profiles/entities/pregnancy-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const medical_documents_service_1 = require("./medical-documents.service");
const medical_documents_controller_1 = require("./medical-documents.controller");
const minio_client_1 = require("../../integrations/storage/minio.client");
const openrouter_client_1 = require("../../integrations/llm/openrouter.client");
let MedicalDocumentsModule = class MedicalDocumentsModule {
};
exports.MedicalDocumentsModule = MedicalDocumentsModule;
exports.MedicalDocumentsModule = MedicalDocumentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([medical_document_entity_1.MedicalDocument, medicine_entity_1.Medicine, medical_event_entity_1.MedicalEvent, file_object_entity_1.FileObject, pregnancy_profile_entity_1.PregnancyProfile, user_entity_1.User]),
            bullmq_1.BullModule.registerQueue({ name: queues_1.QUEUES.DOCUMENT_NORMALIZE })
        ],
        providers: [medical_documents_service_1.MedicalDocumentsService, minio_client_1.MinioClientService, openrouter_client_1.OpenRouterClient],
        controllers: [medical_documents_controller_1.MedicalDocumentsController],
        exports: [medical_documents_service_1.MedicalDocumentsService, typeorm_1.TypeOrmModule]
    })
], MedicalDocumentsModule);
//# sourceMappingURL=medical-documents.module.js.map