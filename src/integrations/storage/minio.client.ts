import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioClientService implements OnModuleInit {
  private readonly client: Client;
  private readonly presignClient: Client;
  private readonly medicalBucket: string;
  private readonly mediaBucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.getOrThrow<string>('storage.endpoint');
    const port = this.configService.getOrThrow<number>('storage.port');
    const useSSL = this.configService.getOrThrow<boolean>('storage.useSSL');
    const accessKey = this.configService.getOrThrow<string>('storage.accessKey');
    const secretKey = this.configService.getOrThrow<string>('storage.secretKey');
    const region = this.configService.getOrThrow<string>('storage.region');
    this.region = region;

    this.client = new Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
      region
    });

    this.presignClient = new Client({
      endPoint: this.configService.getOrThrow<string>('storage.publicEndpoint'),
      port: this.configService.getOrThrow<number>('storage.publicPort'),
      useSSL: this.configService.getOrThrow<boolean>('storage.publicUseSSL'),
      accessKey,
      secretKey,
      region
    });

    this.medicalBucket = this.configService.getOrThrow<string>('storage.bucketMedical');
    this.mediaBucket = this.configService.getOrThrow<string>('storage.bucketMedia');
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucket(this.medicalBucket);
    await this.ensureBucket(this.mediaBucket);
  }

  async getPresignedPutUrl(bucket: string, objectKey: string, expirySeconds = 900): Promise<string> {
    try {
      // Newer minio client types may expose a promise-style API or accept an options param.
      // Use a relaxed any cast to call the underlying implementation and return a string URL.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn: any = (this.presignClient as any).presignedPutObject.bind(this.presignClient);
      const url = await fn(bucket, objectKey, expirySeconds);
      return url as string;
    } catch (err) {
      throw err;
    }
  }

  async getPresignedGetUrl(bucket: string, objectKey: string, expirySeconds = 300): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fn: any = (this.presignClient as any).presignedGetObject.bind(this.presignClient);
      const url = await fn(bucket, objectKey, expirySeconds);
      return url as string;
    } catch (err) {
      throw err;
    }
  }

  async getObjectBuffer(bucket: string, objectKey: string): Promise<Buffer> {
    const stream = await this.client.getObject(bucket, objectKey);
    return this.streamToBuffer(stream);
  }

  async removeObject(bucket: string, objectKey: string): Promise<void> {
    await this.client.removeObject(bucket, objectKey);
  }

  getMedicalBucket(): string {
    return this.medicalBucket;
  }

  getMediaBucket(): string {
    return this.mediaBucket;
  }

  private async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName, this.region);
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
