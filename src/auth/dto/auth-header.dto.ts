// src/auth/dto/auth-header.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuthHeaderDto {
  @ApiPropertyOptional({
    description: 'Bearer JWT token',
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR...',
  })
  @IsString()
  @IsOptional()
  Authorization?: string;
}
