"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const queues_1 = require("../../common/constants/queues");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: queues_1.QUEUES.DOCUMENT_NORMALIZE }, { name: queues_1.QUEUES.DOCUMENT_OCR }, { name: queues_1.QUEUES.DOCUMENT_LLM }, { name: queues_1.QUEUES.DOCUMENT_PERSIST }, { name: queues_1.QUEUES.TIMELINE_BUILD }, { name: queues_1.QUEUES.SEARCH_INDEX }, { name: queues_1.QUEUES.MEDIA_TRANSCODE })
        ],
        exports: [bullmq_1.BullModule]
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map