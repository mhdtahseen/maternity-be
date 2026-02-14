import { CreateMemoryDto, CreateMemoryUploadIntentDto, QueryMemoriesDto } from './dto/memory.dto';
import { MemoriesService } from './memories.service';
export declare class MemoriesController {
    private readonly memoriesService;
    constructor(memoriesService: MemoriesService);
    createUploadIntent(user: {
        userId: string;
    }, dto: CreateMemoryUploadIntentDto): Promise<{
        objectKey: string;
        bucket: string;
        uploadUrl: string;
        mediaType: import("./entities/memory.entity").MemoryMediaType;
    }>;
    create(user: {
        userId: string;
    }, dto: CreateMemoryDto): Promise<import("./entities/memory.entity").Memory>;
    find(query: QueryMemoriesDto): Promise<import("./entities/memory.entity").Memory[]>;
}
