import { MedicalDocumentType } from '../entities/medical-document.entity';
export declare class CreateMedicalDocumentDto {
    profileId: string;
    fileId: string;
}
export declare class ReprocessMedicalDocumentDto {
    profileId: string;
}
export declare class AskMedicalDocumentQuestionDto {
    profileId: string;
    question: string;
}
export declare class QueryMedicalDocumentsDto {
    profileId: string;
    type?: MedicalDocumentType;
    q?: string;
    tag?: string;
    from?: string;
    to?: string;
}
