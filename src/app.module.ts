import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { DocumentsModule } from './documents/documents.module';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseModule } from './firebase/firebase.module';
import { SuperAdminSeeder } from './seeders/seed';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UsersModule,
    RolesModule,
    DocumentsModule,
  ],
  providers: [FirebaseService, SuperAdminSeeder],
  exports: []
})
export class AppModule {}
