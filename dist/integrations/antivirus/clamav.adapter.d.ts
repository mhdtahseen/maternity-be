export declare class ClamavAdapter {
    scanObject(_bucket: string, _objectKey: string): Promise<{
        clean: boolean;
        signature?: string;
    }>;
}
