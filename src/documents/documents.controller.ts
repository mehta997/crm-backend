import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { FirebaseAuthGuard } from '../common/firebase-auth.guard';
import { GridFsService } from './gridfs.service';
import { multerConfig } from 'src/common/multer.config';
import { Response } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly gridFsService: GridFsService,
  ) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get documents uploaded for a specific user' })
  @ApiParam({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: 'List of documents for the user' })
  async getUserDocs(@Param('userId') userId: string) {
    return this.documentsService.getUserDocuments(userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async upload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.gridFsService.uploadFile(file);
    return { message: 'Uploaded successfully', fileId: result._id };
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a file by file ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'File stream returned' })
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const stream = this.gridFsService.getFileStream(id);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${id}"`,
    });

    stream.pipe(res);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all uploaded files' })
  @ApiResponse({ status: 200, description: 'Array of files' })
  async listFiles() {
    const files = await this.gridFsService.listFiles();
    return { files };
  }
}
