import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { OpenRouterClient } from '@/integrations/llm/openrouter.client';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import {
  MedicalDocument,
  MedicalDocumentType,
  MedicalPipelineStatus
} from '@/modules/medical-documents/entities/medical-document.entity';

interface LlmJobData {
  documentId: string;
}

@Injectable()
@Processor(QUEUES.DOCUMENT_LLM)
export class DocumentLlmProcessor extends WorkerHost {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    private readonly openRouterClient: OpenRouterClient,
    @InjectQueue(QUEUES.DOCUMENT_PERSIST)
    private readonly persistQueue: Queue
  ) {
    super();
  }

  async process(job: Job<LlmJobData>): Promise<void> {
    const { documentId } = job.data;

    const document = await this.documentRepository.findOne({ where: { id: documentId }, relations: ['file'] });
    if (!document || !document.ocrText) {
      throw new NotFoundException('Document or OCR text missing for LLM stage');
    }

    try {
      const extraction = await this.openRouterClient.analyzeMedicalText(document.ocrText);

      await this.persistQueue.add(
        JOB_NAMES.PERSIST_MEDICAL_ANALYSIS,
        { documentId, extraction },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 4000 },
          removeOnComplete: true,
          removeOnFail: false,
          jobId: `${documentId}-persist`
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown LLM stage failure';
      const combinedText = `${document.file?.originalName ?? ''} ${document.ocrText}`;

      document.documentType = document.documentType ?? this.inferDocumentType(combinedText);
      document.summary =
        document.summary ??
        `AI extraction failed. Basic OCR captured and marked for review. (${errorMessage.slice(0, 120)})`;
      document.tags = this.buildFallbackTags(document.documentType, combinedText);
      document.pipelineStatus = MedicalPipelineStatus.REVIEW_REQUIRED;
      document.structuredJson = {
        ...(document.structuredJson ?? {}),
        llmError: {
          at: new Date().toISOString(),
          message: errorMessage
        }
      };

      await this.documentRepository.save(document);
    }
  }

  private inferDocumentType(text: string): MedicalDocumentType {
    const normalized = text.toLowerCase();
    if (/ultrasound|sonography|anomaly\s*scan|nt\s*scan/.test(normalized)) {
      return MedicalDocumentType.ULTRASOUND;
    }
    if (/\bmri\b|magnetic resonance/.test(normalized)) {
      return MedicalDocumentType.MRI;
    }
    if (/\bscan\b|ct\b|x[- ]?ray/.test(normalized)) {
      return MedicalDocumentType.SCAN;
    }
    if (/prescription|\brx\b|dosage|tablet|capsule/.test(normalized)) {
      return MedicalDocumentType.PRESCRIPTION;
    }
    if (/lab|blood|cbc|hemoglobin|test report/.test(normalized)) {
      return MedicalDocumentType.LAB_REPORT;
    }
    if (/invoice|bill|amount due|payment/.test(normalized)) {
      return MedicalDocumentType.BILL;
    }
    return MedicalDocumentType.OTHER;
  }

  private buildFallbackTags(documentType: MedicalDocumentType, sourceText: string): string[] {
    const subtype = this.inferSubtypeTag(documentType, sourceText);
    return subtype ? [documentType, subtype] : [documentType];
  }

  private inferSubtypeTag(documentType: MedicalDocumentType, sourceText: string): string | null {
    const text = sourceText.toLowerCase();
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
