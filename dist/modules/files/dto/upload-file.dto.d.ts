export declare class CreateUploadIntentDto {
    profileId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: string;
    checksumSha256: string;
}
export declare class CompleteUploadDto {
    profileId: string;
    originalName?: string;
}
