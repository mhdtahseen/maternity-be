import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioClientService implements OnModuleInit {
    private readonly configService;
    private readonly client;
    private readonly presignClient;
    private readonly medicalBucket;
    private readonly mediaBucket;
    private readonly region;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getPresignedPutUrl(bucket: string, objectKey: string, expirySeconds?: number): Promise<string>;
    getPresignedGetUrl(bucket: string, objectKey: string, expirySeconds?: number): Promise<string>;
    getObjectBuffer(bucket: string, objectKey: string): Promise<Buffer>;
    removeObject(bucket: string, objectKey: string): Promise<void>;
    getMedicalBucket(): string;
    getMediaBucket(): string;
    private ensureBucket;
    private streamToBuffer;
}
