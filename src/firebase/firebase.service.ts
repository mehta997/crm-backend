import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  private readonly firebaseApp: admin.app.App;

  constructor() {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  async verifyToken(idToken: string) {
    return await admin.auth().verifyIdToken(idToken);
  }

  getStorage() {
    return admin.storage().bucket();
  }
}

