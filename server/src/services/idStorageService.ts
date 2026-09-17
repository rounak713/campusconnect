/**
 * Private storage for college ID card photos (Method B).
 *
 * Provider resolution order:
 *   1. S3_BUCKET            -> AWS S3 with private ACL, short-lived presigned GET URLs
 *   2. CLOUDINARY_CLOUD_NAME -> Cloudinary `authenticated` delivery type, signed URLs
 *   3. none                  -> local disk outside the repo (dev only), mode 0600
 *
 * Objects are never publicly readable: admins receive signed URLs minted on read.
 */
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

export type StorageProvider = 'S3' | 'CLOUDINARY' | 'LOCAL';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const SIGNED_URL_TTL_SECONDS = Number(process.env.ID_SIGNED_URL_TTL_SECONDS || 300);
const LOCAL_STORAGE_DIR =
  process.env.LOCAL_ID_STORAGE_DIR || path.join(os.homedir(), '.campusconnect', 'id-uploads');

export interface StoredObject {
  provider: StorageProvider;
  key: string;
}

export class IdStorageService {
  private static s3: S3Client | null = null;

  static getProvider(): StorageProvider {
    if (process.env.S3_BUCKET) return 'S3';
    if (process.env.CLOUDINARY_CLOUD_NAME) return 'CLOUDINARY';
    return 'LOCAL';
  }

  private static getS3(): S3Client {
    if (!this.s3) {
      this.s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' });
    }
    return this.s3;
  }

  private static configureCloudinary() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }

  private static extensionFor(mimeType: string): string {
    return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' } as const)[
      mimeType as 'image/jpeg'
    ] || 'bin';
  }

  static async upload(userId: string, buffer: Buffer, mimeType: string): Promise<StoredObject> {
    const provider = this.getProvider();
    const objectId = `${userId}/${crypto.randomUUID()}.${this.extensionFor(mimeType)}`;
    const key = `student-ids/${objectId}`;

    if (provider === 'S3') {
      await this.getS3().send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET as string,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'private',
          ServerSideEncryption: 'AES256'
        })
      );
      return { provider, key };
    }

    if (provider === 'CLOUDINARY') {
      this.configureCloudinary();
      const publicId = key.replace(/\.[^.]+$/, '');
      const uploaded = await new Promise<{ public_id: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { public_id: publicId, resource_type: 'image', type: 'authenticated', overwrite: false },
            (error, result) => (error || !result ? reject(error) : resolve(result))
          )
          .end(buffer);
      });
      return { provider, key: uploaded.public_id };
    }

    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
    await fs.writeFile(filePath, buffer, { mode: 0o600 });
    return { provider, key };
  }

  /** Mints a short-lived read URL for admin review. Never returns a permanent public link. */
  static async createSignedUrl(provider: string, key: string): Promise<string> {
    if (provider === 'S3') {
      return getSignedUrl(
        this.getS3(),
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET as string, Key: key }),
        { expiresIn: SIGNED_URL_TTL_SECONDS }
      );
    }

    if (provider === 'CLOUDINARY') {
      this.configureCloudinary();
      return cloudinary.url(key, {
        type: 'authenticated',
        sign_url: true,
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS
      });
    }

    return `file://${path.join(LOCAL_STORAGE_DIR, key)}`;
  }

  static getSignedUrlTtlSeconds(): number {
    return SIGNED_URL_TTL_SECONDS;
  }
}
