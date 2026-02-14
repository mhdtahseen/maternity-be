"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const queue_module_1 = require("./queues/queue.module");
const file_object_entity_1 = require("../modules/files/entities/file-object.entity");
const medical_document_entity_1 = require("../modules/medical-documents/entities/medical-document.entity");
const medicine_entity_1 = require("../modules/medical-documents/entities/medicine.entity");
const medical_event_entity_1 = require("../modules/medical-documents/entities/medical-event.entity");
const timeline_event_entity_1 = require("../modules/timeline/entities/timeline-event.entity");
const document_normalize_processor_1 = require("./processors/document-normalize.processor");
const document_ocr_processor_1 = require("./processors/document-ocr.processor");
const document_llm_processor_1 = require("./processors/document-llm.processor");
const document_persist_processor_1 = require("./processors/document-persist.processor");
const timeline_build_processor_1 = require("./processors/timeline-build.processor");
const search_index_processor_1 = require("./processors/search-index.processor");
const ocr_adapter_1 = require("../integrations/ocr/ocr.adapter");
const openrouter_client_1 = require("../integrations/llm/openrouter.client");
const minio_client_1 = require("../integrations/storage/minio.client");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_object_entity_1.FileObject, medical_document_entity_1.MedicalDocument, medicine_entity_1.Medicine, medical_event_entity_1.MedicalEvent, timeline_event_entity_1.TimelineEvent]), queue_module_1.QueueModule],
        providers: [
            minio_client_1.MinioClientService,
            ocr_adapter_1.OcrAdapter,
            openrouter_client_1.OpenRouterClient,
            document_normalize_processor_1.DocumentNormalizeProcessor,
            document_ocr_processor_1.DocumentOcrProcessor,
            document_llm_processor_1.DocumentLlmProcessor,
            document_persist_processor_1.DocumentPersistProcessor,
            timeline_build_processor_1.TimelineBuildProcessor,
            search_index_processor_1.SearchIndexProcessor
        ],
        exports: [queue_module_1.QueueModule]
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map