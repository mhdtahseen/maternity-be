import { ConfigService } from '@nestjs/config';
import { MinioClientService } from '@/integrations/storage/minio.client';
type OcrProvider = 'tesseract' | 'qwen_vision' | 'stub';
export interface OcrExtractionResult {
    text: string;
    confidence: number;
    pages: number;
    provider: OcrProvider;
    comparison?: {
        compareMode: boolean;
        selectedProvider: OcrProvider;
        primaryProvider: OcrProvider;
        primaryChars: number;
        primaryConfidence: number;
        backupProvider?: OcrProvider | null;
        backupChars?: number;
        backupConfidence?: number;
        usedFallback: boolean;
        primaryError?: string;
        backupError?: string;
        primaryPreview?: string;
        backupPreview?: string;
    };
}
export declare class OcrAdapter {
    private readonly configService;
    private readonly minioClient;
    constructor(configService: ConfigService, minioClient: MinioClientService);
    extractTextFromObject(bucket: string, objectKey: string): Promise<OcrExtractionResult>;
    private extractWithProvider;
    private extractWithTesseract;
    private extractWithQwenVision;
    private extractFromPdf;
    private extractFromImage;
    private parseTsvOutput;
    private resolveExtension;
    private getPdfPageCount;
    private extractPdfPageText;
    private isUsefulText;
    private normalizeText;
    private normalizeProvider;
    private convertPdfToImageDataUrls;
    private mimeTypeFromExtension;
    private toDataUrl;
    private extractMessageContentText;
    private previewText;
    private placeholderResult;
}
export {};
