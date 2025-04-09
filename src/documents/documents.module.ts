// src/documents/documents.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import {  DocumentSchema } from './schemas/document.schema';
import { GridFsModule } from './gridfs.module';
import { DocumentsController } from './documents.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([  { name: 'Document', schema: DocumentSchema },]),
    GridFsModule,
    FirebaseModule
  ],
  providers: [DocumentsService],
  exports: [DocumentsService],
  controllers: [DocumentsController]
})
export class DocumentsModule {}
