import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFsService {
  private readonly bucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.bucket = new GridFSBucket(this.connection.db, {
      bucketName: 'uploads',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ _id: ObjectId }> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket.openUploadStream(file.originalname, {
        contentType: file.mimetype,
      });

      uploadStream.end(file.buffer);

      uploadStream.on('finish', (result) => resolve({ _id: result._id }));
      uploadStream.on('error', (err) => reject(err));
    });
  }

  getFileStream(fileId: string): Readable {
    const _id = new ObjectId(fileId);
    return this.bucket.openDownloadStream(_id);
  }

  async listFiles(): Promise<any[]> {
    return this.bucket.find().toArray(); // returns a promise directly
  }

  async deleteFile(fileId: string): Promise<{ deleted: boolean }> {
    const _id = new ObjectId(fileId);
    await this.bucket.delete(_id);
    return { deleted: true };
  }
}
