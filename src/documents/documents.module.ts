import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentEntity, DocumentSchema } from './schemas/document.schema';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersModule } from '../users/users.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { GridFsModule } from './gridfs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocumentEntity.name, schema: DocumentSchema }]),
    UsersModule,
    GridFsModule,     // 👈 import the GridFsModule
    FirebaseModule,   // 👈 import if using FirebaseAuthGuard
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, FirebaseService],
})
export class DocumentsModule {}
