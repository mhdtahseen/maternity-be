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
exports.TimelineBuildProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const queues_1 = require("../../common/constants/queues");
const timeline_event_entity_1 = require("../../modules/timeline/entities/timeline-event.entity");
let TimelineBuildProcessor = class TimelineBuildProcessor extends bullmq_1.WorkerHost {
    constructor(timelineRepository) {
        super();
        this.timelineRepository = timelineRepository;
    }
    async process(job) {
        const data = job.data;
        const timelineEvent = this.timelineRepository.create({
            profile: { id: data.profileId },
            sourceType: timeline_event_entity_1.TimelineSourceType[data.sourceType] ?? timeline_event_entity_1.TimelineSourceType.SYSTEM,
            sourceId: data.sourceId,
            title: data.title,
            description: data.description ?? data.title,
            occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
            tags: data.tags ?? []
        });
        await this.timelineRepository.save(timelineEvent);
    }
};
exports.TimelineBuildProcessor = TimelineBuildProcessor;
exports.TimelineBuildProcessor = TimelineBuildProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(queues_1.QUEUES.TIMELINE_BUILD),
    __param(0, (0, typeorm_1.InjectRepository)(timeline_event_entity_1.TimelineEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TimelineBuildProcessor);
//# sourceMappingURL=timeline-build.processor.js.map