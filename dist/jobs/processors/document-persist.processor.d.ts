import { WorkerHost } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { MedicalDocument, MedicalDocumentType } from '@/modules/medical-documents/entities/medical-document.entity';
import { Medicine } from '@/modules/medical-documents/entities/medicine.entity';
import { MedicalEvent } from '@/modules/medical-documents/entities/medical-event.entity';
interface PersistJobData {
    documentId: string;
    extraction: {
        authenticity: {
            score: number;
            reasons: string[];
            redFlags: string[];
        };
        classification: {
            documentType: keyof typeof MedicalDocumentType;
        };
        extracted: {
            doctor?: string;
            hospital?: string;
            documentDate?: string;
            pregnancyWeek?: number;
            medicines: Array<{
                name: string;
                dosage?: string;
                frequency?: string;
                reason?: string;
            }>;
        };
        explanation: string;
        humanSummary: string;
        tags: string[];
        timelineEvents: Array<{
            title: string;
            description: string;
            eventAt: string;
            tags: string[];
        }>;
    };
}
export declare class DocumentPersistProcessor extends WorkerHost {
    private readonly documentRepository;
    private readonly medicineRepository;
    private readonly medicalEventRepository;
    private readonly timelineQueue;
    private readonly searchQueue;
    constructor(documentRepository: Repository<MedicalDocument>, medicineRepository: Repository<Medicine>, medicalEventRepository: Repository<MedicalEvent>, timelineQueue: Queue, searchQueue: Queue);
    process(job: Job<PersistJobData>): Promise<void>;
    private buildDocumentTags;
    private inferSubtypeTag;
}
export {};
