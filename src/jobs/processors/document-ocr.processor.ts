import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { OcrAdapter } from '@/integrations/ocr/ocr.adapter';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import { MedicalDocument, MedicalPipelineStatus } from '@/modules/medical-documents/entities/medical-document.entity';

interface OcrJobData {
  documentId: string;
}

@Injectable()
@Processor(QUEUES.DOCUMENT_OCR)
export class DocumentOcrProcessor extends WorkerHost {
  constructor(
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    private readonly ocrAdapter: OcrAdapter,
    @InjectQueue(QUEUES.DOCUMENT_LLM)
    private readonly llmQueue: Queue
  ) {
    super();
  }

  async process(job: Job<OcrJobData>): Promise<void> {
    const { documentId } = job.data;

    const document = await this.documentRepository.findOne({ where: { id: documentId }, relations: ['file'] });
    if (!document) {
      throw new NotFoundException('Document not found during OCR stage');
    }

    try {
      const objectKey = document.file.normalizedObjectKey ?? document.file.objectKey;
      const ocrResult = await this.ocrAdapter.extractTextFromObject(document.file.bucket, objectKey);
      const ocrText = (ocrResult.text ?? '').trim();

      if (!ocrText) {
        throw new Error('OCR returned empty text');
      }

      document.ocrText = ocrText;
      document.pipelineStatus = MedicalPipelineStatus.OCR_DONE;
      document.structuredJson = {
        ...(document.structuredJson ?? {}),
        ocrMeta: {
          provider: ocrResult.provider,
          confidence: ocrResult.confidence,
          pages: ocrResult.pages,
          comparison: ocrResult.comparison ?? null
        }
      };

      await this.documentRepository.save(document);

      await this.llmQueue.add(
        JOB_NAMES.RUN_LLM_EXTRACTION,
        { documentId },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 4000 },
          removeOnComplete: true,
          removeOnFail: false,
          jobId: `${documentId}-llm`
        }
      );
    } catch (error) {
      document.pipelineStatus = MedicalPipelineStatus.FAILED;
      document.structuredJson = {
        ...(document.structuredJson ?? {}),
        ocrError: {
          at: new Date().toISOString(),
          message: error instanceof Error ? error.message : 'Unknown OCR error'
        }
      };
      await this.documentRepository.save(document);
      throw error;
    }
  }
}
