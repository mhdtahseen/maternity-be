import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue, Job } from 'bullmq';
import { Repository } from 'typeorm';
import { JOB_NAMES, QUEUES } from '@/common/constants/queues';
import { FileObject, FileObjectStatus } from '@/modules/files/entities/file-object.entity';
import { MedicalDocument } from '@/modules/medical-documents/entities/medical-document.entity';

interface NormalizeDocumentJobData {
  documentId: string;
  fileId: string;
  profileId: string;
}

@Injectable()
@Processor(QUEUES.DOCUMENT_NORMALIZE)
export class DocumentNormalizeProcessor extends WorkerHost {
  constructor(
    @InjectRepository(FileObject)
    private readonly fileRepository: Repository<FileObject>,
    @InjectRepository(MedicalDocument)
    private readonly documentRepository: Repository<MedicalDocument>,
    @InjectQueue(QUEUES.DOCUMENT_OCR)
    private readonly ocrQueue: Queue
  ) {
    super();
  }

  async process(job: Job<NormalizeDocumentJobData>): Promise<void> {
    const { documentId, fileId } = job.data;

    const [file, document] = await Promise.all([
      this.fileRepository.findOne({ where: { id: fileId } }),
      this.documentRepository.findOne({ where: { id: documentId }, relations: ['file'] })
    ]);

    if (!file || !document) {
      throw new NotFoundException('Document normalization payload is invalid');
    }

    // Placeholder normalization: convert HEIC/DOCX/PDF to canonical object in object storage.
    file.status = FileObjectStatus.NORMALIZED;
    file.normalizedObjectKey = file.normalizedObjectKey ?? file.objectKey;
    await this.fileRepository.save(file);

    await this.ocrQueue.add(
      JOB_NAMES.EXTRACT_OCR,
      { documentId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `${documentId}-ocr`
      }
    );
  }
}
