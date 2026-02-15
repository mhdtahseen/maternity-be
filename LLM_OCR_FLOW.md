# LLM and OCR Flow Documentation

## Current Architecture

### 📋 Current Flow (Before Changes)

```
Medical Document Upload
        ↓
File Storage (MinIO)
        ↓
[DOCUMENT_OCR Queue]
        ↓
OCR Adapter
├─ Primary Provider (configured: tesseract, qwen_vision, or stub)
├─ Backup Provider (optional fallback)
└─ Compare Mode (optional: test both providers)
        ↓
OCR Text Extraction
        ↓
Store in: document.ocrText + document.structuredJson.ocrMeta
        ↓
[DOCUMENT_LLM Queue]
        ↓
OpenRouter Client (GPT via OpenRouter)
├─ Input: OCR extracted text
├─ Task: Medical document analysis
└─ Output: Structured JSON extraction
        ↓
Structured Output:
├─ Document authenticity (score + reasons)
├─ Document classification (type: PRESCRIPTION, LAB_REPORT, etc.)
├─ Extracted data (doctor, hospital, medicines, etc.)
├─ humanSummary (patient-friendly 4-8 sentences)
├─ tags (auto-generated)
└─ timelineEvents (extracted events with timestamps)
        ↓
[DOCUMENT_PERSIST Queue]
        ↓
Save to Database (MedicalDocument)
        ↓
Additional Processors (optional):
├─ Document Normalize
├─ Timeline Build
├─ Search Index
└─ Antivirus Scan
```

---

## Current Providers

### 1. **Tesseract OCR** (Traditional)

- **Type**: Local optical character recognition
- **Pros**: Free, works offline, handles PDFs natively
- **Cons**: Lower accuracy than vision models, struggles with handwriting
- **Config**: `OCR_PROVIDER=tesseract`

### 2. **Qwen Vision** (Current Vision Model)

- **Type**: Alibaba's Qwen Vision model via OpenRouter
- **Pros**: Better accuracy, handles complex layouts, understands medical content
- **Cons**: Requires API key, slower, costs money
- **Config**: `OCR_PROVIDER=qwen_vision`
- **Details**:
  - Model: `qwen/qwen3-vl-235b-a22b-thinking`
  - Max pages: 2 (configurable 1-6)
  - Timeout: 45s (configurable 5s-120s)

### 3. **Stub** (Placeholder)

- **Type**: No-op for testing
- **Config**: `OCR_PROVIDER=stub`

---

## LLM Analysis Pipeline

### OpenRouter Client

- **API**: OpenRouter (multi-model LLM API)
- **Default Model**: `openai/gpt-oss-120b` (or GPT-4o)
- **Task**: Medical document analysis & extraction
- **Input**: OCR text
- **Output**: Structured JSON with:
  - Medical data extraction
  - Authenticity verification
  - Document classification
  - Patient-friendly summaries
  - Timeline events

---

## Configuration Environment Variables

```env
# OCR Configuration
OCR_PROVIDER=qwen_vision                           # Primary OCR provider
OCR_BACKUP_PROVIDER=tesseract                      # Fallback OCR provider (optional)
OCR_COMPARE_MODE=false                             # Test both providers (debug mode)
OCR_QWEN_MAX_PAGES=2                               # Max pages for Qwen (1-6)
OCR_QWEN_TIMEOUT_MS=45000                          # Timeout in milliseconds

# Vision Model (Qwen Vision)
OPENROUTER_QWEN_API_KEY=sk-...                     # Qwen API key (or uses OPENROUTER_API_KEY)
QWEN_VISION_MODEL=qwen/qwen3-vl-235b-a22b-thinking # Qwen model

# LLM / GPT Configuration
OPENROUTER_API_KEY=sk-...                          # OpenRouter API key
OPENROUTER_MODEL=openai/gpt-oss-120b               # LLM model for analysis
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1  # OpenRouter endpoint
OPENROUTER_HTTP_REFERER=                           # Optional: your app URL
OPENROUTER_X_TITLE=Maternity Journal               # Optional: app name

# For OpenRouter API compatibility
OPENROUTER_HTTP_REFERER=https://maternityjournal.com
OPENROUTER_X_TITLE=Maternity Journal
```

---

## Current Job Pipeline

1. **DocumentOcrProcessor** - Extracts text from images/PDFs
2. **DocumentLlmProcessor** - Analyzes extracted text with GPT
3. **DocumentPersistProcessor** - Saves results to database
4. **DocumentNormalizeProcessor** - Cleans and normalizes data
5. **TimelineBuildProcessor** - Creates timeline events
6. **SearchIndexProcessor** - Indexes for search
7. **DocumentAntivisrusProcessor** - Scans files

---

## Files Involved

- **OCR Integration**: [src/integrations/ocr/ocr.adapter.ts](src/integrations/ocr/ocr.adapter.ts)
- **LLM Integration**: [src/integrations/llm/openrouter.client.ts](src/integrations/llm/openrouter.client.ts)
- **OCR Processor**: [src/jobs/processors/document-ocr.processor.ts](src/jobs/processors/document-ocr.processor.ts)
- **LLM Processor**: [src/jobs/processors/document-llm.processor.ts](src/jobs/processors/document-llm.processor.ts)
- **AI Config**: [src/config/ai.config.ts](src/config/ai.config.ts)

---

## Recommended Changes for Vision + GPT Flow

### Option 1: Use Claude Vision + GPT (Recommended)

```
Medical Document
    ↓
Claude Vision API (for OCR)  ← Better accuracy than Qwen
    ↓
GPT-4o (for summarization)   ← Current LLM flow
    ↓
Database
```

### Option 2: Use Qwen Vision + GPT (Current Setup)

```
Medical Document
    ↓
Qwen Vision API (for OCR)
    ↓
GPT (for summarization)
    ↓
Database
```

### Implementation Changes Required:

1. ✅ Set `OCR_PROVIDER=qwen_vision` (or add Claude Vision support)
2. ✅ Configure `OPENROUTER_MODEL` to GPT model (e.g., `openai/gpt-4o`)
3. ✅ Keep LLM pipeline as-is (already handles summarization)
4. ⚠️ Optional: Add Claude Vision adapter for better accuracy

---

## Error Handling & Fallback

- **OCR Fails**: Falls back to backup provider or marks document for review
- **LLM Fails**: Infers document type from OCR text, creates fallback tags, marks for review
- **Both Fail**: Document stored with error metadata for manual review
