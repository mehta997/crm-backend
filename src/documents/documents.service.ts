import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentEntity, DocumentFile } from './schemas/document.schema';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(DocumentEntity.name) private readonly docModel: Model<DocumentFile>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async uploadAndSave(file: Express.Multer.File, userId: string): Promise<DocumentFile> {
    const bucket = this.firebaseService.getStorage();
    const blob = bucket.file(`${Date.now()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({ resumable: false });

    await new Promise((resolve, reject) => {
      blobStream.end(file.buffer);
      blobStream.on('finish', resolve);
      blobStream.on('error', reject);
    });

    const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    return this.docModel.create({
      filename: file.originalname,
      url,
      user: userId,
    });
  }

  async getUserDocuments(userId: string) {
    return this.docModel.find({ user: userId });
  }
}
