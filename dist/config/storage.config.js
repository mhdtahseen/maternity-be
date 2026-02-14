"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('storage', () => ({
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    publicEndpoint: process.env.MINIO_PUBLIC_ENDPOINT ?? process.env.MINIO_ENDPOINT ?? 'localhost',
    publicPort: Number(process.env.MINIO_PUBLIC_PORT ?? process.env.MINIO_PORT ?? 9000),
    publicUseSSL: process.env.MINIO_PUBLIC_USE_SSL
        ? process.env.MINIO_PUBLIC_USE_SSL === 'true'
        : process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    region: process.env.MINIO_REGION ?? 'us-east-1',
    bucketMedical: process.env.MINIO_BUCKET_MEDICAL ?? 'medical-documents',
    bucketMedia: process.env.MINIO_BUCKET_MEDIA ?? 'journal-media'
}));
//# sourceMappingURL=storage.config.js.map