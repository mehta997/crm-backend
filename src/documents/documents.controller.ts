import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Get,
  Res,
  Query,
  Body,
  Req,
  ForbiddenException,
  Delete,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
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
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleType } from 'src/roles/role.enum';

@ApiTags('Documents')
@ApiBearerAuth('access-token')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly gridFsService: GridFsService,
  ) { }

  @Get(':userId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.STAFF, RoleType.USER)
  @ApiOperation({ summary: 'Get documents uploaded for a specific user' })
  @ApiParam({ name: 'userId', required: true })
  @ApiResponse({ status: 200, description: 'List of documents for the user' })
  async getUserDocs(@Param('userId') userId: string) {
    return this.documentsService.getUserDocuments(userId);
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a file by Document ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'File stream returned' })
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const document = await this.documentsService.getDocumentById(id);
    if (!document) {
      res.status(404).send('Document not found');
      return;
    }

    const stream = this.gridFsService.getFileStream(document.gridFsId.toString());

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
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

  @Post('upload/:userId/:type')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a document file for a user with type' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'userId', required: true })
  @ApiParam({ name: 'type', required: true, description: 'Document type like pan, aadhar' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
        documentType: {
          type: 'string',
        },
      },
      required: ['file', 'userId', 'documentType'],
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFileForUser(
    @UploadedFile() file: Express.Multer.File,
    @Param('userId') userId: string,
    @Param('type') type: string,
  ) {
    const result = await this.documentsService.uploadDocument(file, userId, type);
    return { message: 'Uploaded successfully', document: result };
  }

  @Post('upload/:userId')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.STAFF, RoleType.USER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        docType: {
          type: 'string',
          enum: ['PAN', 'AADHAAR', 'GST', 'OTHER'],
        },
      },
    },
  })
  async uploadToUser(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('docType') docType: string,
    @Req() req,
  ) {
    const { uid, role } = req.user;
    if (role === RoleType.USER && uid !== userId) {
      throw new ForbiddenException('Users can only upload their own files');
    }

    const result = await this.gridFsService.uploadFile(file, {
      userId,
      uploadedBy: uid,
      mimeType: file.mimetype,
      docType,
    });

    return { message: 'Uploaded successfully', fileId: result };
  }

  @Get('filter')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.STAFF, RoleType.USER)
  @ApiQuery({ name: 'docType', required: false, enum: ['PAN', 'AADHAAR', 'GST', 'OTHER'] })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async filterDocs(@Query() query: any, @Req() req) {
    const { uid, role } = req.user;

    // Enforce access rules
    if (role === RoleType.USER && query.userId && query.userId !== uid) {
      throw new ForbiddenException('Access denied');
    }

    query.userId = query.userId || (role === RoleType.USER ? uid : null);

    return this.gridFsService.filterFiles(query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by its ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async deleteDocument(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.deleteDocument(id, req.user);
  }

  @Get('all')
  @ApiOperation({ summary: 'List all documents or filter by UID' })
  @ApiParam({ name: 'uid', required: false })
  @ApiResponse({ status: 200, description: 'List of documents' })
  async listAllDocuments(@Query('uid') uid?: string) {
    return this.documentsService.listDocuments(uid);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filter/search documents by user, type, or date' })
  @ApiResponse({ status: 200, description: 'Filtered document list' })
  async filterDocuments(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.documentsService.filterDocuments(userId, type, start, end);
  }

  @Put('update/:documentId')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Update/Replace a document file by ID' })
  @ApiParam({ name: 'documentId', required: true })
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
  async updateDocument(
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const user = req.user;
    const updatedDoc = await this.documentsService.updateDocumentFile(documentId, file, user);
    return { message: 'Document updated', document: updatedDoc };
  }

}
