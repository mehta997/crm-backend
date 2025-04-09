// src/documents/dto/create-document.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
    @IsString()
    @IsNotEmpty()
    uid: string;

    @IsString()
    @IsNotEmpty()
    fileId: string;

    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsString()
    @IsNotEmpty()
    type: string;
}
