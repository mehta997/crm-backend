import { GridFsStorage } from 'multer-gridfs-storage';
import * as multer from 'multer';
import * as dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI;

export const storage = new GridFsStorage({
  url: mongoURI,
  file: (req: any, file: Express.Multer.File) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: 'documents', // GridFS bucket name
      metadata: {
        uploadedBy: req.user?.uid || 'system',
      },
    };
  },
});

export const upload = multer({ storage });
