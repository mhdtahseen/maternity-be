"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchIndexProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queues_1 = require("../../common/constants/queues");
let SearchIndexProcessor = class SearchIndexProcessor extends bullmq_1.WorkerHost {
    async process(job) {
        console.log('Search index job processed', job.data);
    }
};
exports.SearchIndexProcessor = SearchIndexProcessor;
exports.SearchIndexProcessor = SearchIndexProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bullmq_1.Processor)(queues_1.QUEUES.SEARCH_INDEX)
], SearchIndexProcessor);
//# sourceMappingURL=search-index.processor.js.map