import { FilesService } from './files.service';
import { CompleteUploadDto, CreateUploadIntentDto } from './dto/upload-file.dto';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    createUploadIntent(user: {
        userId: string;
    }, dto: CreateUploadIntentDto): Promise<{
        fileId: string;
        objectKey: string;
        uploadUrl: string;
    }>;
    completeUpload(fileId: string, user: {
        userId: string;
    }, dto: CompleteUploadDto): Promise<{
        documentId: string;
        pipelineStatus: import("../medical-documents/entities/medical-document.entity").MedicalPipelineStatus;
    }>;
    getDownloadUrl(fileId: string, user: {
        userId: string;
    }): Promise<{
        downloadUrl: string;
    }>;
}
