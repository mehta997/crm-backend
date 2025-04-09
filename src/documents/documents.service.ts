// src/documents/documents.service.ts

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './schemas/document.schema';
import { GridFsService } from './gridfs.service';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name)
    private readonly documentModel: Model<DocumentDocument>,
    private readonly gridFsService: GridFsService,
  ) { }

  async uploadDocument(
    file: Express.Multer.File,
    userId: string,
    type: string,
  ): Promise<any> {
    // 1. Check if the user already uploaded a document of the same type
    const existingDoc = await this.documentModel.findOne({ uid: userId, type });
    if (existingDoc) {
      throw new BadRequestException(`Document of type "${type}" already exists for this user`);
    }

    // 2. Upload the file to GridFS
    const uploadResult = await this.gridFsService.uploadFile(file, {
      uploadedBy: userId,
      type,
    }) as any;

    // 3. Save document metadata in MongoDB
    const doc = await this.documentModel.create({
      uid: userId,
      type,
      originalName: file.originalname,
      mimeType: file.mimetype,
      gridFsId: uploadResult._id,
      fileId: uploadResult._id,
      filename: file.fieldname
    });

    return doc;
  }

  async filterDocuments(
    userId?: string,
    type?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Document[]> {
    const filter: any = {};

    if (userId) filter.uid = userId;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    return this.documentModel.find(filter).exec();
  }

  async getUserDocuments(uid: string) {
    return this.documentModel.find({ uid }).lean();
  }

  async deleteDocument(documentId: string, user: User) {
    const doc = await this.documentModel.findById(documentId);
    if (!doc) throw new NotFoundException('Document not found');
    // Only allow if admin/super-admin/staff
    if (!['admin', 'super-admin', 'staff'].includes(user.role)) {
      throw new ForbiddenException('You are not allowed to delete documents');
    }

    // Delete file from GridFS
    if (doc.gridFsId) {
      await this.gridFsService.deleteFile(doc.gridFsId.toString());
    }

    await this.documentModel.deleteOne({ _id: documentId });

    return { message: 'Document deleted successfully' }
  }


  async downloadDocument(documentId: string) {
    const document = await this.documentModel.findById(documentId);
    if (!document) throw new NotFoundException('Document not found');

    const stream = this.gridFsService.getFileStream(document.gridFsId.toString());
    return { stream, filename: document.filename };
  }

  async listDocuments(uid?: string) {
    if (uid) {
      return this.documentModel.find({ uid }).lean();
    }
    return this.documentModel.find().lean();
  }

  async getDocumentById(documentId: string) {
    return this.documentModel.findById(documentId).lean();
  }

  async updateDocumentFile(
    documentId: string,
    file: Express.Multer.File,
    user: { uid: string; role: string },
  ): Promise<Document> {
    const doc = await this.documentModel.findById(documentId);

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Only owner or admin/staff can update
    const isOwner = doc.uid === user.uid;
    const isPrivileged = ['admin', 'super-admin', 'staff'].includes(user.role);

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('Not allowed to update this document');
    }

    // Delete old GridFS file
    await this.gridFsService.deleteFile(doc.gridFsId.toString());

    // Upload new file
    const meta = { updatedBy: user.uid, userId: doc.uid };
    const newFile = await this.gridFsService.uploadFile(file, meta);

    // Update document record
    doc.gridFsId = newFile._id;
    doc.originalName = file.originalname;
    doc.updatedAt = new Date();
    doc.updatedBy = user.uid;

    return await doc.save();
  }


}
