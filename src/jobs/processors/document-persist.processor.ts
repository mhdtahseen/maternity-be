import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import {
  MedicalDocument,
  MedicalDocumentType,
  MedicalPipelineStatus
} from '@/modules/medical-documents/entities/medical-document.entity';
import { Medicine } from '@/modules/medical-documents/entities/medicine.entity';
import { MedicalEvent } from '@/modules/medical-documents/entities/medical-event.entity';

interface PersistJobData {
  documentId: string;
  extraction: {
    authenticity: { score: number; reasons: string[]; redFlags: string[] };
    classification: { documentType: keyof typeof MedicalDocumentType };
    extracted: {
      doctor?: string;
      hospital?: string;
      documentDate?: string;
      pregnancyWeek?: number;
      medicines: Array<{ name: string; dosage?: string; frequency?: string; reason?: string }>;
    };
    explanation: string;
    humanSummary: string;
    tags: string[];
    timelineEvents: Array<{ title: string; description: string; eventAt: string; tags: string[] }>;
  };
}

@Injectable()
@Processor(QUEUES.DOCUMENT_PERSIST)
export class DocumentPersistProcessor extends WorkerHost {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    @InjectRepository(Medicine)
    private readonly medicineRepository: Repository<Medicine>,
    @InjectRepository(MedicalEvent)
    private readonly medicalEventRepository: Repository<MedicalEvent>,
    @InjectQueue(QUEUES.TIMELINE_BUILD)
    private readonly timelineQueue: Queue,
    @InjectQueue(QUEUES.SEARCH_INDEX)
    private readonly searchQueue: Queue
  ) {
    super();
  }

  async process(job: Job<PersistJobData>): Promise<void> {
    const { documentId, extraction } = job.data;

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['profile', 'medicines']
    });

    if (!document) {
      throw new NotFoundException('Document not found during persist stage');
    }

    const pregnancyWeek = extraction.extracted.pregnancyWeek;
    const normalizedPregnancyWeek =
      typeof pregnancyWeek === 'number' && Number.isFinite(pregnancyWeek)
        ? Math.max(1, Math.min(45, Math.floor(pregnancyWeek)))
        : null;

    document.documentType = MedicalDocumentType[extraction.classification.documentType] ?? MedicalDocumentType.OTHER;
    document.authenticityScore = extraction.authenticity.score;
    document.authenticityFlagged = extraction.authenticity.redFlags.length > 0;
    document.doctorName = extraction.extracted.doctor ?? null;
    document.hospitalName = extraction.extracted.hospital ?? null;
    document.documentDate = extraction.extracted.documentDate ?? null;
    document.pregnancyWeek = normalizedPregnancyWeek;
    document.summary = extraction.humanSummary;
    document.tags = this.buildDocumentTags(document.documentType, document.ocrText, extraction.tags);
    document.structuredJson = {
      ...(document.structuredJson ?? {}),
      extraction
    };
    document.pipelineStatus = document.authenticityFlagged
      ? MedicalPipelineStatus.REVIEW_REQUIRED
      : MedicalPipelineStatus.LLM_DONE;

    await this.documentRepository.save(document);

    if (document.medicines.length > 0) {
      await this.medicineRepository.delete({ document: { id: document.id } });
    }

    if (extraction.extracted.medicines.length > 0) {
      const medicines = extraction.extracted.medicines.map((item) =>
        this.medicineRepository.create({
          document,
          name: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          reason: item.reason
        })
      );

      await this.medicineRepository.save(medicines);
    }

    if (extraction.timelineEvents.length > 0) {
      const events = extraction.timelineEvents.map((event) =>
        this.medicalEventRepository.create({
          profile: document.profile,
          sourceDocument: document,
          title: event.title,
          description: event.description,
          eventAt: new Date(event.eventAt),
          tags: event.tags
        })
      );

      await this.medicalEventRepository.save(events);
    }

    await this.timelineQueue.add(
      JOB_NAMES.BUILD_TIMELINE_EVENT,
      {
        sourceType: 'MEDICAL_DOCUMENT',
        sourceId: document.id,
        profileId: document.profile.id,
        title: `Medical document analyzed: ${document.documentType}`,
        description: extraction.humanSummary,
        occurredAt: extraction.extracted.documentDate ?? new Date().toISOString(),
        tags: document.tags
      },
      { removeOnComplete: true, removeOnFail: false, jobId: `${document.id}-timeline-medical` }
    );

    await this.searchQueue.add(
      JOB_NAMES.INDEX_SEARCH,
      {
        entityType: 'MEDICAL_DOCUMENT',
        entityId: document.id,
        profileId: document.profile.id
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `${document.id}-search`
      }
    );
  }

  private buildDocumentTags(
    documentType: MedicalDocumentType,
    ocrText: string | null | undefined,
    llmTags: string[] | undefined
  ): string[] {
    const primary = documentType;
    const subtype = this.inferSubtypeTag(documentType, `${ocrText ?? ''} ${(llmTags ?? []).join(' ')}`);

    return subtype ? [primary, subtype] : [primary];
  }

  private inferSubtypeTag(documentType: MedicalDocumentType, source: string): string | null {
    const text = source.toLowerCase();
    const patterns =
      documentType === MedicalDocumentType.ULTRASOUND
        ? [
            { regex: /\bnt\b|nuchal translucency/, label: 'NT Scan' },
            { regex: /\banomaly\b/, label: 'Anomaly Scan' },
            { regex: /\bmorphology\b|\blevel\s*ii\b|\btiffa\b/, label: 'Morphology Scan' },
            { regex: /\bgrowth\b/, label: 'Growth Scan' },
            { regex: /\bdating\b/, label: 'Dating Scan' },
            { regex: /\bviability\b/, label: 'Viability Scan' }
          ]
        : documentType === MedicalDocumentType.LAB_REPORT
          ? [
              { regex: /\bcbc\b|complete blood count/, label: 'CBC' },
              { regex: /\bthyroid\b|\btsh\b|\bt3\b|\bt4\b/, label: 'Thyroid Profile' },
              { regex: /\bglucose\b|\bogtt\b|oral glucose tolerance/, label: 'Glucose Test' },
              { regex: /\burine\b/, label: 'Urine Test' }
            ]
          : documentType === MedicalDocumentType.SCAN
            ? [
                { regex: /\bct\b/, label: 'CT Scan' },
                { regex: /\bx[- ]?ray\b/, label: 'X-Ray' }
              ]
            : documentType === MedicalDocumentType.MRI
              ? [{ regex: /\bmri\b|magnetic resonance/, label: 'MRI' }]
              : [];

    for (const pattern of patterns) {
      if (pattern.regex.test(text)) {
        return pattern.label;
      }
    }

    return null;
  }
}
