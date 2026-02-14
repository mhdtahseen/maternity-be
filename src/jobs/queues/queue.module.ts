import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@/common/constants/queues';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUES.DOCUMENT_NORMALIZE },
      { name: QUEUES.DOCUMENT_OCR },
      { name: QUEUES.DOCUMENT_LLM },
      { name: QUEUES.DOCUMENT_PERSIST },
      { name: QUEUES.TIMELINE_BUILD },
      { name: QUEUES.SEARCH_INDEX },
      { name: QUEUES.MEDIA_TRANSCODE }
    )
  ],
  exports: [BullModule]
})
export class QueueModule {}
