export declare const QUEUES: {
    readonly DOCUMENT_NORMALIZE: "document.normalize.queue";
    readonly DOCUMENT_OCR: "document.ocr.queue";
    readonly DOCUMENT_LLM: "document.llm.queue";
    readonly DOCUMENT_PERSIST: "document.persist.queue";
    readonly TIMELINE_BUILD: "timeline.build.queue";
    readonly SEARCH_INDEX: "search.index.queue";
    readonly MEDIA_TRANSCODE: "media.transcode.queue";
};
export declare const JOB_NAMES: {
    readonly NORMALIZE_DOCUMENT: "normalize-document";
    readonly EXTRACT_OCR: "extract-ocr";
    readonly RUN_LLM_EXTRACTION: "run-llm-extraction";
    readonly PERSIST_MEDICAL_ANALYSIS: "persist-medical-analysis";
    readonly BUILD_TIMELINE_EVENT: "build-timeline-event";
    readonly INDEX_SEARCH: "index-search";
};
