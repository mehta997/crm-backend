// src/documents/gridfs.module.ts
import { Module } from '@nestjs/common';
import { GridFsService } from './gridfs.service';

@Module({
  providers: [GridFsService],
  exports: [GridFsService], // 👈 this is key!
})
export class GridFsModule {}
