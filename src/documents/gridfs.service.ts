import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection, Types } from 'mongoose';
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

  async uploadFile(file: Express.Multer.File, meta: any): Promise<{ _id: ObjectId }> {
    return new Promise((resolve, reject) => {
      const writeStream = this.bucket.openUploadStream(file.originalname, {
        metadata: meta,
        contentType: file.mimetype,
      });
  
      writeStream.end(file.buffer);
  
      writeStream.on('finish', () => {
        console.log('File uploaded with ID:', writeStream.id);
        resolve({ _id: writeStream.id });
      });
  
      writeStream.on('error', (err) => {
        reject(err);
      });
    });
  }
  

  getFileStream(fileId: string): Readable {
    const _id = new ObjectId(fileId);
    return this.bucket.openDownloadStream(_id);
  }

  async findFileById(id: string): Promise<any> {
    const files = await this.bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    return files[0];
  }

  async listFiles(): Promise<any[]> {
    return this.bucket.find().toArray(); // returns a promise directly
  }

  async listFilesFiltered(filters: {
    userId?: string;
    mimeType?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const query: any = {};

    if (filters.userId) {
      query['metadata.userId'] = filters.userId;
    }

    if (filters.mimeType) {
      query['metadata.mimeType'] = filters.mimeType;
    }

    if (filters.fromDate || filters.toDate) {
      query.uploadDate = {};
      if (filters.fromDate) {
        query.uploadDate.$gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        query.uploadDate.$lte = new Date(filters.toDate);
      }
    }

    const files = await this.bucket.find(query).toArray();
    return files;
  }

  async deleteFile(fileId: string): Promise<void> {
    const objectId = new Types.ObjectId(fileId);
    await this.bucket.delete(objectId);
  }

  // Add this method
  async filterFiles(query: {
    userId?: string;
    docType?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { userId, docType, fromDate, toDate, page = 1, limit = 10 } = query;

    const filter: any = {};
    if (userId) filter['metadata.userId'] = userId;
    if (docType) filter['metadata.docType'] = docType;
    if (fromDate || toDate) {
      filter['metadata.uploadedAt'] = {};
      if (fromDate) filter['metadata.uploadedAt'].$gte = new Date(fromDate);
      if (toDate) filter['metadata.uploadedAt'].$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const files = await this.bucket.find(filter).skip(skip).limit(limit).toArray();

    return files.map((file) => ({
      id: file._id,
      filename: file.filename,
      uploadedAt: file.metadata.uploadedAt,
      docType: file.metadata.docType,
      mimeType: file.metadata.mimeType,
      userId: file.metadata.userId,
    }));
  }

}
