// src/documents/schemas/document.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'Document' })
export class Document {
  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  fileId: string; // GridFS file ID

  @Prop({ required: false })
  fileType?: string;

  @Prop({ required: false })
  documentType?: string; // e.g., 'aadhar', 'pan', etc.

  @Prop({ required: true, type: Types.ObjectId })
  gridFsId: Types.ObjectId;

  @Prop({ required: false })
  uploadedBy?: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: false, default: new Date(), type: 'Date' })
  updatedAt: Date;

  @Prop({ required: false, default: null, type: 'String' })
  updatedBy: string

}

export type DocumentDocument = Document & MongooseDocument;
export const DocumentSchema = SchemaFactory.createForClass(Document);

DocumentSchema.index({ uid: 1, type: 1 }, { unique: true });
