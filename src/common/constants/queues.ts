export const QUEUES = {
  DOCUMENT_NORMALIZE: 'document.normalize.queue',
  DOCUMENT_OCR: 'document.ocr.queue',
  DOCUMENT_LLM: 'document.llm.queue',
  DOCUMENT_PERSIST: 'document.persist.queue',
  TIMELINE_BUILD: 'timeline.build.queue',
  SEARCH_INDEX: 'search.index.queue',
  MEDIA_TRANSCODE: 'media.transcode.queue'
} as const;

export const JOB_NAMES = {
  NORMALIZE_DOCUMENT: 'normalize-document',
  EXTRACT_OCR: 'extract-ocr',
  RUN_LLM_EXTRACTION: 'run-llm-extraction',
  PERSIST_MEDICAL_ANALYSIS: 'persist-medical-analysis',
  BUILD_TIMELINE_EVENT: 'build-timeline-event',
  INDEX_SEARCH: 'index-search'
} as const;
