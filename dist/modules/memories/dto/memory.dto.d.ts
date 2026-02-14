import { MemoryMediaType } from '../entities/memory.entity';
export declare class MemoryMediaRefDto {
    objectKey: string;
    bucket: string;
    fileName: string;
    mimeType: string;
    mediaType: MemoryMediaType;
}
export declare class CreateMemoryUploadIntentDto {
    profileId: string;
    fileName: string;
    mimeType: string;
}
export declare class CreateMemoryDto {
    profileId: string;
    title: string;
    description: string;
    memoryAt: string;
    tags?: string[];
    mediaRefs?: MemoryMediaRefDto[];
}
export declare class QueryMemoriesDto {
    profileId: string;
    from?: string;
    to?: string;
}
