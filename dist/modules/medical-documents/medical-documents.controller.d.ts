import { AskMedicalDocumentQuestionDto, CreateMedicalDocumentDto, QueryMedicalDocumentsDto, ReprocessMedicalDocumentDto } from './dto/medical-document.dto';
import { MedicalDocumentsService } from './medical-documents.service';
export declare class MedicalDocumentsController {
    private readonly medicalDocumentsService;
    constructor(medicalDocumentsService: MedicalDocumentsService);
    create(user: {
        userId: string;
    }, dto: CreateMedicalDocumentDto): Promise<import("./entities/medical-document.entity").MedicalDocument>;
    findAll(query: QueryMedicalDocumentsDto): Promise<import("./entities/medical-document.entity").MedicalDocument[]>;
    findById(id: string, profileId: string): Promise<import("./entities/medical-document.entity").MedicalDocument>;
    getRawOcr(id: string, profileId: string): Promise<{
        ocrText: string | null;
    }>;
    getSummary(id: string, profileId: string): Promise<{
        summary: string | null;
    }>;
    askQuestion(id: string, dto: AskMedicalDocumentQuestionDto): Promise<{
        answer: string;
    }>;
    reprocess(id: string, dto: ReprocessMedicalDocumentDto): Promise<{
        status: string;
    }>;
    remove(id: string, profileId: string): Promise<{
        status: string;
    }>;
}
