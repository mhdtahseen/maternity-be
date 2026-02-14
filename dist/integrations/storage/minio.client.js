"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioClientService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const minio_1 = require("minio");
let MinioClientService = class MinioClientService {
    constructor(configService) {
        this.configService = configService;
        const endpoint = this.configService.getOrThrow('storage.endpoint');
        const port = this.configService.getOrThrow('storage.port');
        const useSSL = this.configService.getOrThrow('storage.useSSL');
        const accessKey = this.configService.getOrThrow('storage.accessKey');
        const secretKey = this.configService.getOrThrow('storage.secretKey');
        const region = this.configService.getOrThrow('storage.region');
        this.region = region;
        this.client = new minio_1.Client({
            endPoint: endpoint,
            port,
            useSSL,
            accessKey,
            secretKey,
            region
        });
        this.presignClient = new minio_1.Client({
            endPoint: this.configService.getOrThrow('storage.publicEndpoint'),
            port: this.configService.getOrThrow('storage.publicPort'),
            useSSL: this.configService.getOrThrow('storage.publicUseSSL'),
            accessKey,
            secretKey,
            region
        });
        this.medicalBucket = this.configService.getOrThrow('storage.bucketMedical');
        this.mediaBucket = this.configService.getOrThrow('storage.bucketMedia');
    }
    async onModuleInit() {
        await this.ensureBucket(this.medicalBucket);
        await this.ensureBucket(this.mediaBucket);
    }
    async getPresignedPutUrl(bucket, objectKey, expirySeconds = 900) {
        try {
            const fn = this.presignClient.presignedPutObject.bind(this.presignClient);
            const url = await fn(bucket, objectKey, expirySeconds);
            return url;
        }
        catch (err) {
            throw err;
        }
    }
    async getPresignedGetUrl(bucket, objectKey, expirySeconds = 300) {
        try {
            const fn = this.presignClient.presignedGetObject.bind(this.presignClient);
            const url = await fn(bucket, objectKey, expirySeconds);
            return url;
        }
        catch (err) {
            throw err;
        }
    }
    async getObjectBuffer(bucket, objectKey) {
        const stream = await this.client.getObject(bucket, objectKey);
        return this.streamToBuffer(stream);
    }
    async removeObject(bucket, objectKey) {
        await this.client.removeObject(bucket, objectKey);
    }
    getMedicalBucket() {
        return this.medicalBucket;
    }
    getMediaBucket() {
        return this.mediaBucket;
    }
    async ensureBucket(bucketName) {
        const exists = await this.client.bucketExists(bucketName);
        if (!exists) {
            await this.client.makeBucket(bucketName, this.region);
        }
    }
    async streamToBuffer(stream) {
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
};
exports.MinioClientService = MinioClientService;
exports.MinioClientService = MinioClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MinioClientService);
//# sourceMappingURL=minio.client.js.map